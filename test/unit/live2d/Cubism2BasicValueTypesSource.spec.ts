import { describe, expect, it } from 'vitest'

import { createCubism2BasicValueTypes } from '../../../src/components/blog/live2d/vendor/cubism2Core/basicValueTypes'

describe('Cubism2 basic value types immutable source behavior', () => {
  it('preserves reviewed basicValueTypes.ts source behavior through semantic TypeScript', () => {
    let bootstrapping = false
    const constructors = createCubism2BasicValueTypes({
      isBootstrapping: () => bootstrapping,
    })

    expect(Reflect.construct(constructors.Cubism2IntegerValue, [123, true])).toEqual({
      color: null,
    })
    expect(Reflect.construct(constructors.Cubism2PointValue, [123, 456])).toEqual({
      x: null,
      y: null,
    })
    expect(Reflect.construct(constructors.Cubism2XYValue, [123, 456])).toEqual({
      x: null,
      y: null,
    })

    bootstrapping = true
    expect(Object.keys(new constructors.Cubism2IntegerValue())).toEqual([])
    expect(Object.keys(new constructors.Cubism2PointValue())).toEqual([])
    expect(Object.keys(new constructors.Cubism2XYValue())).toEqual([])
  })

  it('copies or writes X/Y slots in immutable source order', () => {
    const constructors = createCubism2BasicValueTypes({ isBootstrapping: () => false })
    const xValue = { slot: 'x' } as unknown as number
    const yValue = Symbol('y') as unknown as number
    const operations: string[] = []
    const sourcePoint = {
      get x() {
        operations.push('read:x')
        return xValue
      },
      get y() {
        operations.push('read:y')
        return yValue
      },
    }
    const point = new constructors.Cubism2PointValue()
    const observedPoint = new Proxy(point, {
      set(target, property, value, receiver) {
        operations.push(`write:${String(property)}:${String(value)}`)
        return Reflect.set(target, property, value, receiver)
      },
    })
    constructors.Cubism2PointValue.prototype.copyFromPoint.call(observedPoint, sourcePoint)
    expect(point.x).toBe(xValue)
    expect(point.y).toBe(yValue)
    expect(operations).toEqual([
      'read:x',
      'write:x:[object Object]',
      'read:y',
      'write:y:Symbol(y)',
    ])

    const writes: string[] = []
    const tag22 = new constructors.Cubism2XYValue()
    const observedTag22 = new Proxy(tag22, {
      set(target, property, value, receiver) {
        writes.push(`${String(property)}:${String(value)}`)
        return Reflect.set(target, property, value, receiver)
      },
    })
    constructors.Cubism2XYValue.prototype.setXYSlots.call(observedTag22, xValue, yValue)
    expect(tag22.x).toBe(xValue)
    expect(tag22.y).toBe(yValue)
    expect(writes).toEqual(['x:[object Object]', 'y:Symbol(y)'])
  })
})
