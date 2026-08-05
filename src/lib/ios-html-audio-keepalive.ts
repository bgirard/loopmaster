let iosHtmlAudioKeepAlive: HTMLAudioElement | null = null
let silentWavUrl: string | null = null

function createSilentWavUrl(): string {
  // 0.25s mono silent PCM WAV @ 22050Hz — long enough for iOS to treat as media.
  const sampleRate = 22050
  const numSamples = Math.floor(sampleRate / 4)
  const dataSize = numSamples * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)
  // samples already zero-filled
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

/**
 * iOS 18 Safari can leave AudioWorklet output silent even when AudioContext is
 * "running" until an HTMLMediaElement is also playing. Start a tiny looping
 * silent WAV during the user gesture to unlock the media pipeline.
 */
export function ensureIosHtmlAudioKeepAlive() {
  if (typeof document === 'undefined') return
  try {
    if (!iosHtmlAudioKeepAlive) {
      silentWavUrl = createSilentWavUrl()
      const el = new Audio()
      el.loop = true
      el.preload = 'auto'
      // volume 0 is ignored by some iOS versions; keep it barely audible.
      el.volume = 0.001
      el.muted = false
      el.setAttribute('playsinline', 'true')
      el.src = silentWavUrl
      iosHtmlAudioKeepAlive = el
    }
    const playResult = iosHtmlAudioKeepAlive.play()
    if (playResult && typeof playResult.catch === 'function') {
      void playResult.catch(() => {
        // Gesture may be required again later.
      })
    }
  }
  catch {
    // Non-fatal
  }
}

export function getIosHtmlAudioKeepAliveState(): string {
  const el = iosHtmlAudioKeepAlive
  if (!el) return 'not-created'
  if (el.paused) return 'paused'
  return `playing(t=${el.currentTime.toFixed(2)})`
}
