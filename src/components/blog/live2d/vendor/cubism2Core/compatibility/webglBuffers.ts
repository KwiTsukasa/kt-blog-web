import type { Cubism2WebGLContext } from './webglDrawParam'

/**
 * Creates or reuses a WebGL array buffer and uploads vertex or UV values with the legacy draw hint.
 * @param gl WebGL context that owns the buffer and receives the upload.
 * @param buffer Existing ARRAY_BUFFER handle; null triggers the min.js `createBuffer` path.
 * @param values Vertex or texture-coordinate values uploaded with `DYNAMIC_DRAW`.
 * @returns The created or reused buffer handle.
 */
export function uploadCubism2WebGLArrayBuffer(
  gl: Cubism2WebGLContext,
  buffer: WebGLBuffer | null,
  values: ArrayLike<number>,
): WebGLBuffer | null {
  let nextBuffer = buffer
  if (nextBuffer == null) {
    nextBuffer = gl.createBuffer()
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, nextBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, values as unknown as BufferSource, gl.DYNAMIC_DRAW)
  return nextBuffer
}

/**
 * Creates or reuses a WebGL element-array buffer and uploads triangle indexes with the legacy draw hint.
 * @param gl WebGL context that owns the buffer and receives the upload.
 * @param buffer Existing ELEMENT_ARRAY_BUFFER handle; null triggers the min.js `createBuffer` path.
 * @param values Triangle index values uploaded with `DYNAMIC_DRAW`.
 * @returns The created or reused buffer handle.
 */
export function uploadCubism2WebGLElementArrayBuffer(
  gl: Cubism2WebGLContext,
  buffer: WebGLBuffer | null,
  values: ArrayLike<number>,
): WebGLBuffer | null {
  let nextBuffer = buffer
  if (nextBuffer == null) {
    nextBuffer = gl.createBuffer()
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, nextBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, values as unknown as BufferSource, gl.DYNAMIC_DRAW)
  return nextBuffer
}
