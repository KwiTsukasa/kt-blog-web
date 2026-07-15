import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { createCubism2WebGLClipping } from '../../components/blog/live2d/vendor/cubism2Core/webglClipping'

describe('Cubism2 WebGL clipping immutable source behavior', () => {
  it('preserves reviewed webglClipping.ts source behavior through semantic TypeScript', () => {
    const operations: string[] = []
    let colorIdentity = 0

    class TestFloatRectangle {
      height: number | null = null
      width: number | null = null
      x: number | null = null
      y: number | null = null

      /** Records the constructor position occupied by the temporary clipping bounds. */
      constructor() {
        operations.push('rectangle')
      }

      /** Copies rectangle slots for the wider clipping constructor contract. */
      copyFromRectangle(source: TestFloatRectangle): void {
        this.x = source.x
        this.y = source.y
        this.width = source.width
        this.height = source.height
      }
    }

    class TestMatrix44 {
      readonly elements = new Float32Array(16)

      /** Records each of the four matrix allocations in clipping-manager source order. */
      constructor() {
        operations.push('matrix')
      }

      /** No-op test implementation of local scaling. */
      applyLocalScale(): void {}

      /** No-op test implementation of local translation. */
      applyLocalTranslation(): void {}

      /** No-op test implementation of matrix copying. */
      copyFromSourceMatrix(): void {}

      /** Returns the stable test matrix backing array. */
      getBackingMatrixArray(): Float32Array {
        return this.elements
      }

      /** No-op test implementation of identity reset. */
      resetToIdentity(): void {}
    }

    class TestRgbaColor {
      a = 0
      b = 0
      g = 0
      r = 0
      readonly identity: number

      /** Assigns an identity so the discarded first color can be distinguished from retained colors. */
      constructor() {
        colorIdentity += 1
        this.identity = colorIdentity
        operations.push(`color:${this.identity}`)
      }
    }

    const deleteFramebuffer = vi.fn()
    const gl = { deleteFramebuffer } as unknown as WebGLRenderingContext & {
      canvas: { height: number; width: number }
    }
    const drawParam = {
      createFramebuffer: vi.fn(),
      gl,
      glIndex: 0,
      setChannelFlagAsColor(channelIndex: number, color: TestRgbaColor) {
        operations.push(`channel:${channelIndex}:${color.identity}`)
      },
      setClippingContextForMask: vi.fn(),
    }
    const Live2D = {
      clippingMaskBufferSize: 256,
      frameBuffers: [] as Array<{ framebuffer: unknown } | undefined>,
      glContext: [] as unknown[],
    }
    const { Cubism2ClippingManager } = createCubism2WebGLClipping({
      Cubism2FloatRectangle: TestFloatRectangle,
      Cubism2Matrix44: TestMatrix44,
      Cubism2RgbaColor: TestRgbaColor,
      Cubism2RuntimeConstants: { POINT_TUPLE_SIZE: 2, POINT_X_OFFSET: 0 },
      Live2D,
      UtDebug: { logWithLegacyPrefix: vi.fn() },
      isBootstrapping: () => false,
    })
    const manager = new Cubism2ClippingManager(drawParam)

    expect(operations).toEqual([
      'rectangle',
      'matrix',
      'matrix',
      'matrix',
      'color:1',
      'color:2',
      'color:3',
      'color:4',
      'color:5',
      'channel:0:2',
      'channel:1:3',
      'channel:2:4',
      'channel:3:5',
    ])
    expect(manager.CHANNEL_COLORS.map((color) => (color as TestRgbaColor).identity)).toEqual([
      2, 3, 4, 5,
    ])

    const firstFramebuffer = { id: 'first' }
    const secondFramebuffer = { id: 'second' }
    Live2D.frameBuffers = [
      { framebuffer: firstFramebuffer },
      { framebuffer: secondFramebuffer },
    ]
    Live2D.glContext = [gl]
    manager.releaseResources()

    expect(deleteFramebuffer.mock.calls).toEqual([[firstFramebuffer], [secondFramebuffer]])
    expect(Live2D.frameBuffers).toEqual([])
    expect(Live2D.glContext).toEqual([])
    expect(manager.expandedClippedDrawBounds).toBeNull()
    expect(manager.clippingMatrixScratch).toBeNull()
    expect(manager.maskMatrixScratch).toBeNull()
    expect(manager.drawMatrixScratch).toBeNull()
    expect(manager.CHANNEL_COLORS).toEqual([])

    const moduleSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/webglClipping.ts',
      ),
      'utf8',
    )
    expect(moduleSource).toContain(
      'ClippingManager.prototype.releaseResources = function releaseResources()',
    )
    expect(moduleSource).toContain('this.releaseFramebuffers()')
    expect(moduleSource).toContain('function releaseFramebuffers()')
    expect(moduleSource).toContain('this.gl.deleteFramebuffer(')
    expect(moduleSource).not.toMatch(/releaseResources\.(?:call|apply)|const releaseResources/)
  })
})
