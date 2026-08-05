import { signal } from '@preact/signals'
import type { DspContext } from '../dsp.ts'

export type AudioDiagnosticsSnapshot = {
  generatedAt: string
  href: string
  userAgent: string
  platform: string
  crossOriginIsolated: boolean
  sharedArrayBuffer: boolean
  crossOriginIsolatedNote: string
  ctxReady: boolean
  ctxError: string | null
  audioContextState: string | null
  audioContextSampleRate: number | null
  lastPlayAttemptAt: string | null
  lastPlayAttemptSource: string | null
  lastPlayAttemptNote: string | null
  recentErrors: string[]
}

const recentErrors = signal<string[]>([])
export const lastPlayAttempt = signal<{
  at: string
  source: string
  note: string
} | null>(null)

export const audioDebugOpen = signal(false)
export const audioDebugForceShow = signal(false)

let errorHooksInstalled = false

export function installAudioErrorHooks() {
  if (errorHooksInstalled || typeof window === 'undefined') return
  errorHooksInstalled = true

  const push = (label: string, detail: unknown) => {
    const text = detail instanceof Error
      ? `${label}: ${detail.name}: ${detail.message}${detail.stack ? `\n${detail.stack}` : ''}`
      : `${label}: ${String(detail)}`
    const next = [...recentErrors.peek(), text].slice(-12)
    recentErrors.value = next
    // Surface unexpected audio/WASM failures in the panel automatically.
    if (/audio|SharedArrayBuffer|crossOrigin|worklet|wasm|COEP|COOP/i.test(text)) {
      audioDebugForceShow.value = true
      audioDebugOpen.value = true
    }
  }

  window.addEventListener('error', event => {
    push('window.error', event.error ?? event.message)
  })
  window.addEventListener('unhandledrejection', event => {
    push('unhandledrejection', event.reason)
  })
}

export function notePlayAttempt(
  source: string,
  opts: {
    ctx: DspContext | null
    ctxError: string | null
    expectRunning?: boolean
  },
) {
  const ac = opts.ctx?.dsp.state.audioContext
  const state = ac ? String(ac.state) : null
  let note = 'ok'
  if (opts.ctxError) note = `engine error: ${opts.ctxError}`
  else if (!opts.ctx) note = 'audio engine not ready (ctx is null)'
  else if (opts.expectRunning && state && state !== 'running') {
    note = `AudioContext state is "${state}" after resume`
  }
  else if (state) {
    note = `AudioContext state is "${state}"`
  }
  lastPlayAttempt.value = {
    at: new Date().toISOString(),
    source,
    note,
  }
  if (opts.ctxError || !opts.ctx || (opts.expectRunning && state && state !== 'running')) {
    audioDebugForceShow.value = true
    audioDebugOpen.value = true
  }
}

export function collectAudioDiagnostics(opts: {
  ctx: DspContext | null
  ctxError: string | null
}): AudioDiagnosticsSnapshot {
  const ac = opts.ctx?.dsp.state.audioContext ?? null
  const isolated = Boolean(globalThis.crossOriginIsolated)
  const hasSab = typeof SharedArrayBuffer === 'function'
  return {
    generatedAt: new Date().toISOString(),
    href: typeof location !== 'undefined' ? location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    platform: typeof navigator !== 'undefined' ? navigator.platform : '',
    crossOriginIsolated: isolated,
    sharedArrayBuffer: hasSab,
    crossOriginIsolatedNote: isolated && hasSab
      ? 'COI + SharedArrayBuffer available'
      : 'Missing COI and/or SharedArrayBuffer — Safari needs COEP require-corp',
    ctxReady: Boolean(opts.ctx),
    ctxError: opts.ctxError,
    audioContextState: ac ? String(ac.state) : null,
    audioContextSampleRate: ac?.sampleRate ?? null,
    lastPlayAttemptAt: lastPlayAttempt.value?.at ?? null,
    lastPlayAttemptSource: lastPlayAttempt.value?.source ?? null,
    lastPlayAttemptNote: lastPlayAttempt.value?.note ?? null,
    recentErrors: [...recentErrors.value],
  }
}

export function formatAudioDiagnostics(snapshot: AudioDiagnosticsSnapshot): string {
  const lines = [
    'loopmaster audio diagnostics',
    `generatedAt: ${snapshot.generatedAt}`,
    `href: ${snapshot.href}`,
    `userAgent: ${snapshot.userAgent}`,
    `platform: ${snapshot.platform}`,
    `crossOriginIsolated: ${snapshot.crossOriginIsolated}`,
    `sharedArrayBuffer: ${snapshot.sharedArrayBuffer}`,
    `note: ${snapshot.crossOriginIsolatedNote}`,
    `ctxReady: ${snapshot.ctxReady}`,
    `ctxError: ${snapshot.ctxError ?? '(none)'}`,
    `audioContextState: ${snapshot.audioContextState ?? '(none)'}`,
    `audioContextSampleRate: ${snapshot.audioContextSampleRate ?? '(none)'}`,
    `lastPlayAttemptAt: ${snapshot.lastPlayAttemptAt ?? '(none)'}`,
    `lastPlayAttemptSource: ${snapshot.lastPlayAttemptSource ?? '(none)'}`,
    `lastPlayAttemptNote: ${snapshot.lastPlayAttemptNote ?? '(none)'}`,
    'recentErrors:',
    ...(snapshot.recentErrors.length
      ? snapshot.recentErrors.map((e, i) => `  [${i + 1}] ${e}`)
      : ['  (none)']),
  ]
  return lines.join('\n')
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  }
  catch {
    // fall through to legacy path
  }

  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.top = '0'
    el.style.left = '0'
    el.style.width = '1px'
    el.style.height = '1px'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    el.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  }
  catch {
    return false
  }
}
