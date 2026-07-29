import { describe, expect, it, vi } from 'vitest'

import { createLive2DTSRuntime } from '@/components/blog/live2d/runtime/live2dTsRuntime'
import type {
  Live2DRendererAdapter,
  Live2DRuntimeStorage,
} from '@/components/blog/live2d/runtime/live2dRuntimeTypes'

/**
 * Creates a deterministic runtime dependency set for texture preview tests.
 * @returns Recording renderer and storage fakes plus the mounted runtime inputs.
 */
function createPreviewRuntimeDependencies(): {
  renderer: Live2DRendererAdapter
  storage: Live2DRuntimeStorage
} {
  return {
    renderer: {
      destroy: vi.fn(),
      mount: vi.fn(() => Promise.resolve()),
      switchModel: vi.fn(() => Promise.resolve()),
      switchTexture: vi.fn(() => Promise.resolve()),
    },
    storage: {
      readModelKey: vi.fn(() => 'pio'),
      readTextureIndex: vi.fn(() => 0),
      writeModelKey: vi.fn(),
      writeTextureIndex: vi.fn(),
    },
  }
}

/**
 * Supplies the two-texture model metadata shared by preview tests.
 * @returns Minimal normalized Cubism2 settings for Pio.
 */
function loadPreviewSettings() {
  return Promise.resolve({
    baseUrl: '/api/blog/live2d/pio/moc/',
    hitAreas: {},
    model: 'pio.moc',
    motions: {},
    textures: ['textures/default-costume.png', 'textures/bikini-costume-blue.png'],
    url: '/api/blog/live2d/pio/moc/index.json',
  })
}

describe('Live2D texture preview runtime', () => {
  it('renders a preview without mutating committed state or persistent storage', async () => {
    const { renderer, storage } = createPreviewRuntimeDependencies()
    const runtime = createLive2DTSRuntime({
      canvas: document.createElement('canvas'),
      loadSettings: loadPreviewSettings,
      renderer,
      storage,
    })
    await runtime.mount()
    vi.mocked(renderer.switchTexture).mockClear()
    vi.mocked(storage.writeTextureIndex).mockClear()

    const previewState = await runtime.previewTexture(1)

    expect(previewState.textureIndex).toBe(1)
    expect(runtime.getState()?.textureIndex).toBe(0)
    expect(renderer.switchTexture).toHaveBeenCalledWith(
      expect.objectContaining({ textureIndex: 1 }),
    )
    expect(storage.writeTextureIndex).not.toHaveBeenCalled()
  })

  it('commits an already rendered preview without loading the texture twice', async () => {
    const { renderer, storage } = createPreviewRuntimeDependencies()
    const runtime = createLive2DTSRuntime({
      canvas: document.createElement('canvas'),
      loadSettings: loadPreviewSettings,
      renderer,
      storage,
    })
    await runtime.mount()
    vi.mocked(renderer.switchTexture).mockClear()
    vi.mocked(storage.writeTextureIndex).mockClear()

    await runtime.previewTexture(1)
    const committedState = await runtime.switchTexture(1)

    expect(committedState.textureIndex).toBe(1)
    expect(runtime.getState()?.textureIndex).toBe(1)
    expect(renderer.switchTexture).toHaveBeenCalledTimes(1)
    expect(storage.writeTextureIndex).toHaveBeenCalledWith('pio', 1)
  })

  it('restores the committed texture after a cancelled preview without persisting', async () => {
    const { renderer, storage } = createPreviewRuntimeDependencies()
    const runtime = createLive2DTSRuntime({
      canvas: document.createElement('canvas'),
      loadSettings: loadPreviewSettings,
      renderer,
      storage,
    })
    await runtime.mount()
    vi.mocked(renderer.switchTexture).mockClear()
    vi.mocked(storage.writeTextureIndex).mockClear()

    await runtime.previewTexture(1)
    await runtime.previewTexture(0)

    expect(runtime.getState()?.textureIndex).toBe(0)
    expect(
      vi.mocked(renderer.switchTexture).mock.calls.map(([state]) => state.textureIndex),
    ).toEqual([1, 0])
    expect(storage.writeTextureIndex).not.toHaveBeenCalled()
  })
})
