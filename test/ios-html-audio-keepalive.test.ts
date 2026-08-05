import assert from 'node:assert/strict'
import test from 'node:test'
import { getIosHtmlAudioKeepAliveState } from '../src/lib/ios-html-audio-keepalive.ts'

test('ios html audio keep-alive starts as not-created', () => {
  assert.equal(getIosHtmlAudioKeepAliveState(), 'not-created')
})
