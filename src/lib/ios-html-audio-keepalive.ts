let iosHtmlAudioKeepAlive: HTMLAudioElement | null = null
let silentWavUrl: string | null = null
let oscillatorKeepAlive: OscillatorNode | null = null
let oscillatorError: string | null = null

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

  // ~-40 dBFS @ 440Hz — enough for iOS media session; keep native path (not MediaElementSource).
  const amp = 320 // of 32767
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * amp
    view.setInt16(44 + i * 2, sample | 0, true)
  }
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

/**
 * iOS Safari can leave AudioWorklet output silent until another media/Web Audio
 * source is active. Do NOT route HTML audio through MediaElementSource — on iOS
 * that path often stalls (currentTime stuck at 0) and fails to open the session.
 * Play a quiet HTML element on the native path, plus a near-silent OscillatorNode
 * in the AudioContext graph.
 */
export function ensureIosHtmlAudioKeepAlive(ac?: AudioContext | null) {
  if (typeof document === 'undefined') return
  try {
    if (!iosHtmlAudioKeepAlive) {
      silentWavUrl = createQuietToneWavUrl()
      const el = new Audio()
      el.loop = true
      el.preload = 'auto'
      // Quiet but non-zero — native path (not MediaElementSource).
      el.volume = 0.02
      el.muted = false
      el.setAttribute('playsinline', 'true')
      el.setAttribute('webkit-playsinline', 'true')
      el.src = silentWavUrl
      iosHtmlAudioKeepAlive = el
    }

    if (ac && !oscillatorKeepAlive) {
      try {
        const osc = ac.createOscillator()
        const gate = ac.createGain()
        osc.frequency.value = 20
        // Near-silent; keeps the AudioContext graph "hot" for worklet output.
        gate.gain.value = 0.00001
        osc.connect(gate)
        gate.connect(ac.destination)
        osc.start()
        oscillatorKeepAlive = osc
        oscillatorError = null
      }
      catch (error) {
        oscillatorError = error instanceof Error ? error.message : String(error)
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
  const osc = oscillatorKeepAlive
    ? 'osc-alive'
    : oscillatorError
    ? `osc-error(${oscillatorError})`
    : 'osc-pending'
  if (el.paused) return `paused;native;${osc}`
  return `playing(t=${el.currentTime.toFixed(2)});native;${osc}`
}
