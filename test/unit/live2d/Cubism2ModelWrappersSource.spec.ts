import { describe, expect, it, vi } from 'vitest'

import { createCubism2ModelWrappers } from '../../../src/components/blog/live2d/vendor/cubism2Core/modelWrappers'

describe('Cubism2 model-wrapper immutable source behavior', () => {
  it('preserves reviewed modelWrappers.ts source behavior through semantic TypeScript', () => {
    let isBootstrapping = true
    const modelContexts: Array<Record<string, ReturnType<typeof vi.fn>>> = []
    const canvasDrawParams: Array<Record<string, ReturnType<typeof vi.fn>>> = []
    const webglDrawParams: Array<Record<string, ReturnType<typeof vi.fn>>> = []
    const loadMocDataIntoModel = vi.fn()

    function Live2DModelBaseStub(this: { modelContext?: object }): void {
      if (isBootstrapping) {
        return
      }
      const modelContext = {
        draw: vi.fn(),
        preDraw: vi.fn(),
        update: vi.fn(),
      }
      modelContexts.push(modelContext)
      this.modelContext = modelContext
    }
    ;(
      Live2DModelBaseStub as unknown as { loadMocDataIntoModel: typeof loadMocDataIntoModel }
    ).loadMocDataIntoModel = loadMocDataIntoModel

    function CanvasDrawParamStub(this: Record<string, unknown>): void {
      const drawParam = {
        getTextureCount: vi.fn(() => 4),
        releaseRendererTextures: vi.fn(),
        setDrawParam: vi.fn(),
        setGL: vi.fn(),
        setTexture: vi.fn(),
        setTransform: vi.fn(),
      }
      Object.assign(this, drawParam)
      canvasDrawParams.push(this as unknown as Record<string, ReturnType<typeof vi.fn>>)
    }

    function WebGLDrawParamStub(this: Record<string, unknown>, glContextIndex?: number): void {
      const drawParam = {
        constructorIndex: vi.fn(() => glContextIndex),
        getAnisotropy: vi.fn(() => 8),
        getTextureCount: vi.fn(() => 6),
        isPremultipliedAlpha: vi.fn(() => true),
        releaseRendererTextures: vi.fn(),
        setAnisotropy: vi.fn(),
        setDrawParam: vi.fn(),
        setGL: vi.fn(),
        setMatrix: vi.fn(),
        setPremultipliedAlpha: vi.fn(),
        setTexture: vi.fn(),
        setTransform: vi.fn(),
      }
      Object.assign(this, drawParam)
      webglDrawParams.push(this as unknown as Record<string, ReturnType<typeof vi.fn>>)
    }

    const glContexts = [{ slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }]
    const getGL = vi.fn((index?: number) => glContexts[index ?? 0])
    const setGL = vi.fn()
    const { Live2DModelJS, Live2DModelWebGL } = createCubism2ModelWrappers({
      CanvasDrawParam: CanvasDrawParamStub,
      Live2D: { getGL, setGL },
      Live2DModelBase: Live2DModelBaseStub,
      UtDebug: { logWithLegacyPrefix: vi.fn() },
      WebGLDrawParam: WebGLDrawParamStub,
      isBootstrapping: () => isBootstrapping,
    } as unknown as Parameters<typeof createCubism2ModelWrappers>[0])
    isBootstrapping = false

    const sourceBuffer = new ArrayBuffer(4)
    const canvasModel = Live2DModelJS.loadModel(sourceBuffer)
    const canvasDrawParam = canvasDrawParams[0]!
    const canvasContext = modelContexts[0]!
    const renderer = { renderer: 'canvas' }
    const transform = { transform: 'canvas' }

    expect(Object.hasOwn(Live2DModelJS, 'loadModel')).toBe(true)
    expect(Object.hasOwn(Live2DModelJS.prototype, 'setTexture')).toBe(true)
    expect(loadMocDataIntoModel).toHaveBeenCalledWith(canvasModel, sourceBuffer)
    canvasModel.setGL(renderer as never)
    canvasModel.setTransform(transform)
    canvasModel.setTexture(2, 'canvas-texture')
    canvasModel.draw()
    canvasModel.releaseRendererTextures()
    canvasModel.setDrawParam('canvas-payload')
    expect(canvasModel.getTextureCount()).toBe(4)
    expect(canvasModel.getDrawParam()).toBe(canvasDrawParam)
    expect(canvasDrawParam.setGL).toHaveBeenCalledWith(renderer)
    expect(canvasDrawParam.setTransform).toHaveBeenCalledWith(transform)
    expect(canvasDrawParam.setTexture).toHaveBeenCalledWith(2, 'canvas-texture')
    expect(canvasDrawParam.releaseRendererTextures).toHaveBeenCalledOnce()
    expect(canvasDrawParam.setDrawParam).toHaveBeenCalledWith('canvas-payload')
    expect(canvasContext.draw).toHaveBeenCalledWith(canvasDrawParam)

    const webglModel = Live2DModelWebGL.loadModel(sourceBuffer, 3)
    const webglDrawParam = webglDrawParams[0]!
    const webglContext = modelContexts[1]!

    expect(Object.hasOwn(Live2DModelWebGL, 'loadModel')).toBe(true)
    expect(Object.hasOwn(Live2DModelWebGL.prototype, 'setAnisotropy')).toBe(true)
    expect(webglDrawParam.constructorIndex()).toBe(3)
    expect(getGL).toHaveBeenCalledWith(3)
    expect(webglDrawParam.setGL).toHaveBeenCalledWith(glContexts[3])
    webglModel.setGL(glContexts[2] as never)
    webglModel.setTransform('webgl-transform')
    webglModel.update()
    webglModel.draw()
    webglModel.releaseRendererTextures()
    webglModel.setTexture(1, 'webgl-texture')
    webglModel.setDrawParam('webgl-payload')
    webglModel.setMatrix('matrix')
    webglModel.setPremultipliedAlpha(true)
    webglModel.setAnisotropy(16)
    expect(webglModel.getTextureCount()).toBe(6)
    expect(webglModel.getDrawParam()).toBe(webglDrawParam)
    expect(webglModel.isPremultipliedAlpha()).toBe(true)
    expect(webglModel.getAnisotropy()).toBe(8)
    expect(setGL).toHaveBeenCalledWith(glContexts[2])
    expect(webglContext.update).toHaveBeenCalledOnce()
    expect(webglContext.preDraw).toHaveBeenCalledWith(webglDrawParam)
    expect(webglContext.draw).toHaveBeenCalledWith(webglDrawParam)
    expect(webglDrawParam.setTexture).toHaveBeenCalledWith(1, 'webgl-texture')
    expect(webglDrawParam.setMatrix).toHaveBeenCalledWith('matrix')
    expect(webglDrawParam.setPremultipliedAlpha).toHaveBeenCalledWith(true)
    expect(webglDrawParam.setAnisotropy).toHaveBeenCalledWith(16)
  })
})
