import type {
  Cubism2WebGLContext,
  Cubism2WebGLFramebufferResources,
  Cubism2WebGLLive2DProfile,
} from './webglDrawParam'

/**
 * Creates the Cubism2 clipping-mask framebuffer resources using the legacy min.js call order.
 * @param gl WebGL context that owns the framebuffer, renderbuffer, and texture handles.
 * @param live2DProfile Live2D static profile carrying the clipping-mask size and texture registry.
 * @param textureSlot Registry slot equivalent to min.js `this.glno`; receives the mask texture handle.
 * @returns Framebuffer, renderbuffer, and the texture handle read back from the registry slot.
 */
export function createCubism2WebGLMaskFramebuffer(
  gl: Cubism2WebGLContext,
  live2DProfile: Cubism2WebGLLive2DProfile,
  textureSlot: number,
): Cubism2WebGLFramebufferResources {
  const bufferSize = live2DProfile.clippingMaskBufferSize
  const framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  const renderbuffer = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, bufferSize, bufferSize)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbuffer)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    bufferSize,
    bufferSize,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  live2DProfile.fTexture[textureSlot] = texture
  return {
    framebuffer,
    renderbuffer,
    texture: live2DProfile.fTexture[textureSlot],
  }
}
