import { describe, expect, it } from 'vitest'

import { createCubism2DrawContextBase } from '../../../src/components/blog/live2d/vendor/cubism2Core/drawContextBase'

describe('Cubism2 draw-context base immutable source behavior', () => {
  it('preserves reviewed drawContextBase.ts source behavior through semantic TypeScript', () => {
    const DrawContextBase = createCubism2DrawContextBase({ isBootstrapping: () => false })
    const writes: Array<[PropertyKey, unknown]> = []
    const receiver = new Proxy<Record<PropertyKey, unknown>>(
      {},
      {
        set(target, property, value) {
          writes.push([property, value])
          target[property] = value
          return true
        },
      },
    )

    ;(DrawContextBase as unknown as { call: (target: object, value?: unknown) => void }).call(
      receiver,
      'source-draw-data',
    )

    expect(writes.map(([property]) => property)).toEqual([
      'sourceDrawData',
      'partsIndex',
      'drawOrder',
      'interpolatedOpacity',
      'clippedFlagRef',
      'partsOpacity',
      'isActive',
      'baseOpacity',
      'clippingContext',
      'sourceDrawData',
    ])
    expect(writes[0]?.[1]).toBeNull()
    expect(writes.at(-1)?.[1]).toBe('source-draw-data')

    const context = new DrawContextBase()
    expect(context.sourceDrawData).toBeUndefined()
    ;(context.clippedFlagRef as unknown[])[0] = 1
    expect(context.isClipped()).toBe(1)
    expect(context.isRenderable()).toBe(false)
    ;(context.clippedFlagRef as unknown[])[0] = 0
    expect(context.isRenderable()).toBe(true)
  })
})
