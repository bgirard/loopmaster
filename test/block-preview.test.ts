import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createBlockEditorPreviewCode,
  mapPreviewColumnToVisible,
} from '../src/lib/block-preview.ts'

describe('DAW block editor preview', () => {
  it('adds preview output to the last editable line and shifts local time', () => {
    const code = createBlockEditorPreviewCode('// comment\nfreq=t*2\nsine(freq)', 2, 3.125)

    assert.equal(code, 'bt=t+4.5\n// comment\nfreq=bt*2\nsine(freq) |> out($)')
  })

  it('does not append another output when the block already outputs audio', () => {
    const code = createBlockEditorPreviewCode('sine(t) |> out($)', 0, 0.25)

    assert.equal(code, 'bt=t+1\nsine(bt) |> out($)')
  })

  it('falls back to silence for empty blocks', () => {
    const code = createBlockEditorPreviewCode('// only a comment', 0, 0)

    assert.equal(code, 'bt=t+0\ndc(0) |> out($)')
  })

  it('maps widget columns from preview bt back to visible t', () => {
    const visible = 'sine(t) + attack'
    const preview = 'sine(bt) + attack'

    assert.equal(mapPreviewColumnToVisible(preview, visible, 6), 6)
    assert.equal(mapPreviewColumnToVisible(preview, visible, 9), 8)
  })
})
