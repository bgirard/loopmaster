import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  dawTemplates,
  defaultTemplateParams,
  getTemplate,
  renderTemplateCode,
  type DawTemplate,
} from '../src/lib/daw-templates.ts'

describe('DAW templates', () => {
  it('includes built-in and community templates with stable ids', () => {
    assert.ok(dawTemplates.length > 20)
    assert.ok(getTemplate('drums-four-on-floor'))
    assert.ok(dawTemplates.some(template => template.id.startsWith('community-')))
  })

  it('builds default params from template declarations', () => {
    const template = getTemplate('bass-acid-line')
    assert.ok(template)

    const params = defaultTemplateParams(template)

    assert.equal(params.root, 'c3')
    assert.equal(params.scale, 'minor')
    assert.equal(params.cutoff, 260)
    assert.equal(params.gain, 0.45)
  })

  it('renders code with explicit params and blanks missing params', () => {
    const template: DawTemplate = {
      id: 'custom',
      name: 'Custom',
      category: 'Tests',
      color: '#fff',
      defaultLengthBars: 4,
      code: "root='{{root}}'\nseed={{seed}}\nmissing='{{missing}}'",
      params: [],
    }

    assert.equal(
      renderTemplateCode(template, { root: 'd2', seed: 9 }),
      "root='d2'\nseed=9\nmissing=''",
    )
  })
})
