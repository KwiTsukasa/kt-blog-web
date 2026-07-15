import type { Cubism2WebGLContext } from './webglDrawParam'

/**
 * Enables one Cubism2 WebGL vertex attribute and points it at the currently bound ARRAY_BUFFER.
 * @param gl WebGL context whose current ARRAY_BUFFER binding was prepared by the caller in min.js order.
 * @param attributeLocation Shader attribute location resolved from `a_position` or `a_texCoord`.
 */
export function enableCubism2WebGLAttributePointer(
  gl: Cubism2WebGLContext,
  attributeLocation: number,
): void {
  gl.enableVertexAttribArray(attributeLocation)
  gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0)
}
