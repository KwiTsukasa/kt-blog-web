export interface Cubism2RuntimeConstantsLike {
  DEFAULT_PARTS_OPACITY: number
  MODEL_SPACE_COORDINATE_MODE: number
  PARAM_VALUE_EPSILON: number
  POINT_TUPLE_SIZE: number
  POINT_X_OFFSET: number
  POSITION_EPSILON: number
  SDK2_COORDINATE_MODE: number
  FLIP_MODEL_SPACE_UV_Y: boolean
  activeCoordinateMode: number
  maxInterpolationCornerCount: number
  maxTransformParameterDimensionCount: number
}

export interface Cubism2RuntimeConstantsConstructor extends Cubism2RuntimeConstantsLike {
  new (): Record<string, never>
  prototype: Record<string, never>
}

/**
 * Creates the Cubism2 runtime constants holder used by model, draw-data, and interpolation code.
 * @returns Function object with the semantic SDK2 runtime constants.
 */
export function createCubism2RuntimeConstants(): Cubism2RuntimeConstantsConstructor {
  /**
   * Legacy SDK2 namespace constructor; instances are never used, static fields carry the constants.
   */
  function Cubism2RuntimeConstants(): void {}

  const RuntimeConstants = Cubism2RuntimeConstants as unknown as Cubism2RuntimeConstantsConstructor

  RuntimeConstants.MODEL_SPACE_COORDINATE_MODE = 1
  RuntimeConstants.SDK2_COORDINATE_MODE = 2
  RuntimeConstants.POINT_X_OFFSET = 0
  RuntimeConstants.POINT_TUPLE_SIZE = 2
  RuntimeConstants.activeCoordinateMode = RuntimeConstants.MODEL_SPACE_COORDINATE_MODE
  RuntimeConstants.FLIP_MODEL_SPACE_UV_Y = true
  RuntimeConstants.maxTransformParameterDimensionCount = 5
  RuntimeConstants.maxInterpolationCornerCount = 65
  RuntimeConstants.PARAM_VALUE_EPSILON = 0.0001
  RuntimeConstants.POSITION_EPSILON = 0.001
  RuntimeConstants.DEFAULT_PARTS_OPACITY = 3

  return RuntimeConstants
}
