import assert from 'node:assert/strict'
import test from 'node:test'
import { formatAudioDiagnostics, type AudioDiagnosticsSnapshot } from '../src/lib/audio-diagnostics.ts'

test('formatAudioDiagnostics is copy/paste friendly', () => {
  const snapshot: AudioDiagnosticsSnapshot = {
    generatedAt: '2026-08-05T00:00:00.000Z',
    href: 'https://example.com/',
    userAgent: 'TestAgent',
    platform: 'iPhone',
    crossOriginIsolated: false,
    sharedArrayBuffer: false,
    crossOriginIsolatedNote: 'Missing COI',
    ctxReady: false,
    ctxError: 'boom',
    audioContextState: null,
    audioContextSampleRate: null,
    lastPlayAttemptAt: '2026-08-05T00:00:01.000Z',
    lastPlayAttemptSource: 'InlineEditor.play',
    lastPlayAttemptNote: 'audio engine not ready (ctx is null)',
    recentErrors: ['window.error: SharedArrayBuffer'],
  }
  const text = formatAudioDiagnostics(snapshot)
  assert.match(text, /loopmaster audio diagnostics/)
  assert.match(text, /crossOriginIsolated: false/)
  assert.match(text, /ctxError: boom/)
  assert.match(text, /InlineEditor\.play/)
  assert.match(text, /SharedArrayBuffer/)
})
