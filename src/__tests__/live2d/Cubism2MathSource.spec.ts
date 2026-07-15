import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { createCubism2Math } from '../../components/blog/live2d/vendor/cubism2Core/compatibility/math'

const SEMANTIC_STATIC_KEYS = [
  'DEGREES_TO_RADIANS',
  'RADIANS_TO_DEGREES',
  'PI',
  'SIN_LOOKUP_TABLE',
  'normalizeRadianDelta',
  'angleBetweenVectors',
  'sin',
  'cos',
  'randomUnit',
] as const

/** Creates an index-readable vector that records semantic property access order. */
function createObservedVector(label: string, reads: string[], values: [number, number]): number[] {
  return new Proxy(values, {
    get(target, property, receiver) {
      if (property === '0' || property === '1') {
        reads.push(`${label}:${property}`)
      }
      return Reflect.get(target, property, receiver)
    },
  })
}

describe('Cubism2Math immutable source behavior', () => {
  it('exposes only semantic math operations without a compatibility mapping layer', () => {
    const math = createCubism2Math({ random: () => 0.25 })

    expect(math.name).toBe('Cubism2Math')
    expect(Object.keys(math)).toEqual(SEMANTIC_STATIC_KEYS)
    expect(math.DEGREES_TO_RADIANS).toBe(Math.PI / 180)
    expect(math.RADIANS_TO_DEGREES).toBe(180 / Math.PI)
    expect(math.PI).toBe(Math.PI)
    expect(math.randomUnit()).toBe(0.25)
  })

  it('preserves the source lookup table and vector read order through semantic APIs', () => {
    const math = createCubism2Math()
    const reads: string[] = []
    const fromVector = createObservedVector('fromVector', reads, [1, 0])
    const toVector = createObservedVector('toVector', reads, [0, 1])

    expect(math.SIN_LOOKUP_TABLE).toHaveLength(128)
    expect(math.SIN_LOOKUP_TABLE[0]).toBe(0)
    expect(math.SIN_LOOKUP_TABLE.at(-1)).toBe(1)
    expect(createHash('sha256').update(JSON.stringify(math.SIN_LOOKUP_TABLE)).digest('hex')).toBe(
      'b03402064674f41c151b0f95143e6b1ca93a905955defd820fde3b389465d00a',
    )
    expect(math.angleBetweenVectors(fromVector, toVector)).toBe(-Math.PI / 2)
    expect(reads).toEqual(['fromVector:1', 'fromVector:0', 'toVector:1', 'toVector:0'])
  })

  it('preserves inclusive angular boundaries and repeated wrapping', () => {
    const math = createCubism2Math()

    expect(math.normalizeRadianDelta(-Math.PI, 0)).toBe(-Math.PI)
    expect(math.normalizeRadianDelta(Math.PI, 0)).toBe(Math.PI)
    expect(math.normalizeRadianDelta(-5 * Math.PI, 0)).toBe(-Math.PI)
    expect(math.normalizeRadianDelta(5 * Math.PI, 0)).toBe(Math.PI)
    expect(Object.is(math.normalizeRadianDelta(-0, 0), -0)).toBe(true)
    expect(Number.isNaN(math.normalizeRadianDelta(Number.NaN, 0))).toBe(true)
  })

  it('delegates semantic sine directly to native Math with native coercion', () => {
    const math = createCubism2Math()
    const failure = new Error('sin conversion failed')

    expect(Object.is(math.sin(-0), Math.sin(-0))).toBe(true)
    expect(Number.isNaN(math.sin(Number.NaN))).toBe(true)
    expect(math.sin({ valueOf: () => Math.PI / 2 } as unknown as number)).toBe(1)
    expect(() =>
      math.sin({ valueOf: () => { throw failure } } as unknown as number),
    ).toThrow(failure)
  })

  it('delegates semantic cosine directly to native Math with native coercion', () => {
    const math = createCubism2Math()
    const failure = new Error('cos conversion failed')

    expect(math.cos(-0)).toBe(Math.cos(-0))
    expect(Number.isNaN(math.cos(Number.NaN))).toBe(true)
    expect(math.cos({ valueOf: () => Math.PI } as unknown as number)).toBe(-1)
    expect(() =>
      math.cos({ valueOf: () => { throw failure } } as unknown as number),
    ).toThrow(failure)
  })
})
