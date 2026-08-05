import { rpc } from 'utils/rpc'
import type * as WasmExports from '../../as/build/index'
import { createWasmImports } from '../lib/wasm-imports.ts'
import { createWasmRuntime } from '../lib/wasm-runtime.ts'
import { wasmSetup } from '../lib/wasm-setup.ts'
import { createDspPreview } from './dsp-preview.ts'
import { createRecordWorker } from './dsp-record-worker.ts'
import type { WasmBinary } from './dsp-state.ts'
import type { DspProcessor as DspWorklet } from './worklet.ts'

export type DspCore = Awaited<ReturnType<typeof createDspCore>>

export async function createDspCore(
  wasmBinary: WasmBinary,
  processor: AudioWorkletNode,
  transportBuffer: SharedArrayBuffer,
  /** Main-thread Memory already shared with the worklet via processorOptions. */
  sharedMemory: WebAssembly.Memory,
) {
  // Preview runs on the main thread with its own (non-realtime) Wasm instance.
  const previewCore = await wasmSetup<typeof WasmExports>({
    ...wasmBinary,
    config: wasmBinary.config,
    imports: ({ memory }) => createWasmImports(memory),
  })
  const previewRuntime = createWasmRuntime(previewCore)
  const preview = createDspPreview(previewRuntime)

  const workletRpcApi = {}
  const worklet = rpc<DspWorklet>(processor.port, workletRpcApi)
  await worklet.loadWasm(wasmBinary.binary, { transportBuffer })

  // Do NOT round-trip Memory through MessagePort — Safari will not share it.
  const memory = sharedMemory

  const record = await createRecordWorker(wasmBinary, worklet)

  return {
    memory,
    worklet,
    workletRpcApi,
    preview,
    record,
  }
}
