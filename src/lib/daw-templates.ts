import type { ArrangementBlock } from '../../deno/types.ts'

export type TemplateParam = {
  name: string
  label: string
  type: 'text' | 'number'
  defaultValue: string | number
}

export type DawTemplate = {
  id: string
  name: string
  category: string
  color: string
  defaultLengthBars: number
  code: string
  previewCode?: string
  params: TemplateParam[]
}

export const dawTemplates: DawTemplate[] = [
  {
    id: 'drums-four-on-floor',
    name: 'Four-on-floor kit',
    category: 'Drums',
    color: '#fb7185',
    defaultLengthBars: 4,
    code: 'drums({{seed}})',
    previewCode: 'drums(1) |> out($)',
    params: [{ name: 'seed', label: 'Seed', type: 'number', defaultValue: 1 }],
  },
  {
    id: 'drums-hat-grid',
    name: 'Hat pulse',
    category: 'Drums',
    color: '#f97316',
    defaultLengthBars: 2,
    code: 'ch(width:{{width}},trig:every({{rate}}))*.5',
    previewCode: 'ch(width:.75,trig:every(1/16))*.5 |> out($)',
    params: [
      { name: 'width', label: 'Width', type: 'number', defaultValue: 0.75 },
      { name: 'rate', label: 'Rate', type: 'text', defaultValue: '1/16' },
    ],
  },
  {
    id: 'bass-walk',
    name: 'Walking bass',
    category: 'Bass',
    color: '#38bdf8',
    defaultLengthBars: 4,
    code: "root='{{root}}'\nscale='{{scale}}'\n;[#1,#3,#5,#7][bt*{{speed}}] |> ntof($)*o{{octave}} |> saw($)*ad(trig:every({{rate}}))*.25 |> lp($,{{cutoff}},1)",
    previewCode: "root='c3'\nscale='minor'\n;[#1,#3,#5,#7][t*2] |> ntof($)*o1 |> saw($)*ad(trig:every(1/8))*.25 |> lp($,900,1) |> out($)",
    params: [
      { name: 'root', label: 'Root', type: 'text', defaultValue: 'c3' },
      { name: 'scale', label: 'Scale', type: 'text', defaultValue: 'minor' },
      { name: 'speed', label: 'Speed', type: 'number', defaultValue: 2 },
      { name: 'rate', label: 'Rate', type: 'text', defaultValue: '1/8' },
      { name: 'octave', label: 'Octave', type: 'number', defaultValue: 1 },
      { name: 'cutoff', label: 'Cutoff', type: 'number', defaultValue: 900 },
    ],
  },
  {
    id: 'melody-pluck',
    name: 'Pluck melody',
    category: 'Melody',
    color: '#a78bfa',
    defaultLengthBars: 4,
    code: "root='{{root}}'\nscale='{{scale}}'\n;[{{notes}}][bt*{{speed}}] |> ntof($) |> tri($)*ad(.002,.25,trig:every({{rate}}))*.35",
    previewCode: "root='c4'\nscale='major'\n;[#1,#3,#5,#8][t*2] |> ntof($) |> tri($)*ad(.002,.25,trig:every(1/8))*.35 |> out($)",
    params: [
      { name: 'root', label: 'Root', type: 'text', defaultValue: 'c4' },
      { name: 'scale', label: 'Scale', type: 'text', defaultValue: 'major' },
      { name: 'notes', label: 'Notes', type: 'text', defaultValue: '#1,#3,#5,#8' },
      { name: 'speed', label: 'Speed', type: 'number', defaultValue: 2 },
      { name: 'rate', label: 'Rate', type: 'text', defaultValue: '1/8' },
    ],
  },
  {
    id: 'pad-slow',
    name: 'Slow pad',
    category: 'Pads',
    color: '#34d399',
    defaultLengthBars: 8,
    code: "root='{{root}}'\nscale='{{scale}}'\n([#1,#3,#5,#7]*o{{octave}}).map(saw).avg()*timeline('1,0 2,1e2 7,1 8,0e2',{{color}})*.18 |> lp($,{{cutoff}},1)",
    previewCode: "root='c3'\nscale='major'\n([#1,#3,#5,#7]*o1).map(saw).avg()*timeline('1,0 2,1e2 7,1 8,0e2',2)*.18 |> lp($,1200,1) |> out($)",
    params: [
      { name: 'root', label: 'Root', type: 'text', defaultValue: 'c3' },
      { name: 'scale', label: 'Scale', type: 'text', defaultValue: 'major' },
      { name: 'octave', label: 'Octave', type: 'number', defaultValue: 1 },
      { name: 'cutoff', label: 'Cutoff', type: 'number', defaultValue: 1200 },
      { name: 'color', label: 'Color', type: 'number', defaultValue: 2 },
    ],
  },
  {
    id: 'fx-riser',
    name: 'Noise riser',
    category: 'FX',
    color: '#facc15',
    defaultLengthBars: 4,
    code: "white({{seed}})*timeline('1,0 4,1e2 -',{{color}}) |> hp($,200+8k*timeline('1,0 4,1e2 -',{{color}}),1)*.25",
    previewCode: "white(4)*timeline('1,0 4,1e2 -',2) |> hp($,200+8k*timeline('1,0 4,1e2 -',2),1)*.25 |> out($)",
    params: [
      { name: 'seed', label: 'Seed', type: 'number', defaultValue: 4 },
      { name: 'color', label: 'Color', type: 'number', defaultValue: 2 },
    ],
  },
]

export function getTemplate(id: string | undefined): DawTemplate | undefined {
  return id ? dawTemplates.find(template => template.id === id) : undefined
}

export function defaultTemplateParams(template: DawTemplate): ArrangementBlock['params'] {
  return Object.fromEntries(template.params.map(param => [param.name, param.defaultValue]))
}

export function renderTemplateCode(template: DawTemplate, params: ArrangementBlock['params']): string {
  return template.code.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(params[key] ?? ''))
}
