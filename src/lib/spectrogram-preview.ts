import type { ArrangementBlock } from '../../deno/types.ts'
import { isFullProjectBlock, migrateArrangementBlockCode, stripOutputPipes } from './arrangement.ts'

export type SpectrogramPreviewRequest = Pick<ArrangementBlock, 'templateId' | 'code'> & {
  bpm: number
}

export function buildSpectrogramPreviewCode(request: SpectrogramPreviewRequest): string {
  const migratedCode = migrateArrangementBlockCode(request)
  if (isFullProjectBlock(migratedCode)) return migratedCode

  const source = stripOutputPipes(migratedCode).trim() || 'dc(0)'
  return [
    `bpm=${formatNumber(clamp(request.bpm || 120, 20, 260))}`,
    'lm_preview=(_lm_preview_arg)->{',
    '  bt=t',
    indent(source),
    '}',
    'out(lm_preview(0))',
  ].join('\n')
}

function indent(value: string): string {
  return value.split('\n').map(line => `  ${line}`).join('\n')
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : Number(value.toFixed(4)).toString()
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
