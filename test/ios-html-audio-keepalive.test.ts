import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getIosHtmlAudioKeepAliveState } from '../src/lib/ios-html-audio-keepalive.ts'

test('ios html audio keep-alive starts as not-created', () => {
  assert.equal(getIosHtmlAudioKeepAliveState(), 'not-created')
})

test('quiet tone wav helper stays internal (state API only)', () => {
  // Ensure diagnostics string shape is stable for mobile paste parsing.
  const state = getIosHtmlAudioKeepAliveState()
  assert.match(state, /^(not-created|paused;|playing\()/)
})

test('keep-alive source avoids MediaElementSource (iOS stalls)', () => {
  const src = fs.readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/lib/ios-html-audio-keepalive.ts'),
    'utf8',
  )
  assert.doesNotMatch(src, /createMediaElementSource/)
  assert.match(src, /createOscillator/)
  assert.match(src, /native/)
})
