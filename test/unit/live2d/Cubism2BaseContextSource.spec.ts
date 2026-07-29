import { describe, expect, it } from 'vitest'

import { createCubism2BaseContext } from '../../../src/components/blog/live2d/vendor/cubism2Core/baseContext'

describe('Cubism2 base context immutable source behavior', () => {
  it('preserves reviewed baseContext.ts source behavior through semantic TypeScript', () => {
    const BaseContext = createCubism2BaseContext({ isBootstrapping: () => false })
    const writes: Array<{ property: string; value: unknown }> = []
    const storedValues = new WeakMap<object, Record<string, unknown>>()
    const observedProperties = [
      'sourceData',
      'partsIndex',
      'hasTransformFlag',
      'isActive',
      'totalScale',
      'interpolatedOpacity',
      'totalOpacity',
    ] as const

    for (const property of observedProperties) {
      Object.defineProperty(BaseContext.prototype, property, {
        configurable: true,
        get() {
          return storedValues.get(this)?.[property]
        },
        set(value: unknown) {
          const values = storedValues.get(this) ?? {}
          values[property] = value
          storedValues.set(this, values)
          writes.push({ property, value })
        },
      })
    }

    const sourceData = Symbol('source data')
    const context = new BaseContext(sourceData)

    expect(writes).toEqual([
      { property: 'sourceData', value: null },
      { property: 'partsIndex', value: null },
      { property: 'hasTransformFlag', value: false },
      { property: 'isActive', value: true },
      { property: 'sourceData', value: sourceData },
      { property: 'totalScale', value: 1 },
      { property: 'interpolatedOpacity', value: 1 },
      { property: 'totalOpacity', value: 1 },
    ])
    expect(context.getSourceData()).toBe(sourceData)
    expect(context.getTotalOpacity()).toBe(1)
    expect(BaseContext.prototype.getTotalOpacity.length).toBe(1)
    expect(new BaseContext().getSourceData()).toBeUndefined()
  })
})
