#!/usr/bin/env node
/**
 * Re-applies Safari AudioWorklet SharedArrayBuffer fixes onto github:loopmaster-xyz/engine.
 * Safari does not share SAB/Memory posted via MessagePort to AudioWorklet; we pass them
 * through processorOptions and allocate program buffers from main-thread pools.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = path.join(root, 'patches/engine')
const destRoot = path.join(root, 'node_modules/engine')

const files = [
  'src/dsp/dsp-state.ts',
  'src/dsp/dsp.ts',
  'src/dsp/dsp-core.ts',
  'src/dsp/worklet.ts',
  'src/dsp/fetch-samples.ts',
  'src/lib/wasm-setup.ts',
]

if (!fs.existsSync(destRoot)) {
  console.warn('[apply-engine-safari-sab-patch] engine package missing; skip')
  process.exit(0)
}

for (const rel of files) {
  const from = path.join(srcRoot, rel)
  const to = path.join(destRoot, rel)
  if (!fs.existsSync(from)) {
    console.error(`[apply-engine-safari-sab-patch] missing patch file: ${rel}`)
    process.exit(1)
  }
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
  console.log(`[apply-engine-safari-sab-patch] applied ${rel}`)
}
