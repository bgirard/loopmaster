import { detectSlices } from './detect-slices.ts'

export type Sample = {
  id: number
  channels: Float32Array[]
  length: number
  sampleRate: number
  ready: boolean
  error?: string
}

type SliceCache = {
  threshold: number
  points: Int32Array
  count: number
}

type RecordRequest = {
  projectId: string | null
  seconds: number
  callbackId: number
  sample?: Sample
}

export class SampleManager {
  private samples = new Map<number, Sample>()
  private sampleVersion = new Map<number, number>()
  private sliceCache = new Map<number, Map<number, SliceCache>>()
  private freesoundIds = new Map<number, number>()
  private recordRequests = new Map<number, RecordRequest>()
  private nextHandle = 1

  getSampleVersion(handle: number): number {
    return this.sampleVersion.get(handle) ?? 0
  }

  private bumpVersion(handle: number): void {
    this.sampleVersion.set(handle, (this.sampleVersion.get(handle) ?? 0) + 1)
  }

  registerFreesound(id: number): number {
    for (const [handle, fsId] of this.freesoundIds.entries()) {
      if (fsId === id) return handle
    }

    const handle = this.nextHandle++
    this.freesoundIds.set(handle, id)
    this.samples.set(handle, {
      id: handle,
      channels: [],
      length: 0,
      sampleRate: 44100,
      ready: false,
    })
    return handle
  }

  ensureFreesoundHandle(handle: number, freesoundId: number): void {
    if (this.samples.has(handle)) return
    this.freesoundIds.set(handle, freesoundId)
    this.samples.set(handle, {
      id: handle,
      channels: [],
      length: 0,
      sampleRate: 44100,
      ready: false,
    })
  }

  registerRecord(projectId: string | null, seconds: number, callbackId: number): number {
    const key = `${projectId ?? ''}\0${seconds}\0${callbackId}`
    for (const [handle, req] of this.recordRequests.entries()) {
      const reqKey = `${req.projectId ?? ''}\0${req.seconds}\0${req.callbackId}`
      if (reqKey === key) return handle
    }

    const handle = this.nextHandle++
    this.recordRequests.set(handle, { projectId, seconds, callbackId })
    this.samples.set(handle, {
      id: handle,
      channels: [],
      length: 0,
      sampleRate: 44100,
      ready: false,
    })
    return handle
  }

  ensureRecordHandle(handle: number, seconds: number, callbackId: number, projectId: string | null = null): void {
    if (this.samples.has(handle)) return
    this.recordRequests.set(handle, { projectId, seconds, callbackId })
    this.samples.set(handle, {
      id: handle,
      channels: [],
      length: 0,
      sampleRate: 44100,
      ready: false,
    })
  }

  getFreesoundId(handle: number): number | undefined {
    return this.freesoundIds.get(handle)
  }

  ensureInlineHandle(handle: number): void {
    if (this.samples.has(handle)) return
    this.samples.set(handle, {
      id: handle,
      channels: [],
      length: 0,
      sampleRate: 44100,
      ready: false,
    })
  }

  registerEspeak(): number {
    const handle = this.nextHandle++
    this.samples.set(handle, {
      id: handle,
      channels: [],
      length: 0,
      sampleRate: 44100,
      ready: false,
    })
    return handle
  }

  registerInlineSample(channels: Float32Array[], sampleRate: number): number {
    const handle = this.nextHandle++
    const copiedChannels = channels.map(ch => new Float32Array(ch))
    this.samples.set(handle, {
      id: handle,
      channels: copiedChannels,
      length: copiedChannels[0]?.length ?? 0,
      sampleRate,
      ready: copiedChannels.length > 0 && (copiedChannels[0]?.length ?? 0) > 0,
    })
    this.bumpVersion(handle)
    return handle
  }

  getRecordRequest(handle: number): RecordRequest | undefined {
    return this.recordRequests.get(handle)
  }

  setSampleData(handle: number, channels: Float32Array[], sampleRate: number): void {
    const sample = this.samples.get(handle)
    if (!sample) return

    sample.channels = channels
    sample.length = channels[0]?.length ?? 0
    sample.sampleRate = sampleRate
    sample.ready = channels.length > 0 && (sample.length > 0)
    sample.error = undefined
    this.bumpVersion(handle)
  }

  setSampleError(handle: number, error: string): void {
    const sample = this.samples.get(handle)
    if (!sample) return

    sample.error = error
    sample.ready = false
    this.bumpVersion(handle)
  }

  recordSample(handle: number, audioData: Float32Array[], sampleRate: number): void {
    const sample = this.samples.get(handle)
    if (!sample) return

    sample.channels = audioData.map(ch => new Float32Array(ch))
    sample.length = audioData[0]?.length ?? 0
    sample.sampleRate = sampleRate
    sample.ready = sample.channels.length > 0 && sample.length > 0
    this.bumpVersion(handle)
  }

  getSample(handle: number): Sample | null {
    return this.samples.get(handle) ?? null
  }

  getSlices(handle: number, threshold: number): { points: Int32Array; count: number } {
    const sample = this.samples.get(handle)
    if (!sample || !sample.ready || sample.channels.length === 0) {
      return { points: new Int32Array(1), count: 1 }
    }

    let cacheMap = this.sliceCache.get(handle)
    if (!cacheMap) {
      cacheMap = new Map()
      this.sliceCache.set(handle, cacheMap)
    }

    const thresholdKey = Math.round(threshold * 1000)
    let cached = cacheMap.get(thresholdKey)
    if (cached) return { points: cached.points, count: cached.count }

    const maxSlices = 256
    const result = detectSlices(sample.channels[0], threshold, maxSlices)

    cached = {
      threshold,
      points: result.points,
      count: result.count,
    }
    cacheMap.set(thresholdKey, cached)

    return { points: result.points, count: result.count }
  }

  readChunk(handle: number, channel: number, offset: number, length: number): Float32Array {
    const sample = this.samples.get(handle)
    if (!sample || !sample.ready) {
      return new Float32Array(length)
    }

    const ch = sample.channels[channel]
    if (!ch) {
      return new Float32Array(length)
    }

    const start = Math.max(0, Math.min(offset | 0, ch.length))
    const end = Math.max(start, Math.min(start + length, ch.length))
    const actualLength = end - start

    if (actualLength === 0) {
      return new Float32Array(length)
    }

    const result = new Float32Array(length)
    result.set(ch.subarray(start, end))
    return result
  }

  areAllSamplesReady(): boolean {
    for (const sample of this.samples.values()) {
      if (!sample.ready) return false
    }
    return true
  }

  getRequiredSamples(): number[] {
    return Array.from(this.samples.keys()).filter(handle => {
      const sample = this.samples.get(handle)
      return sample && !sample.ready
    })
  }

  getSampleMemoryInfo(): { handleCount: number; totalChannelBytes: number } {
    let totalChannelBytes = 0
    for (const sample of this.samples.values()) {
      for (const ch of sample.channels) {
        totalChannelBytes += ch.byteLength
      }
    }
    return { handleCount: this.samples.size, totalChannelBytes }
  }

  /** Peak absolute sample value across ready channels (diagnostic: non-zero proves data survived RPC). */
  getDataPeak(): number {
    let peak = 0
    for (const sample of this.samples.values()) {
      if (!sample.ready) continue
      for (const ch of sample.channels) {
        const step = Math.max(1, (ch.length / 256) | 0)
        for (let i = 0; i < ch.length; i += step) {
          const a = Math.abs(ch[i]!)
          if (a > peak) peak = a
        }
      }
    }
    return peak
  }

  clear(): void {
    this.samples.clear()
    this.sampleVersion.clear()
    this.sliceCache.clear()
    this.freesoundIds.clear()
    this.recordRequests.clear()
    this.nextHandle = 1
  }

  // Clear a specific handle, marking it as needing re-fetch/re-record
  clearHandle(handle: number): void {
    const sample = this.samples.get(handle)
    if (sample) {
      sample.channels = []
      sample.length = 0
      sample.ready = false
      sample.error = undefined
    }
    this.bumpVersion(handle)
    this.sliceCache.delete(handle)
  }
}

export const sampleManager = new SampleManager()
