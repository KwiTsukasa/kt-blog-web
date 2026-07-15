import { describe, expect, it } from 'vitest'

import { createCubism2ParamBindings } from '../../components/blog/live2d/vendor/cubism2Core/paramBinding'

describe('Cubism2 parameter-binding immutable source behavior', () => {
  it('preserves reviewed paramBinding.ts source behavior through semantic TypeScript', () => {
    const { Cubism2ParamBinding, Cubism2ParamBindingSet } = createCubism2ParamBindings({
      Cubism2RuntimeConstants: { PARAM_VALUE_EPSILON: 0.0001, maxInterpolationCornerCount: 32 },
      Live2D: { shouldThrowOnInvalidInterpolationCorner: true },
      isBootstrapping: () => false,
    })
    const binding = new Cubism2ParamBinding()
    const operations: string[] = []
    const observedBinding = new Proxy(binding, {
      set(target, property, value, receiver) {
        operations.push(`write:${String(property)}:${String(value)}`)
        return Reflect.set(target, property, value, receiver)
      },
    })
    const readerValues: unknown[] = ['PARAM_ANGLE_X', 2, [-1, 1]]
    Cubism2ParamBinding.prototype.readParamBinding.call(observedBinding, {
      readInt32: () => {
        operations.push('read:int')
        return readerValues.shift() as number
      },
      readObject: () => {
        operations.push('read:object')
        return readerValues.shift()
      },
    })
    expect(operations).toEqual([
      'read:object',
      'write:paramId:PARAM_ANGLE_X',
      'read:int',
      'write:paramPointCount:2',
      'read:object',
      'write:paramPointValues:-1,1',
    ])
    binding.cacheParamIndex(7, 3)
    expect(binding.getParamIndex(3)).toBe(7)
    expect(binding.getParamIndex(4)).toBe(Cubism2ParamBinding.UNRESOLVED_PARAM_INDEX)

    const bindingSet = new Cubism2ParamBindingSet()
    bindingSet.initBindingList()
    const authoredPoints = [0, 1]
    bindingSet.addParamBinding('PARAM_EYE_BALL_X', 2, authoredPoints)
    authoredPoints[0] = 99
    expect(Array.from(bindingSet.getBindings()![0]!.getPointValues()!)).toEqual([0, 1])
    expect(bindingSet.getParamCount()).toBe(1)

    const modelContext = {
      getParamCacheGeneration: () => 5,
      getParamFloat: () => 0.5,
      getParamIndex: () => 2,
      isInitialParamUpdatePending: () => false,
      isParamChanged: () => false,
    }
    const dirty = [false]
    expect(bindingSet.resolveInterpolationWeights(modelContext, dirty)).toBe(1)
    const resolvedBinding = bindingSet.getBindings()![0]!
    expect(resolvedBinding.getLowerPointIndex()).toBe(0)
    expect(resolvedBinding.getInterpolationWeight()).toBe(0.5)
    const indexes = new Array<number>(3)
    const weights = new Array<number>(2)
    bindingSet.buildInterpolationCorners(indexes, weights, 1)
    expect(indexes).toEqual([0, 1, 65535])
    expect(weights).toEqual([0.5, -1])
  })

  it('preserves initial-update and changed-parameter short-circuit branches', () => {
    const { Cubism2ParamBindingSet } = createCubism2ParamBindings({
      Cubism2RuntimeConstants: { PARAM_VALUE_EPSILON: 0.0001, maxInterpolationCornerCount: 32 },
      Live2D: { shouldThrowOnInvalidInterpolationCorner: true },
      isBootstrapping: () => false,
    })
    const bindingSet = new Cubism2ParamBindingSet()
    bindingSet.initBindingList()
    const initialContext = {
      getParamCacheGeneration: () => 0,
      getParamFloat: () => 0,
      getParamIndex: () => 0,
      isInitialParamUpdatePending: () => true,
      isParamChanged: () => false,
    }
    expect(bindingSet.hasChangedParams(initialContext)).toBe(true)
  })
})
