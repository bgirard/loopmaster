import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { Arrangement } from '../deno/types.ts'
import {
  ARRANGEMENT_VERSION,
  DEFAULT_ARRANGEMENT_LENGTH_BARS,
  MAX_LANE_HEIGHT,
  MIN_LANE_HEIGHT,
  clampLaneHeight,
  compileArrangement,
  createArrangementBlock,
  createArrangementTrack,
  createDefaultArrangement,
  getArrangementLengthBars,
  normalizeArrangement,
  snapBar,
} from '../src/lib/arrangement.ts'

describe('DAW arrangement model', () => {
  it('creates a default arrangement from legacy code and strips direct outputs', () => {
    const arrangement = createDefaultArrangement('sine(440) |> out($)')

    assert.equal(arrangement.arrangementVersion, ARRANGEMENT_VERSION)
    assert.equal(arrangement.bpm, 120)
    assert.equal(arrangement.tracks.length, 1)
    assert.equal(arrangement.blocks.length, 1)
    assert.equal(arrangement.blocks[0]!.name, 'Legacy code')
    assert.equal(arrangement.blocks[0]!.code, 'sine(440)')
    assert.match(arrangement.generatedCode, /sine\(440\)/)
    assert.match(arrangement.generatedCode, /\|> out\(\$\)/)
  })

  it('normalizes corrupt arrangement data into editable DAW state', () => {
    const sourceTrack = createArrangementTrack({ id: 'track-a', height: 999, order: undefined })
    const source: Arrangement = {
      arrangementVersion: 0,
      bpm: Number.NaN,
      tracks: [sourceTrack],
      blocks: [
        createArrangementBlock({
          id: 'block-a',
          trackId: 'missing-track',
          startBar: -2,
          lengthBars: -1,
          code: 'sine(t)',
        }),
      ],
      generatedCode: 'stale',
    }

    const normalized = normalizeArrangement(source)

    assert.equal(normalized.arrangementVersion, ARRANGEMENT_VERSION)
    assert.equal(normalized.bpm, 120)
    assert.equal(normalized.tracks[0]!.height, MAX_LANE_HEIGHT)
    assert.equal(normalized.blocks[0]!.trackId, 'track-a')
    assert.equal(normalized.blocks[0]!.startBar, 0)
    assert.equal(normalized.blocks[0]!.lengthBars, 0.25)
    assert.notEqual(normalized.generatedCode, 'stale')
    assert.match(normalized.generatedCode, /bt=t-0\n  sine\(bt\)/)
  })

  it('snaps bars and clamps lane heights to DAW limits', () => {
    assert.equal(snapBar(1.12), 1)
    assert.equal(snapBar(1.13), 1.25)
    assert.equal(snapBar(-1), 0)
    assert.equal(clampLaneHeight(1), MIN_LANE_HEIGHT)
    assert.equal(clampLaneHeight(999), MAX_LANE_HEIGHT)
    assert.equal(clampLaneHeight(80), 80)
  })

  it('calculates arrangement length from the furthest block end', () => {
    const track = createArrangementTrack({ id: 'track-a' })
    const arrangement: Arrangement = {
      arrangementVersion: ARRANGEMENT_VERSION,
      bpm: 120,
      tracks: [track],
      blocks: [
        createArrangementBlock({ trackId: track.id, startBar: 20.25, lengthBars: 2.5 }),
      ],
      generatedCode: '',
    }

    assert.equal(getArrangementLengthBars(arrangement), 24)
    assert.equal(getArrangementLengthBars({ ...arrangement, blocks: [] }), DEFAULT_ARRANGEMENT_LENGTH_BARS)
  })
})

describe('DAW arrangement compiler', () => {
  it('generates gated block code with local beat time and clamped gain', () => {
    const track = createArrangementTrack({ id: 'track-a', name: 'Lead Lane', volume: 1.5 })
    const block = createArrangementBlock({
      id: 'block.1',
      trackId: track.id,
      name: "Lead's rise",
      startBar: 1.25,
      lengthBars: 0.5,
      volume: 2,
      code: 'attack=1\nsine(t)+t |> out($)',
    })
    const code = compileArrangement({
      arrangementVersion: ARRANGEMENT_VERSION,
      bpm: 127.333333,
      tracks: [track],
      blocks: [block],
      generatedCode: '',
    })

    assert.match(code, /bpm=127\.3333/)
    assert.match(code, /\/\/ Lane: Lead Lane/)
    assert.match(code, /label\(2\.25,'Lead\\'s rise',0\)/)
    assert.match(code, /lm_0_block_1_gate=step\(5,t\)\*\(1-step\(7,t\)\)/)
    assert.match(code, /bt=t-5\n  attack=1\n  sine\(bt\)\+bt/)
    assert.match(code, /lm_0_block_1\(\)\*lm_0_block_1_gate\*2 \|> out\(\$\)/)
  })

  it('filters muted blocks, muted lanes, and non-soloed lanes', () => {
    const drums = createArrangementTrack({ id: 'drums', name: 'Drums', order: 1 })
    const bass = createArrangementTrack({ id: 'bass', name: 'Bass', order: 0, soloed: true })
    const muted = createArrangementTrack({ id: 'muted', name: 'Muted', order: 2, muted: true })
    const code = compileArrangement({
      arrangementVersion: ARRANGEMENT_VERSION,
      bpm: 120,
      tracks: [drums, bass, muted],
      blocks: [
        createArrangementBlock({ id: 'drum-block', trackId: drums.id, name: 'Drums', code: 'drums()' }),
        createArrangementBlock({ id: 'bass-block', trackId: bass.id, name: 'Bass', code: 'saw(55)' }),
        createArrangementBlock({ id: 'muted-block', trackId: muted.id, name: 'Muted', code: 'white()' }),
        createArrangementBlock({ id: 'quiet-block', trackId: bass.id, name: 'Quiet', code: 'sine(1)', muted: true }),
      ],
      generatedCode: '',
    })

    assert.match(code, /\/\/ Lane: Bass\n\/\/ Lane: Drums\n\/\/ Lane: Muted/)
    assert.match(code, /saw\(55\)/)
    assert.doesNotMatch(code, /drums\(\)/)
    assert.doesNotMatch(code, /white\(\)/)
    assert.doesNotMatch(code, /sine\(1\)/)
  })

  it('renders silence when no blocks are audible', () => {
    const track = createArrangementTrack({ id: 'track-a', muted: true })
    const code = compileArrangement({
      arrangementVersion: ARRANGEMENT_VERSION,
      bpm: 120,
      tracks: [track],
      blocks: [createArrangementBlock({ trackId: track.id, code: 'sine(440)' })],
      generatedCode: '',
    })

    assert.match(code, /silence=dc\(0\)\nsilence \|> out\(\$\)$/)
  })
})
