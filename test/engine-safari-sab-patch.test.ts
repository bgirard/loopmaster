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
    'patches/engine/src/lib/wasm-setup.ts',
    'scripts/apply-engine-safari-sab-patch.mjs',
  ]
  for (const rel of files) {
    assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`)
  }
})

test('patched dsp-state passes shared pools via processorOptions', () => {
  const src = fs.readFileSync(path.join(root, 'patches/engine/src/dsp/dsp-state.ts'), 'utf8')
  assert.match(src, /transportBuffer:\s*pools\.transportBuffer/)
  assert.match(src, /memory:\s*pools\.memory/)
  assert.match(src, /programStatePool:\s*pools\.programStatePool/)
  assert.match(src, /historyMetaPool:\s*pools\.historyMetaPool/)
  assert.match(src, /Safari/)
})

test('patched worklet prefers processorOptions memory and pool indices', () => {
  const src = fs.readFileSync(path.join(root, 'patches/engine/src/dsp/worklet.ts'), 'utf8')
  assert.match(src, /this\.sharedMemory\s*=\s*po\.memory/)
  assert.match(src, /historyMetaIndices/)
  assert.match(src, /stateIndex/)
  assert.match(src, /memory:\s*opts\.memory/)
})

test('patched createProgram uses pool indices instead of MessagePort SABs', () => {
  const src = fs.readFileSync(path.join(root, 'patches/engine/src/dsp/dsp.ts'), 'utf8')
  assert.match(src, /allocProgramSharedBuffers/)
  assert.match(src, /stateIndex:\s*allocated\.stateIndex/)
  assert.match(src, /historyMetaIndices:\s*allocated\.historyMetaIndices/)
})
