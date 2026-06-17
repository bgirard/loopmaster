import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { controlPipeline } from 'engine/src/live/pipeline.ts'
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
import { dawTemplates, getTemplate, type DawTemplate } from '../src/lib/daw-templates.ts'

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

  it('keeps the Hypnosis community track output routes playable as a block', () => {
    const template = getTemplate('community-c2i73g')
    assert.ok(template)
    const staleCode = template.code
      .replaceAll('rhodes(#1*o4,trig)', 'piano(#1*o4,trig)')
      .replaceAll('supersaw($,7,.035)', 'pad($,every(1/2,1/8))')
      .replaceAll('trig:at(1/8,1/2)', 'trig:every(1/2,1/8)')

    const track = createArrangementTrack({ id: 'track-a' })
    const block = createArrangementBlock({
      id: 'hypnosis',
      trackId: track.id,
      name: template.name,
      code: template.code,
    })
    const code = compileArrangement({
      arrangementVersion: ARRANGEMENT_VERSION,
      bpm: 120,
      tracks: [track],
      blocks: [block],
      generatedCode: '',
    })

    assert.equal((code.match(/\|>\s*out\(/g) ?? []).length, 8)
    assert.match(code, /mix=>compressor\(\$\)\*2\.2\|>limiter\(\$\)/)
    assert.match(code, /trig=tram\('x-x-x-x-'\) sine\(#5\*o2\+10k\*ad\(\.00001,\.02422,100,trig\),trig\)\*ad\(\.001,\.10,10,trig\) \|> out\(\(\$\)\*lm_0_hypnosis_gate\*1\)/)
    assert.match(code, /trig=tram\('xx-'\) tri\(#1\*o2\)\*ad\(\.02,\.3,3,trig\) \|> \$\+delay\(\$,.27,.6\) \|> out\(\(\$\*\.12\)\*lm_0_hypnosis_gate\*1\)/)
    assert.doesNotMatch(code, /lm_0_hypnosis\(\)\*lm_0_hypnosis_gate/)

    const result = controlPipeline.compileSource(code, { projectId: 'hypnosis-community-regression' })
    assert.deepEqual(result.errors, [])
    assert.deepEqual(result.compile.errors, [])
    assert.ok(result.compile.bytecode.length > 0)

    const normalized = normalizeArrangement({
      arrangementVersion: ARRANGEMENT_VERSION,
      bpm: 120,
      tracks: [track],
      blocks: [{
        ...block,
        templateId: 'community-c2i73g',
        code: staleCode,
      }],
      generatedCode: '',
    })

    assert.doesNotMatch(normalized.blocks[0]!.code, /piano|pad\(\$|every\(1\/2,1\/8\)/)
    const staleResult = controlPipeline.compileSource(normalized.generatedCode, { projectId: 'hypnosis-stale-community-regression' })
    assert.deepEqual(staleResult.errors, [])
    assert.deepEqual(staleResult.compile.errors, [])
    assert.ok(staleResult.compile.bytecode.length > 0)
  })

  it('compiles every community template after insertion as a DAW block', () => {
    const failures: string[] = []

    for (const template of dawTemplates.filter(template => template.id.startsWith('community-'))) {
      const code = compileCommunityTemplateAsBlock(template)
      const result = controlPipeline.compileSource(code, { projectId: `community-template-${template.id}` })
      const errors = [
        ...result.errors,
        ...result.compile.errors.map(error => error.message),
      ]

      if (errors.length) {
        failures.push(`${template.id} ${template.name}: ${errors.join('; ')}`)
      }
      else {
        assert.ok(result.compile.bytecode.length > 0)
      }
    }

    assert.deepEqual(failures, [])
  })

  it('migrates stale Agony community blocks using legacy two-argument every calls', () => {
    const template = getTemplate('community-66d79i')
    assert.ok(template)
    const staleCode = template.code.replace('trig=at(2.25/16,1/2)', 'trig=every(1/2,2.25/16)')
    const track = createArrangementTrack({ id: 'track-a' })
    const normalized = normalizeArrangement({
      arrangementVersion: ARRANGEMENT_VERSION,
      bpm: 120,
      tracks: [track],
      blocks: [
        createArrangementBlock({
          id: 'agony',
          trackId: track.id,
          name: template.name,
          templateId: template.id,
          code: staleCode,
        }),
      ],
      generatedCode: '',
    })

    assert.match(normalized.blocks[0]!.code, /trig=at\(2\.25\/16,1\/2\)/)
    assert.doesNotMatch(normalized.blocks[0]!.code, /every\(1\/2,2\.25\/16\)/)

    const result = controlPipeline.compileSource(normalized.generatedCode, { projectId: 'agony-stale-community-regression' })
    assert.deepEqual(result.errors, [])
    assert.deepEqual(result.compile.errors, [])
    assert.ok(result.compile.bytecode.length > 0)
  })
})

function compileCommunityTemplateAsBlock(template: DawTemplate): string {
  const track = createArrangementTrack({ id: 'track-a' })
  return compileArrangement({
    arrangementVersion: ARRANGEMENT_VERSION,
    bpm: 120,
    tracks: [track],
    blocks: [
      createArrangementBlock({
        id: template.id.replace(/-/g, '_'),
        trackId: track.id,
        name: template.name,
        templateId: template.id,
        code: template.code,
      }),
    ],
    generatedCode: '',
  })
}
