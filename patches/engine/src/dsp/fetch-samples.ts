import { atomic } from '../lib/atomic.ts'
import { sampleManager } from '../lib/sample-manager.ts'
import type { RecordCallback } from '../live/compiler/index.ts'
import type { RecordWorker } from './record-worker.ts'
import type { DspProcessor as DspWorklet } from './worklet.ts'

export async function fetchFreesoundSample(
  ctx: AudioContext,
  id: number,
): Promise<{ channels: Float32Array[]; sampleRate: number }> {
  const url = `https://freesound.cowbell.workers.dev/get?id=${id}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch freesound ${id}: ${response.status}`)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  const channels: Float32Array[] = []
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    channels.push(new Float32Array(audioBuffer.getChannelData(ch)))
  }
  return { channels, sampleRate: audioBuffer.sampleRate }
}

export async function fetchEspeakSample(
  ctx: AudioContext,
  opts: { text: string; variant: string; speed: number; pitch: number },
): Promise<{ channels: Float32Array[]; sampleRate: number }> {
  const base = import.meta.env.VITE_MESPEAK_URL ?? '/mespeak'
  const url = new URL(base, self.location?.origin ?? undefined)
  const speedParam = Math.round(Math.max(0, Math.min(200, opts.speed * 200)))
  const pitchParam = Math.round(Math.max(0, Math.min(100, opts.pitch * 100)))
  url.searchParams.set('text', opts.text)
  url.searchParams.set('variant', opts.variant)
  url.searchParams.set('speed', String(speedParam))
  url.searchParams.set('pitch', String(pitchParam))

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`Failed to fetch espeak sample: ${response.status}`)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  const channels: Float32Array[] = []
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    channels.push(new Float32Array(audioBuffer.getChannelData(ch)))
  }
  return { channels, sampleRate: audioBuffer.sampleRate }
}

export const fetchRequiredSamples = atomic(async (
  audioContext: AudioContext,
  worklet: DspWorklet,
  record: RecordWorker,
  fetchingSamples: Set<number>,
  programId: number,
  getRecordGeneration: (programId: number) => number,
  recordCallbacks?: Map<number, RecordCallback>,
  mainBytecode?: Float32Array,
  onCapturedValues?: (callbackId: number, values: number[]) => void,
) => {
  const generation = getRecordGeneration(programId)
  const required = await worklet.getRequiredSamples()
  const toFetch = required.filter(({ handle }) => !fetchingSamples.has(handle))
  if (toFetch.length === 0) return
  for (const { handle } of toFetch) fetchingSamples.add(handle)
  await Promise.all(
    toFetch.map(async ({ handle, freesoundId, recordSeconds, recordCallbackId }) => {
      if (freesoundId !== undefined) {
        try {
          console.log(`[dsp] Fetching freesound ${freesoundId} for handle ${handle}...`)
          const { channels, sampleRate } = await fetchFreesoundSample(audioContext, freesoundId)
          console.log(
            `[dsp] Fetched freesound ${freesoundId}: ${channels.length} channels, ${
              channels[0]?.length
            } samples at ${sampleRate}Hz`,
          )
          // Safari does not share SharedArrayBuffer over AudioWorklet MessagePort.
          // Send owned Float32Array copies via structured clone instead.
          const ownedChannels = channels.map(ch => new Float32Array(ch))
          await worklet.setSampleDataDirect({ handle, channels: ownedChannels, sampleRate })
          sampleManager.setSampleData(handle, ownedChannels, sampleRate)
          console.log(`[dsp] Set sample data for handle ${handle}`)
        }
        catch (error) {
          const msg = error instanceof Error ? error.message : String(error)
          console.error(`[dsp] Error fetching freesound ${freesoundId}:`, msg)
          await worklet.setSampleError({ handle, error: msg })
          sampleManager.setSampleError(handle, msg)
          throw error
        }
        finally {
          fetchingSamples.delete(handle)
        }
      }
      else if (
        recordSeconds !== undefined
        && recordCallbackId !== undefined
        && recordCallbacks
        && mainBytecode
      ) {
        try {
          const callbackData = recordCallbacks.get(recordCallbackId)
          if (!callbackData) {
            throw new Error(`No callback bytecode found for callback ID ${recordCallbackId}`)
          }
          const sampleRate = 48000
          const numSamples = Math.floor(recordSeconds * sampleRate)
          console.log('[dsp] recordAndSend', handle)
          const capturedValues = await record.recordAndSend({
            handle,
            mainBytecode,
            setupBytecode: callbackData.setup,
            loopBytecode: callbackData.loop,
            captureStoreGlobalIdx: callbackData.captureStoreGlobalIdx,
            recordGlobalIndices: callbackData.recordGlobalIndices,
            defaultParamRecordGlobals: callbackData.defaultParamRecordGlobals,
            callbackId: recordCallbackId,
            useNestedCaptureStore: callbackData.useNestedCaptureStore ?? true,
            numSamples,
            sampleRate,
          })
          if (getRecordGeneration(programId) !== generation) return
          if (onCapturedValues) onCapturedValues(recordCallbackId, capturedValues)
        }
        catch (error) {
          if (getRecordGeneration(programId) !== generation) return
          const msg = error instanceof Error ? error.message : String(error)
          console.error(`[dsp] Error recording sample for callback ${recordCallbackId}:`, msg)
          throw error
        }
        finally {
          fetchingSamples.delete(handle)
        }
      }
    }),
  )
})
