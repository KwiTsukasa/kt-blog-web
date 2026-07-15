export interface Cubism2WebGLUniformBounds {
  x: number
  y: number
  getRight: () => number
  getBottom: () => number
}

export interface Cubism2WebGLUniformClipContext {
  layoutBounds: Cubism2WebGLUniformBounds
  layoutChannelNo: number
  matrixForDraw: Float32Array | number[]
  matrixForMask: Float32Array | number[]
}

export interface Cubism2WebGLUniformColor {
  a: number
  b: number
  g: number
  r: number
}

export interface Cubism2WebGLUniformDrawParam {
  matrix4x4: Float32Array | number[]
  u_baseColor_Loc: WebGLUniformLocation | null
  u_baseColor_Loc_Off: WebGLUniformLocation | null
  u_channelFlag: WebGLUniformLocation | null
  u_channelFlag_Loc_Off: WebGLUniformLocation | null
  u_clipMatrix_Loc_Off: WebGLUniformLocation | null
  u_maskFlag_Loc: WebGLUniformLocation | null
  u_matrix_Loc: WebGLUniformLocation | null
  u_matrix_Loc_Off: WebGLUniformLocation | null
  getChannelFlagAsColor: (channelIndex: number) => Cubism2WebGLUniformColor
  getClipBufPre_clipContextDraw: () => Cubism2WebGLUniformClipContext | null
  getClipBufPre_clipContextMask: () => Cubism2WebGLUniformClipContext | null
}

/**
 * Applies the shader uniforms used while drawing one drawable into the clipping mask.
 * @param gl WebGL context receiving matrix, channel, bounds, and mask-flag uniforms.
 * @param drawParam Draw parameter exposing the current mask clip context and shader locations.
 */
export function applyCubism2WebGLMaskUniforms(
  gl: WebGLRenderingContext,
  drawParam: Cubism2WebGLUniformDrawParam,
): void {
  const clipContext = drawParam.getClipBufPre_clipContextMask()!
  gl.uniformMatrix4fv(drawParam.u_matrix_Loc, false, clipContext.matrixForMask)
  const maskChannelColor = drawParam.getChannelFlagAsColor(clipContext.layoutChannelNo)
  gl.uniform4f(
    drawParam.u_channelFlag,
    maskChannelColor.r,
    maskChannelColor.g,
    maskChannelColor.b,
    maskChannelColor.a,
  )
  const maskLayoutBounds = clipContext.layoutBounds
  gl.uniform4f(
    drawParam.u_baseColor_Loc,
    maskLayoutBounds.x * 2 - 1,
    maskLayoutBounds.y * 2 - 1,
    maskLayoutBounds.getRight() * 2 - 1,
    maskLayoutBounds.getBottom() * 2 - 1,
  )
  gl.uniform1i(drawParam.u_maskFlag_Loc, true as unknown as number)
}

/**
 * Applies the shader uniforms used while drawing one clipped drawable to the model framebuffer.
 * @param gl WebGL context receiving clip matrix, model matrix, channel, and base-color uniforms.
 * @param drawParam Draw parameter exposing the current draw clip context and shader locations.
 * @param baseRed Final red multiplier calculated from texture, opacity, parts, and base data.
 * @param baseGreen Final green multiplier calculated from texture, opacity, parts, and base data.
 * @param baseBlue Final blue multiplier calculated from texture, opacity, parts, and base data.
 * @param baseAlpha Final alpha multiplier calculated from texture, opacity, parts, and base data.
 * @param bindGeneratedMaskTexture Callback that preserves the min.js texture bind between matrix and color uniforms.
 */
export function applyCubism2WebGLClippedUniforms(
  gl: WebGLRenderingContext,
  drawParam: Cubism2WebGLUniformDrawParam,
  baseRed: number,
  baseGreen: number,
  baseBlue: number,
  baseAlpha: number,
  bindGeneratedMaskTexture: () => void,
): void {
  const clipContext = drawParam.getClipBufPre_clipContextDraw()!
  gl.uniformMatrix4fv(drawParam.u_clipMatrix_Loc_Off, false, clipContext.matrixForDraw)
  gl.uniformMatrix4fv(drawParam.u_matrix_Loc_Off, false, drawParam.matrix4x4)
  bindGeneratedMaskTexture()
  const maskChannelColor = drawParam.getChannelFlagAsColor(clipContext.layoutChannelNo)
  gl.uniform4f(
    drawParam.u_channelFlag_Loc_Off,
    maskChannelColor.r,
    maskChannelColor.g,
    maskChannelColor.b,
    maskChannelColor.a,
  )
  gl.uniform4f(drawParam.u_baseColor_Loc_Off, baseRed, baseGreen, baseBlue, baseAlpha)
}

/**
 * Applies the shader uniforms used while drawing one unclipped drawable to the model framebuffer.
 * @param gl WebGL context receiving model matrix, base-color, and disabled mask-flag uniforms.
 * @param drawParam Draw parameter exposing shader locations and the current model matrix.
 * @param baseRed Final red multiplier calculated from texture, opacity, parts, and base data.
 * @param baseGreen Final green multiplier calculated from texture, opacity, parts, and base data.
 * @param baseBlue Final blue multiplier calculated from texture, opacity, parts, and base data.
 * @param baseAlpha Final alpha multiplier calculated from texture, opacity, parts, and base data.
 */
export function applyCubism2WebGLUnclippedUniforms(
  gl: WebGLRenderingContext,
  drawParam: Cubism2WebGLUniformDrawParam,
  baseRed: number,
  baseGreen: number,
  baseBlue: number,
  baseAlpha: number,
): void {
  gl.uniformMatrix4fv(drawParam.u_matrix_Loc, false, drawParam.matrix4x4)
  gl.uniform4f(drawParam.u_baseColor_Loc, baseRed, baseGreen, baseBlue, baseAlpha)
  gl.uniform1i(drawParam.u_maskFlag_Loc, false as unknown as number)
}
