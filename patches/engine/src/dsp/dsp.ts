import { atomic } from '../lib/atomic.ts'
import { sampleManager } from '../lib/sample-manager.ts'
import { createDspCore } from './dsp-core.ts'
import { createDspLatency } from './dsp-latency.ts'
import { createDspProgram, type DspProgram } from './dsp-program.ts'
import type { DspState } from './dsp-state.ts'
import { bindProgramShared } from './helpers.ts'
import {
  createSharedTransportViewsFromBuffer,
  DspProgramState,
  type ProgramSharedInit,
  SharedTransportIndex,
  SharedTransportRunningState,
} from './worklet-shared.ts'

export type Dsp = Awaited<ReturnType<typeof createDsp>>

export async function createDsp(state: DspState) {
  const programs: Set<DspProgram> = new Set()

  const transportBuffer = state.transportBuffer
  const t = createSharedTransportViewsFromBuffer(transportBuffer)
  const transport = { transportU32: t.u32, transportF32: t.f32 }

  const latency = createDspLatency({
    audioContext: state.audioContext,
    getIsPlaying: () => Atomics.load(transport.transportU32, SharedTransportIndex.ActuallyPlaying) !== 0,
    getRawSampleCount: () => transport.transportF32[SharedTransportIndex.SampleCount],
  })

  const core = await createDspCore(
    state.wasmBinary,
    state.processor,
    transportBuffer,
    state.memory!,
  )
  state.memory = core.memory

  const control = atomic(
    async function<T>(this: void, fn: () => Promise<T>): Promise<T> {
      return await fn()
    },
  )

  function start(programs: DspProgram[]) {
    return control(async () => {
      await state.audioContext.resume()
      const inits = await core.worklet.start(programs.map(p => p.id))
      await rebindAllPrograms(inits)
    })
  }

  function startSync(programs: DspProgram[]) {
    return control(async () => {
      const inits = await core.worklet.startSync(programs.map(p => p.id))
      await rebindAllPrograms(inits)
    })
  }

  function pause(programs: DspProgram[]) {
    return control(async () => {
      const inits = await core.worklet.pause(programs.map(p => p.id))
      await rebindAllPrograms(inits)
    })
  }

  function stop(programs: DspProgram[]) {
    return control(async () => {
      const inits = await core.worklet.stop(programs.map(p => p.id))
      await rebindAllPrograms(inits)
    })
  }

  function seek(sampleCount: number, programs: DspProgram[], preview: boolean) {
    return control(async () => {
      const inits = await core.worklet.seek({ sampleCount, programIds: programs.map(p => p.id), preview })
      await rebindAllPrograms(inits)
    })
  }

  function seekPrograms(sampleCount: number, programs: DspProgram[], preview: boolean) {
    return control(async () => {
      const inits = await core.worklet.seekPrograms({ sampleCount, programIds: programs.map(p => p.id), preview })
      await rebindAllPrograms(inits)
    })
  }

  function swapPrograms(program1: DspProgram, program2: DspProgram) {
    return control(async () => {
      const inits = await core.worklet.swapPrograms([program1.id], [program2.id])
      await rebindAllPrograms(inits)
    })
  }

  function setProgramGain(program: DspProgram, gain: number) {
    return control(async () => {
      await core.worklet.setProgramGain({ programId: program.id, gain })
    })
  }

  function setProgramA(program: DspProgram) {
    return control(async () => {
      await core.worklet.setProgramA(program.id)
    })
  }

  function setProgramB(program: DspProgram) {
    return control(async () => {
      await core.worklet.setProgramB(program.id)
    })
  }

  function bpmOverride(bpm: number) {
    return control(async () => {
      await core.worklet.bpmOverride({ bpm })
    })
  }

  function setSyncChanges(enabled: boolean) {
    return control(async () => {
      await core.worklet.setSyncChanges({ enabled })
    })
  }

  function createProgram(): Promise<DspProgram> {
    return control(async () => {
      const allocated = state.allocProgramSharedBuffers()
      const init = await core.worklet.initProgramSlot({
        // Pass indices only — Safari MessagePort does not share SABs.
        stateIndex: allocated.stateIndex,
        historyMetaIndices: allocated.historyMetaIndices,
      })
      if (!init) throw new Error('Failed to init program shared buffers')
      if (!state.buffer) throw new Error('No buffer')
      // Reattach main-thread pool buffers (same SAB instances passed via processorOptions).
      const shared = bindProgramShared(state.buffer, {
        ...init,
        stateBuffer: allocated.stateBuffer,
        historyMetaBuffers: allocated.historyMetaBuffers,
      })
      const program: DspProgram = createDspProgram(state, shared, core.worklet, core.record)
      programs.add(program)
      return program
    })
  }

  function playProgram(program: DspProgram) {
    program._setState(DspProgramState.Start)
  }

  function stopProgram(program: DspProgram) {
    program._setState(DspProgramState.Stop)
  }

  function rebindProgramsSync(inits: ProgramSharedInit[]) {
    for (const program of programs) {
      const init = inits.find(i => i.id === program.id)
      if (init && state.buffer) {
        program.shared = bindProgramShared(state.buffer, init, program._getHistoryMetaU32())
      }
    }
  }

  async function rebindAllPrograms(inits?: ProgramSharedInit[]) {
    if (inits?.length) rebindProgramsSync(inits)
    else for (const program of programs) await program.rebind()
  }

  async function refreshHistories() {
    for (const program of programs) await program.refreshHistories()
  }

  const refresh = atomic(
    async function(this: void, inits?: ProgramSharedInit[]) {
      if (inits?.length) await rebindAllPrograms(inits)
      await refreshHistories()
      state.onHistoriesRefreshed?.()
    },
    { dropInbetween: true },
  )

  function setWorkletError(error: string | null) {
    state.workletError = error
  }

  async function waitForHistoryMeta(program: DspProgram, opts?: { maxTries?: number }): Promise<boolean> {
    const meta = program.shared.historyMetaU32
    if (!(meta.buffer instanceof SharedArrayBuffer)) return false
    const maxTries = opts?.maxTries ?? 120
    for (let i = 0; i < maxTries; i++) {
      const lock = Atomics.load(meta, 0)
      if (lock === 0) {
        const count = meta[1] ?? 0
        if (count > 0) return true
      }
      await new Promise(r => (i % 2 === 0 ? requestAnimationFrame(r) : setTimeout(r, 0)))
    }
    return false
  }

  async function refreshUntilHistories(program: DspProgram, opts?: { maxTries?: number }): Promise<boolean> {
    if (!(await waitForHistoryMeta(program, opts))) return false
    const maxTries = opts?.maxTries ?? 120
    for (let i = 0; i < maxTries; i++) {
      if (program.histories.length > 0 || program.historyViews.length > 0) return true
      await new Promise(r => (i % 2 === 0 ? requestAnimationFrame(r) : setTimeout(r, 0)))
    }
    return program.histories.length > 0 || program.historyViews.length > 0
  }

  const dsp = {
    state,
    core,
    transport,
    latency,
    sampleManager,

    start,
    startSync,
    pause,
    stop,
    seek,
    seekPrograms,
    setProgramGain,
    bpmOverride,
    setSyncChanges,

    createProgram,
    playProgram,
    stopProgram,
    swapPrograms,

    rebindAllPrograms,
    refreshHistories,
    refresh,
    refreshUntilHistories,

    setWorkletError,

    setProgramA,
    setProgramB,

    get isPlaying() {
      return Atomics.load(transport.transportU32, SharedTransportIndex.Running) === SharedTransportRunningState.Start
    },
    get isPaused() {
      return Atomics.load(transport.transportU32, SharedTransportIndex.Running) === SharedTransportRunningState.Pause
    },
    get isStopped() {
      return Atomics.load(transport.transportU32, SharedTransportIndex.Running) === SharedTransportRunningState.Stop
    },

    get isActuallyPlaying() {
      return Atomics.load(transport.transportU32, SharedTransportIndex.ActuallyPlaying)
        === SharedTransportRunningState.Start
    },
    get isActuallyPaused() {
      return Atomics.load(transport.transportU32, SharedTransportIndex.ActuallyPlaying)
        === SharedTransportRunningState.Pause
    },
    get isActuallyStopped() {
      return Atomics.load(transport.transportU32, SharedTransportIndex.ActuallyPlaying)
        === SharedTransportRunningState.Stop
    },

    get loopBeginSamples(): number {
      return Atomics.load(transport.transportU32, SharedTransportIndex.LoopBeginSamples)
    },
    set loopBeginSamples(v: number) {
      Atomics.store(transport.transportU32, SharedTransportIndex.LoopBeginSamples, v)
    },
    get loopEndSamples(): number {
      return Atomics.load(transport.transportU32, SharedTransportIndex.LoopEndSamples)
    },
    set loopEndSamples(v: number) {
      Atomics.store(transport.transportU32, SharedTransportIndex.LoopEndSamples, v)
    },
    set projectEndSamples(v: number) {
      Atomics.store(transport.transportU32, SharedTransportIndex.ProjectEndSamples, v)
    },

    get loopBeginSamplesA(): number {
      return Atomics.load(transport.transportU32, SharedTransportIndex.LoopBeginSamplesA)
    },
    set loopBeginSamplesA(v: number) {
      Atomics.store(transport.transportU32, SharedTransportIndex.LoopBeginSamplesA, v)
    },
    get loopEndSamplesA(): number {
      return Atomics.load(transport.transportU32, SharedTransportIndex.LoopEndSamplesA)
    },
    set loopEndSamplesA(v: number) {
      Atomics.store(transport.transportU32, SharedTransportIndex.LoopEndSamplesA, v)
    },
    set projectEndSamplesA(v: number) {
      Atomics.store(transport.transportU32, SharedTransportIndex.ProjectEndSamplesA, v)
    },

    get loopBeginSamplesB(): number {
      return Atomics.load(transport.transportU32, SharedTransportIndex.LoopBeginSamplesB)
    },
    set loopBeginSamplesB(v: number) {
      Atomics.store(transport.transportU32, SharedTransportIndex.LoopBeginSamplesB, v)
    },
    get loopEndSamplesB(): number {
      return Atomics.load(transport.transportU32, SharedTransportIndex.LoopEndSamplesB)
    },
    set loopEndSamplesB(v: number) {
      Atomics.store(transport.transportU32, SharedTransportIndex.LoopEndSamplesB, v)
    },
    set projectEndSamplesB(v: number) {
      Atomics.store(transport.transportU32, SharedTransportIndex.ProjectEndSamplesB, v)
    },

    togglePause(programs: DspProgram[]) {
      if (this.isPlaying) return this.pause(programs)
      else return this.start(programs)
    },
  }

  Object.assign(core.workletRpcApi, dsp)

  return dsp
}
