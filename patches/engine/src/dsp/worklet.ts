import { Deferred } from 'utils/deferred'
import { rpc } from 'utils/rpc'
import type * as WasmExports from '../../as/build/index'
import { getSnapshot, track } from '../lib/memory-registry.ts'
import { sampleManager } from '../lib/sample-manager.ts'
import { createWasmImports } from '../lib/wasm-imports.ts'
import { type AudioVm, createAudioVm, createWasmRuntime, type WasmRuntime } from '../lib/wasm-runtime.ts'
import { wasmSetup } from '../lib/wasm-setup.ts'
import { isOpcodeOneParam } from '../live/compiler/opcode.ts'
import { AUDIO_VM_INFO_STRIDE, AudioVmOp, HISTORY_META_STRIDE } from './audio-vm-bindings.ts'
import { CONTROL_OPS_CAPACITY } from './constants.ts'
import type { Dsp } from './dsp.ts'
import { HISTORY_META_SHARED_HEADER } from './history-meta-shared.ts'
import {
  createSharedProgramStateViewsFromBuffer,
  createSharedTransportViewsFromBuffer,
  DspProgramState,
  type ProgramSharedInit,
  SHARED_PROGRAM_STATE_BYTE_LENGTH,
  SharedProgramStateIndex,
  SharedTransportIndex,
  SharedTransportRunningState,
} from './worklet-shared.ts'

export type DspProcessorOptions = {
  sourcemapUrl: string
  config: typeof import('../../asconfig.json')
  /**
   * Shared resources created on the main thread. Safari only shares these when
   * passed via processorOptions — MessagePort postMessage drops/unshares SAB.
   * Keep this minimal (transport + memory only).
   */
  transportBuffer: SharedArrayBuffer
  memory: WebAssembly.Memory
}

export type ProgramRuntime = ReturnType<typeof createProgramRuntime>

const PROGRAM_SWAP_FADE_SAMPLES = 1024

type ProgramVmSlot = {
  vm: AudioVm
  localControlOpsActive: 0 | 1
  controlOpsLength: number
}

type LimiterState = {
  currentGain: number
  lastThreshold: number
  lastRelease: number
  lastSampleRate: number
  releaseCoeff: number
  thresholdLinear: number
}

type PendingSyncedControlOps =
  | {
    mode: 'set'
    ops: Float32Array
    targetBar: number
  }
  | {
    mode: 'swap'
    ops: Float32Array
    targetBar: number
    fadeSamples?: number
    resetState?: boolean
  }

function createProgramRuntime(opts: {
  vmIds: [number, number]
  vms: [AudioVm, AudioVm]
  id: number
  stateU32: Uint32Array
  stateF32: Float32Array
  bpm: number
  historyMetaBuffers?: [SharedArrayBuffer, SharedArrayBuffer]
}) {
  const stateU32 = opts.stateU32
  const stateF32 = opts.stateF32

  stateU32.fill(0)
  stateF32[SharedProgramStateIndex.Bpm] = opts.bpm
  stateU32[SharedProgramStateIndex.State] = DspProgramState.Stop
  // history pack index/epoch start at 0

  const slots: [ProgramVmSlot, ProgramVmSlot] = [
    { vm: opts.vms[0], localControlOpsActive: 0, controlOpsLength: 0 },
    { vm: opts.vms[1], localControlOpsActive: 0, controlOpsLength: 0 },
  ]

  return {
    vmIds: opts.vmIds,
    slots,
    id: opts.id,
    activeSlot: 0 as 0 | 1,
    gain: 1,
    swapFadeRemaining: 0,
    swapFadeTotal: 0,
    swapFadeFrom: 0 as 0 | 1,
    swapFadeTo: 0 as 0 | 1,
    stateU32,
    stateF32,
    historyMetaBuffers: opts.historyMetaBuffers,
    seekSampleCount: 0,
    get state(): DspProgramState {
      return (stateU32[SharedProgramStateIndex.State] ?? DspProgramState.Stop) as DspProgramState
    },
    set state(v: DspProgramState) {
      stateU32[SharedProgramStateIndex.State] = v
    },
    get sampleCount(): number {
      return Atomics.load(stateU32, SharedProgramStateIndex.SampleCount) >>> 0
    },
    set sampleCount(v: number) {
      Atomics.store(stateU32, SharedProgramStateIndex.SampleCount, v >>> 0)
    },
    set bpm(v: number) {
      stateF32[SharedProgramStateIndex.Bpm] = v
    },
    toSharedInit(): ProgramSharedInit {
      return {
        id: opts.id,
        vmIds: opts.vmIds,
        stateBuffer: stateU32.buffer as SharedArrayBuffer,
        controlOpsCapacity: opts.vms[0].controlOpsCapacity,
        ...(opts.historyMetaBuffers !== undefined && { historyMetaBuffers: opts.historyMetaBuffers }),
      }
    },
    reset(): void {
      slots[0].vm.reset()
      slots[1].vm.reset()
    },
    dispose(): void {
      slots[0].vm.dispose()
      slots[1].vm.dispose()
    },
  }
}

/**
 * Byte-exact Float32Array copy. AudioWorklet threads (esp. Safari/WebKit on ARM)
 * run with FTZ/DAZ: element-wise Float32Array.set/new Float32Array(src) flushes
 * denormal bit-patterns. Our bytecode stores opcodes as raw u32 ints in a
 * Float32Array view — those ints are denormal floats — so a float copy turns
 * every opcode into 0 and the VM mixes silence while samples still look loaded.
 */
function copyFloat32Bits(src: Float32Array, length = src.length): Float32Array {
  const len = Math.max(0, Math.min(length, src.length))
  const out = new Float32Array(len)
  if (len > 0) {
    new Uint8Array(out.buffer).set(new Uint8Array(src.buffer, src.byteOffset, len * 4))
  }
  return out
}

function writeFloat32Bits(destBuffer: ArrayBufferLike, destByteOffset: number, src: Float32Array, length: number): void {
  const len = Math.max(0, Math.min(length, src.length))
  if (len <= 0) return
  new Uint8Array(destBuffer, destByteOffset, len * 4).set(
    new Uint8Array(src.buffer, src.byteOffset, len * 4),
  )
}

function scanSetBpm(ops: Float32Array, length: number): number {
  const u32 = new Uint32Array(ops.buffer, ops.byteOffset, ops.length)
  const f32 = ops
  let pc = 0
  let bpm = 0
  while (pc < length) {
    const op = u32[pc] ?? 0
    pc++
    if (op === AudioVmOp.SetBpm) {
      bpm = f32[pc] ?? 0
      pc++
      continue
    }
    if (isOpcodeOneParam(op)) pc++
    else if (op === AudioVmOp.PushTryBlock) pc += 3
    else if (op === AudioVmOp.TableLookup) {
      const tableLen = Math.round(f32[pc] ?? 0)
      pc += 1 + Math.max(0, tableLen)
    }
    else if (op === AudioVmOp.DefineFunction) {
      const bytecodeLength = Math.round(f32[pc + 5] ?? 0)
      pc += 6 + Math.max(0, bytecodeLength)
    }
  }
  return bpm
}

function getProgramById(programsById: Map<number, ProgramRuntime>, id: number): ProgramRuntime | null {
  return programsById.get(id) ?? null
}

function clearProgramHistoryMeta(p: ProgramRuntime): void {
  if (!p.historyMetaBuffers) return
  for (const buf of p.historyMetaBuffers) {
    const sharedU32 = new Uint32Array(buf)
    Atomics.store(sharedU32, 0, 1)
    sharedU32[1] = 0
    Atomics.store(sharedU32, 0, 0)
  }
}

function setProgramsState(programsById: Map<number, ProgramRuntime>, state: DspProgramState, ids: number[]): void {
  for (const id of ids) {
    const p = getProgramById(programsById, id)
    if (!p) throw new Error('Program not found with id: ' + id)
    if (state === DspProgramState.Start) clearProgramHistoryMeta(p)
    p.state = state
    if (state !== DspProgramState.Start) {
      p.swapFadeRemaining = 0
      p.swapFadeTotal = 0
    }
  }
}

function applyTransportSeek(
  state: ProcessorState,
  newSampleCount: number,
): void {
  state.transportSeekVersion = state.transportSeekVersion + 1
  state.transportSampleCount = newSampleCount
  state.playbackSampleClock = newSampleCount
}

function applyProgramSeek(
  programsById: Map<number, ProgramRuntime>,
  sampleCount: number,
  ids: number[],
): void {
  for (const id of ids) {
    const p = getProgramById(programsById, id)
    if (!p) throw new Error('Program not found with id: ' + id)
    p.sampleCount = p.seekSampleCount = sampleCount
  }
}

function copyHistoryMetaToProgramShared(
  runtime: WasmRuntime,
  p: ProgramRuntime,
  vm: AudioVm,
  info?: Uint32Array,
): void {
  if (!p.historyMetaBuffers) return
  const view = info ?? new Uint32Array(runtime.buffer, vm.infoPtr, 10)
  const historyMetaPtr = view[5] ?? 0
  const historyCount = view[6] ?? 0
  if (historyCount <= 0 || historyMetaPtr <= 0) return
  const currentIndex = Atomics.load(p.stateU32, SharedProgramStateIndex.HistoryPackIndex) >>> 0
  const nextIndex = currentIndex ^ 1
  const sharedU32 = new Uint32Array(p.historyMetaBuffers[nextIndex])
  if (Atomics.compareExchange(sharedU32, 0, 0, 1) !== 0) return
  sharedU32[1] = historyCount
  const len = historyCount * HISTORY_META_STRIDE
  const wasmMeta = new Uint32Array(runtime.buffer, historyMetaPtr, len)
  for (let i = 0; i < len; i++) sharedU32[HISTORY_META_SHARED_HEADER + i] = wasmMeta[i]
  Atomics.store(sharedU32, 0, 0)
  Atomics.store(p.stateU32, SharedProgramStateIndex.HistoryPackIndex, nextIndex)
  Atomics.add(p.stateU32, SharedProgramStateIndex.HistoryPackEpoch, 1)
}

let lastOutLeftPtr = 0
let lastOutRightPtr = 0
let lastVmPeak = 0

function runProgram(
  runtime: WasmRuntime,
  nyquist: number,
  piOverNyquist: number,
  bpmOverrideValue: number,
  bpm: number,
  p: ProgramRuntime,
  slot: ProgramVmSlot,
  bufferLength: number,
  sampleCount: number,
  outputL: Float32Array,
  outputR: Float32Array,
  gain: number,
  copyHistory: boolean,
): void {
  const audioOpsPtr = slot.localControlOpsActive === 0 ? slot.vm.localControlOpsPtr0 : slot.vm.localControlOpsPtr1
  runtime.runAudioVmAt(
    slot.vm.id,
    audioOpsPtr,
    slot.controlOpsLength,
    bufferLength,
    sampleCount,
    sampleRate,
    nyquist,
    piOverNyquist,
    bpmOverrideValue || bpm,
  )
  const infoPtr = slot.vm.infoPtr
  const info = new Uint32Array(runtime.buffer, infoPtr, 10)
  if (copyHistory) copyHistoryMetaToProgramShared(runtime, p, slot.vm, info)
  const outputLeftPtr = info[8] ?? 0
  const outputRightPtr = info[9] ?? 0
  lastOutLeftPtr = outputLeftPtr
  lastOutRightPtr = outputRightPtr
  if (!outputLeftPtr || !outputRightPtr) {
    lastVmPeak = 0
    return
  }
  const audioL = new Float32Array(runtime.buffer, outputLeftPtr, bufferLength)
  const audioR = new Float32Array(runtime.buffer, outputRightPtr, bufferLength)
  let vmPeak = 0
  for (let i = 0; i < bufferLength; i++) {
    const a = Math.abs(audioL[i])
    const b = Math.abs(audioR[i])
    if (a > vmPeak) vmPeak = a
    if (b > vmPeak) vmPeak = b
    outputL[i] = outputL[i] + audioL[i] * gain
    outputR[i] = outputR[i] + audioR[i] * gain
  }
  lastVmPeak = vmPeak > lastVmPeak ? vmPeak : lastVmPeak * 0.95
}

export type ProcessorState = Awaited<ReturnType<typeof createProcessorState>>

export async function createProcessorState(
  binary: ArrayBuffer,
  opts: {
    sourcemapUrl: string
    config: typeof import('../../asconfig.json')
    transportBuffer: SharedArrayBuffer
    memory: WebAssembly.Memory
  },
) {
  const core = await wasmSetup<typeof WasmExports>({
    binary,
    config: opts.config,
    sourcemapUrl: opts.sourcemapUrl,
    memory: opts.memory,
    imports: ({ memory }) => createWasmImports(memory),
  })
  let memoryBuffer = core.wasm.memory.buffer
  const transportBuffer = opts.transportBuffer
  const t = createSharedTransportViewsFromBuffer(transportBuffer)
  const transportU32 = t.u32
  const transportF32 = t.f32
  const programsByVmId = new Map<number, ProgramRuntime>()
  const programsById = new Map<number, ProgramRuntime>()
  const runtime = createWasmRuntime(core)
  const sampleCountRef = { value: 0 }
  const playbackSampleClockRef = { value: 0 }
  const bpmRef = { value: 120.0 }
  const bpmOverrideValueRef = { value: 0 }
  const quantumRef = { value: 128 }
  const nyquist = sampleRate * 0.5
  const piOverNyquist = Math.PI / nyquist
  const PREVIEW_SEEK_CHUNKS = 32
  let scheduleProgramsSeek: number[] = []
  let scheduleProgramsSeekChunks = 0
  const limiterThresholdDb = 0
  const limiterReleaseSeconds = 0.1
  const limiterL: LimiterState = {
    currentGain: 1,
    lastThreshold: Infinity,
    lastRelease: Infinity,
    lastSampleRate: Infinity,
    releaseCoeff: 0,
    thresholdLinear: 1,
  }
  const limiterR: LimiterState = {
    currentGain: 1,
    lastThreshold: Infinity,
    lastRelease: Infinity,
    lastSampleRate: Infinity,
    releaseCoeff: 0,
    thresholdLinear: 1,
  }
  let hadError = false
  let wasPlaying = false
  const idsNowPlaying = new Set<number>()
  const idsWasPlaying = new Set<number>()
  let outputPeak = 0
  let lastMixControlOpsLength = 0
  let lastProgramsMixed = 0

  // let count = 0

  function applyLimiter(
    buffer: Float32Array,
    state: LimiterState,
  ): void {
    const thresholdClamped = Math.max(-80, Math.min(limiterThresholdDb, 0))
    const releaseClamped = Math.max(0.0001, Math.min(limiterReleaseSeconds, 5))
    const thresholdChanged = thresholdClamped !== state.lastThreshold
    const releaseChanged = releaseClamped !== state.lastRelease
    const sampleRateChanged = sampleRate !== state.lastSampleRate

    if (thresholdChanged) {
      const th = Math.max(-80, Math.min(thresholdClamped, 0))
      state.thresholdLinear = 10 ** (th / 20)
      state.lastThreshold = thresholdClamped
    }

    if (releaseChanged) {
      state.lastRelease = releaseClamped
    }

    if (releaseChanged || sampleRateChanged) {
      const rel = Math.max(0.0001, Math.min(releaseClamped, 5))
      state.releaseCoeff = Math.exp(-3 / (rel * sampleRate))
      state.lastSampleRate = sampleRate
    }

    let currentGain = state.currentGain
    const thresholdLinear = state.thresholdLinear
    const releaseCoeff = state.releaseCoeff
    const len = buffer.length

    for (let i = 0; i < len; i++) {
      const input = buffer[i]
      const inputLevel = Math.abs(input)
      const targetGain = inputLevel > thresholdLinear ? thresholdLinear / inputLevel : 1

      if (currentGain > targetGain) {
        currentGain = targetGain + (currentGain - targetGain) * releaseCoeff
      }
      else {
        currentGain = targetGain
      }

      currentGain = Math.max(0, Math.min(1, currentGain))

      let outSample = input * currentGain
      if (Math.abs(outSample) > thresholdLinear) {
        outSample = thresholdLinear * Math.sign(outSample || 1)
        currentGain = targetGain
      }

      buffer[i] = outSample
    }

    state.currentGain = currentGain
  }

  function getBarSamples(bpm: number): number {
    if (bpm <= 0) return 0
    return sampleRate * 60 * 4 / bpm
  }

  function getSwapFadeSamples(fadeSamples?: number): number {
    return Math.max(0, Math.round(fadeSamples ?? PROGRAM_SWAP_FADE_SAMPLES))
      || PROGRAM_SWAP_FADE_SAMPLES
  }

  function shouldApplyPendingSyncedControlOps(
    pending: PendingSyncedControlOps,
    barSamples: number,
    playbackSampleClock: number,
    quantumSamples: number,
  ): boolean {
    if (barSamples <= 0) return true
    const boundarySample = pending.targetBar * barSamples
    if (pending.mode === 'set') return playbackSampleClock >= boundarySample
    const swapStartSample = Math.max(0, boundarySample - getSwapFadeSamples(pending.fadeSamples))
    return playbackSampleClock + quantumSamples >= swapStartSample
  }

  function applyControlOps(p: ProgramRuntime, slot: 0 | 1, ops: Float32Array): void {
    const target = p.slots[slot]
    const max = target.vm.controlOpsCapacity >>> 0
    const len = Math.min(ops.length, max)
    const nextPtr = target.localControlOpsActive === 0 ? target.vm.localControlOpsPtr1 : target.vm.localControlOpsPtr0
    // Must be byte-exact: Float32Array.set flushes denormal opcode ints under FTZ.
    writeFloat32Bits(runtime.buffer, nextPtr, ops, len)
    target.controlOpsLength = len
    target.localControlOpsActive = target.localControlOpsActive === 0 ? 1 : 0
    if (!bpmOverrideValueRef.value && len > 0) {
      const nextOps = new Float32Array(runtime.buffer, nextPtr, max)
      const nextBpm = scanSetBpm(nextOps, len)
      if (nextBpm && nextBpm !== bpmRef.value) {
        bpmRef.value = nextBpm
        for (const other of programsById.values()) other.bpm = nextBpm
      }
    }
  }

  function applyControlOpsSwap(
    p: ProgramRuntime,
    opts: { ops: Float32Array; fadeSamples?: number; resetState?: boolean; transportPlaying: boolean },
  ): void {
    const from = p.activeSlot
    const to = (from ^ 1) as 0 | 1
    if (opts.resetState) {
      p.slots[to].vm.reset()
      clearProgramHistoryMeta(p)
    }
    else {
      runtime.copyAudioVmState(p.slots[from].vm.id, p.slots[to].vm.id)
    }
    applyControlOps(p, to, opts.ops)
    if (opts.transportPlaying) {
      const fadeSamples = getSwapFadeSamples(opts.fadeSamples)
      p.swapFadeFrom = from
      p.swapFadeTo = to
      p.swapFadeRemaining = fadeSamples
      p.swapFadeTotal = fadeSamples
      p.activeSlot = to
      return
    }
    p.swapFadeRemaining = 0
    p.swapFadeTotal = 0
    p.activeSlot = to
  }

  function applyPendingSyncedControlOps(
    p: ProgramRuntime,
    pending: PendingSyncedControlOps,
    transportPlaying: boolean,
  ): void {
    if (pending.mode === 'set') {
      applyControlOps(p, p.activeSlot, pending.ops)
      return
    }
    applyControlOpsSwap(p, {
      ops: pending.ops,
      fadeSamples: pending.fadeSamples,
      resetState: pending.resetState,
      transportPlaying,
    })
  }

  function processBuffer(outputs: Float32Array[][], dsp: Dsp | null): boolean {
    const bufferLength = outputs[0]?.[0]?.length ?? 0
    const outputL = outputs[0]?.[0]
    const outputR = outputs[0]?.[1] ?? outputL
    if (!outputL || !outputR || bufferLength <= 0) {
      wasPlaying = false
      return true
    }
    // AudioWorklet output buffers are not guaranteed to be zeroed.
    outputL.fill(0)
    if (outputR !== outputL) outputR.fill(0)
    quantumRef.value = bufferLength
    idsNowPlaying.clear()
    let isPlaying = false
    lastProgramsMixed = 0
    lastMixControlOpsLength = 0

    // count++
    // if (count % 375 === 0) {
    //   core.wasm.__collect()
    // }

    let scheduleRefresh = false

    const memoryGrew = memoryBuffer !== core.wasm.memory.buffer
    if (memoryGrew) {
      memoryBuffer = core.wasm.memory.buffer
      scheduleRefresh = true
    }

    const transportStopAndSeekToZero = Atomics.load(transportU32, SharedTransportIndex.StopAndSeekToZero)
    const stopAndSeekIds = state.scheduleStopAndSeekToZero
    if (transportStopAndSeekToZero !== 0) {
      Atomics.store(transportU32, SharedTransportIndex.StopAndSeekToZero, 0)
      Atomics.store(transportU32, SharedTransportIndex.Running, SharedTransportRunningState.Stop)
      Atomics.store(transportU32, SharedTransportIndex.ActuallyPlaying, SharedTransportRunningState.Stop)
      applyTransportSeek(state, 0)
      state.flushPendingSyncedControlOps(false)
      setProgramsState(programsById, DspProgramState.Stop, stopAndSeekIds)
      applyProgramSeek(programsById, 0, stopAndSeekIds)
      state.scheduleStopAndSeekToZero = []
      core.wasm.__collect()
      for (const p of programsById.values()) {
        const slot = p.slots[p.activeSlot]
        copyHistoryMetaToProgramShared(runtime, p, slot.vm)
        slot.vm.softReset()
      }
      wasPlaying = false
      return true
    }
    else if (stopAndSeekIds.length > 0) {
      setProgramsState(programsById, DspProgramState.Stop, stopAndSeekIds)
      applyProgramSeek(programsById, 0, stopAndSeekIds)
      const stopAndSeekSet = new Set(stopAndSeekIds)
      for (const p of programsById.values()) {
        if (!stopAndSeekSet.has(p.id)) continue
        const slot = p.slots[p.activeSlot]
        copyHistoryMetaToProgramShared(runtime, p, slot.vm)
        slot.vm.softReset()
      }
      state.scheduleStopAndSeekToZero = []
    }
    const seekVersion = Atomics.load(transportU32, SharedTransportIndex.SeekVersion)
    const next = Math.round(transportF32[SharedTransportIndex.SampleCount])
    if (seekVersion !== Atomics.load(transportU32, SharedTransportIndex.SeekVersion)) {
      Atomics.store(transportU32, SharedTransportIndex.SeekVersion, seekVersion)
      sampleCountRef.value = next
      playbackSampleClockRef.value = next
      for (const p of programsById.values()) p.sampleCount = next
    }
    const transportRunning = Atomics.load(transportU32, SharedTransportIndex.Running)
    const running = transportRunning === SharedTransportRunningState.Start
    if (!running && !scheduleProgramsSeekChunks) {
      state.flushPendingSyncedControlOps(false)
      Atomics.store(transportU32, SharedTransportIndex.ActuallyPlaying, transportRunning)
      transportF32[SharedTransportIndex.SampleCount] = sampleCountRef.value
      if (wasPlaying) {
        for (const p of programsById.values()) {
          const slot = p.slots[p.activeSlot]
          copyHistoryMetaToProgramShared(runtime, p, slot.vm)
        }
        // core.wasm.__collect()
      }
      wasPlaying = false
      return true
    }
    Atomics.store(transportU32, SharedTransportIndex.ActuallyPlaying, transportRunning)

    const scheduleProgramsSeekSet = scheduleProgramsSeek.length > 0 ? new Set(scheduleProgramsSeek) : null
    const advanceSampleCount = scheduleProgramsSeekChunks === 0
    const bpmOverrideValue = bpmOverrideValueRef.value
    const bpm = bpmRef.value
    const barSamples = getBarSamples(bpm)
    const {
      loopBeginSamples,
      loopEndSamples,
      projectEndSamples,
      loopBeginSamplesA,
      loopEndSamplesA,
      projectEndSamplesA,
      loopBeginSamplesB,
      loopEndSamplesB,
      projectEndSamplesB,
      programAId,
      programBId,
    } = state

    try {
      for (const p of programsById.values()) {
        if (running && state.syncChanges) {
          const pendingSynced = state.pendingSyncedControlOps.get(p.id)
          if (pendingSynced && shouldApplyPendingSyncedControlOps(
            pendingSynced,
            barSamples,
            playbackSampleClockRef.value,
            bufferLength,
          )) {
            applyPendingSyncedControlOps(p, pendingSynced, true)
            state.pendingSyncedControlOps.delete(p.id)
            scheduleRefresh = true
          }
        }
        const activeSlot = p.slots[p.activeSlot]
        if ((p.state !== DspProgramState.Start || activeSlot.controlOpsLength <= 0)
          && !scheduleProgramsSeekSet?.has(p.id))
        {
          const slot = p.slots[p.activeSlot]
          const pending = pendingProgramApplied.get(p.id)
          const pendingSlot = pendingProgramAppliedSlot.get(p.id)
          if (pending && pendingSlot === p.activeSlot) {
            copyHistoryMetaToProgramShared(runtime, p, slot.vm)
            pendingProgramApplied.delete(p.id)
            pendingProgramAppliedSlot.delete(p.id)
            pending.resolve()
          }
          continue
        }
        const baseSampleCount = advanceSampleCount ? p.sampleCount : p.seekSampleCount
        if (p.swapFadeRemaining > 0) {
          const from = p.swapFadeFrom
          const to = p.swapFadeTo
          const remaining = p.swapFadeRemaining
          const total = p.swapFadeTotal || 1
          const t = Math.min(1, Math.max(0, (total - remaining) / total))
          runProgram(
            runtime,
            nyquist,
            piOverNyquist,
            bpmOverrideValue,
            bpm,
            p,
            p.slots[from],
            bufferLength,
            baseSampleCount,
            outputL,
            outputR,
            (1 - t) * (p.gain || 0),
            false,
          )
          runProgram(
            runtime,
            nyquist,
            piOverNyquist,
            bpmOverrideValue,
            bpm,
            p,
            p.slots[to],
            bufferLength,
            baseSampleCount,
            outputL,
            outputR,
            t * (p.gain || 0),
            true,
          )
          p.swapFadeRemaining = Math.max(0, p.swapFadeRemaining - bufferLength)
        }
        else {
          runProgram(
            runtime,
            nyquist,
            piOverNyquist,
            bpmOverrideValue,
            bpm,
            p,
            p.slots[p.activeSlot],
            bufferLength,
            baseSampleCount,
            outputL,
            outputR,
            p.gain || 0,
            true,
          )
        }
        if (advanceSampleCount) {
          p.sampleCount = baseSampleCount + bufferLength

          if (loopBeginSamples >= 0 && loopEndSamples > 0) {
            if (p.sampleCount >= loopEndSamples) {
              p.sampleCount = loopBeginSamples
            }
          }
          if (projectEndSamples > 0) {
            if (p.sampleCount >= projectEndSamples) {
              p.sampleCount = 0
            }
          }

          if (p.id === programAId) {
            if (loopBeginSamplesA >= 0 && loopEndSamplesA > 0) {
              if (p.sampleCount >= loopEndSamplesA) {
                p.sampleCount = loopBeginSamplesA
              }
            }
            if (projectEndSamplesA > 0) {
              if (p.sampleCount >= projectEndSamplesA) {
                p.sampleCount = 0
              }
            }
          }
          else if (p.id === programBId) {
            if (loopBeginSamplesB >= 0 && loopEndSamplesB > 0) {
              if (p.sampleCount >= loopEndSamplesB) {
                p.sampleCount = loopBeginSamplesB
              }
            }
            if (projectEndSamplesB > 0) {
              if (p.sampleCount >= projectEndSamplesB) {
                p.sampleCount = 0
              }
            }
          }
        }
        else {
          p.seekSampleCount = baseSampleCount + bufferLength
        }
        const pending = pendingProgramApplied.get(p.id)
        const pendingSlot = pendingProgramAppliedSlot.get(p.id)
        if (pending && pendingSlot === p.activeSlot) {
          pendingProgramApplied.delete(p.id)
          pendingProgramAppliedSlot.delete(p.id)
          pending.resolve()
        }
        idsNowPlaying.add(p.id)
        isPlaying = true
        lastProgramsMixed++
        lastMixControlOpsLength = Math.max(lastMixControlOpsLength, activeSlot.controlOpsLength)
      }

      if (idsNowPlaying.size > 1) {
        applyLimiter(outputL, limiterL)
        applyLimiter(outputR, limiterR)
      }

      // Track output level for on-device diagnostics (silent-output detection).
      let peak = 0
      for (let i = 0; i < bufferLength; i++) {
        const a = Math.abs(outputL[i])
        const b = Math.abs(outputR[i])
        if (a > peak) peak = a
        if (b > peak) peak = b
      }
      outputPeak = peak > outputPeak ? peak : outputPeak * 0.95

      if (hadError) {
        hadError = false
        void dsp?.setWorkletError(null)
      }
    }
    catch (error) {
      console.error(error)
      if (error instanceof Error && !hadError) {
        hadError = true
        void dsp?.setWorkletError(error.message.split(' in ')[0])
      }
    }

    if (scheduleProgramsSeekChunks && !--scheduleProgramsSeekChunks) {
      scheduleProgramsSeek = []
      scheduleRefresh = true
    }

    let sampleCount = sampleCountRef.value + bufferLength
    if (loopBeginSamples >= 0 && loopEndSamples > 0) {
      if (sampleCount >= loopEndSamples) {
        sampleCount = loopBeginSamples
      }
    }
    if (projectEndSamples > 0) {
      if (sampleCount >= projectEndSamples) {
        sampleCount = 0
      }
    }
    sampleCountRef.value = sampleCount
    if (running) playbackSampleClockRef.value += bufferLength
    transportF32[SharedTransportIndex.SampleCount] = sampleCount

    let playingSetChanged = false
    for (const id of idsNowPlaying) {
      if (!idsWasPlaying.has(id)) {
        playingSetChanged = true
        break
      }
    }
    if (!playingSetChanged) {
      for (const id of idsWasPlaying) {
        if (!idsNowPlaying.has(id)) {
          playingSetChanged = true
          break
        }
      }
    }
    if (playingSetChanged) {
      scheduleRefresh = true
      idsWasPlaying.clear()
      for (const id of idsNowPlaying) idsWasPlaying.add(id)
    }

    if (isPlaying && !wasPlaying) {
      scheduleRefresh = true
      wasPlaying = true
    }

    if (scheduleRefresh) void dsp?.refresh()

    return true
  }

  function disposePrograms(programsByVmId: Map<number, ProgramRuntime>): void {
    const seen = new Set<ProgramRuntime>()
    for (const p of programsByVmId.values()) {
      if (seen.has(p)) continue
      seen.add(p)
      p.dispose()
    }
  }

  function dispose() {
    disposePrograms(programsByVmId)
  }

  const pendingProgramApplied = new Map<number, ReturnType<typeof Deferred<void>>>()
  const pendingProgramAppliedSlot = new Map<number, 0 | 1>()
  const pendingSyncedControlOps = new Map<number, PendingSyncedControlOps>()

  const state = {
    dispose,
    runtime,
    programsByVmId,
    programsById,
    pendingProgramApplied,
    pendingProgramAppliedSlot,
    pendingSyncedControlOps,
    nextProgramId: 0,
    nextId: 0,
    freeProgramIds: [] as number[],
    transportU32,
    transportF32,
    nyquist,
    piOverNyquist,

    programAId: -1,
    programBId: -1,

    scheduleStopAndSeekToZero: [] as number[],
    syncChanges: false,

    get transportSampleCount(): number {
      return transportF32[SharedTransportIndex.SampleCount]
    },
    set transportSampleCount(v: number) {
      transportF32[SharedTransportIndex.SampleCount] = v
    },
    get transportRunning(): number {
      return Atomics.load(transportU32, SharedTransportIndex.Running)
    },
    set transportRunning(v: number) {
      Atomics.store(transportU32, SharedTransportIndex.Running, v)
    },
    get transportSeekVersion(): number {
      return Atomics.load(transportU32, SharedTransportIndex.SeekVersion)
    },
    set transportSeekVersion(v: number) {
      Atomics.store(transportU32, SharedTransportIndex.SeekVersion, v)
    },
    get transportStopAndSeekToZero(): number {
      return Atomics.load(transportU32, SharedTransportIndex.StopAndSeekToZero)
    },
    set transportStopAndSeekToZero(v: number) {
      Atomics.store(transportU32, SharedTransportIndex.StopAndSeekToZero, v)
    },
    get transportActuallyPlaying(): number {
      return Atomics.load(transportU32, SharedTransportIndex.ActuallyPlaying)
    },
    set transportActuallyPlaying(v: number) {
      Atomics.store(transportU32, SharedTransportIndex.ActuallyPlaying, v)
    },

    get loopBeginSamples(): number {
      return Atomics.load(transportU32, SharedTransportIndex.LoopBeginSamples)
    },
    get loopEndSamples(): number {
      return Atomics.load(transportU32, SharedTransportIndex.LoopEndSamples)
    },
    get projectEndSamples(): number {
      return Atomics.load(transportU32, SharedTransportIndex.ProjectEndSamples)
    },

    get loopBeginSamplesA(): number {
      return Atomics.load(transportU32, SharedTransportIndex.LoopBeginSamplesA)
    },
    get loopEndSamplesA(): number {
      return Atomics.load(transportU32, SharedTransportIndex.LoopEndSamplesA)
    },
    get projectEndSamplesA(): number {
      return Atomics.load(transportU32, SharedTransportIndex.ProjectEndSamplesA)
    },

    get loopBeginSamplesB(): number {
      return Atomics.load(transportU32, SharedTransportIndex.LoopBeginSamplesB)
    },
    get loopEndSamplesB(): number {
      return Atomics.load(transportU32, SharedTransportIndex.LoopEndSamplesB)
    },
    get projectEndSamplesB(): number {
      return Atomics.load(transportU32, SharedTransportIndex.ProjectEndSamplesB)
    },

    get sampleCount(): number {
      return sampleCountRef.value
    },
    set sampleCount(v: number) {
      sampleCountRef.value = v
    },
    get outputPeak(): number {
      return outputPeak
    },
    get lastVmPeak(): number {
      return lastVmPeak
    },
    get lastOutLeftPtr(): number {
      return lastOutLeftPtr
    },
    get lastOutRightPtr(): number {
      return lastOutRightPtr
    },
    get programsMixed(): number {
      return lastProgramsMixed
    },
    get mixControlOpsLength(): number {
      return lastMixControlOpsLength
    },
    get samplesHandleCount(): number {
      return sampleManager.getSampleMemoryInfo().handleCount
    },
    get samplesTotalBytes(): number {
      return sampleManager.getSampleMemoryInfo().totalChannelBytes
    },
    get samplesPending(): number {
      return sampleManager.getRequiredSamples().length
    },
    get samplesReadyCount(): number {
      return Math.max(0, sampleManager.getSampleMemoryInfo().handleCount - sampleManager.getRequiredSamples().length)
    },
    get samplesDataPeak(): number {
      return sampleManager.getDataPeak()
    },
    get playbackSampleClock(): number {
      return playbackSampleClockRef.value
    },
    set playbackSampleClock(v: number) {
      playbackSampleClockRef.value = v
    },
    get bpm(): number {
      return bpmRef.value
    },
    set bpm(v: number) {
      bpmRef.value = v
    },
    get quantum(): number {
      return quantumRef.value
    },
    set quantum(v: number) {
      quantumRef.value = v
    },
    get bpmOverrideValue(): number {
      return bpmOverrideValueRef.value
    },
    set bpmOverrideValue(v: number) {
      bpmOverrideValueRef.value = v
    },
    get barSamples(): number {
      return getBarSamples(bpmRef.value)
    },
    get currentBar(): number {
      const barSamples = getBarSamples(bpmRef.value)
      return barSamples > 0 ? Math.floor(playbackSampleClockRef.value / barSamples) : 0
    },
    getProgramById(id: number): ProgramRuntime | null {
      return getProgramById(programsById, id)
    },
    applyControlOps(p: ProgramRuntime, slot: 0 | 1, ops: Float32Array): void {
      applyControlOps(p, slot, ops)
    },
    applyControlOpsSwap(p: ProgramRuntime, opts: {
      ops: Float32Array
      fadeSamples?: number
      resetState?: boolean
      transportPlaying: boolean
    }): void {
      applyControlOpsSwap(p, opts)
    },
    setProgramsState(state: DspProgramState, ids: number[]): void {
      setProgramsState(programsById, state, ids)
    },
    flushPendingSyncedControlOps(transportPlaying: boolean): void {
      if (pendingSyncedControlOps.size === 0) return
      for (const [programId, pending] of pendingSyncedControlOps) {
        const p = programsById.get(programId)
        if (!p) continue
        applyPendingSyncedControlOps(p, pending, transportPlaying)
      }
      pendingSyncedControlOps.clear()
    },
    applyTransportSeek(sampleCount: number): void {
      applyTransportSeek(state, sampleCount)
    },
    applyProgramSeek(sampleCount: number, ids: number[], preview: boolean): void {
      applyProgramSeek(programsById, sampleCount, ids)
      if (preview) {
        scheduleProgramsSeek = ids
        scheduleProgramsSeekChunks = PREVIEW_SEEK_CHUNKS
      }
    },
    processBuffer(_inputs: Float32Array[][], outputs: Float32Array[][], dsp: Dsp | null): boolean {
      return processBuffer(outputs, dsp)
    },
  }

  return state
}

export class DspProcessor extends AudioWorkletProcessor {
  private sourcemapUrl: string
  private state: ProcessorState | null = null
  private dsp: Dsp | null = null

  private config: DspProcessorOptions['config']
  private transportBuffer: SharedArrayBuffer
  private sharedMemory: WebAssembly.Memory

  constructor(options: Omit<AudioWorkletNodeOptions, 'processorOptions'> & { processorOptions: DspProcessorOptions }) {
    super()
    const po = options.processorOptions
    this.sourcemapUrl = po.sourcemapUrl
    this.config = po.config
    this.transportBuffer = po.transportBuffer
    this.sharedMemory = po.memory
    this.dsp = rpc<Dsp>(this.port, this)
  }

  async loadWasm(binary: ArrayBuffer, _opts?: { transportBuffer?: SharedArrayBuffer }): Promise<void> {
    if (this.state) {
      this.state.dispose()
      this.state = null
    }
    if (!this.transportBuffer) {
      throw new Error('AudioWorklet missing transportBuffer from processorOptions (Safari SAB share path)')
    }
    if (!this.sharedMemory) {
      throw new Error('AudioWorklet missing memory from processorOptions (Safari SAB share path)')
    }
    this.state = await createProcessorState(binary, {
      sourcemapUrl: this.sourcemapUrl,
      config: this.config,
      // Never fall back to MessagePort SAB — it is not shared on Safari.
      transportBuffer: this.transportBuffer,
      memory: this.sharedMemory,
    })
  }

  async getMemory() {
    // Return the Memory that was shared via processorOptions so the main thread
    // never relies on MessagePort SAB sharing (broken on Safari/WebKit).
    return this.sharedMemory ?? this.state?.runtime.memory
  }

  /** Handshake used by main thread to detect whether processorOptions SAB is actually shared. */
  async shareProbe(opts: { magic: number; memoryOffset: number }): Promise<{
    transportMagic: number
    memoryMagic: number
  }> {
    const transportMagic = this.transportBuffer
      ? Atomics.load(new Int32Array(this.transportBuffer), SharedTransportIndex.HistorySyncRequested)
      : -1
    let memoryMagic = -1
    try {
      const buf = this.sharedMemory.buffer
      const offset = Math.max(0, Math.min(opts.memoryOffset, buf.byteLength - 4))
      memoryMagic = Atomics.load(new Int32Array(buf, offset, 1), 0)
    }
    catch {
      memoryMagic = -2
    }
    void opts.magic
    return { transportMagic, memoryMagic }
  }

  async memoryGrow(delta: number): Promise<number> {
    return this.state ? this.state.runtime.memoryGrow(delta) : 0
  }

  async getStats(opts?: { programId?: number }): Promise<Record<string, number | boolean | object | null>> {
    const s = this.state
    if (!s) {
      return {
        memoryUsage: 0,
        hasCore: false,
        sampleCount: 0,
        bpm: 120,
        bpmOverride: 0,
        programCount: 0,
        programId: opts?.programId ?? 0,
        programState: 0,
        controlOpsLength: 0,
        programSampleCount: 0,
        vmDebug: null,
      }
    }
    const id = opts?.programId ?? 0
    const p = s.getProgramById(id)
    let vmDebug: Record<string, number> | null = null
    if (p) {
      const vm = p.slots[p.activeSlot].vm
      const infoPtr = s.runtime.getAudioVmInfoPtr(vm.id)
      const info = new Uint32Array(s.runtime.buffer, infoPtr, AUDIO_VM_INFO_STRIDE)
      vmDebug = {
        arenaAllocated: info[10] ?? 0,
        arenaReused: info[11] ?? 0,
        arenaReleased: info[12] ?? 0,
        arenaInFlight: info[13] ?? 0,
        arenaPCap: info[14] ?? 0,
        arenaPCount: info[15] ?? 0,
        arenaPTomb: info[16] ?? 0,
        arenaBucketsLen: info[17] ?? 0,
        cellsLength: info[18] ?? 0,
        globalsLength: info[19] ?? 0,
        stackTop: info[20] ?? 0,
        callStackLength: info[21] ?? 0,
        upsampleCacheSize: info[22] ?? 0,
        pendingReleaseAudioSize: info[23] ?? 0,
        genPoolSlots: info[24] ?? 0,
        genPoolsLength: info[25] ?? 0,
        bufferRegistrySize: info[26] ?? 0,
        arraysLength: info[27] ?? 0,
        arenaFreed: info[28] ?? 0,
      }
    }
    return {
      memoryUsage: s.runtime.memoryUsage() / 1024 / 1024,
      hasCore: true,
      sampleCount: s.sampleCount,
      transportSampleCount: s.transportSampleCount,
      transportRunning: s.transportRunning,
      transportActuallyPlaying: s.transportActuallyPlaying,
      outputPeak: s.outputPeak,
      lastVmPeak: s.lastVmPeak,
      lastOutLeftPtr: s.lastOutLeftPtr,
      lastOutRightPtr: s.lastOutRightPtr,
      programsMixed: s.programsMixed,
      mixControlOpsLength: s.mixControlOpsLength,
      samplesHandleCount: s.samplesHandleCount,
      samplesTotalBytes: s.samplesTotalBytes,
      samplesPending: s.samplesPending,
      samplesReadyCount: s.samplesReadyCount,
      samplesDataPeak: s.samplesDataPeak,
      bpm: s.bpm,
      bpmOverride: s.bpmOverrideValue,
      programCount: s.programsById.size,
      programId: id,
      programState: p ? p.state : 0,
      controlOpsLength: p ? p.slots[p.activeSlot].controlOpsLength : 0,
      maxControlOpsLength: Math.max(
        0,
        ...[...s.programsById.values()].map(prog => prog.slots[prog.activeSlot].controlOpsLength),
      ),
      programsStartCount: [...s.programsById.values()].filter(prog => prog.state === DspProgramState.Start).length,
      programSampleCount: p ? p.sampleCount : 0,
      vmDebug,
    }
  }

  async allocateProgramId(): Promise<number> {
    const s = this.state
    if (!s) return 0
    if (s.freeProgramIds.length > 0) return s.freeProgramIds.pop()!
    return s.nextProgramId++
  }

  async initProgramSlot(opts: {
    historyMetaBuffers?: [SharedArrayBuffer, SharedArrayBuffer]
    stateBuffer?: SharedArrayBuffer
  }): Promise<ProgramSharedInit | null> {
    const s = this.state
    if (!s) return null
    const vmId0 = await this.allocateProgramId()
    const vmId1 = await this.allocateProgramId()

    // Always create program SABs on the worklet. Returning them over MessagePort
    // won't share on Safari, but the worklet owns playback state via RPC anyway.
    // Wasm Memory (shared via processorOptions) carries control ops / audio data.
    const stateBuffer = opts.stateBuffer ?? (() => {
      track(`sab-state-${vmId0}`, 'SharedArrayBuffer', SHARED_PROGRAM_STATE_BYTE_LENGTH, {
        source: 'worklet:initProgramSlot',
      })
      return new SharedArrayBuffer(SHARED_PROGRAM_STATE_BYTE_LENGTH)
    })()
    const sharedState = createSharedProgramStateViewsFromBuffer(stateBuffer)

    const controlOpsCapacity = CONTROL_OPS_CAPACITY
    const id = s.nextId++
    const historyMetaBuffers = opts.historyMetaBuffers

    const vm0 = createAudioVm(s.runtime, vmId0, controlOpsCapacity)
    const vm1 = createAudioVm(s.runtime, vmId1, controlOpsCapacity)

    const runtime = createProgramRuntime({
      vmIds: [vmId0, vmId1],
      vms: [vm0, vm1],
      id,
      stateU32: sharedState.u32,
      stateF32: sharedState.f32,
      bpm: s.bpm,
      historyMetaBuffers,
    })

    s.programsByVmId.set(vm0.id, runtime)
    s.programsByVmId.set(vm1.id, runtime)
    s.programsById.set(runtime.id, runtime)

    return runtime.toSharedInit()
  }

  async disposeProgram(opts: { programId: number }): Promise<void> {
    const s = this.state
    if (!s) throw new Error('No state')

    const p = s.getProgramById(opts.programId)
    if (!p) throw new Error('Program not found with id: ' + opts.programId)

    p.reset()
    s.programsByVmId.delete(p.slots[0].vm.id)
    s.programsByVmId.delete(p.slots[1].vm.id)
    s.programsById.delete(p.id)
    s.pendingProgramApplied.delete(p.id)
    s.pendingProgramAppliedSlot.delete(p.id)
    s.pendingSyncedControlOps.delete(p.id)
    p.dispose()
    s.freeProgramIds.push(p.slots[0].vm.id)
    s.freeProgramIds.push(p.slots[1].vm.id)
  }

  async setProgramSync(_opts: { programId: number; enabled: boolean; bars: number }): Promise<void> {}

  async setSyncChanges(opts: { enabled: boolean }): Promise<void> {
    const s = this.state
    if (!s) return
    s.syncChanges = !!opts.enabled
    if (!s.syncChanges) {
      const transportPlaying = s.transportRunning === SharedTransportRunningState.Start
      s.flushPendingSyncedControlOps(transportPlaying)
    }
  }

  async getProgramShared(opts: { programId: number }) {
    const s = this.state
    if (!s) throw new Error('No state')

    const p = s.getProgramById(opts.programId)
    if (!p) throw new Error('Program not found with id: ' + opts.programId)

    return p.toSharedInit()
  }

  async setControlOps(opts: {
    programId: number
    ops: Float32Array
  }): Promise<void> {
    const s = this.state
    if (!s) throw new Error('No state')

    const p = s.getProgramById(opts.programId)
    if (!p) throw new Error('Program not found with id: ' + opts.programId)

    const transportPlaying = s.transportRunning === SharedTransportRunningState.Start
    if (s.syncChanges && p.state === DspProgramState.Start && transportPlaying) {
      s.pendingSyncedControlOps.set(p.id, {
        mode: 'set',
        ops: copyFloat32Bits(opts.ops),
        targetBar: s.currentBar + 1,
      })
      return
    }
    s.applyControlOps(p, p.activeSlot, opts.ops)
    if (p.state !== DspProgramState.Start || !transportPlaying) {
      return
    }
    const deferred = Deferred<void>()
    s.pendingProgramApplied.set(p.id, deferred)
    s.pendingProgramAppliedSlot.set(p.id, p.activeSlot)
    return deferred.promise
  }

  async setControlOpsSwap(opts: {
    programId: number
    ops: Float32Array
    fadeSamples?: number
    resetState?: boolean
  }): Promise<void> {
    const s = this.state
    if (!s) throw new Error('No state')

    const p = s.getProgramById(opts.programId)
    if (!p) throw new Error('Program not found with id: ' + opts.programId)

    const transportPlaying = s.transportRunning === SharedTransportRunningState.Start
    if (s.syncChanges && p.state === DspProgramState.Start && transportPlaying) {
      s.pendingSyncedControlOps.set(p.id, {
        mode: 'swap',
        ops: copyFloat32Bits(opts.ops),
        targetBar: s.currentBar + 1,
        fadeSamples: opts.fadeSamples,
        resetState: opts.resetState,
      })
      return
    }
    s.applyControlOpsSwap(p, {
      ops: opts.ops,
      fadeSamples: opts.fadeSamples,
      resetState: opts.resetState,
      transportPlaying: p.state === DspProgramState.Start && transportPlaying,
    })

    if (p.state !== DspProgramState.Start || !transportPlaying) {
      return
    }
    const deferred = Deferred<void>()
    s.pendingProgramApplied.set(p.id, deferred)
    s.pendingProgramAppliedSlot.set(p.id, p.activeSlot)
    return deferred.promise
  }

  async getVmInfoPtr(
    opts: { programId: number },
  ): Promise<{ vmId: number; infoPtr: number }> {
    const s = this.state
    if (!s) throw new Error('No state')

    const p = s.getProgramById(opts.programId)
    if (!p) throw new Error('Program not found with id: ' + opts.programId)

    const vm = p.slots[p.activeSlot].vm
    return {
      vmId: vm.id,
      infoPtr: vm.infoPtr,
    }
  }

  async getMemoryInfo() {
    return {
      snapshot: getSnapshot(),
      samples: sampleManager.getSampleMemoryInfo(),
    }
  }

  async getRequiredSamples(): Promise<
    { handle: number; freesoundId?: number; recordSeconds?: number; recordCallbackId?: number }[]
  > {
    const required: { handle: number; freesoundId?: number; recordSeconds?: number; recordCallbackId?: number }[] = []
    for (const handle of sampleManager.getRequiredSamples()) {
      const req = sampleManager.getRecordRequest(handle)
      required.push({
        handle,
        freesoundId: sampleManager.getFreesoundId(handle),
        recordSeconds: req?.seconds,
        recordCallbackId: req?.callbackId,
      })
    }
    return required
  }

  async setSampleData(opts: { handle: number; channels: SharedArrayBuffer[]; sampleRate: number }): Promise<void> {
    // Copy out of any SAB immediately — Safari MessagePort does not share SABs with
    // AudioWorklet, and a non-shared view can look empty or become invalid.
    const channels = opts.channels.map(sab => new Float32Array(new Float32Array(sab)))
    sampleManager.setSampleData(opts.handle, channels, opts.sampleRate)
  }

  async setSampleError(opts: { handle: number; error: string }): Promise<void> {
    sampleManager.setSampleError(opts.handle, opts.error)
  }

  async connectRecord(port: MessagePort): Promise<void> {
    rpc(port, this)
    port.start()
  }

  async setSampleDataDirect(opts: { handle: number; channels: Float32Array[]; sampleRate: number }): Promise<void> {
    // Ensure registration exists — setSampleData is a no-op on missing handles.
    sampleManager.ensureInlineHandle(opts.handle)
    // Always take an owned copy so RPC structured-clone quirks cannot alias odd buffers.
    // Audio sample data is normal-magnitude floats; Float32 copy is safe under FTZ.
    const channels = opts.channels.map(ch => new Float32Array(ch))
    sampleManager.setSampleData(opts.handle, channels, opts.sampleRate)
  }

  async setSampleErrorDirect(opts: { handle: number; error: string }): Promise<void> {
    sampleManager.setSampleError(opts.handle, opts.error)
  }

  async syncSampleRegistrations(opts: {
    registrations: Array<{
      handle: number
      type: 'freesound' | 'record' | 'inline' | 'espeak'
      freesoundId?: number
      recordSeconds?: number
      recordCallbackId?: number
      recordProjectId?: string | null
    }>
    invalidatedHandles?: number[]
  }): Promise<void> {
    if (opts.invalidatedHandles) {
      for (const handle of opts.invalidatedHandles) sampleManager.clearHandle(handle)
    }
    for (const reg of opts.registrations) {
      if (reg.type === 'freesound' && reg.freesoundId !== undefined) {
        sampleManager.ensureFreesoundHandle(reg.handle, reg.freesoundId)
      }
      else if (reg.type === 'record' && reg.recordSeconds !== undefined && reg.recordCallbackId !== undefined) {
        sampleManager.ensureRecordHandle(reg.handle, reg.recordSeconds, reg.recordCallbackId,
          reg.recordProjectId ?? null)
      }
      else if (reg.type === 'inline' || reg.type === 'espeak') {
        sampleManager.ensureInlineHandle(reg.handle)
      }
    }
  }

  async bpmOverride(opts: { bpm: number }): Promise<void> {
    const s = this.state
    if (!s) return
    s.bpmOverrideValue = Number(opts.bpm) || 0
    s.runtime.setBpmOverride(s.bpmOverrideValue)
    if (s.bpmOverrideValue) s.bpm = s.bpmOverrideValue
  }

  getInits() {
    const s = this.state
    if (!s) throw new Error('No state')
    const inits: ProgramSharedInit[] = []
    for (const p of s.programsById.values()) inits.push(p.toSharedInit())
    return inits
  }

  async start(programIds: number[]) {
    const s = this.state
    if (!s) throw new Error('No state')
    s.setProgramsState(DspProgramState.Start, programIds)
    s.transportRunning = SharedTransportRunningState.Start
    return this.getInits()
  }

  async startSync(programIds: number[]) {
    const s = this.state
    if (!s) throw new Error('No state')
    const sampleCount = [...s.programsById.values()].find(p => p.state === DspProgramState.Start)?.sampleCount
    if (sampleCount != null) {
      const co = sampleRate * 60 * 4 / s.bpm
      const currentMusicalPosition = sampleCount / co
      const currentBar = Math.floor(currentMusicalPosition)
      const offset = currentMusicalPosition - currentBar
      for (const program of [...s.programsById.values()].filter(p => programIds.includes(p.id))) {
        const programMusicalPosition = program.sampleCount / co
        const programBar = Math.floor(programMusicalPosition)
        program.sampleCount = (programBar + offset) * co
      }
    }
    s.setProgramsState(DspProgramState.Start, programIds)
    s.transportRunning = SharedTransportRunningState.Start
    return this.getInits()
  }

  async stop(programIds: number[]) {
    const s = this.state
    if (!s) throw new Error('No state')
    s.scheduleStopAndSeekToZero = programIds
    if (![...s.programsById.values()].filter(p => !programIds.includes(p.id)).some(p =>
      p.state === DspProgramState.Start
    )) {
      s.transportStopAndSeekToZero = 1
      s.transportRunning = SharedTransportRunningState.Stop
    }
    return this.getInits()
  }

  async pause(programIds: number[]) {
    const s = this.state
    if (!s) throw new Error('No state')
    s.setProgramsState(DspProgramState.Pause, programIds)
    if ([...s.programsById.values()].filter(p => p.state === DspProgramState.Start).every(p =>
      programIds.includes(p.id)
    )) {
      s.transportRunning = SharedTransportRunningState.Pause
    }
    return this.getInits()
  }

  async seek(opts: {
    sampleCount: number
    programIds: number[]
    preview: boolean
  }) {
    const s = this.state
    if (!s) throw new Error('No state')
    s.applyTransportSeek(opts.sampleCount)
    s.applyProgramSeek(opts.sampleCount, opts.programIds, opts.preview)
    return this.getInits()
  }

  async seekPrograms(opts: {
    sampleCount: number
    programIds: number[]
    preview: boolean
  }) {
    const s = this.state
    if (!s) throw new Error('No state')
    s.applyProgramSeek(opts.sampleCount, opts.programIds, opts.preview)
    return this.getInits()
  }

  async setProgramGain(opts: { programId: number; gain: number }): Promise<void> {
    const s = this.state
    if (!s) throw new Error('No state')
    const p = s.getProgramById(opts.programId)
    if (!p) throw new Error('Program not found with id: ' + opts.programId)
    p.gain = Number(opts.gain) || 0
  }

  async swapPrograms(programIds1: number[], programIds2: number[]): Promise<ProgramSharedInit[]> {
    const s = this.state
    if (!s) throw new Error('No state')
    s.setProgramsState(DspProgramState.Stop, programIds1)
    s.setProgramsState(DspProgramState.Start, programIds2)
    return this.getInits()
  }

  async setProgramA(programId: number) {
    const s = this.state
    if (!s) throw new Error('No state')
    s.programAId = programId
  }

  async setProgramB(programId: number) {
    const s = this.state
    if (!s) throw new Error('No state')
    s.programBId = programId
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const s = this.state
    if (!s) return true
    return s.processBuffer(_inputs, outputs, this.dsp ?? null)
  }
}

registerProcessor('dsp', DspProcessor)
