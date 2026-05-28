export function createBlockEditorPreviewCode(code: string, startBar: number, playheadBar: number): string {
  const localBeat = quantizePreviewBeat(Math.max(0, playheadBar - startBar) * 4)
  const shifted = code.replace(/\bt\b/g, 'bt')
  if (/\|>\s*(?:out|outs|solo|sout)\s*\(/.test(shifted)) {
    return `bt=t+${formatPreviewNumber(localBeat)}\n${shifted}`
  }
  const lines = code.split('\n')
  const lineIndex = findLastEditableCodeLine(lines)
  if (lineIndex < 0) return `bt=t+${formatPreviewNumber(localBeat)}\ndc(0) |> out($)`
  lines[lineIndex] = `${lines[lineIndex]} |> out($)`
  return `bt=t+${formatPreviewNumber(localBeat)}\n${lines.join('\n').replace(/\bt\b/g, 'bt')}`
}

export function mapPreviewColumnToVisible(previewLine: string, visibleLine: string, previewColumn: number): number {
  let previewIndex = 0
  let visibleIndex = 0
  const previewTarget = Math.max(0, previewColumn - 1)

  while (previewIndex < previewTarget && visibleIndex < visibleLine.length) {
    if (
      visibleLine[visibleIndex] === 't'
      && isWordBoundary(visibleLine[visibleIndex - 1])
      && isWordBoundary(visibleLine[visibleIndex + 1])
      && previewLine.slice(previewIndex, previewIndex + 2) === 'bt'
    ) {
      previewIndex += 2
      visibleIndex += 1
      continue
    }
    previewIndex += 1
    visibleIndex += 1
  }

  return visibleIndex + 1
}

function quantizePreviewBeat(value: number): number {
  return Math.round(value * 64) / 64
}

function formatPreviewNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : Number(value.toFixed(4)).toString()
}

function findLastEditableCodeLine(lines: string[]): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i]!.trim()
    if (trimmed && !trimmed.startsWith('//')) return i
  }
  return -1
}

function isWordBoundary(value: string | undefined): boolean {
  return value == null || !/[A-Za-z0-9_]/.test(value)
}
