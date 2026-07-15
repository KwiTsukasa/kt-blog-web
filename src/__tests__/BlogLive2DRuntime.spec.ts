import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi, afterEach } from 'vitest'

import { installCubism2Core } from '@/components/blog/live2d/vendor/cubism2Core'
import {
  assertCubism2CoreReady,
  CUBISM2_REQUIRED_GLOBALS,
  isCubism2CoreReady,
  type Cubism2CoreTarget,
} from '@/components/blog/live2d/vendor/cubism2Core/coreGlobals'
import * as Cubism2Sdk2 from '@/components/blog/live2d/vendor/cubism2Core/compatibility/minjsDerivedCubism2Sdk2'
import { installCubism2SdkGlobals } from '@/components/blog/live2d/vendor/cubism2Core/sdkGlobalInstaller'
import { CUBISM2_SDK_GLOBALS } from '@/components/blog/live2d/vendor/cubism2Core/sdkGlobalNames'
import { createLive2DRuntimeStorage } from '@/components/blog/live2d/runtime/live2dRuntimeStorage'
import { normalizeLive2DModelSettings } from '@/components/blog/live2d/runtime/live2dModelSettings'
import { createLive2DTSRuntime } from '@/components/blog/live2d/runtime/live2dTsRuntime'
import { createCubism2AffineTransform } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/affineTransform'
import { createCubism2AutoEyeBlink } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/autoEyeBlink'
import { createCubism2BaseData } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/baseData'
import { createCubism2BaseContext } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/baseContext'
import { createCubism2BasicValueTypes } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/basicValueTypes'
import { createCubism2BinaryReader } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/binaryReader'
import { createCubism2BrowserRuntimeInfo } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/runtimeInfo'
import { createCubism2CanvasDrawParam } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/canvasDrawParam'
import { createCubism2CoreTypes } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/coreTypes'
import { createCubism2DrawContextBase } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/drawContextBase'
import { createCubism2DrawData } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/drawData'
import { createCubism2DrawParamBase } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/drawParamBase'
import { createCubism2Geometry } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/geometry'
import { createCubism2GridBaseData } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/gridBaseData'
import { createCubism2IdTypes } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/idTypes'
import { createCubism2Interpolation } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/interpolation'
import { createCubism2LegacyMotion } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/legacyMotion'
import { createCubism2LDGL } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/ldgl'
import { createCubism2LDTransform } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/ldTransform'
import { createCubism2Live2DRuntime } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/live2dRuntime'
import { createCubism2Math } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/math'
import { createCubism2Matrix44 } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/matrix44'
import { createCubism2ModelBase } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/modelBase'
import { createCubism2ModelContext } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/modelContext'
import { createCubism2ModelData } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/modelData'
import { createCubism2ModelWrappers } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/modelWrappers'
import { createCubism2MocObjectFactory } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/mocObjectFactory'
import { createCubism2MotionBase } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/motionBase'
import { createCubism2MotionParser } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/motionParser'
import { createCubism2ParamBindings } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/paramBinding'
import { createCubism2ParamDefinitions } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/paramDefinition'
import { createCubism2PartsData } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/partsData'
import { createCubism2PhysicsHair } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/physicsHair'
import { createCubism2RuntimeConstants } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/runtimeConstants'
import { createCubism2RuntimeUtilities } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/runtimeUtilities'
import { createCubism2TransformBaseData } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/transformBaseData'
import { createCubism2TransformValue } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/transformValue'
import { createCubism2UtVector } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/utVector'
import {
  uploadCubism2WebGLArrayBuffer,
  uploadCubism2WebGLElementArrayBuffer,
} from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglBuffers'
import { enableCubism2WebGLAttributePointer } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglAttributes'
import {
  bindCubism2WebGLGeneratedMaskTexture,
  bindCubism2WebGLSourceTexture,
} from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglTextureBindings'
import {
  applyCubism2WebGLClippedUniforms,
  applyCubism2WebGLMaskUniforms,
  applyCubism2WebGLUnclippedUniforms,
} from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglUniforms'
import { applyCubism2WebGLDrawTail } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglDrawTail'
import {
  installCubism2WebGLTextureReleaseHook,
  releaseCubism2WebGLTextures,
} from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglTextureRelease'
import { createCubism2WebGLClipping } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglClipping'
import { resolveCubism2WebGLBlendFactors } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglBlendFactors'
import { createCubism2WebGLDrawParam } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglDrawParam'
import type { Cubism2WebGLDrawParamInstance } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglDrawParam'
import { createCubism2WebGLMaskFramebuffer } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglFramebuffer'
import { cacheCubism2WebGLShaderLocations } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglShaderLocations'
import { CUBISM2_WEBGL_SHADER_SOURCES } from '@/components/blog/live2d/vendor/cubism2Core/compatibility/webglShaderSources'
import type {
  Live2DRendererAdapter,
  Live2DResolvedState,
} from '@/components/blog/live2d/runtime/live2dRuntimeTypes'

/**
 * Creates an in-memory Storage implementation for deterministic runtime cache tests.
 * @param entries Initial key-value pairs loaded into the fake storage.
 * @returns Browser Storage-compatible object backed by a Map.
 */
function createMemoryStorage(entries: Array<[string, string]> = []): Storage {
  const values = new Map(entries)
  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key: string) {
      return values.get(key) ?? null
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key: string) {
      values.delete(key)
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
  }
}

/**
 * Extracts a source slice between two stable markers for scoped structure guards.
 * @param source Full source text read from a compatibility module.
 * @param startMarker Unique marker that starts the domain under review.
 * @param endMarker Unique marker that ends the domain before the next class starts.
 * @returns Source text from `startMarker` up to, but not including, `endMarker`.
 */
function extractSourceRange(source: string, startMarker: string, endMarker: string): string {
  const startIndex = source.indexOf(startMarker)
  const endIndex = source.indexOf(endMarker, startIndex + startMarker.length)

  expect(startIndex).toBeGreaterThanOrEqual(0)
  expect(endIndex).toBeGreaterThan(startIndex)

  return source.slice(startIndex, endIndex)
}

interface TestBaseDataIdDependency {
  getDefaultBaseDataID: () => unknown
}

/**
 * Creates a BaseDataID dependency that exposes the restored semantic default sentinel.
 * @param defaultBaseDataId Stable sentinel object that represents min.js `DST_BASE`.
 * @returns Test dependency matching the production BaseDataID consumer contract.
 */
function createTestBaseDataIdDependency(defaultBaseDataId: unknown): TestBaseDataIdDependency {
  return {
    /**
     * Returns the semantic SDK2 default base-data sentinel for restored consumers.
     * @returns Stable default base-data ID object.
     */
    getDefaultBaseDataID(): unknown {
      return defaultBaseDataId
    },
  }
}

/**
 * Creates a fake renderer adapter that records every state applied by the runtime.
 * @returns Renderer adapter plus call log.
 */
function createRecordingRenderer(): {
  calls: Array<[string, Live2DResolvedState]>
  renderer: Live2DRendererAdapter
} {
  const calls: Array<[string, Live2DResolvedState]> = []
  return {
    calls,
    renderer: {
      destroy: vi.fn(),
      mount: vi.fn((state: Live2DResolvedState) => {
        calls.push(['mount', state])
        return Promise.resolve()
      }),
      switchModel: vi.fn((state: Live2DResolvedState) => {
        calls.push(['switchModel', state])
        return Promise.resolve()
      }),
      switchTexture: vi.fn((state: Live2DResolvedState) => {
        calls.push(['switchTexture', state])
        return Promise.resolve()
      }),
    },
  }
}

/**
 * Builds a DataView from raw bytes for deterministic Cubism2 binary-reader tests.
 * @param bytes Byte values laid out exactly as the MOC reader expects to consume them.
 * @returns DataView backed by a Uint8Array buffer containing the supplied bytes.
 */
function createDataView(bytes: number[]): DataView {
  return new DataView(Uint8Array.from(bytes).buffer)
}

/**
 * Writes float32 values into a new DataView using the Cubism2 reader's native big-endian reads.
 * @param values Float values that should be consumed by consecutive `readFloat32` calls.
 * @returns DataView containing the supplied float values at four-byte boundaries.
 */
function createFloat32DataView(values: number[]): DataView {
  const buffer = new ArrayBuffer(values.length * 4)
  const view = new DataView(buffer)
  values.forEach((value, index) => {
    view.setFloat32(index * 4, value)
  })
  return view
}

/**
 * Writes float64 values into a new DataView using the Cubism2 reader's native big-endian reads.
 * @param values Float values that should be consumed by consecutive `readFloat64` calls.
 * @returns DataView containing the supplied float values at eight-byte boundaries.
 */
function createFloat64DataView(values: number[]): DataView {
  const buffer = new ArrayBuffer(values.length * 8)
  const view = new DataView(buffer)
  values.forEach((value, index) => {
    view.setFloat64(index * 8, value)
  })
  return view
}

/**
 * Creates a Cubism2 binary reader with recording constructor dependencies for focused tests.
 * @param options Optional constructor overrides for integration paths that need real value classes.
 * @returns Reader constructor plus injected constructor call logs.
 */
function createRecordingBinaryReader(
  options: {
    affineTransformConstructor?: new (...args: number[]) => unknown
    mocVersion?: {
      OBJECT_REFERENCE_TYPE_TAG: number
      createObjectByTypeTag: (typeTag: number) => unknown | null
    }
  } = {},
): {
  calls: Array<{ args: unknown[]; kind: string }>
  Reader: ReturnType<typeof createCubism2BinaryReader>
} {
  const calls: Array<{ args: unknown[]; kind: string }> = []

  /**
   * Records construction of one semantic primitive value decoded from the MOC stream.
   * @param kind Semantic value family expected by `readValueForTypeTag`.
   * @returns Constructor function that records all arguments passed through `new`.
   */
  function createValueConstructor(kind: string): new (...args: unknown[]) => unknown {
    return function RecordingValue(this: unknown, ...args: unknown[]) {
      calls.push({ args, kind })
      return { args, kind }
    } as unknown as new (...args: unknown[]) => unknown
  }

  class Cubism2CoreError extends Error {}

  const idConstructor = {
    /**
     * Converts raw Cubism2 ID text into a test-visible object.
     * @param idText ID text read from the MOC string table.
     * @returns Object preserving the raw ID text and proving the requested constructor family was used.
     */
    getID(idText: string | undefined) {
      return { idText }
    },
  }
  const defaultMocVersion = {
    OBJECT_REFERENCE_TYPE_TAG: 33,
    /**
     * Default semantic object factory for binary-reader tests that do not exercise versioned tags.
     * @returns Null so non-versioned reader tests keep the previous no-op factory behavior.
     */
    createObjectByTypeTag() {
      return null
    },
  }

  return {
    calls,
    Reader: createCubism2BinaryReader({
      Cubism2CoreError,
      Cubism2MocVersion: options.mocVersion ?? defaultMocVersion,
      idConstructors: {
        BaseDataID: idConstructor,
        DrawDataID: idConstructor,
        ParamID: idConstructor,
        PartsDataID: idConstructor,
      },
      isBootstrapping: () => false,
      valueConstructors: {
        affineTransformConstructor:
          options.affineTransformConstructor ?? createValueConstructor('affineTransform'),
        floatRectangleConstructor: createValueConstructor('floatRectangle'),
        integerValueConstructor: createValueConstructor('integerValue'),
        pointConstructor: createValueConstructor('point'),
        rectangleConstructor: createValueConstructor('rectangle'),
        tag22XYValueConstructor: createValueConstructor('tag22XYValue'),
      },
    }),
  }
}

interface RecordedWebGLCall {
  args: unknown[]
  method: string
}

type MutableNumberArray = ArrayLike<number> & {
  [index: number]: number
}

/**
 * Creates fake Cubism2 interpolation dependencies with deterministic corner selection.
 * @param dimensionCount Number of active interpolation axes returned to the helper.
 * @param cornerIndexes Source value indexes selected for the interpolation hypercube.
 * @param cornerWeights Per-axis weights written into the model scratch buffer.
 * @returns Model context, binding set, and dirty flag reference used by interpolation helpers.
 */
function createInterpolationHarness(
  dimensionCount: number,
  cornerIndexes: number[],
  cornerWeights: number[],
): {
  dirtyFlagRef: boolean[]
  modelContext: {
    getScratchIndexBuffer: () => MutableNumberArray
    getScratchWeightBuffer: () => MutableNumberArray
  }
  paramBindingSet: {
    buildInterpolationCorners: (
      indexBuffer: MutableNumberArray,
      weightBuffer: MutableNumberArray,
      resolvedDimensionCount: number,
    ) => void
    resolveInterpolationWeights: (modelContext: unknown, dirtyFlagRef: boolean[]) => number
  }
} {
  const indexBuffer = new Array<number>(Math.max(cornerIndexes.length, 1)).fill(0)
  const weightBuffer = new Array<number>(Math.max(cornerWeights.length, 1)).fill(0)
  const dirtyFlagRef = [false]
  const modelContext = {
    /**
     * Supplies the scratch index buffer populated by `buildInterpolationCorners`.
     * @returns Mutable corner-index buffer reused by the interpolation helper.
     */
    getScratchIndexBuffer(): MutableNumberArray {
      return indexBuffer
    },
    /**
     * Supplies the scratch weight buffer populated by `buildInterpolationCorners`.
     * @returns Mutable corner-weight buffer reused by the interpolation helper.
     */
    getScratchWeightBuffer(): MutableNumberArray {
      return weightBuffer
    },
  }
  const paramBindingSet = {
    /**
     * Copies the requested test corner indexes and weights into model scratch buffers.
     * @param targetIndexBuffer Scratch index buffer supplied by the model context.
     * @param targetWeightBuffer Scratch weight buffer supplied by the model context.
     * @param resolvedDimensionCount Dimension count returned by `resolveInterpolationWeights`.
     */
    buildInterpolationCorners(
      targetIndexBuffer: MutableNumberArray,
      targetWeightBuffer: MutableNumberArray,
      resolvedDimensionCount: number,
    ): void {
      expect(resolvedDimensionCount).toBe(dimensionCount)
      cornerIndexes.forEach((cornerIndex, index) => {
        targetIndexBuffer[index] = cornerIndex
      })
      cornerWeights.forEach((cornerWeight, index) => {
        targetWeightBuffer[index] = cornerWeight
      })
    },
    /**
     * Reports the configured interpolation dimension count for this test case.
     * @param runtimeModelContext Model context passed by the helper under test.
     * @param runtimeDirtyFlagRef Dirty flag reference passed by the helper under test.
     * @returns Number of active interpolation axes.
     */
    resolveInterpolationWeights(runtimeModelContext: unknown, runtimeDirtyFlagRef: boolean[]) {
      expect(runtimeModelContext).toBe(modelContext)
      expect(runtimeDirtyFlagRef).toBe(dirtyFlagRef)
      return dimensionCount
    },
  }

  return { dirtyFlagRef, modelContext, paramBindingSet }
}

/**
 * Creates a fake WebGL context that records every method call and returns deterministic handles.
 * @returns Fake WebGL context, numeric constants, and the captured call log.
 */
function createRecordingWebGLContext(): {
  calls: RecordedWebGLCall[]
  constants: Record<string, number>
  gl: WebGLRenderingContext & {
    releaseTextureAtIndex: (
      deleteMode: number,
      textures: unknown[],
      textureIndex: number,
    ) => void
  }
} {
  const calls: RecordedWebGLCall[] = []
  const constants: Record<string, number> = {
    ARRAY_BUFFER: 1,
    BLEND: 2,
    CCW: 3,
    CLAMP_TO_EDGE: 4,
    COLOR_ATTACHMENT0: 5,
    COLOR_BUFFER_BIT: 39,
    COMPILE_STATUS: 6,
    CULL_FACE: 7,
    CW: 8,
    DEPTH_TEST: 9,
    DST_COLOR: 10,
    DYNAMIC_DRAW: 11,
    ELEMENT_ARRAY_BUFFER: 12,
    FLOAT: 13,
    FRAGMENT_SHADER: 14,
    FRAMEBUFFER: 15,
    FRAMEBUFFER_BINDING: 38,
    FUNC_ADD: 16,
    LINEAR: 17,
    LINK_STATUS: 18,
    ONE: 19,
    ONE_MINUS_SRC_ALPHA: 20,
    RENDERBUFFER: 21,
    RGBA: 22,
    RGBA4: 23,
    SCISSOR_TEST: 24,
    STENCIL_TEST: 25,
    TEXTURE1: 26,
    TEXTURE2: 27,
    TEXTURE_2D: 28,
    TEXTURE_MAG_FILTER: 29,
    TEXTURE_MIN_FILTER: 30,
    TEXTURE_WRAP_S: 31,
    TEXTURE_WRAP_T: 32,
    TRIANGLES: 33,
    UNSIGNED_BYTE: 34,
    UNSIGNED_SHORT: 35,
    VERTEX_SHADER: 36,
    ZERO: 37,
  }
  const methods = new Map<string, (...args: unknown[]) => unknown>()

  /**
   * Creates a stable object handle for WebGL resources returned by the fake context.
   * @param method Method name that allocated the handle.
   * @returns Object carrying the allocating method and ordinal.
   */
  function createHandle(method: string): { id: number; method: string } {
    return { id: calls.length, method }
  }

  /**
   * Builds one recording function for a WebGL method name.
   * @param method Method name looked up through the proxy.
   * @returns Function that records calls and returns the legacy-compatible fake result.
   */
  function createRecordedMethod(method: string): (...args: unknown[]) => unknown {
    /**
     * Records a WebGL call and returns the deterministic value expected by the runtime path under test.
     * @param args Arguments supplied by the draw parameter.
     * @returns Fake WebGL return value for resource/query methods, otherwise undefined.
     */
    function recordWebGLCall(...args: unknown[]): unknown {
      calls.push({ args, method })
      switch (method) {
        case 'createBuffer':
        case 'createFramebuffer':
        case 'createProgram':
        case 'createRenderbuffer':
        case 'createShader':
        case 'createTexture':
          return createHandle(method)
        case 'getAttribLocation':
          return calls.length
        case 'getExtension':
          return null
        case 'getParameter':
          return 1
        case 'getProgramInfoLog':
        case 'getShaderInfoLog':
          return ''
        case 'getProgramParameter':
        case 'getShaderParameter':
          return true
        case 'getUniformLocation':
          return createHandle(method)
        default:
          return undefined
      }
    }

    return vi.fn(recordWebGLCall)
  }

  const gl = new Proxy(constants, {
    /**
     * Resolves WebGL constants directly and lazily creates recording methods for every function lookup.
     * @param target Numeric WebGL constant map.
     * @param property Property requested by the draw parameter.
     * @returns Numeric constant or recording method.
     */
    get(target, property: string | symbol): unknown {
      if (typeof property === 'symbol') {
        return Reflect.get(target, property)
      }
      if (property in target) {
        return target[property]
      }
      if (!methods.has(property)) {
        methods.set(property, createRecordedMethod(property))
      }
      return methods.get(property)
    },
  }) as unknown as WebGLRenderingContext & {
    releaseTextureAtIndex: (
      deleteMode: number,
      textures: unknown[],
      textureIndex: number,
    ) => void
  }

  return { calls, constants, gl }
}

/**
 * Creates a WebGLDrawParam instance wired to a fake WebGL context and deterministic base state.
 * @param glIndex Index used by the draw parameter when reading and writing clipping mask textures.
 * @returns Draw parameter, fake WebGL context, captured call log, and Live2D profile object.
 */
function createWebGLDrawParamHarness(glIndex = 3): {
  calls: RecordedWebGLCall[]
  constants: Record<string, number>
  debugMessages: string[]
  drawParam: ReturnType<typeof createCubism2WebGLDrawParam>['prototype']
  gl: WebGLRenderingContext & {
    releaseTextureAtIndex: (
      deleteMode: number,
      textures: unknown[],
      textureIndex: number,
    ) => void
  }
  live2DProfile: {
    EXPAND_W: number
    clippingMaskBufferSize: number
    fTexture: unknown[]
  }
  WebGLDrawParam: ReturnType<typeof createCubism2WebGLDrawParam>
} {
  const { calls, constants, gl } = createRecordingWebGLContext()
  const debugMessages: string[] = []
  const live2DProfile = {
    EXPAND_W: 4,
    clippingMaskBufferSize: 128,
    fTexture: [] as unknown[],
  }

  /**
   * Reports that runtime prototype bootstrapping is complete for WebGL constructor tests.
   * @returns False so constructors initialize their runtime state.
   */
  function isRuntimeBootstrapping(): boolean {
    return false
  }

  /**
   * Initializes inherited draw-param fields that WebGLDrawParam reads during drawing.
   */
  function WebGLDrawParamBaseStub(this: {
    baseAlpha: number
    baseBlue: number
    baseGreen: number
    baseRed: number
    clipBufPre_clipContextDraw: unknown | null
    clipBufPre_clipContextMask: unknown | null
    culling: boolean
    matrix4x4: Float32Array
  }): void {
    this.baseAlpha = 1
    this.baseRed = 1
    this.baseGreen = 1
    this.baseBlue = 1
    this.culling = false
    this.matrix4x4 = new Float32Array(16)
    this.clipBufPre_clipContextMask = null
    this.clipBufPre_clipContextDraw = null
  }

  /**
   * Reads the current mask-generation clip context from the fake base state.
   * @returns Mask clip context or null when the test exercises another branch.
   */
  WebGLDrawParamBaseStub.prototype.getClipBufPre_clipContextMask = function (): unknown | null {
    return this.clipBufPre_clipContextMask
  }

  /**
   * Reads the current draw clip context from the fake base state.
   * @returns Draw clip context or null when the test exercises another branch.
   */
  WebGLDrawParamBaseStub.prototype.getClipBufPre_clipContextDraw = function (): unknown | null {
    return this.clipBufPre_clipContextDraw
  }

  /**
   * Supplies deterministic channel colors for mask and clipped draw assertions.
   * @param channelIndex Channel selected by the clipping layout.
   * @returns RGBA channel flag color expected by the WebGL shader uniforms.
   */
  WebGLDrawParamBaseStub.prototype.getChannelFlagAsColor = function (channelIndex: number): {
    a: number
    b: number
    g: number
    r: number
  } {
    const colors = [
      { a: 0.4, b: 0.3, g: 0.2, r: 0.1 },
      { a: 0.8, b: 0.7, g: 0.6, r: 0.5 },
    ]
    return colors[channelIndex] ?? { a: 1, b: 1, g: 1, r: 1 }
  }

  const WebGLDrawParam = createCubism2WebGLDrawParam({
    Cubism2DrawParamBase: WebGLDrawParamBaseStub as never,
    Live2D: live2DProfile,
    UtDebug: {
      /**
       * Records shader diagnostics without writing to the test console.
       * @param message Legacy shader diagnostic message.
       */
      logDebug(message: string) {
        debugMessages.push(message)
      },
    },
    blendModes: {
      BLEND_ADD: 1,
      BLEND_MULTIPLY: 2,
      BLEND_NORMAL: 0,
    },
    isBootstrapping: isRuntimeBootstrapping,
  })
  const drawParam = new WebGLDrawParam(glIndex)

  drawParam.setGL(gl)
  drawParam.setTexture(0, { id: 'texture-0' })

  return {
    WebGLDrawParam,
    calls,
    constants,
    debugMessages,
    drawParam,
    gl,
    live2DProfile,
  }
}

/**
 * Finds the first recorded WebGL call after a known point and fails with a readable label if absent.
 * @param calls Ordered WebGL call log captured by the fake context.
 * @param afterIndex Exclusive lower-bound index used to prove relative min.js call ordering.
 * @param label Human-readable step name shown when the expected call is missing.
 * @param predicate Matcher for the target call's method and arguments.
 * @returns Index of the matched call in the shared call log.
 */
function findWebGLCallAfter(
  calls: RecordedWebGLCall[],
  afterIndex: number,
  label: string,
  predicate: (call: RecordedWebGLCall) => boolean,
): number {
  const callIndex = calls.findIndex((call, index) => index > afterIndex && predicate(call))
  expect(callIndex, label).toBeGreaterThan(afterIndex)
  return callIndex
}

/**
 * Verifies the Cubism2 min.js attribute-pointer ordering inside one WebGL draw branch.
 * @param calls Ordered WebGL calls captured after `prepareDrawState` initialization noise was cleared.
 * @param constants Numeric fake WebGL constants used to compare bind targets and attribute pointer shape.
 * @param positionLocation Shader `a_position` location used by the branch under test.
 * @param texCoordLocation Shader `a_texCoord` location used by the branch under test.
 * @param sourceTexture Source texture handle that should be bound between UV upload and UV pointer setup.
 * @param sourceTextureUnit Texture unit used for the source texture in the branch under test.
 * @param sourceTextureUniform Uniform location paired with the source texture unit.
 */
function expectCubism2WebGLAttributePointerOrder(
  calls: RecordedWebGLCall[],
  constants: Record<string, number>,
  positionLocation: number,
  texCoordLocation: number,
  sourceTexture: unknown,
  sourceTextureUnit: number,
  sourceTextureUniform: unknown,
): void {
  const positionBindIndex = findWebGLCallAfter(
    calls,
    -1,
    'position ARRAY_BUFFER bind',
    (call) => call.method === 'bindBuffer' && call.args[0] === constants.ARRAY_BUFFER,
  )
  const positionUploadIndex = findWebGLCallAfter(
    calls,
    positionBindIndex,
    'position ARRAY_BUFFER upload',
    (call) => call.method === 'bufferData' && call.args[0] === constants.ARRAY_BUFFER,
  )
  const indexBindIndex = findWebGLCallAfter(
    calls,
    positionUploadIndex,
    'index ELEMENT_ARRAY_BUFFER bind',
    (call) => call.method === 'bindBuffer' && call.args[0] === constants.ELEMENT_ARRAY_BUFFER,
  )
  const indexUploadIndex = findWebGLCallAfter(
    calls,
    indexBindIndex,
    'index ELEMENT_ARRAY_BUFFER upload',
    (call) => call.method === 'bufferData' && call.args[0] === constants.ELEMENT_ARRAY_BUFFER,
  )
  const positionEnableIndex = findWebGLCallAfter(
    calls,
    indexUploadIndex,
    'position attribute enable',
    (call) => call.method === 'enableVertexAttribArray' && call.args[0] === positionLocation,
  )
  const positionPointerIndex = findWebGLCallAfter(
    calls,
    positionEnableIndex,
    'position attribute pointer',
    (call) =>
      call.method === 'vertexAttribPointer' &&
      call.args[0] === positionLocation &&
      call.args[1] === 2 &&
      call.args[2] === constants.FLOAT &&
      call.args[3] === false &&
      call.args[4] === 0 &&
      call.args[5] === 0,
  )
  const uvBindIndex = findWebGLCallAfter(
    calls,
    positionPointerIndex,
    'UV ARRAY_BUFFER bind',
    (call) => call.method === 'bindBuffer' && call.args[0] === constants.ARRAY_BUFFER,
  )
  const uvUploadIndex = findWebGLCallAfter(
    calls,
    uvBindIndex,
    'UV ARRAY_BUFFER upload',
    (call) => call.method === 'bufferData' && call.args[0] === constants.ARRAY_BUFFER,
  )
  const sourceTextureUnitIndex = findWebGLCallAfter(
    calls,
    uvUploadIndex,
    'source texture unit activation',
    (call) => call.method === 'activeTexture' && call.args[0] === sourceTextureUnit,
  )
  const sourceTextureBindIndex = findWebGLCallAfter(
    calls,
    sourceTextureUnitIndex,
    'source texture bind',
    (call) =>
      call.method === 'bindTexture' &&
      call.args[0] === constants.TEXTURE_2D &&
      call.args[1] === sourceTexture,
  )
  const sourceTextureUniformIndex = findWebGLCallAfter(
    calls,
    sourceTextureBindIndex,
    'source texture uniform',
    (call) =>
      call.method === 'uniform1i' &&
      call.args[0] === sourceTextureUniform &&
      call.args[1] === 1,
  )
  const uvEnableIndex = findWebGLCallAfter(
    calls,
    sourceTextureUniformIndex,
    'UV attribute enable',
    (call) => call.method === 'enableVertexAttribArray' && call.args[0] === texCoordLocation,
  )
  findWebGLCallAfter(
    calls,
    uvEnableIndex,
    'UV attribute pointer',
    (call) =>
      call.method === 'vertexAttribPointer' &&
      call.args[0] === texCoordLocation &&
      call.args[1] === 2 &&
      call.args[2] === constants.FLOAT &&
      call.args[3] === false &&
      call.args[4] === 0 &&
      call.args[5] === 0,
  )
}

describe('Cubism2 vendor core boundary', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete window.Live2D
    delete window.Live2DModelWebGL
    delete window.Live2DMotion
    delete window.MotionQueueManager
  })

  it('keeps the public vendor entrypoint small and delegates legacy compatibility out of the entry file', () => {
    const entrySource = readFileSync(
      resolve(process.cwd(), 'src/components/blog/live2d/vendor/cubism2Core.ts'),
      'utf-8',
    )

    expect(entrySource.length).toBeLessThan(5000)
    expect(entrySource).toContain('installReadableCubism2Kernel')
    expect(entrySource).toContain('assertCubism2CoreReady')
  })

  it('shares the min.js tail SDK global order between the capsule and installer', () => {
    const sharedGlobalsPath = resolve(
      process.cwd(),
      'src/components/blog/live2d/vendor/cubism2Core/sdkGlobalNames.ts',
    )
    const installerSource = readFileSync(
      resolve(process.cwd(), 'src/components/blog/live2d/vendor/cubism2Core/sdkGlobalInstaller.ts'),
      'utf-8',
    )
    const compatibilitySource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/compatibility/minjsDerivedCubism2Sdk2.ts',
      ),
      'utf-8',
    )
    const expectedTailGlobalNames = [
      'UtSystem',
      'UtDebug',
      'LDTransform',
      'LDGL',
      'Live2D',
      'Live2DModelWebGL',
      'Live2DModelJS',
      'Live2DMotion',
      'MotionQueueManager',
      'PhysicsHair',
      'AMotion',
      'PartsDataID',
      'DrawDataID',
      'BaseDataID',
      'ParamID',
    ]

    expect(existsSync(sharedGlobalsPath)).toBe(true)

    const sharedGlobalsSource = readFileSync(sharedGlobalsPath, 'utf-8')
    const sharedGlobalNames = Array.from(
      sharedGlobalsSource.matchAll(/'([^']+)'/g),
      (match) => match[1],
    )

    expect(sharedGlobalNames).toEqual(expectedTailGlobalNames)
    expect(new Set(sharedGlobalNames).size).toBe(sharedGlobalNames.length)
    expect(installerSource).toContain("from './sdkGlobalNames'")
    expect(compatibilitySource).toContain("from '../sdkGlobalNames'")
    expect(compatibilitySource).not.toContain('const cubism2SdkGlobalNames')
  })

  it('installs every shared tail global from its matching capsule export at runtime', () => {
    const target = {} as Cubism2CoreTarget
    const installedGlobals = target as unknown as Record<string, unknown>

    installCubism2SdkGlobals(target)

    expect(Object.keys(installedGlobals)).toEqual([...CUBISM2_SDK_GLOBALS])
    for (const globalName of CUBISM2_SDK_GLOBALS) {
      expect(installedGlobals[globalName]).toBe(Cubism2Sdk2[globalName])
    }
  })

  it('keeps the compatibility capsule wired through semantic factories', () => {
    const compatibilitySource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/compatibility/minjsDerivedCubism2Sdk2.ts',
      ),
      'utf-8',
    )

    expect(compatibilitySource).toContain('cubism2RuntimeTarget')
    expect(compatibilitySource).toContain('createCubism2Live2DRuntime')
    expect(compatibilitySource).toContain('createCubism2ModelContext')
    expect(compatibilitySource).not.toContain('window.')
  })

  it('keeps ModelContext runtime tables and draw ordering on semantic APIs', () => {
    class FakeDrawDataID {
      constructor(private readonly id: string) {}

      /**
       * Preserves legacy object-key cache semantics in getDrawData(DrawDataID).
       * @returns Stable id string used as the object cache key.
       */
      toString(): string {
        return this.id
      }
    }

    const defaultBaseDataId = { id: 'DST_BASE' }
    const clipCalls: unknown[][] = []
    class FakeClippingManager {
      constructor(private readonly drawParam: unknown) {
        clipCalls.push(['constructor', drawParam])
      }

      /**
       * Captures the model-context table passed to the clipping manager.
       * @param modelContext Runtime model context being initialized.
       * @param drawDataList Ordered draw data table.
       * @param drawContextList Ordered draw context table.
       */
      init(modelContext: unknown, drawDataList: unknown[], drawContextList: unknown[]): void {
        clipCalls.push(['init', modelContext, drawDataList.length, drawContextList.length])
      }

      /**
       * Captures pre-draw clipping setup.
       * @param modelContext Runtime model context being prepared for drawing.
       * @param drawParam Draw parameter adapter supplied by the renderer.
       */
      setupClip(modelContext: unknown, drawParam: unknown): void {
        clipCalls.push(['setupClip', modelContext, drawParam])
      }
    }

    const debugErrors: unknown[] = []
    const live2DErrors: unknown[] = []
    const modelContextConstructors = createCubism2ModelContext({
      BaseDataID: createTestBaseDataIdDependency(defaultBaseDataId),
      Cubism2ClippingManager: FakeClippingManager,
      Cubism2DrawDataBase: {
        /**
         * Returns the lowest draw order bucket used by this fixture.
         * @returns Minimum draw order.
         */
        getMinDrawOrder: () => 0,
        /**
         * Returns the highest draw order bucket used by this fixture.
         * @returns Maximum draw order.
         */
        getMaxDrawOrder: () => 2,
      },
      Cubism2RuntimeConstants: {
        maxInterpolationCornerCount: 4,
        maxTransformParameterDimensionCount: 4,
      },
      DrawDataID: FakeDrawDataID,
      Live2D: {
        L2D_ERROR_MODEL_UPDATE: 4000,
        /**
         * Records draw update errors through the restored semantic Live2D error setter.
         * @param errorCode Live2D error code surfaced by ModelContext draw update.
         */
        setErrorCode(errorCode: number): void {
          live2DErrors.push(errorCode)
        },
      },
      UtDebug: {
        /**
         * Records debug errors surfaced by ModelContext update.
         * @param error Error emitted by a base or draw update branch.
         */
        logException(error: unknown): void {
          debugErrors.push(error)
        },
        /**
         * Suppresses legacy warning logs during this deterministic fixture.
         */
        logWithLegacyPrefix(): void {},
        /**
         * Suppresses timer start logs during this deterministic fixture.
         */
        start(): void {},
        /**
         * Suppresses timer dump logs during this deterministic fixture.
         */
        dump(): void {},
      },
      UtSystem: {
        /**
         * Copies array segments across JS arrays and typed arrays.
         * @param source Source array-like object.
         * @param sourceStart Start index in the source object.
         * @param target Target array-like object.
         * @param targetStart Start index in the target object.
         * @param copyCount Number of entries to copy.
         */
        copyArraySegmentForward(
          source: ArrayLike<unknown>,
          sourceStart: number,
          target: { [index: number]: unknown },
          targetStart: number,
          copyCount: number,
        ): void {
          for (let index = 0; index < copyCount; index++) {
            target[targetStart + index] = source[sourceStart + index]
          }
        },
      },
      isBootstrapping: () => false,
    })

    const baseAId = { id: 'base-a' }
    const baseCalls: string[] = []
    const drawCalls: string[] = []
    const pointWrites: Array<[string, number]> = []
    const partsContext = {
      opacity: 0.75,
      /**
       * Writes parts opacity through ModelContext.
       * @param opacity Next opacity value.
       */
      setPartsOpacity(opacity: number): void {
        this.opacity = opacity
      },
      /**
       * Reads parts opacity for draw propagation.
       * @returns Current fixture opacity.
       */
      getPartsOpacity(): number {
        return this.opacity
      },
    }
    const baseA = {
      /**
       * Creates the base runtime context and records init order.
       * @returns Base context with mutable parts index.
       */
      createRuntimeContext(): { setPartsIndex: (partsIndex: number) => void; partsIndex?: number } {
        baseCalls.push('create-base-a')
        return {
          /**
           * Records the parts index assigned by ModelContext.
           * @param partsIndex Runtime parts index.
           */
          setPartsIndex(partsIndex: number) {
            this.partsIndex = partsIndex
          },
        }
      },
      /**
       * Reads this base data id.
       * @returns Base id object.
       */
      getBaseDataID: () => baseAId,
      /**
       * Marks this base data as root-level.
       * @returns No target dependency.
       */
      getTargetBaseDataID: () => null,
      /**
       * Records update pass.
       */
      updateRuntimeContext(): void {
        baseCalls.push('update-base-a')
      },
      /**
       * Records apply pass.
       */
      applyRuntimeContext(): void {
        baseCalls.push('apply-base-a')
      },
    }
    const baseB = {
      /**
       * Creates the dependent base runtime context and records init order.
       * @returns Base context with mutable parts index.
       */
      createRuntimeContext(): { setPartsIndex: (partsIndex: number) => void; partsIndex?: number } {
        baseCalls.push('create-base-b')
        return {
          /**
           * Records the parts index assigned by ModelContext.
           * @param partsIndex Runtime parts index.
           */
          setPartsIndex(partsIndex: number) {
            this.partsIndex = partsIndex
          },
        }
      },
      /**
       * Reads this base data id.
       * @returns Dependent base id string.
       */
      getBaseDataID: () => ({ id: 'base-b' }),
      /**
       * Declares a dependency on base A so init sorting can be checked.
       * @returns Target base id.
       */
      getTargetBaseDataID: () => baseAId,
      /**
       * Records update pass.
       */
      updateRuntimeContext(): void {
        baseCalls.push('update-base-b')
      },
      /**
       * Records apply pass.
       */
      applyRuntimeContext(): void {
        baseCalls.push('apply-base-b')
      },
    }
    const drawAId = new FakeDrawDataID('draw-a')
    const drawBId = new FakeDrawDataID('draw-b')
    const createDrawData = (id: FakeDrawDataID, order: number) => ({
      /**
       * Reads the draw data id used by cache lookup.
       * @returns Draw data id.
       */
      getDrawDataID: () => id,
      /**
       * Creates a runtime draw context for this draw data.
       * @returns Draw context fixture.
       */
      createDrawContext() {
        return {
          partsIndex: -1,
          partsOpacity: 0,
          /**
           * Keeps this draw data in the normal draw-order path.
           * @returns False because the fixture is not clipped.
           */
          isClipped: () => false,
          /**
           * Keeps this draw data renderable.
           * @returns True because the fixture should draw.
           */
          isRenderable: () => true,
          /**
           * Supplies the source draw data writer used by writeTransformedPointsByDrawOrder.
           * @returns Writer fixture that records output offsets.
           */
          getSourceDrawData: () => ({
            /**
             * Records transformed-point write offsets.
             * @param _modelContext Runtime model context.
             * @param _drawContext Runtime draw context.
             * @param outputOffset Destination offset chosen by ModelContext.
             */
            writeDrawOrderToPointBuffer(
              _modelContext: unknown,
              _drawContext: unknown,
              outputOffset: number,
            ): void {
              pointWrites.push([String(id), outputOffset])
            },
          }),
        }
      },
      /**
       * Records draw-data update pass.
       */
      updateDrawContext(): void {
        drawCalls.push(`update-${id}`)
      },
      /**
       * Records draw-data apply pass.
       */
      applyDrawContext(): void {
        drawCalls.push(`apply-${id}`)
      },
      /**
       * Returns the fixture draw order bucket.
       * @returns Draw order value.
       */
      getDrawOrder(): number {
        return order
      },
      /**
       * Records final draw calls in ModelContext draw order.
       */
      draw(): void {
        drawCalls.push(`draw-${id}`)
      },
    })
    const drawA = createDrawData(drawAId, 2)
    const drawB = createDrawData(drawBId, 0)
    const partsData = {
      /**
       * Creates the parts runtime context.
       * @returns Parts context fixture.
       */
      createPartsContext: () => partsContext,
      /**
       * Returns intentionally unordered base data so dependency sorting is exercised.
       * @returns Base data list.
       */
      getBaseDataList: () => [baseB, baseA],
      /**
       * Returns draw data in source order.
       * @returns Draw data list.
       */
      getDrawDataList: () => [drawA, drawB],
      /**
       * Reads the authored parts id for index lookup.
       * @returns Parts id string.
       */
      getPartsID: () => 'PARTS_A',
    }
    const paramDefinitions = [
      {
        getParamID: () => 'ParamA',
        getDefaultValue: () => 0.5,
        getMinValue: () => 0,
        getMaxValue: () => 1,
      },
      {
        getParamID: () => 'ParamB',
        getDefaultValue: () => 2,
        getMinValue: () => -10,
        getMaxValue: () => 10,
      },
    ]
    const model = {
      /**
       * Provides decoded model data to ModelContext.init().
       * @returns Minimal model implementation fixture.
       */
      getModelImpl() {
        return {
          getPartsDataList: () => [partsData],
          getParamDefinitionSet: () => ({
            getParamDefinitions: () => paramDefinitions,
          }),
        }
      },
    }

    const ModelContextCtor = modelContextConstructors.ModelContext

    expect(ModelContextCtor.nextInstanceId).toBe(0)
    expect(ModelContextCtor.reportUpdateErrors).toBe(true)
    expect(ModelContextCtor.emptyDrawOrderIndex).toBe(-1)
    expect(ModelContextCtor.endOfDrawOrderIndex).toBe(-1)
    expect(ModelContextCtor.cleanParamFlag).toBe(false)
    expect(ModelContextCtor.dirtyParamFlag).toBe(true)
    expect(ModelContextCtor.fallbackParamMinValue).toBe(-1000000)
    expect(ModelContextCtor.fallbackParamMaxValue).toBe(1000000)
    expect(ModelContextCtor.initialParamCapacity).toBe(32)
    expect(ModelContextCtor.traceUpdatePhases).toBe(false)

    const context = new ModelContextCtor(model as never)
    expect(context.instanceId).toBe(0)
    expect(ModelContextCtor.nextInstanceId).toBe(1)
    const secondContext = new ModelContextCtor(model as never)
    expect(secondContext.instanceId).toBe(1)
    expect(ModelContextCtor.nextInstanceId).toBe(2)

    const drawParam = {
      /**
       * Records draw preparation calls.
       */
      prepareDrawState: vi.fn(),
    }
    context.setDrawParam(drawParam)
    context.init()

    expect(context.getBaseData(0)).toBe(baseA)
    expect(context.getBaseData(1)).toBe(baseB)
    expect(context.getParamIndex('ParamA')).toBe(0)
    expect(context.getParamFloat(0)).toBe(0.5)
    expect(context.getParamMin(0)).toBe(0)
    expect(context.getParamMax(0)).toBe(1)
    context.setParamFloat(0, 2)
    expect(context.getParamFloat(0)).toBe(1)
    context.setPartsOpacity(0, 0.4)
    expect(context.getPartsOpacity(0)).toBe(0.4)
    expect(context.getPartsDataIndex('PARTS_A')).toBe(0)
    expect(context.getDrawData(drawAId)).toBe(drawA)
    expect(context.getDrawData(99)).toBeNull()

    for (let index = 0; index < 31; index++) {
      context.registerParamDefinition(`Extra${index}`, index, -100, 100)
    }
    expect(context.paramIds.length).toBe(64)
    context.saveParam()
    context.setParamFloat(2, 88)
    context.loadParam()
    expect(context.getParamFloat(2)).toBe(0)

    context.update()
    context.draw(drawParam)
    context.writeTransformedPointsByDrawOrder(3, 2)
    context.preDraw(drawParam)

    expect(baseCalls).toEqual([
      'create-base-b',
      'create-base-a',
      'update-base-a',
      'apply-base-a',
      'update-base-b',
      'apply-base-b',
    ])
    expect(drawCalls).toEqual([
      'update-draw-a',
      'apply-draw-a',
      'update-draw-b',
      'apply-draw-b',
      'draw-draw-b',
      'draw-draw-a',
    ])
    expect(pointWrites).toEqual([
      ['draw-b', 3],
      ['draw-a', 5],
    ])
    expect(clipCalls[0]).toEqual(['constructor', drawParam])
    expect(clipCalls[1]).toEqual(['init', context, 2, 2])
    expect(clipCalls[2]).toEqual(['setupClip', context, drawParam])
    expect(debugErrors).toEqual([])
    expect(live2DErrors).toEqual([])
    expect(context.isInitialParamUpdatePending()).toBe(false)
  })

  it('routes MOC type tags through a dedicated object factory module', () => {
    class VersionedMocFixture {}
    class GridBaseData extends VersionedMocFixture {
      readonly kind = 'grid'
    }
    class ParamBindingSet extends VersionedMocFixture {
      readonly kind = 'param-binding-set'
    }
    class ParamBinding extends VersionedMocFixture {
      readonly kind = 'param-binding'
    }
    class TransformBaseData extends VersionedMocFixture {
      readonly kind = 'transform-base'
    }
    class TransformValue extends VersionedMocFixture {
      readonly kind = 'transform-value'
    }
    class MeshDrawData extends VersionedMocFixture {
      readonly kind = 'mesh-draw'
    }
    class ParamDefinition extends VersionedMocFixture {
      readonly kind = 'param-definition'
    }
    class PartsData extends VersionedMocFixture {
      readonly kind = 'parts'
    }
    class ModelImpl extends VersionedMocFixture {
      readonly kind = 'model-impl'
    }
    class ParamDefinitionSet extends VersionedMocFixture {
      readonly kind = 'param-definition-set'
    }
    class PartsDataLinkRecord extends VersionedMocFixture {
      readonly kind = 'parts-link'
    }

    const { createObjectByTypeTag } = createCubism2MocObjectFactory({
      Cubism2GridBaseData: GridBaseData,
      Cubism2MeshDrawData: MeshDrawData,
      Cubism2ModelImpl: ModelImpl,
      Cubism2ParamBinding: ParamBinding,
      Cubism2ParamBindingSet: ParamBindingSet,
      Cubism2ParamDefinition: ParamDefinition,
      Cubism2ParamDefinitionSet: ParamDefinitionSet,
      Cubism2PartsData: PartsData,
      Cubism2PartsDataLinkRecord: PartsDataLinkRecord,
      Cubism2TransformBaseData: TransformBaseData,
      Cubism2TransformValue: TransformValue,
    })

    expect(createObjectByTypeTag(65)).toBeInstanceOf(GridBaseData)
    expect(createObjectByTypeTag(66)).toBeInstanceOf(ParamBindingSet)
    expect(createObjectByTypeTag(67)).toBeInstanceOf(ParamBinding)
    expect(createObjectByTypeTag(68)).toBeInstanceOf(TransformBaseData)
    expect(createObjectByTypeTag(69)).toBeInstanceOf(TransformValue)
    expect(createObjectByTypeTag(70)).toBeInstanceOf(MeshDrawData)
    expect(createObjectByTypeTag(131)).toBeInstanceOf(ParamDefinition)
    expect(createObjectByTypeTag(133)).toBeInstanceOf(PartsData)
    expect(createObjectByTypeTag(136)).toBeInstanceOf(ModelImpl)
    expect(createObjectByTypeTag(137)).toBeInstanceOf(ParamDefinitionSet)
    expect(createObjectByTypeTag(142)).toBeInstanceOf(PartsDataLinkRecord)
    expect(createObjectByTypeTag(999)).toBeNull()
  })

  it('centralizes required Cubism2 globals and asserts missing core state by name', () => {
    expect(CUBISM2_REQUIRED_GLOBALS).toEqual([
      'Live2D',
      'Live2DModelWebGL',
      'Live2DMotion',
      'MotionQueueManager',
    ])
    expect(isCubism2CoreReady(window)).toBe(false)
    expect(() => assertCubism2CoreReady(window)).toThrow(/Live2D/)
  })

  it('installs the Cubism2 core without appending a public script tag', () => {
    const appendChild = vi.spyOn(document.body, 'appendChild')

    installCubism2Core(window)

    expect(appendChild).not.toHaveBeenCalled()
    expect(isCubism2CoreReady(window)).toBe(true)
  })

  it('decodes Cubism2 object references from the binary-reader cache', () => {
    const { Reader } = createRecordingBinaryReader()
    const reader = new Reader(createDataView([3, 65, 66, 67, 0, 0, 0, 0]))

    const decodedString = reader.readObjectByTypeTag(1)
    const cachedString = reader.readObjectByTypeTag(33)

    expect(decodedString).toBe('ABC')
    expect(cachedString).toBe(decodedString)
  })

  it('routes binary-reader MocVersion consumers through semantic static entries', () => {
    const semanticFactoryCalls: number[] = []
    const versionedReaderMarkers: number[] = []
    const { Reader } = createRecordingBinaryReader({
      mocVersion: {
        OBJECT_REFERENCE_TYPE_TAG: 33,
        /**
         * Records semantic MOC-version factory calls and returns a reader-aware fake object.
         * @param typeTag Versioned MOC object tag requested by the binary reader.
         * @returns Fake versioned object whose reader hook records one byte from the stream.
         */
        createObjectByTypeTag(typeTag: number) {
          semanticFactoryCalls.push(typeTag)
          return {
            /**
             * Records that the semantic factory result was initialized by the reader.
             * @param reader Binary reader handed to the model-data reader hook.
             */
            readModelData(reader: unknown) {
              versionedReaderMarkers.push((reader as { readInt8: () => number }).readInt8())
            },
          }
        },
      },
    })

    const referenceReader = new Reader(createDataView([3, 65, 66, 67, 0, 0, 0, 0]))
    const decodedString = referenceReader.readObjectByTypeTag(1)
    const cachedString = referenceReader.readObjectByTypeTag(33)
    expect(cachedString).toBe(decodedString)

    const versionedReader = new Reader(createDataView([77]))
    const versionedObject = versionedReader.readValueForTypeTag(136)
    expect(versionedObject).toEqual({ readModelData: expect.any(Function) })
    expect(semanticFactoryCalls).toEqual([136])
    expect(versionedReaderMarkers).toEqual([77])
  })

















  it('routes model-base MocVersion load guards through semantic static entries', () => {
    class FakeCoreError extends Error {}
    class FakeBinaryReader {
      static lastFormatVersion: number | null = null
      private cursor = 0

      /**
       * Stores the DataView only to mirror the production reader constructor shape.
       * @param sourceBuffer MOC bytes supplied by the model-base loader.
       */
      constructor(private readonly sourceBuffer: DataView) {}

      /**
       * Reads one byte from the fake MOC header.
       * @returns Next signed byte in the backing buffer.
       */
      readInt8(): number {
        return this.sourceBuffer.getInt8(this.cursor++)
      }

      /**
       * Reads one 16-bit checksum marker from the fake MOC payload.
       * @returns Next signed 16-bit marker in the backing buffer.
       */
      readInt16(): number {
        const value = this.sourceBuffer.getInt16(this.cursor)
        this.cursor += 2
        return value
      }

      /**
       * Produces a minimal model implementation for the semantic version-threshold path.
       * @returns Fake model implementation that satisfies model-context initialization.
       */
      readObject(): unknown {
        return {
          getCanvasHeight: () => 0,
          getCanvasWidth: () => 0,
          initializeModelContainers: () => {},
        }
      }

      /**
       * Records the format version read from the MOC header.
       * @param formatVersion Version byte consumed after the `moc` magic.
       */
      setFormatVersion(formatVersion: number): void {
        FakeBinaryReader.lastFormatVersion = formatVersion
      }
    }
    class FakeModelContext {
      /** Receives the draw parameter set after successful MOC load. */
      setDrawParam(): void {}
      /** Marks the fake model context initialized after successful MOC load. */
      init(): void {}
      /**
       * @returns Null because this focused loader test never asks for draw contexts.
       */
      getDrawContext(): null {
        return null
      }
      /**
       * @returns Null because this focused loader test never asks for draw data.
       */
      getDrawData(): null {
        return null
      }
      /**
       * @returns Missing draw-data index for unused draw lookup paths.
       */
      getDrawDataIndex(): number {
        return -1
      }
      /**
       * @returns Zero for unused parameter reads.
       */
      getParamFloat(): number {
        return 0
      }
      /**
       * @returns Missing parameter index for unused parameter lookup paths.
       */
      getParamIndex(): number {
        return -1
      }
      /**
       * @returns Missing parts index for unused parts lookup paths.
       */
      getPartsDataIndex(): number {
        return -1
      }
      /**
       * @returns Zero for unused parts opacity reads.
       */
      getPartsOpacity(): number {
        return 0
      }
      /** Included for constructor contract completeness in this focused load test. */
      loadParam(): void {}
      /** Included for constructor contract completeness in this focused load test. */
      saveParam(): void {}
      /** Included for constructor contract completeness in this focused load test. */
      setParamFloat(): void {}
      /** Included for constructor contract completeness in this focused load test. */
      setPartsOpacity(): void {}
      /** Included for constructor contract completeness in this focused load test. */
      update(): void {}
    }
    class FakeMeshDrawContext {
      /**
       * @returns Fake mesh type for unused draw-context branches.
       */
      getType(): number {
        return 70
      }
    }
    class FakeMeshDrawData extends FakeMeshDrawContext {}
    const debugErrors: unknown[] = []
    const semanticMocVersion = {
      MAX_SUPPORTED_FORMAT_VERSION: 11,
      LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 8,
    }
    const ModelBase = createCubism2ModelBase({
      Cubism2BinaryReader: FakeBinaryReader,
      Cubism2CoreError: FakeCoreError,
      Cubism2DrawDataBase: { TYPE_MESH: 70 },
      Cubism2MeshDrawContext: FakeMeshDrawContext,
      Cubism2MeshDrawData: FakeMeshDrawData,
      Cubism2MocVersion: semanticMocVersion,
      Cubism2ModelImpl: class {
        /** Keeps the fallback model implementation contract available if requested. */
        initializeModelContainers(): void {}
        /**
         * @returns Zero-width fake canvas.
         */
        getCanvasWidth(): number {
          return 0
        }
        /**
         * @returns Zero-height fake canvas.
         */
        getCanvasHeight(): number {
          return 0
        }
      },
      DrawDataID: { getID: (id: unknown) => id },
      ModelContext: FakeModelContext,
      ParamID: { getID: (id: unknown) => id },
      PartsDataID: class {
        /**
         * Returns the ID unchanged because this focused loader test does not exercise parts lookup.
         * @param id Parts ID value passed by the model facade.
         * @returns Original ID value.
         */
        static getID(id: unknown): unknown {
          return id
        }
      },
      UtDebug: {
        /**
         * Records swallowed loader errors for focused assertions.
         * @param error Error object routed by the loader catch block.
         */
        logException(error: unknown) {
          debugErrors.push(error)
        },
        /** Ignores diagnostics outside this focused load guard test. */
        logWithLegacyPrefix() {},
      },
      isBootstrapping: () => false,
    })

    const model = new ModelBase()
    const bytes = new Uint8Array(8)
    bytes.set([109, 111, 99, 8])
    const view = new DataView(bytes.buffer)
    view.setInt16(4, -30584)
    view.setInt16(6, -30584)
    ModelBase.loadMocDataIntoModel(model, view)

    expect(FakeBinaryReader.lastFormatVersion).toBe(8)
    expect(debugErrors).toEqual([])
    expect(model.getModelImpl()).toBeTruthy()
  })













  it('routes draw-data MocVersion gates through semantic static entries', () => {
    class FakeParamBindingSet {
      /**
       * Initializes the fake binding list before the mesh payload replaces it from the reader.
       */
      initBindingList(): void {}

      /**
       * Keeps mesh update paths out of this focused version-gate test.
       * @param modelContext Runtime model context supplied by draw-data update code.
       * @returns False because this test only parses draw-data payloads.
       */
      hasChangedParams(modelContext: unknown): boolean {
        void modelContext
        return false
      }

      /**
       * Satisfies the interpolation helper contract for accidental generic calls.
       * @param modelContext Runtime model context supplied by interpolation helpers.
       * @param dirtyFlagRef Mutable dirty flag owned by the draw context.
       * @returns Zero dimensions because this fixture does not resolve real interpolation corners.
       */
      resolveInterpolationWeights(modelContext: unknown, dirtyFlagRef: boolean[]): number {
        void modelContext
        dirtyFlagRef[0] = false
        return 0
      }

      /**
       * Satisfies the interpolation-corner helper contract for accidental generic calls.
       * @param indexBuffer Corner index scratch buffer.
       * @param weightBuffer Corner weight scratch buffer.
       * @param dimensionCount Number of interpolation dimensions.
       */
      buildInterpolationCorners(
        indexBuffer: ArrayLike<number>,
        weightBuffer: ArrayLike<number>,
        dimensionCount: number,
      ): void {
        void indexBuffer
        void weightBuffer
        void dimensionCount
      }
    }
    const semanticMocVersion = {
      MAX_SUPPORTED_FORMAT_VERSION: 3,
      LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 2,
    }
    const constructors = createCubism2DrawData({
      BaseDataID: createTestBaseDataIdDependency({ id: 'EMPTY' }),
      Cubism2DrawContextBase: createCubism2DrawContextBase({
        isBootstrapping: () => false,
      }),
      Cubism2MocVersion: semanticMocVersion,
      Cubism2ParamBindingSet: FakeParamBindingSet,
      Cubism2RuntimeConstants: {
        FLIP_MODEL_SPACE_UV_Y: true,
        MODEL_SPACE_COORDINATE_MODE: 1,
        POINT_TUPLE_SIZE: 5,
        POINT_X_OFFSET: 0,
        SDK2_COORDINATE_MODE: 2,
        activeCoordinateMode: 2,
      },
      Live2D: {
        shouldUpdateClippedDrawContextOpacity: false,
        isVerboseLoggingEnabled: () => false,
      },
      UtDebug: {
        /**
         * Ignores diagnostics outside the focused MOC-version routing test.
         * @param message Legacy diagnostic message.
         * @param args Optional diagnostic arguments.
         */
        logWithLegacyPrefix(message: string, ...args: unknown[]): void {
          void message
          void args
        },
      },
      interpolator: {
        /**
         * Fails if this parser-only test unexpectedly reaches point interpolation.
         */
        interpolatePoints(): void {
          throw new Error('point interpolation is outside draw-data version routing')
        },
        /**
         * Fails if this parser-only test unexpectedly reaches draw-order interpolation.
         * @returns Never, because no runtime draw context should update.
         */
        interpolateInteger(): number {
          throw new Error('integer interpolation is outside draw-data version routing')
        },
        /**
         * Fails if this parser-only test unexpectedly reaches opacity interpolation.
         * @returns Never, because no runtime draw context should update.
         */
        interpolateFloat(): number {
          throw new Error('float interpolation is outside draw-data version routing')
        },
      },
      isBootstrapping: () => false,
    })
    const meshData = new constructors.Cubism2MeshDrawData()
    const drawDataId = { id: 'DrawBody' }
    const targetBaseDataId = { id: 'BaseBody' }
    const bindingSet = new FakeParamBindingSet()
    const objectValues: unknown[] = [
      drawDataId,
      targetBaseDataId,
      bindingSet,
      [0, 1, 0],
      [
        [0.1, 0.2, 0.3, 0.4],
        [0.5, 0.6, 0.7, 0.8],
      ],
      [0.1, 0.2, 0.3, 0.4],
    ]
    const intValues = [1, 0, 2, 1, 32]
    const reader = {
      /**
       * Selects both draw-data version-gated branches.
       * @returns Format version matching the semantic thresholds.
       */
      getFormatVersion(): number {
        return 2
      },
      /**
       * Reads opacity values from the shared draw-data payload.
       * @returns Fake opacity interpolation values.
       */
      readFloat32Array(): number[] {
        return [0.5]
      },
      /**
       * Reads draw-order count, texture, vertex count, triangle count, and draw flags.
       * @returns Next integer payload value.
       */
      readInt32(): number {
        return intValues.shift()!
      },
      /**
       * Reads authored draw-order values.
       * @returns Fake draw-order interpolation values.
       */
      readInt32Array(): number[] {
        return [-1, 3]
      },
      /**
       * Reads draw IDs, target base, binding set, clip ID, indices, vertices, then UVs.
       * @returns Next object payload value.
       */
      readObject(): unknown {
        return objectValues.shift() ?? null
      },
    }

    meshData.readMeshDrawData(reader)

    expect(meshData.getDrawDataID()).toBe(drawDataId)
    expect(meshData.getTargetBaseDataID()).toBe(targetBaseDataId)
    expect(meshData.getClipIDList()).toBeNull()
    expect(meshData.getDrawFlagBits()).toBe(32)
    expect(meshData.culling).toBe(false)

    const clippedBaseData = new constructors.Cubism2DrawDataBase()
    const clippedObjectValues: unknown[] = [
      drawDataId,
      targetBaseDataId,
      bindingSet,
      { id: 'MaskA,MaskB' },
    ]
    const clippedReader = {
      /**
       * Selects the max-supported-version clip ID branch without affecting mesh draw flags.
       * @returns Format version that is above the max-version gate.
       */
      getFormatVersion(): number {
        return 3
      },
      /**
       * Reads opacity values from the shared draw-data payload.
       * @returns Fake opacity interpolation values.
       */
      readFloat32Array(): number[] {
        return [0.5]
      },
      /**
       * Reads the draw-order point count.
       * @returns Fake draw-order point count.
       */
      readInt32(): number {
        return 1
      },
      /**
       * Reads authored draw-order values.
       * @returns Fake draw-order interpolation values.
       */
      readInt32Array(): number[] {
        return [-1, 3]
      },
      /**
       * Reads draw IDs, target base, binding set, then clip ID.
       * @returns Next shared draw-data object payload.
       */
      readObject(): unknown {
        return clippedObjectValues.shift() ?? null
      },
    }

    clippedBaseData.readDrawDataBase(clippedReader)
    expect(clippedBaseData.getClipIDList()).toEqual(['MaskA,MaskB'])
  })

  it('routes interpolation consumers through semantic Interpolation static entries', () => {
    const semanticCalls: string[] = []
    const semanticInterpolator = {
      /**
       * Records draw-order interpolation through the semantic static entry.
       * @param modelContext Runtime model context supplied by draw-data/base-data consumers.
       * @param paramBindingSet Param binding set passed through from the data payload.
       * @param dirtyFlagRef Mutable dirty flag shared with the interpolation helper.
       * @param sourceValues Authored integer values selected by interpolation corners.
       * @returns Deterministic draw order used by the consumer-routing assertion.
       */
      interpolateInteger(
        modelContext: unknown,
        paramBindingSet: unknown,
        dirtyFlagRef: boolean[],
        sourceValues: number[] | null,
      ): number {
        void modelContext
        void paramBindingSet
        semanticCalls.push('integer')
        dirtyFlagRef[0] = false
        return sourceValues?.[1] ?? 0
      },
      /**
       * Records opacity interpolation through the semantic static entry.
       * @param modelContext Runtime model context supplied by draw-data/base-data consumers.
       * @param paramBindingSet Param binding set passed through from the data payload.
       * @param dirtyFlagRef Mutable dirty flag shared with the interpolation helper.
       * @param sourceValues Authored float values selected by interpolation corners.
       * @returns Deterministic opacity used by the consumer-routing assertion.
       */
      interpolateFloat(
        modelContext: unknown,
        paramBindingSet: unknown,
        dirtyFlagRef: boolean[],
        sourceValues: number[] | null,
      ): number {
        void modelContext
        void paramBindingSet
        semanticCalls.push('float')
        dirtyFlagRef[0] = false
        return sourceValues?.[0] ?? 1
      },
      /**
       * Records mesh-point interpolation through the semantic static entry.
       * @param modelContext Runtime model context supplied by draw-data consumers.
       * @param paramBindingSet Param binding set passed through from the mesh payload.
       * @param dirtyFlagRef Mutable dirty flag shared with the interpolation helper.
       * @param pointCount Number of points written by the consumer.
       * @param pointValues Authored point tables selected by interpolation corners.
       * @param outputPoints Mutable mesh point buffer receiving interpolation output.
       * @param valueOffset First tuple x-offset inside the output buffer.
       * @param tupleStride Distance between output tuples.
       */
      interpolatePoints(
        modelContext: unknown,
        paramBindingSet: unknown,
        dirtyFlagRef: boolean[],
        pointCount: number,
        pointValues: number[][] | null,
        outputPoints: Float32Array | null,
        valueOffset: number,
        tupleStride: number,
      ): void {
        void modelContext
        void paramBindingSet
        semanticCalls.push('points')
        dirtyFlagRef[0] = false
        const sourcePointValues = pointValues![0]!
        for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
          const sourceOffset = pointIndex << 1
          const outputOffset = pointIndex * tupleStride + valueOffset
          outputPoints![outputOffset] = sourcePointValues[sourceOffset]! + 20
          outputPoints![outputOffset + 1] = sourcePointValues[sourceOffset + 1]! + 20
        }
      },
    }
    const emptyBaseDataId = { id: 'DST_BASE' }
    const BaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency(emptyBaseDataId),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 10,
      },
      interpolator: semanticInterpolator,
      isBootstrapping: () => false,
    })
    const baseData = new BaseData()
    const opacityWrites: number[] = []
    baseData.opacityValues = [0.33, 0.66]
    baseData.interpolateOpacity(
      { kind: 'model-context' },
      { kind: 'binding-set' },
      {
        /**
         * Records opacity written by the shared base-data consumer.
         * @param opacity Opacity value returned by the semantic interpolation entry.
         */
        setInterpolatedOpacity(opacity: number) {
          opacityWrites.push(opacity)
        },
      },
      [true],
    )

    class FakeParamBindingSet {
      /**
       * @returns True so mesh update runs draw-order, opacity, and point interpolation.
       */
      hasChangedParams(): boolean {
        return true
      }

      /**
       * Marks the fake binding list as initialized; unused in this route check.
       */
      initBindingList(): void {}

      /**
       * Satisfies the interpolation helper shape for accidental generic calls.
       * @param indexBuffer Corner index scratch buffer.
       * @param weightBuffer Corner weight scratch buffer.
       * @param dimensionCount Active interpolation dimension count.
       */
      buildInterpolationCorners(
        indexBuffer: ArrayLike<number>,
        weightBuffer: ArrayLike<number>,
        dimensionCount: number,
      ): void {
        void indexBuffer
        void weightBuffer
        void dimensionCount
      }

      /**
       * Satisfies the interpolation helper shape for accidental generic calls.
       * @param modelContext Runtime model context.
       * @param dirtyFlagRef Mutable dirty flag reference.
       * @returns Zero dimensions for accidental generic interpolation.
       */
      resolveInterpolationWeights(modelContext: unknown, dirtyFlagRef: boolean[]): number {
        void modelContext
        dirtyFlagRef[0] = false
        return 0
      }
    }
    const drawConstructors = createCubism2DrawData({
      BaseDataID: createTestBaseDataIdDependency(emptyBaseDataId),
      Cubism2DrawContextBase: createCubism2DrawContextBase({
        isBootstrapping: () => false,
      }),
      Cubism2MocVersion: {
        MAX_SUPPORTED_FORMAT_VERSION: 2,
        LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 2,
      },
      Cubism2ParamBindingSet: FakeParamBindingSet,
      Cubism2RuntimeConstants: {
        FLIP_MODEL_SPACE_UV_Y: true,
        MODEL_SPACE_COORDINATE_MODE: 1,
        POINT_TUPLE_SIZE: 5,
        POINT_X_OFFSET: 0,
        SDK2_COORDINATE_MODE: 2,
        activeCoordinateMode: 2,
      },
      Live2D: {
        shouldUpdateClippedDrawContextOpacity: false,
        isVerboseLoggingEnabled: () => false,
      },
      UtDebug: {
        /**
         * Ignores diagnostics for this focused consumer-routing test.
         */
        logWithLegacyPrefix() {},
      },
      interpolator: semanticInterpolator,
      isBootstrapping: () => false,
    })
    const meshData = new drawConstructors.Cubism2MeshDrawData()
    meshData.paramBindingSet = new FakeParamBindingSet()
    meshData.drawOrderValues = [101, 202]
    meshData.opacityValues = [0.44, 0.88]
    meshData.vertexCount = 2
    meshData.vertexPointValues = [[1, 2, 3, 4]]
    meshData.uvCoordinates = [0.1, 0.2, 0.3, 0.4]
    const drawContext = meshData.createDrawContext()

    meshData.updateDrawContext({ kind: 'model-context' } as never, drawContext)

    expect(opacityWrites).toEqual([0.33])
    expect(drawContext.drawOrder).toBe(202)
    expect(drawContext.interpolatedOpacity).toBe(0.44)
    expect(drawContext.localPoints).toEqual(new Float32Array([21, 22, 0, 0, 0, 23, 24, 0, 0, 0]))
    expect(semanticCalls).toEqual(['float', 'integer', 'float', 'points'])
  })

  it('routes grid-base-data point interpolation through semantic Interpolation static entry', () => {
    const semanticPointCalls: Array<{
      pointCount: number
      valueOffset: number
      tupleStride: number
    }> = []
    const emptyBaseDataId = { id: 'EMPTY' }
    const BaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency(emptyBaseDataId),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 10,
      },
      interpolator: {
        /**
         * Provides opacity interpolation for the shared base-data update call.
         * @param modelContext Runtime model context forwarded by the grid update path.
         * @param paramBindingSet Grid parameter binding set.
         * @param dirtyFlagRef Dirty flag reference shared with the interpolation helper.
         * @param sourceValues Authored opacity table.
         * @returns First opacity value so the focused assertion can ignore opacity math.
         */
        interpolateFloat(
          modelContext: unknown,
          paramBindingSet: unknown,
          dirtyFlagRef: boolean[],
          sourceValues: ArrayLike<number> | null,
        ): number {
          void modelContext
          void paramBindingSet
          dirtyFlagRef[0] = false
          return sourceValues?.[0] ?? 1
        },
      },
      isBootstrapping: () => false,
    })
    const BaseContext = createCubism2BaseContext({
      isBootstrapping: () => false,
    })
    const GridBaseData = createCubism2GridBaseData({
      Cubism2BaseContext: BaseContext,
      Cubism2BaseData: BaseData,
      Cubism2Interpolation: {
        /**
         * Writes deterministic grid points through the semantic static entry.
         * @param modelContext Runtime model context that owns interpolation scratch buffers.
         * @param paramBindingSet Grid parameter binding set consumed by interpolation.
         * @param dirtyFlagRef Dirty flag reference shared with the binding set.
         * @param pointCount Number of logical points requested by the grid data.
         * @param pointValues Authored grid point tables.
         * @param outputPoints Runtime local point buffer receiving interpolated points.
         * @param valueOffset First x-coordinate offset in the target buffer.
         * @param tupleStride Number of scalar slots per logical point.
         */
        interpolatePoints(
          modelContext,
          paramBindingSet,
          dirtyFlagRef,
          pointCount,
          pointValues,
          outputPoints,
          valueOffset,
          tupleStride,
        ): void {
          void modelContext
          void paramBindingSet
          semanticPointCalls.push({ pointCount, tupleStride, valueOffset })
          dirtyFlagRef[0] = true
          const sourcePointValues = pointValues![0]!
          for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
            const sourceOffset = pointIndex << 1
            const outputOffset = pointIndex * tupleStride + valueOffset
            outputPoints![outputOffset] = sourcePointValues[sourceOffset]! + 100
            outputPoints![outputOffset + 1] = sourcePointValues[sourceOffset + 1]! + 100
          }
        },
      },
      Cubism2ParamBindingSet: class {
        /**
         * Initializes a fake binding list; unused by this update-path test.
         */
        initBindingList(): void {}
      } as never,
      Live2D: {
        isVerboseLoggingEnabled: () => false,
        shouldClampSdk1GridPointsToUnitRange: true,
      },
      System: {
        err: {
          /**
           * Ignores legacy diagnostics not involved in interpolation routing.
           * @param message Legacy printf-style diagnostic.
           * @param args Optional diagnostic interpolation values.
           */
          printf(message: string, ...args: unknown[]): void {
            void message
            void args
          },
        },
      },
      UtDebug: {
        /**
         * Ignores target-base diagnostics not involved in interpolation routing.
         * @param message Legacy diagnostic string.
         * @param args Optional diagnostic payload.
         */
        logWithLegacyPrefix(message: string, ...args: unknown[]): void {
          void message
          void args
        },
      },
      isBootstrapping: () => false,
    }).Cubism2GridBaseData
    const gridBaseData = new GridBaseData()
    const paramBindingSet = {
      /**
       * Allows the focused grid update path to run.
       * @returns Always true because this test targets interpolation routing.
       */
      hasChangedParams(): boolean {
        return true
      },
    }
    gridBaseData.gridColumnCount = 1
    gridBaseData.gridRowCount = 1
    gridBaseData.gridPointValues = [new Float32Array([1, 2, 3, 4, 5, 6, 7, 8])]
    gridBaseData.opacityValues = [0.75]
    gridBaseData.paramBindingSet = paramBindingSet as never
    const gridContext = gridBaseData.createRuntimeContext({ kind: 'grid-model-context' })

    gridBaseData.updateRuntimeContext({ kind: 'grid-model-context' }, gridContext)

    expect(semanticPointCalls).toEqual([{ pointCount: 4, tupleStride: 2, valueOffset: 0 }])
    expect(gridContext.localPoints).toEqual(new Float32Array([101, 102, 103, 104, 105, 106, 107, 108]))
    expect(gridContext.hasTransform()).toBe(true)
  })

  it('routes BaseDataID default-base consumers through semantic static entry', () => {
    const defaultBaseDataId = { id: 'DST_BASE' }
    const targetBaseDataId = { id: 'TargetBase' }
    const semanticCalls: string[] = []
    const BaseDataID = {
      /**
       * Returns the SDK2 default base-data sentinel through the restored semantic entry.
       * @returns Stable default base-data ID used by all target-base consumers.
       */
      getDefaultBaseDataID(): unknown {
        semanticCalls.push('default-base-id')
        return defaultBaseDataId
      },
    }

    const BaseData = createCubism2BaseData({
      BaseDataID,
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 10,
      },
      interpolator: {
        /**
         * Provides a deterministic opacity value for the shared base-data dependency shape.
         * @param modelContext Runtime model context forwarded by base-data consumers.
         * @param paramBindingSet Parameter binding set forwarded by base-data consumers.
         * @param dirtyFlagRef Mutable dirty flag passed through to interpolation.
         * @param sourceValues Authored opacity value table.
         * @returns First authored opacity value, or full opacity when none exists.
         */
        interpolateFloat(
          modelContext: unknown,
          paramBindingSet: unknown,
          dirtyFlagRef: boolean[],
          sourceValues: number[] | null,
        ): number {
          void modelContext
          void paramBindingSet
          dirtyFlagRef[0] = false
          return sourceValues?.[0] ?? 1
        },
      },
      isBootstrapping: () => false,
    })
    const baseData = new BaseData()
    baseData.setTargetBaseDataID(defaultBaseDataId)
    expect(baseData.hasTargetBaseData()).toBe(false)
    baseData.setTargetBaseDataID(targetBaseDataId)
    expect(baseData.hasTargetBaseData()).toBe(true)

    class FakeParamBindingSet {
      /**
       * Keeps the fake binding list compatible with draw-data construction.
       */
      initBindingList(): void {}

      /**
       * Satisfies the interpolation helper shape without affecting target-base checks.
       * @param indexBuffer Corner index scratch buffer.
       * @param weightBuffer Corner weight scratch buffer.
       * @param dimensionCount Active interpolation dimension count.
       */
      buildInterpolationCorners(
        indexBuffer: ArrayLike<number>,
        weightBuffer: ArrayLike<number>,
        dimensionCount: number,
      ): void {
        void indexBuffer
        void weightBuffer
        void dimensionCount
      }

      /**
       * Keeps accidental interpolation calls deterministic in this routing test.
       * @returns False because target-base checks do not need parameter interpolation.
       */
      hasChangedParams(): boolean {
        return false
      }

      /**
       * Keeps accidental interpolation calls deterministic in this routing test.
       * @param modelContext Runtime model context supplied by interpolation.
       * @param dirtyFlagRef Mutable dirty flag reference.
       * @returns Zero interpolation dimensions.
       */
      resolveInterpolationWeights(modelContext: unknown, dirtyFlagRef: boolean[]): number {
        void modelContext
        dirtyFlagRef[0] = false
        return 0
      }
    }
    const drawConstructors = createCubism2DrawData({
      BaseDataID,
      Cubism2DrawContextBase: createCubism2DrawContextBase({
        isBootstrapping: () => false,
      }),
      Cubism2MocVersion: {
        MAX_SUPPORTED_FORMAT_VERSION: 2,
        LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 2,
      },
      Cubism2ParamBindingSet: FakeParamBindingSet,
      Cubism2RuntimeConstants: {
        FLIP_MODEL_SPACE_UV_Y: true,
        MODEL_SPACE_COORDINATE_MODE: 1,
        POINT_TUPLE_SIZE: 5,
        POINT_X_OFFSET: 0,
        SDK2_COORDINATE_MODE: 2,
        activeCoordinateMode: 2,
      },
      Live2D: {
        shouldUpdateClippedDrawContextOpacity: false,
        isVerboseLoggingEnabled: () => false,
      },
      UtDebug: {
        /**
         * Ignores target-base diagnostics not involved in semantic BaseDataID routing.
         * @param message Legacy diagnostic message.
         * @param args Optional diagnostic values.
         */
        logWithLegacyPrefix(message: string, ...args: unknown[]): void {
          void message
          void args
        },
      },
      interpolator: {
        /**
         * Fails if draw-data target-base checks accidentally reach point interpolation.
         */
        interpolatePoints(): void {
          throw new Error('point interpolation should not run in BaseDataID routing test')
        },
        /**
         * Fails if draw-data target-base checks accidentally reach integer interpolation.
         * @returns Never, because draw-order interpolation is outside this test.
         */
        interpolateInteger(): number {
          throw new Error('integer interpolation should not run in BaseDataID routing test')
        },
        /**
         * Fails if draw-data target-base checks accidentally reach float interpolation.
         * @returns Never, because opacity interpolation is outside this test.
         */
        interpolateFloat(): number {
          throw new Error('float interpolation should not run in BaseDataID routing test')
        },
      },
      isBootstrapping: () => false,
    })
    const drawData = new drawConstructors.Cubism2DrawDataBase()
    drawData.setTargetBaseDataID(defaultBaseDataId)
    expect(drawData.hasTargetBaseData()).toBe(false)
    drawData.setTargetBaseDataID(targetBaseDataId)
    expect(drawData.hasTargetBaseData()).toBe(true)

    class FakeClippingManager {
      /**
       * Accepts the draw-param dependency required by ModelContext initialization.
       * @param drawParam Draw parameter adapter supplied by ModelContext.
       */
      constructor(drawParam: unknown) {
        void drawParam
      }

      /**
       * Accepts rebuilt draw tables so ModelContext init can complete.
       * @param modelContext Model context being initialized.
       * @param drawDataList Ordered draw-data table.
       * @param drawContextList Ordered draw-context table.
       */
      init(modelContext: unknown, drawDataList: unknown[], drawContextList: unknown[]): void {
        void modelContext
        void drawDataList
        void drawContextList
      }

      /**
       * Accepts later clip setup calls if the context is drawn during a regression.
       * @param modelContext Model context being drawn.
       * @param drawParam Draw parameter adapter supplied by the renderer.
       */
      setupClip(modelContext: unknown, drawParam: unknown): void {
        void modelContext
        void drawParam
      }
    }
    class FakeDrawDataID {}
    const modelContextConstructors = createCubism2ModelContext({
      BaseDataID,
      Cubism2ClippingManager: FakeClippingManager,
      Cubism2DrawDataBase: {
        /**
         * Returns the minimum draw-order bucket for empty test models.
         * @returns Minimum draw-order value.
         */
        getMinDrawOrder(): number {
          return 0
        },
        /**
         * Returns the maximum draw-order bucket for empty test models.
         * @returns Maximum draw-order value.
         */
        getMaxDrawOrder(): number {
          return 0
        },
      },
      Cubism2RuntimeConstants: {
        maxInterpolationCornerCount: 4,
        maxTransformParameterDimensionCount: 4,
      },
      DrawDataID: FakeDrawDataID,
      Live2D: {
        L2D_ERROR_MODEL_UPDATE: 4000,
        /**
         * Fails if empty model initialization unexpectedly reports a semantic Live2D error.
         * @param errorCode Live2D error code surfaced by ModelContext draw update.
         */
        setErrorCode(errorCode: number): void {
          throw new Error(`unexpected Live2D error ${errorCode}`)
        },
      },
      UtDebug: {
        /**
         * Fails if empty model initialization unexpectedly reports debug errors.
         * @param error Error emitted by update traversal.
         */
        logException(error: unknown): void {
          throw error
        },
        /**
         * Ignores info diagnostics not involved in semantic BaseDataID routing.
         */
        logWithLegacyPrefix(): void {},
        /**
         * Ignores timer start calls not involved in this route check.
         */
        start(): void {},
        /**
         * Ignores timer dump calls not involved in this route check.
         */
        dump(): void {},
      },
      UtSystem: {
        /**
         * Copies values for ModelContext array growth paths if they are reached by a regression.
         * @param source Source array-like object.
         * @param sourceStart First source index copied.
         * @param target Destination array-like object.
         * @param targetStart First target index written.
         * @param copyCount Number of entries copied.
         */
        copyArraySegmentForward(
          source: ArrayLike<unknown>,
          sourceStart: number,
          target: { [index: number]: unknown },
          targetStart: number,
          copyCount: number,
        ): void {
          for (let index = 0; index < copyCount; index += 1) {
            target[targetStart + index] = source[sourceStart + index]
          }
        },
      },
      isBootstrapping: () => false,
    })
    const model = {
      /**
       * Provides an empty decoded model so ModelContext still executes the default base-data lookup.
       * @returns Minimal model implementation with no parts or parameters.
       */
      getModelImpl() {
        return {
          /**
           * Supplies no parts while preserving the decoded model API shape.
           * @returns Empty parts-data list.
           */
          getPartsDataList(): unknown[] {
            return []
          },
          /**
           * Supplies no parameter definitions while preserving the decoded model API shape.
           * @returns Null parameter definition set.
           */
          getParamDefinitionSet(): null {
            return null
          },
        }
      },
    }
    const modelContext = new modelContextConstructors.ModelContext(model)
    modelContext.init()

    expect(semanticCalls).toEqual([
      'default-base-id',
      'default-base-id',
      'default-base-id',
      'default-base-id',
      'default-base-id',
    ])
  })

  it('initializes binary-reader scratch buffers on semantic fields', () => {
    const { Reader } = createRecordingBinaryReader()
    const reader = new Reader(createDataView([]))

    expect(reader.byteScratchBuffer).toBeInstanceOf(Int8Array)
    expect(reader.byteScratchBuffer).toHaveLength(8)
    expect(reader.scratchDataView.buffer).toBe(reader.byteScratchBuffer.buffer)
    expect(reader.stringScratchBuffer).toBeInstanceOf(Int8Array)
    expect(reader.stringScratchBuffer).toHaveLength(1000)

    const replacementByteScratch = new Int8Array(8)
    const replacementDataView = new DataView(replacementByteScratch.buffer)
    const replacementStringScratch = new Int8Array(1000)
    reader.byteScratchBuffer = replacementByteScratch
    reader.scratchDataView = replacementDataView
    reader.stringScratchBuffer = replacementStringScratch

    expect(reader.byteScratchBuffer).toBe(replacementByteScratch)
    expect(reader.scratchDataView).toBe(replacementDataView)
    expect(reader.stringScratchBuffer).toBe(replacementStringScratch)
  })

  it('tracks binary-reader cursor and cache state through semantic fields', () => {
    const initialDataView = createDataView([0, 1, 2, 3])
    const { Reader } = createRecordingBinaryReader()
    const reader = new Reader(initialDataView)

    expect(reader.bitOffset).toBe(0)
    expect(reader.bitBuffer).toBe(0)
    expect(reader.getFormatVersion()).toBe(0)
    expect(reader.objectCache).toEqual([])
    expect(reader.dataView).toBe(initialDataView)
    expect(reader.offset).toBe(0)

    const replacementCache = [{ cached: true }]
    const replacementDataView = createDataView([9, 8, 7, 6])
    reader.bitOffset = 3
    reader.bitBuffer = 170
    reader.setFormatVersion(11)
    reader.objectCache = replacementCache
    reader.dataView = replacementDataView
    reader.offset = 2

    expect(reader.bitOffset).toBe(3)
    expect(reader.bitBuffer).toBe(170)
    expect(reader.getFormatVersion()).toBe(11)
    expect(reader.objectCache).toBe(replacementCache)
    expect(reader.dataView).toBe(replacementDataView)
    expect(reader.offset).toBe(2)

    const bitReader = new Reader(createDataView([160]))
    expect(bitReader.readBit()).toBe(true)
    expect(bitReader.bitOffset).toBe(1)
    bitReader.flushBitReadCursor()
    expect(bitReader.bitOffset).toBe(0)
  })

  it('exposes semantic binary-reader primitives directly', () => {
    const { Reader } = createRecordingBinaryReader()
    const reader = new Reader(createDataView([3, 65, 66, 67, 0, 1]))

    reader.setFormatVersion(7)

    expect(reader.getFormatVersion()).toBe(7)
    expect(reader.readString()).toBe('ABC')
    expect(reader.readBoolean()).toBe(false)
  })

  it('routes legacy primitive type tags through semantic reader constructor dependencies', () => {
    const { calls, Reader } = createRecordingBinaryReader()
    const reader = new Reader(createFloat32DataView([1.25, 2.5, 3.75, 4.5]))

    const decodedRectangle = reader.readValueForTypeTag(12)

    expect(decodedRectangle).toEqual({
      args: [1.25, 2.5, 3.75, 4.5],
      kind: 'floatRectangle',
    })
    expect(calls).toEqual([
      {
        args: [1.25, 2.5, 3.75, 4.5],
        kind: 'floatRectangle',
      },
    ])
  })

  it('decodes affine-transform type tags into semantic transform fields', () => {
    const runtimeUtilities = createCubism2RuntimeUtilities()
    const AffineTransform = createCubism2AffineTransform({
      UtSystem: runtimeUtilities.UtSystem,
      isBootstrapping: () => false,
    })
    const { Reader } = createRecordingBinaryReader({
      affineTransformConstructor: AffineTransform,
    })
    const reader = new Reader(createFloat64DataView([1, 2, 3, 4, 5, 6]))

    const decodedTransform = reader.readObjectByTypeTag(17)

    expect(decodedTransform).toBeInstanceOf(AffineTransform)
    expect(reader.offset).toBe(48)
    expect(reader.objectCache).toHaveLength(1)
    expect(decodedTransform).toMatchObject({
      scaleX: 1,
      skewY: 0,
      skewX: 0,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
      stateFlags: AffineTransform.STATE_IDENTITY,
      copyMode: AffineTransform.COPY_MODE_IDENTITY,
    })
  })

  it('keeps basic Cubism2 value types in a separate module with semantic setter APIs', () => {
    const valueTypes = createCubism2BasicValueTypes({
      isBootstrapping: () => false,
    })
    const point = new valueTypes.Cubism2PointValue()
    const size = new valueTypes.Cubism2Tag22XYValue()

    point.copyFromPoint({ x: 12, y: 24 })
    size.setXYSlots(12, 24)

    expect(point).toMatchObject({ x: 12, y: 24 })
    expect(size).toMatchObject({ x: 12, y: 24 })
    point.copyFromPoint({ x: 36, y: 48 })
    size.setXYSlots(36, 48)
    expect(point).toMatchObject({ x: 36, y: 48 })
    expect(size).toMatchObject({ x: 36, y: 48 })
    expect(new valueTypes.Cubism2LegacyIntegerValue()).toMatchObject({ color: null })
  })

  it('keeps Cubism2 rectangles in a separate module with semantic copy APIs', () => {
    const { Cubism2Rectangle, Cubism2FloatRectangle } = createCubism2Geometry({
      isBootstrapping: () => false,
    })
    const rectangle = new Cubism2Rectangle()
    const floatRectangle = new Cubism2FloatRectangle()

    rectangle.copyFromRectangle({ x: 10, y: 20, width: 30, height: 40 })
    floatRectangle.copyFromRectangle({ x: 1.5, y: 2.5, width: 3.5, height: 4.5 })

    expect(rectangle).toMatchObject({ x: 10, y: 20, width: 30, height: 40 })
    expect(floatRectangle).toMatchObject({ x: 1.5, y: 2.5, width: 3.5, height: 4.5 })
    expect(rectangle.getCenterX()).toBe(25)
    expect(rectangle.getCenterY()).toBe(40)
    expect(rectangle.getRight()).toBe(40)
    expect(rectangle.getBottom()).toBe(60)
    expect(floatRectangle.getCenterX()).toBe(3.25)
    expect(floatRectangle.getCenterY()).toBe(4.75)
    expect(floatRectangle.getRight()).toBe(5)
    expect(floatRectangle.getBottom()).toBe(7)
    rectangle.copyFromRectangle({ x: 50, y: 60, width: 70, height: 80 })
    floatRectangle.copyFromRectangle({ x: 5, y: 6, width: 7, height: 8 })
    expect(rectangle).toMatchObject({ x: 50, y: 60, width: 70, height: 80 })
    expect(floatRectangle).toMatchObject({ x: 5, y: 6, width: 7, height: 8 })
    expect(floatRectangle.contains!(999, 999)).toBe(true)
    floatRectangle.expand!(1, 2)
    expect(floatRectangle).toMatchObject({ x: 4, y: 4, width: 9, height: 12 })
  })

  it('keeps Cubism2 math helpers in a separate module with semantic APIs', () => {
    const Cubism2Math = createCubism2Math({
      /**
       * Supplies a deterministic unit random value so the restored helper can be asserted.
       * @returns Fixed random unit used by the old auto-eye-blink scheduling call site.
       */
      random(): number {
        return 0.375
      },
    })

    expect(Cubism2Math.DEGREES_TO_RADIANS).toBeCloseTo(Math.PI / 180)
    expect(Cubism2Math.RADIANS_TO_DEGREES).toBeCloseTo(180 / Math.PI)
    expect(Cubism2Math.normalizeRadianDelta(Math.PI * 1.5, 0)).toBeCloseTo(-Math.PI / 2)
    expect(Cubism2Math.angleBetweenVectors([1, 0], [0, 1])).toBeCloseTo(-Math.PI / 2)
    expect(Cubism2Math.sin(Math.PI / 2)).toBeCloseTo(1)
    expect(Cubism2Math.cos(Math.PI)).toBeCloseTo(-1)
    expect(Cubism2Math.randomUnit()).toBe(0.375)
  })

  it('routes compatibility random and verbose wiring through semantic helpers', () => {
    const compatibilitySource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/compatibility/minjsDerivedCubism2Sdk2.ts',
      ),
      'utf-8',
    )
    const mathSource = readFileSync(
      resolve(process.cwd(), 'src/components/blog/live2d/vendor/cubism2Core/compatibility/math.ts'),
      'utf-8',
    )
    const live2dRuntimeSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/compatibility/live2dRuntime.ts',
      ),
      'utf-8',
    )

    expect(mathSource).toContain('randomUnit')
    expect(mathSource).toContain('Cubism2Math.randomUnit = function randomUnit')
    expect(live2dRuntimeSource).toContain('isVerboseLoggingEnabled')
    expect(compatibilitySource).toContain('random: Cubism2Math.randomUnit')
    expect(compatibilitySource).toContain('return Live2D.isVerboseLoggingEnabled()')

    const Live2D = createCubism2Live2DRuntime({
      /**
       * Supplies desktop runtime flags; profile choice is unrelated to verbose logging.
       * @returns Fake browser runtime flags for runtime initialization tests.
       */
      getBrowserRuntimeInfo() {
        return {
          isAndroid: () => false,
          isIOS: () => false,
        }
      },
    })
    expect(Live2D.isVerboseLoggingEnabled()).toBe(true)
    Live2D.verboseLoggingEnabled = false
    expect(Live2D.isVerboseLoggingEnabled()).toBe(false)
  })

  it('routes extracted verbose logging consumers through Live2D semantic state', () => {
    const live2dRuntimeSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/compatibility/live2dRuntime.ts',
      ),
      'utf-8',
    )
    const gridBaseDataSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/compatibility/gridBaseData.ts',
      ),
      'utf-8',
    )
    const drawDataSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/compatibility/drawData.ts',
      ),
      'utf-8',
    )
    const transformBaseDataSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/compatibility/transformBaseData.ts',
      ),
      'utf-8',
    )

    expect(live2dRuntimeSource).toContain('verboseLoggingEnabled: boolean')
    expect(live2dRuntimeSource).toContain('Runtime.verboseLoggingEnabled = true')

    for (const extractedConsumerSource of [
      gridBaseDataSource,
      drawDataSource,
      transformBaseDataSource,
    ]) {
      expect(extractedConsumerSource).toContain('Live2D.isVerboseLoggingEnabled()')
    }

    const Live2D = createCubism2Live2DRuntime({
      /**
       * Supplies desktop runtime flags; verbose logging state is owned by Live2D static fields.
       * @returns Fake browser runtime flags for runtime initialization tests.
       */
      getBrowserRuntimeInfo() {
        return {
          isAndroid: () => false,
          isIOS: () => false,
        }
      },
    })
    expect(Live2D.verboseLoggingEnabled).toBe(true)
    expect(Live2D.isVerboseLoggingEnabled()).toBe(true)
    Live2D.verboseLoggingEnabled = false
    expect(Live2D.verboseLoggingEnabled).toBe(false)
    expect(Live2D.isVerboseLoggingEnabled()).toBe(false)
    Live2D.verboseLoggingEnabled = true
    expect(Live2D.isVerboseLoggingEnabled()).toBe(true)
  })

  it('restores Cubism2MocVersion semantic static names and object-factory behavior', () => {
    const createdObjects: number[] = []
    const { Cubism2MocVersion } = createCubism2CoreTypes({
      /**
       * Records the type tag delegated by the restored MocVersion object factory.
       * @param typeTag MOC object type tag that passed min.js unsupported-tag filtering.
       * @returns Fake MOC object so the caller can prove the semantic factory path was used.
       */
      createObjectByTypeTag(typeTag) {
        createdObjects.push(typeTag)
        return { typeTag }
      },
      /**
       * Keeps constructor initialization active for this alias characterization.
       * @returns False because the test wants normal static initialization.
       */
      isBootstrapping() {
        return false
      },
    })

    expect(Cubism2MocVersion.LIVE2D_FORMAT_VERSION_V2_06_SDK2).toBe(6)
    expect(Cubism2MocVersion.LIVE2D_FORMAT_VERSION_V2_07_SDK2).toBe(7)
    expect(Cubism2MocVersion.LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER).toBe(8)
    expect(Cubism2MocVersion.LIVE2D_FORMAT_VERSION_V2_09_SDK2).toBe(9)
    expect(Cubism2MocVersion.LIVE2D_FORMAT_VERSION_V2_10_SDK2).toBe(10)
    expect(Cubism2MocVersion.LIVE2D_FORMAT_VERSION_V2_11_SDK2_1).toBe(11)
    expect(Cubism2MocVersion.MAX_SUPPORTED_FORMAT_VERSION).toBe(11)
    expect(Cubism2MocVersion.LEGACY_MOC_MAGIC_SENTINEL_INT32).toBe(-2004318072)
    expect(Cubism2MocVersion.INITIAL_FORMAT_VERSION).toBe(0)
    expect(Cubism2MocVersion.LEGACY_OBJECT_TYPE_TAG_BASE).toBe(23)
    expect(Cubism2MocVersion.OBJECT_REFERENCE_TYPE_TAG).toBe(33)

    const delegatedObject = Cubism2MocVersion.createObjectByTypeTag(136)
    expect(delegatedObject).toEqual({ typeTag: 136 })
    expect(createdObjects).toEqual([136])

    const unsupportedTypeLogger = vi.fn()
    Cubism2MocVersion.logUnsupportedTypeTag = unsupportedTypeLogger
    expect(Cubism2MocVersion.createObjectByTypeTag(39)).toBeNull()
    ;[60, 64, 71, 100, 132, 149].forEach((unsupportedTypeTag) => {
      expect(Cubism2MocVersion.createObjectByTypeTag(unsupportedTypeTag)).toBeNull()
    })
    expect(unsupportedTypeLogger).toHaveBeenCalledTimes(7)
    expect(unsupportedTypeLogger.mock.calls.map(([typeTag]) => typeTag)).toEqual([
      39,
      60,
      64,
      71,
      100,
      132,
      149,
    ])
    expect(createdObjects).toEqual([136])
  })

  it('keeps Cubism2 base data in a separate module with shared header and opacity semantics', () => {
    const defaultBaseDataId = { id: 'DST_BASE' }
    const opacityInterpolator = vi.fn(
      (
        modelContext: unknown,
        paramBindingSet: unknown,
        dirtyFlagRef: boolean[],
        opacityValues: number[],
      ) => {
        expect(modelContext).toEqual({ kind: 'model-context' })
        expect(paramBindingSet).toEqual({ kind: 'binding-set' })
        expect(opacityValues).toEqual([0.2, 0.8])
        dirtyFlagRef[0] = false
        return 0.42
      },
    )
    const BaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency(defaultBaseDataId),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      interpolator: {
        interpolateFloat: opacityInterpolator,
      },
      isBootstrapping: () => false,
    })
    const BootstrappingBaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency(defaultBaseDataId),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      interpolator: {
        interpolateFloat: opacityInterpolator,
      },
      isBootstrapping: () => true,
    })
    const baseData = new BaseData()
    const bootstrapBaseData = new BootstrappingBaseData()
    const baseDataId = { id: 'BaseHead' }
    const targetBaseDataId = { id: 'BaseBody' }
    const objectValues = [baseDataId, targetBaseDataId]
    const reader = {
      /**
       * Selects the SDK2 v2.10+ branch for optional opacity values.
       * @returns Cubism2 fake format version.
       */
      getFormatVersion() {
        return 33
      },
      /**
       * Reads optional opacity interpolation values.
       * @returns Opacity value table consumed by interpolateOpacity.
       */
      readFloat32Array() {
        return [0.2, 0.8]
      },
      /**
       * Reads base-data ID followed by target base-data ID from the fake header.
       * @returns Next object from the base-data header payload.
       */
      readObject() {
        return objectValues.shift() ?? null
      },
    }
    const olderReader = {
      /**
       * Selects the pre-v2.10 branch that has no opacity values.
       * @returns Cubism2 fake format version.
       */
      getFormatVersion() {
        return 32
      },
      /**
       * Fails the test if older payloads try to read opacity values.
       * @returns No value because this path should not be called.
       */
      readFloat32Array() {
        throw new Error('old Cubism2 payload must not read opacity values')
      },
      /**
       * Satisfies the reader shape; this old-reader path does not read IDs.
       * @returns Null for accidental object reads.
       */
      readObject() {
        return null
      },
    }

    expect(BaseData.UNRESOLVED_BASE_DATA_INDEX).toBe(-2)
    expect(BaseData.TYPE_TRANSFORM).toBe(1)
    expect(BaseData.TYPE_GRID).toBe(2)
    expect(baseData).toMatchObject({
      baseDataId: null,
      opacityValues: null,
      targetBaseDataId: null,
    })

    baseData.readBaseData(reader)

    expect(baseData.getBaseDataID()).toBe(baseDataId)
    expect(baseData.getTargetBaseDataID()).toBe(targetBaseDataId)
    expect(baseData.hasTargetBaseData()).toBe(true)

    baseData.setBaseDataID({ id: 'BaseOverride' })
    baseData.setTargetBaseDataID(defaultBaseDataId)
    baseData.readV2Opacity(olderReader)

    expect(baseData.getBaseDataID()).toEqual({ id: 'BaseOverride' })
    expect(baseData.hasTargetBaseData()).toBe(false)
    expect(baseData.opacityValues).toBeNull()

    baseData.readV2Opacity(reader)

    expect(baseData.opacityValues).toEqual([0.2, 0.8])

    const defaultOpacityWrites: number[] = []
    const interpolatedOpacityWrites: number[] = []
    const defaultOpacityData = new BaseData()

    defaultOpacityData.interpolateOpacity(
      { kind: 'model-context' },
      { kind: 'binding-set' },
      {
        /**
         * Records the fallback opacity for payloads without opacity timelines.
         * @param opacity Opacity written by the shared base-data hook.
         */
        setInterpolatedOpacity(opacity: number) {
          defaultOpacityWrites.push(opacity)
        },
      },
      [true],
    )
    baseData.interpolateOpacity(
      { kind: 'model-context' },
      { kind: 'binding-set' },
      {
        /**
         * Records interpolated opacity for v2.10+ payloads.
         * @param opacity Opacity returned by the Cubism2 interpolation helper.
         */
        setInterpolatedOpacity(opacity: number) {
          interpolatedOpacityWrites.push(opacity)
        },
      },
      [true],
    )

    expect(defaultOpacityWrites).toEqual([1])
    expect(interpolatedOpacityWrites).toEqual([0.42])
    expect(opacityInterpolator).toHaveBeenCalledTimes(1)
    expect(baseData.createRuntimeContext({ kind: 'model-context' })).toBeUndefined()
    expect(
      baseData.updateRuntimeContext({ kind: 'model-context' }, { kind: 'runtime-context' }),
    ).toBeUndefined()
    expect(
      baseData.applyRuntimeContext({ kind: 'model-context' }, { kind: 'runtime-context' }),
    ).toBeUndefined()
    expect(baseData.transformPoints({}, {}, [], null, 0, 0, 0)).toBeUndefined()
    expect(baseData.getType()).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(bootstrapBaseData, 'baseDataId')).toBe(false)
  })

  it('restores Cubism2 base-data reader payload names while preserving read gates', () => {
    const baseDataSource = readFileSync(
      resolve('src/components/blog/live2d/vendor/cubism2Core/compatibility/baseData.ts'),
      'utf-8',
    )

    expect(baseDataSource).toContain('interface Cubism2BaseDataPayload')
    expect(baseDataSource).toContain('interface Cubism2BaseDataOpacityPayload')
    expect(baseDataSource).toContain('readCubism2BaseDataPayload')
    expect(baseDataSource).toContain('applyCubism2BaseDataPayload')
    expect(baseDataSource).toContain('readCubism2BaseDataOpacityPayload')
    expect(baseDataSource).toContain('applyCubism2BaseDataOpacityPayload')

    const defaultBaseDataId = { id: 'DST_BASE' }
    const BaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency(defaultBaseDataId),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      interpolator: {
        /**
         * Reports the opacity timeline selected by the optional v2 reader.
         * @param modelContext Runtime model context supplied by the opacity caller.
         * @param paramBindingSet Binding set supplied by the opacity caller.
         * @param dirtyFlagRef Mutable dirty flag passed through to the interpolator.
         * @param opacityValues Opacity timeline read from the base-data payload.
         * @returns Deterministic opacity for the focused reader-payload test.
         */
        interpolateFloat(
          modelContext: unknown,
          paramBindingSet: unknown,
          dirtyFlagRef: boolean[],
          opacityValues: number[],
        ) {
          void modelContext
          void paramBindingSet
          dirtyFlagRef[0] = false
          return opacityValues[0] ?? 1
        },
      },
      isBootstrapping: () => false,
    })
    const baseData = new BaseData()
    const baseDataId = { id: 'BaseHead' }
    const targetBaseDataId = { id: 'BaseBody' }
    const opacityValues = [0.25, 0.75]
    const objectValues = [baseDataId, targetBaseDataId]
    const readOrder: string[] = []
    const reader = {
      /**
       * Selects the v2.10+ opacity branch after the shared ID payload is consumed.
       * @returns Fake format version that enables the opacity timeline.
       */
      getFormatVersion() {
        readOrder.push('version')
        return 33
      },
      /**
       * Reads the optional opacity timeline after the format-version gate.
       * @returns Opacity values stored on the base-data object.
       */
      readFloat32Array() {
        readOrder.push('float32Array')
        return opacityValues
      },
      /**
       * Reads base ID first and target base ID second.
       * @returns Next object from the shared base-data header.
       */
      readObject() {
        readOrder.push('object')
        return objectValues.shift() ?? null
      },
    }
    const olderReadOrder: string[] = []
    const olderReader = {
      /**
       * Selects the pre-v2.10 branch, which must not read opacity values.
       * @returns Fake format version below the opacity payload gate.
       */
      getFormatVersion() {
        olderReadOrder.push('version')
        return 32
      },
      /**
       * Fails if a pre-v2.10 base-data payload reads opacity values.
       * @returns No value because this method must stay unreachable.
       */
      readFloat32Array() {
        olderReadOrder.push('float32Array')
        throw new Error('pre-v2.10 base-data payload must not read opacity values')
      },
      /**
       * Satisfies the reader interface for an opacity-only branch test.
       * @returns Null for accidental ID reads.
       */
      readObject() {
        olderReadOrder.push('object')
        return null
      },
    }

    baseData.readBaseData(reader)

    expect(baseData.getBaseDataID()).toBe(baseDataId)
    expect(baseData.getTargetBaseDataID()).toBe(targetBaseDataId)
    expect(readOrder).toEqual(['object', 'object'])
    expect(baseData.opacityValues).toBeNull()

    baseData.readV2Opacity(olderReader)

    expect(olderReadOrder).toEqual(['version'])
    expect(baseData.opacityValues).toBeNull()

    baseData.readV2Opacity(reader)

    expect(readOrder).toEqual(['object', 'object', 'version', 'float32Array'])
    expect(baseData.opacityValues).toBe(opacityValues)
  })

  it('restores Cubism2 transform-base-data reader payload names while preserving read order', () => {
    const transformBaseDataSource = readFileSync(
      resolve('src/components/blog/live2d/vendor/cubism2Core/compatibility/transformBaseData.ts'),
      'utf-8',
    )

    expect(transformBaseDataSource).toContain('interface Cubism2TransformBaseDataPayload')
    expect(transformBaseDataSource).toContain('readCubism2TransformBaseDataPayload')
    expect(transformBaseDataSource).toContain('applyCubism2TransformBaseDataPayload')

    const defaultBaseDataId = { id: 'DEFAULT_BASE' }
    const baseDataId = { id: 'TransformBase' }
    const targetBaseDataId = { id: 'TargetBase' }
    const readParamBindingSet = { id: 'ParamBindingSet' }
    const transformValues = [{ id: 'TransformValue' }]
    const opacityValues = [0.5, 0.75]
    const readOrder: string[] = []
    const Cubism2BaseContext = createCubism2BaseContext({
      isBootstrapping: () => false,
    })
    const Cubism2TransformValue = createCubism2TransformValue({
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      isBootstrapping: () => false,
    })
    const Cubism2BaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency(defaultBaseDataId),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      interpolator: {
        /**
         * Reports the optional opacity timeline selected by the transform reader.
         * @param modelContext Runtime model context supplied by the opacity caller.
         * @param paramBindingSet Binding set supplied by the opacity caller.
         * @param dirtyFlagRef Mutable dirty flag passed through to the interpolator.
         * @param runtimeOpacityValues Opacity timeline read from the transform payload.
         * @returns Deterministic opacity for this reader-order test.
         */
        interpolateFloat(
          modelContext: unknown,
          paramBindingSet: unknown,
          dirtyFlagRef: boolean[],
          runtimeOpacityValues: number[],
        ) {
          void modelContext
          void paramBindingSet
          dirtyFlagRef[0] = true
          return runtimeOpacityValues[0] ?? 1
        },
      },
      isBootstrapping: () => false,
    })
    const Cubism2RuntimeConstants = createCubism2RuntimeConstants()
    const cubism2ParamBindings = createCubism2ParamBindings({
      Cubism2RuntimeConstants,
      Live2D: {
        shouldThrowOnInvalidInterpolationCorner: false,
      },
      isBootstrapping: () => false,
    })
    const constructors = createCubism2TransformBaseData({
      Cubism2BaseContext,
      Cubism2BaseData,
      Cubism2Math: createCubism2Math(),
      Cubism2ParamBindingSet: cubism2ParamBindings.Cubism2ParamBindingSet,
      Cubism2TransformValue,
      Live2D: {
        isVerboseLoggingEnabled: () => false,
      },
      UtDebug: {
        /**
         * Ignores target-base diagnostics in this reader-only test.
         * @param message Legacy diagnostic text.
         */
        logWithLegacyPrefix(message: string): void {
          void message
        },
      },
      isBootstrapping: () => false,
    })
    const readerObjects = [baseDataId, targetBaseDataId, readParamBindingSet, transformValues]
    const reader = {
      /**
       * Selects the SDK2 v2.10+ branch after transform payload objects are consumed.
       * @returns Fake format version that enables optional opacity values.
       */
      getFormatVersion() {
        readOrder.push('version')
        return 33
      },
      /**
       * Reads the optional opacity timeline after the format-version gate.
       * @returns Opacity values stored on the transform base-data object.
       */
      readFloat32Array() {
        readOrder.push('float32Array')
        return opacityValues
      },
      /**
       * Reads shared IDs first, then type-68 param bindings and transform samples.
       * @returns Next object from the transform base-data payload.
       */
      readObject() {
        readOrder.push('object')
        return readerObjects.shift() ?? null
      },
    }
    const transformBaseData = new constructors.Cubism2TransformBaseData()

    transformBaseData.readTransformBaseData(reader)

    expect(readOrder).toEqual([
      'object',
      'object',
      'object',
      'object',
      'version',
      'float32Array',
    ])
    expect(transformBaseData.getBaseDataID()).toBe(baseDataId)
    expect(transformBaseData.getTargetBaseDataID()).toBe(targetBaseDataId)
    expect(transformBaseData.paramBindingSet).toBe(readParamBindingSet)
    expect(transformBaseData.transformValues).toBe(transformValues)
    expect(transformBaseData.opacityValues).toBe(opacityValues)
  })

  it('restores Cubism2 grid-base-data reader payload names while preserving read order', () => {
    const gridBaseDataSource = readFileSync(
      resolve('src/components/blog/live2d/vendor/cubism2Core/compatibility/gridBaseData.ts'),
      'utf-8',
    )

    expect(gridBaseDataSource).toContain('interface Cubism2GridBaseDataPayload')
    expect(gridBaseDataSource).toContain('readCubism2GridBaseDataPayload')
    expect(gridBaseDataSource).toContain('applyCubism2GridBaseDataPayload')

    const defaultBaseDataId = { id: 'DEFAULT_BASE' }
    const baseDataId = { id: 'GridBase' }
    const targetBaseDataId = { id: 'GridTarget' }
    const readParamBindingSet = { id: 'GridParamBindingSet' }
    const gridPointValues = [new Float32Array([0, 0, 1, 0])]
    const opacityValues = [0.25, 0.75]
    const readOrder: string[] = []
    const Cubism2BaseContext = createCubism2BaseContext({
      isBootstrapping: () => false,
    })
    const Cubism2BaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency(defaultBaseDataId),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      interpolator: {
        /**
         * Reports the optional opacity timeline selected by the grid reader.
         * @param modelContext Runtime model context supplied by the opacity caller.
         * @param paramBindingSet Binding set supplied by the opacity caller.
         * @param dirtyFlagRef Mutable dirty flag passed through to the interpolator.
         * @param runtimeOpacityValues Opacity timeline read from the grid payload.
         * @returns Deterministic opacity for this reader-order test.
         */
        interpolateFloat(
          modelContext: unknown,
          paramBindingSet: unknown,
          dirtyFlagRef: boolean[],
          runtimeOpacityValues: number[],
        ) {
          void modelContext
          void paramBindingSet
          dirtyFlagRef[0] = true
          return runtimeOpacityValues[0] ?? 1
        },
      },
      isBootstrapping: () => false,
    })
    const Cubism2RuntimeConstants = createCubism2RuntimeConstants()
    const cubism2ParamBindings = createCubism2ParamBindings({
      Cubism2RuntimeConstants,
      Live2D: {
        shouldThrowOnInvalidInterpolationCorner: false,
      },
      isBootstrapping: () => false,
    })
    const Cubism2Interpolation = createCubism2Interpolation({
      UtSystem: {
        /**
         * Copies point tuple data for the unused interpolation dependency in this reader test.
         * @param source Source point tuple buffer.
         * @param sourceOffset First scalar copied from the source buffer.
         * @param target Destination point tuple buffer.
         * @param targetOffset First scalar written into the destination buffer.
         * @param length Number of scalar values copied.
         */
        copyArraySegmentForward(
          source: ArrayLike<number>,
          sourceOffset: number,
          target: MutableNumberArray,
          targetOffset: number,
          length: number,
        ): void {
          for (let valueIndex = 0; valueIndex < length; valueIndex += 1) {
            target[targetOffset + valueIndex] = source[sourceOffset + valueIndex] ?? 0
          }
        },
      },
    }).Cubism2Interpolation
    const constructors = createCubism2GridBaseData({
      Cubism2BaseContext,
      Cubism2BaseData,
      Cubism2Interpolation,
      Cubism2ParamBindingSet: cubism2ParamBindings.Cubism2ParamBindingSet,
      Live2D: {
        isVerboseLoggingEnabled: () => false,
        shouldClampSdk1GridPointsToUnitRange: true,
      },
      System: {
        err: {
          /**
           * Ignores impossible-branch diagnostics in this reader-only test.
           * @param message Legacy printf-style diagnostic.
           * @param args Optional diagnostic interpolation values.
           */
          printf(message: string, ...args: unknown[]): void {
            void message
            void args
          },
        },
      },
      UtDebug: {
        /**
         * Ignores target-base diagnostics in this reader-only test.
         * @param message Legacy diagnostic text.
         * @param targetId Optional target ID attached to the diagnostic.
         */
        logWithLegacyPrefix(message: string, targetId?: unknown): void {
          void message
          void targetId
        },
      },
      isBootstrapping: () => false,
    })
    const readerObjects = [baseDataId, targetBaseDataId, readParamBindingSet, gridPointValues]
    const readerIntegers = [3, 5]
    const reader = {
      /**
       * Selects the SDK2 v2.10+ branch after grid payload objects are consumed.
       * @returns Fake format version that enables optional opacity values.
       */
      getFormatVersion() {
        readOrder.push('version')
        return 33
      },
      /**
       * Reads the optional opacity timeline after the format-version gate.
       * @returns Opacity values stored on the grid base-data object.
       */
      readFloat32Array() {
        readOrder.push('float32Array')
        return opacityValues
      },
      /**
       * Reads type-65 row count first and column count second, matching min.js fields.
       * @returns Next grid dimension value from the payload.
       */
      readInt32() {
        readOrder.push('int32')
        return readerIntegers.shift() ?? 0
      },
      /**
       * Reads shared IDs first, then type-65 param bindings and grid point tables.
       * @returns Next object from the grid base-data payload.
       */
      readObject() {
        readOrder.push('object')
        return readerObjects.shift() ?? null
      },
    }
    const gridBaseData = new constructors.Cubism2GridBaseData()

    gridBaseData.readGridBaseData(reader)

    expect(readOrder).toEqual([
      'object',
      'object',
      'int32',
      'int32',
      'object',
      'object',
      'version',
      'float32Array',
    ])
    expect(gridBaseData.getBaseDataID()).toBe(baseDataId)
    expect(gridBaseData.getTargetBaseDataID()).toBe(targetBaseDataId)
    expect(gridBaseData.gridRowCount).toBe(3)
    expect(gridBaseData.gridColumnCount).toBe(5)
    expect(gridBaseData.paramBindingSet).toBe(readParamBindingSet)
    expect(gridBaseData.gridPointValues).toBe(gridPointValues)
    expect(gridBaseData.opacityValues).toBe(opacityValues)
  })

  it('keeps Cubism2 runtime constants in a separate module with semantic static values', () => {
    const RuntimeConstants = createCubism2RuntimeConstants()

    expect(RuntimeConstants.MODEL_SPACE_COORDINATE_MODE).toBe(1)
    expect(RuntimeConstants.SDK2_COORDINATE_MODE).toBe(2)
    expect(RuntimeConstants.POINT_X_OFFSET).toBe(0)
    expect(RuntimeConstants.POINT_TUPLE_SIZE).toBe(2)
    expect(RuntimeConstants.activeCoordinateMode).toBe(RuntimeConstants.MODEL_SPACE_COORDINATE_MODE)
    expect(RuntimeConstants.FLIP_MODEL_SPACE_UV_Y).toBe(true)
    expect(RuntimeConstants.maxTransformParameterDimensionCount).toBe(5)
    expect(RuntimeConstants.maxInterpolationCornerCount).toBe(65)
    expect(RuntimeConstants.PARAM_VALUE_EPSILON).toBe(0.0001)
    expect(RuntimeConstants.POSITION_EPSILON).toBe(0.001)
    expect(RuntimeConstants.DEFAULT_PARTS_OPACITY).toBe(3)
    expect(Object.keys(new RuntimeConstants())).toEqual([])
  })

  it('keeps Cubism2 transform values in a separate module with type-69 reader semantics', () => {
    const TransformValue = createCubism2TransformValue({
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      isBootstrapping: () => false,
    })
    const BootstrappingTransformValue = createCubism2TransformValue({
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      isBootstrapping: () => true,
    })
    const transformValue = new TransformValue()
    const bootstrapTransformValue = new BootstrappingTransformValue()
    const oldFormatFloats = [2, 4, 1.25, 0.75, 15]
    const newFormatFloats = [6, 8, 1.5, 0.5, 45]
    const newFormatBooleans = [false, true]
    const oldFormatReader = {
      /**
       * Selects the pre-v2.10 branch where transform reflection flags are absent.
       * @returns Cubism2 fake format version.
       */
      getFormatVersion() {
        return 32
      },
      /**
       * Fails the test if older payloads try to read reflection flags.
       * @returns No value because this path should not be called.
       */
      readBoolean() {
        throw new Error('old Cubism2 transform payload must not read reflect flags')
      },
      /**
       * Reads the next transform scalar from the old-format payload.
       * @returns Next translation, scale, or rotation value.
       */
      readFloat32() {
        return oldFormatFloats.shift() ?? 0
      },
    }
    const newFormatReader = {
      /**
       * Selects the SDK2 v2.10+ branch where transform reflection flags are present.
       * @returns Cubism2 fake format version.
       */
      getFormatVersion() {
        return 33
      },
      /**
       * Reads the next v2.10 reflection flag.
       * @returns Authored reflection flag for the X or Y axis.
       */
      readBoolean() {
        return newFormatBooleans.shift() ?? false
      },
      /**
       * Reads the next transform scalar from the v2.10 payload.
       * @returns Next translation, scale, or rotation value.
       */
      readFloat32() {
        return newFormatFloats.shift() ?? 0
      },
    }

    expect(transformValue).toMatchObject({
      reflectX: false,
      reflectY: false,
      rotationDegrees: 0,
      scaleX: 1,
      scaleY: 1,
      translationX: 0,
      translationY: 0,
    })
    transformValue.readTransformValue(oldFormatReader)

    expect(transformValue).toMatchObject({
      reflectX: false,
      reflectY: false,
      rotationDegrees: 15,
      scaleX: 1.25,
      scaleY: 0.75,
      translationX: 2,
      translationY: 4,
    })

    transformValue.readTransformValue(newFormatReader)

    expect(transformValue).toMatchObject({
      reflectX: false,
      reflectY: true,
      rotationDegrees: 45,
      scaleX: 1.5,
      scaleY: 0.5,
      translationX: 6,
      translationY: 8,
    })
    expect(newFormatBooleans).toHaveLength(0)

    transformValue.copyFrom({
      reflectX: false,
      reflectY: true,
      rotationDegrees: 90,
      scaleX: 2,
      scaleY: 3,
      translationX: 10,
      translationY: 20,
    })

    expect(transformValue).toMatchObject({
      reflectX: false,
      reflectY: true,
      rotationDegrees: 90,
      scaleX: 2,
      scaleY: 3,
      translationX: 10,
      translationY: 20,
    })
    expect(transformValue.emptyLifecycleHook()).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(bootstrapTransformValue, 'translationX')).toBe(
      false,
    )
  })

  it('keeps Cubism2 transform base data in a separate module with interpolation and target propagation semantics', () => {
    const defaultBaseDataId = { id: 'DEFAULT_BASE' }
    const baseDataId = { id: 'BaseHead' }
    const targetBaseDataId = { id: 'BaseBody' }
    const Cubism2Math = createCubism2Math()
    const Cubism2BaseContext = createCubism2BaseContext({
      isBootstrapping: () => false,
    })
    const Cubism2TransformValue = createCubism2TransformValue({
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      isBootstrapping: () => false,
    })
    const Cubism2RuntimeConstants = createCubism2RuntimeConstants()
    const cubism2ParamBindings = createCubism2ParamBindings({
      Cubism2RuntimeConstants,
      Live2D: {
        shouldThrowOnInvalidInterpolationCorner: false,
      },
      isBootstrapping: () => false,
    })
    const opacityInterpolator = vi.fn(
      (
        runtimeModelContext: unknown,
        runtimeParamBindingSet: unknown,
        dirtyFlagRef: boolean[],
        opacityValues: number[],
      ) => {
        expect(runtimeModelContext).toMatchObject({ kind: 'transform-model-context' })
        expect(opacityValues).toEqual([0.2, 0.8])
        expect(runtimeParamBindingSet).not.toBeNull()
        dirtyFlagRef[0] = true
        return 0.64
      },
    )
    const Cubism2BaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency(defaultBaseDataId),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      interpolator: {
        interpolateFloat: opacityInterpolator,
      },
      isBootstrapping: () => false,
    })
    const constructors = createCubism2TransformBaseData({
      Cubism2BaseContext,
      Cubism2BaseData,
      Cubism2Math,
      Cubism2ParamBindingSet: cubism2ParamBindings.Cubism2ParamBindingSet,
      Cubism2TransformValue,
      Live2D: {
        isVerboseLoggingEnabled: () => false,
      },
      UtDebug: {
        /**
         * Suppresses legacy target-base diagnostics during deterministic unit tests.
         * @param message Legacy format string emitted when target base data cannot be resolved.
         * @param targetId Optional target ID attached to the diagnostic message.
         */
        logWithLegacyPrefix(message: string, targetId?: unknown): void {
          void message
          void targetId
        },
      },
      isBootstrapping: () => false,
    })
    const bootstrappingConstructors = createCubism2TransformBaseData({
      Cubism2BaseContext,
      Cubism2BaseData,
      Cubism2Math,
      Cubism2ParamBindingSet: cubism2ParamBindings.Cubism2ParamBindingSet,
      Cubism2TransformValue,
      Live2D: {
        isVerboseLoggingEnabled: () => false,
      },
      UtDebug: {
        /**
         * Ignores legacy diagnostics while testing prototype bootstrapping.
         * @param message Legacy diagnostic string.
         */
        logWithLegacyPrefix(message: string): void {
          void message
        },
      },
      isBootstrapping: () => true,
    })

    /**
     * Runs transform-base interpolation with deterministic fake param bindings.
     * @param dimensionCount Number of active interpolation axes returned to the transform data.
     * @param cornerIndexes Authored transform sample indexes selected for the interpolation hypercube.
     * @param cornerWeights Per-axis interpolation weights written into model scratch buffers.
     * @param translationValues Authored translationX values for the fake transform samples.
     * @returns Interpolated translationX written into the runtime transform context.
     */
    function interpolateTransformTranslation(
      dimensionCount: number,
      cornerIndexes: number[],
      cornerWeights: number[],
      translationValues: number[],
    ): number {
      const scratchIndexes = new Array<number>(Math.max(cornerIndexes.length, 1)).fill(
        0,
      ) as MutableNumberArray
      const scratchWeights = new Array<number>(Math.max(cornerWeights.length, 1)).fill(
        0,
      ) as MutableNumberArray
      const interpolationOnlyModelContext = {
        /**
         * Supplies the corner index scratch buffer used by transform interpolation.
         * @returns Mutable corner index buffer.
         */
        getScratchIndexBuffer(): MutableNumberArray {
          return scratchIndexes
        },
        /**
         * Supplies the corner weight scratch buffer used by transform interpolation.
         * @returns Mutable corner weight buffer.
         */
        getScratchWeightBuffer(): MutableNumberArray {
          return scratchWeights
        },
        /**
         * Reports no target base-data resolution for interpolation-only checks.
         * @returns Negative index because these cases do not call applyRuntimeContext.
         */
        getBaseDataIndex(): number {
          return -1
        },
        /**
         * Reports no target base data for interpolation-only checks.
         * @returns Null because these cases do not call applyRuntimeContext.
         */
        getBaseData(): null {
          return null
        },
        /**
         * Reports no target base context for interpolation-only checks.
         * @returns Null because these cases do not call applyRuntimeContext.
         */
        getBaseContext(): null {
          return null
        },
      }
      const interpolationOnlyParamBindingSet = {
        /**
         * Forces transform interpolation to run for this deterministic case.
         * @returns Always true for interpolation branch coverage.
         */
        hasChangedParams(): boolean {
          return true
        },
        /**
         * Returns the requested interpolation dimension count and marks the transform dirty.
         * @param runtimeModelContext Model context supplied by transform update.
         * @param dirtyFlagRef Single-item dirty flag mutated by the resolver.
         * @returns Configured active interpolation axis count.
         */
        resolveInterpolationWeights(runtimeModelContext: unknown, dirtyFlagRef: boolean[]): number {
          expect(runtimeModelContext).toBe(interpolationOnlyModelContext)
          dirtyFlagRef[0] = true
          return dimensionCount
        },
        /**
         * Copies deterministic corner indexes and weights into model scratch buffers.
         * @param targetIndexBuffer Mutable scratch index buffer supplied by model context.
         * @param targetWeightBuffer Mutable scratch weight buffer supplied by model context.
         * @param resolvedDimensionCount Dimension count returned by `resolveInterpolationWeights`.
         */
        buildInterpolationCorners(
          targetIndexBuffer: MutableNumberArray,
          targetWeightBuffer: MutableNumberArray,
          resolvedDimensionCount: number,
        ): void {
          expect(resolvedDimensionCount).toBe(dimensionCount)
          cornerIndexes.forEach((cornerIndex, index) => {
            targetIndexBuffer[index] = cornerIndex
          })
          cornerWeights.forEach((cornerWeight, index) => {
            targetWeightBuffer[index] = cornerWeight
          })
        },
      }
      const interpolationData = new constructors.Cubism2TransformBaseData()
      interpolationData.paramBindingSet = interpolationOnlyParamBindingSet as never
      interpolationData.transformValues = translationValues.map((translationX, valueIndex) => ({
        reflectX: valueIndex === 0,
        reflectY: false,
        rotationDegrees: translationX,
        scaleX: translationX,
        scaleY: translationX,
        translationX,
        translationY: translationX,
      }))
      const interpolationContext = interpolationData.createRuntimeContext(
        interpolationOnlyModelContext,
      )

      interpolationData.updateRuntimeContext(interpolationOnlyModelContext, interpolationContext)

      return interpolationContext.interpolatedTransform!.translationX
    }

    const transformBaseData = new constructors.Cubism2TransformBaseData()
    const bootstrappingTransformBaseData = new bootstrappingConstructors.Cubism2TransformBaseData()

    transformBaseData.initTransformStorage()

    expect(transformBaseData.paramBindingSet).toBeInstanceOf(
      cubism2ParamBindings.Cubism2ParamBindingSet,
    )
    expect(transformBaseData.transformValues).toEqual([])
    expect(
      Object.prototype.hasOwnProperty.call(bootstrappingTransformBaseData, 'paramBindingSet'),
    ).toBe(false)
    expect(transformBaseData.getType()).toBe(Cubism2BaseData.TYPE_TRANSFORM)

    const firstTransformValue = {
      reflectX: true,
      reflectY: false,
      rotationDegrees: 10,
      scaleX: 1,
      scaleY: 2,
      translationX: 10,
      translationY: 20,
    }
    const secondTransformValue = {
      reflectX: false,
      reflectY: true,
      rotationDegrees: 50,
      scaleX: 3,
      scaleY: 6,
      translationX: 30,
      translationY: 40,
    }
    const readParamBindingSet = {
      /**
       * Reports that the fake transform parameter set changed for this frame.
       * @param runtimeModelContext Model context supplied by transform update.
       * @returns Always true so the interpolation branch runs.
       */
      hasChangedParams(runtimeModelContext: unknown): boolean {
        expect(runtimeModelContext).toMatchObject({ kind: 'transform-model-context' })
        return true
      },
      /**
       * Resolves one interpolation axis and marks the transform as dirty.
       * @param runtimeModelContext Model context supplied by transform update.
       * @param dirtyFlagRef Single-item dirty flag mutated by the resolver.
       * @returns One active interpolation axis.
       */
      resolveInterpolationWeights(runtimeModelContext: unknown, dirtyFlagRef: boolean[]): number {
        expect(runtimeModelContext).toMatchObject({ kind: 'transform-model-context' })
        dirtyFlagRef[0] = true
        return 1
      },
      /**
       * Selects the two authored transform samples and a 25% interpolation weight.
       * @param cornerIndexes Mutable model scratch index buffer.
       * @param cornerWeights Mutable model scratch weight buffer.
       * @param dimensionCount Number of active interpolation dimensions.
       */
      buildInterpolationCorners(
        cornerIndexes: MutableNumberArray,
        cornerWeights: MutableNumberArray,
        dimensionCount: number,
      ): void {
        expect(dimensionCount).toBe(1)
        cornerIndexes[0] = 0
        cornerIndexes[1] = 1
        cornerWeights[0] = 0.25
      },
    }
    const readerObjects = [
      baseDataId,
      defaultBaseDataId,
      readParamBindingSet,
      [firstTransformValue, secondTransformValue],
    ]
    const reader = {
      /**
       * Selects SDK2 v2.10+ so transform base data reads opacity interpolation values.
       * @returns Fake MOC format version.
       */
      getFormatVersion() {
        return 33
      },
      /**
       * Reads the fake opacity table attached to the transform base-data record.
       * @returns Two authored opacity samples.
       */
      readFloat32Array() {
        return [0.2, 0.8]
      },
      /**
       * Reads base IDs, param bindings, and transform values in legacy payload order.
       * @returns Next fake object from the transform base-data payload.
       */
      readObject() {
        return readerObjects.shift() ?? null
      },
    }
    const scratchIndexes = [0, 1] as MutableNumberArray
    const scratchWeights = [0.25] as MutableNumberArray
    const targetBaseData = {
      /**
       * Reports a transform parent type so target-direction probes use the long vector.
       * @returns Transform base-data type marker.
       */
      getType() {
        return Cubism2BaseData.TYPE_TRANSFORM
      },
      /**
       * Applies a deterministic parent-space offset to every point passed by transform propagation.
       * @param runtimeModelContext Model context supplied by transform propagation.
       * @param runtimeTargetContext Parent base context used by the transform.
       * @param sourcePoints Input point buffer.
       * @param outputPoints Output point buffer receiving translated points.
       * @param pointCount Number of logical points in the buffer.
       * @param pointOffset First point offset in the interleaved buffer.
       * @param pointStride Number of scalar slots between logical points.
       */
      transformPoints(
        runtimeModelContext: unknown,
        runtimeTargetContext: unknown,
        sourcePoints: MutableNumberArray,
        outputPoints: MutableNumberArray,
        pointCount: number,
        pointOffset: number,
        pointStride: number,
      ): void {
        expect(runtimeModelContext).toMatchObject({ kind: 'transform-model-context' })
        expect(runtimeTargetContext).toBe(targetBaseContext)
        for (
          let pointIndex = pointOffset;
          pointIndex < pointCount * pointStride;
          pointIndex += pointStride
        ) {
          outputPoints[pointIndex] = sourcePoints[pointIndex]! + 100
          outputPoints[pointIndex + 1] = sourcePoints[pointIndex + 1]! + 200
        }
      },
    }
    const targetBaseContext = new Cubism2BaseContext(targetBaseData)
    targetBaseContext.setTotalScaleNotForClient(4)
    targetBaseContext.setTotalOpacity(0.5)
    const modelContext = {
      kind: 'transform-model-context',
      /**
       * Supplies the corner index scratch buffer used by transform interpolation.
       * @returns Mutable corner index buffer.
       */
      getScratchIndexBuffer() {
        return scratchIndexes
      },
      /**
       * Supplies the corner weight scratch buffer used by transform interpolation.
       * @returns Mutable corner weight buffer.
       */
      getScratchWeightBuffer() {
        return scratchWeights
      },
      /**
       * Resolves the fake target base-data ID to its context index.
       * @param runtimeTargetBaseDataId Target base-data ID requested by transform propagation.
       * @returns Target index when the ID matches the fake parent.
       */
      getBaseDataIndex(runtimeTargetBaseDataId: unknown) {
        return runtimeTargetBaseDataId === targetBaseDataId ? 2 : -1
      },
      /**
       * Reads the fake parent base data by runtime index.
       * @param baseDataIndex Runtime base-data index resolved by `getBaseDataIndex`.
       * @returns Fake target base data for index 2.
       */
      getBaseData(baseDataIndex: number) {
        return baseDataIndex === 2 ? targetBaseData : null
      },
      /**
       * Reads the fake parent base context by runtime index.
       * @param baseDataIndex Runtime base-data index resolved by `getBaseDataIndex`.
       * @returns Fake target base context for index 2.
       */
      getBaseContext(baseDataIndex: number) {
        return baseDataIndex === 2 ? targetBaseContext : null
      },
    }

    transformBaseData.readTransformBaseData(reader)
    const transformContext = transformBaseData.createRuntimeContext(modelContext)

    transformBaseData.updateRuntimeContext(modelContext, transformContext)
    transformBaseData.applyRuntimeContext(modelContext, transformContext)

    expect(transformBaseData.paramBindingSet).toBe(readParamBindingSet)
    expect(transformBaseData.transformValues).toEqual([firstTransformValue, secondTransformValue])
    expect(transformContext).toBeInstanceOf(constructors.Cubism2TransformContext)
    expect(transformContext.targetBaseDataIndex).toBe(Cubism2BaseData.UNRESOLVED_BASE_DATA_INDEX)
    expect(transformContext.hasTransform()).toBe(true)
    expect(transformContext.getInterpolatedOpacity()).toBe(0.64)
    expect(transformContext.getTotalScale()).toBeCloseTo(1.5)
    expect(transformContext.getTotalOpacity()).toBeCloseTo(0.64)
    expect(transformContext.interpolatedTransform).toMatchObject({
      reflectX: true,
      reflectY: false,
      rotationDegrees: 20,
      scaleX: 1.5,
      scaleY: 3,
      translationX: 15,
      translationY: 25,
    })
    expect(opacityInterpolator).toHaveBeenCalledTimes(1)
    expect(
      interpolateTransformTranslation(
        3,
        [0, 1, 2, 3, 4, 5, 6, 7],
        [0.37, 0.61, 0.83],
        [1e20, -1e19, 1e18, -1e17, 1e16, -1e15, 1e14, -1e13],
      ),
    ).toBeCloseTo(3995033664590001000)
    expect(
      interpolateTransformTranslation(
        4,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [0.37, 0.61, 0.83, 0.29],
        [
          1e20, -1e19, 1e18, -1e17, 1e16, -1e15, 1e14, -1e13, 1e20, -1e19, 1e18, -1e17, 1e16, -1e15,
          1e14, -1e13,
        ],
      ),
    ).toBeCloseTo(3995033664590000600)
    expect(
      interpolateTransformTranslation(
        5,
        Array.from({ length: 32 }, (_value, cornerIndex) => cornerIndex),
        [0.11, 0.23, 0.37, 0.41, 0.59],
        Array.from(
          { length: 32 },
          (_value, cornerIndex) => (cornerIndex % 3 === 0 ? -1 : 1) * (cornerIndex + 1) * 1.25,
        ),
      ),
    ).toBeCloseTo(5.015342622064054)

    transformContext.interpolatedTransform!.copyFrom({
      reflectX: false,
      reflectY: false,
      rotationDegrees: 90,
      scaleX: 2,
      scaleY: 1,
      translationX: 10,
      translationY: 20,
    })
    transformContext.setTotalScaleNotForClient(2)

    const sourcePoints = [1, 0, 0, 1] as MutableNumberArray
    const outputPoints = [0, 0, 0, 0] as MutableNumberArray

    transformBaseData.transformPoints(
      modelContext,
      transformContext,
      sourcePoints,
      outputPoints,
      2,
      0,
      2,
    )

    expect(outputPoints[0]).toBeCloseTo(10)
    expect(outputPoints[1]).toBeCloseTo(22)
    expect(outputPoints[2]).toBeCloseTo(8)
    expect(outputPoints[3]).toBeCloseTo(20)

    const targetTransformData = new constructors.Cubism2TransformBaseData()
    const targetReaderObjects = [
      baseDataId,
      targetBaseDataId,
      readParamBindingSet,
      [firstTransformValue, secondTransformValue],
    ]
    const targetReader = {
      /**
       * Selects SDK2 v2.10+ for target transform opacity reads.
       * @returns Fake MOC format version.
       */
      getFormatVersion() {
        return 33
      },
      /**
       * Reads the fake opacity table attached to the target transform record.
       * @returns Two authored opacity samples.
       */
      readFloat32Array() {
        return [0.2, 0.8]
      },
      /**
       * Reads target-transform payload objects in legacy order.
       * @returns Next fake object for this target transform record.
       */
      readObject() {
        return targetReaderObjects.shift() ?? null
      },
    }

    targetTransformData.readTransformBaseData(targetReader)
    const targetTransformContext = targetTransformData.createRuntimeContext(modelContext)

    targetTransformData.updateRuntimeContext(modelContext, targetTransformContext)
    targetTransformData.applyRuntimeContext(modelContext, targetTransformContext)

    expect(targetTransformContext.targetBaseDataIndex).toBe(2)
    expect(targetTransformContext.targetSpaceTransform).toMatchObject({
      reflectX: true,
      reflectY: false,
      rotationDegrees: 20,
      scaleX: 1.5,
      scaleY: 3,
      translationX: 115,
      translationY: 225,
    })
    expect(targetTransformContext.getTotalScale()).toBeCloseTo(6)
    expect(targetTransformContext.getTotalOpacity()).toBeCloseTo(0.32)
    expect(targetTransformContext.isActive).toBe(true)
    expect(targetTransformContext.hasTransform()).toBe(true)
  })

  it('keeps Cubism2 grid base data in a separate module with interpolation and target propagation semantics', () => {
    const defaultBaseDataId = { id: 'DEFAULT_BASE' }
    const baseDataId = { id: 'BaseGrid' }
    const targetBaseDataId = { id: 'TargetGrid' }
    const Cubism2BaseContext = createCubism2BaseContext({
      isBootstrapping: () => false,
    })
    const Cubism2RuntimeConstants = createCubism2RuntimeConstants()
    const cubism2ParamBindings = createCubism2ParamBindings({
      Cubism2RuntimeConstants,
      Live2D: {
        shouldThrowOnInvalidInterpolationCorner: false,
      },
      isBootstrapping: () => false,
    })
    const opacityInterpolator = vi.fn(
      (
        runtimeModelContext: unknown,
        runtimeParamBindingSet: unknown,
        dirtyFlagRef: boolean[],
        opacityValues: number[],
      ) => {
        expect(runtimeModelContext).toMatchObject({ kind: 'grid-model-context' })
        expect(runtimeParamBindingSet).not.toBeNull()
        expect(opacityValues).toEqual([0.1, 0.9])
        dirtyFlagRef[0] = true
        return 0.42
      },
    )
    const Cubism2BaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency(defaultBaseDataId),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      interpolator: {
        interpolateFloat: opacityInterpolator,
      },
      isBootstrapping: () => false,
    })
    const Cubism2Interpolation = createCubism2Interpolation({
      UtSystem: {
        /**
         * Copies contiguous point tuples for the optimized zero-dimensional branch.
         * @param source Source point tuple buffer.
         * @param sourceOffset First scalar copied from the source buffer.
         * @param target Destination point tuple buffer.
         * @param targetOffset First scalar written into the destination buffer.
         * @param length Number of scalar values copied.
         */
        copyArraySegmentForward(
          source: ArrayLike<number>,
          sourceOffset: number,
          target: MutableNumberArray,
          targetOffset: number,
          length: number,
        ): void {
          for (let valueIndex = 0; valueIndex < length; valueIndex += 1) {
            target[targetOffset + valueIndex] = source[sourceOffset + valueIndex] ?? 0
          }
        },
      },
    }).Cubism2Interpolation
    const constructors = createCubism2GridBaseData({
      Cubism2BaseContext,
      Cubism2BaseData,
      Cubism2Interpolation,
      Cubism2ParamBindingSet: cubism2ParamBindings.Cubism2ParamBindingSet,
      Live2D: {
        isVerboseLoggingEnabled: () => false,
        shouldClampSdk1GridPointsToUnitRange: true,
      },
      System: {
        err: {
          /**
           * Suppresses legacy impossible-branch diagnostics during deterministic unit tests.
           * @param message Legacy printf-style diagnostic.
           * @param args Optional diagnostic interpolation values.
           */
          printf(message: string, ...args: unknown[]): void {
            void message
            void args
          },
        },
      },
      UtDebug: {
        /**
         * Suppresses legacy target-base diagnostics during deterministic unit tests.
         * @param message Legacy format string emitted when target base data cannot be resolved.
         * @param targetId Optional target ID attached to the diagnostic message.
         */
        logWithLegacyPrefix(message: string, targetId?: unknown): void {
          void message
          void targetId
        },
      },
      isBootstrapping: () => false,
    })
    const bootstrappingConstructors = createCubism2GridBaseData({
      Cubism2BaseContext,
      Cubism2BaseData,
      Cubism2Interpolation,
      Cubism2ParamBindingSet: cubism2ParamBindings.Cubism2ParamBindingSet,
      Live2D: {
        isVerboseLoggingEnabled: () => false,
        shouldClampSdk1GridPointsToUnitRange: true,
      },
      System: {
        err: {
          /**
           * Ignores diagnostics while testing prototype bootstrapping.
           * @param message Legacy printf-style diagnostic.
           */
          printf(message: string): void {
            void message
          },
        },
      },
      UtDebug: {
        /**
         * Ignores legacy diagnostics while testing prototype bootstrapping.
         * @param message Legacy diagnostic string.
         */
        logWithLegacyPrefix(message: string): void {
          void message
        },
      },
      isBootstrapping: () => true,
    })
    const readParamBindingSet = {
      /**
       * Forces grid interpolation to run for this deterministic case.
       * @returns Always true so the point interpolation branch executes.
       */
      hasChangedParams(): boolean {
        return true
      },
      /**
       * Selects one interpolation axis and marks the grid dirty.
       * @param runtimeModelContext Runtime model context supplied by grid update.
       * @param dirtyFlagRef Single-item dirty flag mutated by the resolver.
       * @returns One active interpolation axis.
       */
      resolveInterpolationWeights(runtimeModelContext: unknown, dirtyFlagRef: boolean[]): number {
        expect(runtimeModelContext).toMatchObject({ kind: 'grid-model-context' })
        dirtyFlagRef[0] = true
        return 1
      },
      /**
       * Selects the two authored grid point tables and a 25% interpolation weight.
       * @param cornerIndexes Mutable scratch index buffer supplied by the model context.
       * @param cornerWeights Mutable scratch weight buffer supplied by the model context.
       * @param dimensionCount Number of active interpolation axes.
       */
      buildInterpolationCorners(
        cornerIndexes: MutableNumberArray,
        cornerWeights: MutableNumberArray,
        dimensionCount: number,
      ): void {
        expect(dimensionCount).toBe(1)
        cornerIndexes[0] = 0
        cornerIndexes[1] = 1
        cornerWeights[0] = 0.25
      },
    }
    const gridPointValues = [
      new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
      new Float32Array([10, 20, 11, 20, 10, 21, 11, 21]),
    ]
    const scratchIndexes = [0, 1] as MutableNumberArray
    const scratchWeights = [0.25] as MutableNumberArray
    const targetBaseData = {
      /**
       * Applies a deterministic parent-space offset to every grid control point.
       * @param runtimeModelContext Model context supplied by grid propagation.
       * @param runtimeTargetContext Parent base context used by the grid.
       * @param sourcePoints Input point buffer.
       * @param outputPoints Output point buffer receiving translated points.
       * @param pointCount Number of logical points in the buffer.
       * @param pointOffset First point offset in the interleaved buffer.
       * @param pointStride Number of scalar slots between logical points.
       */
      transformPoints(
        runtimeModelContext: unknown,
        runtimeTargetContext: unknown,
        sourcePoints: MutableNumberArray,
        outputPoints: MutableNumberArray,
        pointCount: number,
        pointOffset: number,
        pointStride: number,
      ): void {
        expect(runtimeModelContext).toMatchObject({ kind: 'grid-model-context' })
        expect(runtimeTargetContext).toBe(targetBaseContext)
        for (
          let pointIndex = pointOffset;
          pointIndex < pointCount * pointStride;
          pointIndex += pointStride
        ) {
          outputPoints[pointIndex] = sourcePoints[pointIndex]! + 100
          outputPoints[pointIndex + 1] = sourcePoints[pointIndex + 1]! + 200
        }
      },
    }
    const targetBaseContext = new Cubism2BaseContext(targetBaseData)
    targetBaseContext.setTotalScaleNotForClient(3)
    targetBaseContext.setTotalOpacity(0.5)
    const modelContext = {
      kind: 'grid-model-context',
      /**
       * Supplies the corner index scratch buffer used by grid interpolation.
       * @returns Mutable corner index buffer.
       */
      getScratchIndexBuffer() {
        return scratchIndexes
      },
      /**
       * Supplies the corner weight scratch buffer used by grid interpolation.
       * @returns Mutable corner weight buffer.
       */
      getScratchWeightBuffer() {
        return scratchWeights
      },
      /**
       * Resolves the fake target base-data ID to its context index.
       * @param runtimeTargetBaseDataId Target base-data ID requested by grid propagation.
       * @returns Target index when the ID matches the fake parent.
       */
      getBaseDataIndex(runtimeTargetBaseDataId: unknown) {
        return runtimeTargetBaseDataId === targetBaseDataId ? 7 : -1
      },
      /**
       * Reads the fake parent base data by runtime index.
       * @param baseDataIndex Runtime base-data index resolved by `getBaseDataIndex`.
       * @returns Fake target base data for index 7.
       */
      getBaseData(baseDataIndex: number) {
        return baseDataIndex === 7 ? targetBaseData : null
      },
      /**
       * Reads the fake parent base context by runtime index.
       * @param baseDataIndex Runtime base-data index resolved by `getBaseDataIndex`.
       * @returns Fake target base context for index 7.
       */
      getBaseContext(baseDataIndex: number) {
        return baseDataIndex === 7 ? targetBaseContext : null
      },
    }
    const gridBaseData = new constructors.Cubism2GridBaseData()
    const bootstrappingGridBaseData = new bootstrappingConstructors.Cubism2GridBaseData()

    gridBaseData.initializeParamBindingSet()

    expect(gridBaseData.paramBindingSet).toBeInstanceOf(cubism2ParamBindings.Cubism2ParamBindingSet)
    expect(Object.prototype.hasOwnProperty.call(bootstrappingGridBaseData, 'gridColumnCount')).toBe(
      false,
    )
    expect(gridBaseData.getType()).toBe(Cubism2BaseData.TYPE_GRID)

    const readerObjects = [baseDataId, defaultBaseDataId, readParamBindingSet, gridPointValues]
    const readIntegers = [1, 1]
    const reader = {
      /**
       * Selects SDK2 v2.10+ so grid base data reads opacity interpolation values.
       * @returns Fake MOC format version.
       */
      getFormatVersion() {
        return 33
      },
      /**
       * Reads the fake opacity table attached to the grid base-data record.
       * @returns Two authored opacity samples.
       */
      readFloat32Array() {
        return [0.1, 0.9]
      },
      /**
       * Reads grid row and column counts in legacy payload order.
       * @returns Next grid dimension value.
       */
      readInt32() {
        return readIntegers.shift() ?? 0
      },
      /**
       * Reads base IDs, param bindings, and grid point values in legacy payload order.
       * @returns Next fake object from the grid base-data payload.
       */
      readObject() {
        return readerObjects.shift() ?? null
      },
    }

    gridBaseData.readGridBaseData(reader)
    const gridContext = gridBaseData.createRuntimeContext(modelContext)

    gridBaseData.updateRuntimeContext(modelContext, gridContext)
    gridBaseData.applyRuntimeContext(modelContext, gridContext)

    expect(gridBaseData.paramBindingSet).toBe(readParamBindingSet)
    expect(gridBaseData.gridPointValues).toBe(gridPointValues)
    expect(gridBaseData.getGridPointCount()).toBe(4)
    expect(gridContext).toBeInstanceOf(constructors.Cubism2GridContext)
    expect(gridContext.targetBaseDataIndex).toBe(Cubism2BaseData.UNRESOLVED_BASE_DATA_INDEX)
    expect(Array.from(gridContext.localPoints!)).toEqual([2.5, 5, 3.5, 5, 2.5, 6, 3.5, 6])
    expect(gridContext.targetSpacePoints).toBeNull()
    expect(gridContext.hasTransform()).toBe(true)
    expect(gridContext.getInterpolatedOpacity()).toBe(0.42)
    expect(gridContext.getTotalOpacity()).toBe(0.42)
    expect(opacityInterpolator).toHaveBeenCalledTimes(1)

    const transformedPoints = [0, 0, 0, 0] as MutableNumberArray
    constructors.Cubism2GridBaseData.transformPointsSdk2(
      [0.25, 0.25, 0.75, 0.75],
      transformedPoints,
      2,
      0,
      2,
      gridContext.localPoints!,
      1,
      1,
    )
    expect(transformedPoints[0]).toBeCloseTo(2.75)
    expect(transformedPoints[1]).toBeCloseTo(5.25)
    expect(transformedPoints[2]).toBeCloseTo(3.25)
    expect(transformedPoints[3]).toBeCloseTo(5.75)

    const skewedGridPoints = [2, 10, 6, 12, 3, 20, 9, 24]
    const sdk2BranchCases = [
      { expected: [3.25, 13], label: 'interior lower triangle', point: [0.25, 0.25] },
      { expected: [6.75, 20], label: 'interior upper triangle', point: [0.75, 0.75] },
      { expected: [-1.1875, 5.5625], label: 'near-field left-top', point: [-0.5, -0.25] },
      { expected: [0.125, 13.625], label: 'near-field left-middle', point: [-0.5, 0.5] },
      { expected: [1.125, 21.375], label: 'near-field left-bottom', point: [-0.5, 1.25] },
      { expected: [6.8125, 10.0625], label: 'near-field right-top', point: [1.25, -0.25] },
      { expected: [8.8125, 18.8125], label: 'near-field right-middle', point: [1.25, 0.5] },
      { expected: [11.0625, 30.0625], label: 'near-field right-bottom', point: [1.25, 1.5] },
      { expected: [3.5625, 8.3125], label: 'near-field top-edge', point: [0.5, -0.25] },
      { expected: [6.5625, 24.8125], label: 'near-field bottom-edge', point: [0.5, 1.25] },
      { expected: [15.5, -11.5], label: 'far-field affine extrapolation', point: [4, -3] },
    ]
    const sdk2BranchInput: number[] = []
    for (const sdk2BranchCase of sdk2BranchCases) {
      sdk2BranchInput.push(sdk2BranchCase.point[0]!, sdk2BranchCase.point[1]!)
    }
    const sdk2BranchOutput = new Array<number>(sdk2BranchCases.length * 2).fill(
      0,
    ) as MutableNumberArray
    constructors.Cubism2GridBaseData.transformPointsSdk2(
      sdk2BranchInput,
      sdk2BranchOutput,
      sdk2BranchCases.length,
      0,
      2,
      skewedGridPoints,
      1,
      1,
    )
    for (let branchCaseIndex = 0; branchCaseIndex < sdk2BranchCases.length; branchCaseIndex += 1) {
      const sdk2BranchCase = sdk2BranchCases[branchCaseIndex]!
      const outputOffset = branchCaseIndex * 2
      expect({
        label: sdk2BranchCase.label,
        output: [sdk2BranchOutput[outputOffset], sdk2BranchOutput[outputOffset + 1]],
      }).toEqual({
        label: sdk2BranchCase.label,
        output: sdk2BranchCase.expected,
      })
    }

    const sdk1Output = [0, 0] as MutableNumberArray
    gridBaseData.transformPointsSdk1(modelContext, gridContext, [-0.5, 2], sdk1Output, 1, 0, 2)
    expect(sdk1Output[0]).toBeCloseTo(2.5)
    expect(sdk1Output[1]).toBeCloseTo(6)

    const targetGridData = new constructors.Cubism2GridBaseData()
    const targetReaderObjects = [baseDataId, targetBaseDataId, readParamBindingSet, gridPointValues]
    const targetReaderIntegers = [1, 1]
    const targetReader = {
      /**
       * Selects SDK2 v2.10+ for target grid opacity reads.
       * @returns Fake MOC format version.
       */
      getFormatVersion() {
        return 33
      },
      /**
       * Reads the fake opacity table attached to the target grid record.
       * @returns Two authored opacity samples.
       */
      readFloat32Array() {
        return [0.1, 0.9]
      },
      /**
       * Reads target grid dimensions in legacy payload order.
       * @returns Next target grid dimension value.
       */
      readInt32() {
        return targetReaderIntegers.shift() ?? 0
      },
      /**
       * Reads target grid payload objects in legacy order.
       * @returns Next fake object for this target grid record.
       */
      readObject() {
        return targetReaderObjects.shift() ?? null
      },
    }

    targetGridData.readGridBaseData(targetReader)
    const targetGridContext = targetGridData.createRuntimeContext(modelContext)

    targetGridData.updateRuntimeContext(modelContext, targetGridContext)
    targetGridData.applyRuntimeContext(modelContext, targetGridContext)

    expect(targetGridContext.targetBaseDataIndex).toBe(7)
    expect(Array.from(targetGridContext.targetSpacePoints!)).toEqual([
      102.5, 205, 103.5, 205, 102.5, 206, 103.5, 206,
    ])
    expect(targetGridContext.getTotalScale()).toBe(3)
    expect(targetGridContext.getTotalOpacity()).toBeCloseTo(0.21)
    expect(targetGridContext.isActive).toBe(true)
    expect(targetGridContext.hasTransform()).toBe(true)

    const targetGridOutput = [0, 0] as MutableNumberArray
    targetGridData.transformPoints(
      modelContext,
      targetGridContext,
      [0.25, 0.25],
      targetGridOutput,
      1,
      0,
      2,
    )
    expect(targetGridOutput[0]).toBeCloseTo(102.75)
    expect(targetGridOutput[1]).toBeCloseTo(205.25)

    const missingTargetGridData = new constructors.Cubism2GridBaseData()
    missingTargetGridData.gridColumnCount = 1
    missingTargetGridData.gridRowCount = 1
    missingTargetGridData.setTargetBaseDataID({ id: 'MissingTargetGrid' })
    const missingTargetGridContext = missingTargetGridData.createRuntimeContext(modelContext)
    missingTargetGridContext.localPoints!.set(gridContext.localPoints!)

    missingTargetGridData.applyRuntimeContext(modelContext, missingTargetGridContext)

    expect(missingTargetGridContext.targetBaseDataIndex).toBe(-1)
    expect(missingTargetGridContext.isActive).toBe(false)

    const unavailableTargetBaseContext = new Cubism2BaseContext(targetBaseData)
    unavailableTargetBaseContext.setTransformFlag(true)
    const unavailableTargetModelContext = {
      ...modelContext,
      /**
       * Resolves a target base-data ID to the unavailable fake parent context.
       * @returns The fixed unavailable target index.
       */
      getBaseDataIndex(): number {
        return 8
      },
      /**
       * Reads the fake parent base data by unavailable runtime index.
       * @param baseDataIndex Runtime base-data index resolved by `getBaseDataIndex`.
       * @returns Fake target base data for index 8.
       */
      getBaseData(baseDataIndex: number) {
        return baseDataIndex === 8 ? targetBaseData : null
      },
      /**
       * Reads an unavailable target base context by runtime index.
       * @param baseDataIndex Runtime base-data index resolved by `getBaseDataIndex`.
       * @returns Base context marked non-renderable through its transform flag.
       */
      getBaseContext(baseDataIndex: number) {
        return baseDataIndex === 8 ? unavailableTargetBaseContext : null
      },
    }
    const unavailableTargetGridData = new constructors.Cubism2GridBaseData()
    unavailableTargetGridData.gridColumnCount = 1
    unavailableTargetGridData.gridRowCount = 1
    unavailableTargetGridData.setTargetBaseDataID(targetBaseDataId)
    const unavailableTargetGridContext = unavailableTargetGridData.createRuntimeContext(
      unavailableTargetModelContext,
    )
    unavailableTargetGridContext.localPoints!.set(gridContext.localPoints!)

    unavailableTargetGridData.applyRuntimeContext(
      unavailableTargetModelContext,
      unavailableTargetGridContext,
    )

    expect(unavailableTargetGridContext.targetBaseDataIndex).toBe(8)
    expect(unavailableTargetGridContext.isActive).toBe(false)
  })

  it('keeps WebGL draw context base state in a separate module', () => {
    const DrawContextBase = createCubism2DrawContextBase({
      isBootstrapping: () => false,
    })
    const sourceDrawData = { id: 'mesh' }
    const drawContext = new DrawContextBase(sourceDrawData)

    drawContext.clippedFlagRef[0] = true

    expect(drawContext.getSourceDrawData()).toBe(sourceDrawData)
    expect(drawContext.isClipped()).toBe(true)
    expect(drawContext.isRenderable()).toBe(false)
    expect(drawContext).toMatchObject({
      isActive: true,
      baseOpacity: 1,
      clipBufPre_clipContext: null,
    })
  })

  it('keeps Cubism2 base context state semantic through direct fields and methods', () => {
    const BaseContext = createCubism2BaseContext({
      isBootstrapping: () => false,
    })
    const BootstrappingBaseContext = createCubism2BaseContext({
      isBootstrapping: () => true,
    })
    const sourceData = { id: 'base-data' }
    const replacementSourceData = { id: 'replacement-base-data' }
    const baseContext = new BaseContext(sourceData)
    const prototypeBootstrapContext = new BootstrappingBaseContext()

    baseContext.setPartsIndex(12)
    baseContext.setTransformFlag(true)

    expect(baseContext.getSourceData()).toBe(sourceData)
    expect(baseContext.sourceData).toBe(sourceData)
    expect(baseContext.getPartsIndex()).toBe(12)
    expect(baseContext.partsIndex).toBe(12)
    expect(baseContext.hasTransform()).toBe(true)
    expect(baseContext.hasTransformFlag).toBe(true)
    expect(baseContext.isRenderable()).toBe(false)

    baseContext.setTransformFlag(false)
    baseContext.setActive(false)
    baseContext.setInterpolatedOpacity(0.4)
    baseContext.setTotalOpacity(0.3)
    baseContext.setTotalScaleNotForClient(1.5)

    expect(baseContext.hasTransformFlag).toBe(false)
    expect(baseContext.isActive).toBe(false)
    expect(baseContext.interpolatedOpacity).toBe(0.4)
    expect(baseContext.getTotalOpacity()).toBe(0.3)
    expect(baseContext.getTotalScale()).toBe(1.5)

    baseContext.sourceData = replacementSourceData
    baseContext.partsIndex = 7
    baseContext.isActive = true
    baseContext.hasTransformFlag = true
    baseContext.interpolatedOpacity = 0.8

    expect(baseContext.sourceData).toBe(replacementSourceData)
    expect(baseContext.partsIndex).toBe(7)
    expect(baseContext.isActive).toBe(true)
    expect(baseContext.hasTransformFlag).toBe(true)
    expect(baseContext.interpolatedOpacity).toBe(0.8)
    expect(Object.prototype.hasOwnProperty.call(prototypeBootstrapContext, 'sourceData')).toBe(
      false,
    )
    expect(Object.prototype.hasOwnProperty.call(prototypeBootstrapContext, 'partsIndex')).toBe(
      false,
    )
  })

  it('keeps Cubism2 parameter definitions in a separate module with semantic readers', () => {
    const paramDefinitions = createCubism2ParamDefinitions({
      isBootstrapping: () => false,
    })
    const definition = new paramDefinitions.Cubism2ParamDefinition()
    const definitionSet = new paramDefinitions.Cubism2ParamDefinitionSet()
    const floats = [0.1, 1.2, 0.5]
    const paramId = { id: 'ParamAngleX' }
    const reader = {
      /**
       * Reads the next authored numeric parameter bound from the fake binary stream.
       * @returns Next min/max/default value in the order stored by type tag 131.
       */
      readFloat32() {
        return floats.shift()!
      },
      /**
       * Reads the parameter ID object from the fake binary stream.
       * @returns The deterministic parameter ID used by this test definition.
       */
      readObject() {
        return paramId
      },
    }

    definition.readParamDefinition(reader)
    definitionSet.initializeParamDefinitions()
    definitionSet.addParamDefinition(definition)

    expect(definition.getMinValue()).toBe(0.1)
    expect(definition.getMaxValue()).toBe(1.2)
    expect(definition.getDefaultValue()).toBe(0.5)
    expect(definition.getParamID()).toBe(paramId)
    expect(definitionSet.getParamDefinitions()).toEqual([definition])

    definitionSet.readParamDefinitionSet({
      /**
       * Unused by the set-level reader because the set payload is an object reference.
       * @returns Zero if accidentally called.
       */
      readFloat32() {
        return 0
      },
      /**
       * Reads the full parameter-definition list payload.
       * @returns A deterministic list proving readParamDefinitionSet applies the set payload.
       */
      readObject() {
        return [definition]
      },
    })

    expect(definitionSet.getParamDefinitions()).toEqual([definition])
  })

  it('keeps Cubism2 model data in a separate module with reader and fallback container semantics', () => {
    const paramDefinitions = createCubism2ParamDefinitions({
      isBootstrapping: () => false,
    })
    const modelData = createCubism2ModelData({
      Cubism2ParamDefinitionSet: paramDefinitions.Cubism2ParamDefinitionSet,
      isBootstrapping: () => false,
    })
    const bootstrappingModelData = createCubism2ModelData({
      Cubism2ParamDefinitionSet: paramDefinitions.Cubism2ParamDefinitionSet,
      isBootstrapping: () => true,
    })
    const modelImpl = new modelData.Cubism2ModelImpl()
    const bootstrappingModelImpl = new bootstrappingModelData.Cubism2ModelImpl()
    const paramDefinitionSet = new paramDefinitions.Cubism2ParamDefinitionSet()
    const partsData = [{ id: 'PartBody' }]
    const readObjects = [paramDefinitionSet, partsData]
    const readIntegers = [640, 480]
    const readCallOrder: string[] = []
    const reader = {
      /**
       * Reads the next model-data object payload in param definitions then parts-list order.
       * @returns Next fake MOC object consumed by type-136 model-data deserialization.
       */
      readObject() {
        readCallOrder.push('object')
        return readObjects.shift() ?? null
      },
      /**
       * Reads the next model canvas dimension from the fake MOC payload.
       * @returns Next width or height value consumed by `readModelData`.
       */
      readInt32() {
        readCallOrder.push('int')
        return readIntegers.shift() ?? 0
      },
    }

    expect(modelData.Cubism2ModelImpl.instanceCount).toBe(1)
    expect(bootstrappingModelData.Cubism2ModelImpl.instanceCount).toBe(0)
    modelData.Cubism2ModelImpl.instanceCount = 9
    expect(modelData.Cubism2ModelImpl.instanceCount).toBe(9)
    new modelData.Cubism2ModelImpl()
    expect(modelData.Cubism2ModelImpl.instanceCount).toBe(10)
    expect(Object.prototype.hasOwnProperty.call(bootstrappingModelImpl, 'canvasWidth')).toBe(false)
    expect(modelImpl.getCanvasWidth()).toBe(400)
    expect(modelImpl.getCanvasHeight()).toBe(400)
    expect(modelImpl.paramDefinitionSet).toBeNull()
    expect(modelImpl.partsDataList).toBeNull()
    expect(modelImpl.canvasWidth).toBe(400)
    expect(modelImpl.canvasHeight).toBe(400)

    modelImpl.readModelData(reader)
    modelImpl.addPartsData({ id: 'PartFace' })
    modelImpl.addPartsData({ id: 'PartAccessory' })

    expect(readCallOrder).toEqual(['object', 'object', 'int', 'int'])
    expect(modelImpl.getParamDefinitionSet()).toBe(paramDefinitionSet)
    expect(modelImpl.getPartsDataList()).toEqual([
      { id: 'PartBody' },
      { id: 'PartFace' },
      { id: 'PartAccessory' },
    ])
    expect(modelImpl.getCanvasWidth()).toBe(640)
    expect(modelImpl.getCanvasHeight()).toBe(480)
    expect(modelImpl.paramDefinitionSet).toBe(paramDefinitionSet)
    expect(modelImpl.partsDataList).toEqual([
      { id: 'PartBody' },
      { id: 'PartFace' },
      { id: 'PartAccessory' },
    ])
    expect(modelImpl.canvasWidth).toBe(640)
    expect(modelImpl.canvasHeight).toBe(480)

    modelImpl.canvasWidth = 960
    modelImpl.canvasHeight = 540
    modelImpl.partsDataList = [{ id: 'PartHair' }]

    expect(modelImpl.getCanvasWidth()).toBe(960)
    expect(modelImpl.getCanvasHeight()).toBe(540)
    expect(modelImpl.getPartsDataList()).toEqual([{ id: 'PartHair' }])

    const emptyModelImpl = new modelData.Cubism2ModelImpl()
    emptyModelImpl.initializeModelContainers()

    expect(emptyModelImpl.getParamDefinitionSet()).toBeInstanceOf(
      paramDefinitions.Cubism2ParamDefinitionSet,
    )
    expect(emptyModelImpl.getPartsDataList()).toEqual([])
  })

  it('keeps Cubism2 interpolation in a separate module with integer, float, and point semantics', async () => {
    const { createCubism2Interpolation } =
      await import('@/components/blog/live2d/vendor/cubism2Core/compatibility/interpolation')
    const copyCalls: Array<{
      length: number
      sourceOffset: number
      targetOffset: number
    }> = []
    const interpolationConstructors = createCubism2Interpolation({
      UtSystem: {
        /**
         * Copies contiguous point tuples while recording that the optimized legacy path was used.
         * @param source Source point tuple buffer selected by the interpolation corner.
         * @param sourceOffset Source offset passed by the compatibility helper.
         * @param target Target point tuple buffer receiving copied values.
         * @param targetOffset Target offset passed by the compatibility helper.
         * @param length Number of scalar values copied into the output buffer.
         */
        copyArraySegmentForward(
          source: ArrayLike<number>,
          sourceOffset: number,
          target: MutableNumberArray,
          targetOffset: number,
          length: number,
        ): void {
          copyCalls.push({ length, sourceOffset, targetOffset })
          for (let valueIndex = 0; valueIndex < length; valueIndex += 1) {
            target[targetOffset + valueIndex] = source[sourceOffset + valueIndex] ?? 0
          }
        },
      },
    })
    const Cubism2Interpolation = interpolationConstructors.Cubism2Interpolation
    const integerCases = [
      { dimensionCount: 0, expected: 9, indexes: [2], values: [7, 8, 9], weights: [] },
      { dimensionCount: 1, expected: 16, indexes: [0, 1], values: [10, 20], weights: [0.6] },
      {
        dimensionCount: 2,
        expected: 11,
        indexes: [0, 1, 2, 3],
        values: [0, 10, 20, 40],
        weights: [0.5, 0.25],
      },
      {
        dimensionCount: 3,
        expected: 35,
        indexes: [0, 1, 2, 3, 4, 5, 6, 7],
        values: [0, 10, 20, 30, 40, 50, 60, 70],
        weights: [0.5, 0.5, 0.5],
      },
      {
        dimensionCount: 4,
        expected: 75,
        indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
        weights: [0.5, 0.5, 0.5, 0.5],
      },
    ]

    integerCases.forEach(({ dimensionCount, expected, indexes, values, weights }) => {
      const { dirtyFlagRef, modelContext, paramBindingSet } = createInterpolationHarness(
        dimensionCount,
        indexes,
        weights,
      )

      expect(
        Cubism2Interpolation.interpolateInteger(
          modelContext,
          paramBindingSet,
          dirtyFlagRef,
          values,
        ),
      ).toBe(expected)
    })

    const highDimensionalFloatIndexes: number[] = []
    const highDimensionalFloatValues: number[] = []
    for (let cornerIndex = 0; cornerIndex < 32; cornerIndex += 1) {
      highDimensionalFloatIndexes.push(cornerIndex)
      highDimensionalFloatValues.push((cornerIndex % 3 === 0 ? -1 : 1) * (cornerIndex + 1) * 1.25)
    }
    const floatCases = [
      { dimensionCount: 0, expected: 2, indexes: [1], values: [1, 2, 3], weights: [] },
      {
        dimensionCount: 1,
        expected: 12.5,
        indexes: [0, 1],
        values: [10, 20],
        weights: [0.25],
      },
      {
        dimensionCount: 2,
        expected: 11.25,
        indexes: [0, 1, 2, 3],
        values: [0, 10, 20, 40],
        weights: [0.5, 0.25],
      },
      {
        dimensionCount: 3,
        expected: 3995033664590001000,
        indexes: [0, 1, 2, 3, 4, 5, 6, 7],
        values: [1e20, -1e19, 1e18, -1e17, 1e16, -1e15, 1e14, -1e13],
        weights: [0.37, 0.61, 0.83],
      },
      {
        dimensionCount: 4,
        expected: 3995033664590000600,
        indexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        values: [
          1e20, -1e19, 1e18, -1e17, 1e16, -1e15, 1e14, -1e13, 1e20, -1e19, 1e18, -1e17, 1e16, -1e15,
          1e14, -1e13,
        ],
        weights: [0.37, 0.61, 0.83, 0.29],
      },
      {
        dimensionCount: 5,
        expected: 5.015342622064054,
        indexes: highDimensionalFloatIndexes,
        values: highDimensionalFloatValues,
        weights: [0.11, 0.23, 0.37, 0.41, 0.59],
      },
    ]

    floatCases.forEach(({ dimensionCount, expected, indexes, values, weights }) => {
      const { dirtyFlagRef, modelContext, paramBindingSet } = createInterpolationHarness(
        dimensionCount,
        indexes,
        weights,
      )

      expect(
        Cubism2Interpolation.interpolateFloat(modelContext, paramBindingSet, dirtyFlagRef, values),
      ).toBeCloseTo(expected)
    })

    const directCopy = createInterpolationHarness(0, [0], [])
    const directCopyOutput = new Float32Array(4) as unknown as MutableNumberArray
    Cubism2Interpolation.interpolatePoints(
      directCopy.modelContext,
      directCopy.paramBindingSet,
      directCopy.dirtyFlagRef,
      2,
      [[1, 2, 3, 4]],
      directCopyOutput,
      0,
      2,
    )

    expect(copyCalls).toEqual([{ length: 4, sourceOffset: 0, targetOffset: 0 }])
    expect(Array.from(directCopyOutput)).toEqual([1, 2, 3, 4])

    const stridedCopy = createInterpolationHarness(0, [0], [])
    const stridedCopyOutput = new Float32Array(7) as unknown as MutableNumberArray
    Cubism2Interpolation.interpolatePoints(
      stridedCopy.modelContext,
      stridedCopy.paramBindingSet,
      stridedCopy.dirtyFlagRef,
      2,
      [[1, 2, 3, 4]],
      stridedCopyOutput,
      1,
      3,
    )

    expect(Array.from(stridedCopyOutput)).toEqual([0, 1, 2, 0, 3, 4, 0])

    const oneDimensionalPoints = createInterpolationHarness(1, [0, 1], [0.5])
    const oneDimensionalPointOutput = new Float32Array(4) as unknown as MutableNumberArray
    Cubism2Interpolation.interpolatePoints(
      oneDimensionalPoints.modelContext,
      oneDimensionalPoints.paramBindingSet,
      oneDimensionalPoints.dirtyFlagRef,
      2,
      [
        [0, 0, 10, 10],
        [10, 20, 30, 40],
      ],
      oneDimensionalPointOutput,
      0,
      2,
    )

    expect(Array.from(oneDimensionalPointOutput)).toEqual([5, 10, 20, 25])

    const twoDimensionalPoints = createInterpolationHarness(2, [0, 1, 2, 3], [0.5, 0.5])
    const twoDimensionalPointOutput = new Float32Array(4) as unknown as MutableNumberArray
    Cubism2Interpolation.interpolatePoints(
      twoDimensionalPoints.modelContext,
      twoDimensionalPoints.paramBindingSet,
      twoDimensionalPoints.dirtyFlagRef,
      2,
      [
        [0, 0, 10, 10],
        [10, 0, 20, 10],
        [0, 10, 10, 20],
        [10, 10, 20, 20],
      ],
      twoDimensionalPointOutput,
      0,
      2,
    )

    expect(Array.from(twoDimensionalPointOutput)).toEqual([5, 5, 15, 15])

    const highDimensionalPointIndexes: number[] = []
    const highDimensionalPointValues: number[][] = []
    for (let cornerIndex = 0; cornerIndex < 32; cornerIndex += 1) {
      highDimensionalPointIndexes.push(cornerIndex)
      highDimensionalPointValues.push([
        cornerIndex,
        cornerIndex + 0.25,
        cornerIndex + 0.5,
        cornerIndex + 0.75,
      ])
    }
    const highDimensionalPoints = createInterpolationHarness(
      5,
      highDimensionalPointIndexes,
      [0.11, 0.23, 0.37, 0.41, 0.59],
    )
    const highDimensionalPointOutput = new Float32Array(4) as unknown as MutableNumberArray
    Cubism2Interpolation.interpolatePoints(
      highDimensionalPoints.modelContext,
      highDimensionalPoints.paramBindingSet,
      highDimensionalPoints.dirtyFlagRef,
      2,
      highDimensionalPointValues,
      highDimensionalPointOutput,
      0,
      2,
    )

    expect(Array.from(highDimensionalPointOutput).every(Number.isNaN)).toBe(true)
  })

  it('keeps Cubism2 param bindings in a separate module with interpolation-grid semantics', () => {
    const paramId = { id: 'ParamAngleX' }
    const constructors = createCubism2ParamBindings({
      Cubism2RuntimeConstants: {
        PARAM_VALUE_EPSILON: 0.0001,
        maxInterpolationCornerCount: 65,
      },
      Live2D: {
        shouldThrowOnInvalidInterpolationCorner: false,
      },
      isBootstrapping: () => false,
    })
    const bootstrappingConstructors = createCubism2ParamBindings({
      Cubism2RuntimeConstants: {
        PARAM_VALUE_EPSILON: 0.0001,
        maxInterpolationCornerCount: 65,
      },
      Live2D: {
        shouldThrowOnInvalidInterpolationCorner: false,
      },
      isBootstrapping: () => true,
    })
    const binding = new constructors.Cubism2ParamBinding()
    const bootstrapBindingSet = new bootstrappingConstructors.Cubism2ParamBindingSet()
    const readerObjects: unknown[] = [paramId, [-1, 0, 1]]
    const reader = {
      /**
       * Reads the authored point count from the fake runtime type-67 payload.
       * @returns Three authored points for the X-axis binding.
       */
      readInt32() {
        return 3
      },
      /**
       * Reads the next object from the fake runtime type-67 payload.
       * @returns ParamID first, then point values.
       */
      readObject() {
        return readerObjects.shift() ?? null
      },
    }

    expect(binding.cachedParamIndex).toBe(constructors.Cubism2ParamBinding.UNRESOLVED_PARAM_INDEX)

    binding.readParamBinding(reader)
    binding.cacheParamIndex(4, 8)

    expect(binding.getParamID()).toBe(paramId)
    expect(binding.getPointCount()).toBe(3)
    expect(binding.getPointValues()).toEqual([-1, 0, 1])
    expect(binding.getParamIndex(8)).toBe(4)
    expect(binding.getParamIndex(9)).toBe(constructors.Cubism2ParamBinding.UNRESOLVED_PARAM_INDEX)

    const bindingSet = new constructors.Cubism2ParamBindingSet()
    bindingSet.initBindingList()
    bindingSet.addParamBinding('ParamAngleX', 3, [-1, 0, 1])
    bindingSet.addParamBinding('ParamAngleY', 2, [0, 10])

    const bindings = bindingSet.getBindings()!
    expect(bindingSet.getParamCount()).toBe(2)
    expect(bindings[0]!.getPointValues()).toBeInstanceOf(Float32Array)
    expect(Array.from(bindings[0]!.getPointValues()!)).toEqual([-1, 0, 1])

    let changedParamIndexes = new Set<number>()
    let paramFloatValues = new Map<number, number>([
      [0, 0.5],
      [1, 10],
    ])
    const modelContext = {
      /**
       * Reports a stable generation so binding cache reuse can be observed.
       * @returns Fake parameter-cache generation.
       */
      getParamCacheGeneration() {
        return 3
      },
      /**
       * Resolves fake parameter IDs into model parameter indexes.
       * @param targetParamId ParamID stored by a binding.
       * @returns Zero for X, one for Y, and -1 for unknown parameters.
       */
      getParamIndex(targetParamId: unknown) {
        if (targetParamId === 'ParamAngleX') return 0
        if (targetParamId === 'ParamAngleY') return 1
        return -1
      },
      /**
       * Supplies current model parameter values for interpolation.
       * @param paramIndex Fake model parameter index.
       * @returns Current fake model parameter value for that index.
       */
      getParamFloat(paramIndex: number) {
        return paramFloatValues.get(paramIndex) ?? 0
      },
      /**
       * Reports whether this is the first model update.
       * @returns False so `hasChangedParams` checks per-parameter dirty flags.
       */
      isInitialParamUpdatePending() {
        return false
      },
      /**
       * Reads the fake dirty flag for one parameter index.
       * @param paramIndex Fake model parameter index.
       * @returns True when the test has marked that index dirty.
       */
      isParamChanged(paramIndex: number) {
        return changedParamIndexes.has(paramIndex)
      },
    }
    const dirtyFlagRef = [false]
    const cornerIndexes = new Array(4).fill(0)
    const cornerWeights = new Array(3).fill(0)

    expect(bindingSet.resolveInterpolationWeights(modelContext, dirtyFlagRef)).toBe(1)
    expect(dirtyFlagRef).toEqual([false])
    expect(bindings[0]!.getLowerPointIndex()).toBe(1)
    expect(bindings[0]!.getInterpolationWeight()).toBe(0.5)
    expect(bindings[1]!.getLowerPointIndex()).toBe(1)
    expect(bindings[1]!.getInterpolationWeight()).toBe(0)

    bindingSet.buildInterpolationCorners(cornerIndexes, cornerWeights, 1)

    expect(cornerIndexes.slice(0, 3)).toEqual([4, 5, 65535])
    expect(cornerWeights.slice(0, 2)).toEqual([0.5, -1])

    paramFloatValues = new Map([
      [0, 0.5],
      [1, 5],
    ])
    dirtyFlagRef[0] = false
    const typedCornerIndexes = new Int16Array(5)
    const typedCornerWeights = new Float32Array(3)

    expect(bindingSet.resolveInterpolationWeights(modelContext, dirtyFlagRef)).toBe(2)
    expect(dirtyFlagRef).toEqual([false])

    bindingSet.buildInterpolationCorners(typedCornerIndexes, typedCornerWeights, 2)

    expect(Array.from(typedCornerIndexes)).toEqual([1, 2, 4, 5, -1])
    expect(Array.from(typedCornerWeights)).toEqual([0.5, 0.5, -1])

    paramFloatValues = new Map([
      [0, -2],
      [1, 10],
    ])
    dirtyFlagRef[0] = false

    expect(bindingSet.resolveInterpolationWeights(modelContext, dirtyFlagRef)).toBe(0)
    expect(dirtyFlagRef).toEqual([true])
    expect(bindings[0]!.getLowerPointIndex()).toBe(0)

    changedParamIndexes = new Set([0])
    expect(bindingSet.hasChangedParams(modelContext)).toBe(true)
    changedParamIndexes = new Set()
    expect(bindingSet.hasChangedParams(modelContext)).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(bootstrapBindingSet, 'bindings')).toBe(false)
  })

  it('keeps Live2DModelBase in a separate module with loader and facade semantics', () => {
    const debugErrors: unknown[] = []
    const loadedModelImpl = {
      /**
       * Returns the fake model canvas height after a successful MOC load.
       * @returns Deterministic canvas height.
       */
      getCanvasHeight() {
        return 240
      },
      /**
       * Returns the fake model canvas width after a successful MOC load.
       * @returns Deterministic canvas width.
       */
      getCanvasWidth() {
        return 320
      },
      /**
       * Records no-op initialization for the fake model implementation.
       * @returns Nothing.
       */
      initializeModelContainers() {},
    }

    class FakeCoreError extends Error {}

    class FakeBinaryReader {
      private int16Offset = 0
      private int8Offset = 0

      /**
       * Stores the source view passed by the model loader.
       * @param sourceBuffer DataView created from the supplied MOC payload.
       */
      constructor(public sourceBuffer: DataView) {}

      /**
       * Reads the fake MOC magic and format-version bytes.
       * @returns Next byte in `moc` + version order.
       */
      readInt8() {
        return [109, 111, 99, 1][this.int8Offset++] ?? 0
      }

      /**
       * Reads the fake checksum markers expected by the legacy loader.
       * @returns Checksum marker accepted by the loader.
       */
      readInt16() {
        this.int16Offset++
        return -30584
      }

      /**
       * Reads the fake model implementation object from the stream.
       * @returns Model implementation used by the wrapper.
       */
      readObject() {
        return loadedModelImpl
      }

      /**
       * Records no-op format-version propagation for the fake reader.
       * @param formatVersion Version byte read from the fake MOC header.
       * @returns Nothing.
       */
      setFormatVersion(formatVersion: number) {
        expect(formatVersion).toBe(1)
      }
    }

    class FakeModelImpl {
      /**
       * Returns the fallback empty model canvas height.
       * @returns Zero height for an empty implementation.
       */
      getCanvasHeight() {
        return 0
      }

      /**
       * Returns the fallback empty model canvas width.
       * @returns Zero width for an empty implementation.
       */
      getCanvasWidth() {
        return 0
      }

      /**
       * Records no-op initialization for an empty model implementation.
       * @returns Nothing.
       */
      initializeModelContainers() {}
    }

    class FakePartsDataID {
      /**
       * Stores the visible ID value used by fake parts lookups.
       * @param value Raw parts value supplied by the wrapper.
       */
      constructor(public value: unknown) {}

      /**
       * Converts raw parts IDs into fake ID objects.
       * @param value Raw parts ID.
       * @returns Fake parts ID instance.
       */
      static getID(value: unknown) {
        if (value instanceof FakePartsDataID) {
          throw new Error('existing PartsDataID instances must bypass getID')
        }
        return new FakePartsDataID(value)
      }
    }

    class FakeMeshDrawContext {
      constructor(private readonly pointValues: number[] = [1, 2]) {}

      /**
       * Reports mesh type so `getIndexArray` reaches the legacy instanceof branch.
       * @returns Fake mesh draw-data type.
       */
      getType() {
        return 70
      }

      /**
       * Returns fake transformed points for the mesh context.
       * @returns Two deterministic transformed points.
       */
      getTransformedPoints() {
        return this.pointValues
      }
    }

    class FakeMeshDrawData extends FakeMeshDrawContext {
      constructor(
        pointValues: number[] = [1, 2],
        private readonly indexValues: number[] = [0, 1, 2],
      ) {
        super(pointValues)
      }

      /**
       * Returns the fake triangle index array.
       * @returns Deterministic index array.
       */
      getIndexArray() {
        return this.indexValues
      }
    }

    class FakeModelContext {
      contextLifecycleCalls: Array<[string, unknown[]]> = []
      drawParam: unknown = 'unset'
      initialized = false
      loadSaveCalls: string[] = []
      paramValues = new Map<number, number>([
        [2, 10],
        [3, 1],
      ])
      partOpacities = new Map<number, number>([
        [0, 0],
        [1, 1],
        [2, 0.5],
        [3, 0.9],
        [4, 0.2],
      ])
      drawDataList = [
        new FakeMeshDrawData([1, 2], [0, 1, 2]),
        new FakeMeshDrawContext([3, 4]),
        {
          /**
           * Reports a non-mesh draw-data type to cover the min.js null branch.
           * @returns Non-mesh draw data type.
           */
          getType(): number {
            return 999
          },
        },
      ]

      /**
       * Keeps a reference to the owning model for parity with the real ModelContext constructor.
       * @param model Owning model wrapper.
       */
      constructor(public model: unknown) {}

      /**
       * Reads a fake draw context by draw data index.
       * @param drawDataIndex Draw data index requested by the wrapper.
       * @returns Mesh draw data for index 0, mesh context for index 1, otherwise null.
       */
      getDrawContext(drawDataIndex: number) {
        if (drawDataIndex === 0) {
          return new FakeMeshDrawData([1, 2], [0, 1, 2])
        }
        if (drawDataIndex === 1) {
          return new FakeMeshDrawContext([3, 4])
        }
        return null
      }

      /**
       * Reads fake draw data by semantic ID or numeric index.
       * @param drawDataIdOrIndex Draw data identifier requested by the wrapper.
       * @returns Object preserving the requested draw data identifier.
       */
      getDrawData(drawDataIdOrIndex: unknown) {
        return { drawDataIndex: drawDataIdOrIndex }
      }

      /**
       * Resolves fake draw IDs into indexes.
       * @param drawDataId Draw ID produced by the fake registry.
       * @returns Index 7 for the known draw ID.
       */
      getDrawDataIndex(drawDataId: unknown) {
        return drawDataId === 'draw:body' ? 7 : -1
      }

      /**
       * Reads a fake parameter value.
       * @param paramIndex Parameter index requested by the wrapper.
       * @returns Stored parameter value, or zero when absent.
       */
      getParamFloat(paramIndex: number) {
        return this.paramValues.get(paramIndex) ?? 0
      }

      /**
       * Resolves fake parameter IDs into indexes.
       * @param paramId Parameter ID produced by the fake registry.
       * @returns Index for the known ID, or the numeric ID when already numeric-like.
       */
      getParamIndex(paramId: unknown) {
        if (paramId === 'param:x') return 2
        return typeof paramId === 'number' ? paramId : -1
      }

      /**
       * Resolves fake parts IDs into indexes.
       * @param partsId Parts ID produced by the fake registry.
       * @returns Index for known parts IDs.
       */
      getPartsDataIndex(partsId: unknown) {
        return partsId instanceof FakePartsDataID && partsId.value === 'head' ? 1 : -1
      }

      /**
       * Reads a fake parts opacity value.
       * @param partsIndex Parts index requested by the wrapper.
       * @returns Stored opacity, or zero when absent.
       */
      getPartsOpacity(partsIndex: number) {
        return this.partOpacities.get(partsIndex) ?? 0
      }

      /**
       * Marks the fake model context initialized.
       * @param args Actual arguments forwarded by the model-base lifecycle facade.
       * @returns Nothing.
       */
      init(...args: unknown[]) {
        this.contextLifecycleCalls.push(['init', args])
        this.initialized = true
      }

      /**
       * Records a load-param operation for the parts-opacity fallback branch.
       * @param args Actual arguments forwarded by the model-base lifecycle facade.
       * @returns Nothing.
       */
      loadParam(...args: unknown[]) {
        this.contextLifecycleCalls.push(['loadParam', args])
        this.loadSaveCalls.push('load')
      }

      /**
       * Records a save-param operation for the parts-opacity fallback branch.
       * @param args Actual arguments forwarded by the model-base lifecycle facade.
       * @returns Nothing.
       */
      saveParam(...args: unknown[]) {
        this.contextLifecycleCalls.push(['saveParam', args])
        this.loadSaveCalls.push('save')
      }

      /**
       * Stores the draw parameter passed by the model loader.
       * @param drawParam Draw parameter read from the model wrapper.
       * @returns Nothing.
       */
      setDrawParam(drawParam: unknown) {
        this.drawParam = drawParam
      }

      /**
       * Writes a fake parameter value.
       * @param paramIndex Parameter index to update.
       * @param value New parameter value.
       * @returns Nothing.
       */
      setParamFloat(paramIndex: number, value: number) {
        this.paramValues.set(paramIndex, value)
      }

      /**
       * Writes a fake parts opacity value.
       * @param partsIndex Parts index to update.
       * @param opacity New opacity value.
       * @returns Nothing.
       */
      setPartsOpacity(partsIndex: number, opacity: number) {
        this.partOpacities.set(partsIndex, opacity)
      }

      /**
       * Records no-op runtime update for the fake context.
       * @param args Actual arguments forwarded by the model-base lifecycle facade.
       * @returns Nothing.
       */
      update(...args: unknown[]) {
        this.contextLifecycleCalls.push(['update', args])
      }
    }

    const ModelBase = createCubism2ModelBase({
      Cubism2BinaryReader: FakeBinaryReader,
      Cubism2CoreError: FakeCoreError,
      Cubism2DrawDataBase: {
        TYPE_MESH: 70,
      },
      Cubism2MeshDrawContext: FakeMeshDrawContext,
      Cubism2MeshDrawData: FakeMeshDrawData,
      Cubism2MocVersion: {
        MAX_SUPPORTED_FORMAT_VERSION: 33,
        LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 1,
      },
      Cubism2ModelImpl: FakeModelImpl,
      DrawDataID: {
        /**
         * Converts fake draw IDs into the shape consumed by `getDrawDataIndex`.
         * @param id Raw draw ID.
         * @returns Prefixed fake draw ID.
         */
        getID(id: unknown) {
          return `draw:${String(id)}`
        },
      },
      ModelContext: FakeModelContext,
      ParamID: {
        /**
         * Converts fake parameter IDs into the shape consumed by `getParamIndex`.
         * @param id Raw parameter ID.
         * @returns Prefixed fake parameter ID.
         */
        getID(id: unknown) {
          return `param:${String(id)}`
        },
      },
      PartsDataID: FakePartsDataID,
      UtDebug: {
        /**
         * Records model-load errors swallowed by the legacy loader.
         * @param error Error routed through the semantic debug exception hook.
         * @returns Nothing.
         */
        logException(error: unknown) {
          debugErrors.push(error)
        },
        /**
         * Ignores debug log messages produced by base sentinel hooks.
         * @returns Nothing.
         */
        logWithLegacyPrefix() {},
      },
      isBootstrapping: () => false,
    })
    const model = new ModelBase()
    const modelContext = model.getModelContext() as FakeModelContext

    expect(ModelBase.LOAD_FLAG_CHECKSUM_MISMATCH).toBe(1)
    expect(ModelBase.LOAD_FLAG_UNSUPPORTED_MOC_VERSION).toBe(2)
    expect(ModelBase.instanceCount).toBe(1)

    ModelBase.instanceCount = 9
    expect(ModelBase.instanceCount).toBe(9)
    expect(new ModelBase()).toBeInstanceOf(ModelBase)
    expect(ModelBase.instanceCount).toBe(10)

    expect(model.getCanvasWidth()).toBe(0)
    expect(model.getCanvasHeight()).toBe(0)
    expect(model.getParamFloat('x')).toBe(10)

    model.setParamFloat('x', 20, 0.25)
    expect(model.getParamFloat('x')).toBe(12.5)
    model.addToParamFloat('x', 4)
    expect(model.getParamFloat('x')).toBe(16.5)
    model.multParamFloat('x', 2, 0.5)
    expect(model.getParamFloat('x')).toBe(24.75)

    model.setPartsOpacity('head', 0.3)
    expect(model.getPartsOpacity('head')).toBe(0.3)
    model.setPartsOpacity(14, 0.42)
    expect(model.getPartsOpacity(14)).toBe(0.42)
    expect(model.getPartsOpacity(-1)).toBe(0)
    expect(model.getPartsDataIndex('head')).toBe(1)
    expect(model.getPartsDataIndex(new FakePartsDataID('head'))).toBe(1)
    expect(model.getDrawDataIndex('body')).toBe(7)
    expect(model.getDrawData(5)).toEqual({ drawDataIndex: 5 })
    expect(model.getTransformedPoints(0)).toEqual([1, 2])
    expect(model.getTransformedPoints(1)).toEqual([3, 4])
    expect(model.getTransformedPoints(2)).toBeNull()
    expect(model.getIndexArray(0)).toEqual([0, 1, 2])
    expect(model.getIndexArray(1)).toBeNull()
    expect(model.getIndexArray(2)).toBeNull()
    expect(model.getIndexArray(-1)).toBeNull()
    expect(model.getIndexArray(99)).toBeNull()

    ModelBase.loadMocDataIntoModel(model, new ArrayBuffer(8))

    expect(debugErrors).toEqual([])
    expect(model.getModelImpl()).toBe(loadedModelImpl)
    expect(model.getCanvasWidth()).toBe(320)
    expect(model.getCanvasHeight()).toBe(240)
    expect(modelContext.drawParam).toBeUndefined()
    expect(modelContext.initialized).toBe(true)

    modelContext.contextLifecycleCalls = []
    expect(model.loadParam()).toBeUndefined()
    expect(model.saveParam()).toBeUndefined()
    expect(model.init()).toBeUndefined()
    expect(model.update()).toBeUndefined()
    expect(modelContext.contextLifecycleCalls).toEqual([
      ['loadParam', []],
      ['saveParam', []],
      ['init', []],
      ['update', []],
    ])
    modelContext.loadSaveCalls = []

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    expect(model.getTextureCount()).toBe(-1)
    expect(model.getTextureCount()).toBe(-1)
    expect(model.setDrawParam({ kind: 'semantic-draw-param' })).toBeUndefined()
    expect(model.setDrawParam({ kind: 'secondary-draw-param' })).toBeUndefined()
    expect(model.releaseRendererTextures()).toBeUndefined()
    expect(model.releaseRendererTextures()).toBeUndefined()
    expect(model.draw()).toBeUndefined()
    expect(model.getModelContext()).toBe(modelContext)
    expect(model.getLoadErrorFlags()).toBe(model.loadErrorFlags)

    modelContext.paramValues.set(0, 1)
    modelContext.paramValues.set(1, 0)
    model.updateParamDrivenPartsOpacity([0, 1], [0, 1], 0, 10)
    expect(modelContext.partOpacities.get(0)).toBe(1)
    expect(modelContext.partOpacities.get(1)).toBe(0)

    modelContext.paramValues.set(2, 0)
    modelContext.partOpacities.set(2, 0.5)
    model.updateParamDrivenPartsOpacity([2], [2], 2, 10)
    expect(modelContext.partOpacities.get(2)).toBeCloseTo(0.3)

    modelContext.paramValues.set(7, 1)
    modelContext.partOpacities.set(7, 0.25)
    model.updateParamDrivenPartsOpacity([7], [7], 2, 10)
    expect(modelContext.partOpacities.get(7)).toBeCloseTo(0.45)

    modelContext.paramValues.set(8, 1)
    modelContext.partOpacities.set(8, 0.95)
    model.updateParamDrivenPartsOpacity([8], [8], 2, 10)
    expect(modelContext.partOpacities.get(8)).toBe(1)

    modelContext.paramValues.set(9, 0)
    modelContext.partOpacities.set(9, 0.05)
    model.updateParamDrivenPartsOpacity([9], [9], 2, 10)
    expect(modelContext.partOpacities.get(9)).toBe(0)

    modelContext.paramValues.set(3, 0)
    modelContext.paramValues.set(4, 1)
    modelContext.partOpacities.set(3, 0.9)
    modelContext.partOpacities.set(4, 0.2)
    model.updateParamDrivenPartsOpacity([3, 4], [3, 4], 2, 10)
    expect(modelContext.partOpacities.get(4)).toBeCloseTo(0.4)
    expect(modelContext.partOpacities.get(3)).toBeCloseTo(0.75)

    modelContext.paramValues.set(10, 1)
    modelContext.paramValues.set(11, 1)
    modelContext.partOpacities.set(10, 0.2)
    modelContext.partOpacities.set(11, 0.8)
    model.updateParamDrivenPartsOpacity([10, 11], [10, 11], 2, 10)
    expect(modelContext.partOpacities.get(10)).toBeCloseTo(0.4)
    expect(modelContext.partOpacities.get(11)).toBeCloseTo(0.75)

    modelContext.paramValues.set(12, 0)
    modelContext.paramValues.set(13, 1)
    modelContext.partOpacities.set(12, 0.8)
    modelContext.partOpacities.set(13, 0.8)
    model.updateParamDrivenPartsOpacity([12, 13], [12, 13], 1, 10)
    expect(modelContext.partOpacities.get(13)).toBeCloseTo(0.9)
    expect(modelContext.partOpacities.get(12)).toBeCloseTo(0.1)

    modelContext.paramValues.set(5, 0)
    modelContext.paramValues.set(6, 0)
    model.updateParamDrivenPartsOpacity([5, 6], [5, 6], 1, 10)
    expect(modelContext.loadSaveCalls).toEqual(['load', 'save'])
    expect(modelContext.paramValues.get(5)).toBe(1)
    expect(modelContext.partOpacities.get(5)).toBe(1)

    consoleLogSpy.mockRestore()
  })

  it('keeps Live2DModelJS and Live2DModelWebGL in a separate wrapper module', () => {
    const mocBuffer = new ArrayBuffer(8)
    const baseConstructorTargets: unknown[] = []
    const loaderCalls: Array<{ model: unknown; sourceBuffer: ArrayBuffer | DataView }> = []
    const canvasInstances: Array<{ calls: Array<[string, unknown[]]> }> = []
    const webglInstances: Array<{ calls: Array<[string, unknown[]]>; glIndex?: number }> = []
    const live2DCalls: Array<[string, unknown[]]> = []
    const debugMessages: string[] = []
    let isBootstrapping = false

    /**
     * Creates a fake model context that records wrapper draw/update calls.
     * @returns ModelContext-like object with ordered call capture.
     */
    function createRecordingModelContext(): {
      calls: Array<[string, unknown[]]>
      draw: (drawParam: unknown) => void
      preDraw: (drawParam: unknown) => void
      update: () => void
    } {
      const calls: Array<[string, unknown[]]> = []
      return {
        calls,
        /**
         * Records draw calls from JS/WebGL model wrappers.
         * @param drawParam Draw parameter forwarded by the wrapper.
         * @returns Nothing; call data is stored for assertions.
         */
        draw(drawParam: unknown) {
          calls.push(['draw', [drawParam]])
        },
        /**
         * Records WebGL pre-draw calls after model update.
         * @param drawParam Draw parameter forwarded by the wrapper.
         * @returns Nothing; call data is stored for assertions.
         */
        preDraw(drawParam: unknown) {
          calls.push(['preDraw', [drawParam]])
        },
        /**
         * Records model update calls before WebGL pre-draw.
         * @returns Nothing; call data is stored for assertions.
         */
        update() {
          calls.push(['update', []])
        },
      }
    }

    /**
     * Minimal base-model constructor used by wrapper extraction tests.
     * @returns Nothing; instances receive a recording model context.
     */
    function FakeModelBase(this: { modelContext: ReturnType<typeof createRecordingModelContext> }) {
      baseConstructorTargets.push(this)
      this.modelContext = createRecordingModelContext()
    }
    /**
     * Records the model and source buffer passed through wrapper static loaders.
     * @param model Model wrapper instance created by the loader.
     * @param sourceBuffer MOC payload forwarded to the base loader.
     * @returns Nothing; call data is stored for assertions.
     */
    function recordMocLoad(model: unknown, sourceBuffer: ArrayBuffer | DataView): void {
      loaderCalls.push({ model, sourceBuffer })
    }
    FakeModelBase.loadMocDataIntoModel = vi.fn(recordMocLoad)

    /**
     * Minimal Canvas draw-parameter constructor used by JS wrapper tests.
     * @returns Nothing; calls are recorded on the instance.
     */
    function FakeCanvasDrawParam(this: { calls: Array<[string, unknown[]]> }) {
      this.calls = []
      canvasInstances.push(this)
    }
    /**
     * Records Canvas renderer assignment.
     * @param renderer Renderer forwarded by the JS model wrapper.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeCanvasDrawParam.prototype.setGL = function (renderer: unknown): void {
      this.calls.push(['setGL', [renderer]])
    }
    /**
     * Records Canvas transform assignment.
     * @param transform Transform forwarded by the JS model wrapper.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeCanvasDrawParam.prototype.setTransform = function (transform: unknown): void {
      this.calls.push(['setTransform', [transform]])
    }
    /**
     * Records Canvas texture assignment.
     * @param textureIndex Texture slot forwarded by the JS model wrapper.
     * @param texture Texture handle forwarded by the JS model wrapper.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeCanvasDrawParam.prototype.setTexture = function (
      textureIndex: number,
      texture: unknown,
    ): void {
      this.calls.push(['setTexture', [textureIndex, texture]])
    }
    /**
     * Records Canvas cleanup delegation through the semantic draw-param entry.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeCanvasDrawParam.prototype.releaseRendererTextures = function (): void {
      this.calls.push(['releaseRendererTextures', []])
    }
    /**
     * Records Canvas sentinel delegation through the semantic draw-param entry.
     * @returns Deterministic sentinel value.
     */
    FakeCanvasDrawParam.prototype.getTextureCount = function (): number {
      this.calls.push(['getTextureCount', []])
      return 41
    }
    /**
     * Records Canvas setup hook delegation through the semantic draw-param entry.
     * @param drawParam Payload forwarded by the JS model wrapper.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeCanvasDrawParam.prototype.setDrawParam = function (drawParam: unknown): void {
      this.calls.push(['setDrawParam', [drawParam]])
    }
    /**
     * Minimal WebGL draw-parameter constructor used by WebGL wrapper tests.
     * @param glIndex GL registry index supplied by the wrapper.
     * @returns Nothing; calls are recorded on the instance.
     */
    function FakeWebGLDrawParam(
      this: { calls: Array<[string, unknown[]]>; glIndex?: number; premultipliedAlpha: boolean },
      glIndex?: number,
    ) {
      this.calls = []
      this.glIndex = glIndex
      this.premultipliedAlpha = false
      webglInstances.push(this)
    }
    /**
     * Records WebGL context assignment.
     * @param gl GL context resolved by the Live2D registry.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeWebGLDrawParam.prototype.setGL = function (gl: unknown): void {
      this.calls.push(['setGL', [gl]])
    }
    /**
     * Records WebGL transform assignment.
     * @param transform Transform forwarded by the WebGL model wrapper.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeWebGLDrawParam.prototype.setTransform = function (transform: unknown): void {
      this.calls.push(['setTransform', [transform]])
    }
    /**
     * Records WebGL texture assignment.
     * @param textureIndex Texture slot forwarded by the WebGL model wrapper.
     * @param texture Texture handle forwarded by the WebGL model wrapper.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeWebGLDrawParam.prototype.setTexture = function (
      textureIndex: number,
      texture: unknown,
    ): void {
      this.calls.push(['setTexture', [textureIndex, texture]])
    }
    /**
     * Records WebGL cleanup delegation through the semantic draw-param entry.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeWebGLDrawParam.prototype.releaseRendererTextures = function (): void {
      this.calls.push(['releaseRendererTextures', []])
    }
    /**
     * Records WebGL sentinel delegation through the semantic draw-param entry.
     * @returns Deterministic sentinel value.
     */
    FakeWebGLDrawParam.prototype.getTextureCount = function (): number {
      this.calls.push(['getTextureCount', []])
      return 42
    }
    /**
     * Records WebGL setup hook delegation through the semantic draw-param entry.
     * @param drawParam Payload forwarded by the WebGL model wrapper.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeWebGLDrawParam.prototype.setDrawParam = function (drawParam: unknown): void {
      this.calls.push(['setDrawParam', [drawParam]])
    }
    /**
     * Records WebGL matrix assignment.
     * @param matrix Matrix payload forwarded by the wrapper.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeWebGLDrawParam.prototype.setMatrix = function (matrix: unknown): void {
      this.calls.push(['setMatrix', [matrix]])
    }
    /**
     * Records WebGL premultiplied-alpha assignment.
     * @param enabled Whether premultiplied-alpha mode is enabled.
     * @returns Nothing; call data and local state are updated.
     */
    FakeWebGLDrawParam.prototype.setPremultipliedAlpha = function (enabled: boolean): void {
      this.premultipliedAlpha = enabled
      this.calls.push(['setPremultipliedAlpha', [enabled]])
    }
    /**
     * Reads the fake WebGL premultiplied-alpha state.
     * @returns Current fake premultiplied-alpha flag.
     */
    FakeWebGLDrawParam.prototype.isPremultipliedAlpha = function (): boolean {
      this.calls.push(['isPremultipliedAlpha', []])
      return this.premultipliedAlpha
    }
    /**
     * Records WebGL anisotropy assignment.
     * @param anisotropy Anisotropy value forwarded by the wrapper.
     * @returns Nothing; call data is stored on the fake draw parameter.
     */
    FakeWebGLDrawParam.prototype.setAnisotropy = function (anisotropy: number): void {
      this.calls.push(['setAnisotropy', [anisotropy]])
    }
    /**
     * Reads the fake WebGL anisotropy value.
     * @returns Deterministic anisotropy value.
     */
    FakeWebGLDrawParam.prototype.getAnisotropy = function (): number {
      this.calls.push(['getAnisotropy', []])
      return 9
    }

    const live2DProfile = {
      /**
       * Resolves a fake WebGL context for the requested registry index.
       * @param glIndex GL context registry index requested by the wrapper.
       * @returns Fake GL context object.
       */
      getGL(glIndex?: number) {
        live2DCalls.push(['getGL', [glIndex]])
        return { glIndex } as never
      },
      /**
       * Records writes to the legacy default GL registry slot.
       * @param gl WebGL context forwarded by `Live2DModelWebGL.setGL`.
       * @returns Nothing; call data is stored for assertions.
       */
      setGL(gl: unknown) {
        live2DCalls.push(['setGL', [gl]])
      },
    }

    const wrappers = createCubism2ModelWrappers({
      CanvasDrawParam: FakeCanvasDrawParam as never,
      Live2D: live2DProfile,
      Live2DModelBase: FakeModelBase as never,
      UtDebug: {
        /**
         * Records warning messages produced by null draw-param guards.
         * @param message Legacy warning message.
         * @returns Nothing; message text is stored for assertions.
         */
        logWithLegacyPrefix(message: string) {
          debugMessages.push(message)
        },
      },
      WebGLDrawParam: FakeWebGLDrawParam as never,
      isBootstrapping: () => isBootstrapping,
    })

    baseConstructorTargets.length = 0

    const modelJSConstructor = wrappers.Live2DModelJS
    const modelWebGLConstructor = wrappers.Live2DModelWebGL

    const emptyJSModel = modelJSConstructor.createEmptyModel()
    const emptyWebGLModel = modelWebGLConstructor.createEmptyModel()

    expect(emptyJSModel.getDrawParam()).toBe(emptyJSModel.drawParamCanvas)
    expect(emptyWebGLModel.getDrawParam()).toBe(emptyWebGLModel.drawParamWebGL)
    expect(loaderCalls).toEqual([])

    const jsModel = wrappers.Live2DModelJS.loadModel(mocBuffer)

    expect(loaderCalls[0]).toEqual({ model: jsModel, sourceBuffer: mocBuffer })
    expect(jsModel.getDrawParam()).toBe(jsModel.drawParamCanvas)

    jsModel.setGL('canvas-renderer' as never)
    jsModel.setTransform('canvas-transform')
    jsModel.setTexture(2, 'canvas-texture')
    jsModel.draw()
    jsModel.releaseRendererTextures()
    expect(jsModel.getTextureCount()).toBe(41)
    expect(jsModel.setDrawParam('canvas-ds-semantic')).toBeUndefined()
    jsModel.releaseRendererTextures()

    const jsDrawParam = jsModel.drawParamCanvas as unknown as { calls: Array<[string, unknown[]]> }
    const jsModelContext = jsModel.modelContext as unknown as {
      calls: Array<[string, unknown[]]>
    }

    expect(jsModel.getTextureCount()).toBe(41)
    expect(jsModel.setDrawParam('canvas-ds')).toBeUndefined()
    expect(jsDrawParam.calls).toEqual([
      ['setGL', ['canvas-renderer']],
      ['setTransform', ['canvas-transform']],
      ['setTexture', [2, 'canvas-texture']],
      ['releaseRendererTextures', []],
      ['getTextureCount', []],
      ['setDrawParam', ['canvas-ds-semantic']],
      ['releaseRendererTextures', []],
      ['getTextureCount', []],
      ['setDrawParam', ['canvas-ds']],
    ])
    expect(jsModelContext.calls).toEqual([['draw', [jsModel.drawParamCanvas]]])

    const defaultWebGLModel = wrappers.Live2DModelWebGL.loadModel(mocBuffer)
    const indexedWebGLModel = wrappers.Live2DModelWebGL.loadModel(mocBuffer, 7)
    const defaultWebGLInstance = webglInstances[webglInstances.length - 2]
    const indexedWebGLInstance = webglInstances[webglInstances.length - 1]
    const defaultLoaderCall = loaderCalls[loaderCalls.length - 2]
    const indexedLoaderCall = loaderCalls[loaderCalls.length - 1]

    expect(defaultWebGLInstance?.glIndex).toBe(0)
    expect(indexedWebGLInstance?.glIndex).toBe(7)
    expect(live2DCalls).toContainEqual(['getGL', [0]])
    expect(live2DCalls).toContainEqual(['getGL', [7]])
    expect(defaultLoaderCall).toEqual({ model: defaultWebGLModel, sourceBuffer: mocBuffer })
    expect(indexedLoaderCall).toEqual({ model: indexedWebGLModel, sourceBuffer: mocBuffer })

    indexedWebGLModel.setTransform('webgl-transform')
    indexedWebGLModel.setTexture(3, 'webgl-texture')
    indexedWebGLModel.update()
    indexedWebGLModel.draw()
    indexedWebGLModel.releaseRendererTextures()
    indexedWebGLModel.releaseRendererTextures()
    indexedWebGLModel.setMatrix('matrix')
    indexedWebGLModel.setPremultipliedAlpha(true)
    indexedWebGLModel.setAnisotropy(8)
    indexedWebGLModel.setGL('replacement-gl' as never)

    expect(indexedWebGLModel.getTextureCount()).toBe(42)
    expect(indexedWebGLModel.setDrawParam('webgl-ds-semantic')).toBeUndefined()
    expect(indexedWebGLModel.getTextureCount()).toBe(42)
    expect(indexedWebGLModel.setDrawParam('webgl-ds')).toBeUndefined()
    expect(indexedWebGLModel.isPremultipliedAlpha()).toBe(true)
    expect(indexedWebGLModel.getAnisotropy()).toBe(9)
    const indexedWebGLDrawParam = indexedWebGLModel.drawParamWebGL as unknown as {
      calls: Array<[string, unknown[]]>
    }
    const indexedWebGLContext = indexedWebGLModel.modelContext as unknown as {
      calls: Array<[string, unknown[]]>
    }

    expect(indexedWebGLDrawParam.calls).toEqual([
      ['setGL', [{ glIndex: 7 }]],
      ['setTransform', ['webgl-transform']],
      ['setTexture', [3, 'webgl-texture']],
      ['releaseRendererTextures', []],
      ['releaseRendererTextures', []],
      ['setMatrix', ['matrix']],
      ['setPremultipliedAlpha', [true]],
      ['setAnisotropy', [8]],
      ['getTextureCount', []],
      ['setDrawParam', ['webgl-ds-semantic']],
      ['getTextureCount', []],
      ['setDrawParam', ['webgl-ds']],
      ['isPremultipliedAlpha', []],
      ['getAnisotropy', []],
    ])
    expect(indexedWebGLContext.calls).toEqual([
      ['update', []],
      ['preDraw', [indexedWebGLModel.drawParamWebGL]],
      ['draw', [indexedWebGLModel.drawParamWebGL]],
    ])
    expect(live2DCalls).toContainEqual(['setGL', ['replacement-gl']])

    baseConstructorTargets.length = 0
    const canvasCountBeforeBootstrap = canvasInstances.length
    const webglCountBeforeBootstrap = webglInstances.length
    isBootstrapping = true

    const bootstrapJSModel = new wrappers.Live2DModelJS()
    const bootstrapWebGLModel = new wrappers.Live2DModelWebGL(5)

    expect(baseConstructorTargets).toEqual([])
    expect(canvasInstances).toHaveLength(canvasCountBeforeBootstrap)
    expect(webglInstances).toHaveLength(webglCountBeforeBootstrap)
    expect(bootstrapJSModel.drawParamCanvas).toBeUndefined()
    expect(bootstrapWebGLModel.drawParamWebGL).toBeUndefined()
    expect(debugMessages).toEqual([])
  })

  it('keeps Cubism2 parts data in a separate module with link-record handoff semantics', () => {
    const partsConstructors = createCubism2PartsData({
      isBootstrapping: () => false,
    })
    const bootstrappingPartsConstructors = createCubism2PartsData({
      isBootstrapping: () => true,
    })
    const partsData = new partsConstructors.Cubism2PartsData()
    const prototypeBootstrapPartsData = new bootstrappingPartsConstructors.Cubism2PartsData()
    const partsId = { id: 'PartArm' }
    const nextPartsId = { id: 'PartHead' }
    const baseData = { kind: 'base-data' }
    const drawData = { kind: 'draw-data' }
    const bitValues = [true, false]
    const objectValues: unknown[] = [partsId, [baseData], [drawData]]
    const reader = {
      /**
       * Reads the next boolean flag from the fake parts-data payload.
       * @returns The legacy flag first and the visible flag second, matching type tag 133.
       */
      readBit() {
        return bitValues.shift() ?? false
      },
      /**
       * Reads the next object field from the fake parts-data payload.
       * @returns Parts ID, base-data list, then draw-data list in parser order.
       */
      readObject() {
        return objectValues.shift() ?? null
      },
    }

    expect(partsConstructors.Cubism2PartsData.instanceCount).toBe(1)
    partsConstructors.Cubism2PartsData.instanceCount = 23
    expect(partsConstructors.Cubism2PartsData.instanceCount).toBe(23)

    partsData.readPartsData(reader)

    expect(partsData.getLegacyFlag()).toBe(true)
    expect(partsData.isVisible()).toBe(false)
    expect(partsData.legacyFlag).toBe(true)
    expect(partsData.partsId).toBe(partsId)
    expect(partsData.getPartsID()).toBe(partsId)
    expect(partsData.getPartsIDForModelLookup()).toBe(partsData.getPartsID())
    expect(partsData.getBaseDataList()).toEqual([baseData])
    expect(partsData.getDrawDataList()).toEqual([drawData])

    const hiddenContext = partsData.createPartsContext({})

    expect(hiddenContext.partsData).toBe(partsData)
    expect(hiddenContext.getPartsOpacity()).toBe(0)

    partsData.setVisible(true)

    const visibleContext = partsData.createPartsContext({})

    expect(visibleContext.getPartsOpacity()).toBe(1)

    partsData.initializePartsDataLists()
    partsData.addBaseData(baseData)
    partsData.addDrawData(drawData)
    partsData.setPartsIDViaObSlot(nextPartsId)
    partsData.setLegacyFlag(false)

    expect(partsData.getBaseDataList()).toEqual([baseData])
    expect(partsData.getDrawDataList()).toEqual([drawData])
    expect(partsData.getPartsID()).toBe(nextPartsId)
    expect(partsData.getLegacyFlag()).toBe(false)

    partsData.setPartsIDViaMpSlot(partsId)
    partsData.setVisible(false)

    expect(partsData.partsId).toBe(partsId)
    expect(partsData.isVisible()).toBe(false)

    const linkedBaseData = [{ kind: 'linked-base-data' }]
    const linkedDrawData = [{ kind: 'linked-draw-data' }]
    const linkRecordCountBefore = partsConstructors.Cubism2PartsDataLinkRecord.recordCount
    const linkRecord = new partsConstructors.Cubism2PartsDataLinkRecord()
    const linkObjectValues: unknown[] = [partsId, linkedDrawData, linkedBaseData]
    const linkReader = {
      /**
       * Satisfies the shared reader shape; link records do not consume boolean flags.
       * @returns False if accidentally called by the link-record reader.
       */
      readBit() {
        return false
      },
      /**
       * Reads the next object field from the fake link-record payload.
       * @returns Parts ID, draw-data list, then base-data list in type tag 142 order.
       */
      readObject() {
        return linkObjectValues.shift() ?? null
      },
    }

    expect(partsConstructors.Cubism2PartsDataLinkRecord.recordCount).toBe(
      linkRecordCountBefore + 1,
    )
    partsConstructors.Cubism2PartsDataLinkRecord.recordCount = 17
    expect(partsConstructors.Cubism2PartsDataLinkRecord.recordCount).toBe(17)

    linkRecord.readPartsDataLinks(linkReader)

    expect(linkRecord.getBaseDataList()).toBe(linkedBaseData)
    expect(linkRecord.getDrawDataList()).toBe(linkedDrawData)

    linkRecord.transferAndClearListsToPartsData(partsData)

    expect(partsData.getBaseDataList()).toBe(linkedBaseData)
    expect(partsData.getDrawDataList()).toBe(linkedDrawData)
    expect(linkRecord.getBaseDataList()).toBeNull()
    expect(linkRecord.getDrawDataList()).toBeNull()
    expect(Object.prototype.hasOwnProperty.call(prototypeBootstrapPartsData, 'partsId')).toBe(false)
  })

  it('restores Cubism2 parts-data reader payload names while preserving read order', () => {
    const partsDataSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/compatibility/partsData.ts',
      ),
      'utf-8',
    )

    expect(partsDataSource).toContain('interface Cubism2PartsDataPayload')
    expect(partsDataSource).toContain('interface Cubism2PartsDataLinkPayload')
    expect(partsDataSource).toContain('readCubism2PartsDataPayload')
    expect(partsDataSource).toContain('applyCubism2PartsDataPayload')
    expect(partsDataSource).toContain('readCubism2PartsDataLinkPayload')
    expect(partsDataSource).toContain('applyCubism2PartsDataLinkPayload')

    const partsConstructors = createCubism2PartsData({
      isBootstrapping: () => false,
    })
    const partsData = new partsConstructors.Cubism2PartsData()
    const partsReadOrder: string[] = []
    const partsId = { id: 'PartBody' }
    const baseDataList = [{ kind: 'base-data' }]
    const drawDataList = [{ kind: 'draw-data' }]
    const partBits = [false, true]
    const partObjects: unknown[] = [partsId, baseDataList, drawDataList]

    partsData.readPartsData({
      /**
       * Reads type-133 boolean fields in the min.js order: legacy flag, then visibility.
       * @returns Next boolean from the fake type-133 parts-data payload.
       */
      readBit() {
        partsReadOrder.push('bit')
        return partBits.shift() ?? false
      },
      /**
       * Reads type-133 object fields in the min.js order: parts id, base list, draw list.
       * @returns Next object from the fake type-133 parts-data payload.
       */
      readObject() {
        partsReadOrder.push('object')
        return partObjects.shift() ?? null
      },
    })

    expect(partsReadOrder).toEqual(['bit', 'bit', 'object', 'object', 'object'])
    expect(partsData.getLegacyFlag()).toBe(false)
    expect(partsData.isVisible()).toBe(true)
    expect(partsData.getPartsID()).toBe(partsId)
    expect(partsData.getBaseDataList()).toBe(baseDataList)
    expect(partsData.getDrawDataList()).toBe(drawDataList)

    const linkRecord = new partsConstructors.Cubism2PartsDataLinkRecord()
    const linkReadOrder: string[] = []
    const linkedPartsId = { id: 'LinkedPart' }
    const linkedDrawDataList = [{ kind: 'linked-draw-data' }]
    const linkedBaseDataList = [{ kind: 'linked-base-data' }]
    const linkObjects: unknown[] = [linkedPartsId, linkedDrawDataList, linkedBaseDataList]

    linkRecord.readPartsDataLinks({
      /**
       * Satisfies the shared parts-data reader contract; type-142 payloads do not consume bits.
       * @returns False if a broken link-record reader accidentally asks for a bit.
       */
      readBit() {
        linkReadOrder.push('bit')
        return false
      },
      /**
       * Reads type-142 object fields in the min.js order: parts id, draw list, base list.
       * @returns Next object from the fake type-142 link-record payload.
       */
      readObject() {
        linkReadOrder.push('object')
        return linkObjects.shift() ?? null
      },
    })

    expect(linkReadOrder).toEqual(['object', 'object', 'object'])
    expect(linkRecord.partsId).toBe(linkedPartsId)
    expect(linkRecord.getDrawDataList()).toBe(linkedDrawDataList)
    expect(linkRecord.getBaseDataList()).toBe(linkedBaseDataList)

    const handoffPartsData = new partsConstructors.Cubism2PartsData()
    const setBaseDataListSpy = vi.spyOn(handoffPartsData, 'setBaseDataList')
    const setDrawDataListSpy = vi.spyOn(handoffPartsData, 'setDrawDataList')
    linkRecord.transferAndClearListsToPartsData(handoffPartsData)

    expect(setBaseDataListSpy).toHaveBeenCalledWith(linkedBaseDataList)
    expect(setDrawDataListSpy).toHaveBeenCalledWith(linkedDrawDataList)
    expect(setBaseDataListSpy.mock.invocationCallOrder[0]).toBeLessThan(
      setDrawDataListSpy.mock.invocationCallOrder[0]!,
    )
    expect(handoffPartsData.getBaseDataList()).toBe(linkedBaseDataList)
    expect(handoffPartsData.getDrawDataList()).toBe(linkedDrawDataList)
    expect(linkRecord.getBaseDataList()).toBeNull()
    expect(linkRecord.getDrawDataList()).toBeNull()
  })

  it('keeps Cubism2 draw data in a separate module with mesh context semantics', () => {
    class FakeParamBindingSet {
      /**
       * Records that the mesh reader initialized this binding list before payload replacement.
       */
      initialized = false

      /**
       * Records that the interpolation path asked whether parameters changed.
       */
      changedCheckCount = 0

      /**
       * Records interpolation table setup calls; this path is unused by the draw-data test.
       * @param indexBuffer Legacy interpolation corner index buffer.
       * @param weightBuffer Legacy interpolation corner weight buffer.
       * @param dimensionCount Number of bound parameter dimensions.
       */
      buildInterpolationCorners(
        indexBuffer: ArrayLike<number>,
        weightBuffer: ArrayLike<number>,
        dimensionCount: number,
      ) {
        void indexBuffer
        void weightBuffer
        void dimensionCount
      }

      /**
       * Reports that mesh parameters changed so the test exercises vertex interpolation.
       * @param modelContext Runtime model context supplied by the draw-data updater.
       * @returns True so updateDrawContext continues through the interpolation branch.
       */
      hasChangedParams(modelContext: unknown) {
        void modelContext
        this.changedCheckCount += 1
        return true
      }

      /**
       * Marks the fake binding set as initialized by `initMeshStorage`.
       */
      initBindingList() {
        this.initialized = true
      }

      /**
       * Supplies a deterministic interpolation weight index; this path is unused by the test.
       * @param modelContext Runtime model context supplied by generic interpolation helpers.
       * @param dirtyFlagRef Mutable dirty flag reference.
       * @returns Zero so callers can index the first interpolation corner if accidentally used.
       */
      resolveInterpolationWeights(modelContext: unknown, dirtyFlagRef: boolean[]) {
        void modelContext
        dirtyFlagRef[0] = false
        return 0
      }
    }

    const drawOrderInterpolator = vi.fn(
      (
        modelContext: unknown,
        paramBindingSet: unknown,
        dirtyFlagRef: boolean[],
        sourceValues: number[] | null,
      ) => {
        void modelContext
        void paramBindingSet
        dirtyFlagRef[0] = false
        return sourceValues?.[1] ?? 0
      },
    )
    const opacityInterpolator = vi.fn(
      (
        modelContext: unknown,
        paramBindingSet: unknown,
        dirtyFlagRef: boolean[],
        sourceValues: number[] | null,
      ) => {
        void modelContext
        void paramBindingSet
        dirtyFlagRef[0] = false
        return sourceValues?.[0] ?? 1
      },
    )
    const pointInterpolator = vi.fn(
      (
        modelContext: unknown,
        paramBindingSet: unknown,
        dirtyFlagRef: boolean[],
        pointCount: number,
        pointValues: number[][] | null,
        outputPoints: Float32Array | null,
        valueOffset: number,
        tupleStride: number,
      ) => {
        void modelContext
        void paramBindingSet
        dirtyFlagRef[0] = false
        const sourcePointValues = pointValues![0]!
        for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
          const pointOffset = pointIndex << 1
          const tupleOffset = pointIndex * tupleStride + valueOffset
          outputPoints![tupleOffset] = sourcePointValues[pointOffset]! + 10
          outputPoints![tupleOffset + 1] = sourcePointValues[pointOffset + 1]! + 10
        }
      },
    )
    const emptyBaseDataId = { id: 'DST_BASE' }
    const targetBaseDataId = { id: 'BaseHead' }
    const debugLog = vi.fn()
    const drawConstructors = createCubism2DrawData({
      BaseDataID: createTestBaseDataIdDependency(emptyBaseDataId),
      Cubism2DrawContextBase: createCubism2DrawContextBase({
        isBootstrapping: () => false,
      }),
      Cubism2MocVersion: {
        MAX_SUPPORTED_FORMAT_VERSION: 2,
        LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 2,
      },
      Cubism2ParamBindingSet: FakeParamBindingSet,
      Cubism2RuntimeConstants: {
        FLIP_MODEL_SPACE_UV_Y: true,
        MODEL_SPACE_COORDINATE_MODE: 1,
        POINT_TUPLE_SIZE: 5,
        POINT_X_OFFSET: 0,
        SDK2_COORDINATE_MODE: 2,
        activeCoordinateMode: 2,
      },
      Live2D: {
        shouldUpdateClippedDrawContextOpacity: false,
        isVerboseLoggingEnabled: () => true,
      },
      UtDebug: {
        /**
         * Captures target-base diagnostics without writing to the test console.
         * @param message Legacy diagnostic message.
         * @param args Legacy printf-style arguments.
         */
        logWithLegacyPrefix(message: string, ...args: unknown[]) {
          debugLog(message, ...args)
        },
      },
      interpolator: {
        interpolatePoints: pointInterpolator,
        interpolateInteger: drawOrderInterpolator,
        interpolateFloat: opacityInterpolator,
      },
      isBootstrapping: () => false,
    })
    const bootstrappingConstructors = createCubism2DrawData({
      BaseDataID: createTestBaseDataIdDependency(emptyBaseDataId),
      Cubism2DrawContextBase: createCubism2DrawContextBase({
        isBootstrapping: () => true,
      }),
      Cubism2MocVersion: {
        MAX_SUPPORTED_FORMAT_VERSION: 2,
        LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 2,
      },
      Cubism2ParamBindingSet: FakeParamBindingSet,
      Cubism2RuntimeConstants: {
        FLIP_MODEL_SPACE_UV_Y: true,
        MODEL_SPACE_COORDINATE_MODE: 1,
        POINT_TUPLE_SIZE: 5,
        POINT_X_OFFSET: 0,
        SDK2_COORDINATE_MODE: 2,
        activeCoordinateMode: 2,
      },
      Live2D: {
        shouldUpdateClippedDrawContextOpacity: false,
        isVerboseLoggingEnabled: () => false,
      },
      UtDebug: {
        /**
         * Ignores prototype bootstrap diagnostics.
         */
        logWithLegacyPrefix() {},
      },
      interpolator: {
        interpolatePoints: pointInterpolator,
        interpolateInteger: drawOrderInterpolator,
        interpolateFloat: opacityInterpolator,
      },
      isBootstrapping: () => true,
    })
    const meshData = new drawConstructors.Cubism2MeshDrawData()
    const bootstrapMeshData = new bootstrappingConstructors.Cubism2MeshDrawData()
    const initializedBindingSet = new FakeParamBindingSet()

    meshData.paramBindingSet = initializedBindingSet
    meshData.initMeshStorage()

    expect((meshData.paramBindingSet as FakeParamBindingSet).initialized).toBe(true)

    const drawDataId = { id: 'DrawFace' }
    const payloadBindingSet = new FakeParamBindingSet()
    const objectValues: unknown[] = [
      drawDataId,
      targetBaseDataId,
      payloadBindingSet,
      { id: 'DrawMaskA,DrawMaskB' },
      [2, 1, 0],
      [[1, 2, 3, 4]],
      [0.1, 0.2, 0.3, 0.4],
    ]
    const intValues = [2, 4, 2, 1, 35, 7]
    const reader = {
      /**
       * Selects the v2.1+ branch for clipping IDs and mesh draw flags.
       * @returns Cubism2 fake format version.
       */
      getFormatVersion() {
        return 2
      },
      /**
       * Reads the next float array from the fake shared draw-data payload.
       * @returns Opacity interpolation values.
       */
      readFloat32Array() {
        return [0.5, 0.75]
      },
      /**
       * Reads the next integer field from the fake mesh payload.
       * @returns Draw-order point count, texture, vertex count, triangle count, flags, then extended flag.
       */
      readInt32() {
        return intValues.shift()!
      },
      /**
       * Reads authored draw-order interpolation values.
       * @returns Draw-order values that update static min and max bounds.
       */
      readInt32Array() {
        return [-2, 505]
      },
      /**
       * Reads the next object field from the fake draw-data payload.
       * @returns Draw IDs, target base ID, binding set, clip ID, indices, vertex points, then UVs.
       */
      readObject() {
        return objectValues.shift() ?? null
      },
    }

    meshData.readMeshDrawData(reader)

    expect(meshData.getType()).toBe(drawConstructors.Cubism2DrawDataBase.TYPE_MESH)
    expect(meshData.getDrawDataID()).toBe(drawDataId)
    expect(meshData.drawDataId).toBe(drawDataId)
    expect(meshData.getTargetBaseDataID()).toBe(targetBaseDataId)
    expect(meshData.targetBaseDataId).toBe(targetBaseDataId)
    expect(meshData.getClipIDList()).toEqual(['DrawMaskA,DrawMaskB'])
    expect(meshData.getTextureNo()).toBe(4)
    expect(meshData.getNumPoints()).toBe(2)
    expect(meshData.getIndexArray()).toEqual(new Int16Array([2, 1, 0]))
    expect(meshData.getUVCoordinates()).toEqual([0.1, 0.2, 0.3, 0.4])
    expect(meshData.getDrawFlagBits()).toBe(35)
    expect(meshData.getDrawFlagOption('extendedFlagValue')).toBe(7)
    expect(meshData.blendMode).toBe(drawConstructors.Cubism2MeshDrawData.BLEND_ADD)
    expect(meshData.culling).toBe(false)
    expect(drawConstructors.Cubism2DrawDataBase.getMinDrawOrder()).toBe(-2)
    expect(drawConstructors.Cubism2DrawDataBase.getMaxDrawOrder()).toBe(505)
    drawConstructors.Cubism2DrawDataBase.trackDrawOrderBounds([-9, 640])
    expect(drawConstructors.Cubism2DrawDataBase.getMinDrawOrder()).toBe(-9)
    expect(drawConstructors.Cubism2DrawDataBase.getMaxDrawOrder()).toBe(640)
    expect(Object.prototype.hasOwnProperty.call(bootstrapMeshData, 'textureNo')).toBe(false)

    const drawContext = meshData.createDrawContext()

    expect(drawContext.getSourceDrawData()).toBe(meshData)
    expect(drawContext.localPoints).toEqual(
      new Float32Array([0.1, 0.2, 0, 0, 0, 0.3, 0.4, 0, 0, 0]),
    )
    expect(drawContext.targetSpacePoints).toEqual(
      new Float32Array([0.1, 0.2, 0, 0, 0, 0.3, 0.4, 0, 0, 0]),
    )
    expect(drawContext.getTransformedPoints()).toBe(drawContext.targetSpacePoints)

    const targetBaseTransform = vi.fn(
      (
        modelContext: unknown,
        targetBaseContext: unknown,
        inputPoints: Float32Array | null,
        outputPoints: Float32Array | null,
        pointCount: number,
        valueOffset: number,
        tupleStride: number,
      ) => {
        void modelContext
        void targetBaseContext
        for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
          const tupleOffset = pointIndex * tupleStride + valueOffset
          outputPoints![tupleOffset] = inputPoints![tupleOffset]! + 100
          outputPoints![tupleOffset + 1] = inputPoints![tupleOffset + 1]! + 100
        }
      },
    )
    const modelContext = {
      /**
       * Reads the target base context used for opacity and transform availability.
       * @param baseDataIndex Resolved target base-data index.
       * @returns Fake base context with transform and opacity hooks.
       */
      getBaseContext(baseDataIndex: number) {
        expect(baseDataIndex).toBe(3)
        return {
          /**
           * Supplies deterministic base opacity for final draw opacity.
           * @returns Base opacity multiplier.
           */
          getTotalOpacity() {
            return 0.6
          },
          /**
           * Keeps the target-base transform branch enabled.
           * @returns False so mesh points are transformed by the target base data.
           */
          hasTransform() {
            return false
          },
        }
      },
      /**
       * Reads the target base data transformer for the resolved target index.
       * @param baseDataIndex Resolved target base-data index.
       * @returns Fake transformer that copies local points into target space with an offset.
       */
      getBaseData(baseDataIndex: number) {
        expect(baseDataIndex).toBe(3)
        return {
          transformPoints: targetBaseTransform,
        }
      },
      /**
       * Resolves the parsed target base-data ID into a model-context index.
       * @param baseDataId Parsed target base-data ID.
       * @returns Stable fake target base-data index.
       */
      getBaseDataIndex(baseDataId: unknown) {
        expect(baseDataId).toBe(targetBaseDataId)
        return 3
      },
      /** @returns Scratch interpolation indexes required by the mesh update contract. */
      getScratchIndexBuffer() {
        return new Int16Array(4)
      },
      /** @returns Scratch interpolation weights required by the mesh update contract. */
      getScratchWeightBuffer() {
        return new Float32Array(4)
      },
      /** @returns Stable parameter-cache generation for the fake mesh update. */
      getParamCacheGeneration() {
        return 0
      },
      /** @returns Fake parameter value; mocked interpolators do not consume it. */
      getParamFloat() {
        return 0
      },
      /** @returns Fake parameter index; mocked interpolators do not consume it. */
      getParamIndex() {
        return 0
      },
      /** @returns False after the fake model has completed initialization. */
      isInitialParamUpdatePending() {
        return false
      },
      /** @returns True so the mesh interpolation branch remains active. */
      isParamChanged() {
        return true
      },
    }

    meshData.updateDrawContext(modelContext, drawContext)

    expect(payloadBindingSet.changedCheckCount).toBe(1)
    expect(drawOrderInterpolator).toHaveBeenCalled()
    expect(opacityInterpolator).toHaveBeenCalled()
    expect(pointInterpolator).toHaveBeenCalled()
    expect(drawContext.drawOrder).toBe(505)
    expect(drawContext.interpolatedOpacity).toBe(0.5)
    expect(drawContext.localPoints).toEqual(new Float32Array([11, 12, 0, 0, 0, 13, 14, 0, 0, 0]))

    meshData.applyDrawContext(modelContext, drawContext)

    expect(targetBaseTransform).toHaveBeenCalled()
    expect(drawContext.baseOpacity).toBe(0.6)
    expect(drawContext.isActive).toBe(true)
    expect(drawContext.targetSpacePoints).toEqual(
      new Float32Array([111, 112, 0, 0, 0, 113, 114, 0, 0, 0]),
    )

    meshData.writeDrawOrderToPointBuffer(modelContext, drawContext, 9)

    expect(drawContext.targetSpacePoints![4]).toBe(9)
    expect(drawContext.targetSpacePoints![9]).toBe(9)

    const drawTexture = vi.fn()
    const drawParam = {
      /**
       * Records culling mode selected by the mesh draw flags.
       * @param culling Whether back-face culling should be enabled.
       */
      setCulling(culling: boolean) {
        expect(culling).toBe(false)
      },
      drawTexture,
      /**
       * Records the clipping context passed into the draw parameter.
       * @param clipContext Current clipping mask context.
       */
      setClipBufPre_clipContextForDraw(clipContext: unknown) {
        expect(clipContext).toBeNull()
      },
    }

    drawContext.partsOpacity = 1
    meshData.draw(drawParam, modelContext, drawContext)

    expect(drawTexture).toHaveBeenCalledWith(
      4,
      3,
      new Int16Array([2, 1, 0]),
      drawContext.targetSpacePoints,
      [0.1, 0.2, 0.3, 0.4],
      0.3,
      drawConstructors.Cubism2MeshDrawData.BLEND_ADD,
      drawContext,
    )
    expect(debugLog).not.toHaveBeenCalled()
  })

  it('keeps Cubism2 draw parameter base in a separate module with shared draw-state semantics', () => {
    /**
     * Reports that constructor bootstrap is complete for runtime-state behavior checks.
     * @returns False so constructors initialize their normal runtime fields.
     */
    function isRuntimeBootstrapping(): boolean {
      return false
    }

    const live2DProfile = {
      L2D_COLOR_BLEND_MODE_MULT: 42,
    }
    const drawParamConstructors = createCubism2DrawParamBase({
      Live2D: live2DProfile,
      isBootstrapping: isRuntimeBootstrapping,
    })
    const bootstrappingConstructors = createCubism2DrawParamBase({
      Live2D: {
        L2D_COLOR_BLEND_MODE_MULT: 99,
      },
      /**
       * Reports prototype bootstrap mode for constructor side-effect checks.
       * @returns True so constructors leave instance fields uninitialized.
       */
      isBootstrapping() {
        return true
      },
    })
    const drawParam = new drawParamConstructors.Cubism2DrawParamBase()
    const bootstrapDrawParam = new bootstrappingConstructors.Cubism2DrawParamBase()
    live2DProfile.L2D_COLOR_BLEND_MODE_MULT = 77
    const channelColor = new drawParamConstructors.Cubism2RgbaColor()
    const matrixValues = Array.from({ length: 16 }, (_value, index) => index + 0.5)
    const maskContext = { kind: 'mask-context' }
    const drawContext = { kind: 'draw-context' }

    expect(drawParamConstructors.Cubism2DrawParamBase.CLIPPING_PROCESS_NONE).toBe(0)
    expect(drawParamConstructors.Cubism2DrawParamBase.CLIPPING_PROCESS_OVERWRITE_ALPHA).toBe(1)
    expect(drawParamConstructors.Cubism2DrawParamBase.CLIPPING_PROCESS_MULTIPLY_ALPHA).toBe(2)
    expect(drawParamConstructors.Cubism2DrawParamBase.CLIPPING_PROCESS_DRAW).toBe(3)
    expect(drawParamConstructors.Cubism2DrawParamBase.CLIPPING_PROCESS_CLEAR_ALPHA).toBe(4)
    expect(drawParam.culling).toBe(false)
    expect(drawParam.matrix4x4).toEqual(new Float32Array(16))
    expect(drawParam.isPremultipliedAlpha()).toBe(false)
    expect(drawParam.getAnisotropy()).toBe(0)
    expect(drawParam.getClippingProcess()).toBe(
      drawParamConstructors.Cubism2DrawParamBase.CLIPPING_PROCESS_NONE,
    )
    expect(channelColor).toMatchObject({
      a: 1,
      b: 1,
      blendMode: 77,
      g: 1,
      r: 1,
      scale: 1,
    })

    drawParam.setChannelFlagAsColor(2, channelColor)
    drawParam.setBaseColor(-2, 0.5, 2, 0.25)
    drawParam.setCulling(true)
    drawParam.setMatrix(matrixValues)
    drawParam.setPremultipliedAlpha(true)
    drawParam.setAnisotropy(8)
    drawParam.setClippingProcess(drawParamConstructors.Cubism2DrawParamBase.CLIPPING_PROCESS_DRAW)
    drawParam.setClipBufPre_clipContextForMask(maskContext)
    drawParam.setClipBufPre_clipContextForDraw(drawContext)

    expect(drawParam.getChannelFlagAsColor(2)).toBe(channelColor)
    expect(drawParam.baseAlpha).toBe(0)
    expect(drawParam.baseRed).toBe(0.5)
    expect(drawParam.baseGreen).toBe(1)
    expect(drawParam.baseBlue).toBe(0.25)
    expect(drawParam.culling).toBe(true)
    expect(drawParam.getMatrix()).toEqual(new Float32Array(matrixValues))
    expect(drawParam.isPremultipliedAlpha()).toBe(true)
    expect(drawParam.getAnisotropy()).toBe(8)
    expect(drawParam.getClippingProcess()).toBe(
      drawParamConstructors.Cubism2DrawParamBase.CLIPPING_PROCESS_DRAW,
    )
    expect(drawParam.getClipBufPre_clipContextMask()).toBe(maskContext)
    expect(drawParam.getClipBufPre_clipContextDraw()).toBe(drawContext)
    expect(drawParam.getTextureCount()).toBe(-1)
    expect(drawParam.setDrawParam({ kind: 'ignored-semantic' })).toBeUndefined()
    expect(drawParam.getTextureCount()).toBe(-1)
    expect(drawParam.setDrawParam({ kind: 'ignored-secondary' })).toBeUndefined()
    drawParam.setCulling(false)
    expect(drawParam.culling).toBe(false)
    expect(drawParam.getMatrix()).toEqual(new Float32Array(matrixValues))
    expect(drawParam.prepareDrawState()).toBeUndefined()
    expect(drawParam.drawTexture(0, 0, [], [], [], 1, 0)).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(bootstrapDrawParam, 'culling')).toBe(false)
  })

  it('keeps Cubism2 WebGL clipping manager in a separate module with mask layout semantics', () => {
    const live2DProfile = {
      clippingMaskBufferSize: 256,
      frameBuffers: [] as Array<{ framebuffer: unknown }>,
      glContext: [] as unknown[],
    }
    const { Cubism2FloatRectangle } = createCubism2Geometry({
      isBootstrapping: () => false,
    })
    const Cubism2Matrix44 = createCubism2Matrix44({
      Cubism2Math: createCubism2Math(),
    })
    const { Cubism2RgbaColor } = createCubism2DrawParamBase({
      Live2D: {
        L2D_COLOR_BLEND_MODE_MULT: 0,
      },
      isBootstrapping: () => false,
    })
    const Cubism2RuntimeConstants = createCubism2RuntimeConstants()
    const { calls, constants, gl } = createRecordingWebGLContext()
    ;(gl as unknown as { canvas: { height: number; width: number } }).canvas = {
      height: 480,
      width: 640,
    }
    const interleavedCalls: string[] = []
    const originalBindFramebuffer = gl.bindFramebuffer.bind(gl)
    const originalViewport = gl.viewport.bind(gl)
    gl.bindFramebuffer = vi.fn((...args: Parameters<WebGLRenderingContext['bindFramebuffer']>) => {
      interleavedCalls.push(`bindFramebuffer:${String(args[1])}`)
      return originalBindFramebuffer(...args)
    })
    gl.viewport = vi.fn((...args: Parameters<WebGLRenderingContext['viewport']>) => {
      interleavedCalls.push(`viewport:${args.join(',')}`)
      return originalViewport(...args)
    })
    const drawParam = {
      gl,
      glno: 0,
      createFramebuffer: vi.fn(() => ({ framebuffer: { id: 'mask-framebuffer' } })),
      setChannelFlagAsColor: vi.fn(),
      setClipBufPre_clipContextForMask: vi.fn((clipContextArg: unknown) => {
        const marker = clipContextArg == null ? 'null' : 'context'
        interleavedCalls.push(`setMaskContext:${marker}`)
      }),
    }
    const { Cubism2ClippingManager } = createCubism2WebGLClipping({
      Cubism2FloatRectangle,
      Cubism2Matrix44,
      Cubism2RgbaColor,
      Cubism2RuntimeConstants,
      Live2D: live2DProfile,
      UtDebug: {
        logWithLegacyPrefix: vi.fn(),
      },
      isBootstrapping: () => false,
    })
    const { Cubism2ClippingManager: BootstrapClippingManager } = createCubism2WebGLClipping({
      Cubism2FloatRectangle,
      Cubism2Matrix44,
      Cubism2RgbaColor,
      Cubism2RuntimeConstants,
      Live2D: live2DProfile,
      UtDebug: {
        logWithLegacyPrefix: vi.fn(),
      },
      isBootstrapping: () => true,
    })

    live2DProfile.glContext.push(gl)
    const manager = new Cubism2ClippingManager(drawParam)
    const bootstrapManager = new BootstrapClippingManager(drawParam)

    expect(Cubism2ClippingManager.CHANNEL_COUNT).toBe(4)
    expect(Cubism2ClippingManager.RENDER_TEXTURE_USE_MIPMAP).toBe(false)
    expect(Cubism2ClippingManager.NOT_USED_FRAME).toBe(-100)
    expect(manager.curFrameNo).toBe(0)
    expect(drawParam.createFramebuffer).toHaveBeenCalledTimes(1)
    expect(live2DProfile.frameBuffers[0]).toEqual({
      framebuffer: { id: 'mask-framebuffer' },
    })
    expect(drawParam.setChannelFlagAsColor).toHaveBeenCalledTimes(4)
    expect(drawParam.setChannelFlagAsColor.mock.calls.map((call) => call[0])).toEqual([
      0, 1, 2, 3,
    ])
    expect(drawParam.setChannelFlagAsColor.mock.calls.map((call) => call[1])).toMatchObject([
      { a: 1, b: 0, g: 0, r: 0 },
      { a: 0, b: 0, g: 0, r: 1 },
      { a: 0, b: 0, g: 1, r: 0 },
      { a: 0, b: 1, g: 0, r: 0 },
    ])
    expect(Object.prototype.hasOwnProperty.call(bootstrapManager, 'clipContextList')).toBe(false)

    const clipIds = ['mask-a', 'mask-b']
    const drawDataList = [
      {
        getClipIDList: () => clipIds,
        getDrawDataID: () => 'draw-a',
      },
      {
        getClipIDList: () => ['mask-b', 'mask-a'],
        getDrawDataID: () => 'draw-b',
      },
    ]
    const drawContextList = [{ clipBufPre_clipContext: null }, { clipBufPre_clipContext: null }]
    const transformedPointsByIndex: Record<number, number[]> = {
      3: [-2, -1, 4, 5],
      4: [1, 2, 6, 8],
      6: [20, 1, 25, 3],
      7: [0, 0, 0, 0],
    }
    const drawDataIndexCalls: unknown[] = []
    const maskDrawCalls: Array<[number, unknown, unknown, unknown]> = []

    /**
     * Creates one mask drawable that records how setupClip invokes its draw hook.
     * @param maskDrawIndex Draw data index resolved from the clipping mask ID list.
     * @returns Draw-data object with the Cubism2 mask draw hook.
     */
    function createMaskDrawData(maskDrawIndex: number): {
      draw: (drawParamArg: unknown, modelContextArg: unknown, drawContextArg: unknown) => void
    } {
      return {
        /**
         * Records one mask drawable invocation from `setupClip`.
         * @param drawParamArg WebGL draw parameter forwarded by the clipping manager.
         * @param modelContextArg Runtime model context forwarded to the drawable.
         * @param drawContextArg Draw context looked up for the mask drawable index.
         * @returns Nothing; appends an invocation tuple for assertions.
         */
        draw(drawParamArg: unknown, modelContextArg: unknown, drawContextArg: unknown): void {
          maskDrawCalls.push([maskDrawIndex, drawParamArg, modelContextArg, drawContextArg])
        },
      }
    }

    /**
     * Returns the mask drawable for the draw-data index requested by setupClip.
     * @param drawDataIndex Runtime draw-data index from `clippingMaskDrawIndexList`.
     * @returns Drawable object whose draw method records the invocation.
     */
    function getMaskDrawData(drawDataIndex: number): ReturnType<typeof createMaskDrawData> {
      return createMaskDrawData(drawDataIndex)
    }

    const getDrawData = vi.fn(getMaskDrawData)
    const modelContext = {
      getDrawContext(drawDataIndex: number) {
        return {
          getTransformedPoints: () => transformedPointsByIndex[drawDataIndex] ?? [],
          isRenderable: () => true,
        }
      },
      getDrawData,
      getDrawDataIndex(drawDataId: unknown) {
        drawDataIndexCalls.push(drawDataId)
        const drawDataKey = String(drawDataId)
        if (drawDataKey === 'mask-a') {
          return 1
        }
        if (drawDataKey === 'mask-b') {
          return 2
        }
        if (drawDataKey === 'draw-a') {
          return 3
        }
        if (drawDataKey === 'draw-b') {
          return 4
        }
        return 5
      },
      model: {
        getModelImpl() {
          return {
            getCanvasHeight: () => 20,
            getCanvasWidth: () => 10,
          }
        },
      },
    }

    manager.init(modelContext, drawDataList, drawContextList)

    expect(manager.clipContextList).toHaveLength(1)
    expect(drawContextList[0]!.clipBufPre_clipContext).toBe(manager.clipContextList[0])
    expect(drawContextList[1]!.clipBufPre_clipContext).toBe(manager.clipContextList[0])
    const clipContext = manager.clipContextList[0]!

    manager.colorBuffer = 77
    expect(manager.getColorBuffer()).toBe(77)
    expect(manager.findSameClip(['mask-a', 'mask-b'])).toBe(manager.clipContextList[0])
    expect(manager.findSameClip(['mask-b', 'mask-a'])).toBe(manager.clipContextList[0])
    expect(manager.findSameClip(['mask-a'])).toBeNull()
    expect(manager.findSameClip(['mask-c'])).toBeNull()

    const duplicateClipContext = {
      ...clipContext,
      clipIDList: [1, 1],
    }
    manager.clipContextList.push(duplicateClipContext)
    expect(manager.findSameClip([1, 2])).toBe(duplicateClipContext)
    manager.clipContextList.pop()

    const looseClipContext = {
      ...clipContext,
      clipIDList: [1, '2'],
    }
    manager.clipContextList.push(looseClipContext)
    expect(manager.findSameClip(['1', 2])).toBe(looseClipContext)
    manager.clipContextList.pop()

    expect(clipContext.clipIDList).toBe(clipIds)
    expect(clipContext.clippingMaskDrawIndexList).toEqual([1, 2])
    expect(clipContext.clippedDrawContextList).toEqual([
      {
        drawDataId: 'draw-a',
        drawDataIndex: 3,
      },
      {
        drawDataId: 'draw-b',
        drawDataIndex: 4,
      },
    ])
    expect(drawDataIndexCalls).toEqual(['mask-a', 'mask-b', 'draw-a', 'draw-b'])
    expect(clipContext.owner).toBe(manager)
    expect(clipContext.layoutChannelNo).toBe(0)
    expect(clipContext.matrixForMask).toEqual(new Float32Array(16))
    expect(clipContext.matrixForDraw).toEqual(new Float32Array(16))

    const inactiveClipContext = {
      allClippedDrawRect: new Cubism2FloatRectangle(),
      clipIDList: ['inactive-mask'],
      clippedDrawContextList: [],
      clippingMaskDrawIndexList: [99],
      isUsing: false,
      layoutBounds: new Cubism2FloatRectangle(),
      layoutChannelNo: -1,
      matrixForDraw: new Float32Array(16),
      matrixForMask: new Float32Array(16),
      owner: manager,
      addClippedDrawData: vi.fn(),
    }
    manager.clipContextList.push(inactiveClipContext)

    calls.splice(0)
    interleavedCalls.splice(0)
    manager.setupClip(modelContext, drawParam)

    expect(calls.map((call) => call.method)).toEqual([
      'getParameter',
      'viewport',
      'bindFramebuffer',
      'clearColor',
      'clear',
      'bindFramebuffer',
      'viewport',
    ])
    expect(calls[0]!.args).toEqual([constants.FRAMEBUFFER_BINDING])
    expect(calls[1]!.args).toEqual([0, 0, live2DProfile.clippingMaskBufferSize, live2DProfile.clippingMaskBufferSize])
    expect(calls[2]!.args).toEqual([constants.FRAMEBUFFER, { id: 'mask-framebuffer' }])
    expect(calls[3]!.args).toEqual([0, 0, 0, 0])
    expect(calls[4]!.args).toEqual([constants.COLOR_BUFFER_BIT])
    expect(calls[5]!.args).toEqual([constants.FRAMEBUFFER, 1])
    expect(calls[6]!.args).toEqual([0, 0, 640, 480])
    expect(interleavedCalls).toEqual([
      'viewport:0,0,256,256',
      'bindFramebuffer:[object Object]',
      'setMaskContext:context',
      'setMaskContext:context',
      'setMaskContext:context',
      'bindFramebuffer:1',
      'setMaskContext:null',
      'viewport:0,0,640,480',
    ])
    expect(drawParam.setClipBufPre_clipContextForMask).toHaveBeenLastCalledWith(null)
    expect(drawParam.setClipBufPre_clipContextForMask.mock.calls).toEqual([
      [clipContext],
      [clipContext],
      [inactiveClipContext],
      [null],
    ])
    expect(getDrawData.mock.calls.map((call) => call[0])).toEqual([1, 2, 99])
    expect(maskDrawCalls.map((call) => call[0])).toEqual([1, 2, 99])
    expect(maskDrawCalls.map((call) => call[1])).toEqual([drawParam, drawParam, drawParam])
    expect(maskDrawCalls.map((call) => call[2])).toEqual([modelContext, modelContext, modelContext])
    expect(maskDrawCalls.map((call) => call[3])).toHaveLength(3)
    expect(Array.from(clipContext.matrixForMask).some((matrixValue) => matrixValue !== 0)).toBe(
      true,
    )
    expect(Array.from(clipContext.matrixForDraw).some((matrixValue) => matrixValue !== 0)).toBe(
      true,
    )
    expect(Array.from(inactiveClipContext.matrixForMask).some((matrixValue) => matrixValue !== 0))
      .toBe(true)
    expect(Array.from(inactiveClipContext.matrixForDraw).some((matrixValue) => matrixValue !== 0))
      .toBe(true)
    expect(inactiveClipContext.isUsing).toBe(false)

    manager.calcClippedDrawTotalBounds(modelContext, clipContext)

    expect(clipContext.isUsing).toBe(true)
    expect(clipContext.allClippedDrawRect).toMatchObject({
      height: 9,
      width: 8,
      x: -2,
      y: -1,
    })

    const invisibleTransformedPoints = vi.fn(() => [9, 9, 10, 10])
    const invisibleModelContext = {
      ...modelContext,
      getDrawContext() {
        return {
          getTransformedPoints: invisibleTransformedPoints,
          isRenderable: () => false,
        }
      },
    }
    manager.calcClippedDrawTotalBounds(invisibleModelContext, clipContext)

    expect(invisibleTransformedPoints).not.toHaveBeenCalled()
    expect(clipContext.isUsing).toBe(false)
    expect(clipContext.allClippedDrawRect).toMatchObject({
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    })

    const emptyPointClipContext = {
      ...clipContext,
      allClippedDrawRect: new Cubism2FloatRectangle(),
      clippedDrawContextList: [
        {
          drawDataId: 'empty-draw',
          drawDataIndex: 5,
        },
      ],
      isUsing: true,
    }
    manager.calcClippedDrawTotalBounds(modelContext, emptyPointClipContext)

    expect(emptyPointClipContext.isUsing).toBe(false)
    expect(emptyPointClipContext.allClippedDrawRect).toMatchObject({
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    })

    const sentinelClipContext = {
      ...clipContext,
      allClippedDrawRect: new Cubism2FloatRectangle(),
      clippedDrawContextList: [
        {
          drawDataId: 'sentinel-draw',
          drawDataIndex: 6,
        },
      ],
      isUsing: true,
    }
    manager.calcClippedDrawTotalBounds(modelContext, sentinelClipContext)

    expect(sentinelClipContext.isUsing).toBe(false)
    expect(sentinelClipContext.allClippedDrawRect).toMatchObject({
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    })

    const zeroSizeClipContext = {
      ...clipContext,
      allClippedDrawRect: new Cubism2FloatRectangle(),
      clippedDrawContextList: [
        {
          drawDataId: 'zero-size-draw',
          drawDataIndex: 7,
        },
      ],
      isUsing: false,
    }
    manager.calcClippedDrawTotalBounds(modelContext, zeroSizeClipContext)

    expect(zeroSizeClipContext.isUsing).toBe(true)
    expect(zeroSizeClipContext.allClippedDrawRect).toMatchObject({
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    })

    manager.setupLayoutBounds(1)

    expect(manager.clipContextList[0]!.layoutChannelNo).toBe(0)
    expect(manager.clipContextList[0]!.layoutBounds).toMatchObject({
      height: 1,
      width: 1,
      x: 0,
      y: 0,
    })

    const extraContexts = Array.from({ length: 32 }, () => ({
      allClippedDrawRect: new Cubism2FloatRectangle(),
      clipIDList: [],
      clippedDrawContextList: [],
      clippingMaskDrawIndexList: [],
      isUsing: true,
      layoutBounds: new Cubism2FloatRectangle(),
      layoutChannelNo: -1,
      matrixForDraw: new Float32Array(16),
      matrixForMask: new Float32Array(16),
      owner: manager,
      addClippedDrawData: vi.fn(),
    }))
    manager.clipContextList.splice(1, 1)
    manager.clipContextList.push(...extraContexts)
    manager.setupLayoutBounds(33)

    expect(manager.clipContextList[0]!.layoutBounds).toMatchObject({
      height: 1 / 3,
      width: 1 / 3,
      x: 0,
      y: 0,
    })
    expect(manager.clipContextList[8]!.layoutBounds).toMatchObject({
      height: 1 / 3,
      width: 1 / 3,
      x: 2 / 3,
      y: 2 / 3,
    })

    expect(() => manager.releaseFramebuffers()).not.toThrow()
    expect(gl.deleteFramebuffer).toHaveBeenCalledWith({ id: 'mask-framebuffer' })
    expect(live2DProfile.frameBuffers).toEqual([])
    expect(live2DProfile.glContext).toEqual([])
    expect(manager.CHANNEL_COLORS).toEqual([])
    expect(manager.tmpBoundsOnModel).toBeNull()
    expect(manager.tmpMatrix2).toBeNull()
    expect(manager.tmpMatrixForDraw).toBeNull()
    expect(manager.tmpMatrixForMask).toBeNull()
    expect(manager.tmpModelToViewMatrix).toBeNull()
  })

  it('preserves Cubism2 WebGL clipping layout bounds branch distribution', () => {
    const live2DProfile = {
      clippingMaskBufferSize: 256,
      frameBuffers: [] as Array<{ framebuffer: unknown }>,
      glContext: [] as unknown[],
    }
    const { Cubism2FloatRectangle } = createCubism2Geometry({
      isBootstrapping: () => false,
    })
    const Cubism2Matrix44 = createCubism2Matrix44({
      Cubism2Math: createCubism2Math(),
    })
    const { Cubism2RgbaColor } = createCubism2DrawParamBase({
      Live2D: {
        L2D_COLOR_BLEND_MODE_MULT: 0,
      },
      isBootstrapping: () => false,
    })
    const { gl } = createRecordingWebGLContext()
    ;(gl as unknown as { canvas: { height: number; width: number } }).canvas = {
      height: 480,
      width: 640,
    }
    const debugLog = vi.fn()
    const drawParam = {
      gl,
      glno: 0,
      createFramebuffer: vi.fn(() => ({ framebuffer: { id: 'layout-framebuffer' } })),
      setChannelFlagAsColor: vi.fn(),
      setClipBufPre_clipContextForMask: vi.fn(),
    }
    const { Cubism2ClippingManager } = createCubism2WebGLClipping({
      Cubism2FloatRectangle,
      Cubism2Matrix44,
      Cubism2RgbaColor,
      Cubism2RuntimeConstants: createCubism2RuntimeConstants(),
      Live2D: live2DProfile,
      UtDebug: {
        logWithLegacyPrefix: debugLog,
      },
      isBootstrapping: () => false,
    })
    const manager = new Cubism2ClippingManager(drawParam)

    /**
     * Creates one minimal clipping context for layout branch tests.
     * @returns Clipping context with untouched channel and rectangle state.
     */
    function createLayoutContext(): (typeof manager.clipContextList)[number] {
      return {
        allClippedDrawRect: new Cubism2FloatRectangle(),
        clipIDList: [],
        clippedDrawContextList: [],
        clippingMaskDrawIndexList: [],
        isUsing: true,
        layoutBounds: new Cubism2FloatRectangle(),
        layoutChannelNo: -1,
        matrixForDraw: new Float32Array(16),
        matrixForMask: new Float32Array(16),
        owner: manager,
        addClippedDrawData: vi.fn(),
      }
    }

    /**
     * Replaces the manager's layout contexts with deterministic test contexts.
     * @param count Number of contexts available to the layout algorithm.
     * @returns The inserted contexts in source-order cursor sequence.
     */
    function seedLayoutContexts(count: number): Array<(typeof manager.clipContextList)[number]> {
      const contexts: Array<(typeof manager.clipContextList)[number]> = []
      for (let contextIndex = 0; contextIndex < count; contextIndex++) {
        contexts.push(createLayoutContext())
      }
      manager.clipContextList.splice(0, manager.clipContextList.length, ...contexts)
      debugLog.mockClear()
      return contexts
    }

    /**
     * Asserts the channel and normalized tile rectangle written by setupLayoutBounds.
     * @param context Clipping context after layout assignment.
     * @param expected Expected channel and normalized rectangle values from min.js.
     */
    function expectLayout(
      context: (typeof manager.clipContextList)[number],
      expected: { channel: number; height: number; width: number; x: number; y: number },
    ): void {
      expect(context.layoutChannelNo).toBe(expected.channel)
      expect(context.layoutBounds.x).toBeCloseTo(expected.x)
      expect(context.layoutBounds.y).toBeCloseTo(expected.y)
      expect(context.layoutBounds.width).toBeCloseTo(expected.width)
      expect(context.layoutBounds.height).toBeCloseTo(expected.height)
    }

    const zeroContexts = seedLayoutContexts(4)
    manager.setupLayoutBounds(0)
    expect(zeroContexts.map((context) => context.layoutChannelNo)).toEqual([-1, -1, -1, -1])
    expect(debugLog).not.toHaveBeenCalled()

    const oneContext = seedLayoutContexts(1)
    manager.setupLayoutBounds(1)
    expectLayout(oneContext[0]!, { channel: 0, height: 1, width: 1, x: 0, y: 0 })
    expect(debugLog).not.toHaveBeenCalled()

    const fiveContexts = seedLayoutContexts(5)
    manager.setupLayoutBounds(5)
    expectLayout(fiveContexts[0]!, { channel: 0, height: 1, width: 0.5, x: 0, y: 0 })
    expectLayout(fiveContexts[1]!, { channel: 0, height: 1, width: 0.5, x: 0.5, y: 0 })
    expectLayout(fiveContexts[2]!, { channel: 1, height: 1, width: 1, x: 0, y: 0 })
    expectLayout(fiveContexts[3]!, { channel: 2, height: 1, width: 1, x: 0, y: 0 })
    expectLayout(fiveContexts[4]!, { channel: 3, height: 1, width: 1, x: 0, y: 0 })
    expect(debugLog).not.toHaveBeenCalled()

    const nineContexts = seedLayoutContexts(9)
    manager.setupLayoutBounds(9)
    expectLayout(nineContexts[0]!, { channel: 0, height: 0.5, width: 0.5, x: 0, y: 0 })
    expectLayout(nineContexts[2]!, { channel: 0, height: 0.5, width: 0.5, x: 0, y: 0.5 })
    expectLayout(nineContexts[3]!, { channel: 1, height: 1, width: 0.5, x: 0, y: 0 })
    expectLayout(nineContexts[4]!, { channel: 1, height: 1, width: 0.5, x: 0.5, y: 0 })
    expect(debugLog).not.toHaveBeenCalled()

    const thirteenContexts = seedLayoutContexts(13)
    manager.setupLayoutBounds(13)
    expectLayout(thirteenContexts[0]!, { channel: 0, height: 0.5, width: 0.5, x: 0, y: 0 })
    expectLayout(thirteenContexts[3]!, {
      channel: 0,
      height: 0.5,
      width: 0.5,
      x: 0.5,
      y: 0.5,
    })
    expectLayout(thirteenContexts[4]!, { channel: 1, height: 0.5, width: 0.5, x: 0, y: 0 })
    expectLayout(thirteenContexts[6]!, { channel: 1, height: 0.5, width: 0.5, x: 0, y: 0.5 })
    expect(debugLog).not.toHaveBeenCalled()

    const sixteenContexts = seedLayoutContexts(16)
    manager.setupLayoutBounds(16)
    expectLayout(sixteenContexts[15]!, {
      channel: 3,
      height: 0.5,
      width: 0.5,
      x: 0.5,
      y: 0.5,
    })
    expect(debugLog).not.toHaveBeenCalled()

    const seventeenContexts = seedLayoutContexts(17)
    manager.setupLayoutBounds(17)
    expectLayout(seventeenContexts[0]!, {
      channel: 0,
      height: 1 / 3,
      width: 1 / 3,
      x: 0,
      y: 0,
    })
    expectLayout(seventeenContexts[4]!, {
      channel: 0,
      height: 1 / 3,
      width: 1 / 3,
      x: 1 / 3,
      y: 1 / 3,
    })
    expectLayout(seventeenContexts[5]!, {
      channel: 1,
      height: 0.5,
      width: 0.5,
      x: 0,
      y: 0,
    })
    expect(debugLog).not.toHaveBeenCalled()

    const thirtyThreeContexts = seedLayoutContexts(33)
    manager.setupLayoutBounds(33)
    expectLayout(thirtyThreeContexts[0]!, {
      channel: 0,
      height: 1 / 3,
      width: 1 / 3,
      x: 0,
      y: 0,
    })
    expectLayout(thirtyThreeContexts[8]!, {
      channel: 0,
      height: 1 / 3,
      width: 1 / 3,
      x: 2 / 3,
      y: 2 / 3,
    })
    expectLayout(thirtyThreeContexts[9]!, {
      channel: 1,
      height: 1 / 3,
      width: 1 / 3,
      x: 0,
      y: 0,
    })
    expectLayout(thirtyThreeContexts[16]!, {
      channel: 1,
      height: 1 / 3,
      width: 1 / 3,
      x: 1 / 3,
      y: 2 / 3,
    })
    expect(debugLog).not.toHaveBeenCalled()

    const thirtySixContexts = seedLayoutContexts(36)
    manager.setupLayoutBounds(36)
    expectLayout(thirtySixContexts[8]!, {
      channel: 0,
      height: 1 / 3,
      width: 1 / 3,
      x: 2 / 3,
      y: 2 / 3,
    })
    expectLayout(thirtySixContexts[35]!, {
      channel: 3,
      height: 1 / 3,
      width: 1 / 3,
      x: 2 / 3,
      y: 2 / 3,
    })
    expect(debugLog).not.toHaveBeenCalled()

    const overflowContexts = seedLayoutContexts(37)
    manager.setupLayoutBounds(37)
    expect(debugLog).toHaveBeenCalledTimes(1)
    expect(debugLog).toHaveBeenCalledWith('Clipping mask count for channel: %d', 10)
    expectLayout(overflowContexts[0]!, {
      channel: 1,
      height: 1 / 3,
      width: 1 / 3,
      x: 0,
      y: 0,
    })
    expectLayout(overflowContexts[26]!, {
      channel: 3,
      height: 1 / 3,
      width: 1 / 3,
      x: 2 / 3,
      y: 2 / 3,
    })
    expect(overflowContexts[27]!.layoutChannelNo).toBe(-1)

    const inactivePrefixContexts = seedLayoutContexts(6)
    inactivePrefixContexts[0]!.isUsing = false
    inactivePrefixContexts[1]!.isUsing = true
    inactivePrefixContexts[2]!.isUsing = true
    manager.setupLayoutBounds(5)
    expectLayout(inactivePrefixContexts[0]!, { channel: 0, height: 1, width: 0.5, x: 0, y: 0 })
    expectLayout(inactivePrefixContexts[1]!, {
      channel: 0,
      height: 1,
      width: 0.5,
      x: 0.5,
      y: 0,
    })
    expectLayout(inactivePrefixContexts[2]!, { channel: 1, height: 1, width: 1, x: 0, y: 0 })
    expect(inactivePrefixContexts[5]!.layoutChannelNo).toBe(-1)
  })

  it('keeps Cubism2 ID type caches in a separate module with shared reset semantics', () => {
    const idTypes = createCubism2IdTypes({
      isBootstrapping: () => false,
    })
    const firstParamId = idTypes.ParamID.getID('ParamAngleX')
    const secondParamId = idTypes.ParamID.getID('ParamAngleX')
    const firstDefaultBaseId = idTypes.BaseDataID.getDefaultBaseDataID()
    const secondDefaultBaseId = idTypes.BaseDataID.getDefaultBaseDataID()

    expect(firstParamId).toBe(secondParamId)
    expect(String(firstParamId)).toBe('ParamAngleX')
    expect(firstDefaultBaseId).toBe(secondDefaultBaseId)
    expect(String(firstDefaultBaseId)).toBe('DST_BASE')

    idTypes.Cubism2IdBase.resetAllIdCaches()

    expect(idTypes.ParamID.getID('ParamAngleX')).not.toBe(firstParamId)
    expect(idTypes.BaseDataID.getDefaultBaseDataID()).not.toBe(firstDefaultBaseId)
  })

  it('keeps Cubism2 motion base and queue semantics in a separate module', () => {
    let userTime = 100
    const debugLog = vi.fn()
    const motionBase = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        logDebug: debugLog,
        logWithLegacyPrefix: debugLog,
      },
      UtSystem: {
        getUserTimeMSec: () => userTime,
      },
      isBootstrapping: () => false,
    })
    const motion = new motionBase.AMotion()
    const model = { marker: 'model' }
    const updates: Array<{ time: number; weight: number }> = []

    motion.setFadeIn(1000)
    motion.setFadeOut(1000)
    motion.setWeight(0.5)
    motion.getDurationMSec = () => 2000
    motion.updateParamExe = (_model: unknown, time: number, weight: number) => {
      expect(_model).toBe(model)
      updates.push({ time, weight })
    }

    const queue = new motionBase.MotionQueueManager()
    const motionHandle = queue.startMotion(motion)

    queue.updateParam(model)
    userTime = 600
    queue.updateParam(model)
    userTime = 1600
    queue.updateParam(model)

    const queueEntry = queue.getMotionQueueEntries()[0]

    expect(motionHandle).toBe(0)
    expect(queueEntry).toBeDefined()
    if (queueEntry == null) {
      throw new Error('Cubism2 motion queue entry was not created.')
    }
    expect(queueEntry.startTimeMillis).toBe(100)
    expect(queueEntry.fadeInStartTimeMillis).toBe(100)
    expect(queueEntry.endTimeMillis).toBe(2100)
    expect(updates[0]).toEqual({ time: 100, weight: 0 })
    expect(updates[1]?.time).toBe(600)
    expect(updates[1]?.weight).toBeCloseTo(0.25)
    expect(updates[2]?.time).toBe(1600)
    expect(updates[2]?.weight).toBeCloseTo(0.25)

    userTime = 2201
    queue.updateParam(model)

    expect(queue.isFinished(motionHandle)).toBe(true)
  })

  it('preserves Cubism2 AMotion nullish field coercion during weight blending', () => {
    let userTime = 100
    const motionBase = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        logDebug: vi.fn(),
        logWithLegacyPrefix: vi.fn(),
      },
      UtSystem: {
        /**
         * Supplies deterministic time for legacy coercion checks.
         * @returns Current fake user time in milliseconds.
         */
        getUserTimeMSec() {
          return userTime
        },
      },
      isBootstrapping: () => false,
    })
    const motion = new motionBase.AMotion()
    const queueEntry = new motionBase.Cubism2MotionQueueEntry()
    const weights: number[] = []

    motion.getDurationMSec = () => 1000
    motion.updateParamExe = (_model: unknown, _time: number, weight: number) => {
      weights.push(weight)
    }
    motion.fadeInMillis = 0
    motion.fadeOutMillis = 0

    motion.motionWeight = null
    motion.updateParam({}, queueEntry)
    expect(weights[0]).toBe(0)

    userTime = 200
    queueEntry.isFinishedFlag = false
    motion.motionWeight = undefined
    motion.updateParam({}, queueEntry)
    expect(Number.isNaN(weights[1])).toBe(true)
  })

  it('restores Cubism2 AMotion curve-weight helper as a semantic static method', () => {
    const motionBase = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        logDebug: vi.fn(),
        logWithLegacyPrefix: vi.fn(),
      },
      UtSystem: {
        /**
         * Supplies deterministic time for helper construction.
         * @returns Current fake user time in milliseconds.
         */
        getUserTimeMSec() {
          return 0
        },
      },
      isBootstrapping: () => false,
    })
    const MotionCtor = motionBase.AMotion

    expect(MotionCtor.calculateLegacyCurveWeight(-1, 1000, 500)).toBe(0)
    expect(MotionCtor.calculateLegacyCurveWeight(0, 1000, 500)).toBe(0)
    expect(MotionCtor.calculateLegacyCurveWeight(1000, 1000, 500)).toBe(1)
    expect(MotionCtor.calculateLegacyCurveWeight(250, 1000, 500)).toBeCloseTo(0.2265625)
    expect(MotionCtor.calculateLegacyCurveWeight(750, 1000, 500)).toBeCloseTo(0.7734375)
    expect(MotionCtor.calculateLegacyCurveWeight(400, 1000, 250)).toBeCloseTo(0.4015)
  })

  it('preserves Cubism2 motion queue entry state and fade scheduling', () => {
    let userTime = 100
    const debugLog = vi.fn()
    const motionBase = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        logDebug: debugLog,
        logWithLegacyPrefix: debugLog,
      },
      UtSystem: {
        /**
         * Supplies deterministic queue time for fade scheduling checks.
         * @returns Current fake user time in milliseconds.
         */
        getUserTimeMSec() {
          return userTime
        },
      },
      isBootstrapping: () => false,
    })
    const queueEntry = new motionBase.Cubism2MotionQueueEntry()

    expect(queueEntry.motion).toBeNull()
    expect(queueEntry.isAvailable).toBe(true)
    expect(queueEntry.isFinishedFlag).toBe(false)
    expect(queueEntry.startTimeMillis).toBe(-1)
    expect(queueEntry.fadeInStartTimeMillis).toBe(-1)
    expect(queueEntry.endTimeMillis).toBe(-1)
    queueEntry.startTimeMillis = 120
    queueEntry.fadeInStartTimeMillis = 130
    queueEntry.endTimeMillis = 900
    queueEntry.isFinishedFlag = true
    queueEntry.startTimeMillis = 220
    queueEntry.fadeInStartTimeMillis = 230
    queueEntry.endTimeMillis = 450
    queueEntry.isFinishedFlag = false
    expect(queueEntry.startTimeMillis).toBe(220)
    expect(queueEntry.fadeInStartTimeMillis).toBe(230)
    expect(queueEntry.endTimeMillis).toBe(450)
    expect(queueEntry.isFinished()).toBe(false)
    expect(queueEntry.getMotionHandle()).toBe(queueEntry.motionHandle)

    userTime = 200
    queueEntry.scheduleFadeOut(400)
    expect(queueEntry.endTimeMillis).toBe(450)
    queueEntry.scheduleFadeOut(100)
    expect(queueEntry.endTimeMillis).toBe(300)
    queueEntry.scheduleFadeOut(50)
    expect(queueEntry.endTimeMillis).toBe(250)
  })

  it('keeps Cubism2 auto eye blink state transitions in a separate module', () => {
    let now = 1000
    const eyeWrites: Array<[unknown, number]> = []
    const autoEyeBlink = createCubism2AutoEyeBlink({
      UtSystem: {
        /**
         * Supplies deterministic legacy time for blink state transitions.
         * @returns Current fake user time in milliseconds.
         */
        getUserTimeMSec(): number {
          return now
        },
      },
      /**
       * Supplies deterministic random value used to schedule the next blink.
       * @returns Zero so the next interval boundary equals the current fake time.
       */
      random(): number {
        return 0
      },
      /**
       * Keeps constructor side effects enabled for the runtime instance under test.
       * @returns False outside legacy prototype bootstrap.
       */
      isBootstrapping(): boolean {
        return false
      },
    })
    const blink = new autoEyeBlink.Cubism2AutoEyeBlink()
    const model = {
      /**
       * Captures eye parameter writes from the blink state machine.
       * @param paramId Left or right eye-open parameter id passed through from legacy fields.
       * @param value Eye-open value computed by the current state.
       * @returns Nothing; writes are appended for assertions.
       */
      setParamFloat(paramId: unknown, value: number): void {
        eyeWrites.push([paramId, value])
      },
    }

    expect(blink.currentState).toBe(autoEyeBlink.AutoEyeBlinkState.First)
    expect(blink.scheduleNextBlinkMillis()).toBe(1000)

    blink.setBlinkIntervalMillis(6000)
    blink.setBlinkMotionMillis(100, 50, 150)
    blink.updateBlinkParameters(model)
    expect(blink.currentState).toBe(autoEyeBlink.AutoEyeBlinkState.Interval)
    expect(blink.nextBlinkMillis).toBe(1000)
    expect(eyeWrites[eyeWrites.length - 2]).toEqual(['PARAM_EYE_L_OPEN', 1])
    expect(eyeWrites[eyeWrites.length - 1]).toEqual(['PARAM_EYE_R_OPEN', 1])

    now = 1001
    blink.updateBlinkParameters(model)
    expect(blink.currentState).toBe(autoEyeBlink.AutoEyeBlinkState.Closing)
    expect(eyeWrites[eyeWrites.length - 1]).toEqual(['PARAM_EYE_R_OPEN', 1])

    now = 1051
    blink.updateBlinkParameters(model)
    expect(eyeWrites[eyeWrites.length - 2]).toEqual(['PARAM_EYE_L_OPEN', 0.5])
    expect(eyeWrites[eyeWrites.length - 1]).toEqual(['PARAM_EYE_R_OPEN', 0.5])

    now = 1101
    blink.updateBlinkParameters(model)
    expect(blink.currentState).toBe(autoEyeBlink.AutoEyeBlinkState.Closed)
    expect(eyeWrites[eyeWrites.length - 1]).toEqual(['PARAM_EYE_R_OPEN', 0])

    now = 1151
    blink.updateBlinkParameters(model)
    expect(blink.currentState).toBe(autoEyeBlink.AutoEyeBlinkState.Opening)
    expect(eyeWrites[eyeWrites.length - 1]).toEqual(['PARAM_EYE_R_OPEN', 0])

    now = 1226
    blink.updateBlinkParameters(model)
    expect(eyeWrites[eyeWrites.length - 2]).toEqual(['PARAM_EYE_L_OPEN', 0.5])
    expect(eyeWrites[eyeWrites.length - 1]).toEqual(['PARAM_EYE_R_OPEN', 0.5])

    blink.isEyeOpenPositive = false
    now = 1301
    blink.updateBlinkParameters(model)
    expect(blink.currentState).toBe(autoEyeBlink.AutoEyeBlinkState.Interval)
    expect(eyeWrites[eyeWrites.length - 2]).toEqual(['PARAM_EYE_L_OPEN', -1])
    expect(eyeWrites[eyeWrites.length - 1]).toEqual(['PARAM_EYE_R_OPEN', -1])
  })

  it('keeps Cubism2 auto eye blink exact scheduler formula and semantic state', () => {
    let now = 2000
    const eyeWrites: Array<[unknown, number]> = []
    const autoEyeBlink = createCubism2AutoEyeBlink({
      UtSystem: {
        /**
         * Supplies deterministic legacy time for exact blink scheduling assertions.
         * @returns Current fake user time in milliseconds.
         */
        getUserTimeMSec(): number {
          return now
        },
      },
      /**
       * Supplies a non-zero deterministic random value to lock the legacy interval formula.
       * @returns Half of the random interval window.
       */
      random(): number {
        return 0.5
      },
      /**
       * Keeps constructor side effects enabled for semantic scheduler checks.
       * @returns False outside runtime prototype bootstrap.
       */
      isBootstrapping(): boolean {
        return false
      },
    })
    const blink = new autoEyeBlink.Cubism2AutoEyeBlink()
    const model = {
      /**
       * Captures raw eye parameter ids exactly as the legacy state machine passes them.
       * @param paramId Raw parameter id value received from the blink state machine.
       * @param value Eye-open value computed by the current state.
       */
      setParamFloat(paramId: unknown, value: number): void {
        eyeWrites.push([paramId, value])
      },
    }

    blink.setBlinkIntervalMillis(6000)
    expect(blink.blinkIntervalMillis).toBe(6000)
    expect(blink.scheduleNextBlinkMillis()).toBe(2000 + 0.5 * (2 * 6000 - 1))

    blink.setBlinkMotionMillis(110, 60, 160)
    expect(blink.closingMillis).toBe(110)
    expect(blink.closedMillis).toBe(60)
    expect(blink.openingMillis).toBe(160)
    blink.nextBlinkMillis = 2222
    blink.stateStartMillis = 2111
    blink.currentState = autoEyeBlink.AutoEyeBlinkState.Interval
    blink.leftEyeParamId = null
    blink.rightEyeParamId = 'RIGHT_EYE'
    blink.updateBlinkParameters(model)
    expect(blink.nextBlinkMillis).toBe(2222)
    expect(blink.stateStartMillis).toBe(2111)
    expect(blink.currentState).toBe(autoEyeBlink.AutoEyeBlinkState.Interval)
    expect(blink.leftEyeParamId).toBeNull()
    expect(blink.rightEyeParamId).toBe('RIGHT_EYE')
    expect(eyeWrites[eyeWrites.length - 2]).toEqual([null, 1])
    expect(eyeWrites[eyeWrites.length - 1]).toEqual(['RIGHT_EYE', 1])
  })

  it('keeps Live2DMotion MTN parsing and parameter updates in a separate module', () => {
    const motionBase = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        /**
         * Suppresses queue debug output during parser tests.
         */
        logDebug() {},
        /**
         * Suppresses queue errors during parser tests.
         */
        logWithLegacyPrefix() {},
      },
      UtSystem: {
        /**
         * Returns deterministic test time for queue entry scheduling.
         * @returns Current fake user time in milliseconds.
         */
        getUserTimeMSec: () => 0,
      },
      isBootstrapping: () => false,
    })
    const motionParser = createCubism2MotionParser({
      AMotion: motionBase.AMotion,
      isBootstrapping: () => false,
    })
    const motionText = [
      '# comment ignored by parser',
      '$fps=20',
      'ParamAngleX=0,10,20',
      'VISIBLE:PARTS_01=1,0,1',
      'LAYOUT:X=0,1,2',
    ].join('\n')
    const motion = motionParser.Live2DMotion.loadMotion(new TextEncoder().encode(motionText).buffer)

    expect(motion.framesPerSecond).toBe(20)
    expect(motion.getFramesPerSecond()).toBe(20)
    motion.setFramesPerSecond(24)
    expect(motion.getFramesPerSecond()).toBe(24)
    motion.setFramesPerSecond(20)
    expect(motion.framesPerSecond).toBe(20)
    expect(motion.maxCurveValueCount).toBe(3)
    expect(motion.getDurationMSec()).toBe(150)
    expect(motion.durationMSec).toBe(150)
    expect(motion.isLoop()).toBe(false)
    motion.framesPerSecond = 18
    motion.maxCurveValueCount = 4
    motion.durationMSec = 240
    motion.lastWeight = 0.25
    motion.loopEnabled = true
    expect(motion.framesPerSecond).toBe(18)
    expect(motion.maxCurveValueCount).toBe(4)
    expect(motion.durationMSec).toBe(240)
    expect(motion.lastWeight).toBe(0.25)
    expect(motion.loopEnabled).toBe(true)
    motion.setFramesPerSecond(20)
    motion.maxCurveValueCount = 3
    motion.durationMSec = 150
    motion.lastWeight = 0
    motion.setLoop(false)
    motion.setLoop(true)
    expect(motion.loopEnabled).toBe(true)
    expect(motion.getDurationMSec()).toBe(-1)
    motion.setLoop(false)
    expect(motion.loopEnabled).toBe(false)
    expect(motion.motions).toHaveLength(3)
    expect(motion.motions.map((curve) => curve.targetId)).toEqual([
      'ParamAngleX',
      'VISIBLE:PARTS_01',
      'X',
    ])
    expect(motion.motions.map((curve) => curve.curveType)).toEqual([
      motionParser.Cubism2MotionCurve.PARAMETER_CURVE_TYPE,
      motionParser.Cubism2MotionCurve.VISIBILITY_CURVE_TYPE,
      motionParser.Cubism2MotionCurve.LAYOUT_X_CURVE_TYPE,
    ])
    expect(Array.from(motion.motions[0]!.keyframeValues!)).toEqual([0, 10, 20])
    const updates: Array<{ id: string; value: number }> = []
    const modelContext = {
      /**
       * Reads the current model parameter value by index for interpolation.
       * @param index Parameter index returned by `getParamIndex`.
       * @returns Current parameter value before applying motion blending.
       */
      getParamFloat(index: number) {
        return index === 1 ? 2 : 0
      },
      /**
       * Supplies the upper parameter bound used by jump-threshold smoothing.
       * @returns Max parameter value.
       */
      getParamMax() {
        return 100
      },
      /**
       * Supplies the lower parameter bound used by jump-threshold smoothing.
       * @returns Min parameter value.
       */
      getParamMin() {
        return -100
      },
    }
    const model = {
      /**
       * Maps MTN target ID to the fake model parameter index.
       * @param id Parameter ID parsed from the MTN line prefix.
       * @returns Deterministic parameter index for this test model.
       */
      getParamIndex(id: string) {
        return id === 'ParamAngleX' ? 1 : 2
      },
      /**
       * Provides parameter limits and current values for smoothing logic.
       * @returns Fake model context used by Live2DMotion.
       */
      getModelContext() {
        return modelContext
      },
      /**
       * Records parameter writes performed by `Live2DMotion.updateParamExe`.
       * @param id Parameter ID or visibility target from the MTN curve.
       * @param value Motion-applied value.
       */
      setParamFloat(id: string, value: number) {
        updates.push({ id, value })
      },
    }
    const queueEntry = {
      fadeInStartTimeMillis: 1000,
      isFinishedFlag: false,
      startTimeMillis: 1000,
    }

    motion.updateParamExe(model, 1050, 0.5, queueEntry as never)

    expect(updates).toEqual([
      { id: 'ParamAngleX', value: 6 },
      { id: 'VISIBLE:PARTS_01', value: 0 },
    ])
    expect(queueEntry.isFinishedFlag).toBe(false)

    motion.updateParamExe(model, 1200, 1, queueEntry as never)
    expect(queueEntry.isFinishedFlag).toBe(true)
  })

  it('keeps Cubism2MotionCurve semantic type values writable', () => {
    const motionBase = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        /**
         * Suppresses queue debug output during semantic curve-type tests.
         */
        logDebug() {},
        /**
         * Suppresses queue errors during semantic curve-type tests.
         */
        logWithLegacyPrefix() {},
      },
      UtSystem: {
        /**
         * Returns deterministic test time for semantic curve-type tests.
         * @returns Current fake user time in milliseconds.
         */
        getUserTimeMSec: () => 0,
      },
      isBootstrapping: () => false,
    })
    const motionParser = createCubism2MotionParser({
      AMotion: motionBase.AMotion,
      isBootstrapping: () => false,
    })
    const MotionCurve = motionParser.Cubism2MotionCurve

    MotionCurve.VISIBILITY_CURVE_TYPE = 77
    expect(MotionCurve.VISIBILITY_CURVE_TYPE).toBe(77)

    const visibleMotion = motionParser.Live2DMotion.loadMotion(
      new TextEncoder().encode('VISIBLE:PARTS_01=1').buffer,
    )
    expect(visibleMotion.motions[0]!.curveType).toBe(77)

    MotionCurve.LAYOUT_SCALE_Y_CURVE_TYPE = 188
    expect(MotionCurve.LAYOUT_SCALE_Y_CURVE_TYPE).toBe(188)

    const layoutMotion = motionParser.Live2DMotion.loadMotion(
      new TextEncoder().encode('LAYOUT:SCALE_Y=1').buffer,
    )
    expect(layoutMotion.motions[0]!.curveType).toBe(188)
  })

  it('keeps the dormant legacy Live2DMotion parser in a separate module with byte-reader semantics', () => {
    const motionBase = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        /**
         * Suppresses queue debug output during legacy parser tests.
         */
        logDebug() {},
        /**
         * Suppresses queue errors during legacy parser tests.
         */
        logWithLegacyPrefix() {},
      },
      UtSystem: {
        /**
         * Returns deterministic test time for queue entry scheduling.
         * @returns Current fake user time in milliseconds.
         */
        getUserTimeMSec: () => 0,
      },
      isBootstrapping: () => false,
    })
    const motionParser = createCubism2MotionParser({
      AMotion: motionBase.AMotion,
      isBootstrapping: () => false,
    })
    const legacyMotion = createCubism2LegacyMotion({
      AMotion: motionBase.AMotion,
      Cubism2MotionCurve: motionParser.Cubism2MotionCurve,
      MotionTextReader: motionParser.MotionTextReader,
      isBootstrapping: () => false,
    })
    const motionText = [
      '# comment ignored by legacy parser',
      '$fps=24',
      'ParamAngleX=0,12,24',
      'VISIBLE:PARTS_01=1,0,1',
      'LAYOUT:Y=2,4,6',
    ].join('\n')
    const motion = legacyMotion.LegacyLive2DMotion.loadMotion(new TextEncoder().encode(motionText))

    expect(motion.framesPerSecond).toBe(24)
    expect(motion.maxCurveValueCount).toBe(3)
    expect(motion.getDurationMSec()).toBe(125)
    expect(motion.motions).toHaveLength(3)
    expect(motion.motions.map((curve) => curve.targetId)).toEqual([
      'ParamAngleX',
      'VISIBLE:PARTS_01',
      'Y',
    ])
    expect(motion.motions.map((curve) => curve.curveType)).toEqual([
      motionParser.Cubism2MotionCurve.PARAMETER_CURVE_TYPE,
      motionParser.Cubism2MotionCurve.VISIBILITY_CURVE_TYPE,
      motionParser.Cubism2MotionCurve.LAYOUT_Y_CURVE_TYPE,
    ])
    expect(Array.from(motion.motions[0]!.keyframeValues!)).toEqual([0, 12, 24])
    expect(motion.isLoop()).toBe(true)
    motion.setLoop(false)
    expect(motion.isLoop()).toBe(false)
    motion.setLoop(true)

    const writes: Array<{ id: string; value: number }> = []
    const model = {
      /**
       * Reads the current model parameter value before legacy blending.
       * @param id Parameter id requested by the legacy curve.
       * @returns Current fake parameter value.
       */
      getParamFloat(id: string) {
        return id === 'ParamAngleX' ? 4 : 0
      },
      /**
       * Records legacy parser writes.
       * @param id Parameter id or visibility id parsed from the curve key.
       * @param value Blended value written by the legacy branch.
       */
      setParamFloat(id: string, value: number) {
        writes.push({ id, value })
      },
    }
    const queueEntry = {
      fadeInStartTimeMillis: 1000,
      isFinishedFlag: false,
      startTimeMillis: 1000,
    }

    motion.updateParamExe(model, 1041.6666666667, 0.5, queueEntry as never)

    expect(writes[0]?.id).toBe('ParamAngleX')
    expect(writes[0]?.value).toBeCloseTo(8)
    expect(writes[1]).toEqual({ id: 'VISIBLE:PARTS_01', value: 0 })

    motion.setLoop(true)
    motion.setLoopFadeIn(true)
    motion.updateParamExe(model, 1200, 1, queueEntry as never)
    expect(queueEntry.isFinishedFlag).toBe(false)
    expect(queueEntry.startTimeMillis).toBe(1200)
    expect(queueEntry.fadeInStartTimeMillis).toBe(1200)

    motion.setLoop(false)
    motion.updateParamExe(model, 1400, 1, queueEntry as never)
    expect(queueEntry.isFinishedFlag).toBe(true)
  })

  it('covers every active and dormant legacy layout curve classification branch', () => {
    const motionBase = createCubism2MotionBase({
      Cubism2Math: createCubism2Math(),
      UtDebug: {
        /**
         * Suppresses queue debug output during layout classification tests.
         */
        logDebug() {},
        /**
         * Suppresses queue errors during layout classification tests.
         */
        logWithLegacyPrefix() {},
      },
      UtSystem: {
        /**
         * Returns deterministic test time for layout classification.
         * @returns Current fake user time in milliseconds.
         */
        getUserTimeMSec: () => 0,
      },
      isBootstrapping: () => false,
    })
    const motionParser = createCubism2MotionParser({
      AMotion: motionBase.AMotion,
      isBootstrapping: () => false,
    })
    const legacyMotion = createCubism2LegacyMotion({
      AMotion: motionBase.AMotion,
      Cubism2MotionCurve: motionParser.Cubism2MotionCurve,
      MotionTextReader: motionParser.MotionTextReader,
      isBootstrapping: () => false,
    })
    const cases = [
      ['LAYOUT:ANCHOR_X=1', 'ANCHOR_X', motionParser.Cubism2MotionCurve.LAYOUT_ANCHOR_X_CURVE_TYPE],
      ['LAYOUT:ANCHOR_Y=1', 'ANCHOR_Y', motionParser.Cubism2MotionCurve.LAYOUT_ANCHOR_Y_CURVE_TYPE],
      ['LAYOUT:SCALE_X=1', 'SCALE_X', motionParser.Cubism2MotionCurve.LAYOUT_SCALE_X_CURVE_TYPE],
      ['LAYOUT:SCALE_Y=1', 'SCALE_Y', motionParser.Cubism2MotionCurve.LAYOUT_SCALE_Y_CURVE_TYPE],
      ['LAYOUT:X=1', 'X', motionParser.Cubism2MotionCurve.LAYOUT_X_CURVE_TYPE],
      ['LAYOUT:Y=1', 'Y', motionParser.Cubism2MotionCurve.LAYOUT_Y_CURVE_TYPE],
    ] as const
    const activeMotion = motionParser.Live2DMotion.loadMotion(
      new TextEncoder().encode(cases.map(([line]) => line).join('\n')).buffer,
    )
    expect(activeMotion.motions.map((curve) => [curve.targetId, curve.curveType])).toEqual(
      cases.map(([, targetId, curveType]) => [targetId, curveType]),
    )

    const motion = legacyMotion.LegacyLive2DMotion.loadMotion(
      new TextEncoder().encode(cases.map(([line]) => line).join('\n')),
    )

    expect(motion.motions.map((curve) => [curve.targetId, curve.curveType])).toEqual(
      cases.map(([, targetId, curveType]) => [targetId, curveType]),
    )
  })

  it('keeps Cubism2 runtime utility timers and array copying in a separate module', () => {
    let now = 1000
    const logs: unknown[][] = []
    const runtimeUtilities = createCubism2RuntimeUtilities({
      logger: {
        /**
         * Captures legacy debug output without writing to the test console.
         * @param args Console payload emitted by UtDebug helpers.
         */
        log: (...args: unknown[]) => {
          logs.push(args)
        },
      },
      now: () => now,
    })

    runtimeUtilities.UtDebug.start('motion')
    now = 1042

    expect(runtimeUtilities.UtDebug.end('motion')).toBe(42)
    expect(runtimeUtilities.UtDebug.dump('motion')).toBe(42)
    expect(logs[0]).toEqual(['motion : 42ms'])
    expect(runtimeUtilities.UtDebug.end('missing')).toBe(-1)

    runtimeUtilities.UtSystem.setUserTimeMSec(1200)
    expect(runtimeUtilities.UtSystem.getUserTimeMSec()).toBe(1200)
    now = 1250
    expect(runtimeUtilities.UtSystem.updateUserTimeMSec()).toBe(1250)
    runtimeUtilities.UtSystem.setUserTimeMSec(runtimeUtilities.UtSystem.NO_USER_TIME_SENTINEL)
    expect(runtimeUtilities.UtSystem.getUserTimeMSec()).toBe(1250)

    const target = [0, 0, 0, 0, 0]
    runtimeUtilities.UtSystem.copyArraySegmentForward([9, 8, 7, 6], 1, target, 2, 2)

    expect(target).toEqual([0, 0, 8, 7, 0])
  })

  it('restores UtDebug semantic timer state', () => {
    let now = 2000
    const { UtDebug } = createCubism2RuntimeUtilities({ now: () => now })

    expect(UtDebug.debugLevel).toBe(0)
    UtDebug.debugLevel = 4
    expect(UtDebug.debugLevel).toBe(4)

    UtDebug.start('motion')
    const motionTimerRecord = UtDebug.timerRecords.motion!
    expect(motionTimerRecord.timerName).toBe('motion')
    expect(motionTimerRecord.startedAtMillis).toBe(2000)

    motionTimerRecord.startedAtMillis = 1975
    now = 2025
    expect(UtDebug.end('motion')).toBe(50)
    expect(UtDebug.dump('motion')).toBe(50)
  })

  it('restores UtSystem semantic time state and helpers', () => {
    let now = 4000
    const { UtSystem } = createCubism2RuntimeUtilities({ now: () => now })

    expect(UtSystem.NO_USER_TIME_SENTINEL).toBe(0)
    expect(UtSystem.userTimeMillis).toBe(UtSystem.NO_USER_TIME_SENTINEL)
    expect(UtSystem.getUserTimeMSec()).toBe(4000)

    UtSystem.setUserTimeMSec(4123)
    expect(UtSystem.userTimeMillis).toBe(4123)
    expect(UtSystem.getUserTimeMSec()).toBe(4123)

    UtSystem.userTimeMillis = UtSystem.NO_USER_TIME_SENTINEL
    now = 4567
    expect(UtSystem.getUserTimeMSec()).toBe(4567)

    now = 4901
    expect(UtSystem.updateUserTimeMSec()).toBe(4901)
    expect(UtSystem.userTimeMillis).toBe(4901)
    expect(UtSystem.alwaysTrueQuery()).toBe(true)
    expect(UtSystem.emptyOneArgumentHook('ignored')).toBeUndefined()

    const target = [0, 0, 0, 0]
    UtSystem.copyArraySegmentForward([1, 2, 3, 4], 1, target, 2, 2)
    expect(target).toEqual([0, 0, 2, 3])
  })

  it('routes extracted UtSystem array-copy consumers through copyArraySegmentForward', () => {
    const copyCalls: Array<{
      copyLength: number
      sourceOffset: number
      targetOffset: number
    }> = []
    const semanticOnlyUtSystem = {
      /**
       * Copies values for consumer-route tests and records which semantic path was used.
       * @param sourceValues Source array or typed array selected by the consumer.
       * @param sourceOffset First source index forwarded by the consumer.
       * @param targetValues Mutable destination array or typed array.
       * @param targetOffset First destination index forwarded by the consumer.
       * @param copyLength Number of entries the consumer asked to copy.
       */
      copyArraySegmentForward<T>(
        sourceValues: ArrayLike<T>,
        sourceOffset: number,
        targetValues: { [index: number]: T },
        targetOffset: number,
        copyLength: number,
      ): void {
        copyCalls.push({ copyLength, sourceOffset, targetOffset })
        for (let valueIndex = 0; valueIndex < copyLength; valueIndex += 1) {
          targetValues[targetOffset + valueIndex] = sourceValues[sourceOffset + valueIndex] as T
        }
      },
    }

    const Cubism2Interpolation = createCubism2Interpolation({
      UtSystem: semanticOnlyUtSystem,
    }).Cubism2Interpolation
    const directCopy = createInterpolationHarness(0, [0], [])
    const directCopyOutput = new Float32Array(4) as unknown as MutableNumberArray
    Cubism2Interpolation.interpolatePoints(
      directCopy.modelContext,
      directCopy.paramBindingSet,
      directCopy.dirtyFlagRef,
      2,
      [[1, 2, 3, 4]],
      directCopyOutput,
      0,
      2,
    )

    expect(copyCalls).toEqual([{ copyLength: 4, sourceOffset: 0, targetOffset: 0 }])
    expect(Array.from(directCopyOutput)).toEqual([1, 2, 3, 4])
  })

  it('keeps Cubism2 affine transforms in a separate module with readable matrix semantics', () => {
    const runtimeUtilities = createCubism2RuntimeUtilities()
    const AffineTransform = createCubism2AffineTransform({
      UtSystem: runtimeUtilities.UtSystem,
      isBootstrapping: () => false,
    })
    const identityTransform = new AffineTransform()
    const identityOutput = [0, 0, 0, 0]

    identityTransform.transform([1, 2, 3, 4], identityOutput, 2)

    expect(identityOutput).toEqual([1, 2, 3, 4])

    const translatedAndScaledTransform = new AffineTransform()
    translatedAndScaledTransform.scaleX = 2
    translatedAndScaledTransform.scaleY = 3
    translatedAndScaledTransform.translateX = 10
    translatedAndScaledTransform.translateY = 20
    translatedAndScaledTransform.update()

    const scaledOutput = [0, 0]
    translatedAndScaledTransform.transform([2, 4], scaledOutput, 1)

    expect(translatedAndScaledTransform.stateFlags).toBe(
      AffineTransform.STATE_SCALE | AffineTransform.STATE_TRANSLATE,
    )
    expect(scaledOutput).toEqual([14, 32])

    const composedTransform = new AffineTransform()
    composedTransform.composeFromScaleSkewRotationTranslation([2, 3, 0, Math.PI / 2, 5, 6])
    const composedOutput = [0, 0]
    composedTransform.transform([1, 1], composedOutput, 1)

    expect(composedOutput[0]).toBeCloseTo(2)
    expect(composedOutput[1]).toBeCloseTo(8)

    const decomposedValues = new Float32Array(6)
    composedTransform.decomposeToScaleSkewRotationTranslation(decomposedValues)

    expect(decomposedValues[0]).toBeCloseTo(2)
    expect(decomposedValues[1]).toBeCloseTo(3)
    expect(decomposedValues[2]).toBeCloseTo(0)
    expect(decomposedValues[3]).toBeCloseTo(Math.PI / 2)
    expect(decomposedValues[4]).toBeCloseTo(5)
    expect(decomposedValues[5]).toBeCloseTo(6)

    const rawMatrixValues = new Float32Array(6)
    composedTransform.writeRawMatrixValues(rawMatrixValues)
    expect(Array.from(rawMatrixValues)).toEqual(
      expect.arrayContaining([expect.closeTo(0), expect.closeTo(2), expect.closeTo(-3), 5, 6]),
    )

    const startTransform = new AffineTransform()
    const endTransform = new AffineTransform()
    const interpolatedTransform = new AffineTransform()
    endTransform.composeFromScaleSkewRotationTranslation([1, 1, 0, 0, 10, 20])

    identityTransform.interpolateDecomposedTransform(
      startTransform,
      endTransform,
      0.5,
      interpolatedTransform,
    )

    const interpolatedOutput = [0, 0]
    interpolatedTransform.transform([0, 0], interpolatedOutput, 1)
    expect(interpolatedOutput).toEqual([5, 10])
  })




  it('keeps Cubism2 UtVector affine coordinate solver in a separate module', () => {
    const logCalls: unknown[][] = []
    const UtVector = createCubism2UtVector({
      logger: {
        /**
         * Records legacy diagnostic logging when the solver reaches the NaN fallback branch.
         * @param args Console-style log payload from the restored UtVector helper.
         */
        log(...args: unknown[]): void {
          logCalls.push(args)
        },
      },
    })

    expect(UtVector.solveAffineCoordinates(14, 24, 10, 20, 2, 0, 0, 2)).toEqual([2, 2])
    expect(UtVector.solveAffineCoordinates(1, 1, 0, 0, 1, 1, 2, 2)).toBeNull()

    const outputCoordinates = [0, 0, 9]
    const returnedOutput = UtVector.solveAffineCoordinates(
      8,
      12,
      2,
      3,
      3,
      0,
      0,
      3,
      outputCoordinates,
    )
    expect(returnedOutput).toBe(outputCoordinates)
    expect(outputCoordinates).toEqual([2, 3, 9])

    const nanOutput = UtVector.solveAffineCoordinates(1, 2, 0, 0, Number.NaN, 1, 1, 0)
    expect(nanOutput?.every(Number.isNaN)).toBe(true)
    expect(logCalls).toEqual([
      ['a is NaN @UtVector#solveAffineCoordinates() '],
      ['v1x : NaN'],
      ['v1x != 0 ? true'],
    ])
  })

  it('preserves the semantic runtime info logger behavior', () => {
    const logCalls: unknown[][] = []
    const runtimeUtilities = createCubism2RuntimeUtilities({
      logger: {
        /**
         * Captures UtDebug info log output.
         * @param args Console-style payload produced by the restored debug logger.
         */
        log(...args: unknown[]): void {
          logCalls.push(args)
        },
      },
    })
    runtimeUtilities.UtDebug.logWithLegacyPrefix('calc', 1, 2)
    expect(logCalls).toEqual([['legacyLog : calc\n', 1, 2]])
  })

  it('preserves UtDebug plain debug behavior', () => {
    const logCalls: unknown[][] = []
    const runtimeUtilities = createCubism2RuntimeUtilities({
      logger: {
        /**
         * Captures UtDebug plain debug log output.
         * @param args Console-style payload produced by the restored debug logger.
         */
        log(...args: unknown[]): void {
          logCalls.push(args)
        },
      },
    })
    runtimeUtilities.UtDebug.logDebug('plain', 3, 4)
    runtimeUtilities.UtDebug.logDebug('single')
    expect(logCalls).toEqual([
      ['plain', 3],
      ['single', undefined],
    ])
  })

  it('preserves UtDebug semantic dump helper behavior', () => {
    const logCalls: unknown[][] = []
    const runtimeUtilities = createCubism2RuntimeUtilities({
      logger: {
        /**
         * Captures UtDebug dump helper console payloads.
         * @param args Console-style payload emitted by the restored dump helpers.
         */
        log(...args: unknown[]): void {
          logCalls.push(args)
        },
      },
    })
    runtimeUtilities.UtDebug.logDebugWithBlankLine('line', 'payload')
    runtimeUtilities.UtDebug.logDebugWithBlankLine('single')
    runtimeUtilities.UtDebug.logDebugWithBlankLine('extra', 1, 2)
    runtimeUtilities.UtDebug.dumpHexBytes([0, 15, 16, 255], 4)
    runtimeUtilities.UtDebug.dumpArrayValues('values', [7, 8], ';')

    expect(logCalls).toEqual([
      ['line', 'payload'],
      ['\n'],
      ['single', undefined],
      ['\n'],
      ['extra', 1],
      ['\n'],
      ['%02X ', 0],
      ['%02X ', 15],
      ['%02X ', 16],
      ['%02X ', 255],
      ['\n'],
      ['%s\n', 'values'],
      ['%5d', 7],
      ['%s\n', ';'],
      [','],
      ['%5d', 8],
      ['%s\n', ';'],
      [','],
      ['\n'],
    ])
  })

  it('preserves UtDebug semantic exception logging behavior', () => {
    const logCalls: unknown[][] = []
    const runtimeUtilities = createCubism2RuntimeUtilities({
      logger: {
        /**
         * Captures UtDebug exception log output.
         * @param args Console-style payload produced by the restored exception logger.
         */
        log(...args: unknown[]): void {
          logCalls.push(args)
        },
      },
    })
    const errorLike = {
      stack: 'stack-line',
      /**
       * Preserves the runtime string-concatenation output used by exception logging.
       * @returns Stable exception label for logger assertions.
       */
      toString(): string {
        return 'error-like'
      },
    }

    runtimeUtilities.UtDebug.logException(errorLike)
    expect(logCalls).toEqual([['dump exception : error-like'], ['stack :: stack-line']])
  })

  it('routes WebGL clipping point tuple constants through semantic runtime constants', () => {
    const RuntimeConstants = createCubism2RuntimeConstants()
    expect(RuntimeConstants.POINT_X_OFFSET).toBe(0)
    expect(RuntimeConstants.POINT_TUPLE_SIZE).toBe(2)
  })

  it('routes extracted RuntimeConstants consumers through semantic constant names', () => {
    const RuntimeConstants = createCubism2RuntimeConstants()
    expect(RuntimeConstants.activeCoordinateMode).toBe(
      RuntimeConstants.MODEL_SPACE_COORDINATE_MODE,
    )
    expect(RuntimeConstants.MODEL_SPACE_COORDINATE_MODE).toBe(1)
    expect(RuntimeConstants.SDK2_COORDINATE_MODE).toBe(2)
    expect(RuntimeConstants.FLIP_MODEL_SPACE_UV_Y).toBe(true)
    expect(RuntimeConstants.maxTransformParameterDimensionCount).toBe(5)
    expect(RuntimeConstants.maxInterpolationCornerCount).toBe(65)
    expect(RuntimeConstants.PARAM_VALUE_EPSILON).toBe(0.0001)
    expect(RuntimeConstants.POINT_X_OFFSET).toBe(0)
    expect(RuntimeConstants.POINT_TUPLE_SIZE).toBe(2)

  })


  it('keeps Live2D runtime profile, error, and GL registries in a separate module', () => {
    const logCalls: unknown[][] = []
    const alertCalls: string[] = []
    const deletedFramebuffers: unknown[] = []
    const runtimeInfo = {
      /**
       * Forces the desktop branch unless a numeric profile is explicitly selected.
       * @returns False so `initProfile` does not choose the iOS profile.
       */
      isIOS(): boolean {
        return false
      },
      /**
       * Forces the desktop branch unless a numeric profile is explicitly selected.
       * @returns False so `initProfile` does not choose the Android profile.
       */
      isAndroid(): boolean {
        return false
      },
    }
    const Live2D = createCubism2Live2DRuntime({
      /**
       * Supplies the runtime browser profile after the legacy capsule creates it.
       * @returns Fake browser runtime flags used by `Live2D.initProfile`.
       */
      getBrowserRuntimeInfo() {
        return runtimeInfo
      },
      logger: {
        /**
         * Captures profile and one-time version logging without printing during unit tests.
         * @param args Console-style payload passed by the restored Live2D namespace.
         */
        log(...args: unknown[]): void {
          logCalls.push(args)
        },
      },
      /**
       * Captures unknown legacy numeric profile diagnostics.
       * @param message Alert text produced by the min.js default profile branch.
       */
      alert(message: string): void {
        alertCalls.push(message)
      },
    })

    expect(Live2D.getVersionStr()).toBe('2.1.00_1')
    expect(Live2D.getVersionNo()).toBe(201001000)
    expect(Live2D.verboseLoggingEnabled).toBe(true)
    expect(Live2D.shouldThrowOnInvalidInterpolationCorner).toBe(true)
    expect(Live2D.shouldClampSdk1GridPointsToUnitRange).toBe(true)
    expect(Live2D.L2D_DEFORMER_EXTEND).toBe(true)
    expect(Live2D.shouldUpdateClippedDrawContextOpacity).toBe(false)
    expect(Live2D.L2D_NO_ERROR).toBe(0)
    expect(Live2D.L2D_ERROR_MODEL_UPDATE).toBe(4000)
    expect(Live2D.L2D_COLOR_BLEND_MODE_MULT).toBe(0)
    expect(Live2D.L2D_COLOR_BLEND_MODE_ADD).toBe(1)
    expect(Live2D.L2D_COLOR_BLEND_MODE_INTERPOLATE).toBe(2)
    expect(Live2D.getClippingMaskBufferSize()).toBe(256)

    Live2D.setupProfile(9901, false)
    expect(Live2D.PROFILE_NAME).toBe('iOS Speed')
    expect(Live2D.EXPAND_W).toBe(4)
    expect(Live2D.USE_CACHED_POLYGON_IMAGE).toBe(true)

    Live2D.setupProfile(9904, false)
    expect(Live2D.PROFILE_NAME).toBe('Android')
    expect(Live2D.USE_ADJUST_TRANSLATION).toBe(false)
    expect(Live2D.EXPAND_W).toBe(2)

    Live2D.setErrorCode(Live2D.L2D_ERROR_MODEL_UPDATE)
    expect(Live2D.getError()).toBe(4000)
    expect(Live2D.getError()).toBe(0)

    const glContext = {
      /**
       * Records the framebuffer object that the restored deleteBuffer path asks WebGL to delete.
       * @param framebuffer Framebuffer registered in `Live2D.frameBuffers`.
       */
      deleteFramebuffer(framebuffer: unknown): void {
        deletedFramebuffers.push(framebuffer)
      },
    }
    Live2D.setGL(glContext, 3)
    Live2D.frameBuffers[3] = { framebuffer: 'framebuffer-3' }
    Live2D.fTexture[3] = 'texture-3'
    expect(Live2D.getGL(3)).toBe(glContext)

    Live2D.deleteBuffer(3)
    expect(deletedFramebuffers).toEqual(['framebuffer-3'])
    expect(Live2D.getGL(3)).toBeUndefined()
    expect(Live2D.frameBuffers[3]).toBeUndefined()

    Live2D.setClippingMaskBufferSize(512)
    expect(Live2D.getClippingMaskBufferSize()).toBe(512)
    Live2D.dispose()
    expect(Live2D.glContext).toEqual([])
    expect(Live2D.frameBuffers).toEqual([])
    expect(Live2D.fTexture).toEqual([])

    Live2D.setupProfile(1234, false)
    expect(alertCalls).toEqual(['Unknown Live2D profile: 1234'])

    Live2D.init()
    expect(logCalls[0]).toEqual(['Live2D %s', '2.1.00_1'])
    expect(logCalls).toContainEqual(['profile : Desktop'])
    expect(Live2D.PROFILE_NAME).toBe('Desktop')
  })

  it('routes Live2D version, startup, and error state through semantic runtime fields', () => {
    const logCalls: unknown[][] = []
    const Live2D = createCubism2Live2DRuntime({
      /**
       * Supplies desktop runtime flags so `init()` reaches the profile branch deterministically.
       * @returns Fake browser runtime info consumed by the restored static namespace.
       */
      getBrowserRuntimeInfo() {
        return {
          /**
           * Keeps the test on the non-iOS profile path.
           * @returns False so `PROFILE_IOS_DEFAULT` is not chosen.
           */
          isIOS(): boolean {
            return false
          },
          /**
           * Keeps the test on the non-Android profile path.
           * @returns False so `PROFILE_ANDROID` is not chosen.
           */
          isAndroid(): boolean {
            return false
          },
        }
      },
      logger: {
        /**
         * Captures one-time startup and profile logs without writing to the test console.
         * @param args Console payload passed by `Live2D.init()` and profile setup.
         */
        log(...args: unknown[]): void {
          logCalls.push(args)
        },
      },
    })

    expect(Live2D.versionString).toBe('2.1.00_1')
    Live2D.versionString = 'restored-version'
    expect(Live2D.getVersionStr()).toBe('restored-version')
    Live2D.versionString = '2.1.00_1'

    expect(Live2D.buildNumber).toBe(201001000)
    Live2D.buildNumber = 201002000
    expect(Live2D.getVersionNo()).toBe(201002000)
    Live2D.buildNumber = 201001000

    expect(Live2D.isInitializationPending).toBe(true)
    Live2D.init()
    expect(logCalls[0]).toEqual(['Live2D %s', '2.1.00_1'])
    expect(Live2D.isInitializationPending).toBe(false)

    Live2D.setErrorCode(4000)
    expect(Live2D.lastErrorCode).toBe(4000)
    expect(Live2D.getError()).toBe(4000)
    expect(Live2D.lastErrorCode).toBe(0)
    Live2D.setErrorCode(2001)
    expect(Live2D.lastErrorCode).toBe(2001)
  })

  it('routes clipped draw-context opacity updates through the semantic Live2D flag', () => {
    const Live2D = createCubism2Live2DRuntime({
      /**
       * Supplies desktop runtime flags so this semantic flag test does not depend on browser globals.
       * @returns Fake browser runtime info consumed by the restored static namespace.
       */
      getBrowserRuntimeInfo() {
        return {
          /**
           * Keeps the runtime off the iOS profile path.
           * @returns False so iOS-specific profile fields are not selected.
           */
          isIOS(): boolean {
            return false
          },
          /**
           * Keeps the runtime off the Android profile path.
           * @returns False so Android-specific profile fields are not selected.
           */
          isAndroid(): boolean {
            return false
          },
        }
      },
    })
    expect(Live2D.shouldUpdateClippedDrawContextOpacity).toBe(false)
    Live2D.shouldUpdateClippedDrawContextOpacity = true
    expect(Live2D.shouldUpdateClippedDrawContextOpacity).toBe(true)
    Live2D.shouldUpdateClippedDrawContextOpacity = false

    class FakeParamBindingSet {
      /**
       * Satisfies the param-binding initialization shape for this focused DrawData fixture.
       */
      initBindingList(): void {}

      /**
       * Reports no parameter change because this test drives clipping through the interpolator stub.
       * @param modelContext Runtime model context forwarded by generic interpolation helpers.
       * @returns False so accidental generic interpolation does not mark the context dirty.
       */
      hasChangedParams(modelContext: unknown): boolean {
        void modelContext
        return false
      }

      /**
       * Satisfies the interpolation helper shape for accidental generic calls.
       * @param modelContext Runtime model context forwarded by generic interpolation helpers.
       * @param dirtyFlagRef Mutable dirty flag reference owned by the draw context.
       * @returns Zero dimensions because this fixture does not compute real interpolation weights.
       */
      resolveInterpolationWeights(modelContext: unknown, dirtyFlagRef: boolean[]): number {
        void modelContext
        dirtyFlagRef[0] = false
        return 0
      }

      /**
       * Satisfies the interpolation-corner helper shape for accidental generic calls.
       * @param indexBuffer Corner index scratch buffer.
       * @param weightBuffer Corner weight scratch buffer.
       * @param dimensionCount Active interpolation dimension count.
       */
      buildInterpolationCorners(
        indexBuffer: ArrayLike<number>,
        weightBuffer: ArrayLike<number>,
        dimensionCount: number,
      ): void {
        void indexBuffer
        void weightBuffer
        void dimensionCount
      }
    }
    const interpolationCalls: string[] = []
    const live2DFlags = {
      shouldUpdateClippedDrawContextOpacity: false,
      isVerboseLoggingEnabled: () => false,
    }
    const drawConstructors = createCubism2DrawData({
      BaseDataID: createTestBaseDataIdDependency({ id: 'EMPTY' }),
      Cubism2DrawContextBase: createCubism2DrawContextBase({
        isBootstrapping: () => false,
      }),
      Cubism2MocVersion: {
        MAX_SUPPORTED_FORMAT_VERSION: 2,
        LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: 2,
      },
      Cubism2ParamBindingSet: FakeParamBindingSet,
      Cubism2RuntimeConstants: {
        FLIP_MODEL_SPACE_UV_Y: true,
        MODEL_SPACE_COORDINATE_MODE: 1,
        POINT_TUPLE_SIZE: 5,
        POINT_X_OFFSET: 0,
        SDK2_COORDINATE_MODE: 2,
        activeCoordinateMode: 2,
      },
      Live2D: live2DFlags,
      UtDebug: {
        /**
         * Ignores diagnostics unrelated to clipped opacity routing.
         * @param message Legacy diagnostic message.
         * @param args Optional diagnostic values.
         */
        logWithLegacyPrefix(message: string, ...args: unknown[]): void {
          void message
          void args
        },
      },
      interpolator: {
        /**
         * Fails if this focused DrawData test unexpectedly reaches point interpolation.
         */
        interpolatePoints(): void {
          throw new Error('point interpolation is outside clipped opacity routing')
        },
        /**
         * Simulates a clipped draw-order interpolation result.
         * @param modelContext Runtime model context forwarded by DrawData.
         * @param paramBindingSet DrawData parameter binding set.
         * @param dirtyFlagRef Dirty flag reference that marks the draw context as clipped.
         * @param sourceValues Authored draw-order values.
         * @returns Deterministic draw order used by the focused assertion.
         */
        interpolateInteger(
          modelContext: unknown,
          paramBindingSet: unknown,
          dirtyFlagRef: boolean[],
          sourceValues: ArrayLike<number> | null,
        ): number {
          void modelContext
          void paramBindingSet
          interpolationCalls.push('integer')
          dirtyFlagRef[0] = true
          return sourceValues?.[0] ?? 7
        },
        /**
         * Simulates the opacity interpolation that should only run when the semantic flag permits it.
         * @param modelContext Runtime model context forwarded by DrawData.
         * @param paramBindingSet DrawData parameter binding set.
         * @param dirtyFlagRef Dirty flag reference shared with draw-order interpolation.
         * @param sourceValues Authored opacity values.
         * @returns Deterministic opacity used by the focused assertion.
         */
        interpolateFloat(
          modelContext: unknown,
          paramBindingSet: unknown,
          dirtyFlagRef: boolean[],
          sourceValues: ArrayLike<number> | null,
        ): number {
          void modelContext
          void paramBindingSet
          void dirtyFlagRef
          interpolationCalls.push('float')
          return sourceValues?.[0] ?? 0.66
        },
      },
      isBootstrapping: () => false,
    })
    const drawData = new drawConstructors.Cubism2DrawDataBase()
    drawData.paramBindingSet = new FakeParamBindingSet()
    drawData.drawOrderValues = [9]
    drawData.opacityValues = [0.66]
    const drawContext = {
      clippedFlagRef: [false],
      drawOrder: 0,
      interpolatedOpacity: 0.12,
    } as unknown as ReturnType<typeof createCubism2DrawContextBase>['prototype']

    drawData.updateDrawContext({ kind: 'model-context' } as never, drawContext)
    expect(interpolationCalls).toEqual(['integer'])
    expect(drawContext.drawOrder).toBe(9)
    expect(drawContext.interpolatedOpacity).toBe(0.12)

    interpolationCalls.length = 0
    live2DFlags.shouldUpdateClippedDrawContextOpacity = true
    drawData.updateDrawContext({ kind: 'model-context' } as never, drawContext)
    expect(interpolationCalls).toEqual(['integer', 'float'])
    expect(drawContext.interpolatedOpacity).toBe(0.66)
  })

  it('routes invalid interpolation corner guards through the semantic Live2D flag', () => {
    const Live2D = createCubism2Live2DRuntime({
      /**
       * Supplies desktop runtime flags so this semantic flag test does not depend on browser globals.
       * @returns Fake browser runtime info consumed by the restored static namespace.
       */
      getBrowserRuntimeInfo() {
        return {
          /**
           * Keeps the runtime off the iOS profile path.
           * @returns False so iOS-specific profile fields are not selected.
           */
          isIOS(): boolean {
            return false
          },
          /**
           * Keeps the runtime off the Android profile path.
           * @returns False so Android-specific profile fields are not selected.
           */
          isAndroid(): boolean {
            return false
          },
        }
      },
    })
    expect(Live2D.shouldThrowOnInvalidInterpolationCorner).toBe(true)
    Live2D.shouldThrowOnInvalidInterpolationCorner = false
    expect(Live2D.shouldThrowOnInvalidInterpolationCorner).toBe(false)
    Live2D.shouldThrowOnInvalidInterpolationCorner = true

    const live2DFlags = {
      shouldThrowOnInvalidInterpolationCorner: true,
    }
    const constructors = createCubism2ParamBindings({
      Cubism2RuntimeConstants: {
        PARAM_VALUE_EPSILON: 0.0001,
        maxInterpolationCornerCount: 65,
      },
      Live2D: live2DFlags,
      isBootstrapping: () => false,
    })
    const bindingSet = new constructors.Cubism2ParamBindingSet()
    bindingSet.initBindingList()
    bindingSet.addParamBinding('ParamAngleX', 2, [0, 1])
    const binding = bindingSet.getBindings()![0]!
    binding.setLowerPointIndex(-1)
    binding.setInterpolationWeight(0)
    const cornerIndexes = new Array(2).fill(0)
    const cornerWeights = new Array(2).fill(0)
    const previousException = (globalThis as Record<string, unknown>).Exception
    ;(globalThis as Record<string, unknown>).Exception = Error
    try {
      expect(() => bindingSet.buildInterpolationCorners(cornerIndexes, cornerWeights, 0)).toThrow(
        'err 23246',
      )
      live2DFlags.shouldThrowOnInvalidInterpolationCorner = false
      expect(() =>
        bindingSet.buildInterpolationCorners(cornerIndexes, cornerWeights, 0),
      ).not.toThrow()
    } finally {
      if (previousException === undefined) {
        delete (globalThis as Record<string, unknown>).Exception
      } else {
        ;(globalThis as Record<string, unknown>).Exception = previousException
      }
    }
  })

  it('routes SDK1 grid clamp guards through the semantic Live2D flag', () => {
    const Live2D = createCubism2Live2DRuntime({
      /**
       * Supplies desktop runtime flags so this semantic flag test does not depend on browser globals.
       * @returns Fake browser runtime info consumed by the restored static namespace.
       */
      getBrowserRuntimeInfo() {
        return {
          /**
           * Keeps the runtime off the iOS profile path.
           * @returns False so iOS-specific profile fields are not selected.
           */
          isIOS(): boolean {
            return false
          },
          /**
           * Keeps the runtime off the Android profile path.
           * @returns False so Android-specific profile fields are not selected.
           */
          isAndroid(): boolean {
            return false
          },
        }
      },
    })
    expect(Live2D.shouldClampSdk1GridPointsToUnitRange).toBe(true)
    Live2D.shouldClampSdk1GridPointsToUnitRange = false
    expect(Live2D.shouldClampSdk1GridPointsToUnitRange).toBe(false)
    Live2D.shouldClampSdk1GridPointsToUnitRange = true

    const live2DFlags = {
      isVerboseLoggingEnabled: () => false,
      shouldClampSdk1GridPointsToUnitRange: true,
    }
    const Cubism2BaseContext = createCubism2BaseContext({
      isBootstrapping: () => false,
    })
    const Cubism2BaseData = createCubism2BaseData({
      BaseDataID: createTestBaseDataIdDependency({ id: 'DEFAULT_GRID_BASE' }),
      Cubism2MocVersion: {
        LIVE2D_FORMAT_VERSION_V2_10_SDK2: 33,
      },
      interpolator: {
        /**
         * Supplies a deterministic opacity value for unused base-data setup paths.
         * @returns Full opacity because this test directly targets SDK1 point mapping.
         */
        interpolateFloat(): number {
          return 1
        },
      },
      isBootstrapping: () => false,
    })
    const constructors = createCubism2GridBaseData({
      Cubism2BaseContext,
      Cubism2BaseData,
      Cubism2Interpolation: {
        /**
         * Fails if this focused SDK1 mapping test unexpectedly reaches SDK2 interpolation.
         */
        interpolatePoints(): void {
          throw new Error('SDK2 interpolation is outside SDK1 clamp routing')
        },
      },
      Cubism2ParamBindingSet: class {
        /**
         * Satisfies the grid constructor dependency; this test sets grid dimensions manually.
         */
        initBindingList(): void {}
      } as never,
      Live2D: live2DFlags,
      System: {
        err: {
          /**
           * Ignores legacy diagnostics unrelated to SDK1 clamp routing.
           * @param message Legacy printf-style diagnostic.
           * @param args Optional diagnostic payload.
           */
          printf(message: string, ...args: unknown[]): void {
            void message
            void args
          },
        },
      },
      UtDebug: {
        /**
         * Ignores target-base diagnostics unrelated to SDK1 clamp routing.
         * @param message Legacy diagnostic string.
         * @param args Optional diagnostic payload.
         */
        logWithLegacyPrefix(message: string, ...args: unknown[]): void {
          void message
          void args
        },
      },
      isBootstrapping: () => false,
    })
    const gridBaseData = new constructors.Cubism2GridBaseData()
    gridBaseData.gridColumnCount = 1
    gridBaseData.gridRowCount = 1
    const sourceContext = {
      localPoints: [0, 0, 10, 0, 0, 10, 10, 10],
      targetSpacePoints: null,
    }
    const sourcePoints = [-0.25, 0.5]
    const clampedOutput = [0, 0] as MutableNumberArray

    gridBaseData.transformPointsSdk1(
      { kind: 'sdk1-grid-model-context' },
      sourceContext,
      sourcePoints,
      clampedOutput,
      1,
      0,
      2,
    )
    expect(clampedOutput[0]).toBeCloseTo(0)
    expect(clampedOutput[1]).toBeCloseTo(5)

    live2DFlags.shouldClampSdk1GridPointsToUnitRange = false
    const unclampedOutput = [0, 0] as MutableNumberArray
    gridBaseData.transformPointsSdk1(
      { kind: 'sdk1-grid-model-context' },
      sourceContext,
      sourcePoints,
      unclampedOutput,
      1,
      0,
      2,
    )
    expect(unclampedOutput[0]).toBeCloseTo(-2.5)
    expect(unclampedOutput[1]).toBeCloseTo(5)
  })

  it('reports semantic browser system information flags', () => {
    const logger = { logWithLegacyPrefix: vi.fn() }
    const iPhoneRuntimeInfo = createCubism2BrowserRuntimeInfo({
      logger,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15',
    })
    expect(iPhoneRuntimeInfo.isIPhone()).toBe(true)
    expect(iPhoneRuntimeInfo.SYSTEM_INFO?.isIPhone).toBe(true)

    const iPadRuntimeInfo = createCubism2BrowserRuntimeInfo({
      logger,
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/605.1.15',
    })
    expect(iPadRuntimeInfo.isIOS()).toBe(true)
    expect(iPadRuntimeInfo.SYSTEM_INFO?.isIPad).toBe(true)

    const androidRuntimeInfo = createCubism2BrowserRuntimeInfo({
      logger,
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0',
    })
    expect(androidRuntimeInfo.isAndroid()).toBe(true)
    expect(androidRuntimeInfo.SYSTEM_INFO?.isAndroid).toBe(true)
  })

  it('keeps Cubism2Matrix44 in a separate module with safe rotation and multiplication semantics', () => {
    const Cubism2Math = createCubism2Math()
    const Matrix44 = createCubism2Matrix44({ Cubism2Math })
    const transform = new Matrix44()

    expect(Array.from(transform.getBackingMatrixArray())).toEqual([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ])

    transform.applyLocalTranslation(2, 3, 4)
    expect(transform.getBackingMatrixArray()[12]).toBe(2)
    expect(transform.getBackingMatrixArray()[13]).toBe(3)
    expect(transform.getBackingMatrixArray()[14]).toBe(4)

    transform.resetToIdentity()
    transform.applyLocalScale(2, 3, 4)
    expect(transform.getBackingMatrixArray()[0]).toBe(2)
    expect(transform.getBackingMatrixArray()[5]).toBe(3)
    expect(transform.getBackingMatrixArray()[10]).toBe(4)

    transform.resetToIdentity()
    expect(() => transform.rotateAroundYAxis(Math.PI / 2)).not.toThrow()
    expect(transform.getBackingMatrixArray()[0]).toBeCloseTo(0)
    expect(transform.getBackingMatrixArray()[8]).toBeCloseTo(1)
    expect(transform.getBackingMatrixArray()[2]).toBeCloseTo(-1)
    expect(transform.getBackingMatrixArray()[10]).toBeCloseTo(0)

    const leftMatrix = new Matrix44()
    const rightMatrix = new Matrix44()
    const targetMatrix = new Matrix44()
    leftMatrix.applyLocalTranslation(10, 20, 0)
    rightMatrix.applyLocalScale(2, 3, 1)

    expect(leftMatrix.multiplyIntoTargetMatrix(rightMatrix, targetMatrix, false)).toBe(targetMatrix)
    expect(targetMatrix.getBackingMatrixArray()[0]).toBe(2)
    expect(targetMatrix.getBackingMatrixArray()[5]).toBe(3)
    expect(targetMatrix.getBackingMatrixArray()[12]).toBe(10)
    expect(targetMatrix.getBackingMatrixArray()[13]).toBe(20)

    leftMatrix.multiplyIntoTargetMatrix(rightMatrix, leftMatrix, false)
    expect(leftMatrix.getBackingMatrixArray()[0]).toBe(2)
    expect(leftMatrix.getBackingMatrixArray()[5]).toBe(3)
  })


  it('keeps the Canvas draw parameter in a separate module while preserving JS model draw behavior', () => {
    const runtimeUtilities = createCubism2RuntimeUtilities()
    const releasedTextures: Array<{ deleteMode: number; textureIndex: number; textureId: number }> =
      []
    const drawCalls: Array<{
      drawContext: unknown
      expandedStrokeWidth: number
      indexArray: unknown
      opacity: number
      texture: unknown
      transform: unknown
      uvArray: unknown
      vertexArray: unknown
    }> = []

    /**
     * Minimal base constructor used to prove CanvasDrawParam still calls the inherited initializer.
     */
    function DrawParamBaseStub(this: { baseInitialized?: boolean }): void {
      this.baseInitialized = true
    }

    const CanvasDrawParam = createCubism2CanvasDrawParam({
      Cubism2DrawParamBase: DrawParamBaseStub as never,
      Live2D: { EXPAND_W: 4 },
      UtSystem: runtimeUtilities.UtSystem,
      isBootstrapping: () => false,
    })
    const drawParam = new CanvasDrawParam() as ReturnType<
      typeof createCubism2CanvasDrawParam
    >['prototype'] & {
      baseInitialized?: boolean
    }
    const texture = { id: 'texture-2' }
    const transform = { id: 'canvas-transform' }
    const drawContext = { id: 'draw-context' }

    drawParam.setGL({
      /**
       * Records texture release calls made by the semantic renderer hook.
       * @param deleteMode Legacy release mode argument.
       * @param textureIds Mutable texture id array owned by the draw parameter.
       * @param textureIndex Released texture slot.
       */
      releaseTextureIdAtIndex(deleteMode, textureIds, textureIndex) {
        const textureId = textureIds[textureIndex]
        expect(textureId).not.toBeUndefined()
        releasedTextures.push({ deleteMode, textureIndex, textureId: textureId! })
      },
      /**
       * Records Canvas2D draw calls without touching a real rendering context.
       * @param nextTexture Canvas texture handle selected by the draw parameter.
       * @param indexArray Triangle indexes forwarded to the renderer.
       * @param vertexArray Vertex positions forwarded to the renderer.
       * @param uvArray Texture UVs forwarded to the renderer.
       * @param opacity Effective opacity forwarded to the renderer.
       * @param expandedStrokeWidth Expansion width derived from `Live2D.EXPAND_W`.
       * @param nextTransform Canvas transform forwarded to the renderer.
       * @param nextDrawContext Draw context forwarded to the renderer.
       */
      drawElements(
        nextTexture,
        indexArray,
        vertexArray,
        uvArray,
        opacity,
        expandedStrokeWidth,
        nextTransform,
        nextDrawContext,
      ) {
        drawCalls.push({
          drawContext: nextDrawContext,
          expandedStrokeWidth,
          indexArray,
          opacity,
          texture: nextTexture,
          transform: nextTransform,
          uvArray,
          vertexArray,
        })
      },
    })
    drawParam.setTransform(transform)
    drawParam.setTexture(2, texture)
    drawParam.drawTexture(2, 3, [0, 1, 2], [10, 20], [0.5, 0.75], 0.95, 0, drawContext)
    drawParam.drawTexture(2, 3, [0, 1, 2], [10, 20], [0.5, 0.75], 0.005, 0, drawContext)

    expect(drawParam.baseInitialized).toBe(true)
    expect(drawCalls).toEqual([
      {
        drawContext,
        expandedStrokeWidth: 4,
        indexArray: [0, 1, 2],
        opacity: 0.95,
        texture,
        transform,
        uvArray: [0.5, 0.75],
        vertexArray: [10, 20],
      },
    ])

    drawParam.textureIds[3] = 77
    drawParam.releaseRendererTextures()

    expect(releasedTextures).toEqual([{ deleteMode: 1, textureIndex: 3, textureId: 77 }])
    expect(drawParam.textureIds[3]).toBe(0)
    expect(() => drawParam.getTextureCount()).toThrow(
      'Canvas draw parameters do not expose a texture count',
    )
    expect(() => drawParam.setDrawParam({ kind: 'canvas-draw-param' })).toThrow(
      'Canvas draw parameters cannot be reassigned',
    )

    drawParam.textureIds[4] = 88
    drawParam.releaseRendererTextures()

    expect(releasedTextures).toEqual([
      { deleteMode: 1, textureIndex: 3, textureId: 77 },
      { deleteMode: 1, textureIndex: 4, textureId: 88 },
    ])
    expect(drawParam.textureIds[4]).toBe(0)
    drawParam.setTexture(80, { id: 'expanded-texture' })
    expect(drawParam.textureIds.length).toBeGreaterThan(80)
    expect(drawParam.textureHandles[80]).toEqual({ id: 'expanded-texture' })
    expect(CanvasDrawParam.isDebugEnabled()).toBe(false)
    CanvasDrawParam.setDebugEnabled(true)
    expect(CanvasDrawParam.isDebugEnabled()).toBe(true)
    expect(CanvasDrawParam.createFloatBuffer(2)).toBeInstanceOf(Float32Array)
    expect(CanvasDrawParam.createIndexBuffer(2)).toBeInstanceOf(Int16Array)

    const floatBuffer = {
      data: [0, 0, 0] as number[],
      position: -1,
      /**
       * Reports the buffer capacity available to the Canvas staging helper.
       * @returns Current writable capacity.
       */
      getCapacity() {
        return this.data.length
      },
      /**
       * Rewinds the legacy buffer cursor.
       * @param position New cursor position.
       */
      setWritePosition(position: number) {
        this.position = position
      },
      /**
       * Clears staged values before reusing an existing buffer.
       */
      clear() {
        this.data = []
      },
      /**
       * Copies source values into the fake staging buffer.
       * @param values Values copied by the Canvas staging helper.
       */
      put(values: ArrayLike<number>) {
        this.data = Array.from(values)
      },
    }
    const updatedFloatBuffer = CanvasDrawParam.updateFloatBuffer(floatBuffer as never, [1, 2, 3])

    expect(updatedFloatBuffer).toBe(floatBuffer)
    expect(floatBuffer.data).toEqual([1, 2, 3])
    expect(floatBuffer.position).toBe(0)

    const indexBuffer = {
      data: [0, 0, 0] as number[],
      position: -1,
      /**
       * Reports the buffer capacity available to the Canvas index helper.
       * @returns Current writable capacity.
       */
      getCapacity() {
        return this.data.length
      },
      /**
       * Rewinds the legacy index buffer cursor.
       * @param position New cursor position.
       */
      setWritePosition(position: number) {
        this.position = position
      },
      /**
       * Clears staged indexes before reusing an existing buffer.
       */
      clear() {
        this.data = []
      },
      /**
       * Copies triangle indexes into the fake staging buffer.
       * @param values Index values copied by the Canvas staging helper.
       */
      put(values: ArrayLike<number>) {
        this.data = Array.from(values)
      },
    }
    const updatedIndexBuffer = CanvasDrawParam.updateIndexBuffer(indexBuffer as never, [2, 1, 0])

    expect(updatedIndexBuffer).toBe(indexBuffer)
    expect(indexBuffer.data).toEqual([2, 1, 0])
    expect(indexBuffer.position).toBe(0)

    const tinyFloatBuffer = {
      /**
       * Reports too-small capacity so the helper allocates a replacement buffer.
       * @returns Current fake capacity.
       */
      getCapacity() {
        return 1
      },
    }
    const grownFloatBuffer = CanvasDrawParam.updateFloatBuffer(tinyFloatBuffer as never, [1, 2, 3])
    expect(grownFloatBuffer).toBeInstanceOf(Float32Array)
    expect(grownFloatBuffer.length).toBe(6)
    expect(Array.from(grownFloatBuffer.slice(0, 3))).toEqual([1, 2, 3])

    const tinyIndexBuffer = {
      /**
       * Reports too-small capacity so the helper allocates a replacement index buffer.
       * @returns Current fake capacity.
       */
      getCapacity() {
        return 1
      },
    }
    const grownIndexBuffer = CanvasDrawParam.updateIndexBuffer(tinyIndexBuffer as never, [2, 1, 0])
    expect(grownIndexBuffer).toBeInstanceOf(Int16Array)
    expect(grownIndexBuffer.length).toBe(6)
    expect(Array.from(grownIndexBuffer.slice(0, 3))).toEqual([2, 1, 0])
  })

  it('grows WebGL draw-param staging buffers with legacy writable-buffer semantics', () => {
    const { WebGLDrawParam } = createWebGLDrawParamHarness()

    const grownFloatBuffer = WebGLDrawParam.updateFloatBuffer(
      {
        /**
         * Reports too-small capacity so the helper allocates a replacement buffer.
         * @returns Current fake capacity.
         */
        getCapacity() {
          return 1
        },
      } as never,
      [1, 2, 3],
    )
    const grownIndexBuffer = WebGLDrawParam.updateIndexBuffer(
      {
        /**
         * Reports too-small capacity so the helper allocates a replacement index buffer.
         * @returns Current fake capacity.
         */
        getCapacity() {
          return 1
        },
      } as never,
      [2, 1, 0],
    )

    expect(grownFloatBuffer).toBeInstanceOf(Float32Array)
    expect(grownFloatBuffer.length).toBe(6)
    expect(Array.from(grownFloatBuffer.slice(0, 3))).toEqual([1, 2, 3])
    expect(grownIndexBuffer).toBeInstanceOf(Int16Array)
    expect(grownIndexBuffer.length).toBe(6)
    expect(Array.from(grownIndexBuffer.slice(0, 3))).toEqual([2, 1, 0])
  })

  it('keeps the WebGL draw parameter in a separate module while preserving shader draw behavior', () => {
    const { calls, constants, debugMessages, drawParam, live2DProfile } =
      createWebGLDrawParamHarness()
    const texture = drawParam.textures[0]

    drawParam.prepareDrawState()
    drawParam.drawTexture(
      0,
      3,
      new Uint16Array([0, 1, 2]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      0.8,
      0,
      { id: 'draw-context' },
    )

    const callNames = calls.map((call) => call.method)
    const drawElementsCall = calls.find((call) => call.method === 'drawElements')
    const blendFuncCall = calls.find((call) => call.method === 'blendFuncSeparate')
    const firstLocationQueryIndex = callNames.findIndex(
      (method) => method === 'getAttribLocation' || method === 'getUniformLocation',
    )
    const shaderSourceCalls = calls.filter((call) => call.method === 'shaderSource')
    const textureBindCalls = calls.filter((call) => call.method === 'bindTexture')

    expect(debugMessages).toEqual([])
    expect(callNames).toContain('createProgram')
    expect(callNames).toContain('createShader')
    expect(callNames).toContain('linkProgram')
    expect(callNames).toContain('useProgram')
    expect(callNames).toContain('bufferData')
    expect(callNames.lastIndexOf('linkProgram')).toBeLessThan(firstLocationQueryIndex)
    expect(drawElementsCall?.args).toEqual([constants.TRIANGLES, 3, constants.UNSIGNED_SHORT, 0])
    expect(blendFuncCall?.args).toEqual([
      constants.ONE,
      constants.ONE_MINUS_SRC_ALPHA,
      constants.ONE,
      constants.ONE_MINUS_SRC_ALPHA,
    ])
    expect(shaderSourceCalls.map((call) => call.args[1])).toEqual([
      CUBISM2_WEBGL_SHADER_SOURCES.meshVertex,
      CUBISM2_WEBGL_SHADER_SOURCES.clippedMeshVertex,
      CUBISM2_WEBGL_SHADER_SOURCES.meshFragment,
      CUBISM2_WEBGL_SHADER_SOURCES.clippedMeshFragment,
    ])
    expect(textureBindCalls.some((call) => call.args[1] === texture)).toBe(true)

    expect(() => drawParam.getTextureCount()).toThrow(
      'WebGL draw parameters do not expose a texture count',
    )
    expect(() => drawParam.setDrawParam({ kind: 'webgl-draw-param' })).toThrow(
      'WebGL draw parameters cannot be reassigned',
    )

    drawParam.releaseRendererTextures()
    expect(
      calls.some((call) => call.method === 'releaseTextureAtIndex' && call.args[2] === 0),
    ).toBe(true)
    expect(drawParam.textures[0]).toBeNull()

    const framebufferResources = drawParam.createFramebuffer()
    expect(framebufferResources.texture).toBe(live2DProfile.fTexture[3])
    expect(calls.some((call) => call.method === 'framebufferTexture2D')).toBe(true)
  })

  it('preserves the WebGL unclipped draw branch attribute setup order from min.js', () => {
    const { calls, constants, drawParam } = createWebGLDrawParamHarness()
    const sourceTexture = drawParam.textures[0]

    drawParam.prepareDrawState()
    calls.length = 0
    drawParam.drawTexture(
      0,
      3,
      new Uint16Array([0, 1, 2]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      0.8,
      0,
      { id: 'unclipped-order-context' },
    )

    expectCubism2WebGLAttributePointerOrder(
      calls,
      constants,
      drawParam.a_position_Loc,
      drawParam.a_texCoord_Loc,
      sourceTexture,
      constants.TEXTURE1!,
      drawParam.s_texture0_Loc,
    )
  })

  it('preserves the WebGL mask-generation draw branch uniforms and blend state', () => {
    const { calls, constants, debugMessages, drawParam } = createWebGLDrawParamHarness()
    const sourceTexture = drawParam.textures[0]
    const maskMatrix = new Float32Array(16)
    drawParam.clipBufPre_clipContextMask = {
      layoutBounds: {
        /**
         * Reports the right edge of the mask layout tile.
         * @returns Normalized right edge.
         */
        getRight() {
          return 0.7
        },
        /**
         * Reports the bottom edge of the mask layout tile.
         * @returns Normalized bottom edge.
         */
        getBottom() {
          return 0.9
        },
        x: 0.2,
        y: 0.3,
      },
      layoutChannelNo: 0,
      matrixForDraw: new Float32Array(16),
      matrixForMask: maskMatrix,
    }

    drawParam.prepareDrawState()
    calls.length = 0
    drawParam.drawTexture(
      0,
      3,
      new Uint16Array([0, 1, 2]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      0.005,
      0,
      { id: 'mask-context' },
    )

    const frontFaceCall = calls.find((call) => call.method === 'frontFace')
    const maskMatrixCall = calls.find(
      (call) => call.method === 'uniformMatrix4fv' && call.args[2] === maskMatrix,
    )
    const channelCall = calls.find(
      (call) =>
        call.method === 'uniform4f' &&
        call.args[1] === 0.1 &&
        call.args[2] === 0.2 &&
        call.args[3] === 0.3 &&
        call.args[4] === 0.4,
    )
    const boundsCall = calls.find(
      (call) =>
        call.method === 'uniform4f' &&
        call.args[1] === -0.6 &&
        call.args[2] === -0.4 &&
        call.args[3] === 0.3999999999999999 &&
        call.args[4] === 0.8,
    )
    const maskFlagCall = calls.find((call) => call.method === 'uniform1i' && call.args[1] === true)
    const blendFuncCall = calls.find((call) => call.method === 'blendFuncSeparate')
    const drawElementsCall = calls.find((call) => call.method === 'drawElements')

    expect(debugMessages).toEqual([])
    expect(frontFaceCall?.args).toEqual([constants.CCW])
    expectCubism2WebGLAttributePointerOrder(
      calls,
      constants,
      drawParam.a_position_Loc,
      drawParam.a_texCoord_Loc,
      sourceTexture,
      constants.TEXTURE1!,
      drawParam.s_texture0_Loc,
    )
    expect(maskMatrixCall).toBeTruthy()
    expect(channelCall).toBeTruthy()
    expect(boundsCall).toBeTruthy()
    expect(maskFlagCall).toBeTruthy()
    expect(blendFuncCall?.args).toEqual([
      constants.ONE,
      constants.ONE_MINUS_SRC_ALPHA,
      constants.ONE,
      constants.ONE_MINUS_SRC_ALPHA,
    ])
    expect(drawElementsCall?.args).toEqual([constants.TRIANGLES, 3, constants.UNSIGNED_SHORT, 0])
  })

  it('preserves the WebGL clipped draw branch mask texture and additive blend state', () => {
    const { calls, constants, debugMessages, drawParam, live2DProfile } =
      createWebGLDrawParamHarness()
    const sourceTexture = drawParam.textures[0]
    const maskTexture = { id: 'mask-texture' }
    const drawMatrix = new Float32Array(16)
    live2DProfile.fTexture[3] = maskTexture
    drawParam.clipBufPre_clipContextDraw = {
      layoutBounds: {
        /**
         * Reports the unused right edge for shape compatibility with clip contexts.
         * @returns Normalized right edge.
         */
        getRight() {
          return 1
        },
        /**
         * Reports the unused bottom edge for shape compatibility with clip contexts.
         * @returns Normalized bottom edge.
         */
        getBottom() {
          return 1
        },
        x: 0,
        y: 0,
      },
      layoutChannelNo: 1,
      matrixForDraw: drawMatrix,
      matrixForMask: new Float32Array(16),
    }

    drawParam.prepareDrawState()
    calls.length = 0
    drawParam.drawTexture(
      0,
      3,
      new Uint16Array([0, 1, 2]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      new Float32Array([0, 0, 1, 0, 0, 1]),
      0.75,
      1,
      { id: 'draw-context' },
    )

    const texture2Call = calls.find(
      (call) => call.method === 'activeTexture' && call.args[0] === constants.TEXTURE2,
    )
    const maskTextureBindCall = calls.find(
      (call) => call.method === 'bindTexture' && call.args[1] === maskTexture,
    )
    const clipMatrixCall = calls.find(
      (call) => call.method === 'uniformMatrix4fv' && call.args[2] === drawMatrix,
    )
    const modelMatrixCall = calls.find(
      (call) => call.method === 'uniformMatrix4fv' && call.args[2] === drawParam.matrix4x4,
    )
    const channelCall = calls.find(
      (call) =>
        call.method === 'uniform4f' &&
        call.args[1] === 0.5 &&
        call.args[2] === 0.6 &&
        call.args[3] === 0.7 &&
        call.args[4] === 0.8,
    )
    const baseColorCall = calls.find(
      (call) =>
        call.method === 'uniform4f' &&
        call.args[1] === 0.75 &&
        call.args[2] === 0.75 &&
        call.args[3] === 0.75 &&
        call.args[4] === 0.75,
    )
    const blendFuncCall = calls.find((call) => call.method === 'blendFuncSeparate')

    expect(debugMessages).toEqual([])
    expectCubism2WebGLAttributePointerOrder(
      calls,
      constants,
      drawParam.a_position_Loc_Off,
      drawParam.a_texCoord_Loc_Off,
      sourceTexture,
      constants.TEXTURE1!,
      drawParam.s_texture0_Loc_Off,
    )
    expect(texture2Call).toBeTruthy()
    expect(maskTextureBindCall).toBeTruthy()
    expect(clipMatrixCall).toBeTruthy()
    expect(modelMatrixCall).toBeTruthy()
    expect(channelCall).toBeTruthy()
    expect(baseColorCall).toBeTruthy()
    expect(calls.indexOf(clipMatrixCall!)).toBeLessThan(calls.indexOf(modelMatrixCall!))
    expect(calls.indexOf(modelMatrixCall!)).toBeLessThan(calls.indexOf(texture2Call!))
    expect(calls.indexOf(texture2Call!)).toBeLessThan(calls.indexOf(maskTextureBindCall!))
    expect(calls.indexOf(maskTextureBindCall!)).toBeLessThan(calls.indexOf(channelCall!))
    expect(calls.indexOf(channelCall!)).toBeLessThan(calls.indexOf(baseColorCall!))
    expect(blendFuncCall?.args).toEqual([
      constants.ONE,
      constants.ONE,
      constants.ZERO,
      constants.ONE,
    ])
  })

  it('resolves Cubism2 WebGL blend factor tables outside the draw parameter', () => {
    const { constants, gl } = createRecordingWebGLContext()
    const blendModes = {
      BLEND_ADD: 1,
      BLEND_MULTIPLY: 2,
      BLEND_NORMAL: 0,
    }

    expect(
      resolveCubism2WebGLBlendFactors({
        blendMode: blendModes.BLEND_ADD,
        blendModes,
        gl,
        isMaskDraw: true,
      }),
    ).toEqual({
      dstAlphaBlendFactor: constants.ONE_MINUS_SRC_ALPHA,
      dstRgbBlendFactor: constants.ONE_MINUS_SRC_ALPHA,
      srcAlphaBlendFactor: constants.ONE,
      srcRgbBlendFactor: constants.ONE,
    })
    expect(
      resolveCubism2WebGLBlendFactors({
        blendMode: blendModes.BLEND_NORMAL,
        blendModes,
        gl,
        isMaskDraw: false,
      }),
    ).toEqual({
      dstAlphaBlendFactor: constants.ONE_MINUS_SRC_ALPHA,
      dstRgbBlendFactor: constants.ONE_MINUS_SRC_ALPHA,
      srcAlphaBlendFactor: constants.ONE,
      srcRgbBlendFactor: constants.ONE,
    })
    expect(
      resolveCubism2WebGLBlendFactors({
        blendMode: blendModes.BLEND_ADD,
        blendModes,
        gl,
        isMaskDraw: false,
      }),
    ).toEqual({
      dstAlphaBlendFactor: constants.ONE,
      dstRgbBlendFactor: constants.ONE,
      srcAlphaBlendFactor: constants.ZERO,
      srcRgbBlendFactor: constants.ONE,
    })
    expect(
      resolveCubism2WebGLBlendFactors({
        blendMode: blendModes.BLEND_MULTIPLY,
        blendModes,
        gl,
        isMaskDraw: false,
      }),
    ).toEqual({
      dstAlphaBlendFactor: constants.ONE,
      dstRgbBlendFactor: constants.ONE_MINUS_SRC_ALPHA,
      srcAlphaBlendFactor: constants.ZERO,
      srcRgbBlendFactor: constants.DST_COLOR,
    })
    expect(
      resolveCubism2WebGLBlendFactors({
        blendMode: 999,
        blendModes,
        gl,
        isMaskDraw: false,
      }),
    ).toEqual({
      dstAlphaBlendFactor: undefined,
      dstRgbBlendFactor: undefined,
      srcAlphaBlendFactor: undefined,
      srcRgbBlendFactor: undefined,
    })
  })

  it('keeps Cubism2 WebGL shader sources in a dedicated source catalog', () => {
    expect(CUBISM2_WEBGL_SHADER_SOURCES.meshVertex).toBe(
      'attribute vec4     a_position;attribute vec2     a_texCoord;varying vec2       v_texCoord;varying vec4       v_ClipPos;uniform mat4       u_mvpMatrix;void main(){    gl_Position = u_mvpMatrix * a_position;    v_ClipPos = u_mvpMatrix * a_position;    v_texCoord = a_texCoord;}',
    )
    expect(CUBISM2_WEBGL_SHADER_SOURCES.meshFragment).toBe(
      'precision mediump float;varying vec2       v_texCoord;varying vec4       v_ClipPos;uniform sampler2D  s_texture0;uniform vec4       u_channelFlag;uniform vec4       u_baseColor;uniform bool       u_maskFlag;void main(){    vec4 smpColor;     if(u_maskFlag){        float isInside =             step(u_baseColor.x, v_ClipPos.x/v_ClipPos.w)          * step(u_baseColor.y, v_ClipPos.y/v_ClipPos.w)          * step(v_ClipPos.x/v_ClipPos.w, u_baseColor.z)          * step(v_ClipPos.y/v_ClipPos.w, u_baseColor.w);        smpColor = u_channelFlag * texture2D(s_texture0 , v_texCoord).a * isInside;    }else{        smpColor = texture2D(s_texture0 , v_texCoord) * u_baseColor;    }    gl_FragColor = smpColor;}',
    )
    expect(CUBISM2_WEBGL_SHADER_SOURCES.clippedMeshVertex).toBe(
      'attribute vec4     a_position;attribute vec2     a_texCoord;varying vec2       v_texCoord;varying vec4       v_ClipPos;uniform mat4       u_mvpMatrix;uniform mat4       u_ClipMatrix;void main(){    gl_Position = u_mvpMatrix * a_position;    v_ClipPos = u_ClipMatrix * a_position;    v_texCoord = a_texCoord ;}',
    )
    expect(CUBISM2_WEBGL_SHADER_SOURCES.clippedMeshFragment).toBe(
      'precision mediump float ;varying vec2       v_texCoord;varying vec4       v_ClipPos;uniform sampler2D  s_texture0;uniform sampler2D  s_texture1;uniform vec4       u_channelFlag;uniform vec4       u_baseColor ;void main(){    vec4 col_formask = texture2D(s_texture0, v_texCoord) * u_baseColor;    vec4 clipMask = texture2D(s_texture1, v_ClipPos.xy / v_ClipPos.w) * u_channelFlag;    float maskVal = clipMask.r + clipMask.g + clipMask.b + clipMask.a;    col_formask = col_formask * maskVal;    gl_FragColor = col_formask;}',
    )
  })

  it('caches Cubism2 WebGL shader locations in the min.js initShader order', () => {
    const { calls, gl } = createRecordingWebGLContext()
    const normalProgram = { id: 'normal-program' }
    const clippedProgram = { id: 'clipped-program' }
    const drawParam = {
      shaderProgram: normalProgram as unknown as WebGLProgram,
      shaderProgramOff: clippedProgram as unknown as WebGLProgram,
    } as Partial<Cubism2WebGLDrawParamInstance> & Record<string, unknown>

    cacheCubism2WebGLShaderLocations(drawParam as Cubism2WebGLDrawParamInstance, gl)

    expect(
      calls.map((call) => ({
        method: call.method,
        name: call.args[1],
        program: call.args[0],
      })),
    ).toEqual([
      { method: 'getAttribLocation', name: 'a_position', program: normalProgram },
      { method: 'getAttribLocation', name: 'a_texCoord', program: normalProgram },
      { method: 'getUniformLocation', name: 'u_mvpMatrix', program: normalProgram },
      { method: 'getUniformLocation', name: 's_texture0', program: normalProgram },
      { method: 'getUniformLocation', name: 'u_channelFlag', program: normalProgram },
      { method: 'getUniformLocation', name: 'u_baseColor', program: normalProgram },
      { method: 'getUniformLocation', name: 'u_maskFlag', program: normalProgram },
      { method: 'getAttribLocation', name: 'a_position', program: clippedProgram },
      { method: 'getAttribLocation', name: 'a_texCoord', program: clippedProgram },
      { method: 'getUniformLocation', name: 'u_mvpMatrix', program: clippedProgram },
      { method: 'getUniformLocation', name: 'u_ClipMatrix', program: clippedProgram },
      { method: 'getUniformLocation', name: 's_texture0', program: clippedProgram },
      { method: 'getUniformLocation', name: 's_texture1', program: clippedProgram },
      { method: 'getUniformLocation', name: 'u_channelFlag', program: clippedProgram },
      { method: 'getUniformLocation', name: 'u_baseColor', program: clippedProgram },
    ])
    expect(drawParam.a_position_Loc).toBe(1)
    expect(drawParam.a_texCoord_Loc).toBe(2)
    expect(drawParam.u_matrix_Loc).toEqual({ id: 3, method: 'getUniformLocation' })
    expect(drawParam.s_texture0_Loc).toEqual({ id: 4, method: 'getUniformLocation' })
    expect(drawParam.u_channelFlag).toEqual({ id: 5, method: 'getUniformLocation' })
    expect(drawParam.u_baseColor_Loc).toEqual({ id: 6, method: 'getUniformLocation' })
    expect(drawParam.u_maskFlag_Loc).toEqual({ id: 7, method: 'getUniformLocation' })
    expect(drawParam.a_position_Loc_Off).toBe(8)
    expect(drawParam.a_texCoord_Loc_Off).toBe(9)
    expect(drawParam.u_matrix_Loc_Off).toEqual({ id: 10, method: 'getUniformLocation' })
    expect(drawParam.u_clipMatrix_Loc_Off).toEqual({ id: 11, method: 'getUniformLocation' })
    expect(drawParam.s_texture0_Loc_Off).toEqual({ id: 12, method: 'getUniformLocation' })
    expect(drawParam.s_texture1_Loc_Off).toEqual({ id: 13, method: 'getUniformLocation' })
    expect(drawParam.u_channelFlag_Loc_Off).toEqual({ id: 14, method: 'getUniformLocation' })
    expect(drawParam.u_baseColor_Loc_Off).toEqual({ id: 15, method: 'getUniformLocation' })
  })

  it('uploads Cubism2 WebGL array and element-array buffers with min.js reuse semantics', () => {
    const { calls, constants, gl } = createRecordingWebGLContext()
    const vertexValues = new Float32Array([0, 1, 2, 3])
    const indexValues = new Uint16Array([0, 1, 2])

    const createdArrayBuffer = uploadCubism2WebGLArrayBuffer(gl, null, vertexValues)
    const existingArrayBuffer = { id: 'existing-array-buffer' } as unknown as WebGLBuffer
    expect(createdArrayBuffer).toEqual({ id: 1, method: 'createBuffer' })
    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [], method: 'createBuffer' },
      { args: [constants.ARRAY_BUFFER, createdArrayBuffer], method: 'bindBuffer' },
      { args: [constants.ARRAY_BUFFER, vertexValues, constants.DYNAMIC_DRAW], method: 'bufferData' },
    ])

    calls.length = 0
    const reusedArrayBuffer = uploadCubism2WebGLArrayBuffer(gl, existingArrayBuffer, vertexValues)

    expect(reusedArrayBuffer).toBe(existingArrayBuffer)
    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [constants.ARRAY_BUFFER, existingArrayBuffer], method: 'bindBuffer' },
      { args: [constants.ARRAY_BUFFER, vertexValues, constants.DYNAMIC_DRAW], method: 'bufferData' },
    ])

    calls.length = 0
    const createdElementBuffer = uploadCubism2WebGLElementArrayBuffer(gl, null, indexValues)
    const existingElementBuffer = { id: 'existing-element-buffer' } as unknown as WebGLBuffer
    expect(createdElementBuffer).toEqual({ id: 1, method: 'createBuffer' })
    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [], method: 'createBuffer' },
      { args: [constants.ELEMENT_ARRAY_BUFFER, createdElementBuffer], method: 'bindBuffer' },
      {
        args: [constants.ELEMENT_ARRAY_BUFFER, indexValues, constants.DYNAMIC_DRAW],
        method: 'bufferData',
      },
    ])

    calls.length = 0
    const reusedElementBuffer = uploadCubism2WebGLElementArrayBuffer(
      gl,
      existingElementBuffer,
      indexValues,
    )

    expect(reusedElementBuffer).toBe(existingElementBuffer)
    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [constants.ELEMENT_ARRAY_BUFFER, existingElementBuffer], method: 'bindBuffer' },
      {
        args: [constants.ELEMENT_ARRAY_BUFFER, indexValues, constants.DYNAMIC_DRAW],
        method: 'bufferData',
      },
    ])
  })

  it('enables Cubism2 WebGL attribute pointers after callers preserve the min.js upload order', () => {
    const { calls, constants, gl } = createRecordingWebGLContext()

    enableCubism2WebGLAttributePointer(gl, 14)

    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [14], method: 'enableVertexAttribArray' },
      { args: [14, 2, constants.FLOAT, false, 0, 0], method: 'vertexAttribPointer' },
    ])
  })

  it('binds Cubism2 WebGL source and generated mask texture samplers in the min.js order', () => {
    const { calls, constants, gl } = createRecordingWebGLContext()
    const sourceTexture = { id: 'source-texture' }
    const generatedMaskTexture = { id: 'generated-mask-texture' }
    const sourceUniform = { id: 'source-uniform' } as unknown as WebGLUniformLocation
    const generatedMaskUniform = { id: 'generated-mask-uniform' } as unknown as WebGLUniformLocation

    bindCubism2WebGLSourceTexture(gl, [sourceTexture], 0, sourceUniform)
    bindCubism2WebGLGeneratedMaskTexture(
      gl,
      { fTexture: [null, null, null, generatedMaskTexture] },
      3,
      generatedMaskUniform,
    )

    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [constants.TEXTURE1], method: 'activeTexture' },
      { args: [constants.TEXTURE_2D, sourceTexture], method: 'bindTexture' },
      { args: [sourceUniform, 1], method: 'uniform1i' },
      { args: [constants.TEXTURE2], method: 'activeTexture' },
      { args: [constants.TEXTURE_2D, generatedMaskTexture], method: 'bindTexture' },
      { args: [generatedMaskUniform, 2], method: 'uniform1i' },
    ])
  })

  it('applies Cubism2 WebGL mask, clipped, and unclipped uniforms in the min.js order', () => {
    const { calls, drawParam, gl } = createWebGLDrawParamHarness()
    const maskMatrix = new Float32Array(16)
    const drawMatrix = new Float32Array(16)
    const modelMatrix = new Float32Array(16)
    drawParam.matrix4x4 = modelMatrix
    drawParam.clipBufPre_clipContextMask = {
      layoutBounds: {
        /**
         * Reports the right edge used to convert mask layout bounds into clip-space uniforms.
         * @returns Normalized right edge.
         */
        getRight() {
          return 0.7
        },
        /**
         * Reports the bottom edge used to convert mask layout bounds into clip-space uniforms.
         * @returns Normalized bottom edge.
         */
        getBottom() {
          return 0.9
        },
        x: 0.2,
        y: 0.3,
      },
      layoutChannelNo: 0,
      matrixForDraw: new Float32Array(16),
      matrixForMask: maskMatrix,
    }
    drawParam.clipBufPre_clipContextDraw = {
      layoutBounds: {
        /**
         * Reports the unused right edge for clipped-uniform shape compatibility.
         * @returns Normalized right edge.
         */
        getRight() {
          return 1
        },
        /**
         * Reports the unused bottom edge for clipped-uniform shape compatibility.
         * @returns Normalized bottom edge.
         */
        getBottom() {
          return 1
        },
        x: 0,
        y: 0,
      },
      layoutChannelNo: 1,
      matrixForDraw: drawMatrix,
      matrixForMask: new Float32Array(16),
    }
    calls.length = 0

    /**
     * Records the clipped-branch texture binding boundary that min.js keeps between matrix and color uniforms.
     */
    function recordGeneratedMaskTextureBoundary(): void {
      calls.push({ args: [], method: 'bindGeneratedMaskTextureBoundary' })
    }

    applyCubism2WebGLMaskUniforms(gl, drawParam)
    applyCubism2WebGLClippedUniforms(
      gl,
      drawParam,
      0.75,
      0.75,
      0.75,
      0.75,
      recordGeneratedMaskTextureBoundary,
    )
    applyCubism2WebGLUnclippedUniforms(gl, drawParam, 0.2, 0.3, 0.4, 0.5)

    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [drawParam.u_matrix_Loc, false, maskMatrix], method: 'uniformMatrix4fv' },
      { args: [drawParam.u_channelFlag, 0.1, 0.2, 0.3, 0.4], method: 'uniform4f' },
      {
        args: [drawParam.u_baseColor_Loc, -0.6, -0.4, 0.3999999999999999, 0.8],
        method: 'uniform4f',
      },
      { args: [drawParam.u_maskFlag_Loc, true], method: 'uniform1i' },
      { args: [drawParam.u_clipMatrix_Loc_Off, false, drawMatrix], method: 'uniformMatrix4fv' },
      { args: [drawParam.u_matrix_Loc_Off, false, modelMatrix], method: 'uniformMatrix4fv' },
      { args: [], method: 'bindGeneratedMaskTextureBoundary' },
      {
        args: [drawParam.u_channelFlag_Loc_Off, 0.5, 0.6, 0.7, 0.8],
        method: 'uniform4f',
      },
      { args: [drawParam.u_baseColor_Loc_Off, 0.75, 0.75, 0.75, 0.75], method: 'uniform4f' },
      { args: [drawParam.u_matrix_Loc, false, modelMatrix], method: 'uniformMatrix4fv' },
      { args: [drawParam.u_baseColor_Loc, 0.2, 0.3, 0.4, 0.5], method: 'uniform4f' },
      { args: [drawParam.u_maskFlag_Loc, false], method: 'uniform1i' },
    ])
  })

  it('applies Cubism2 WebGL culling, blend, anisotropy, draw, and texture release tail in the min.js order', () => {
    const { calls, constants, gl } = createRecordingWebGLContext()
    const blendModes = {
      BLEND_ADD: 1,
      BLEND_MULTIPLY: 2,
      BLEND_NORMAL: 0,
    }
    const anisotropyExt = {
      MAX_TEXTURE_MAX_ANISOTROPY_EXT: 77,
      TEXTURE_MAX_ANISOTROPY_EXT: 88,
    }
    const drawState: {
      anisotropyExt: typeof anisotropyExt | null
      clipBufPre_clipContextMask: unknown
      culling: boolean
      maxAnisotropy: number
    } = {
      anisotropyExt,
      clipBufPre_clipContextMask: null,
      culling: true,
      maxAnisotropy: 4,
    }

    applyCubism2WebGLDrawTail(gl, drawState, blendModes.BLEND_ADD, blendModes, 5)

    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [constants.CULL_FACE], method: 'enable' },
      { args: [constants.BLEND], method: 'enable' },
      { args: [constants.FUNC_ADD, constants.FUNC_ADD], method: 'blendEquationSeparate' },
      {
        args: [constants.ONE, constants.ONE, constants.ZERO, constants.ONE],
        method: 'blendFuncSeparate',
      },
      {
        args: [constants.TEXTURE_2D, anisotropyExt.TEXTURE_MAX_ANISOTROPY_EXT, 4],
        method: 'texParameteri',
      },
      { args: [constants.TRIANGLES, 5, constants.UNSIGNED_SHORT, 0], method: 'drawElements' },
      { args: [constants.TEXTURE_2D, null], method: 'bindTexture' },
    ])

    calls.length = 0
    drawState.culling = false
    drawState.anisotropyExt = null
    drawState.clipBufPre_clipContextMask = { id: 'mask-context' }

    applyCubism2WebGLDrawTail(gl, drawState, blendModes.BLEND_MULTIPLY, blendModes, 3)

    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [constants.CULL_FACE], method: 'disable' },
      { args: [constants.BLEND], method: 'enable' },
      { args: [constants.FUNC_ADD, constants.FUNC_ADD], method: 'blendEquationSeparate' },
      {
        args: [
          constants.ONE,
          constants.ONE_MINUS_SRC_ALPHA,
          constants.ONE,
          constants.ONE_MINUS_SRC_ALPHA,
        ],
        method: 'blendFuncSeparate',
      },
      { args: [constants.TRIANGLES, 3, constants.UNSIGNED_SHORT, 0], method: 'drawElements' },
      { args: [constants.TEXTURE_2D, null], method: 'bindTexture' },
    ])
  })

  it('releases Cubism2 WebGL owned textures while preserving only zero sentinel slots', () => {
    const releases: Array<{ deleteMode: number; textureIndex: number; textureValue: unknown }> = []
    const textureA = { id: 'texture-a' }
    const textureB = { id: 'texture-b' }
    const textures = [0, textureA, null, undefined, textureB]
    const gl = {
      /**
       * Records the legacy WebGL release hook arguments before the helper clears the slot.
       * @param deleteMode Min.js release mode; WebGLDrawParam uses `1` for owned texture deletion.
       * @param textureRegistry Mutable draw-param texture array being released.
       * @param textureIndex Slot selected by the release loop.
       */
      releaseTextureAtIndex(
        deleteMode: number,
        textureRegistry: unknown[],
        textureIndex: number,
      ): void {
        releases.push({
          deleteMode,
          textureIndex,
          textureValue: textureRegistry[textureIndex],
        })
      },
    }

    releaseCubism2WebGLTextures(gl, textures)

    expect(releases).toEqual([
      { deleteMode: 1, textureIndex: 1, textureValue: textureA },
      { deleteMode: 1, textureIndex: 2, textureValue: null },
      { deleteMode: 1, textureIndex: 3, textureValue: undefined },
      { deleteMode: 1, textureIndex: 4, textureValue: textureB },
    ])
    expect(textures).toEqual([0, null, null, null, null])
  })

  it('keeps Cubism2 WebGL texture ownership when the legacy release hook is missing', () => {
    const textureA = { id: 'texture-a' }
    const textureB = { id: 'texture-b' }
    const textures = [0, textureA, textureB]
    const missingReleaseHook = {} as Parameters<typeof releaseCubism2WebGLTextures>[0]

    expect(() => releaseCubism2WebGLTextures(missingReleaseHook, textures)).toThrow(
      'Cubism2 WebGL texture release hook is not installed',
    )
    expect(textures).toEqual([0, textureA, textureB])
  })

  it('installs the Cubism2 WebGL texture release hook onto native WebGL contexts', () => {
    const deletedTextures: unknown[] = []
    const textureA = { id: 'texture-a' }
    const textureB = { id: 'texture-b' }
    const textures = [0, textureA, null, textureB]
    const gl = {
      /**
       * Records native WebGL texture deletion calls made by the compatibility hook.
       * @param texture Texture handle selected from the Cubism2 texture registry.
       */
      deleteTexture(texture: unknown): void {
        deletedTextures.push(texture)
      },
    }

    installCubism2WebGLTextureReleaseHook(gl)
    releaseCubism2WebGLTextures(gl, textures)

    expect(deletedTextures).toEqual([textureA, textureB])
    expect(textures).toEqual([0, null, null, null])
  })

  it('creates Cubism2 WebGL mask framebuffer resources in the min.js order', () => {
    const { calls, constants, gl } = createRecordingWebGLContext()
    const textureReadback = { id: 'registry-readback' }
    const registryEvents: Array<{ slot: string; type: 'get' | 'set'; value?: unknown }> = []
    const textureRegistry = new Proxy([] as unknown[], {
      /**
       * Records texture-registry reads so the test can distinguish min.js read-back from local return.
       * @param target Backing texture registry used by the fake Live2D profile.
       * @param property Registry property requested by the helper.
       * @param receiver Proxy receiver forwarded to the default array behavior.
       * @returns Sentinel texture for slot 3, otherwise the backing array value.
       */
      get(target, property: string | symbol, receiver: unknown): unknown {
        if (property === '3') {
          registryEvents.push({ slot: property, type: 'get' })
          return textureReadback
        }
        return Reflect.get(target, property, receiver)
      },
      /**
       * Records texture-registry writes before forwarding to the backing array.
       * @param target Backing texture registry used by the fake Live2D profile.
       * @param property Registry property being written.
       * @param value Texture handle assigned by the helper.
       * @param receiver Proxy receiver forwarded to the default array behavior.
       * @returns True when the backing array accepted the write.
       */
      set(target, property: string | symbol, value: unknown, receiver: unknown): boolean {
        if (property === '3') {
          registryEvents.push({ slot: property, type: 'set', value })
        }
        return Reflect.set(target, property, value, receiver)
      },
    })
    const live2DProfile = {
      EXPAND_W: 2,
      clippingMaskBufferSize: 256,
      fTexture: textureRegistry,
    }

    const resources = createCubism2WebGLMaskFramebuffer(gl, live2DProfile, 3)
    const allocatedTexture = registryEvents.find((event) => event.type === 'set')?.value

    expect(resources.framebuffer).toEqual({ id: 1, method: 'createFramebuffer' })
    expect(resources.renderbuffer).toEqual({ id: 3, method: 'createRenderbuffer' })
    expect(allocatedTexture).toEqual({ id: 7, method: 'createTexture' })
    expect(resources.texture).toBe(textureReadback)
    expect(registryEvents).toEqual([
      { slot: '3', type: 'set', value: allocatedTexture },
      { slot: '3', type: 'get' },
    ])
    expect(calls.map((call) => ({ args: call.args, method: call.method }))).toEqual([
      { args: [], method: 'createFramebuffer' },
      { args: [constants.FRAMEBUFFER, resources.framebuffer], method: 'bindFramebuffer' },
      { args: [], method: 'createRenderbuffer' },
      { args: [constants.RENDERBUFFER, resources.renderbuffer], method: 'bindRenderbuffer' },
      {
        args: [constants.RENDERBUFFER, constants.RGBA4, 256, 256],
        method: 'renderbufferStorage',
      },
      {
        args: [
          constants.FRAMEBUFFER,
          constants.COLOR_ATTACHMENT0,
          constants.RENDERBUFFER,
          resources.renderbuffer,
        ],
        method: 'framebufferRenderbuffer',
      },
      { args: [], method: 'createTexture' },
      { args: [constants.TEXTURE_2D, allocatedTexture], method: 'bindTexture' },
      {
        args: [
          constants.TEXTURE_2D,
          0,
          constants.RGBA,
          256,
          256,
          0,
          constants.RGBA,
          constants.UNSIGNED_BYTE,
          null,
        ],
        method: 'texImage2D',
      },
      {
        args: [constants.TEXTURE_2D, constants.TEXTURE_MIN_FILTER, constants.LINEAR],
        method: 'texParameteri',
      },
      {
        args: [constants.TEXTURE_2D, constants.TEXTURE_MAG_FILTER, constants.LINEAR],
        method: 'texParameteri',
      },
      {
        args: [constants.TEXTURE_2D, constants.TEXTURE_WRAP_S, constants.CLAMP_TO_EDGE],
        method: 'texParameteri',
      },
      {
        args: [constants.TEXTURE_2D, constants.TEXTURE_WRAP_T, constants.CLAMP_TO_EDGE],
        method: 'texParameteri',
      },
      {
        args: [
          constants.FRAMEBUFFER,
          constants.COLOR_ATTACHMENT0,
          constants.TEXTURE_2D,
          allocatedTexture,
          0,
        ],
        method: 'framebufferTexture2D',
      },
      { args: [constants.TEXTURE_2D, null], method: 'bindTexture' },
      { args: [constants.RENDERBUFFER, null], method: 'bindRenderbuffer' },
      { args: [constants.FRAMEBUFFER, null], method: 'bindFramebuffer' },
    ])
  })

  it('keeps LDTransform matrix operations in a separate module', () => {
    const LDTransform = createCubism2LDTransform()
    const transform = new LDTransform()

    transform.translate(10, 20)
    transform.scale(2, 3)

    const transformedPoint = transform.transformPointForLDGL(2, 3, [0, 0])
    const inverseTransform = transform.invertInto(new LDTransform())

    expect(transformedPoint).toEqual([14, 29])
    expect(inverseTransform).not.toBeNull()
    expect(inverseTransform!.transformPointForLDGL(14, 29, [0, 0])[0]).toBeCloseTo(2)
    expect(inverseTransform!.transformPointForLDGL(14, 29, [0, 0])[1]).toBeCloseTo(3)

    const translatedTransform = new LDTransform()
    translatedTransform.translate(5, 0)
    const scaledTransform = new LDTransform()
    scaledTransform.scale(2, 2)
    translatedTransform.concatenate(scaledTransform)

    expect(translatedTransform.transformPointForLDGL(3, 4, [0, 0])).toEqual([11, 8])
  })

  it('keeps LDGL clipping path transforms in a separate module', () => {
    const LDTransform = createCubism2LDTransform()
    const debugErrors: unknown[] = []
    /**
     * Leaves affine output untouched because this test only exercises direct clip path transforms.
     */
    function ignoreAffineTransform(): void {}

    const LDGL = createCubism2LDGL({
      LDTransform,
      Live2D: {
        DEBUG_DATA: {},
        IGNORE_CLIP: false,
        IGNORE_EXPAND: false,
        USE_ADJUST_TRANSLATION: false,
        USE_CACHED_POLYGON_IMAGE: false,
      },
      UtDebug: {
        /**
         * Records legacy LDGL errors without writing to the test console.
         * @param error Error payload emitted by the compatibility module.
         */
        logException(error: unknown) {
          debugErrors.push(error)
        },
        /**
         * Records legacy LDGL info errors without writing to the test console.
         * @param message Diagnostic message emitted by LDGL.
         */
        logWithLegacyPrefix(message: unknown) {
          debugErrors.push(message)
        },
      },
      solveAffineTransform: ignoreAffineTransform,
    })
    const transform = new LDTransform()
    transform.translate(10, 20)
    const calls: Array<[string, number?, number?]> = []
    const context = {
      /**
       * Records path start.
       */
      beginPath() {
        calls.push(['beginPath'])
      },
      /**
       * Records path clipping.
       */
      clip() {
        calls.push(['clip'])
      },
      /**
       * Records transformed line segments.
       * @param x Transformed X coordinate.
       * @param y Transformed Y coordinate.
       */
      lineTo(x: number, y: number) {
        calls.push(['lineTo', x, y])
      },
      /**
       * Records transformed first path point.
       * @param x Transformed X coordinate.
       * @param y Transformed Y coordinate.
       */
      moveTo(x: number, y: number) {
        calls.push(['moveTo', x, y])
      },
    }

    LDGL.clipWithTransform(context, transform, 1, 2, 3, 4, 5, 6)

    expect(debugErrors).toEqual([])
    expect(calls).toEqual([
      ['beginPath'],
      ['moveTo', 11, 22],
      ['lineTo', 13, 24],
      ['lineTo', 15, 26],
      ['clip'],
    ])
  })

  it('routes LDGL transform consumers through semantic LDTransform methods', () => {
    const LDTransform = createCubism2LDTransform()
    const debugErrors: unknown[] = []
    /**
     * Leaves affine output untouched because this test only exercises direct transform routing.
     */
    function ignoreAffineTransform(): void {}
    const LDGL = createCubism2LDGL({
      LDTransform,
      Live2D: {
        DEBUG_DATA: {},
        IGNORE_CLIP: false,
        IGNORE_EXPAND: false,
        USE_ADJUST_TRANSLATION: false,
        USE_CACHED_POLYGON_IMAGE: false,
      },
      UtDebug: {
        /**
         * Records LDGL error payloads for assertions.
         * @param error Error payload emitted by the compatibility module.
         */
        logException(error: unknown) {
          debugErrors.push(error)
        },
        /**
         * Records LDGL info diagnostics for assertions.
         * @param message Diagnostic message emitted by LDGL.
         */
        logWithLegacyPrefix(message: unknown) {
          debugErrors.push(message)
        },
      },
      solveAffineTransform: ignoreAffineTransform,
    })
    const transform = new LDTransform()
    transform.translate(10, 20)
    const clipCalls: Array<[string, number?, number?]> = []
    const clipContext = {
      /**
       * Records path start.
       */
      beginPath() {
        clipCalls.push(['beginPath'])
      },
      /**
       * Records path clipping.
       */
      clip() {
        clipCalls.push(['clip'])
      },
      /**
       * Records transformed line segments.
       * @param x Transformed X coordinate.
       * @param y Transformed Y coordinate.
       */
      lineTo(x: number, y: number) {
        clipCalls.push(['lineTo', x, y])
      },
      /**
       * Records transformed first path point.
       * @param x Transformed X coordinate.
       * @param y Transformed Y coordinate.
       */
      moveTo(x: number, y: number) {
        clipCalls.push(['moveTo', x, y])
      },
    }

    LDGL.clipWithTransform(clipContext, transform, 1, 2, 3, 4, 5, 6)

    expect(debugErrors).toEqual([])
    expect(clipCalls).toEqual([
      ['beginPath'],
      ['moveTo', 11, 22],
      ['lineTo', 13, 24],
      ['lineTo', 15, 26],
      ['clip'],
    ])

    const sourceTransform = new LDTransform()
    sourceTransform.translate(2, 3)
    const expandCalls: string[] = []
    const expandContext = {
      /**
       * Records expanded path start.
       */
      beginPath() {
        expandCalls.push('beginPath')
      },
      /**
       * Records expanded clip.
       */
      clip() {
        expandCalls.push('clip')
      },
      /**
       * Records expanded line segment.
       */
      lineTo() {
        expandCalls.push('lineTo')
      },
      /**
       * Records expanded first path point.
       */
      moveTo() {
        expandCalls.push('moveTo')
      },
    }

    expect(LDGL.expandClip(expandContext, sourceTransform, 1, 10, 0, 0, 10, 0, 0, 10)).toBe(
      true,
    )
    expect(expandCalls[0]).toBe('beginPath')
    expect(expandCalls[expandCalls.length - 1]).toBe('clip')
  })

  it('keeps PhysicsHair source and target parameter bindings in a separate module', () => {
    /**
     * Reports that runtime prototype bootstrapping is complete for this constructor-level behavior test.
     * @returns False so constructors initialize their runtime state.
     */
    function isRuntimeBootstrapping(): boolean {
      return false
    }

    const PhysicsHair = createCubism2PhysicsHair({
      Cubism2Math: createCubism2Math(),
      isBootstrapping: isRuntimeBootstrapping,
    })
    const writes: Array<{ id: unknown; value: number; weight: number | null }> = []
    const model = {
      /**
       * Supplies one deterministic source parameter that moves the hair root point.
       * @param paramId Parameter ID requested by the source binding.
       * @returns Source parameter value.
       */
      getParamFloat(paramId: unknown) {
        return paramId === 'ParamHairRootX' ? 10 : 0
      },
      /**
       * Records PhysicsHair target writes without mutating a real Cubism model.
       * @param id Target parameter ID configured by `addTargetParam`.
       * @param value Simulated angle value written by the binding.
       * @param weight Blend weight passed through from the target binding.
       */
      setParamFloat(id: unknown, value: number, weight: number | null) {
        writes.push({ id, value, weight })
      },
    }
    const hair = new PhysicsHair()

    hair.addSrcParam(PhysicsHair.Src.SRC_TO_X, 'ParamHairRootX', 1, 1)
    hair.addTargetParam(PhysicsHair.Target.TARGET_FROM_ANGLE, 'ParamHairAngle', 1, 1)
    hair.update(model, 1000)
    hair.update(model, 1033)

    expect(writes).toHaveLength(1)
    expect(writes[0]?.id).toBe('ParamHairAngle')
    expect(writes[0]?.weight).toBe(1)
    expect(Number.isFinite(writes[0]?.value)).toBe(true)
  })

  it('exposes semantic PhysicsHair state and binding collections', () => {
    /**
     * Reports that runtime prototype bootstrapping is complete for semantic state checks.
     * @returns False so the constructor initializes runtime state.
     */
    function isRuntimeBootstrapping(): boolean {
      return false
    }

    const PhysicsHair = createCubism2PhysicsHair({
      Cubism2Math: createCubism2Math(),
      isBootstrapping: isRuntimeBootstrapping,
    })
    const hair = new PhysicsHair()

    expect(hair.restLength).toBeCloseTo(0.3)
    expect(hair.airResistance).toBeCloseTo(0.5)
    expect(hair.gravityAngleDegrees).toBe(0)
    expect(hair.currentAngleDegrees).toBe(0)
    expect(hair.angularVelocityDegreesPerSecond).toBe(0)
    expect(hair.sourceParamBindings).toEqual([])
    expect(hair.targetParamBindings).toEqual([])

    hair.restLength = 3.5
    hair.setGravityAngleDegrees(17)
    hair.airResistance = 0.75
    hair.currentAngleDegrees = -12
    hair.angularVelocityDegreesPerSecond = 8
    hair.previousAngleDegrees = -6
    hair.firstUpdateTimeMillis = 100
    hair.previousUpdateTimeMillis = 120

    expect(hair.restLength).toBe(3.5)
    expect(hair.getGravityAngleDegrees()).toBe(17)
    expect(hair.getCurrentAngleDegrees()).toBe(-12)
    expect(hair.getAngularVelocityDegreesPerSecond()).toBe(8)
    expect(hair.previousAngleDegrees).toBe(-6)
    expect(hair.firstUpdateTimeMillis).toBe(100)
    expect(hair.previousUpdateTimeMillis).toBe(120)

    hair.addSrcParam(PhysicsHair.Src.SRC_TO_G_ANGLE, 'ParamGravity', 1, 1)
    hair.addTargetParam(PhysicsHair.Target.TARGET_FROM_ANGLE_V, 'ParamAngleVelocity', 1, 1)
    expect(hair.sourceParamBindings).toHaveLength(1)
    expect(hair.targetParamBindings).toHaveLength(1)
  })

  it('keeps PhysicsHair binding fields and behavior semantic', () => {
    /**
     * Reports that runtime prototype bootstrapping is complete for binding checks.
     * @returns False so binding constructors initialize their semantic fields.
     */
    function isRuntimeBootstrapping(): boolean {
      return false
    }

    const PhysicsHair = createCubism2PhysicsHair({
      Cubism2Math: createCubism2Math(),
      isBootstrapping: isRuntimeBootstrapping,
    })
    const hair = new PhysicsHair()
    hair.addSrcParam(PhysicsHair.Src.SRC_TO_Y, 'ParamHairRootY', 2, 0.25)
    hair.addTargetParam(PhysicsHair.Target.TARGET_FROM_ANGLE, 'ParamHairAngle', 3, 0.5)

    const sourceBinding = hair.sourceParamBindings[0]!
    const targetBinding = hair.targetParamBindings[0]!
    expect(sourceBinding).toMatchObject({
      paramId: 'ParamHairRootY',
      scale: 2,
      sourceKind: PhysicsHair.Src.SRC_TO_Y,
      weight: 0.25,
    })
    expect(targetBinding).toMatchObject({
      paramId: 'ParamHairAngle',
      scale: 3,
      targetKind: PhysicsHair.Target.TARGET_FROM_ANGLE,
      weight: 0.5,
    })

    sourceBinding.paramId = 'ParamHairRootX'
    sourceBinding.weight = 1
    sourceBinding.sourceKind = PhysicsHair.Src.SRC_TO_X
    sourceBinding.applySourceParameter(
      {
        /**
         * Supplies deterministic source values for the selected semantic parameter id.
         * @param paramId Parameter ID selected by the source binding.
         * @returns Seven for the configured root-X parameter, otherwise zero.
         */
        getParamFloat(paramId: unknown): number {
          return paramId === 'ParamHairRootX' ? 7 : 0
        },
        /**
         * Accepts the model write shape that is unused by a source binding.
         */
        setParamFloat(): void {},
      },
      hair,
    )
    expect(hair.getPhysicsPoint1().x).toBe(14)

    const targetWrites: Array<{ id: unknown; value: number; weight: number | null }> = []
    const targetModel = {
      /**
       * Accepts the model read shape that is unused by a target binding.
       * @returns Zero because target binding behavior only writes.
       */
      getParamFloat(): number {
        return 0
      },
      /**
       * Records semantic target binding writes.
       * @param id Parameter ID selected by the target binding.
       * @param value Scaled target value written by the binding.
       * @param weight Blend weight supplied by the binding.
       */
      setParamFloat(id: unknown, value: number, weight: number | null): void {
        targetWrites.push({ id, value, weight })
      },
    }
    hair.currentAngleDegrees = 5
    targetBinding.writeTargetParameter(targetModel, hair)
    expect(targetWrites).toEqual([{ id: 'ParamHairAngle', value: 15, weight: 0.5 }])

    targetWrites.length = 0
    targetBinding.paramId = 'ParamHairAngleVelocity'
    targetBinding.weight = 0.75
    targetBinding.targetKind = PhysicsHair.Target.TARGET_FROM_ANGLE_V
    hair.angularVelocityDegreesPerSecond = 4
    targetBinding.writeTargetParameter(targetModel, hair)
    expect(targetWrites).toEqual([
      { id: 'ParamHairAngleVelocity', value: 12, weight: 0.75 },
    ])
  })

  it('routes PhysicsHair updates through semantic binding methods', () => {
    /**
     * Reports that runtime prototype bootstrapping is complete for binding routing checks.
     * @returns False so source and target binding arrays initialize.
     */
    function isRuntimeBootstrapping(): boolean {
      return false
    }

    const PhysicsHair = createCubism2PhysicsHair({
      Cubism2Math: createCubism2Math(),
      isBootstrapping: isRuntimeBootstrapping,
    })
    const hair = new PhysicsHair()
    hair.addSrcParam(PhysicsHair.Src.SRC_TO_X, 'ParamHairRootX', 1, 1)
    hair.addTargetParam(PhysicsHair.Target.TARGET_FROM_ANGLE, 'ParamHairAngle', 1, 1)

    let sourceSemanticCallCount = 0
    let targetSemanticCallCount = 0
    /**
     * Records source binding dispatch from Hair.update.
     */
    hair.sourceParamBindings[0]!.applySourceParameter =
      function recordSemanticSourceBindingCall(): void {
        sourceSemanticCallCount++
      }
    /**
     * Records target binding dispatch from Hair.update.
     */
    hair.targetParamBindings[0]!.writeTargetParameter =
      function recordSemanticTargetBindingCall(): void {
        targetSemanticCallCount++
      }

    const model = {
      /**
       * Supplies a deterministic source parameter if the configured binding reads it.
       * @returns Zero because the instrumented semantic binding does not need model data.
       */
      getParamFloat(): number {
        return 0
      },
      /**
       * Accepts target writes if the configured binding reaches the model.
       */
      setParamFloat(): void {},
    }

    hair.update(model, 1000)
    hair.update(model, 1033)

    expect(sourceSemanticCallCount).toBe(1)
    expect(targetSemanticCallCount).toBe(1)
  })

  it('integrates PhysicsHair through semantic PhysicsPoint state', () => {
    /**
     * Reports that runtime prototype bootstrapping is complete for point integration checks.
     * @returns False so point constructors initialize semantic state.
     */
    function isRuntimeBootstrapping(): boolean {
      return false
    }

    const PhysicsHair = createCubism2PhysicsHair({
      Cubism2Math: createCubism2Math(),
      isBootstrapping: isRuntimeBootstrapping,
    })
    const hair = new PhysicsHair()
    const rootPoint = hair.getPhysicsPoint1()
    const childPoint = hair.getPhysicsPoint2()

    rootPoint.mass = 0.6
    rootPoint.x = 3
    rootPoint.y = 4
    rootPoint.velocityX = 5
    rootPoint.velocityY = 6
    rootPoint.capturePreviousState()
    expect(rootPoint.previousX).toBe(3)
    expect(rootPoint.previousY).toBe(4)
    expect(rootPoint.previousVelocityX).toBe(5)
    expect(rootPoint.previousVelocityY).toBe(6)

    for (const point of [rootPoint, childPoint]) {
      point.mass = 0.5
      point.previousX = point.x
      point.previousY = point.y
      point.previousVelocityX = 0
      point.previousVelocityY = 0
    }

    let rootSemanticSnapshotCount = 0
    let childSemanticSnapshotCount = 0
    /**
     * Records and performs the root point semantic state snapshot.
     */
    rootPoint.capturePreviousState = function recordRootSemanticPhysicsPointSnapshot(): void {
      rootSemanticSnapshotCount++
      rootPoint.previousX = rootPoint.x
      rootPoint.previousY = rootPoint.y
      rootPoint.previousVelocityX = rootPoint.velocityX
      rootPoint.previousVelocityY = rootPoint.velocityY
    }
    /**
     * Records and performs the child point semantic state snapshot.
     */
    childPoint.capturePreviousState = function recordChildSemanticPhysicsPointSnapshot(): void {
      childSemanticSnapshotCount++
      childPoint.previousX = childPoint.x
      childPoint.previousY = childPoint.y
      childPoint.previousVelocityX = childPoint.velocityX
      childPoint.previousVelocityY = childPoint.velocityY
    }

    hair.setup()
    hair.integratePhysicsPoints(
      {
        /**
         * Keeps the model signature compatible without affecting point integration.
         * @returns Zero because the integration step does not query source parameters.
         */
        getParamFloat(): number {
          return 0
        },
        /**
         * Keeps the model signature compatible without affecting point integration.
         */
        setParamFloat(): void {},
      },
      0.033,
    )

    expect(rootSemanticSnapshotCount).toBe(1)
    expect(childSemanticSnapshotCount).toBe(2)
    expect(Number.isFinite(rootPoint.forceX)).toBe(true)
    expect(Number.isFinite(rootPoint.forceY)).toBe(true)
    expect(Number.isFinite(childPoint.velocityX)).toBe(true)
    expect(Number.isFinite(childPoint.velocityY)).toBe(true)
  })


  it('normalizes WordPress Cubism2 settings into runtime metadata', () => {
    const settings = normalizeLive2DModelSettings('/api/blog/live2d/pio/moc/index.json', {
      hit_areas_custom: {
        body_x: [-0.3, 0.3],
        body_y: [0.2, -0.9],
      },
      model: 'pio.moc',
      motions: {
        idle: [{ fade_in: 1000, file: 'motions/idle.mtn' }, { file: '' }],
      },
      textures: ['textures/default.png', '', 42, 'textures/pink.png'],
    })

    expect(settings.baseUrl).toBe('/api/blog/live2d/pio/moc/')
    expect(settings.hitAreas.bodyX).toEqual([-0.3, 0.3])
    expect(settings.motions.idle).toEqual([
      { fadeIn: 1000, fadeOut: undefined, file: 'motions/idle.mtn' },
    ])
    expect(settings.textures).toEqual(['textures/default.png', 'textures/pink.png'])
  })

  it('stores current model and clamps per-model texture indexes', () => {
    const memory = createMemoryStorage([
      ['kt-blog-live2d:model', 'tia'],
      ['kt-blog-live2d:texture:tia', '999'],
    ])
    const storage = createLive2DRuntimeStorage(memory)

    expect(storage.readModelKey()).toBe('tia')
    expect(storage.readTextureIndex('tia', 3)).toBe(2)

    storage.writeModelKey('pio')
    storage.writeTextureIndex('pio', 12)

    expect(memory.getItem('kt-blog-live2d:model')).toBe('pio')
    expect(memory.getItem('kt-blog-live2d:texture:pio')).toBe('12')
  })
})

describe('Live2D runtime direct selection API', () => {
  it('mounts cached model state and switches model/texture directly', async () => {
    const { calls, renderer } = createRecordingRenderer()
    const storage = createLive2DRuntimeStorage(
      createMemoryStorage([
        ['kt-blog-live2d:model', 'tia'],
        ['kt-blog-live2d:texture:tia', '1'],
      ]),
    )
    const loadSettings = vi.fn((url: string) =>
      Promise.resolve({
        baseUrl: url.replace(/index\.json$/, ''),
        hitAreas: {},
        model: `${url.includes('/tia/') ? 'tia' : 'pio'}.moc`,
        motions: {},
        textures: ['textures/default.png', 'textures/pink.png'],
        url,
      }),
    )
    const runtime = createLive2DTSRuntime({
      canvas: document.createElement('canvas'),
      loadSettings,
      renderer,
      storage,
    })

    const mounted = await runtime.mount()
    const switchedModel = await runtime.switchModel('pio')
    const switchedTexture = await runtime.switchTexture(1)

    expect(mounted).toMatchObject({ modelKey: 'tia', textureIndex: 1 })
    expect(switchedModel).toMatchObject({ modelKey: 'pio', textureIndex: 0 })
    expect(switchedTexture).toMatchObject({ modelKey: 'pio', textureIndex: 1 })
    expect(calls.map(([type]) => type)).toEqual(['mount', 'switchModel', 'switchTexture'])
    expect(loadSettings).toHaveBeenCalledTimes(2)
  })

  it('rejects invalid texture targets instead of cycling silently', async () => {
    const { renderer } = createRecordingRenderer()
    const runtime = createLive2DTSRuntime({
      canvas: document.createElement('canvas'),
      loadSettings: () =>
        Promise.resolve({
          baseUrl: '/api/blog/live2d/pio/moc/',
          hitAreas: {},
          model: 'pio.moc',
          motions: {},
          textures: ['textures/default.png'],
          url: '/api/blog/live2d/pio/moc/index.json',
        }),
      renderer,
      storage: createLive2DRuntimeStorage(createMemoryStorage()),
    })

    await runtime.mount()

    await expect(runtime.switchTexture(2)).rejects.toThrow('Live2D texture index is out of range.')
  })
})
