/**
 * Names the four GLSL payloads emitted by the legacy Cubism2 `loadShaders2` path.
 *
 * The fields model shader roles, not compile order; `webglDrawParam.ts` owns the exact
 * WebGL compile sequence to preserve min.js behavior.
 */
export interface Cubism2WebGLShaderSourceCatalog {
  clippedMeshFragment: string
  clippedMeshVertex: string
  meshFragment: string
  meshVertex: string
}

/**
 * GLSL source strings copied byte-for-byte from the WordPress Cubism2 min.js `loadShaders2` body.
 *
 * The internal whitespace is intentional: the compatibility layer compares and compiles the same
 * source payloads the legacy runtime emitted, so this catalog should only change with min.js
 * provenance evidence.
 */
export const CUBISM2_WEBGL_SHADER_SOURCES: Cubism2WebGLShaderSourceCatalog = {
  clippedMeshFragment:
    'precision mediump float ;varying vec2       v_texCoord;varying vec4       v_ClipPos;uniform sampler2D  s_texture0;uniform sampler2D  s_texture1;uniform vec4       u_channelFlag;uniform vec4       u_baseColor ;void main(){    vec4 col_formask = texture2D(s_texture0, v_texCoord) * u_baseColor;    vec4 clipMask = texture2D(s_texture1, v_ClipPos.xy / v_ClipPos.w) * u_channelFlag;    float maskVal = clipMask.r + clipMask.g + clipMask.b + clipMask.a;    col_formask = col_formask * maskVal;    gl_FragColor = col_formask;}',
  clippedMeshVertex:
    'attribute vec4     a_position;attribute vec2     a_texCoord;varying vec2       v_texCoord;varying vec4       v_ClipPos;uniform mat4       u_mvpMatrix;uniform mat4       u_ClipMatrix;void main(){    gl_Position = u_mvpMatrix * a_position;    v_ClipPos = u_ClipMatrix * a_position;    v_texCoord = a_texCoord ;}',
  meshFragment:
    'precision mediump float;varying vec2       v_texCoord;varying vec4       v_ClipPos;uniform sampler2D  s_texture0;uniform vec4       u_channelFlag;uniform vec4       u_baseColor;uniform bool       u_maskFlag;void main(){    vec4 smpColor;     if(u_maskFlag){        float isInside =             step(u_baseColor.x, v_ClipPos.x/v_ClipPos.w)          * step(u_baseColor.y, v_ClipPos.y/v_ClipPos.w)          * step(v_ClipPos.x/v_ClipPos.w, u_baseColor.z)          * step(v_ClipPos.y/v_ClipPos.w, u_baseColor.w);        smpColor = u_channelFlag * texture2D(s_texture0 , v_texCoord).a * isInside;    }else{        smpColor = texture2D(s_texture0 , v_texCoord) * u_baseColor;    }    gl_FragColor = smpColor;}',
  meshVertex:
    'attribute vec4     a_position;attribute vec2     a_texCoord;varying vec2       v_texCoord;varying vec4       v_ClipPos;uniform mat4       u_mvpMatrix;void main(){    gl_Position = u_mvpMatrix * a_position;    v_ClipPos = u_mvpMatrix * a_position;    v_texCoord = a_texCoord;}',
}
