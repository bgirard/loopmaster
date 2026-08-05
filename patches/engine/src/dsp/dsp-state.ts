import { isMobile } from 'utils/is-mobile'
import asconfigMobile from '../../asconfig-mobile.json'
import asconfig from '../../asconfig.json'
import { createHistoryMetaSharedBuffer, HISTORY_META_SHARED_BYTE_LENGTH } from './history-meta-shared.ts'
import {
  SHARED_PROGRAM_STATE_BYTE_LENGTH,
  SHARED_TRANSPORT_BYTE_LENGTH,
} from './worklet-shared.ts'
import workletUrl from './worklet.ts?worker&url'

/** Enough double-buffered program slots for DAW + DJ + wall-of-sounds + inline previews. */
export const DSP_PROGRAM_STATE_POOL_SIZE = 64
export const DSP_HISTORY_META_POOL_SIZE = DSP_PROGRAM_STATE_POOL_SIZE * 2

function getWasmPaths() {
  const base = isMobile() ? '/as/build/index-mobile.wasm' : '/as/build/index.wasm'
  return {
    wasm: new URL(base, location.origin).toString(),
    sourcemap: new URL(base + '.map', location.origin).toString(),
    config: (isMobile() ? asconfigMobile : asconfig) as typeof asconfig,
  }
}

async function fetchWasmBinary(): Promise<ArrayBuffer> {
  const { wasm } = getWasmPaths()
  const response = await fetch(wasm + '?t=' + Date.now())
  if (!response.ok) throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`)
  return await response.arrayBuffer()
}

export type WasmBinary = Awaited<ReturnType<typeof createWasmBinary>>

export async function createWasmBinary() {
  const { sourcemap, config } = getWasmPaths()
  const binary = await fetchWasmBinary()
  return {
    sourcemapUrl: sourcemap,
    binary,
    config,
  }
}

export type DspOptions = {
  latencyHint?: AudioContextLatencyCategory | number
}

export type DspSharedPools = {
  transportBuffer: SharedArrayBuffer
  memory: WebAssembly.Memory
  programStatePool: SharedArrayBuffer[]
  historyMetaPool: SharedArrayBuffer[]
}

/**
 * Allocate SharedArrayBuffers / shared Wasm memory on the main thread.
 * These MUST be passed to AudioWorkletNode via processorOptions — Safari does not
 * share SAB/Memory posted later over the worklet MessagePort.
 */
export function createDspSharedPools(config: typeof asconfig): DspSharedPools {
  const transportBuffer = new SharedArrayBuffer(SHARED_TRANSPORT_BYTE_LENGTH)
  const memory = new WebAssembly.Memory({
    initial: config.options.initialMemory,
    maximum: config.options.maximumMemory,
    shared: config.options.sharedMemory,
  })
  const programStatePool = Array.from(
    { length: DSP_PROGRAM_STATE_POOL_SIZE },
    () => new SharedArrayBuffer(SHARED_PROGRAM_STATE_BYTE_LENGTH),
  )
  const historyMetaPool = Array.from(
    { length: DSP_HISTORY_META_POOL_SIZE },
    () => {
      // Keep length in sync with createHistoryMetaSharedBuffer without double-tracking.
      void HISTORY_META_SHARED_BYTE_LENGTH
      return createHistoryMetaSharedBuffer()
    },
  )
  return { transportBuffer, memory, programStatePool, historyMetaPool }
}

export type DspState = Awaited<ReturnType<typeof createDspState>>

export async function createDspState(opts: DspOptions) {
  const { sourcemap, config } = getWasmPaths()
  const audioContext = new AudioContext({ latencyHint: opts.latencyHint ?? 0.01 })
  const moduleUrl = new URL(workletUrl, window.location.origin).toString()
  await audioContext.audioWorklet.addModule(moduleUrl)

  const pools = createDspSharedPools(config)

  const processor = new AudioWorkletNode(audioContext, 'dsp', {
    outputChannelCount: [2],
    processorOptions: {
      sourcemapUrl: sourcemap,
      config,
      transportBuffer: pools.transportBuffer,
      memory: pools.memory,
      programStatePool: pools.programStatePool,
      historyMetaPool: pools.historyMetaPool,
    },
  })
  processor.connect(audioContext.destination)

  const wasmBinary = await createWasmBinary()

  const state = {
    audioContext,
    processor,
    transportBuffer: pools.transportBuffer,
    programStatePool: pools.programStatePool,
    historyMetaPool: pools.historyMetaPool,
    nextProgramStateIndex: 0,
    nextHistoryMetaIndex: 0,

    wasmBinary,

    onHistoriesRefreshed: undefined as (() => void) | undefined,

    memory: pools.memory as WebAssembly.Memory | null,
    get buffer() {
      return this.memory?.buffer
    },

    workletError: null as string | null,

    programRecordGeneration: new Map<number, number>(),
    fetchingSamples: new Set<number>(),

    allocProgramSharedBuffers() {
      if (this.nextProgramStateIndex >= this.programStatePool.length) {
        throw new Error('DSP program state pool exhausted')
      }
      if (this.nextHistoryMetaIndex + 1 >= this.historyMetaPool.length) {
        throw new Error('DSP history meta pool exhausted')
      }
      const stateIndex = this.nextProgramStateIndex++
      const historyMetaIndices: [number, number] = [
        this.nextHistoryMetaIndex++,
        this.nextHistoryMetaIndex++,
      ]
      return {
        stateIndex,
        historyMetaIndices,
        stateBuffer: this.programStatePool[stateIndex]!,
        historyMetaBuffers: [
          this.historyMetaPool[historyMetaIndices[0]]!,
          this.historyMetaPool[historyMetaIndices[1]]!,
        ] as [SharedArrayBuffer, SharedArrayBuffer],
      }
    },

    getProgramRecordGeneration(programId: number): number {
      return this.programRecordGeneration.get(programId) ?? 0
    },
    invalidateRecordings(programId: number) {
      this.programRecordGeneration.set(programId, (this.programRecordGeneration.get(programId) ?? 0) + 1)
    },
    isProgramSharedStale(controlOpsBuffer: ArrayBufferLike) {
      return controlOpsBuffer !== this.buffer
    },
  }
  return state
}
