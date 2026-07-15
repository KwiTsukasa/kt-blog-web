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
import { createCubism2LDGL } from './ldgl'
import { createCubism2LDTransform } from './ldTransform'
import { createCubism2Live2DRuntime } from './live2dRuntime'
import { createCubism2Math } from './math'
import { createCubism2Matrix44 } from './matrix44'
import { createCubism2ModelBase } from './modelBase'
import { createCubism2ModelContext } from './modelContext'
import { createCubism2ModelData } from './modelData'
import { createCubism2ModelWrappers } from './modelWrappers'
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

/**
 * Live2D Cubism2 runtime Core derived from the legacy WordPress min.js bundle.
 *
 * Source of truth: public/live2d/wordpress-moc/live2d.min.js.
 * Deobfuscation ledger: docs/blog-live2d-cubism2-minjs-deobfuscation-ledger.md.
 * The module-local composition preserves the source bootstrap order without publishing SDK globals.
 */
const cubism2RuntimeCore = (() => {
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
  let deferredBrowserRuntimeInfo: ReturnType<typeof createCubism2BrowserRuntimeInfo>
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
    /** Returns the grid constructor after its dependent modules have initialized. */
    get Cubism2GridBaseData() {
      return Cubism2GridBaseData
    },
    /** Returns the mesh constructor after its dependent modules have initialized. */
    get Cubism2MeshDrawData() {
      return Cubism2MeshDrawData
    },
    /** Returns the model constructor after its dependent modules have initialized. */
    get Cubism2ModelImpl() {
      return Cubism2ModelImpl
    },
    /** Returns the parameter-binding constructor after its module has initialized. */
    get Cubism2ParamBinding() {
      return Cubism2ParamBinding
    },
    /** Returns the binding-set constructor after its module has initialized. */
    get Cubism2ParamBindingSet() {
      return Cubism2ParamBindingSet
    },
    /** Returns the parameter-definition constructor after its module has initialized. */
    get Cubism2ParamDefinition() {
      return Cubism2ParamDefinition
    },
    /** Returns the definition-set constructor after its module has initialized. */
    get Cubism2ParamDefinitionSet() {
      return Cubism2ParamDefinitionSet
    },
    /** Returns the parts-data constructor after its module has initialized. */
    get Cubism2PartsData() {
      return Cubism2PartsData
    },
    /** Returns the parts-link constructor after its module has initialized. */
    get Cubism2PartsDataLinkRecord() {
      return Cubism2PartsDataLinkRecord
    },
    /** Returns the transform-base constructor after its module has initialized. */
    get Cubism2TransformBaseData() {
      return Cubism2TransformBaseData
    },
    /** Returns the transform-value constructor after its module has initialized. */
    get Cubism2TransformValue() {
      return Cubism2TransformValue
    },
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2CoreError = cubism2CoreTypes.Cubism2CoreError
  var Cubism2MocVersion = cubism2CoreTypes.Cubism2MocVersion
  var cubism2BasicValueTypes = createCubism2BasicValueTypes({
    isBootstrapping: isInstallingCubism2PrototypeDefaults,
  })
  var Cubism2IntegerValue = cubism2BasicValueTypes.Cubism2IntegerValue
  var Cubism2PointValue = cubism2BasicValueTypes.Cubism2PointValue
  var Cubism2XYValue = cubism2BasicValueTypes.Cubism2XYValue
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
      integerValueConstructor: Cubism2IntegerValue,
      pointConstructor: Cubism2PointValue,
      rectangleConstructor: Cubism2Rectangle,
      xyValueConstructor: Cubism2XYValue,
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
  Live2D.init()
  isCubism2Bootstrapping = false
  return {
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
  }
})()

export const {
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
} = cubism2RuntimeCore
