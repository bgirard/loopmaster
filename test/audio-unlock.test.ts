import assert from 'node:assert/strict'
import test from 'node:test'

/**
 * Documents the iOS Safari requirement that AudioContext.resume() must be
 * invoked synchronously within a user-gesture call stack (before any await).
 */
test('unlockAudio resumes suspended context without awaiting', async () => {
  const calls: string[] = []
  let state: AudioContextState | 'interrupted' = 'suspended'
  const ac = {
    get state() {
      return state
    },
    resume() {
      calls.push('resume')
      state = 'running'
      return Promise.resolve()
    },
  }

  function unlockAudio(audioContext: typeof ac | null | undefined) {
    if (!audioContext) return
    const s = audioContext.state as AudioContextState | 'interrupted'
    if (s === 'running') return
    void audioContext.resume()
  }

  unlockAudio(ac)
  assert.deepEqual(calls, ['resume'])
  assert.equal(ac.state, 'running')

  unlockAudio(ac)
  assert.deepEqual(calls, ['resume'], 'already-running context is not resumed again')

  unlockAudio(null)
  unlockAudio(undefined)
  assert.deepEqual(calls, ['resume'])
})

test('transport start unlocks before first await', async () => {
  const order: string[] = []
  let state: AudioContextState = 'suspended'
  const audioContext = {
    get state() {
      return state
    },
    resume() {
      order.push(`resume:${state}`)
      state = 'running'
      return Promise.resolve().then(() => {
        order.push('resume-settled')
      })
    },
  }

  async function start() {
    // Mirrors transport.start: unlock before any await.
    if (audioContext.state !== 'running') void audioContext.resume()
    order.push('before-await')
    await Promise.resolve()
    order.push('after-await')
    await audioContext.resume()
  }

  const gesture = start()
  assert.deepEqual(order, ['resume:suspended', 'before-await'])
  await gesture
  assert.equal(order[0], 'resume:suspended', 'first resume must run synchronously in the gesture stack')
  assert.ok(order.indexOf('before-await') < order.indexOf('after-await'))
  assert.equal(audioContext.state, 'running')
})

test('audio init requires cross-origin isolation for SharedArrayBuffer', () => {
  // Mirrors createDspContext guard used for Safari/iOS.
  function assertCanCreateSharedAudio(opts: {
    crossOriginIsolated: boolean
    SharedArrayBuffer: unknown
  }) {
    if (typeof opts.SharedArrayBuffer === 'undefined' || !opts.crossOriginIsolated) {
      throw new Error(
        'SharedArrayBuffer unavailable (crossOriginIsolated='
          + String(opts.crossOriginIsolated)
          + '). Safari/iOS needs COOP same-origin + COEP require-corp.',
      )
    }
  }

  assert.throws(
    () => assertCanCreateSharedAudio({ crossOriginIsolated: false, SharedArrayBuffer }),
    /require-corp/,
  )
  assert.doesNotThrow(() =>
    assertCanCreateSharedAudio({ crossOriginIsolated: true, SharedArrayBuffer })
  )
})
