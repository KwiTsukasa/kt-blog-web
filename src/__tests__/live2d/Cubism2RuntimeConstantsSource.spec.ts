import { describe, expect, it } from 'vitest'

import { createCubism2RuntimeConstants } from '../../components/blog/live2d/vendor/cubism2Core/runtimeConstants'

describe('Cubism2 runtime constants immutable source behavior', () => {
  it('preserves reviewed runtimeConstants.ts source behavior through semantic TypeScript', () => {
    const RuntimeConstants = createCubism2RuntimeConstants()

    expect(RuntimeConstants.name).toBe('Cubism2RuntimeConstants')
    expect(Object.keys(new RuntimeConstants())).toEqual([])
    expect(Object.keys(RuntimeConstants)).toEqual([
      'MODEL_SPACE_COORDINATE_MODE',
      'SDK2_COORDINATE_MODE',
      'POINT_X_OFFSET',
      'POINT_TUPLE_SIZE',
      'activeCoordinateMode',
      'FLIP_MODEL_SPACE_UV_Y',
      'maxTransformParameterDimensionCount',
      'maxInterpolationCornerCount',
      'PARAM_VALUE_EPSILON',
      'POSITION_EPSILON',
      'DEFAULT_PARTS_OPACITY',
    ])
    expect({
      coordinateModes: [
        RuntimeConstants.MODEL_SPACE_COORDINATE_MODE,
        RuntimeConstants.SDK2_COORDINATE_MODE,
        RuntimeConstants.activeCoordinateMode,
      ],
      defaults: [
        RuntimeConstants.FLIP_MODEL_SPACE_UV_Y,
        RuntimeConstants.maxTransformParameterDimensionCount,
        RuntimeConstants.maxInterpolationCornerCount,
        RuntimeConstants.PARAM_VALUE_EPSILON,
        RuntimeConstants.POSITION_EPSILON,
        RuntimeConstants.DEFAULT_PARTS_OPACITY,
      ],
      pointTuple: [RuntimeConstants.POINT_X_OFFSET, RuntimeConstants.POINT_TUPLE_SIZE],
    }).toEqual({
      coordinateModes: [1, 2, 1],
      defaults: [true, 5, 65, 0.0001, 0.001, 3],
      pointTuple: [0, 2],
    })

    RuntimeConstants.MODEL_SPACE_COORDINATE_MODE = 99
    expect(RuntimeConstants.activeCoordinateMode).toBe(1)
  })
})
