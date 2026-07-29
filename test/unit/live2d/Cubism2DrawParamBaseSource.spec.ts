import { describe, expect, it } from 'vitest'

import { createCubism2DrawParamBase } from '../../../src/components/blog/live2d/vendor/cubism2Core/drawParamBase'

describe('Cubism2 draw-param base immutable source behavior', () => {
  it('preserves reviewed drawParamBase.ts source behavior through semantic TypeScript', () => {
    const { Cubism2DrawParamBase, Cubism2RgbaColor } = createCubism2DrawParamBase({
      Live2D: { COLOR_BLEND_MODE_MULTIPLY: 7 },
      isBootstrapping: () => false,
    })
    const drawParam = new Cubism2DrawParamBase()

    expect(Cubism2DrawParamBase.initialTextureCapacity).toBe(32)
    expect(drawParam.textureCapacity).toBe(32)
    expect(Object.keys(drawParam).slice(0, 5)).toEqual([
      'textureCapacity',
      'baseAlpha',
      'baseRed',
      'baseGreen',
      'baseBlue',
    ])

    const color = new Cubism2RgbaColor()
    expect(Object.keys(color)).toEqual(['a', 'r', 'g', 'b', 'scale', 'unitScalar', 'blendMode'])
    expect(color.unitScalar).toBe(1)
    expect(color.blendMode).toBe(7)

    drawParam.setBaseColor(-1, 2, 0.25, 0.75)
    expect([
      drawParam.baseAlpha,
      drawParam.baseRed,
      drawParam.baseGreen,
      drawParam.baseBlue,
    ]).toEqual([0, 1, 0.25, 0.75])

    drawParam.baseAlpha = 0.1
    drawParam.baseRed = 0.2
    drawParam.baseGreen = 0.3
    drawParam.baseBlue = 0.4
    const throwingChannel = {
      [Symbol.toPrimitive]() {
        throw new Error('blue coercion failed')
      },
    }

    expect(() =>
      drawParam.setBaseColor(0.9, 0.8, 0.7, throwingChannel as unknown as number),
    ).toThrow('blue coercion failed')
    expect([
      drawParam.baseAlpha,
      drawParam.baseRed,
      drawParam.baseGreen,
      drawParam.baseBlue,
    ]).toEqual([0.1, 0.2, 0.3, 0.4])
  })
})
