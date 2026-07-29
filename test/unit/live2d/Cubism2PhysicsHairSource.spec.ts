import { describe, expect, it } from 'vitest'

import { createCubism2Math } from '../../../src/components/blog/live2d/vendor/cubism2Core/math'
import { createCubism2PhysicsHair } from '../../../src/components/blog/live2d/vendor/cubism2Core/physicsHair'

describe('Cubism2 physics hair immutable source behavior', () => {
  it('preserves reviewed physicsHair.ts source behavior through semantic TypeScript', () => {
    const PhysicsHair = createCubism2PhysicsHair({
      Cubism2Math: createCubism2Math(),
      isBootstrapping: () => false,
    })

    expect(typeof PhysicsHair.Source).toBe('function')
    expect(typeof PhysicsHair.Target).toBe('function')
    expect(Reflect.construct(PhysicsHair.Source, [])).toEqual({})
    expect(Reflect.construct(PhysicsHair.Target, [])).toEqual({})
    expect(PhysicsHair.Source).not.toBe(PhysicsHair.Target)
    expect(PhysicsHair.Source.TO_ROOT_X).toBe('TO_ROOT_X')
    expect(PhysicsHair.Source.TO_ROOT_Y).toBe('TO_ROOT_Y')
    expect(PhysicsHair.Source.TO_GRAVITY_ANGLE).toBe('TO_GRAVITY_ANGLE')
    expect(PhysicsHair.Target.FROM_ANGLE).toBe('FROM_ANGLE')
    expect(PhysicsHair.Target.FROM_ANGULAR_VELOCITY).toBe('FROM_ANGULAR_VELOCITY')
  })
})
