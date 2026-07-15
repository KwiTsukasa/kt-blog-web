export interface Cubism2WebGLTextureRegistry {
  fTexture: unknown[]
}

/**
 * Binds the drawable source texture to the Cubism2 mesh sampler.
 * @param gl WebGL context receiving the texture-unit, binding, and sampler uniform writes.
 * @param textures Draw-param texture slots populated by the runtime image loader.
 * @param textureIndex Drawable texture slot selected by the current draw data.
 * @param samplerLocation Shader sampler uniform that must read from texture unit 1.
 */
export function bindCubism2WebGLSourceTexture(
  gl: WebGLRenderingContext,
  textures: ArrayLike<unknown>,
  textureIndex: number,
  samplerLocation: WebGLUniformLocation | null,
): void {
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, textures[textureIndex] as WebGLTexture)
  gl.uniform1i(samplerLocation, 1)
}

/**
 * Binds the generated clipping mask texture to the Cubism2 clipped-mesh sampler.
 * @param gl WebGL context receiving the texture-unit, binding, and sampler uniform writes.
 * @param textureRegistry Legacy Live2D texture registry where mask framebuffers store textures.
 * @param textureSlot Registry slot tied to the draw-param WebGL index.
 * @param samplerLocation Clipped shader sampler uniform that must read from texture unit 2.
 */
export function bindCubism2WebGLGeneratedMaskTexture(
  gl: WebGLRenderingContext,
  textureRegistry: Cubism2WebGLTextureRegistry,
  textureSlot: number,
  samplerLocation: WebGLUniformLocation | null,
): void {
  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, textureRegistry.fTexture[textureSlot] as WebGLTexture)
  gl.uniform1i(samplerLocation, 2)
}
