import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { createCubism2Math } from '../../components/blog/live2d/vendor/cubism2Core/math'
import { createCubism2MotionBase } from '../../components/blog/live2d/vendor/cubism2Core/motionBase'
import { createCubism2MotionParser } from '../../components/blog/live2d/vendor/cubism2Core/motionParser'

/** Creates the parser with the real semantic base-motion constructor and inert host diagnostics. */
function createMotionParserForSourceTest() {
  const motionBase = createCubism2MotionBase({
    Cubism2Math: createCubism2Math(),
    UtDebug: {
      logDebug: vi.fn(),
      logWithLegacyPrefix: vi.fn(),
    },
    UtSystem: { getUserTimeMSec: () => 0 },
    isBootstrapping: () => false,
  })
  return createCubism2MotionParser({
    AMotion: motionBase.AMotion,
    isBootstrapping: () => false,
  })
}

describe('Cubism2 motion parser immutable source behavior', () => {
  it('preserves reviewed motionParser.ts source behavior through semantic TypeScript', () => {
    const constructors = createMotionParserForSourceTest()
    const reader = constructors.MotionTextReader

    expect(typeof reader).toBe('function')
    expect(reader.name).toBe('MotionTextReader')
    expect(reader()).toBeUndefined()
    expect(Object.getPrototypeOf(new reader())).toBe(reader.prototype)
    expect(reader.createString(new DataView(new Uint8Array([65, 66]).buffer), 0, 2)).toBe('AB')

    const moduleSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/motionParser.ts',
      ),
      'utf8',
    )
    expect(moduleSource).toContain('MotionTextReader.getChar = function getChar(')
    expect(moduleSource).toContain('function readMotionByteChar(')
    expect(moduleSource).toContain('var currentChar = readMotionByteChar(')

    const motion = new constructors.Live2DMotion()
    motion.setLoop(true)
    motion.setFramesPerSecond(48)
    expect(motion.isLoop()).toBe(true)
    expect(motion.getFramesPerSecond()).toBe(48)
    expect(constructors.Live2DMotion.prototype.isLoop.length).toBe(0)
    expect(constructors.Live2DMotion.prototype.setLoop.length).toBe(1)
    expect(constructors.Live2DMotion.prototype.getFramesPerSecond.length).toBe(0)
    expect(constructors.Live2DMotion.prototype.setFramesPerSecond.length).toBe(1)
  })

  it('preserves the source length-property boundary and DataView out-of-range failure', () => {
    const reader = createMotionParserForSourceTest().MotionTextReader
    const motionData = new DataView(new Uint8Array([65, 66, 67]).buffer)
    Object.defineProperty(motionData, 'length', { value: 3 })

    expect(reader.startsWith(motionData, 0, 'AB')).toBe(true)
    expect(reader.startsWith(motionData, 0, 'ABC')).toBe(false)

    const plainDataView = new DataView(new Uint8Array([65, 66, 67]).buffer)
    expect(reader.startsWith(plainDataView, 0, 'ABC')).toBe(true)
    expect(() => reader.startsWith(plainDataView, 3, 'A')).toThrow(RangeError)
  })

  it('intentional source defect correction: preserves curves after LF-only or CR-only settings', () => {
    const { Live2DMotion } = createMotionParserForSourceTest()

    for (const lineBreak of ['\n', '\r']) {
      const bytes = new TextEncoder().encode(
        `$fps=60${lineBreak}PARAM_A=1,2${lineBreak}PARAM_B=3,4${lineBreak}`,
      )
      const motion = Live2DMotion.loadMotion(new DataView(bytes.buffer))

      expect(motion.framesPerSecond).toBe(60)
      expect(motion.motions.map((curve) => curve.targetId)).toEqual(['PARAM_A', 'PARAM_B'])
      expect(motion.motions.map((curve) => Array.from(curve.keyframeValues ?? []))).toEqual([
        [1, 2],
        [3, 4],
      ])
      expect(motion.maxCurveValueCount).toBe(2)
      expect(motion.durationMSec).toBe(33)
    }
  })
})
