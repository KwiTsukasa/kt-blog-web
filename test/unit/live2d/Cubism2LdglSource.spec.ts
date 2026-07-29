import { describe, expect, it, vi } from 'vitest'

import { createCubism2LDTransform } from '../../../src/components/blog/live2d/vendor/cubism2Core/ldTransform'
import {
  createCubism2LDGL,
  type CreateCubism2LDGLOptions,
} from '../../../src/components/blog/live2d/vendor/cubism2Core/ldgl'

type Live2DOverrides = Partial<{
  IGNORE_CLIP: boolean
  IGNORE_EXPAND: boolean
  USE_ADJUST_TRANSLATION: boolean
  USE_CACHED_POLYGON_IMAGE: boolean
}>

/**
 * Creates an LDGL constructor with deterministic affine output and captured diagnostics.
 * @param live2DOverrides Optional flags for one Canvas drawing branch.
 * @returns LDGL test harness and its captured runtime evidence.
 */
function createLDGLHarness(live2DOverrides: Live2DOverrides = {}) {
  const LDTransform = createCubism2LDTransform()
  const exceptions: unknown[] = []
  const diagnostics: unknown[] = []
  const Live2D = {
    DEBUG_DATA: {},
    IGNORE_CLIP: false,
    IGNORE_EXPAND: false,
    USE_ADJUST_TRANSLATION: false,
    USE_CACHED_POLYGON_IMAGE: false,
    ...live2DOverrides,
  }

  /**
   * Produces stable non-zero basis coordinates for the triangle mapping path.
   * @param _sourceX Unused source X coordinate.
   * @param _sourceY Unused source Y coordinate.
   * @param _originX Unused origin X coordinate.
   * @param _originY Unused origin Y coordinate.
   * @param _basisXX Unused first basis X component.
   * @param _basisXY Unused first basis Y component.
   * @param _basisYX Unused second basis X component.
   * @param _basisYY Unused second basis Y component.
   * @param output Mutable two-number affine output.
   */
  const solveAffineTransform: CreateCubism2LDGLOptions['solveAffineTransform'] = (
    _sourceX,
    _sourceY,
    _originX,
    _originY,
    _basisXX,
    _basisXY,
    _basisYX,
    _basisYY,
    output,
  ) => {
    output[0] = 0
    output[1] = 1
  }

  const LDGL = createCubism2LDGL({
    LDTransform,
    Live2D,
    UtDebug: {
      logException: (error) => exceptions.push(error),
      logWithLegacyPrefix: (message) => diagnostics.push(message),
    },
    solveAffineTransform,
  })

  return { diagnostics, exceptions, LDGL, LDTransform, Live2D }
}

/**
 * Creates a complete Canvas-like context whose calls can be asserted in source order.
 * @param calls Mutable call-order sink.
 * @returns Canvas-like context with Vitest spies for all LDGL drawing hooks.
 */
function createRecordingContext(calls: string[] = []) {
  return {
    globalAlpha: 0 as number | string,
    beginPath: vi.fn(() => calls.push('beginPath')),
    clip: vi.fn(() => calls.push('clip')),
    drawImage: vi.fn(() => calls.push('drawImage')),
    lineTo: vi.fn((x: number, y: number) => calls.push(`lineTo:${x},${y}`)),
    moveTo: vi.fn((x: number, y: number) => calls.push(`moveTo:${x},${y}`)),
    rect: vi.fn((x: number, y: number, width: number, height: number) =>
      calls.push(`rect:${x},${y},${width},${height}`),
    ),
    restore: vi.fn(() => calls.push('restore')),
    save: vi.fn(() => calls.push('save')),
    transform: vi.fn(),
    translate: vi.fn(() => calls.push('translate')),
  }
}

describe('Cubism2 LDGL immutable source behavior', () => {
  it('preserves reviewed ldgl.ts source behavior through semantic TypeScript', () => {
    const { diagnostics, exceptions, LDGL, LDTransform, Live2D } = createLDGLHarness()
    const viewportCalls: string[] = []
    const viewportContext = createRecordingContext(viewportCalls)
    const canvas = { height: 50, width: 100 }
    const arrayDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'Array')!

    class AuditedArray extends Array {}

    let constructorUsedArray = false
    let setterUsedArray = false
    try {
      Object.defineProperty(globalThis, 'Array', { ...arrayDescriptor, value: AuditedArray })
      const arrayRenderer = new LDGL(canvas, viewportContext)
      constructorUsedArray = arrayRenderer.viewport instanceof AuditedArray
      arrayRenderer.setViewport(1, 2, 3, 4)
      setterUsedArray = arrayRenderer.viewport instanceof AuditedArray
    } finally {
      Object.defineProperty(globalThis, 'Array', arrayDescriptor)
    }

    expect(constructorUsedArray).toBe(true)
    expect(setterUsedArray).toBe(true)

    const viewportRenderer = new LDGL(canvas, viewportContext)
    viewportRenderer.setViewport(1, 2, 3, 4)
    viewportRenderer.saveViewportClip()
    viewportRenderer.restoreViewportClip()
    expect(viewportCalls).toEqual(['save', 'beginPath', 'rect:1,2,3,4', 'clip', 'restore'])

    const missingSaveContext = createRecordingContext()
    delete (missingSaveContext as { save?: unknown }).save
    const missingSaveRenderer = new LDGL(canvas, missingSaveContext)
    expect(() => missingSaveRenderer.saveViewportClip()).toThrow(TypeError)
    expect(missingSaveContext.beginPath).not.toHaveBeenCalled()

    const missingRestoreContext = createRecordingContext()
    delete (missingRestoreContext as { restore?: unknown }).restore
    const missingRestoreRenderer = new LDGL(canvas, missingRestoreContext)
    expect(() => missingRestoreRenderer.restoreViewportClip()).toThrow(TypeError)

    const opacityContext = createRecordingContext()
    opacityContext.globalAlpha = 0
    const opacityRenderer = new LDGL(canvas, opacityContext)
    opacityRenderer.currentOpacity = 1
    opacityRenderer.drawElements(
      canvas,
      new Int16Array(0),
      new Float32Array(0),
      new Float32Array(0),
      '1' as unknown as number,
      0,
      null,
      { sourceDrawData: {} },
    )
    expect(opacityRenderer.currentOpacity).toBe(1)
    expect(opacityContext.globalAlpha).toBe(0)

    expect(LDGL.clipWithTransform.length).toBe(8)
    const clipContext = createRecordingContext()
    const transform = new LDTransform()
    transform.translate(10, 20)
    LDGL.clipWithTransform(clipContext, transform, 1, 2, 3, 4, 5, 6)
    expect(clipContext.beginPath).toHaveBeenCalledTimes(1)
    expect(clipContext.moveTo).toHaveBeenCalledWith(11, 22)
    expect(clipContext.lineTo).toHaveBeenNthCalledWith(1, 13, 24)
    expect(clipContext.lineTo).toHaveBeenNthCalledWith(2, 15, 26)
    expect(clipContext.clip).toHaveBeenCalledTimes(1)

    diagnostics.length = 0
    const rejectedClipContext = createRecordingContext()
    LDGL.clipWithTransform(rejectedClipContext, null, 0, 0, 1, 0, 0, 1)
    expect(diagnostics).toEqual(['LDGL.clip received a zero horizontal transform scale'])
    expect(rejectedClipContext.beginPath).not.toHaveBeenCalled()

    diagnostics.length = 0
    const shortClip = LDGL.clipWithTransform as unknown as (...args: unknown[]) => void
    shortClip(rejectedClipContext, transform, 0, 0, 1, 0)
    expect(diagnostics).toEqual(['err : @LDGL.clip()'])

    diagnostics.length = 0
    LDGL.clip(rejectedClipContext, transform, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1)
    expect(diagnostics).toEqual(['LDGL.clip received a zero horizontal transform scale'])
    expect(rejectedClipContext.beginPath).not.toHaveBeenCalled()

    const attributes: Array<[string, unknown]> = []
    const fakeCanvas = {
      getContext: vi.fn(),
      height: 0,
      setAttribute: vi.fn((name: string, value: unknown) => attributes.push([name, value])),
      width: 0,
    }
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(fakeCanvas as unknown as HTMLCanvasElement)
    try {
      expect(LDGL.createCanvas(12, 34)).toBe(fakeCanvas)
      expect(attributes).toEqual([
        ['width', 12],
        ['height', 34],
      ])
      expect(LDGL.createCanvas.length).toBe(2)
    } finally {
      createElement.mockRestore()
    }

    Live2D.USE_CACHED_POLYGON_IMAGE = true
    const cacheContext = createRecordingContext()
    const cacheRenderer = new LDGL(canvas, cacheContext)
    const cacheCanvas = {
      getContext: vi.fn(() => null),
      height: 1,
      setAttribute: vi.fn(),
      width: 1,
    }
    const createCanvas = vi.spyOn(LDGL, 'createCanvas').mockReturnValue(cacheCanvas)
    try {
      cacheRenderer.drawElements(
        canvas,
        new Int16Array([0, 1, 2]),
        new Float32Array([0, 0, 1, 0, 0, 1]),
        new Float32Array([0, 0, 1, 0, 0, 1]),
        0.5,
        0,
        null,
        { sourceDrawData: {} },
      )
    } finally {
      createCanvas.mockRestore()
    }
    expect(exceptions).toHaveLength(1)
    expect(exceptions[0]).toBeInstanceOf(TypeError)
    expect(cacheContext.restore).not.toHaveBeenCalled()
    expect(cacheContext.drawImage).not.toHaveBeenCalled()

    const drawHookHarness = createLDGLHarness({ IGNORE_CLIP: true })
    const missingDrawImageContext = createRecordingContext()
    delete (missingDrawImageContext as { drawImage?: unknown }).drawImage
    const missingDrawImageRenderer = new drawHookHarness.LDGL(canvas, missingDrawImageContext)
    missingDrawImageRenderer.drawElements(
      canvas,
      new Int16Array([0, 1, 2]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      0.5,
      0,
      null,
      { sourceDrawData: {} },
    )
    expect(drawHookHarness.exceptions).toHaveLength(1)
    expect(drawHookHarness.exceptions[0]).toBeInstanceOf(TypeError)
    expect(missingDrawImageContext.restore).not.toHaveBeenCalled()
  })
})
