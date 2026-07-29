import { describe, expect, it, vi } from 'vitest'

import { createCubism2Math } from '../../../src/components/blog/live2d/vendor/cubism2Core/math'
import { createCubism2MotionBase } from '../../../src/components/blog/live2d/vendor/cubism2Core/motionBase'

describe('Cubism2 motion base immutable source behavior', () => {
  it('preserves reviewed motionBase.ts source behavior through semantic TypeScript', () => {
    let userTimeMillis = 100
    const constructors = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        logDebug: vi.fn(),
        logWithLegacyPrefix: vi.fn(),
      },
      UtSystem: { getUserTimeMSec: () => userTimeMillis },
      isBootstrapping: () => false,
    })

    expect(constructors.AMotion.calculateLegacyCurveWeight(0, 1000, 500)).toBe(0)
    expect(constructors.AMotion.calculateLegacyCurveWeight(500, 1000, 500)).toBeCloseTo(0.5)
    expect(constructors.AMotion.calculateLegacyCurveWeight(1000, 1000, 500)).toBe(1)

    const entry = new constructors.Cubism2MotionQueueEntry()
    entry.scheduleFadeOut(50)
    expect(entry.endTimeMillis).toBe(150)
    userTimeMillis = 120
    entry.scheduleFadeOut(100)
    expect(entry.endTimeMillis).toBe(150)
    entry.scheduleFadeOut(10)
    expect(entry.endTimeMillis).toBe(130)
  })

  it('emits the queue header before preserving the source null-entry dereference failure', () => {
    const constructors = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        logDebug: vi.fn(),
        logWithLegacyPrefix: vi.fn(),
      },
      UtSystem: { getUserTimeMSec: () => 0 },
      isBootstrapping: () => false,
    })
    const queue = new constructors.MotionQueueManager()
    queue.motions = [undefined] as never
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    expect(() => queue.dumpMotionQueue()).toThrow(TypeError)
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith('-- motion queue --\n')

    consoleLog.mockRestore()
  })
})
