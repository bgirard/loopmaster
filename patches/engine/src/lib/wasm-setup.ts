import { wasmSourceMap } from 'utils/wasm-sourcemap'

interface SetupOptions {
  binary: ArrayBuffer
  sourcemapUrl: string
  config: {
    options: {
      importMemory: boolean
      initialMemory: number
      maximumMemory: number
      sharedMemory: boolean
    }
  }
  /** Prefer a Memory created on the main thread and passed via AudioWorklet processorOptions.
   * Safari does not share SharedArrayBuffer/Memory sent later over MessagePort. */
  memory?: WebAssembly.Memory
  imports?: WebAssembly.Imports | ((ctx: { memory: WebAssembly.Memory }) => WebAssembly.Imports)
}

export function liftString(memory: WebAssembly.Memory, pointer: number) {
  if (!pointer) return ''
  const end = (pointer + new Uint32Array(memory.buffer)[(pointer - 4) >>> 2]) >>> 1,
    memoryU16 = new Uint16Array(memory.buffer)
  let start = pointer >>> 1,
    string = ''
  while (end - start > 1024) {
    string += String.fromCharCode(...memoryU16.subarray(start, start += 1024))
  }
  return string + String.fromCharCode(...memoryU16.subarray(start, end))
}

export type WasmSetup<T> = Awaited<ReturnType<typeof wasmSetup<T>>>

export async function wasmSetup<T>({ binary, sourcemapUrl, config, imports, memory: existingMemory }: SetupOptions) {
  const buffer = wasmSourceMap.setSourceMapURL(binary, sourcemapUrl)
  const uint8 = new Uint8Array(buffer)

  const memory = existingMemory ?? new WebAssembly.Memory({
    initial: config.options.initialMemory,
    maximum: config.options.maximumMemory,
    shared: config.options.sharedMemory,
  })
  const mod = await WebAssembly.compile(uint8.buffer)

  const extraImports = typeof imports === 'function' ? imports({ memory }) : imports
  const importObject: WebAssembly.Imports = {
    env: {
      memory,
      abort(message$: number, fileName$: number, lineNumber$: number, columnNumber$: number) {
        const message = liftString(memory, message$ >>> 0)
        const fileName = liftString(memory, fileName$ >>> 0)
        const lineNumber = lineNumber$ >>> 0
        const columnNumber = columnNumber$ >>> 0
        throw new Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`)
      },
      seed: () => Date.now() * Math.random(),
      log: console.log,
      warn: console.warn,
      'console.log': (textPtr: number) => {
        console.log(liftString(memory, textPtr))
      },
      'console.warn': (textPtr: number) => {
        console.warn(liftString(memory, textPtr))
      },
    },
  }

  if (extraImports) {
    for (const k of Object.keys(extraImports)) {
      const mod = (extraImports as any)[k]
      if (!mod) continue
      ;(importObject as any)[k] = { ...(importObject as any)[k], ...mod }
    }
  }

  const instance = await WebAssembly.instantiate(mod, importObject)

  const wasm: T = instance.exports as any

  return {
    wasm,
    memory,
  }
}
