import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const live2dSourceRoot = resolve(process.cwd(), 'src/components/blog/live2d')
const runtimeRoot = resolve(live2dSourceRoot, 'runtime')
const coreRoot = resolve(live2dSourceRoot, 'vendor/cubism2Core')

/**
 * Reads every production runtime module into one deterministic source string.
 * @returns Concatenated TypeScript source ordered by filename.
 */
function readRuntimeSource(): string {
  return readdirSync(runtimeRoot)
    .filter((fileName) => fileName.endsWith('.ts'))
    .sort()
    .map((fileName) => readFileSync(resolve(runtimeRoot, fileName), 'utf8'))
    .join('\n')
}

describe('Cubism2 runtime direct imports', () => {
  it('contains no global SDK reads, compatibility imports, or migration installer files', () => {
    const runtimeSource = readRuntimeSource()
    const rendererSource = readFileSync(resolve(runtimeRoot, 'webglLive2DRenderer.ts'), 'utf8')

    expect(runtimeSource).not.toMatch(/window\.(?:Live2D|Live2DModelWebGL|Live2DMotion|MotionQueueManager)/)
    expect(runtimeSource).not.toContain('loadCubism2Core')
    expect(runtimeSource).not.toContain('/compatibility/')
    expect(rendererSource).toContain("from '../vendor/cubism2Core/runtimeCore'")

    for (const retiredPath of [
      resolve(live2dSourceRoot, 'vendor/cubism2Core.ts'),
      resolve(runtimeRoot, 'cubism2CoreLoader.ts'),
      resolve(coreRoot, 'coreGlobals.ts'),
      resolve(coreRoot, 'legacyKernel.ts'),
      resolve(coreRoot, 'sdkGlobalInstaller.ts'),
      resolve(coreRoot, 'sdkGlobalNames.ts'),
      resolve(coreRoot, 'compatibility'),
    ]) {
      expect(existsSync(retiredPath), retiredPath).toBe(false)
    }
  })
})
