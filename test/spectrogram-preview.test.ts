import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import asconfig from 'engine/asconfig.json' with { type: 'json' }
import { AudioVmOp } from 'engine/src/dsp/audio-vm-bindings.ts'
import { createDspPreview } from 'engine/src/dsp/dsp-preview.ts'
import { controlPipeline } from 'engine/src/live/pipeline.ts'
import type { RecordCallback, SampleRegistration } from 'engine/src/live/compiler/types.ts'
import { processRecordRequest } from 'engine/src/lib/record-utils.ts'
import { sampleManager } from 'engine/src/lib/sample-manager.ts'
import { createWasmImports } from 'engine/src/lib/wasm-imports.ts'
import { createWasmRuntime, type WasmRuntime } from 'engine/src/lib/wasm-runtime.ts'
import { wasmSetup, type WasmSetup } from 'engine/src/lib/wasm-setup.ts'
import type * as WasmExports from 'engine/as/build/index'
import { dawTemplates, getTemplate } from '../src/lib/daw-templates.ts'
import { buildSpectrogramPreviewCode } from '../src/lib/spectrogram-preview.ts'

const sampleRate = 48000
const recordVmId = 778

describe('DAW spectrogram preview code', () => {
  it('compiles every community template through the worker preview code path', () => {
    const failures: string[] = []

    for (const template of dawTemplates.filter(template => template.id.startsWith('community-'))) {
      const code = buildSpectrogramPreviewCode({
        templateId: template.id,
        code: template.code,
        bpm: 120,
      })
      const result = controlPipeline.compileSource(code, { projectId: `spectrogram-${template.id}` })
      const errors = [
        ...result.errors,
        ...result.compile.errors.map(error => error.message),
      ]

      if (errors.length) {
        failures.push(`${template.id} ${template.name}: ${errors.join('; ')}`)
      }
      else {
        assert.ok(result.compile.bytecode.length > 0)
      }
    }

    assert.deepEqual(failures, [])
  })

  it('migrates stale Agony code before building spectrogram preview code', () => {
    const template = getTemplate('community-66d79i')
    assert.ok(template)
    const staleCode = template.code.replace('trig=at(2.25/16,1/2)', 'trig=every(1/2,2.25/16)')

    const code = buildSpectrogramPreviewCode({
      templateId: template.id,
      code: staleCode,
      bpm: 120,
    })

    assert.match(code, /trig=at\(2\.25\/16,1\/2\)/)
    assert.doesNotMatch(code, /every\(1\/2,2\.25\/16\)/)

    const result = controlPipeline.compileSource(code, { projectId: 'spectrogram-agony-stale-regression' })
    assert.deepEqual(result.errors, [])
    assert.deepEqual(result.compile.errors, [])
    assert.ok(result.compile.bytecode.length > 0)
  })

  it('reproduces the legacy wrapped Agony render failure', async () => {
    const template = getTemplate('community-66d79i')
    assert.ok(template)
    const legacyCode = buildLegacyWrappedPreviewCode(template.code)

    await withSuppressedRecordUtilsLogging(async () => {
      await assert.rejects(
        () => ensurePreviewRecordSamples(legacyCode),
        /OutSolo: L channel must be audio or scalar, got function/,
      )
    })
  })

  it('prepares record samples for stale Agony through the spectrogram preview path', async () => {
    const template = getTemplate('community-66d79i')
    assert.ok(template)
    const staleCode = template.code.replace('trig=at(2.25/16,1/2)', 'trig=every(1/2,2.25/16)')
    const code = buildSpectrogramPreviewCode({
      templateId: template.id,
      code: staleCode,
      bpm: 120,
    })

    const rendered = await ensurePreviewRecordSamples(code)

    assert.equal(rendered.registrations, 6)
    assert.equal(rendered.errors.length, 0)
    assert.ok(rendered.bytecodeLength > 0)
  })
})

type PreviewRuntime = {
  preview: ReturnType<typeof createDspPreview>
  runtime: WasmRuntime
  core: WasmSetup<typeof WasmExports>
}

let previewRuntimePromise: Promise<PreviewRuntime> | null = null

async function getPreviewRuntime(): Promise<PreviewRuntime> {
  if (previewRuntimePromise) return previewRuntimePromise
  previewRuntimePromise = (async () => {
    const binary = await readFile('./dist/as/build/index.wasm')
    const core = await wasmSetup<typeof WasmExports>({
      binary,
      sourcemapUrl: './dist/as/build/index.wasm.map',
      config: asconfig,
      imports: ({ memory }) => createWasmImports(memory),
    })
    const runtime = createWasmRuntime(core)
    return { preview: createDspPreview(runtime), runtime, core }
  })()
  return previewRuntimePromise
}

async function ensurePreviewRecordSamples(code: string): Promise<{ bytecodeLength: number; registrations: number; errors: string[] }> {
  const { preview, core } = await getPreviewRuntime()
  const result = preview.setCode(code)
  const errors = [
    ...result.errors,
    ...result.compile.errors.map(error => error.message),
  ]
  if (errors.length) return { bytecodeLength: 0, registrations: 0, errors }
  if (!result.compile.bytecode) throw new Error('No bytecode generated')

  const bytecode = trimAudioBytecode(result.compile.bytecode)
  ensureRecordSamples({
    core,
    registrations: result.compile.sampleRegistrations,
    recordCallbacks: result.compile.recordCallbacks,
    mainBytecode: bytecode,
    bpm: result.compile.bpm,
  })

  return {
    bytecodeLength: bytecode.length,
    registrations: result.compile.sampleRegistrations.length,
    errors,
  }
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
    if (record) sampleManager.setSampleData(registration.handle, [record.output], sampleRate)
  }
}

function trimAudioBytecode(bytecode: Float32Array): Float32Array {
  const opcodes = new Uint32Array(bytecode.buffer, bytecode.byteOffset, bytecode.length)
  const postIndex = opcodes.findLastIndex(opcode => opcode === AudioVmOp.Post)
  return postIndex >= 0 ? bytecode.subarray(0, postIndex + 1) : bytecode
}

function buildLegacyWrappedPreviewCode(code: string): string {
  const source = code.replace(/\|>\s*(?:out|outs|solo|sout)\s*\([^)]*\)/g, '').trim() || 'dc(0)'
  return [
    'bpm=120',
    'lm_preview=(_lm_preview_arg)->{',
    '  bt=t',
    source.split('\n').map(line => `  ${line}`).join('\n'),
    '}',
    'out(lm_preview(0))',
  ].join('\n')
}

async function withSuppressedRecordUtilsLogging(fn: () => Promise<void>): Promise<void> {
  const originalGroupCollapsed = console.groupCollapsed
  const originalGroupEnd = console.groupEnd
  const originalLog = console.log
  console.groupCollapsed = () => undefined
  console.groupEnd = () => undefined
  console.log = () => undefined
  try {
    await fn()
  }
  finally {
    console.groupCollapsed = originalGroupCollapsed
    console.groupEnd = originalGroupEnd
    console.log = originalLog
  }
}
