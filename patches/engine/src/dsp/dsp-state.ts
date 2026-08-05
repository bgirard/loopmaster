import { isMobile } from 'utils/is-mobile'
import asconfigMobile from '../../asconfig-mobile.json'
import asconfig from '../../asconfig.json'
import { SHARED_TRANSPORT_BYTE_LENGTH } from './worklet-shared.ts'
import workletUrl from './worklet.ts?worker&url'

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

/**
 * Shared resources created on the main thread and passed ONLY via AudioWorklet
 * processorOptions. Keep this set minimal — Safari has failed to share when we
 * stuffed large SAB pools into processorOptions.
 */
export function createDspSharedResources(config: typeof asconfig) {
  const transportBuffer = new SharedArrayBuffer(SHARED_TRANSPORT_BYTE_LENGTH)
  const memory = new WebAssembly.Memory({
    initial: config.options.initialMemory,
    maximum: config.options.maximumMemory,
    shared: config.options.sharedMemory,
  })
  return { transportBuffer, memory }
}

export type DspState = Awaited<ReturnType<typeof createDspState>>

export async function createDspState(opts: DspOptions) {
  const { sourcemap, config } = getWasmPaths()
  const audioContext = new AudioContext({ latencyHint: opts.latencyHint ?? 0.01 })
  const moduleUrl = new URL(workletUrl, window.location.origin).toString()
  await audioContext.audioWorklet.addModule(moduleUrl)

  const shared = createDspSharedResources(config)

  const processor = new AudioWorkletNode(audioContext, 'dsp', {
    outputChannelCount: [2],
    // Only transport + memory. Do not add SAB pools here — iOS Safari stopped
    // sharing when processorOptions carried ~192 buffers.
    processorOptions: {
      sourcemapUrl: sourcemap,
      config,
      transportBuffer: shared.transportBuffer,
      memory: shared.memory,
    },
  })
  processor.connect(audioContext.destination)

  const wasmBinary = await createWasmBinary()

  const state = {
    audioContext,
    processor,
    transportBuffer: shared.transportBuffer,

    wasmBinary,

    onHistoriesRefreshed: undefined as (() => void) | undefined,

    memory: shared.memory as WebAssembly.Memory | null,
    get buffer() {
      return this.memory?.buffer
    },

    workletError: null as string | null,

    programRecordGeneration: new Map<number, number>(),
    fetchingSamples: new Set<number>(),

    /** True when main/worklet transport SAB is confirmed not shared (Safari). */
    transportMirrorMode: false,

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
