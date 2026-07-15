import type {
  Cubism2WebGLBlendModes,
  Cubism2WebGLContext,
} from './webglDrawParam'

export interface Cubism2WebGLBlendFactors {
  dstAlphaBlendFactor: number | undefined
  dstRgbBlendFactor: number | undefined
  srcAlphaBlendFactor: number | undefined
  srcRgbBlendFactor: number | undefined
}

export interface Cubism2WebGLBlendFactorInput {
  blendMode: number
  blendModes: Cubism2WebGLBlendModes
  gl: Cubism2WebGLContext
  isMaskDraw: boolean
}

/**
 * Builds the source-over alpha blend tuple used by mask drawing and normal drawable compositing.
 * @param gl WebGL context that supplies runtime numeric constants.
 * @returns Blend factors matching the min.js `ONE, ONE_MINUS_SRC_ALPHA, ONE, ONE_MINUS_SRC_ALPHA` tuple.
 */
function createSourceOverBlendFactors(gl: Cubism2WebGLContext): Cubism2WebGLBlendFactors {
  return {
    dstAlphaBlendFactor: gl.ONE_MINUS_SRC_ALPHA,
    dstRgbBlendFactor: gl.ONE_MINUS_SRC_ALPHA,
    srcAlphaBlendFactor: gl.ONE,
    srcRgbBlendFactor: gl.ONE,
  }
}

/**
 * Builds the additive drawable blend tuple used by Cubism2 add mode.
 * @param gl WebGL context that supplies runtime numeric constants.
 * @returns Blend factors matching the min.js `ONE, ONE, ZERO, ONE` tuple.
 */
function createAdditiveBlendFactors(gl: Cubism2WebGLContext): Cubism2WebGLBlendFactors {
  return {
    dstAlphaBlendFactor: gl.ONE,
    dstRgbBlendFactor: gl.ONE,
    srcAlphaBlendFactor: gl.ZERO,
    srcRgbBlendFactor: gl.ONE,
  }
}

/**
 * Builds the multiplicative drawable blend tuple used by Cubism2 multiply mode.
 * @param gl WebGL context that supplies runtime numeric constants.
 * @returns Blend factors matching the min.js `DST_COLOR, ONE_MINUS_SRC_ALPHA, ZERO, ONE` tuple.
 */
function createMultiplicativeBlendFactors(gl: Cubism2WebGLContext): Cubism2WebGLBlendFactors {
  return {
    dstAlphaBlendFactor: gl.ONE,
    dstRgbBlendFactor: gl.ONE_MINUS_SRC_ALPHA,
    srcAlphaBlendFactor: gl.ZERO,
    srcRgbBlendFactor: gl.DST_COLOR,
  }
}

/**
 * Preserves the legacy min.js behavior for an unknown blend mode by leaving all factors unset.
 * @returns Undefined blend factors that the caller forwards unchanged for compatibility.
 */
function createUnresolvedBlendFactors(): Cubism2WebGLBlendFactors {
  return {
    dstAlphaBlendFactor: undefined,
    dstRgbBlendFactor: undefined,
    srcAlphaBlendFactor: undefined,
    srcRgbBlendFactor: undefined,
  }
}

/**
 * Resolves Cubism2 WebGL blend factors from the min.js branch table without touching draw state.
 * @param input Runtime blend context; `isMaskDraw` overrides drawable blend mode just like min.js.
 * @returns Source/destination RGB and alpha factors to pass to `blendFuncSeparate`.
 */
export function resolveCubism2WebGLBlendFactors(
  input: Cubism2WebGLBlendFactorInput,
): Cubism2WebGLBlendFactors {
  if (input.isMaskDraw) {
    return createSourceOverBlendFactors(input.gl)
  }
  switch (input.blendMode) {
    case input.blendModes.BLEND_NORMAL:
      return createSourceOverBlendFactors(input.gl)
    case input.blendModes.BLEND_ADD:
      return createAdditiveBlendFactors(input.gl)
    case input.blendModes.BLEND_MULTIPLY:
      return createMultiplicativeBlendFactors(input.gl)
    default:
      return createUnresolvedBlendFactors()
  }
}
