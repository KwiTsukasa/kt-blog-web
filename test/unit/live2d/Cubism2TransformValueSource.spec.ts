import { describe, expect, it } from 'vitest'

import { createCubism2TransformValue } from '../../../src/components/blog/live2d/vendor/cubism2Core/transformValue'

describe('Cubism2 transform-value immutable source behavior', () => {
  it('preserves reviewed transformValue.ts source behavior through semantic TypeScript', () => {
    const Cubism2TransformValue = createCubism2TransformValue({
      Cubism2MocVersion: { LIVE2D_FORMAT_VERSION_V2_10_SDK2: 210 },
      isBootstrapping: () => false,
    })
    const value = new Cubism2TransformValue()
    const operations: string[] = []
    const observedValue = new Proxy(value, {
      set(target, property, nextValue, receiver) {
        operations.push(`write:${String(property)}:${String(nextValue)}`)
        return Reflect.set(target, property, nextValue, receiver)
      },
    })
    const floats = [1, 2, 3, 4, 5]
    const booleans = [true, false]
    Cubism2TransformValue.prototype.readTransformValue.call(observedValue, {
      getFormatVersion: () => {
        operations.push('read:version')
        return 210
      },
      readBoolean: () => {
        const nextValue = booleans.shift()!
        operations.push(`read:boolean:${nextValue}`)
        return nextValue
      },
      readFloat32: () => {
        const nextValue = floats.shift()!
        operations.push(`read:float:${nextValue}`)
        return nextValue
      },
    })

    expect(operations).toEqual([
      'read:float:1',
      'write:translationX:1',
      'read:float:2',
      'write:translationY:2',
      'read:float:3',
      'write:scaleX:3',
      'read:float:4',
      'write:scaleY:4',
      'read:float:5',
      'write:rotationDegrees:5',
      'read:version',
      'read:boolean:true',
      'write:reflectX:true',
      'read:boolean:false',
      'write:reflectY:false',
    ])
    expect(value).toMatchObject({
      reflectX: true,
      reflectY: false,
      rotationDegrees: 5,
      scaleX: 3,
      scaleY: 4,
      translationX: 1,
      translationY: 2,
    })
    expect(value.emptyLifecycleHook()).toBeUndefined()
  })

  it('keeps reflection defaults for older payloads and copies fields in source order', () => {
    const Cubism2TransformValue = createCubism2TransformValue({
      Cubism2MocVersion: { LIVE2D_FORMAT_VERSION_V2_10_SDK2: 210 },
      isBootstrapping: () => false,
    })
    const value = new Cubism2TransformValue()
    const floats = [6, 7, 8, 9, 10]
    value.readTransformValue({
      getFormatVersion: () => 209,
      readBoolean: () => {
        throw new Error('old payload must not read reflection flags')
      },
      readFloat32: () => floats.shift()!,
    })
    expect(value.reflectX).toBe(false)
    expect(value.reflectY).toBe(false)

    const source = {
      reflectX: true,
      reflectY: true,
      rotationDegrees: 15,
      scaleX: 1.5,
      scaleY: 2.5,
      translationX: -2,
      translationY: 3,
    }
    value.copyFrom(source)
    expect(value).toMatchObject(source)
  })
})
