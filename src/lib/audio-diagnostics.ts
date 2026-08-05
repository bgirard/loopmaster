import { signal } from '@preact/signals'
import { SharedTransportIndex, SharedTransportRunningState } from 'engine/src/dsp/worklet-shared.ts'
import type { DspContext } from '../dsp.ts'

export type AudioDiagnosticsSnapshot = {
  generatedAt: string
  href: string
  userAgent: string
  platform: string
  crossOriginIsolated: boolean
  sharedArrayBuffer: boolean
  crossOriginIsolatedNote: string
  audioSessionType: string | null
  ctxReady: boolean
  ctxError: string | null
  audioContextState: string | null
  audioContextSampleRate: number | null
  isPlaying: boolean | null
  isPaused: boolean | null
  isStopped: boolean | null
  isActuallyPlaying: boolean | null
  transportRunning: string | null
  transportSampleCount: number | null
  transportActuallyPlaying: string | null
  workletSampleCount: number | null
  workletProgramCount: number | null
  workletHasCore: boolean | null
  sabShareProbe: string | null
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

/** Latest worklet getStats snapshot (filled asynchronously by the debug panel). */
export const workletStats = signal<{
  sampleCount: number
  programCount: number
  hasCore: boolean
} | null>(null)

let errorHooksInstalled = false

function runningStateName(v: number | null | undefined): string | null {
  if (v == null || Number.isNaN(v)) return null
  if (v === SharedTransportRunningState.Start) return 'Start'
  if (v === SharedTransportRunningState.Pause) return 'Pause'
  if (v === SharedTransportRunningState.Stop) return 'Stop'
  return `Unknown(${v})`
}

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

  const dsp = opts.ctx?.dsp
  if (dsp?.transport) {
    const running = Atomics.load(dsp.transport.transportU32, SharedTransportIndex.Running)
    const actually = Atomics.load(dsp.transport.transportU32, SharedTransportIndex.ActuallyPlaying)
    const samples = dsp.transport.transportF32[SharedTransportIndex.SampleCount]
    note += `; running=${runningStateName(running)}; actually=${runningStateName(actually)}; samples=${samples}`
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

export async function refreshWorkletStats(ctx: DspContext | null): Promise<void> {
  if (!ctx) {
    workletStats.value = null
    return
  }
  try {
    const s = await ctx.dsp.core.worklet.getStats()
    workletStats.value = {
      sampleCount: Number(s.sampleCount) || 0,
      programCount: Number(s.programCount) || 0,
      hasCore: Boolean(s.hasCore),
    }
  }
  catch (error) {
    workletStats.value = null
    const text = error instanceof Error ? error.message : String(error)
    const next = [...recentErrors.peek(), `worklet.getStats: ${text}`].slice(-12)
    recentErrors.value = next
  }
}

export function collectAudioDiagnostics(opts: {
  ctx: DspContext | null
  ctxError: string | null
}): AudioDiagnosticsSnapshot {
  const ac = opts.ctx?.dsp.state.audioContext ?? null
  const isolated = Boolean(globalThis.crossOriginIsolated)
  const hasSab = typeof SharedArrayBuffer === 'function'
  const audioSession = typeof navigator !== 'undefined'
    ? (navigator as Navigator & { audioSession?: { type: string } }).audioSession
    : undefined

  let transportRunning: string | null = null
  let transportSampleCount: number | null = null
  let transportActuallyPlaying: string | null = null
  let sabShareProbe: string | null = null
  let isPlayingFlag: boolean | null = null
  let isPausedFlag: boolean | null = null
  let isStoppedFlag: boolean | null = null
  let isActuallyPlayingFlag: boolean | null = null

  const dsp = opts.ctx?.dsp
  if (dsp?.transport) {
    const running = Atomics.load(dsp.transport.transportU32, SharedTransportIndex.Running)
    const actually = Atomics.load(dsp.transport.transportU32, SharedTransportIndex.ActuallyPlaying)
    transportRunning = runningStateName(running)
    transportActuallyPlaying = runningStateName(actually)
    transportSampleCount = dsp.transport.transportF32[SharedTransportIndex.SampleCount] ?? 0
    isPlayingFlag = running === SharedTransportRunningState.Start
    isPausedFlag = running === SharedTransportRunningState.Pause
    isStoppedFlag = running === SharedTransportRunningState.Stop
    isActuallyPlayingFlag = actually === SharedTransportRunningState.Start

    const ws = workletStats.value
    if (ws && transportSampleCount != null) {
      const mainSamples = transportSampleCount
      const workletSamples = ws.sampleCount
      if (running === SharedTransportRunningState.Start && workletSamples > 128 && mainSamples < 1) {
        sabShareProbe = 'FAIL: worklet advances but main transport stays at 0 (Safari MessagePort SAB bug)'
      }
      else if (running === SharedTransportRunningState.Start && mainSamples > 128 && workletSamples < 1) {
        sabShareProbe = 'FAIL: main advances but worklet sampleCount stays at 0'
      }
      else if (running === SharedTransportRunningState.Start && mainSamples < 1 && workletSamples < 1) {
        sabShareProbe = 'WARN: transport Start but neither side advances (AudioWorklet process may not be running)'
      }
      else if (mainSamples > 0 && workletSamples > 0) {
        sabShareProbe = 'ok: main and worklet sample clocks both advancing'
      }
      else {
        sabShareProbe = `idle (main=${mainSamples}, worklet=${workletSamples})`
      }
    }
  }

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
    audioSessionType: audioSession?.type ?? null,
    ctxReady: Boolean(opts.ctx),
    ctxError: opts.ctxError,
    audioContextState: ac ? String(ac.state) : null,
    audioContextSampleRate: ac?.sampleRate ?? null,
    isPlaying: isPlayingFlag,
    isPaused: isPausedFlag,
    isStopped: isStoppedFlag,
    isActuallyPlaying: isActuallyPlayingFlag,
    transportRunning,
    transportSampleCount,
    transportActuallyPlaying,
    workletSampleCount: workletStats.value?.sampleCount ?? null,
    workletProgramCount: workletStats.value?.programCount ?? null,
    workletHasCore: workletStats.value?.hasCore ?? null,
    sabShareProbe,
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
    `audioSessionType: ${snapshot.audioSessionType ?? '(unsupported)'}`,
    `ctxReady: ${snapshot.ctxReady}`,
    `ctxError: ${snapshot.ctxError ?? '(none)'}`,
    `audioContextState: ${snapshot.audioContextState ?? '(none)'}`,
    `audioContextSampleRate: ${snapshot.audioContextSampleRate ?? '(none)'}`,
    `isPlaying: ${snapshot.isPlaying ?? '(none)'}`,
    `isPaused: ${snapshot.isPaused ?? '(none)'}`,
    `isStopped: ${snapshot.isStopped ?? '(none)'}`,
    `isActuallyPlaying: ${snapshot.isActuallyPlaying ?? '(none)'}`,
    `transportRunning: ${snapshot.transportRunning ?? '(none)'}`,
    `transportActuallyPlaying: ${snapshot.transportActuallyPlaying ?? '(none)'}`,
    `transportSampleCount: ${snapshot.transportSampleCount ?? '(none)'}`,
    `workletSampleCount: ${snapshot.workletSampleCount ?? '(none)'}`,
    `workletProgramCount: ${snapshot.workletProgramCount ?? '(none)'}`,
    `workletHasCore: ${snapshot.workletHasCore ?? '(none)'}`,
    `sabShareProbe: ${snapshot.sabShareProbe ?? '(none)'}`,
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
