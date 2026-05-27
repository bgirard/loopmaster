import asconfig from '../../node_modules/engine/asconfig.json'
import type * as WasmExports from '../../node_modules/engine/as/build/index'
import { createDspPreview } from '../../node_modules/engine/src/dsp/dsp-preview.ts'
import { createWasmImports } from '../../node_modules/engine/src/lib/wasm-imports.ts'
import { createWasmRuntime } from '../../node_modules/engine/src/lib/wasm-runtime.ts'
import { wasmSetup } from '../../node_modules/engine/src/lib/wasm-setup.ts'

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
const dynamicRangeDb = 72
const renderVmId = 777

let previewPromise: Promise<ReturnType<typeof createDspPreview>> | null = null
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
    const preview = await getPreview()
    sendProgress(request.id, 0.08)
    const code = buildPreviewCode(request)
    const bars = Math.max(0.25, request.lengthBars || 1)
    let step: IteratorResult<number, { left: Float32Array; right: Float32Array }> | undefined
    const generator = preview.renderToAudio(code, bars, 4, renderVmId)
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

async function getPreview(): Promise<ReturnType<typeof createDspPreview>> {
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
    return createDspPreview(createWasmRuntime(core))
  })()
  return previewPromise
}

function buildPreviewCode(request: SpectrogramRequest): string {
  const source = stripOutputPipes(request.code).trim() || 'dc(0)'
  return [
    `bpm=${formatNumber(clamp(request.bpm || 120, 20, 260))}`,
    'lm_preview=()->{',
    '  bt=t',
    indent(source),
    '}',
    ';lm_preview() |> out($)',
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

  for (let row = 0; row < height; row++) {
    const freq = 1 - row / Math.max(1, height - 1)
    for (let column = 0; column < width; column++) {
      const raw = (decibels[row * width + column]! - floorDb) / dynamicRangeDb
      const energy = clamp(Math.pow(clamp(raw, 0, 1), 0.85), 0, 1)
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
  return `${request.templateId ?? ''}\n${request.name}\n${request.bpm}\n${request.lengthBars}\n${request.code}`
}

function rememberCache(key: string, pixels: Uint8ClampedArray): void {
  if (renderCache.size > 120) {
    const first = renderCache.keys().next().value
    if (first) renderCache.delete(first)
  }
  renderCache.set(key, pixels.slice())
}

function heatColor(energy: number, freq: number): [number, number, number, number] {
  if (energy < 0.06) return [12, 15, 27, Math.round(energy * 210)]
  if (energy < 0.26) return [34, 211, 238, Math.round(48 + energy * 260)]
  if (energy < 0.52) return [167, 139, 250, Math.round(62 + energy * 230)]
  if (energy < 0.78) return [250, 204, 21, Math.round(82 + energy * 180)]
  return [255, 255, Math.round(210 + freq * 45), Math.round(130 + energy * 120)]
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value)) | 0
}

export {}
