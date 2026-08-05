let iosHtmlAudioKeepAlive: HTMLAudioElement | null = null
let silentWavUrl: string | null = null
let mediaSourceConnected = false
let mediaSourceError: string | null = null

function createQuietToneWavUrl(): string {
  // ~0.5s mono quiet sine @ 22050Hz — pure digital silence is sometimes ignored by iOS.
  const sampleRate = 22050
  const numSamples = Math.floor(sampleRate / 2)
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

  // ~-60 dBFS @ 440Hz — enough for iOS media pipeline, inaudible once gain-gated.
  const amp = 32 // of 32767
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * amp
    view.setInt16(44 + i * 2, sample | 0, true)
  }
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

/**
 * iOS 18 Safari can leave AudioWorklet output silent even when AudioContext is
 * "running" until an HTMLMediaElement is also playing. Prefer routing that
 * element into the AudioContext (MediaElementSource) — disconnected HTML audio
 * alone often fails to open the hardware path.
 */
export function ensureIosHtmlAudioKeepAlive(ac?: AudioContext | null) {
  if (typeof document === 'undefined') return
  try {
    if (!iosHtmlAudioKeepAlive) {
      silentWavUrl = createQuietToneWavUrl()
      const el = new Audio()
      el.loop = true
      el.preload = 'auto'
      el.volume = 1
      el.muted = false
      el.setAttribute('playsinline', 'true')
      el.setAttribute('webkit-playsinline', 'true')
      el.src = silentWavUrl
      iosHtmlAudioKeepAlive = el
    }

    if (ac && !mediaSourceConnected && iosHtmlAudioKeepAlive) {
      try {
        const source = ac.createMediaElementSource(iosHtmlAudioKeepAlive)
        const gate = ac.createGain()
        // Non-zero so the graph stays "hot"; still inaudible with the quiet WAV.
        gate.gain.value = 0.0001
        source.connect(gate)
        gate.connect(ac.destination)
        mediaSourceConnected = true
        mediaSourceError = null
      }
      catch (error) {
        mediaSourceError = error instanceof Error ? error.message : String(error)
      }
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
  const graph = mediaSourceConnected
    ? 'graph-connected'
    : mediaSourceError
    ? `graph-error(${mediaSourceError})`
    : 'graph-pending'
  if (el.paused) return `paused;${graph}`
  return `playing(t=${el.currentTime.toFixed(2)});${graph}`
}
