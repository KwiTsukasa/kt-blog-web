import { resolveCubism2WebGLBlendFactors } from './webglBlendFactors'
import type {
  Cubism2AnisotropyExtension,
  Cubism2WebGLBlendModes,
  Cubism2WebGLContext,
} from './webglDrawParam'

export interface Cubism2WebGLDrawTailState {
  anisotropyExt: Cubism2AnisotropyExtension | null
  clipBufPre_clipContextMask: unknown
  culling: boolean
  maxAnisotropy: number
}

/**
 * Applies the min.js culling, blend, anisotropy, draw, and texture-release tail for one WebGL primitive.
 * @param gl WebGL context receiving state changes and the final draw call.
 * @param drawState Draw parameter state that controls culling, mask blend override, and anisotropy.
 * @param blendMode Cubism2 draw-data blend mode for non-mask drawing.
 * @param blendModes Legacy Cubism2 blend-mode constants used by the min.js branch table.
 * @param elementCount Number of triangle indexes submitted to `drawElements`; min.js uses the uploaded index array length.
 */
export function applyCubism2WebGLDrawTail(
  gl: Cubism2WebGLContext,
  drawState: Cubism2WebGLDrawTailState,
  blendMode: number,
  blendModes: Cubism2WebGLBlendModes,
  elementCount: number,
): void {
  if (drawState.culling) {
    gl.enable(gl.CULL_FACE)
  } else {
    gl.disable(gl.CULL_FACE)
  }

  gl.enable(gl.BLEND)

  const blendFactors = resolveCubism2WebGLBlendFactors({
    blendMode,
    blendModes,
    gl,
    isMaskDraw: drawState.clipBufPre_clipContextMask != null,
  })
  gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD)
  gl.blendFuncSeparate(
    blendFactors.srcRgbBlendFactor!,
    blendFactors.dstRgbBlendFactor!,
    blendFactors.srcAlphaBlendFactor!,
    blendFactors.dstAlphaBlendFactor!,
  )

  if (drawState.anisotropyExt) {
    gl.texParameteri(
      gl.TEXTURE_2D,
      drawState.anisotropyExt.TEXTURE_MAX_ANISOTROPY_EXT,
      drawState.maxAnisotropy,
    )
  }

  gl.drawElements(gl.TRIANGLES, elementCount, gl.UNSIGNED_SHORT, 0)
  gl.bindTexture(gl.TEXTURE_2D, null)
}
