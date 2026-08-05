import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('dsp submit path uses setControlCompileSnapshot (not removed setCode)', () => {
  const src = readFileSync(new URL('../src/dsp.ts', import.meta.url), 'utf8')
  assert.match(src, /program\.setControlCompileSnapshot\(/)
  assert.match(src, /preview\.setControlCompileSnapshot\(/)
  assert.doesNotMatch(src, /program\.setCode\(/)
  assert.doesNotMatch(src, /preview\.setCode\(/)
})

test('transport start re-pushes compile snapshot before dsp.start', () => {
  const src = readFileSync(new URL('../src/state.ts', import.meta.url), 'utf8')
  assert.match(src, /setControlCompileSnapshot\(ccs\)/)
  assert.match(src, /await dsp\.start\(/)
})
