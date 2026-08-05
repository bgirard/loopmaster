import { useComputed, useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import {
  collectAudioDiagnostics,
  copyText,
  formatAudioDiagnostics,
  installAudioErrorHooks,
  audioDebugForceShow,
  audioDebugOpen,
} from '../lib/audio-diagnostics.ts'
import { ctx, ctxError } from '../state.ts'

export const AudioDebugPanel = () => {
  const copied = useSignal(false)
  const copyFailed = useSignal(false)
  const initTimedOut = useSignal(false)

  useEffect(() => {
    installAudioErrorHooks()
    const id = window.setTimeout(() => {
      if (!ctx.value) initTimedOut.value = true
    }, 4000)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (ctxError.value || initTimedOut.value) {
      audioDebugForceShow.value = true
      audioDebugOpen.value = true
    }
  }, [ctxError.value, initTimedOut.value])

  const report = useComputed(() =>
    formatAudioDiagnostics(collectAudioDiagnostics({
      ctx: ctx.value,
      ctxError: ctxError.value
        ?? (initTimedOut.value && !ctx.value
          ? 'Audio engine did not become ready within 4s'
          : null),
    }))
  )

  const shouldShow = audioDebugForceShow.value || Boolean(ctxError.value) || initTimedOut.value
  if (!shouldShow) {
    return (
      <button
        type="button"
        class="fixed z-[100] bottom-3 right-3 rounded bg-black/80 border border-white/20 px-3 py-2 text-xs text-white/80"
        onClick={() => {
          audioDebugOpen.value = !audioDebugOpen.value
          audioDebugForceShow.value = true
        }}
      >
        Audio debug
      </button>
    )
  }

  if (!audioDebugOpen.value) {
    return (
      <button
        type="button"
        class="fixed z-[100] bottom-3 right-3 rounded bg-red-950/90 border border-red-400/40 px-3 py-2 text-xs text-red-100"
        onClick={() => {
          audioDebugOpen.value = true
        }}
      >
        Audio problem — tap for details
      </button>
    )
  }

  const handleCopy = async () => {
    copied.value = false
    copyFailed.value = false
    const ok = await copyText(report.value)
    if (ok) {
      copied.value = true
      window.setTimeout(() => {
        copied.value = false
      }, 2000)
    }
    else {
      copyFailed.value = true
    }
  }

  return (
    <div class="fixed z-[100] inset-x-3 bottom-3 max-h-[70vh] overflow-hidden rounded border border-red-400/50 bg-black/95 text-red-50 shadow-lg">
      <div class="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div class="text-sm font-medium text-red-100">Audio diagnostics</div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded bg-white/10 px-3 py-1.5 text-xs text-white active:bg-white/20"
            onClick={handleCopy}
          >
            {copied.value ? 'Copied' : copyFailed.value ? 'Copy failed — select text' : 'Copy'}
          </button>
          <button
            type="button"
            class="rounded bg-white/10 px-3 py-1.5 text-xs text-white/70 active:bg-white/20"
            onClick={() => {
              audioDebugOpen.value = false
            }}
          >
            Hide
          </button>
        </div>
      </div>
      <pre
        class="max-h-[55vh] overflow-auto whitespace-pre-wrap break-words px-3 py-2 text-[11px] leading-4 text-white/85 font-mono select-text"
      >
        {report.value}
      </pre>
    </div>
  )
}
