import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const tsRegex = /^file:.*(?<!\.d)\.m?ts$/
const jsonRegex = /^file:.*\.json$/

export async function load(url, context, nextLoad) {
  if (jsonRegex.test(url)) {
    const filename = fileURLToPath(url)
    const source = await readFile(filename, 'utf8')
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${source};`,
    }
  }

  if (!tsRegex.test(url)) {
    return nextLoad(url, context)
  }

  const filename = fileURLToPath(url)
  const source = await readFile(filename, 'utf8')
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
    },
    fileName: filename,
  })

  return {
    format: 'module',
    shortCircuit: true,
    source: result.outputText,
  }
}
