import { describe, expect, it } from 'vitest'

import {
  toCubism2ModelPoint,
  toCubism2PageTarget,
} from '../../../src/components/blog/live2d/runtime/cubism2PointerCoordinates'

describe('Cubism2 pointer coordinates', () => {
  const canvas = {
    getBoundingClientRect: () => ({
      bottom: 720,
      height: 250,
      left: 0,
      right: 280,
      top: 470,
      width: 280,
      x: 0,
      y: 470,
      toJSON: () => ({}),
    }),
    height: 500,
    width: 560,
  }

  it('preserves source canvas-local coordinates for model hit testing', () => {
    expect(toCubism2ModelPoint(canvas, { clientX: 0, clientY: 470 })).toEqual({
      x: -1,
      y: 500 / 560,
    })
    expect(toCubism2ModelPoint(canvas, { clientX: 280, clientY: 720 })).toEqual({
      x: 1,
      y: -500 / 560,
    })
    expect(toCubism2ModelPoint(canvas, { clientX: 140, clientY: 595 })).toEqual({
      x: 0,
      y: 0,
    })
  })

  it('uses the whole viewport as a continuous page-level look-at range', () => {
    const viewport = { innerHeight: 720, innerWidth: 1280 }

    expect(toCubism2PageTarget(canvas, viewport, { clientX: 140, clientY: 595 })).toEqual({
      x: 0,
      y: 0,
    })
    expect(toCubism2PageTarget(canvas, viewport, { clientX: 0, clientY: 595 })).toEqual({
      x: -1,
      y: 0,
    })
    expect(toCubism2PageTarget(canvas, viewport, { clientX: 1280, clientY: 595 })).toEqual({
      x: 1,
      y: 0,
    })
    expect(toCubism2PageTarget(canvas, viewport, { clientX: 140, clientY: 0 })).toEqual({
      x: 0,
      y: 500 / 560,
    })
    expect(toCubism2PageTarget(canvas, viewport, { clientX: 140, clientY: 720 })).toEqual({
      x: 0,
      y: -500 / 560,
    })
  })

  it('retains page-level distance after the pointer leaves the canvas', () => {
    const viewport = { innerHeight: 720, innerWidth: 1280 }
    const near = toCubism2PageTarget(canvas, viewport, { clientX: 300, clientY: 595 })
    const middle = toCubism2PageTarget(canvas, viewport, { clientX: 640, clientY: 595 })
    const far = toCubism2PageTarget(canvas, viewport, { clientX: 1200, clientY: 595 })

    expect(near.x).toBeCloseTo(160 / 1140)
    expect(middle.x).toBeCloseTo(500 / 1140)
    expect(far.x).toBeCloseTo(1060 / 1140)
    expect(near.x).toBeLessThan(middle.x)
    expect(middle.x).toBeLessThan(far.x)
  })
})
