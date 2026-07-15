import { describe, expect, it } from 'vitest'

import { createCubism2Geometry } from '../../components/blog/live2d/vendor/cubism2Core/geometry'

describe('Cubism2 geometry immutable source behavior', () => {
  it('preserves reviewed geometry.ts source behavior through semantic TypeScript', () => {
    let bootstrapping = false
    const geometry = createCubism2Geometry({ isBootstrapping: () => bootstrapping })
    const rectangleWrites: string[] = []
    const observedRectangle = new Proxy(
      {},
      {
        set(target, property, value, receiver) {
          rectangleWrites.push(`${String(property)}:${String(value)}`)
          return Reflect.set(target, property, value, receiver)
        },
      },
    )
    Reflect.apply(geometry.Cubism2Rectangle as unknown as () => void, observedRectangle, [])
    expect(rectangleWrites).toEqual(['x:null', 'y:null', 'width:null', 'height:null'])

    const floatRectangleWrites: string[] = []
    const observedFloatRectangle = new Proxy(
      {},
      {
        set(target, property, value, receiver) {
          floatRectangleWrites.push(`${String(property)}:${String(value)}`)
          return Reflect.set(target, property, value, receiver)
        },
      },
    )
    Reflect.apply(
      geometry.Cubism2FloatRectangle as unknown as () => void,
      observedFloatRectangle,
      [],
    )
    expect(floatRectangleWrites).toEqual(['x:null', 'y:null', 'width:null', 'height:null'])

    expect(new geometry.Cubism2Rectangle()).toEqual({
      height: null,
      width: null,
      x: null,
      y: null,
    })
    expect(new geometry.Cubism2FloatRectangle()).toEqual({
      height: null,
      width: null,
      x: null,
      y: null,
    })

    bootstrapping = true
    rectangleWrites.length = 0
    Reflect.apply(geometry.Cubism2Rectangle as unknown as () => void, observedRectangle, [])
    expect(rectangleWrites).toEqual([])
    expect(Object.keys(new geometry.Cubism2Rectangle())).toEqual([])
    expect(Object.keys(new geometry.Cubism2FloatRectangle())).toEqual([])
  })

  it('preserves rectangle getters and copy reads in immutable source order', () => {
    const { Cubism2Rectangle } = createCubism2Geometry({ isBootstrapping: () => false })
    const rectangle = new Cubism2Rectangle()
    const operations: string[] = []
    const observedRectangle = new Proxy(rectangle, {
      set(target, property, value, receiver) {
        operations.push(`write:${String(property)}:${String(value)}`)
        return Reflect.set(target, property, value, receiver)
      },
    })
    Cubism2Rectangle.prototype.copyFromRectangle.call(observedRectangle, {
      get x() {
        operations.push('read:x')
        return 10
      },
      get y() {
        operations.push('read:y')
        return 20
      },
      get width() {
        operations.push('read:width')
        return 30
      },
      get height() {
        operations.push('read:height')
        return 40
      },
    })

    expect(operations).toEqual([
      'read:x',
      'write:x:10',
      'read:y',
      'write:y:20',
      'read:width',
      'write:width:30',
      'read:height',
      'write:height:40',
    ])
    expect([
      rectangle.getCenterX(),
      rectangle.getCenterY(),
      rectangle.getRight(),
      rectangle.getBottom(),
    ]).toEqual([25, 40, 40, 60])

    const getterReads: string[] = []
    const coercionRectangle = new Proxy(rectangle, {
      get(_target, property) {
        getterReads.push(String(property))
        return { x: '2', y: '3', width: '4', height: '5' }[property as 'x']
      },
    })
    expect(Cubism2Rectangle.prototype.getCenterX.call(coercionRectangle)).toBe(112)
    expect(getterReads).toEqual(['x', 'x', 'width'])
    getterReads.length = 0
    expect(Cubism2Rectangle.prototype.getCenterY.call(coercionRectangle)).toBe(167.5)
    expect(getterReads).toEqual(['y', 'y', 'height'])
    getterReads.length = 0
    expect(Cubism2Rectangle.prototype.getRight.call(coercionRectangle)).toBe('24')
    expect(getterReads).toEqual(['x', 'width'])
  })

  it('preserves float rectangle getters, self-bound contains stub, and expand mutation', () => {
    const { Cubism2FloatRectangle } = createCubism2Geometry({ isBootstrapping: () => false })
    const rectangle = new Cubism2FloatRectangle()
    const copyOperations: string[] = []
    const observedRectangle = new Proxy(rectangle, {
      set(target, property, value, receiver) {
        copyOperations.push(`write:${String(property)}:${String(value)}`)
        return Reflect.set(target, property, value, receiver)
      },
    })
    Cubism2FloatRectangle.prototype.copyFromRectangle.call(observedRectangle, {
      get x() {
        copyOperations.push('read:x')
        return 1.5
      },
      get y() {
        copyOperations.push('read:y')
        return 2.5
      },
      get width() {
        copyOperations.push('read:width')
        return 3.5
      },
      get height() {
        copyOperations.push('read:height')
        return 4.5
      },
    })
    expect(copyOperations).toEqual([
      'read:x',
      'write:x:1.5',
      'read:y',
      'write:y:2.5',
      'read:width',
      'write:width:3.5',
      'read:height',
      'write:height:4.5',
    ])

    expect([
      rectangle.getCenterX(),
      rectangle.getCenterY(),
      rectangle.getRight(),
      rectangle.getBottom(),
    ]).toEqual([3.25, 4.75, 5, 7])

    const coercionRectangle = new Proxy(rectangle, {
      get(_target, property) {
        return { x: '2', y: '3', width: '4', height: '5' }[property as 'x']
      },
    })
    expect(Cubism2FloatRectangle.prototype.getCenterX.call(coercionRectangle)).toBe('22')
    expect(Cubism2FloatRectangle.prototype.getCenterY.call(coercionRectangle)).toBe('32.5')

    const ignoredPoint = Symbol('ignored') as unknown as number
    expect(rectangle.contains?.(ignoredPoint, ignoredPoint)).toBe(true)
    const nullRectangle = new Cubism2FloatRectangle()
    expect(nullRectangle.contains?.(ignoredPoint, ignoredPoint)).toBe(true)
    nullRectangle.x = 0
    nullRectangle.y = 0
    nullRectangle.width = -1
    nullRectangle.height = 1
    expect(nullRectangle.contains?.(ignoredPoint, ignoredPoint)).toBe(false)

    const containsReads: string[] = []
    const nanRectangle = new Proxy(rectangle, {
      get(target, property, receiver) {
        containsReads.push(String(property))
        return property === 'x' ? Number.NaN : Reflect.get(target, property, receiver)
      },
    })
    expect(Cubism2FloatRectangle.prototype.contains.call(nanRectangle, 1, 2)).toBe(false)
    expect(containsReads).toEqual(['x', 'x'])

    const expanded = new Cubism2FloatRectangle()
    const expandOperations: string[] = []
    const observedExpand = new Proxy(expanded, {
      get(target, property, receiver) {
        expandOperations.push(`read:${String(property)}`)
        return Reflect.get(target, property, receiver)
      },
      set(target, property, value, receiver) {
        expandOperations.push(`write:${String(property)}:${String(value)}`)
        return Reflect.set(target, property, value, receiver)
      },
    })
    Cubism2FloatRectangle.prototype.expand.call(observedExpand, 2, 3)
    expect(expandOperations).toEqual([
      'read:x',
      'write:x:-2',
      'read:y',
      'write:y:-3',
      'read:width',
      'write:width:4',
      'read:height',
      'write:height:6',
    ])
    expect(expanded).toMatchObject({ x: -2, y: -3, width: 4, height: 6 })
  })
})
