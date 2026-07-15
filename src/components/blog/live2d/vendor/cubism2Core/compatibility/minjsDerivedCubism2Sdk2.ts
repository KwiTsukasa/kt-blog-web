/* eslint-disable */
import { createCubism2BasicValueTypes } from './basicValueTypes'
import { createCubism2AffineTransform } from './affineTransform'
import { createCubism2BaseData } from './baseData'
import { createCubism2BaseContext } from './baseContext'
import { createCubism2BinaryReader } from './binaryReader'
import { createCubism2CanvasDrawParam } from './canvasDrawParam'
import { createCubism2CoreTypes } from './coreTypes'
import { createCubism2DrawContextBase } from './drawContextBase'
import { createCubism2DrawData } from './drawData'
import { createCubism2DrawParamBase } from './drawParamBase'
import { createCubism2Geometry } from './geometry'
import { createCubism2GridBaseData } from './gridBaseData'
import { createCubism2IdTypes } from './idTypes'
import { createCubism2Interpolation } from './interpolation'
import { createCubism2LegacyMotion } from './legacyMotion'
import { createCubism2LDGL } from './ldgl'
import { createCubism2LDTransform } from './ldTransform'
import { createCubism2Live2DRuntime } from './live2dRuntime'
import { createCubism2Math } from './math'
import { createCubism2Matrix44 } from './matrix44'
import { createCubism2ModelBase } from './modelBase'
import { createCubism2ModelContext } from './modelContext'
import { createCubism2ModelData } from './modelData'
import { createCubism2ModelWrappers } from './modelWrappers'
import { createCubism2MocObjectFactory } from './mocObjectFactory'
import { createCubism2AutoEyeBlink } from './autoEyeBlink'
import { createCubism2MotionBase } from './motionBase'
import { createCubism2MotionParser } from './motionParser'
import { createCubism2ParamBindings } from './paramBinding'
import { createCubism2ParamDefinitions } from './paramDefinition'
import { createCubism2PartsData } from './partsData'
import { createCubism2PhysicsHair } from './physicsHair'
import { createCubism2BrowserRuntimeInfo } from './runtimeInfo'
import { createCubism2RuntimeConstants } from './runtimeConstants'
import { createCubism2RuntimeUtilities } from './runtimeUtilities'
import { createCubism2TransformBaseData } from './transformBaseData'
import { createCubism2TransformValue } from './transformValue'
import { createCubism2UtVector } from './utVector'
import { createCubism2WebGLDrawParam } from './webglDrawParam'
import { createCubism2WebGLClipping } from './webglClipping'
import {
  CUBISM2_SDK_GLOBALS,
  type Cubism2SdkGlobalMap,
  type Cubism2SdkGlobalName,
} from '../sdkGlobalNames'

/**
 * Live2D Cubism2 compatibility capsule derived from the legacy WordPress min.js bundle.
 *
 * Source of truth: public/live2d/wordpress-moc/live2d.min.js.
 * Deobfuscation ledger: docs/blog-live2d-cubism2-minjs-deobfuscation-ledger.md.
 * This file is generated from staged min.js restoration passes; do not hand-edit kernel logic here.
 */

const cubism2RuntimeTarget = globalThis as typeof globalThis & Record<Cubism2SdkGlobalName, unknown>

/**
 * Publishes the restored Cubism2 SDK globals in the same public-name order as the min.js tail exports.
 * @param cubism2Target Global object that receives the SDK public constructors and utilities.
 * @param globals Restored SDK values keyed by the public names used by the original bundle tail.
 */
function exposeCubism2SdkGlobals(
  cubism2Target: Record<Cubism2SdkGlobalName, unknown>,
  globals: Cubism2SdkGlobalMap,
): void {
  for (const globalName of CUBISM2_SDK_GLOBALS) {
    cubism2Target[globalName] = globals[globalName]
  }
}
;(function (cubism2Target) {
  var isCubism2Bootstrapping = true
  /**
   * Reads the current Cubism2 prototype bootstrapping flag for extracted domain factories.
   * @returns True while the legacy kernel is installing no-op prototype instances.
   */
  function isInstallingCubism2PrototypeDefaults() {
    return isCubism2Bootstrapping
  }
  var cubism2RuntimeUtilities = createCubism2RuntimeUtilities()
  var UtSystem = cubism2RuntimeUtilities.UtSystem
  var UtDebug = cubism2RuntimeUtilities.UtDebug
  /**
   * Bridges the legacy min.js `System.err.printf` diagnostic hook into restored UtDebug info logging.
   * @param message Legacy printf-style message emitted by rare grid extrapolation diagnostics.
   * @param args Diagnostic interpolation values passed by the legacy grid algorithm.
   */
  function logLegacySystemErrDiagnostic(message: string, ...args: unknown[]): void {
    UtDebug.logWithLegacyPrefix(message, ...args)
  }
  var cubism2LegacySystem = {
    err: {
      printf: logLegacySystemErrDiagnostic,
    },
  }
  let deferredMocObjectFactory: ReturnType<typeof createCubism2MocObjectFactory>
  let deferredBrowserRuntimeInfo: ReturnType<typeof createCubism2BrowserRuntimeInfo>
  /**
   * Defers versioned MOC object instantiation until all constructors have been created.
   * @param typeTag Numeric object tag read from the MOC stream after version translation.
   * @returns New legacy object instance, or null when this SDK build does not support the tag.
   */
  function createVersionedMocObjectByTypeTag(typeTag: number) {
    return deferredMocObjectFactory.createObjectByTypeTag(typeTag)
  }
  /**
   * Defers browser profile access until the runtime-info module has been initialized.
   * @returns Browser runtime detector used by the restored `Live2D.initProfile` path.
   */
  function readDeferredBrowserRuntimeInfo() {
    return deferredBrowserRuntimeInfo
  }
  /**
   * Reads the restored Live2D verbose diagnostic flag for affine-transform logging branches.
   * @returns Current semantic verbose state exposed by the Live2D runtime.
   */
  function readLive2DVerboseLoggingState() {
    return Live2D.isVerboseLoggingEnabled()
  }
  var cubism2Geometry = createCubism2Geometry({
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2Rectangle = cubism2Geometry.Cubism2Rectangle
  var Cubism2FloatRectangle = cubism2Geometry.Cubism2FloatRectangle
  var cubism2CoreTypes = createCubism2CoreTypes({
    createObjectByTypeTag: createVersionedMocObjectByTypeTag,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2CoreError = cubism2CoreTypes.Cubism2CoreError
  var Cubism2MocVersion = cubism2CoreTypes.Cubism2MocVersion
  var cubism2BasicValueTypes = createCubism2BasicValueTypes({
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2LegacyIntegerValue = cubism2BasicValueTypes.Cubism2LegacyIntegerValue
  var Cubism2PointValue = cubism2BasicValueTypes.Cubism2PointValue
  var Cubism2Tag22XYValue = cubism2BasicValueTypes.Cubism2Tag22XYValue
  var Cubism2Math = createCubism2Math()
  var Cubism2Matrix44 = createCubism2Matrix44({
    Cubism2Math,
  })
  var LDTransform = createCubism2LDTransform()
  var Cubism2DrawContextBase = createCubism2DrawContextBase({
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2BaseContext = createCubism2BaseContext({
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var cubism2ParamDefinitions = createCubism2ParamDefinitions({
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2ParamDefinition = cubism2ParamDefinitions.Cubism2ParamDefinition
  var Cubism2ParamDefinitionSet = cubism2ParamDefinitions.Cubism2ParamDefinitionSet
  var cubism2ModelData = createCubism2ModelData({
    Cubism2ParamDefinitionSet,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2ModelImpl = cubism2ModelData.Cubism2ModelImpl
  var cubism2PartsData = createCubism2PartsData({
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2PartsDataLinkRecord = cubism2PartsData.Cubism2PartsDataLinkRecord
  var Cubism2PartsData = cubism2PartsData.Cubism2PartsData
  var Cubism2PartsContext = cubism2PartsData.Cubism2PartsContext
  var cubism2IdTypes = createCubism2IdTypes({
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2IdBase = cubism2IdTypes.Cubism2IdBase
  var PartsDataID = cubism2IdTypes.PartsDataID
  var ParamID = cubism2IdTypes.ParamID
  var DrawDataID = cubism2IdTypes.DrawDataID
  var BaseDataID = cubism2IdTypes.BaseDataID
  var Cubism2RuntimeConstants = createCubism2RuntimeConstants()
  var Live2D = createCubism2Live2DRuntime({
    getBrowserRuntimeInfo: readDeferredBrowserRuntimeInfo,
  })
  var cubism2ParamBindings = createCubism2ParamBindings({
    Cubism2RuntimeConstants,
    Live2D,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2ParamBinding = cubism2ParamBindings.Cubism2ParamBinding
  var Cubism2ParamBindingSet = cubism2ParamBindings.Cubism2ParamBindingSet
  var cubism2Interpolation = createCubism2Interpolation({
    UtSystem,
  })
  var Cubism2Interpolation = cubism2Interpolation.Cubism2Interpolation
  var cubism2DrawData = createCubism2DrawData({
    BaseDataID,
    Cubism2DrawContextBase,
    Cubism2MocVersion,
    Cubism2ParamBindingSet,
    Cubism2RuntimeConstants,
    Live2D,
    UtDebug,
    interpolator: Cubism2Interpolation,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2DrawDataBase = cubism2DrawData.Cubism2DrawDataBase
  var Cubism2MeshDrawData = cubism2DrawData.Cubism2MeshDrawData
  var Cubism2MeshDrawContext = cubism2DrawData.Cubism2MeshDrawContext
  var cubism2DrawParamBase = createCubism2DrawParamBase({
    Live2D,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2DrawParamBase = cubism2DrawParamBase.Cubism2DrawParamBase
  var Cubism2RgbaColor = cubism2DrawParamBase.Cubism2RgbaColor
  var Cubism2BaseData = createCubism2BaseData({
    BaseDataID,
    Cubism2MocVersion,
    interpolator: Cubism2Interpolation,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2TransformValue = createCubism2TransformValue({
    Cubism2MocVersion,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var cubism2TransformBaseData = createCubism2TransformBaseData({
    Cubism2BaseContext,
    Cubism2BaseData,
    Cubism2Math,
    Cubism2ParamBindingSet,
    Cubism2TransformValue,
    Live2D,
    UtDebug,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2TransformBaseData = cubism2TransformBaseData.Cubism2TransformBaseData
  var Cubism2TransformContext = cubism2TransformBaseData.Cubism2TransformContext
  var cubism2GridBaseData = createCubism2GridBaseData({
    Cubism2BaseContext,
    Cubism2BaseData,
    Cubism2Interpolation,
    Cubism2ParamBindingSet,
    Live2D,
    System: cubism2LegacySystem,
    UtDebug,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2GridBaseData = cubism2GridBaseData.Cubism2GridBaseData
  var Cubism2GridContext = cubism2GridBaseData.Cubism2GridContext
  var cubism2MotionBase = createCubism2MotionBase({
    Cubism2Math,
    UtDebug,
    UtSystem,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var AMotion = cubism2MotionBase.AMotion
  var MotionQueueManager = cubism2MotionBase.MotionQueueManager
  var Cubism2MotionQueueEntry = cubism2MotionBase.Cubism2MotionQueueEntry
  var cubism2AutoEyeBlink = createCubism2AutoEyeBlink({
    UtSystem,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
    random: Cubism2Math.randomUnit,
  })
  var Cubism2AutoEyeBlink = cubism2AutoEyeBlink.Cubism2AutoEyeBlink
  var cubism2MotionParser = createCubism2MotionParser({
    AMotion,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Live2DMotion = cubism2MotionParser.Live2DMotion
  var Cubism2MotionCurve = cubism2MotionParser.Cubism2MotionCurve
  var MotionTextReader = cubism2MotionParser.MotionTextReader
  var Cubism2AffineTransform = createCubism2AffineTransform({
    UtSystem,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
    isVerboseLoggingEnabled: readLive2DVerboseLoggingState,
  })
  deferredMocObjectFactory = createCubism2MocObjectFactory({
    Cubism2GridBaseData,
    Cubism2MeshDrawData,
    Cubism2ModelImpl,
    Cubism2ParamBinding,
    Cubism2ParamBindingSet,
    Cubism2ParamDefinition,
    Cubism2ParamDefinitionSet,
    Cubism2PartsData,
    Cubism2PartsDataLinkRecord,
    Cubism2TransformBaseData,
    Cubism2TransformValue,
  })
  var Cubism2BinaryReader = createCubism2BinaryReader({
    Cubism2CoreError,
    Cubism2MocVersion,
    idConstructors: {
      BaseDataID,
      DrawDataID,
      ParamID,
      PartsDataID,
    },
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
    valueConstructors: {
      affineTransformConstructor: Cubism2AffineTransform,
      floatRectangleConstructor: Cubism2FloatRectangle,
      integerValueConstructor: Cubism2LegacyIntegerValue,
      pointConstructor: Cubism2PointValue,
      rectangleConstructor: Cubism2Rectangle,
      tag22XYValueConstructor: Cubism2Tag22XYValue,
    },
  })
  var cubism2WebGLClipping = createCubism2WebGLClipping({
    Cubism2FloatRectangle,
    Cubism2Matrix44,
    Cubism2RgbaColor,
    Cubism2RuntimeConstants,
    Live2D,
    UtDebug,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2ClippingManager = cubism2WebGLClipping.Cubism2ClippingManager
  var cubism2ModelContext = createCubism2ModelContext({
    BaseDataID,
    Cubism2ClippingManager,
    Cubism2DrawDataBase,
    Cubism2RuntimeConstants,
    DrawDataID,
    Live2D,
    UtDebug,
    UtSystem,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var ModelContext = cubism2ModelContext.ModelContext
  var Live2DModelBase = createCubism2ModelBase({
    Cubism2BinaryReader,
    Cubism2CoreError,
    Cubism2DrawDataBase,
    Cubism2MeshDrawContext,
    Cubism2MeshDrawData,
    Cubism2MocVersion,
    Cubism2ModelImpl,
    DrawDataID,
    ModelContext,
    ParamID,
    PartsDataID,
    UtDebug,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var PhysicsHair = createCubism2PhysicsHair({
    Cubism2Math,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2UtVector = createCubism2UtVector()
  var CanvasDrawParam = createCubism2CanvasDrawParam({
    Cubism2DrawParamBase,
    Live2D,
    UtSystem,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var cubism2LegacyMotion = createCubism2LegacyMotion({
    AMotion,
    Cubism2MotionCurve,
    MotionTextReader,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var LegacyLive2DMotion = cubism2LegacyMotion.LegacyLive2DMotion
  var LDGL = createCubism2LDGL({
    LDTransform,
    Live2D,
    UtDebug,
    solveAffineTransform: Cubism2UtVector.solveAffineCoordinates,
  })
  var WebGLDrawParam = createCubism2WebGLDrawParam({
    Cubism2DrawParamBase,
    Live2D,
    UtDebug,
    blendModes: Cubism2MeshDrawData,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var cubism2ModelWrappers = createCubism2ModelWrappers({
    CanvasDrawParam,
    Live2D,
    Live2DModelBase,
    UtDebug,
    WebGLDrawParam,
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Live2DModelJS = cubism2ModelWrappers.Live2DModelJS
  var Live2DModelWebGL = cubism2ModelWrappers.Live2DModelWebGL
  deferredBrowserRuntimeInfo = createCubism2BrowserRuntimeInfo({
    logger: UtDebug,
    userAgent: navigator.userAgent,
  })
  exposeCubism2SdkGlobals(cubism2Target, {
    UtSystem,
    UtDebug,
    LDTransform,
    LDGL,
    Live2D,
    Live2DModelWebGL,
    Live2DModelJS,
    Live2DMotion,
    MotionQueueManager,
    PhysicsHair,
    AMotion,
    PartsDataID,
    DrawDataID,
    BaseDataID,
    ParamID,
  })
  Live2D.init()
  isCubism2Bootstrapping = false
})(cubism2RuntimeTarget)

/**
 * Reads one restored Cubism2 global after the min.js-derived capsule has initialized.
 * @param globalName Public SDK global name exported by the Cubism2 core IIFE.
 * @returns The initialized Cubism2 runtime value bound to the requested global name.
 */
function readCubism2RestoredGlobal(globalName: Cubism2SdkGlobalName): unknown {
  const value = cubism2RuntimeTarget[globalName]
  if (!value) {
    throw new Error(`Cubism2 min.js-derived runtime did not expose ${globalName}.`)
  }
  return value
}

export const UtSystem = readCubism2RestoredGlobal('UtSystem')
export const UtDebug = readCubism2RestoredGlobal('UtDebug')
export const LDTransform = readCubism2RestoredGlobal('LDTransform')
export const LDGL = readCubism2RestoredGlobal('LDGL')
export const Live2D = readCubism2RestoredGlobal('Live2D')
export const Live2DModelWebGL = readCubism2RestoredGlobal('Live2DModelWebGL')
export const Live2DModelJS = readCubism2RestoredGlobal('Live2DModelJS')
export const Live2DMotion = readCubism2RestoredGlobal('Live2DMotion')
export const MotionQueueManager = readCubism2RestoredGlobal('MotionQueueManager')
export const PhysicsHair = readCubism2RestoredGlobal('PhysicsHair')
export const AMotion = readCubism2RestoredGlobal('AMotion')
export const PartsDataID = readCubism2RestoredGlobal('PartsDataID')
export const DrawDataID = readCubism2RestoredGlobal('DrawDataID')
export const BaseDataID = readCubism2RestoredGlobal('BaseDataID')
export const ParamID = readCubism2RestoredGlobal('ParamID')
