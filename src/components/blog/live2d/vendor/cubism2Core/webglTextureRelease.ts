export interface Cubism2WebGLTextureReleaseContext {
  releaseTextureAtIndex: (deleteMode: number, textures: unknown[], textureIndex: number) => void
}

export interface Cubism2WebGLTextureReleaseHookTarget {
  releaseTextureAtIndex?: (deleteMode: number, textures: unknown[], textureIndex: number) => void
  deleteTexture: (texture: WebGLTexture | null) => void
}

/**
 * Installs the Cubism2 texture deletion hook onto a native WebGL context.
 * @param gl WebGL context that will be registered into the Cubism2 v2 global runtime.
 * @returns Nothing; mutates the context by adding `releaseTextureAtIndex` when it is missing.
 */
export function installCubism2WebGLTextureReleaseHook(
  gl: Cubism2WebGLTextureReleaseHookTarget,
): asserts gl is Cubism2WebGLTextureReleaseHookTarget & Cubism2WebGLTextureReleaseContext {
  if (typeof gl.releaseTextureAtIndex === 'function') {
    return
  }

  gl.releaseTextureAtIndex = function releaseCubism2Texture(
    deleteMode: number,
    textures: unknown[],
    textureIndex: number,
  ): void {
    const texture = textures[textureIndex]
    if (texture != null) {
      gl.deleteTexture(texture as WebGLTexture)
    }
    void deleteMode
  }
}

/**
 * Releases owned WebGL texture slots with the same loose-empty check used by the source min.js.
 * @param gl WebGL context carrying the legacy texture deletion hook.
 * @param textures Mutable draw-param texture registry; released slots are cleared in place.
 */
export function releaseCubism2WebGLTextures(
  gl: Cubism2WebGLTextureReleaseContext,
  textures: unknown[],
): void {
  if (typeof gl.releaseTextureAtIndex !== 'function') {
    throw new Error('Cubism2 WebGL texture release hook is not installed')
  }

  for (let textureIndex = 0; textureIndex < textures.length; textureIndex++) {
    const texture = textures[textureIndex]
    if (texture != 0) {
      gl.releaseTextureAtIndex(1, textures, textureIndex)
      textures[textureIndex] = null
    }
  }
}
