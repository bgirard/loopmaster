import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('engine Safari SAB patch files exist', () => {
  const files = [
    'patches/engine/src/dsp/dsp-state.ts',
    'patches/engine/src/dsp/dsp.ts',
    'patches/engine/src/dsp/dsp-core.ts',
    'patches/engine/src/dsp/worklet.ts',
    'patches/engine/src/dsp/fetch-samples.ts',
    'patches/engine/src/lib/wasm-setup.ts',
    'patches/engine/src/lib/sample-manager.ts',
    'scripts/apply-engine-safari-sab-patch.mjs',
  ]
  for (const rel of files) {
    assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`)
  }
})

test('patched fetch-samples sends Float32Array not SAB over worklet port', () => {
  const src = fs.readFileSync(path.join(root, 'patches/engine/src/dsp/fetch-samples.ts'), 'utf8')
  assert.match(src, /setSampleDataDirect/)
  assert.match(src, /Safari does not share SharedArrayBuffer/)
  assert.doesNotMatch(src, /worklet\.setSampleData\(\{/)
})

test('patched dsp-state passes only transport+memory via processorOptions', () => {
  const src = fs.readFileSync(path.join(root, 'patches/engine/src/dsp/dsp-state.ts'), 'utf8')
  assert.match(src, /transportBuffer:\s*shared\.transportBuffer/)
  assert.match(src, /memory:\s*shared\.memory/)
  assert.doesNotMatch(src, /programStatePool:\s*pools/)
  assert.doesNotMatch(src, /historyMetaPool:\s*pools/)
  assert.match(src, /Keep this set minimal|Do not add SAB pools/)
})

test('patched worklet requires processorOptions memory/transport and exposes shareProbe', () => {
  const src = fs.readFileSync(path.join(root, 'patches/engine/src/dsp/worklet.ts'), 'utf8')
  assert.match(src, /this\.sharedMemory\s*=\s*po\.memory/)
  assert.match(src, /shareProbe/)
  assert.match(src, /Never fall back to MessagePort SAB/)
  assert.match(src, /transportSampleCount/)
})

test('patched worklet copies bytecode bit-exact to survive AudioWorklet FTZ', () => {
  const src = fs.readFileSync(path.join(root, 'patches/engine/src/dsp/worklet.ts'), 'utf8')
  assert.match(src, /writeFloat32Bits/)
  assert.match(src, /copyFloat32Bits/)
  assert.match(src, /FTZ|denormal/)
  // Must not use Float32Array.set for control ops (flushes opcode denormals on ARM Safari).
  assert.doesNotMatch(src, /nextOps\.set\(ops/)
})

test('patched dsp mirrors transport and probes SAB sharing', () => {
  const src = fs.readFileSync(path.join(root, 'patches/engine/src/dsp/dsp.ts'), 'utf8')
  assert.match(src, /syncTransportFromWorklet/)
  assert.match(src, /transportMirrorMode/)
  assert.match(src, /shareProbe/)
})
