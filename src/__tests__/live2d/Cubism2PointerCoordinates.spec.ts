import { describe, expect, it } from 'vitest'

import { toCubism2ViewPoint } from '../../components/blog/live2d/runtime/cubism2PointerCoordinates'

describe('Cubism2 pointer coordinates', () => {
  it('uses canvas-local coordinates and canvas width for both source axes', () => {
    const canvas = {
      getBoundingClientRect: () => ({
        bottom: 270,
        height: 250,
        left: 10,
        right: 290,
        top: 20,
        width: 280,
        x: 10,
        y: 20,
        toJSON: () => ({}),
      }),
      height: 500,
      width: 560,
    }

    expect(toCubism2ViewPoint(canvas, { clientX: 10, clientY: 20 })).toEqual({
      x: -1,
      y: 500 / 560,
    })
    expect(toCubism2ViewPoint(canvas, { clientX: 290, clientY: 270 })).toEqual({
      x: 1,
      y: -500 / 560,
    })
    expect(toCubism2ViewPoint(canvas, { clientX: 150, clientY: 145 })).toEqual({
      x: 0,
      y: 0,
    })
  })
})
