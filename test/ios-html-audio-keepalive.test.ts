import assert from 'node:assert/strict'
import test from 'node:test'
import { getIosHtmlAudioKeepAliveState } from '../src/lib/ios-html-audio-keepalive.ts'

test('ios html audio keep-alive starts as not-created', () => {
  assert.equal(getIosHtmlAudioKeepAliveState(), 'not-created')
})

test('quiet tone wav helper stays internal (state API only)', () => {
  // Ensure diagnostics string shape is stable for mobile paste parsing.
  const state = getIosHtmlAudioKeepAliveState()
  assert.match(state, /^(not-created|paused;|playing\()/)
})
