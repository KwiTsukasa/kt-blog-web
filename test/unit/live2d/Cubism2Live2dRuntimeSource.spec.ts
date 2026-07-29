import { describe, expect, it, vi } from 'vitest'

import { createCubism2Live2DRuntime } from '../../../src/components/blog/live2d/vendor/cubism2Core/live2dRuntime'

describe('Cubism2 Live2D static runtime immutable source behavior', () => {
  it('preserves reviewed live2dRuntime.ts source behavior through semantic TypeScript', () => {
    const log = vi.fn()
    const Runtime = createCubism2Live2DRuntime({
      getBrowserRuntimeInfo: () => ({ isAndroid: () => false, isIOS: () => false }),
      logger: { log },
    })

    expect([Runtime.getVersionStr(), Runtime.getVersionNo()]).toEqual(['2.1.00_1', 201001000])
    expect(Runtime.isVerboseLoggingEnabled()).toBe(true)
    expect(Runtime.isInitializationPending).toBe(true)
    Runtime.init()
    expect(Runtime.isInitializationPending).toBe(false)
    expect(Runtime.PROFILE_NAME).toBe('Desktop')
    expect(Runtime.USE_ADJUST_TRANSLATION).toBe(false)
    expect(log).toHaveBeenCalledWith('Live2D %s', '2.1.00_1')
    const firstInitCalls = log.mock.calls.length
    Runtime.init()
    expect(log.mock.calls).toHaveLength(firstInitCalls)

    Runtime.setErrorCode(4000)
    expect(Runtime.getError()).toBe(4000)
    expect(Runtime.getError()).toBe(0)
    Runtime.setClippingMaskBufferSize(512)
    expect(Runtime.getClippingMaskBufferSize()).toBe(512)
  })

  it('preserves profile selection and GL registry mutation semantics', () => {
    const alert = vi.fn()
    const Runtime = createCubism2Live2DRuntime({
      alert,
      getBrowserRuntimeInfo: () => ({ isAndroid: () => true, isIOS: () => false }),
      logger: { log: vi.fn() },
    })
    Runtime.initProfile()
    expect(Runtime.PROFILE_NAME).toBe('Android')

    const firstContext = { deleteFramebuffer: vi.fn() }
    const secondContext = { deleteFramebuffer: vi.fn() }
    Runtime.setGL(firstContext)
    Runtime.setGL(secondContext, 2)
    expect(Runtime.getGL(0)).toBe(firstContext)
    expect(Runtime.getGL(2)).toBe(secondContext)
    expect(Runtime.getGL()).toBeUndefined()
    Runtime.frameBuffers[2] = { framebuffer: 'framebuffer-2' }
    Runtime.deleteBuffer(2)
    expect(secondContext.deleteFramebuffer).toHaveBeenCalledWith('framebuffer-2')
    expect(Runtime.glContext[2]).toBeUndefined()
    expect(Runtime.frameBuffers[2]).toBeUndefined()

    Runtime.setupProfile(123456, false)
    expect(alert).toHaveBeenCalledWith('Unknown Live2D profile: 123456')
    Runtime.dispose()
    expect(Runtime.glContext).toEqual([])
    expect(Runtime.frameBuffers).toEqual([])
    expect(Runtime.maskTextures).toEqual([])
  })
})
