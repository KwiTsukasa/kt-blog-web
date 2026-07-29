import { afterEach, describe, expect, it, vi } from 'vitest'

import { createWebGLLive2DRenderer } from '../../../src/components/blog/live2d/runtime/webglLive2DRenderer'

describe('Cubism2 page-level pointer tracking', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tracks mouse movement across the page and removes every listener on destroy', () => {
    const canvas = document.createElement('canvas')
    const windowAdd = vi.spyOn(window, 'addEventListener')
    const windowRemove = vi.spyOn(window, 'removeEventListener')
    const documentAdd = vi.spyOn(document, 'addEventListener')
    const documentRemove = vi.spyOn(document, 'removeEventListener')
    const canvasAdd = vi.spyOn(canvas, 'addEventListener')

    const renderer = createWebGLLive2DRenderer(canvas)

    expect(windowAdd).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(documentAdd).toHaveBeenCalledWith('mouseleave', expect.any(Function))
    expect(canvasAdd).not.toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(canvasAdd).not.toHaveBeenCalledWith('mouseout', expect.any(Function))
    const mouseMoveHandler = windowAdd.mock.calls.find(([type]) => type === 'mousemove')?.[1]
    const mouseLeaveHandler = documentAdd.mock.calls.find(([type]) => type === 'mouseleave')?.[1]

    renderer.destroy()

    expect(windowRemove).toHaveBeenCalledWith('mousemove', mouseMoveHandler)
    expect(documentRemove).toHaveBeenCalledWith('mouseleave', mouseLeaveHandler)
  })
})
