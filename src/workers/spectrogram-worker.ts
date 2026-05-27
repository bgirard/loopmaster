import asconfig from '../../node_modules/engine/asconfig.json'
import type * as WasmExports from '../../node_modules/engine/as/build/index'
import { AudioVmOp } from '../../node_modules/engine/src/dsp/audio-vm-bindings.ts'
import { createDspPreview } from '../../node_modules/engine/src/dsp/dsp-preview.ts'
import type { RecordCallback, SampleRegistration } from '../../node_modules/engine/src/live/compiler/types.ts'
import { processRecordRequest } from '../../node_modules/engine/src/lib/record-utils.ts'
import { sampleManager } from '../../node_modules/engine/src/lib/sample-manager.ts'
import { createWasmImports } from '../../node_modules/engine/src/lib/wasm-imports.ts'
import { createWasmRuntime, type WasmRuntime } from '../../node_modules/engine/src/lib/wasm-runtime.ts'
import { wasmSetup, type WasmSetup } from '../../node_modules/engine/src/lib/wasm-setup.ts'

type SpectrogramRequest = {
  id: number
  blockId: string
  name: string
  templateId?: string
  code: string
  lengthBars: number
  bpm: number
}

const width = 256
const height = 96
const fftSize = 1024
const sampleRate = 48000
const minFrequency = 20
const maxFrequency = 20000
const dynamicRangeDb = 36
const renderVmId = 777
const recordVmId = 778
const renderCacheVersion = 2

type PreviewRuntime = {
  preview: ReturnType<typeof createDspPreview>
  runtime: WasmRuntime
  core: WasmSetup<typeof WasmExports>
}

let previewPromise: Promise<PreviewRuntime> | null = null
const renderCache = new Map<string, Uint8ClampedArray>()
const fftBitReversal = createBitReversalTable(fftSize)
const spectrogramBands = createSpectrogramBands()

self.onmessage = (event: MessageEvent<SpectrogramRequest>) => {
  void renderRequest(event.data)
}

async function renderRequest(request: SpectrogramRequest): Promise<void> {
  try {
    sendProgress(request.id, 0.02)
    const cacheKey = getCacheKey(request)
    const cached = renderCache.get(cacheKey)
    if (cached) {
      const pixels = cached.slice()
      self.postMessage({ id: request.id, type: 'result', width, height, pixels }, [pixels.buffer])
      return
    }
    const previewRuntime = await getPreview()
    sendProgress(request.id, 0.08)
    const code = buildPreviewCode(request)
    const bars = Math.max(0.25, request.lengthBars || 1)
    let step: IteratorResult<number, { left: Float32Array; right: Float32Array }> | undefined
    const generator = renderToAudio(previewRuntime, code, bars, 4, renderVmId)
    while (!(step = generator.next()).done) {
      sendProgress(request.id, 0.08 + clamp(step.value, 0, 1) * 0.72)
      // Keep the render incremental inside the worker so long blocks do not monopolize one task.
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    const mono = mixMono(step.value.left, step.value.right)
    sendProgress(request.id, 0.84)
    const pixels = computeSpectrogram(mono)
    rememberCache(cacheKey, pixels)
    self.postMessage({ id: request.id, type: 'result', width, height, pixels }, [pixels.buffer])
  }
  catch (error) {
    const cacheKey = getCacheKey(request)
    const cached = renderCache.get(cacheKey)
    if (cached) {
      const pixels = cached.slice()
      self.postMessage({ id: request.id, type: 'result', width, height, pixels }, [pixels.buffer])
      return
    }
    // Never synthesize a fallback spectrogram here: DAW blocks must show rendered audio analysis or nothing.
    const debugError = serializeError(error)
    console.error('[spectrogram-worker] Render failed', {
      error: debugError,
      blockId: request.blockId,
      name: request.name,
      templateId: request.templateId,
      lengthBars: request.lengthBars,
      bpm: request.bpm,
      code: request.code,
      previewCode: buildPreviewCode(request),
    })
    const pixels = emptySpectrogram()
    self.postMessage({
      id: request.id,
      type: 'result',
      width,
      height,
      pixels,
      error: debugError,
    }, [pixels.buffer])
  }
}

function serializeError(error: unknown): { message: string; name?: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message || 'Spectrogram render failed',
      name: error.name,
      stack: error.stack,
    }
  }
  return { message: String(error || 'Spectrogram render failed') }
}

function sendProgress(id: number, progress: number): void {
  self.postMessage({ id, type: 'progress', progress: clamp(progress, 0, 1) })
}

async function getPreview(): Promise<PreviewRuntime> {
  if (previewPromise) return previewPromise
  previewPromise = (async () => {
    const response = await fetch('/as/build/index.wasm')
    if (!response.ok) throw new Error(`Failed to fetch WASM: ${response.status}`)
    const binary = await response.arrayBuffer()
    const core = await wasmSetup<typeof WasmExports>({
      binary,
      sourcemapUrl: '/as/build/index.wasm.map',
      config: asconfig,
      imports: ({ memory }) => createWasmImports(memory),
    })
    const runtime = createWasmRuntime(core)
    return { preview: createDspPreview(runtime), runtime, core }
  })()
  return previewPromise
}

function* renderToAudio(
  previewRuntime: PreviewRuntime,
  code: string,
  bars: number,
  beatsPerBar = 4,
  vmId = 999,
): Generator<number, { left: Float32Array; right: Float32Array }, void> {
  const { preview, runtime, core } = previewRuntime
  const result = preview.setCode(code)
  if (result.errors.length > 0) throw new Error(`Compilation failed:\n${result.errors.join('\n')}`)
  if (!result.compile.bytecode) throw new Error('No bytecode generated')
  const bytecode = trimAudioBytecode(result.compile.bytecode)
  const bpm = result.compile.bpm
  ensureRecordSamples({
    core,
    registrations: result.compile.sampleRegistrations,
    recordCallbacks: result.compile.recordCallbacks,
    mainBytecode: bytecode,
    bpm,
  })
  const totalSamples = Math.floor((bars * beatsPerBar * 60 / bpm) * sampleRate)
  const chunk = 128
  const numChunks = Math.ceil(totalSamples / chunk)
  const renderedLength = numChunks * chunk
  const left = new Float32Array(renderedLength)
  const right = new Float32Array(renderedLength)
  const nyquist = sampleRate / 2
  const piOverNyquist = Math.PI / nyquist
  const audioOpsPtr = runtime.createFloat32Buffer(bytecode.length)
  try {
    new Float32Array(runtime.buffer, audioOpsPtr, bytecode.length).set(bytecode)
    runtime.resetAudioVmAt(vmId)
    let offset = 0
    for (let i = 0; i < numChunks; i++) {
      runtime.runAudioVmAt(vmId, audioOpsPtr, bytecode.length, chunk, offset, sampleRate, nyquist, piOverNyquist, bpm)
      const infoPtr = runtime.getAudioVmInfoPtr(vmId)
      const aInfo = new Uint32Array(runtime.buffer, infoPtr, 10)
      const outputLeftPtr = aInfo[8]
      const outputRightPtr = aInfo[9]
      if (outputLeftPtr && outputRightPtr) {
        left.set(new Float32Array(runtime.buffer, outputLeftPtr, chunk), offset)
        right.set(new Float32Array(runtime.buffer, outputRightPtr, chunk), offset)
      }
      offset += chunk
      if ((i + 1) % 128 === 0 || i === numChunks - 1) {
        yield totalSamples > 0 ? Math.min(1, offset / totalSamples) : 1
      }
    }
  }
  finally {
    runtime.freeFloat32Buffer(audioOpsPtr)
  }
  yield 1
  return {
    left: left.subarray(0, totalSamples).slice(),
    right: right.subarray(0, totalSamples).slice(),
  }
}

function trimAudioBytecode(bytecode: Float32Array): Float32Array {
  const opcodes = new Uint32Array(bytecode.buffer, bytecode.byteOffset, bytecode.length)
  const postIndex = opcodes.findLastIndex(opcode => opcode === AudioVmOp.Post)
  return postIndex >= 0 ? bytecode.subarray(0, postIndex + 1) : bytecode
}

function ensureRecordSamples({
  core,
  registrations,
  recordCallbacks,
  mainBytecode,
  bpm,
}: {
  core: WasmSetup<typeof WasmExports>
  registrations: SampleRegistration[]
  recordCallbacks?: Map<number, RecordCallback>
  mainBytecode: Float32Array
  bpm: number
}): void {
  for (const registration of registrations) {
    if (registration.type === 'inline' && registration.inlineChannels && registration.inlineSampleRate != null) {
      sampleManager.setSampleData(registration.handle, registration.inlineChannels, registration.inlineSampleRate)
      continue
    }

    if (
      registration.type !== 'record'
      || registration.recordSeconds == null
      || registration.recordCallbackId == null
    ) {
      continue
    }

    const record = processRecordRequest({
      core,
      recordRequest: {
        seconds: registration.recordSeconds,
        callbackId: registration.recordCallbackId,
      },
      recordCallbacks: recordCallbacks ?? new Map(),
      mainBytecode,
      sampleRate,
      bpm,
      tempVmId: recordVmId,
    })
    if (!record) {
      sampleManager.setSampleError(registration.handle, `No record callback ${registration.recordCallbackId}`)
      continue
    }
    sampleManager.setSampleData(registration.handle, [record.output], sampleRate)
  }
}

function buildPreviewCode(request: SpectrogramRequest): string {
  const source = stripOutputPipes(request.code).trim() || 'dc(0)'
  return [
    `bpm=${formatNumber(clamp(request.bpm || 120, 20, 260))}`,
    'lm_preview=(_lm_preview_arg)->{',
    '  bt=t',
    indent(source),
    '}',
    'out(lm_preview(0))',
  ].join('\n')
}

function computeSpectrogram(samples: Float32Array): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4)
  const window = hannWindow(fftSize)
  const decibels = new Float32Array(width * height)
  const real = new Float32Array(fftSize)
  const imaginary = new Float32Array(fftSize)
  const powerSpectrum = new Float32Array(fftSize / 2 + 1)
  let peakDb = -Infinity

  for (let column = 0; column < width; column++) {
    const center = Math.floor(column / Math.max(1, width - 1) * Math.max(0, samples.length - 1))
    const start = center - Math.floor(fftSize / 2)
    for (let i = 0; i < fftSize; i++) {
      const sample = samples[start + i] ?? 0
      real[i] = sample * window[i]!
      imaginary[i] = 0
    }

    fft(real, imaginary)

    for (let bin = 0; bin < powerSpectrum.length; bin++) {
      const re = real[bin]!
      const im = imaginary[bin]!
      powerSpectrum[bin] = (re * re + im * im) / (fftSize * fftSize)
    }

    for (let row = 0; row < height; row++) {
      const band = spectrogramBands[row]!
      let power = 0
      for (let bin = band.startBin; bin <= band.endBin; bin++) power += powerSpectrum[bin] ?? 0
      power /= band.endBin - band.startBin + 1

      const value = 10 * Math.log10(power + 1e-20)
      decibels[row * width + column] = value
      peakDb = Math.max(peakDb, value)
    }
  }

  if (!Number.isFinite(peakDb)) return pixels
  const floorDb = peakDb - dynamicRangeDb
  const columnEnergy = new Float32Array(width)
  const rowMinEnergy = new Float32Array(height)
  const rowMaxEnergy = new Float32Array(height)
  rowMinEnergy.fill(1)
  let maxColumnEnergy = 0
  let minColumnEnergy = 1

  for (let column = 0; column < width; column++) {
    let sum = 0
    for (let row = 0; row < height; row++) {
      const normalized = normalizeDb(decibels[row * width + column]!, floorDb)
      rowMinEnergy[row] = Math.min(rowMinEnergy[row]!, normalized)
      rowMaxEnergy[row] = Math.max(rowMaxEnergy[row]!, normalized)
      sum += normalized * normalized
    }
    const rms = Math.sqrt(sum / height)
    columnEnergy[column] = rms
    maxColumnEnergy = Math.max(maxColumnEnergy, rms)
    minColumnEnergy = Math.min(minColumnEnergy, rms)
  }
  const columnRange = Math.max(0.001, maxColumnEnergy - minColumnEnergy)

  for (let row = 0; row < height; row++) {
    const freq = 1 - row / Math.max(1, height - 1)
    const rowRange = Math.max(0.001, rowMaxEnergy[row]! - rowMinEnergy[row]!)
    for (let column = 0; column < width; column++) {
      const absoluteEnergy = normalizeDb(decibels[row * width + column]!, floorDb)
      const rowContrast = clamp((absoluteEnergy - rowMinEnergy[row]!) / rowRange, 0, 1)
      const columnContrast = clamp((columnEnergy[column]! - minColumnEnergy) / columnRange, 0, 1)
      const transientEnergy = Math.pow(rowContrast * columnContrast, 0.72)
      const bedEnergy = Math.pow(absoluteEnergy, 1.55) * 0.42
      const energy = clamp(Math.max(bedEnergy, transientEnergy), 0, 1)
      const index = (row * width + column) * 4
      const [r, g, b, a] = heatColor(energy, freq)
      pixels[index] = r
      pixels[index + 1] = g
      pixels[index + 2] = b
      pixels[index + 3] = a
    }
  }

  return pixels
}

type SpectrogramBand = {
  startBin: number
  endBin: number
}

function createSpectrogramBands(): SpectrogramBand[] {
  const nyquist = sampleRate / 2
  const maxFreq = Math.min(maxFrequency, nyquist)
  const binHz = sampleRate / fftSize
  const ratio = maxFreq / minFrequency

  return Array.from({ length: height }).map((_, row) => {
    const high = minFrequency * ratio ** (1 - row / height)
    const low = minFrequency * ratio ** (1 - (row + 1) / height)
    const startBin = clampInt(Math.floor(low / binHz), 1, fftSize / 2)
    const endBin = clampInt(Math.ceil(high / binHz), startBin, fftSize / 2)
    return { startBin, endBin }
  })
}

function createBitReversalTable(size: number): Uint16Array {
  const bits = Math.log2(size)
  const table = new Uint16Array(size)
  for (let i = 0; i < size; i++) {
    let x = i
    let y = 0
    for (let bit = 0; bit < bits; bit++) {
      y = (y << 1) | (x & 1)
      x >>= 1
    }
    table[i] = y
  }
  return table
}

function fft(real: Float32Array, imaginary: Float32Array): void {
  const n = real.length

  for (let i = 0; i < n; i++) {
    const j = fftBitReversal[i]!
    if (j <= i) continue
    const realValue = real[i]!
    const imaginaryValue = imaginary[i]!
    real[i] = real[j]!
    imaginary[i] = imaginary[j]!
    real[j] = realValue
    imaginary[j] = imaginaryValue
  }

  for (let size = 2; size <= n; size <<= 1) {
    const halfSize = size >> 1
    const phaseStep = -2 * Math.PI / size
    const stepReal = Math.cos(phaseStep)
    const stepImaginary = Math.sin(phaseStep)

    for (let start = 0; start < n; start += size) {
      let wr = 1
      let wi = 0
      for (let offset = 0; offset < halfSize; offset++) {
        const even = start + offset
        const odd = even + halfSize
        const oddReal = real[odd]!
        const oddImaginary = imaginary[odd]!
        const tr = wr * oddReal - wi * oddImaginary
        const ti = wr * oddImaginary + wi * oddReal
        real[odd] = real[even]! - tr
        imaginary[odd] = imaginary[even]! - ti
        real[even] = real[even]! + tr
        imaginary[even] = imaginary[even]! + ti

        const nextWr = wr * stepReal - wi * stepImaginary
        wi = wr * stepImaginary + wi * stepReal
        wr = nextWr
      }
    }
  }
}

function hannWindow(size: number): Float32Array {
  const window = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    window[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / Math.max(1, size - 1))
  }
  return window
}

function emptySpectrogram(): Uint8ClampedArray {
  return new Uint8ClampedArray(width * height * 4)
}

function mixMono(left: Float32Array, right: Float32Array): Float32Array {
  const length = Math.min(left.length, right.length)
  const mono = new Float32Array(length)
  for (let i = 0; i < length; i++) mono[i] = (left[i]! + right[i]!) * 0.5
  return mono
}

function stripOutputPipes(code: string): string {
  return code.replace(/\|>\s*(?:out|outs|solo|sout)\s*\([^)]*\)/g, '').trim()
}

function indent(value: string): string {
  return value.split('\n').map(line => `  ${line}`).join('\n')
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : Number(value.toFixed(4)).toString()
}

function getCacheKey(request: SpectrogramRequest): string {
  return `${renderCacheVersion}\n${request.templateId ?? ''}\n${request.name}\n${request.bpm}\n${request.lengthBars}\n${request.code}`
}

function rememberCache(key: string, pixels: Uint8ClampedArray): void {
  if (renderCache.size > 120) {
    const first = renderCache.keys().next().value
    if (first) renderCache.delete(first)
  }
  renderCache.set(key, pixels.slice())
}

function normalizeDb(value: number, floorDb: number): number {
  return clamp((value - floorDb) / dynamicRangeDb, 0, 1)
}

function heatColor(energy: number, freq: number): [number, number, number, number] {
  if (energy < 0.08) return [7, 10, 18, Math.round(energy * 160)]
  if (energy < 0.28) return [20, Math.round(145 + freq * 80), 220, Math.round(38 + energy * 210)]
  if (energy < 0.55) return [142, 92, 246, Math.round(58 + energy * 220)]
  if (energy < 0.82) return [245, Math.round(120 + freq * 90), 32, Math.round(78 + energy * 190)]
  return [255, Math.round(210 - freq * 95), Math.round(64 + freq * 80), Math.round(112 + energy * 130)]
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value)) | 0
}

export {}
