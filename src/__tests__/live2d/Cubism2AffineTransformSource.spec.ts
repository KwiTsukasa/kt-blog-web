import { describe, expect, it, vi } from 'vitest'

import { createCubism2AffineTransform } from '../../components/blog/live2d/vendor/cubism2Core/affineTransform'

describe('Cubism2 affine transform immutable source constructor behavior', () => {
  it('preserves reviewed affineTransform.ts source behavior through semantic TypeScript', () => {
    let bootstrapping = false
    const AffineTransform = createCubism2AffineTransform({
      UtSystem: { copyArraySegmentForward: vi.fn() },
      isBootstrapping: () => bootstrapping,
    })

    expect(new AffineTransform(9, 8, 7)).toMatchObject({
      copyMode: AffineTransform.COPY_MODE_IDENTITY,
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
      stateFlags: AffineTransform.STATE_IDENTITY,
      translateX: 0,
      translateY: 0,
    })

    bootstrapping = true
    expect(Object.keys(new AffineTransform())).toEqual([])
  })
})
