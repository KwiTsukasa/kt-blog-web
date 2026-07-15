import type {
  Cubism2WebGLContext,
  Cubism2WebGLDrawParamInstance,
} from './webglDrawParam'

const NORMAL_SHADER_LOCATION_NAMES = {
  positionAttribute: 'a_position',
  texCoordAttribute: 'a_texCoord',
  matrixUniform: 'u_mvpMatrix',
  sourceTextureUniform: 's_texture0',
  channelFlagUniform: 'u_channelFlag',
  baseColorUniform: 'u_baseColor',
  maskFlagUniform: 'u_maskFlag',
} as const

const CLIPPED_SHADER_LOCATION_NAMES = {
  positionAttribute: 'a_position',
  texCoordAttribute: 'a_texCoord',
  matrixUniform: 'u_mvpMatrix',
  clipMatrixUniform: 'u_ClipMatrix',
  sourceTextureUniform: 's_texture0',
  maskTextureUniform: 's_texture1',
  channelFlagUniform: 'u_channelFlag',
  baseColorUniform: 'u_baseColor',
} as const

/**
 * Caches the attribute and uniform locations queried by the legacy min.js `initShader` body.
 * @param drawParam WebGL draw parameter whose shader programs were just linked by `loadShaders2`.
 * @param gl WebGL context used by the draw parameter; location queries must keep min.js order.
 */
export function cacheCubism2WebGLShaderLocations(
  drawParam: Cubism2WebGLDrawParamInstance,
  gl: Cubism2WebGLContext,
): void {
  drawParam.a_position_Loc = gl.getAttribLocation(
    drawParam.shaderProgram as WebGLProgram,
    NORMAL_SHADER_LOCATION_NAMES.positionAttribute,
  )
  drawParam.a_texCoord_Loc = gl.getAttribLocation(
    drawParam.shaderProgram as WebGLProgram,
    NORMAL_SHADER_LOCATION_NAMES.texCoordAttribute,
  )
  drawParam.u_matrix_Loc = gl.getUniformLocation(
    drawParam.shaderProgram as WebGLProgram,
    NORMAL_SHADER_LOCATION_NAMES.matrixUniform,
  )
  drawParam.s_texture0_Loc = gl.getUniformLocation(
    drawParam.shaderProgram as WebGLProgram,
    NORMAL_SHADER_LOCATION_NAMES.sourceTextureUniform,
  )
  drawParam.u_channelFlag = gl.getUniformLocation(
    drawParam.shaderProgram as WebGLProgram,
    NORMAL_SHADER_LOCATION_NAMES.channelFlagUniform,
  )
  drawParam.u_baseColor_Loc = gl.getUniformLocation(
    drawParam.shaderProgram as WebGLProgram,
    NORMAL_SHADER_LOCATION_NAMES.baseColorUniform,
  )
  drawParam.u_maskFlag_Loc = gl.getUniformLocation(
    drawParam.shaderProgram as WebGLProgram,
    NORMAL_SHADER_LOCATION_NAMES.maskFlagUniform,
  )
  drawParam.a_position_Loc_Off = gl.getAttribLocation(
    drawParam.shaderProgramOff as WebGLProgram,
    CLIPPED_SHADER_LOCATION_NAMES.positionAttribute,
  )
  drawParam.a_texCoord_Loc_Off = gl.getAttribLocation(
    drawParam.shaderProgramOff as WebGLProgram,
    CLIPPED_SHADER_LOCATION_NAMES.texCoordAttribute,
  )
  drawParam.u_matrix_Loc_Off = gl.getUniformLocation(
    drawParam.shaderProgramOff as WebGLProgram,
    CLIPPED_SHADER_LOCATION_NAMES.matrixUniform,
  )
  drawParam.u_clipMatrix_Loc_Off = gl.getUniformLocation(
    drawParam.shaderProgramOff as WebGLProgram,
    CLIPPED_SHADER_LOCATION_NAMES.clipMatrixUniform,
  )
  drawParam.s_texture0_Loc_Off = gl.getUniformLocation(
    drawParam.shaderProgramOff as WebGLProgram,
    CLIPPED_SHADER_LOCATION_NAMES.sourceTextureUniform,
  )
  drawParam.s_texture1_Loc_Off = gl.getUniformLocation(
    drawParam.shaderProgramOff as WebGLProgram,
    CLIPPED_SHADER_LOCATION_NAMES.maskTextureUniform,
  )
  drawParam.u_channelFlag_Loc_Off = gl.getUniformLocation(
    drawParam.shaderProgramOff as WebGLProgram,
    CLIPPED_SHADER_LOCATION_NAMES.channelFlagUniform,
  )
  drawParam.u_baseColor_Loc_Off = gl.getUniformLocation(
    drawParam.shaderProgramOff as WebGLProgram,
    CLIPPED_SHADER_LOCATION_NAMES.baseColorUniform,
  )
}
