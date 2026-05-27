import {
  CopyIcon,
  FloppyDiskBackIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  PlusIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { useSignal } from '@preact/signals'
import { createDoc } from 'editor'
import { useEffect, useRef, useState } from 'preact/hooks'
import type { Arrangement, ArrangementBlock, ArrangementTrack, OneLiner } from '../../deno/types.ts'
import { api } from '../api.ts'
import type { DspProgramContext } from '../dsp.ts'
import { useReactiveEffect } from '../hooks/useReactiveEffect.ts'
import {
  createArrangementBlock,
  createArrangementTrack,
  getArrangementLengthBars,
  snapBar,
} from '../lib/arrangement.ts'
import {
  dawTemplates,
  defaultTemplateParams,
  type DawTemplate,
  getTemplate,
  renderTemplateCode,
} from '../lib/daw-templates.ts'
import {
  currentProject,
  currentProgramContext,
  ctx,
  getProgramContext,
  inlineTransport,
  isPlaying,
  playingInlineContext,
  primaryColor,
  saveProject,
  theme,
  transport,
  transportReady,
  updateProjectArrangement,
} from '../state.ts'
import { tokenize } from '../lib/tokenizer.ts'
import { BEATS_PER_BAR } from '../widgets/constants.ts'
import { PlayGradientIcon, StopGradientIcon } from './Icons.tsx'
import { Nav } from './Nav.tsx'

const basePxPerBar = 76
const minTimelineZoom = 0.75
const maxTimelineZoom = 4
const timelineZoomStep = 0.25
const laneHeaderWidth = 180
const laneHeight = 72
const timelineCursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M2 12h20M7 6l-5 6 5 6M17 6l5 6-5 6\' fill=\'none\' stroke=\'%23fff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 12 12, ew-resize'

type LibraryItem =
  | { kind: 'template'; template: DawTemplate }
  | { kind: 'one-liner'; oneLiner: OneLiner }

type DropPreview = {
  index: number
  startBar: number
  x: number
  y: number
  color: string
  title: string
  lengthBars: number
}

export const Daw = () => {
  const selectedBlockId = useSignal<string | null>(null)
  const selectedLibraryId = useSignal<string>('drums-four-on-floor')
  const seekPreviewSeconds = useSignal<number | null>(null)
  const dropPreview = useSignal<DropPreview | null>(null)
  const timelineZoom = useSignal(1)
  const oneLiners = useSignal<OneLiner[]>([])
  const loadingOneLiners = useSignal(false)

  useEffect(() => {
    loadingOneLiners.value = true
    api.fetchBrowseOneLiners()
      .then(result => {
        oneLiners.value = result.slice(0, 24)
      })
      .catch(() => {
        oneLiners.value = []
      })
      .finally(() => {
        loadingOneLiners.value = false
      })
  }, [])

  const project = currentProject.value
  if (!project) {
    return <div class="h-full bg-black text-white/60" />
  }

  const arrangement = project.arrangement
  const tracks = [...arrangement.tracks].sort((a, b) => a.order - b.order)
  const selectedBlock = arrangement.blocks.find(block => block.id === selectedBlockId.value)
    ?? arrangement.blocks[0]
    ?? null
  if (selectedBlock && selectedBlockId.value !== selectedBlock.id) selectedBlockId.value = selectedBlock.id

  const arrangementLength = getArrangementLengthBars(arrangement)
  const pxPerBar = basePxPerBar * timelineZoom.value
  const timelineWidth = arrangementLength * pxPerBar
  const playheadSeconds = seekPreviewSeconds.value ?? currentProgramContext.value?.timeSeconds.value ?? 0
  const playheadBar = (playheadSeconds * arrangement.bpm) / (BEATS_PER_BAR * 60)
  const playheadX = Math.max(0, Math.min(timelineWidth, playheadBar * pxPerBar))
  const selectedLibraryItem = getLibraryItem(selectedLibraryId.value, oneLiners.value)

  const commit = (updater: (next: Arrangement) => void) => {
    updateProjectArrangement(project, updater)
  }

  const barToSeconds = (bar: number) => bar * BEATS_PER_BAR * 60 / arrangement.bpm

  const setTimelineZoom = (value: number) => {
    const stepped = Math.round(value / timelineZoomStep) * timelineZoomStep
    timelineZoom.value = clampNumber(stepped, minTimelineZoom, maxTimelineZoom)
  }

  const beginTimelineSeek = (event: MouseEvent) => {
    if (!transportReady.value) return
    event.preventDefault()
    event.stopPropagation()

    const target = event.currentTarget as HTMLElement
    const bounds = target.getBoundingClientRect()
    const seekAtClientX = (clientX: number) => {
      const ratio = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width))
      const seconds = barToSeconds(ratio * arrangementLength)
      seekPreviewSeconds.value = seconds
      ctx.value!.targetSeconds.value = seconds
      return transport.seek(seconds)
    }

    void (async () => {
      await transport.beginSeek()
      await seekAtClientX(event.clientX)
    })()

    const handleMove = (moveEvent: MouseEvent) => {
      void seekAtClientX(moveEvent.clientX)
    }
    const handleUp = () => {
      void transport.endSeek().finally(() => {
        requestAnimationFrame(() => {
          seekPreviewSeconds.value = null
        })
      })
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = timelineCursor
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const addLane = () => {
    commit(next => {
      const order = next.tracks.reduce((max, track) => Math.max(max, track.order), -1) + 1
      next.tracks.push(createArrangementTrack({
        name: `Lane ${order + 1}`,
        order,
        color: palette[order % palette.length]!,
      }))
    })
  }

  const createBlockFromLibraryItem = (item: LibraryItem, trackId: string, startBar: number) => {
    if (item.kind === 'template') {
      const params = defaultTemplateParams(item.template)
      return createArrangementBlock({
        trackId,
        startBar,
        lengthBars: item.template.defaultLengthBars,
        name: item.template.name,
        color: item.template.color,
        templateId: item.template.id,
        params,
        code: renderTemplateCode(item.template, params),
      })
    }

    return createArrangementBlock({
      trackId,
      startBar,
      lengthBars: 4,
      name: 'One-liner',
      color: '#f472b6',
      code: item.oneLiner.code,
    })
  }

  const addBlockFromLibraryItem = (item: LibraryItem) => {
    const track = selectedBlock
      ? arrangement.tracks.find(t => t.id === selectedBlock.trackId) ?? tracks[0]
      : tracks[0]
    if (!track) return
    let createdId = ''
    commit(next => {
      const block = createBlockFromLibraryItem(item, track.id, getNextBlockStart(next, track.id))
      createdId = block.id
      next.blocks.push(block)
    })
    selectedBlockId.value = createdId
  }

  const addDraggedLibraryItem = (item: LibraryItem, preview: DropPreview) => {
    let createdId = ''
    commit(next => {
      const ordered = [...next.tracks].sort((a, b) => a.order - b.order)
      const track = createArrangementTrack({
        name: item.kind === 'template' ? item.template.name : 'One-liner',
        color: preview.color,
      })
      ordered.splice(preview.index, 0, track)
      ordered.forEach((lane, order) => lane.order = order)
      next.tracks = ordered
      const block = createBlockFromLibraryItem(item, track.id, preview.startBar)
      createdId = block.id
      next.blocks.push(block)
    })
    selectedBlockId.value = createdId
  }

  const startLibraryDrag = (itemId: string, event: DragEvent) => {
    const item = getLibraryItem(itemId, oneLiners.value)
    if (!item) return
    selectedLibraryId.value = itemId
    event.dataTransfer?.setData('application/x-loopmaster-library-item', itemId)
    event.dataTransfer?.setData('text/plain', getLibraryTitle(item))
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'
  }

  const updateDropPreview = (event: DragEvent) => {
    const itemId = event.dataTransfer?.getData('application/x-loopmaster-library-item') || selectedLibraryId.value
    const item = getLibraryItem(itemId, oneLiners.value)
    if (!item) {
      dropPreview.value = null
      return null
    }

    const target = event.currentTarget as HTMLElement
    const bounds = target.getBoundingClientRect()
    const index = Math.max(0, Math.min(tracks.length, Math.round((event.clientY - bounds.top) / laneHeight)))
    const rawX = event.clientX - bounds.left - laneHeaderWidth
    const startBar = snapBar(rawX / pxPerBar)
    const lengthBars = getLibraryLengthBars(item)
    const preview = {
      index,
      startBar,
      x: Math.max(0, startBar * pxPerBar),
      y: index * laneHeight,
      color: getLibraryColor(item),
      title: getLibraryTitle(item),
      lengthBars,
    }
    dropPreview.value = preview
    return { item, preview }
  }

  const onDropLibraryItem = (event: DragEvent) => {
    event.preventDefault()
    const result = updateDropPreview(event)
    dropPreview.value = null
    if (!result) return
    addDraggedLibraryItem(result.item, result.preview)
  }

  return (
    <div class="h-full min-h-0 flex flex-col text-white" style={{ backgroundColor: theme.value.black }}>
      <div class="relative h-[50px] shrink-0">
        <Nav ready={transportReady.value} />
        <div class="absolute left-[150px] right-4 top-0 h-[48px] flex items-center justify-between pointer-events-none">
          <div class="pointer-events-auto flex items-center gap-3 min-w-0">
            <input
              class="bg-transparent text-lg font-bold outline-none text-white min-w-0 w-64"
              value={project.name}
              onInput={e => {
                project.name = (e.target as HTMLInputElement).value
              }}
            />
            <label class="text-xs text-white/50 flex items-center gap-2">
              BPM
              <input
                class="w-16 bg-white/5 border border-white/10 px-2 py-1 text-white outline-none"
                type="number"
                value={arrangement.bpm}
                onInput={e => {
                  const bpm = Number((e.target as HTMLInputElement).value) || 120
                  commit(next => {
                    next.bpm = Math.max(20, Math.min(260, bpm))
                  })
                }}
              />
            </label>
          </div>
          <button
            class="pointer-events-auto flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => saveProject(project)}
          >
            <FloppyDiskBackIcon size={16} />
            Save
          </button>
        </div>
      </div>

      <div class="flex-1 min-h-0 flex">
        <aside class="w-[300px] shrink-0 border-r border-white/10 min-h-0 flex flex-col">
          <div class="h-11 px-3 flex items-center justify-between border-b border-white/10">
            <span class="text-sm font-semibold text-white/80">Templates</span>
            {loadingOneLiners.value && <span class="text-xs text-white/35">Loading</span>}
          </div>
          <div class="flex-1 min-h-0 overflow-y-auto p-3 space-y-4">
            {groupTemplates().map(group => (
              <section key={group.category}>
                <h3 class="text-[11px] uppercase tracking-[0.12em] text-white/35 mb-2">{group.category}</h3>
                <div class="space-y-1">
                  {group.items.map(template => (
                    <LibraryButton
                      key={template.id}
                      selected={selectedLibraryId.value === template.id}
                      color={template.color}
                      title={template.name}
                      subtitle={`${template.defaultLengthBars} bars`}
                      onSelect={() => selectedLibraryId.value = template.id}
                      onAdd={() => addBlockFromLibraryItem({ kind: 'template', template })}
                      onDragStart={event => startLibraryDrag(template.id, event)}
                    />
                  ))}
                </div>
              </section>
            ))}
            {!!oneLiners.value.length && (
              <section>
                <h3 class="text-[11px] uppercase tracking-[0.12em] text-white/35 mb-2">Community</h3>
                <div class="space-y-1">
                  {oneLiners.value.map(oneLiner => (
                    <LibraryButton
                      key={oneLiner.id}
                      selected={selectedLibraryId.value === `one-liner:${oneLiner.id}`}
                      color="#f472b6"
                      title="One-liner"
                      subtitle={oneLiner.code.split('\n').find(Boolean)?.slice(0, 36) || 'Community code'}
                      onSelect={() => selectedLibraryId.value = `one-liner:${oneLiner.id}`}
                      onAdd={() => addBlockFromLibraryItem({ kind: 'one-liner', oneLiner })}
                      onDragStart={event => startLibraryDrag(`one-liner:${oneLiner.id}`, event)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
          <div class="border-t border-white/10 p-3 min-h-[190px]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-white/70">Audition</span>
              {selectedLibraryItem && (
                <button
                  class="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 text-white/70"
                  onClick={() => {
                    addBlockFromLibraryItem(selectedLibraryItem)
                  }}
                >
                  Add block
                </button>
              )}
            </div>
            {selectedLibraryItem && (
              <TemplateAudition
                id={selectedLibraryId.value}
                code={getPreviewCode(selectedLibraryItem)}
              />
            )}
          </div>
        </aside>

        <main class="flex-1 min-w-0 min-h-0 flex flex-col">
          <div class="flex-1 min-h-0 overflow-auto">
            <div class="sticky top-0 z-20 flex h-9 border-b border-white/10" style={{ backgroundColor: theme.value.black }}>
              <div class="shrink-0 border-r border-white/10 px-3 flex items-center justify-between"
                style={{ width: laneHeaderWidth }}
              >
                <span class="text-xs uppercase tracking-[0.12em] text-white/35">Lanes</span>
                <div class="flex items-center gap-1">
                  <button
                    class="p-1 text-white/45 hover:text-white disabled:opacity-30"
                    disabled={timelineZoom.value <= minTimelineZoom}
                    onClick={() => setTimelineZoom(timelineZoom.value - timelineZoomStep)}
                    title="Zoom out"
                  >
                    <MagnifyingGlassMinusIcon size={15} />
                  </button>
                  <input
                    class="w-14 accent-white"
                    type="range"
                    min={minTimelineZoom}
                    max={maxTimelineZoom}
                    step={timelineZoomStep}
                    value={timelineZoom.value}
                    aria-label="Timeline zoom"
                    title={`${Math.round(timelineZoom.value * 100)}%`}
                    onInput={event => setTimelineZoom(Number((event.target as HTMLInputElement).value))}
                  />
                  <button
                    class="p-1 text-white/45 hover:text-white disabled:opacity-30"
                    disabled={timelineZoom.value >= maxTimelineZoom}
                    onClick={() => setTimelineZoom(timelineZoom.value + timelineZoomStep)}
                    title="Zoom in"
                  >
                    <MagnifyingGlassPlusIcon size={15} />
                  </button>
                  <button class="p-1 text-white/50 hover:text-white" onClick={addLane} title="Add lane">
                    <PlusIcon size={16} />
                  </button>
                </div>
              </div>
              <div
                class="relative h-full shrink-0 select-none"
                title="Click or drag to seek"
                onMouseDown={beginTimelineSeek}
                style={{ width: timelineWidth, cursor: timelineCursor }}
              >
                <div class="absolute top-0 bottom-0 z-20 w-0.5 pointer-events-none" style={{ left: playheadX, backgroundColor: primaryColor.value }} />
                {Array.from({ length: arrangementLength + 1 }).map((_, bar) => (
                  <div key={bar} class="absolute top-0 bottom-0 border-l border-white/10 pointer-events-none"
                    style={{ left: bar * pxPerBar }}
                  >
                    <span class="absolute left-1 top-2 text-[10px] text-white/35">{bar + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              class={`relative ${dropPreview.value ? 'bg-white/[0.02]' : ''}`}
              style={{ minHeight: (tracks.length + 1) * laneHeight }}
              onDragOver={event => {
                if (!event.dataTransfer) return
                event.preventDefault()
                event.dataTransfer.dropEffect = 'copy'
                updateDropPreview(event)
              }}
              onDragLeave={event => {
                if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
                  dropPreview.value = null
                }
              }}
              onDrop={onDropLibraryItem}
            >
              <div
                class={`absolute top-0 bottom-0 z-10 w-0.5 pointer-events-none ${isPlaying.value ? 'opacity-100' : 'opacity-50'}`}
                style={{ left: laneHeaderWidth + playheadX, backgroundColor: primaryColor.value }}
              />
              {dropPreview.value && (
                <div class="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: dropPreview.value.y }}>
                  <div class="absolute left-0 h-0.5 shadow-[0_0_12px_rgba(255,255,255,.5)]"
                    style={{ right: 0, backgroundColor: dropPreview.value.color }}
                  />
                  <div class="absolute -top-3 left-3 px-2 py-1 text-[11px] text-black font-semibold"
                    style={{ backgroundColor: dropPreview.value.color }}
                  >
                    New lane: {dropPreview.value.title}
                  </div>
                  <div
                    class="absolute top-2 h-12 border border-white/50 bg-black/30"
                    style={{
                      left: laneHeaderWidth + dropPreview.value.x,
                      width: Math.max(48, dropPreview.value.lengthBars * pxPerBar),
                      backgroundColor: `${dropPreview.value.color}55`,
                    }}
                  />
                </div>
              )}
              {tracks.map(track => (
                <LaneRow
                  key={track.id}
                  track={track}
                  arrangement={arrangement}
                  selectedBlockId={selectedBlockId.value}
                  timelineWidth={timelineWidth}
                  pxPerBar={pxPerBar}
                  onSelectBlock={id => selectedBlockId.value = id}
                  onCommit={commit}
                />
              ))}
              <div class="border-b border-dashed border-white/10 pointer-events-none" style={{ height: laneHeight }} />
            </div>
          </div>

          <BlockEditor
            block={selectedBlock}
            track={selectedBlock ? arrangement.tracks.find(track => track.id === selectedBlock.trackId) ?? null : null}
            onCommit={commit}
            onDelete={() => {
              if (!selectedBlock) return
              const deletedId = selectedBlock.id
              commit(next => {
                next.blocks = next.blocks.filter(block => block.id !== deletedId)
              })
              selectedBlockId.value = project.arrangement.blocks[0]?.id ?? null
            }}
            onDuplicate={() => {
              if (!selectedBlock) return
              let duplicatedId = ''
              commit(next => {
                const copy = createArrangementBlock({
                  ...selectedBlock,
                  id: undefined,
                  startBar: selectedBlock.startBar + selectedBlock.lengthBars,
                  name: `${selectedBlock.name} copy`,
                })
                duplicatedId = copy.id
                next.blocks.push(copy)
              })
              selectedBlockId.value = duplicatedId
            }}
          />
        </main>
      </div>
    </div>
  )
}

const LaneRow = (
  { track, arrangement, selectedBlockId, timelineWidth, pxPerBar, onSelectBlock, onCommit }: {
    track: ArrangementTrack
    arrangement: Arrangement
    selectedBlockId: string | null
    timelineWidth: number
    pxPerBar: number
    onSelectBlock: (id: string) => void
    onCommit: (updater: (next: Arrangement) => void) => void
  },
) => {
  const blocks = arrangement.blocks.filter(block => block.trackId === track.id)

  return (
    <div class="flex border-b border-white/10" style={{ height: laneHeight }}>
      <div class="shrink-0 border-r border-white/10 px-3 py-2 flex flex-col justify-between"
        style={{ width: laneHeaderWidth }}
      >
        <div class="flex items-center gap-2">
          <button class="w-3 h-3 shrink-0" style={{ backgroundColor: track.color }}
            onClick={() => {
              const name = prompt('Lane name', track.name)?.trim()
              if (!name) return
              onCommit(next => {
                const t = next.tracks.find(item => item.id === track.id)
                if (t) t.name = name
              })
            }}
          />
          <button class="text-sm text-white/80 min-w-0 truncate text-left flex-1"
            onClick={() => {
              const name = prompt('Lane name', track.name)?.trim()
              if (!name) return
              onCommit(next => {
                const t = next.tracks.find(item => item.id === track.id)
                if (t) t.name = name
              })
            }}
          >
            {track.name}
          </button>
          <button class="text-white/35 hover:text-white" title="Delete lane"
            onClick={() => {
              if (arrangement.tracks.length <= 1) return
              if (!confirm(`Delete ${track.name} and its blocks?`)) return
              onCommit(next => {
                next.tracks = next.tracks.filter(item => item.id !== track.id)
                next.blocks = next.blocks.filter(block => block.trackId !== track.id)
              })
            }}
          >
            <TrashIcon size={14} />
          </button>
        </div>
        <div class="flex items-center gap-2">
          <button class="text-xs px-2 py-1 bg-white/5 hover:bg-white/10"
            onClick={() => {
              onCommit(next => {
                const t = next.tracks.find(item => item.id === track.id)
                if (t) t.muted = !t.muted
              })
            }}
          >
            {track.muted ? <SpeakerSlashIcon size={14} /> : <SpeakerHighIcon size={14} />}
          </button>
          <button class={`text-xs px-2 py-1 ${track.soloed ? 'text-black' : 'text-white/60'} hover:bg-white/10`}
            style={{ backgroundColor: track.soloed ? primaryColor.value : 'rgba(255,255,255,0.05)' }}
            onClick={() => {
              onCommit(next => {
                const t = next.tracks.find(item => item.id === track.id)
                if (t) t.soloed = !t.soloed
              })
            }}
          >
            S
          </button>
          <input
            class="w-20"
            type="range"
            min="0"
            max="1.5"
            step="0.01"
            value={track.volume}
            onInput={e => {
              const volume = Number((e.target as HTMLInputElement).value)
              onCommit(next => {
                const t = next.tracks.find(item => item.id === track.id)
                if (t) t.volume = volume
              })
            }}
          />
        </div>
      </div>
      <div class="relative shrink-0" style={{ width: timelineWidth }}>
        {Array.from({ length: Math.ceil(timelineWidth / pxPerBar) + 1 }).map((_, bar) => (
          <div key={bar} class="absolute top-0 bottom-0 border-l border-white/5" style={{ left: bar * pxPerBar }} />
        ))}
        {blocks.map(block => (
          <TimelineBlock
            key={block.id}
            block={block}
            bpm={arrangement.bpm}
            pxPerBar={pxPerBar}
            selected={selectedBlockId === block.id}
            onSelect={() => onSelectBlock(block.id)}
            onCommit={onCommit}
          />
        ))}
      </div>
    </div>
  )
}

const TimelineBlock = (
  { block, bpm, pxPerBar, selected, onSelect, onCommit }: {
    block: ArrangementBlock
    bpm: number
    pxPerBar: number
    selected: boolean
    onSelect: () => void
    onCommit: (updater: (next: Arrangement) => void) => void
  },
) => {
  const beginDrag = (mode: 'move' | 'resize', e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect()
    const startX = e.clientX
    const startBar = block.startBar
    const lengthBars = block.lengthBars
    const onMove = (event: MouseEvent) => {
      const deltaBars = (event.clientX - startX) / pxPerBar
      onCommit(next => {
        const b = next.blocks.find(item => item.id === block.id)
        if (!b) return
        if (mode === 'move') b.startBar = snapBar(startBar + deltaBars)
        else b.lengthBars = Math.max(0.25, snapBar(lengthBars + deltaBars))
      })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      class={`absolute top-2 bottom-2 overflow-hidden cursor-grab border ${
        selected ? 'border-white shadow-[0_0_0_1px_rgba(255,255,255,.5)]' : 'border-white/20'
      }`}
      style={{
        left: block.startBar * pxPerBar,
        width: Math.max(18, block.lengthBars * pxPerBar),
        backgroundColor: block.muted ? '#333' : block.color,
        opacity: block.muted ? 0.45 : 0.9,
      }}
      onMouseDown={e => beginDrag('move', e)}
    >
      <SpectrogramOverlay block={block} bpm={bpm} />
      <div class="relative z-10 h-full px-2 py-1 flex flex-col justify-between text-black">
        <span class="text-xs font-bold truncate">{block.name}</span>
        <span class="text-[10px] opacity-70">{block.startBar + 1} / {block.lengthBars}b</span>
      </div>
      <div
        class="absolute top-0 right-0 bottom-0 w-3 cursor-ew-resize bg-black/15"
        onMouseDown={e => beginDrag('resize', e)}
      />
    </div>
  )
}

const SpectrogramOverlay = ({ block, bpm }: { block: ArrangementBlock; bpm: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [progress, setProgress] = useState(0)
  const [hasImage, setHasImage] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    const context = canvas.getContext('2d')
    context?.clearRect(0, 0, canvas.width, canvas.height)
    setHasImage(false)
    setStatus('loading')
    setProgress(0)

    requestBlockSpectrogram({
      blockId: block.id,
      name: block.name,
      templateId: block.templateId,
      code: block.code,
      lengthBars: block.lengthBars,
      bpm,
    }, value => {
      if (cancelled) return
      setProgress(value)
      setStatus('loading')
    }).then(result => {
      if (cancelled) return
      canvas.width = result.width
      canvas.height = result.height
      const context = canvas.getContext('2d')
      if (!context) return
      context.putImageData(new ImageData(result.pixels, result.width, result.height), 0, 0)
      if (result.error) {
        console.error('[daw] Spectrogram render failed', {
          error: result.error,
          blockId: block.id,
          name: block.name,
          templateId: block.templateId,
          lengthBars: block.lengthBars,
          bpm,
          code: block.code,
        })
        setHasImage(false)
        setStatus('failed')
        return
      }
      setHasImage(true)
      setStatus('ready')
      setProgress(1)
    }).catch(error => {
      if (cancelled) return
      console.error('[daw] Spectrogram worker failed', {
        error,
        blockId: block.id,
        name: block.name,
        templateId: block.templateId,
        lengthBars: block.lengthBars,
        bpm,
        code: block.code,
      })
      const context = canvas.getContext('2d')
      context?.clearRect(0, 0, canvas.width, canvas.height)
      setHasImage(false)
      setStatus('failed')
    })
    return () => {
      cancelled = true
    }
  }, [block.id, block.name, block.templateId, block.code, block.lengthBars, bpm])

  return (
    <>
      <canvas
        ref={canvasRef}
        class={`absolute inset-0 z-0 pointer-events-none ${block.muted ? 'opacity-35' : 'opacity-85'}`}
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      {!hasImage && (
        <div class="absolute inset-x-2 bottom-2 z-[5] pointer-events-none">
          {status === 'failed'
            ? (
              <div class="rounded bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/85">
                Spectrogram failed
              </div>
            )
            : (
              <div class="h-1.5 overflow-hidden rounded-full bg-black/35">
                <div
                  class="h-full rounded-full bg-white/85 transition-[width] duration-150"
                  style={{ width: `${Math.max(6, Math.round(progress * 100))}%` }}
                />
              </div>
            )}
        </div>
      )}
    </>
  )
}

const BlockEditor = (
  { block, track, onCommit, onDelete, onDuplicate }: {
    block: ArrangementBlock | null
    track: ArrangementTrack | null
    onCommit: (updater: (next: Arrangement) => void) => void
    onDelete: () => void
    onDuplicate: () => void
  },
) => {
  if (!block) {
    return (
      <div class="h-[270px] shrink-0 border-t border-white/10 p-4 text-white/40">
        Select or add a block.
      </div>
    )
  }

  const template = getTemplate(block.templateId)

  return (
    <div class="h-[300px] shrink-0 border-t border-white/10 flex min-h-0">
      <div class="w-[330px] shrink-0 border-r border-white/10 p-3 overflow-y-auto">
        <div class="flex items-center gap-2 mb-3">
          <input
            class="bg-transparent text-white font-semibold outline-none min-w-0 flex-1"
            value={block.name}
            onInput={e => {
              const name = (e.target as HTMLInputElement).value
              onCommit(next => {
                const b = next.blocks.find(item => item.id === block.id)
                if (b) b.name = name
              })
            }}
          />
          <button class="p-1 text-white/45 hover:text-white" title="Duplicate block" onClick={onDuplicate}>
            <CopyIcon size={16} />
          </button>
          <button class="p-1 text-white/45 hover:text-white" title="Delete block" onClick={onDelete}>
            <TrashIcon size={16} />
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <LabelledInput label="Start" value={block.startBar} step="0.25"
            onChange={value => onCommit(next => {
              const b = next.blocks.find(item => item.id === block.id)
              if (b) b.startBar = snapBar(value)
            })} />
          <LabelledInput label="Length" value={block.lengthBars} step="0.25"
            onChange={value => onCommit(next => {
              const b = next.blocks.find(item => item.id === block.id)
              if (b) b.lengthBars = Math.max(0.25, snapBar(value))
            })} />
          <LabelledInput label="Volume" value={block.volume} step="0.01"
            onChange={value => onCommit(next => {
              const b = next.blocks.find(item => item.id === block.id)
              if (b) b.volume = Math.max(0, Math.min(2, value))
            })} />
          <label class="flex flex-col gap-1 text-white/45">
            Color
            <input type="color" value={block.color}
              onInput={e => onCommit(next => {
                const b = next.blocks.find(item => item.id === block.id)
                if (b) b.color = (e.target as HTMLInputElement).value
              })}
            />
          </label>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <button
            class={`px-3 py-1.5 text-xs ${block.muted ? 'text-black' : 'text-white/60'} hover:bg-white/10`}
            style={{ backgroundColor: block.muted ? primaryColor.value : 'rgba(255,255,255,0.05)' }}
            onClick={() => onCommit(next => {
              const b = next.blocks.find(item => item.id === block.id)
              if (b) b.muted = !b.muted
            })}
          >
            Mute
          </button>
          <span class="text-xs text-white/35 truncate">{track?.name ?? 'No lane'}</span>
        </div>
        {template && (
          <div class="mt-4">
            <h3 class="text-xs font-semibold text-white/60 mb-2">{template.name} Params</h3>
            <div class="space-y-2">
              {template.params.map(param => (
                <label key={param.name} class="flex flex-col gap-1 text-xs text-white/45">
                  {param.label}
                  <input
                    class="bg-white/5 border border-white/10 px-2 py-1 text-white outline-none"
                    type={param.type === 'number' ? 'number' : 'text'}
                    value={String(block.params[param.name] ?? param.defaultValue)}
                    onInput={e => {
                      const raw = (e.target as HTMLInputElement).value
                      const value = param.type === 'number' ? Number(raw) : raw
                      onCommit(next => {
                        const b = next.blocks.find(item => item.id === block.id)
                        if (!b) return
                        b.params[param.name] = value
                        b.code = renderTemplateCode(template, b.params)
                      })
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      <div class="flex-1 min-w-0 min-h-0 flex flex-col">
        <div class="h-8 shrink-0 px-3 flex items-center justify-between border-b border-white/10">
          <span class="text-xs text-white/50">Block code</span>
          {template
            ? <span class="text-xs text-white/30">Editing code detaches from template params</span>
            : <span class="text-xs text-white/30">Custom snippet</span>}
        </div>
        <textarea
          class="flex-1 min-h-0 resize-none bg-transparent text-white/85 font-mono text-sm outline-none p-3"
          spellcheck={false}
          value={block.code}
          onInput={e => {
            const code = (e.target as HTMLTextAreaElement).value
            onCommit(next => {
              const b = next.blocks.find(item => item.id === block.id)
              if (!b) return
              b.code = code
              b.templateId = undefined
            })
          }}
        />
      </div>
    </div>
  )
}

const LabelledInput = (
  { label, value, step, onChange }: { label: string; value: number; step: string; onChange: (value: number) => void },
) => (
  <label class="flex flex-col gap-1 text-white/45">
    {label}
    <input
      class="bg-white/5 border border-white/10 px-2 py-1 text-white outline-none"
      type="number"
      step={step}
      value={value}
      onInput={e => onChange(Number((e.target as HTMLInputElement).value))}
    />
  </label>
)

const TemplateAudition = ({ id, code }: { id: string; code: string }) => {
  const program = useSignal<DspProgramContext | null>(null)

  useReactiveEffect(() => {
    if (!ctx.value) return
    const doc = createDoc(tokenize)
    doc.code = code
    getProgramContext(ctx.value, `daw-template-${id}`, { doc }).then(result => {
      program.value = result
      result.fullResync.value = true
    })
  }, [code, ctx])

  const isPlayingPreview = program.value != null && playingInlineContext.value === program.value

  return (
    <div class="border border-white/10 bg-black/20">
      <div class="flex items-center justify-between border-b border-white/10">
        <button
          class="px-2 py-1.5 text-white/70 hover:text-white"
          onClick={async () => {
            if (!program.value) return
            if (isPlayingPreview) await inlineTransport.stop()
            else await inlineTransport.start(program.value)
          }}
        >
          {isPlayingPreview ? <StopGradientIcon size={18} /> : <PlayGradientIcon size={18} />}
        </button>
        <span class="px-2 text-[10px] uppercase tracking-[0.12em] text-white/30">Preview</span>
      </div>
      <pre class="max-h-28 overflow-auto whitespace-pre-wrap p-2 text-[11px] leading-4 text-white/65 font-mono">
        {code}
      </pre>
    </div>
  )
}

const LibraryButton = (
  { selected, color, title, subtitle, onSelect, onAdd, onDragStart }: {
    selected: boolean
    color: string
    title: string
    subtitle: string
    onSelect: () => void
    onAdd: () => void
    onDragStart: (event: DragEvent) => void
  },
) => (
  <div
    class={`group flex items-center gap-2 border ${selected ? 'border-white/35' : 'border-white/10'} bg-white/[0.03] cursor-grab active:cursor-grabbing`}
    draggable
    onDragStart={onDragStart}
  >
    <button class="flex-1 min-w-0 flex items-center gap-2 px-2 py-2 text-left hover:bg-white/5" onClick={onSelect}>
      <span class="w-2.5 h-8 shrink-0" style={{ backgroundColor: color }} />
      <span class="min-w-0">
        <span class="block text-sm text-white/75 truncate">{title}</span>
        <span class="block text-xs text-white/35 truncate">{subtitle}</span>
      </span>
    </button>
    <button class="px-2 py-2 text-white/45 hover:text-white" onClick={onAdd} title="Add block">
      <PlusIcon size={16} />
    </button>
  </div>
)

function groupTemplates() {
  const groups = new Map<string, DawTemplate[]>()
  for (const template of dawTemplates) {
    groups.set(template.category, [...(groups.get(template.category) ?? []), template])
  }
  return [...groups.entries()].map(([category, items]) => ({ category, items }))
}

function getLibraryItem(id: string, oneLiners: OneLiner[]): LibraryItem | null {
  if (id.startsWith('one-liner:')) {
    const oneLiner = oneLiners.find(item => item.id === id.slice('one-liner:'.length))
    return oneLiner ? { kind: 'one-liner', oneLiner } : null
  }
  const template = dawTemplates.find(item => item.id === id)
  return template ? { kind: 'template', template } : null
}

function getPreviewCode(item: LibraryItem): string {
  if (item.kind === 'one-liner') return item.oneLiner.code
  return item.template.previewCode ?? `${renderTemplateCode(item.template, defaultTemplateParams(item.template))} |> out($)`
}

function getLibraryTitle(item: LibraryItem): string {
  return item.kind === 'template' ? item.template.name : 'One-liner'
}

function getLibraryColor(item: LibraryItem): string {
  return item.kind === 'template' ? item.template.color : '#f472b6'
}

function getLibraryLengthBars(item: LibraryItem): number {
  return item.kind === 'template' ? item.template.defaultLengthBars : 4
}

function getNextBlockStart(arrangement: Arrangement, trackId: string): number {
  const end = arrangement.blocks
    .filter(block => block.trackId === trackId)
    .reduce((max, block) => Math.max(max, block.startBar + block.lengthBars), 0)
  return snapBar(end)
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

type SpectrogramRequest = {
  blockId: string
  name: string
  templateId?: string
  code: string
  lengthBars: number
  bpm: number
}

type SpectrogramResponse = {
  id: number
  type: 'result'
  width: number
  height: number
  pixels: Uint8ClampedArray
  error?: {
    message: string
    name?: string
    stack?: string
  }
}

type SpectrogramProgress = {
  id: number
  type: 'progress'
  progress: number
}

let spectrogramWorker: Worker | null = null
let spectrogramRequestId = 0
const spectrogramCallbacks = new Map<number, {
  resolve: (response: SpectrogramResponse) => void
  reject: (error: Error) => void
  onProgress?: (progress: number) => void
}>()

function requestBlockSpectrogram(
  payload: SpectrogramRequest,
  onProgress?: (progress: number) => void,
): Promise<SpectrogramResponse> {
  const worker = getSpectrogramWorker()
  const id = ++spectrogramRequestId
  return new Promise((resolve, reject) => {
    spectrogramCallbacks.set(id, { resolve, reject, onProgress })
    worker.postMessage({ id, ...payload })
  })
}

function getSpectrogramWorker(): Worker {
  if (spectrogramWorker) return spectrogramWorker
  spectrogramWorker = new Worker(new URL('../workers/spectrogram-worker.ts', import.meta.url), { type: 'module' })
  spectrogramWorker.onmessage = (event: MessageEvent<SpectrogramResponse | SpectrogramProgress>) => {
    const callback = spectrogramCallbacks.get(event.data.id)
    if (!callback) return
    if (event.data.type === 'progress') {
      callback.onProgress?.(event.data.progress)
      return
    }
    spectrogramCallbacks.delete(event.data.id)
    callback.resolve(event.data)
  }
  spectrogramWorker.onerror = event => {
    const error = new Error(event.message || 'Spectrogram worker failed')
    for (const callback of spectrogramCallbacks.values()) callback.reject(error)
    spectrogramCallbacks.clear()
    spectrogramWorker?.terminate()
    spectrogramWorker = null
  }
  return spectrogramWorker
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    spectrogramWorker?.terminate()
    spectrogramWorker = null
    spectrogramCallbacks.clear()
  })
}

const palette = ['#22d3ee', '#a78bfa', '#fb7185', '#34d399', '#facc15', '#f472b6']
