import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { createCubism2DrawParamBase } from '../../components/blog/live2d/vendor/cubism2Core/drawParamBase'
import { createCubism2WebGLDrawParam } from '../../components/blog/live2d/vendor/cubism2Core/webglDrawParam'
import type {
  Cubism2WebGLContext,
  Cubism2WebGLDrawParamInstance,
} from '../../components/blog/live2d/vendor/cubism2Core/webglDrawParam'

interface RecordingWebGL {
  context: Cubism2WebGLContext
  operations: string[]
}

/** Creates a permissive WebGL recorder that exposes every call used by the reviewed owner methods. */
function createRecordingWebGL(): RecordingWebGL {
  const operations: string[] = []
  let bufferIdentity = 0
  const context = {
    ARRAY_BUFFER: 'ARRAY_BUFFER',
    BLEND: 'BLEND',
    CCW: 'CCW',
    CLAMP_TO_EDGE: 'CLAMP_TO_EDGE',
    COLOR_ATTACHMENT0: 'COLOR_ATTACHMENT0',
    CULL_FACE: 'CULL_FACE',
    CW: 'CW',
    DEPTH_TEST: 'DEPTH_TEST',
    DST_COLOR: 'DST_COLOR',
    DYNAMIC_DRAW: 'DYNAMIC_DRAW',
    ELEMENT_ARRAY_BUFFER: 'ELEMENT_ARRAY_BUFFER',
    FLOAT: 'FLOAT',
    FRAMEBUFFER: 'FRAMEBUFFER',
    FUNC_ADD: 'FUNC_ADD',
    LINEAR: 'LINEAR',
    ONE: 'ONE',
    ONE_MINUS_SRC_ALPHA: 'ONE_MINUS_SRC_ALPHA',
    RENDERBUFFER: 'RENDERBUFFER',
    RGBA: 'RGBA',
    RGBA4: 'RGBA4',
    SCISSOR_TEST: 'SCISSOR_TEST',
    STENCIL_TEST: 'STENCIL_TEST',
    TEXTURE1: 'TEXTURE1',
    TEXTURE2: 'TEXTURE2',
    TEXTURE_2D: 'TEXTURE_2D',
    TEXTURE_MAG_FILTER: 'TEXTURE_MAG_FILTER',
    TEXTURE_MIN_FILTER: 'TEXTURE_MIN_FILTER',
    TEXTURE_WRAP_S: 'TEXTURE_WRAP_S',
    TEXTURE_WRAP_T: 'TEXTURE_WRAP_T',
    TRIANGLES: 'TRIANGLES',
    UNSIGNED_BYTE: 'UNSIGNED_BYTE',
    UNSIGNED_SHORT: 'UNSIGNED_SHORT',
    ZERO: 'ZERO',
    activeTexture: vi.fn((textureUnit: unknown) => operations.push(`active:${textureUnit}`)),
    bindBuffer: vi.fn((target: unknown, buffer: unknown) =>
      operations.push(`bindBuffer:${target}:${String((buffer as { id?: string } | null)?.id ?? buffer)}`),
    ),
    bindFramebuffer: vi.fn((target: unknown, framebuffer: unknown) =>
      operations.push(
        `bindFramebuffer:${target}:${String((framebuffer as { id?: string } | null)?.id ?? framebuffer)}`,
      ),
    ),
    bindRenderbuffer: vi.fn((target: unknown, renderbuffer: unknown) =>
      operations.push(
        `bindRenderbuffer:${target}:${String((renderbuffer as { id?: string } | null)?.id ?? renderbuffer)}`,
      ),
    ),
    bindTexture: vi.fn((target: unknown, texture: unknown) =>
      operations.push(
        `bindTexture:${target}:${String((texture as { id?: string } | null)?.id ?? texture)}`,
      ),
    ),
    blendEquationSeparate: vi.fn((rgb: unknown, alpha: unknown) =>
      operations.push(`blendEquation:${rgb}:${alpha}`),
    ),
    blendFuncSeparate: vi.fn((...factors: unknown[]) =>
      operations.push(`blendFunc:${factors.join(':')}`),
    ),
    bufferData: vi.fn((target: unknown, _values: unknown, usage: unknown) =>
      operations.push(`bufferData:${target}:${usage}`),
    ),
    colorMask: vi.fn((...channels: unknown[]) =>
      operations.push(`colorMask:${channels.join(':')}`),
    ),
    createBuffer: vi.fn(() => {
      bufferIdentity += 1
      const buffer = { id: `buffer-${bufferIdentity}` }
      operations.push(`createBuffer:${buffer.id}`)
      return buffer
    }),
    createFramebuffer: vi.fn(() => {
      operations.push('createFramebuffer')
      return { id: 'framebuffer' }
    }),
    createRenderbuffer: vi.fn(() => {
      operations.push('createRenderbuffer')
      return { id: 'renderbuffer' }
    }),
    createTexture: vi.fn(() => {
      operations.push('createTexture')
      return { id: 'mask-texture' }
    }),
    disable: vi.fn((capability: unknown) => operations.push(`disable:${capability}`)),
    drawElements: vi.fn((_mode: unknown, count: number) =>
      operations.push(`drawElements:${count}`),
    ),
    enable: vi.fn((capability: unknown) => operations.push(`enable:${capability}`)),
    enableVertexAttribArray: vi.fn((location: number) =>
      operations.push(`enableAttribute:${location}`),
    ),
    framebufferRenderbuffer: vi.fn(() => operations.push('framebufferRenderbuffer')),
    framebufferTexture2D: vi.fn(() => operations.push('framebufferTexture2D')),
    frontFace: vi.fn((winding: unknown) => operations.push(`frontFace:${winding}`)),
    getAttribLocation: vi.fn((program: { id?: string }, name: string) => {
      operations.push(`attribute:${program.id}:${name}`)
      return operations.length
    }),
    getExtension: vi.fn(() => null),
    getParameter: vi.fn(() => 0),
    getUniformLocation: vi.fn((program: { id?: string }, name: string) => {
      operations.push(`uniform:${program.id}:${name}`)
      return { program: program.id, name }
    }),
    renderbufferStorage: vi.fn(() => operations.push('renderbufferStorage')),
    releaseTextureAtIndex: vi.fn(),
    texImage2D: vi.fn(() => operations.push('texImage2D')),
    texParameteri: vi.fn((_target: unknown, parameter: unknown, value: unknown) =>
      operations.push(`texParameteri:${parameter}:${value}`),
    ),
    uniform1i: vi.fn((_location: unknown, value: unknown) =>
      operations.push(`uniform1i:${String(value)}`),
    ),
    uniform4f: vi.fn((_location: unknown, ...values: number[]) =>
      operations.push(`uniform4f:${values.join(':')}`),
    ),
    uniformMatrix4fv: vi.fn(() => operations.push('uniformMatrix4fv')),
    useProgram: vi.fn((program: { id?: string }) => operations.push(`program:${program.id}`)),
    vertexAttribPointer: vi.fn((location: number) =>
      operations.push(`attributePointer:${location}`),
    ),
  }

  return {
    context: context as unknown as Cubism2WebGLContext,
    operations,
  }
}

/** Installs deterministic shader, texture, color, and matrix state on one draw parameter. */
function prepareDrawableState(drawParam: Cubism2WebGLDrawParamInstance): void {
  drawParam.shaderProgram = { id: 'normal' } as unknown as WebGLProgram
  drawParam.clippedShaderProgram = { id: 'clipped' } as unknown as WebGLProgram
  drawParam.attributePositionLocation = 11
  drawParam.attributeTexCoordLocation = 12
  drawParam.clippedAttributePositionLocation = 21
  drawParam.clippedAttributeTexCoordLocation = 22
  drawParam.textures[0] = { id: 'source-texture' }
  drawParam.matrix4x4 = new Float32Array(16)
  drawParam.CHANNEL_COLORS = [{ a: 1, b: 0, g: 0, r: 1 }]
}

describe('Cubism2 WebGL draw-param immutable source behavior', () => {
  it('preserves reviewed webglDrawParam.ts source behavior through semantic TypeScript', () => {
    const { Cubism2DrawParamBase } = createCubism2DrawParamBase({
      Live2D: { COLOR_BLEND_MODE_MULTIPLY: 2 },
      isBootstrapping: () => false,
    })
    const Live2D = {
      polygonExpansionWidth: 0.05,
      clippingMaskBufferSize: 64,
      maskTextures: [] as unknown[],
    }
    const DrawParam = createCubism2WebGLDrawParam({
      Cubism2DrawParamBase,
      Live2D,
      UtDebug: { logDebug: vi.fn() },
      blendModes: { BLEND_ADD: 1, BLEND_MULTIPLY: 2, BLEND_NORMAL: 0 },
      isBootstrapping: () => false,
    })

    const drawParamWithoutIndex = new DrawParam()
    expect(drawParamWithoutIndex.glIndex).toBeUndefined()
    expect(Object.keys(drawParamWithoutIndex)).toEqual([
      'textureCapacity',
      'baseAlpha',
      'baseRed',
      'baseGreen',
      'baseBlue',
      'culling',
      'matrix4x4',
      'premultipliedAlpha',
      'anisotropy',
      'clippingProcess',
      'clippingContextForMask',
      'clippingContextForDraw',
      'CHANNEL_COLORS',
      'textures',
      'transform',
      'gl',
      'glIndex',
      'firstDraw',
      'anisotropyExt',
      'maxAnisotropy',
      'textureCoordBuffer',
      'vertexPositionBuffer',
      'indexElementBuffer',
      'vertShader',
      'fragShader',
      'clippedVertexShader',
      'clippedFragmentShader',
    ])
    const stateRecorder = createRecordingWebGL()
    drawParamWithoutIndex.gl = stateRecorder.context
    drawParamWithoutIndex.firstDraw = false
    drawParamWithoutIndex.prepareDrawState()
    expect(stateRecorder.operations).toEqual([
      'disable:SCISSOR_TEST',
      'disable:STENCIL_TEST',
      'disable:DEPTH_TEST',
      'frontFace:CW',
      'enable:BLEND',
      'colorMask:1:1:1:1',
      'bindBuffer:ARRAY_BUFFER:null',
      'bindBuffer:ELEMENT_ARRAY_BUFFER:null',
    ])

    const prefixRecorder = createRecordingWebGL()
    const prefixTarget = new DrawParam(0)
    let glReadCount = 0
    const observedPrefixTarget = new Proxy(prefixTarget, {
      get(target, property, receiver) {
        if (property === 'gl') {
          glReadCount += 1
          return glReadCount === 1 ? prefixRecorder.context : null
        }
        return Reflect.get(target, property, receiver)
      },
    })
    expect(() =>
      DrawParam.prototype.drawTexture.call(
        observedPrefixTarget,
        0,
        0,
        [],
        [],
        [],
        1,
        0,
        null,
      ),
    ).toThrow('gl is null')
    expect(glReadCount).toBe(2)
    expect(prefixRecorder.operations).toEqual([])

    const drawRecorder = createRecordingWebGL()
    const normalDrawParam = new DrawParam(0)
    normalDrawParam.gl = drawRecorder.context
    prepareDrawableState(normalDrawParam)
    normalDrawParam.drawTexture(
      0,
      999,
      [0, 1, 2],
      [0, 0, 1, 0, 0, 1],
      [0, 0, 1, 0, 0, 1],
      0.5,
      0,
      null,
    )
    expect(drawRecorder.operations).toContain('program:normal')
    expect(drawRecorder.operations).toContain('uniform1i:false')
    expect(drawRecorder.operations).toContain('drawElements:3')
    expect(drawRecorder.operations.indexOf('active:TEXTURE1')).toBeLessThan(
      drawRecorder.operations.indexOf('uniform1i:1'),
    )

    drawRecorder.operations.length = 0
    const clippedDrawParam = new DrawParam(1)
    clippedDrawParam.gl = drawRecorder.context
    prepareDrawableState(clippedDrawParam)
    clippedDrawParam.clippingContextForDraw = {
      layoutBounds: { getBottom: () => 1, getRight: () => 1, x: 0, y: 0 },
      layoutChannelNo: 0,
      matrixForDraw: new Float32Array(16),
      matrixForMask: new Float32Array(16),
    }
    Live2D.maskTextures[1] = { id: 'generated-mask' }
    clippedDrawParam.drawTexture(0, 3, [0, 1, 2], [0, 0], [0, 0], 0.5, 0, null)
    expect(drawRecorder.operations).toContain('program:clipped')
    expect(drawRecorder.operations).toContain('active:TEXTURE2')
    expect(drawRecorder.operations).toContain('bindTexture:TEXTURE_2D:generated-mask')
    expect(drawRecorder.operations.indexOf('uniformMatrix4fv')).toBeLessThan(
      drawRecorder.operations.indexOf('active:TEXTURE2'),
    )

    drawRecorder.operations.length = 0
    const maskDrawParam = new DrawParam(0)
    maskDrawParam.gl = drawRecorder.context
    prepareDrawableState(maskDrawParam)
    maskDrawParam.clippingContextForMask = {
      layoutBounds: { getBottom: () => 0.75, getRight: () => 0.5, x: 0.25, y: 0.5 },
      layoutChannelNo: 0,
      matrixForDraw: new Float32Array(16),
      matrixForMask: new Float32Array(16),
    }
    maskDrawParam.drawTexture(0, 3, [0, 1, 2], [0, 0], [0, 0], 1, 2, null)
    expect(drawRecorder.operations[0]).toBe('frontFace:CCW')
    expect(drawRecorder.operations).toContain('uniform4f:-0.5:0:0:0.5')
    expect(drawRecorder.operations).toContain('uniform1i:true')
    expect(drawRecorder.operations).toContain(
      'blendFunc:ONE:ONE_MINUS_SRC_ALPHA:ONE:ONE_MINUS_SRC_ALPHA',
    )

    const releaseParam = new DrawParam(0)
    const originalTextures = [{ id: 'first' }, { id: 'second' }]
    const replacementTextures: unknown[] = [{ id: 'replacement' }]
    releaseParam.textures = originalTextures
    releaseParam.gl = {
      releaseTextureAtIndex: vi.fn((_mode, textures, textureIndex) => {
        expect(textures).toBe(originalTextures)
        expect(textureIndex).toBe(0)
        releaseParam.textures = replacementTextures
      }),
    } as unknown as Cubism2WebGLContext
    releaseParam.releaseRendererTextures()
    expect(originalTextures).toEqual([{ id: 'first' }, { id: 'second' }])
    expect(replacementTextures).toEqual([null])

    const shaderRecorder = createRecordingWebGL()
    const shaderParam = new DrawParam(0)
    shaderParam.gl = shaderRecorder.context
    shaderParam.shaderProgram = { id: 'normal' } as unknown as WebGLProgram
    shaderParam.clippedShaderProgram = { id: 'clipped' } as unknown as WebGLProgram
    shaderParam.loadShaders2 = vi.fn(() => {
      shaderRecorder.operations.push('loadShaders2')
      return true
    })
    shaderParam.initShader()
    expect(shaderRecorder.operations).toEqual([
      'loadShaders2',
      'attribute:normal:a_position',
      'attribute:normal:a_texCoord',
      'uniform:normal:u_mvpMatrix',
      'uniform:normal:s_texture0',
      'uniform:normal:u_channelFlag',
      'uniform:normal:u_baseColor',
      'uniform:normal:u_maskFlag',
      'attribute:clipped:a_position',
      'attribute:clipped:a_texCoord',
      'uniform:clipped:u_mvpMatrix',
      'uniform:clipped:u_ClipMatrix',
      'uniform:clipped:s_texture0',
      'uniform:clipped:s_texture1',
      'uniform:clipped:u_channelFlag',
      'uniform:clipped:u_baseColor',
    ])

    const framebufferRecorder = createRecordingWebGL()
    const framebufferParam = new DrawParam(2)
    framebufferParam.gl = framebufferRecorder.context
    const framebufferResources = framebufferParam.createFramebuffer()
    expect(framebufferRecorder.operations).toEqual([
      'createFramebuffer',
      'bindFramebuffer:FRAMEBUFFER:framebuffer',
      'createRenderbuffer',
      'bindRenderbuffer:RENDERBUFFER:renderbuffer',
      'renderbufferStorage',
      'framebufferRenderbuffer',
      'createTexture',
      'bindTexture:TEXTURE_2D:mask-texture',
      'texImage2D',
      'texParameteri:TEXTURE_MIN_FILTER:LINEAR',
      'texParameteri:TEXTURE_MAG_FILTER:LINEAR',
      'texParameteri:TEXTURE_WRAP_S:CLAMP_TO_EDGE',
      'texParameteri:TEXTURE_WRAP_T:CLAMP_TO_EDGE',
      'framebufferTexture2D',
      'bindTexture:TEXTURE_2D:null',
      'bindRenderbuffer:RENDERBUFFER:null',
      'bindFramebuffer:FRAMEBUFFER:null',
    ])
    expect(framebufferResources).toEqual({
      framebuffer: { id: 'framebuffer' },
      renderbuffer: { id: 'renderbuffer' },
      texture: { id: 'mask-texture' },
    })
    expect(Live2D.maskTextures[2]).toEqual({ id: 'mask-texture' })

    const moduleSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/webglDrawParam.ts',
      ),
      'utf8',
    )
    expect(moduleSource).not.toMatch(
      /drawMaskPrimitive|drawClippedPrimitive|drawUnclippedPrimitive|applyCubism2WebGL|cacheCubism2WebGLShaderLocations|createCubism2WebGLMaskFramebuffer|releaseCubism2WebGLTextures/,
    )
  })
})
