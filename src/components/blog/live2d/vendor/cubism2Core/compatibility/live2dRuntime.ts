const VERSION_STRING = '2.1.00_1'
const BUILD_NUMBER = 201001000

const PROFILE_CODE_IOS_SPEED = 9901
const PROFILE_CODE_IOS_QUALITY = 9902
const PROFILE_CODE_IOS_DEFAULT = 9903
const PROFILE_CODE_ANDROID = 9904
const PROFILE_CODE_DESKTOP = 9905

export interface Cubism2Live2DBrowserRuntimeInfo {
  isAndroid: () => boolean | undefined
  isIOS: () => boolean | undefined
}

export interface Cubism2Live2DProfile extends Record<string, boolean | number | string> {
  EXPAND_W: number
  PROFILE_NAME: string
  USE_ADJUST_TRANSLATION: boolean
  USE_CACHED_POLYGON_IMAGE: boolean
}

export interface Cubism2Live2DStatic extends Record<string, unknown> {
  DEBUG_DATA: Record<string, number | undefined>
  EXPAND_W: number
  IGNORE_CLIP: boolean
  IGNORE_EXPAND: boolean
  L2D_COLOR_BLEND_MODE_ADD: number
  L2D_COLOR_BLEND_MODE_INTERPOLATE: number
  L2D_COLOR_BLEND_MODE_MULT: number
  L2D_DEFORMER_EXTEND: boolean
  L2D_ERROR_MODEL_UPDATE: number
  L2D_NO_ERROR: number
  PROFILE_ANDROID: Cubism2Live2DProfile
  PROFILE_DESKTOP: Cubism2Live2DProfile
  PROFILE_IOS_DEFAULT: Cubism2Live2DProfile
  PROFILE_IOS_QUALITY: Cubism2Live2DProfile
  PROFILE_IOS_SPEED: Cubism2Live2DProfile
  PROFILE_NAME?: string
  USE_ADJUST_TRANSLATION: boolean
  USE_CACHED_POLYGON_IMAGE: boolean
  USE_CANVAS_TRANSFORM: boolean
  buildNumber: number
  clippingMaskBufferSize: number
  deleteBuffer: (glContextIndex: number) => void
  dispose: () => void
  fTexture: unknown[]
  frameBuffers: Array<{ framebuffer: unknown } | undefined>
  getClippingMaskBufferSize: () => number
  getError: () => number
  getGL: <TContext = unknown>(glContextIndex?: number) => TContext
  getVersionNo: () => number
  getVersionStr: () => string
  glContext: unknown[]
  init: () => void
  initProfile: () => void
  isInitializationPending: boolean
  isVerboseLoggingEnabled: () => boolean
  lastErrorCode: number
  setClippingMaskBufferSize: (bufferSize: number) => void
  setErrorCode: (errorCode: number) => void
  setGL: <TContext>(glContext: TContext, glContextIndex?: number) => void
  setupProfile: (profile: Cubism2Live2DProfile | number, shouldLog?: boolean) => void
  shouldClampSdk1GridPointsToUnitRange: boolean
  shouldThrowOnInvalidInterpolationCorner: boolean
  shouldUpdateClippedDrawContextOpacity: boolean
  verboseLoggingEnabled: boolean
  versionString: string
}

export interface CreateCubism2Live2DRuntimeOptions {
  alert?: (message: string) => void
  getBrowserRuntimeInfo: () => Cubism2Live2DBrowserRuntimeInfo
  logger?: Pick<Console, 'log'>
}

/**
 * Creates the browser alert bridge used by the legacy unknown-profile branch.
 * @returns Alert function that no-ops when no browser alert API exists.
 */
function createDefaultAlert(): (message: string) => void {
  /**
   * Forwards an unknown-profile diagnostic to `globalThis.alert` when available.
   * @param message Legacy profile error text produced by the runtime namespace.
   */
  return function defaultAlert(message: string): void {
    if (typeof globalThis.alert == 'function') {
      globalThis.alert(message)
    }
  }
}

/**
 * Resolves a numeric legacy profile id to the static profile object it names.
 * @param Live2D Runtime namespace carrying the profile table.
 * @param profile Numeric legacy profile id or direct profile object passed by callers.
 * @param alert Unknown-profile reporter from the original min.js branch.
 * @returns The resolved profile object, or the original number when the legacy id is unknown.
 */
function resolveProfile(
  Live2D: Cubism2Live2DStatic,
  profile: Cubism2Live2DProfile | number,
  alert: (message: string) => void,
): Cubism2Live2DProfile | number {
  if (typeof profile != 'number') {
    return profile
  }
  switch (profile) {
    case PROFILE_CODE_IOS_SPEED:
      return Live2D.PROFILE_IOS_SPEED
    case PROFILE_CODE_IOS_QUALITY:
      return Live2D.PROFILE_IOS_QUALITY
    case PROFILE_CODE_IOS_DEFAULT:
      return Live2D.PROFILE_IOS_DEFAULT
    case PROFILE_CODE_ANDROID:
      return Live2D.PROFILE_ANDROID
    case PROFILE_CODE_DESKTOP:
      return Live2D.PROFILE_DESKTOP
    default:
      alert('Unknown Live2D profile: ' + profile)
      return profile
  }
}

/**
 * Creates the Cubism2 `Live2D` static runtime namespace recovered from min.js.
 * @param options Browser-runtime provider, optional logger, and optional alert bridge.
 * @returns `Live2D` namespace with semantic static fields and methods.
 */
export function createCubism2Live2DRuntime(
  options: CreateCubism2Live2DRuntimeOptions,
): Cubism2Live2DStatic {
  const logger = options.logger ?? console
  const alert = options.alert ?? createDefaultAlert()
  const getBrowserRuntimeInfo = options.getBrowserRuntimeInfo

  /**
   * Legacy Cubism2 Live2D namespace constructor; static fields carry the runtime state.
   */
  function Live2D(): void {}

  const Runtime = Live2D as unknown as Cubism2Live2DStatic

  Runtime.versionString = VERSION_STRING
  Runtime.buildNumber = BUILD_NUMBER
  Runtime.verboseLoggingEnabled = true
  Runtime.shouldThrowOnInvalidInterpolationCorner = true
  Runtime.shouldClampSdk1GridPointsToUnitRange = true
  Runtime.L2D_DEFORMER_EXTEND = true
  Runtime.shouldUpdateClippedDrawContextOpacity = false
  Runtime.L2D_NO_ERROR = 0
  Runtime.L2D_ERROR_MODEL_UPDATE = 4000
  Runtime.L2D_COLOR_BLEND_MODE_MULT = 0
  Runtime.L2D_COLOR_BLEND_MODE_ADD = 1
  Runtime.L2D_COLOR_BLEND_MODE_INTERPOLATE = 2
  Runtime.isInitializationPending = true
  Runtime.lastErrorCode = 0
  Runtime.clippingMaskBufferSize = 256
  Runtime.glContext = new Array()
  Runtime.frameBuffers = new Array()
  Runtime.fTexture = new Array()
  Runtime.IGNORE_CLIP = false
  Runtime.IGNORE_EXPAND = false
  Runtime.EXPAND_W = 2
  Runtime.USE_ADJUST_TRANSLATION = true
  Runtime.USE_CANVAS_TRANSFORM = true
  Runtime.USE_CACHED_POLYGON_IMAGE = false
  Runtime.DEBUG_DATA = {}
  Runtime.PROFILE_IOS_SPEED = {
    PROFILE_NAME: 'iOS Speed',
    USE_ADJUST_TRANSLATION: true,
    USE_CACHED_POLYGON_IMAGE: true,
    EXPAND_W: 4,
  }
  Runtime.PROFILE_IOS_QUALITY = {
    PROFILE_NAME: 'iOS HiQ',
    USE_ADJUST_TRANSLATION: true,
    USE_CACHED_POLYGON_IMAGE: false,
    EXPAND_W: 2,
  }
  Runtime.PROFILE_IOS_DEFAULT = Runtime.PROFILE_IOS_QUALITY
  Runtime.PROFILE_ANDROID = {
    PROFILE_NAME: 'Android',
    USE_ADJUST_TRANSLATION: false,
    USE_CACHED_POLYGON_IMAGE: false,
    EXPAND_W: 2,
  }
  Runtime.PROFILE_DESKTOP = {
    PROFILE_NAME: 'Desktop',
    USE_ADJUST_TRANSLATION: false,
    USE_CACHED_POLYGON_IMAGE: false,
    EXPAND_W: 2,
  }

  /**
   * Applies the browser-family default profile chosen by the restored runtime info module.
   */
  Runtime.initProfile = function (): void {
    const browserRuntimeInfo = getBrowserRuntimeInfo()
    if (browserRuntimeInfo.isIOS()) {
      Runtime.setupProfile(Runtime.PROFILE_IOS_DEFAULT)
    } else if (browserRuntimeInfo.isAndroid()) {
      Runtime.setupProfile(Runtime.PROFILE_ANDROID)
    } else {
      Runtime.setupProfile(Runtime.PROFILE_DESKTOP)
    }
  }

  /**
   * Applies either a direct profile object or one of the legacy numeric profile constants.
   * @param profile Direct profile object or legacy numeric selector.
   * @param shouldLog Whether to emit the original profile diagnostic lines; defaults to true.
   */
  Runtime.setupProfile = function (
    profile: Cubism2Live2DProfile | number,
    shouldLog?: boolean,
  ): void {
    const resolvedProfile = resolveProfile(Runtime, profile, alert)
    const shouldPrintProfile = arguments.length < 2 ? true : shouldLog
    if (shouldPrintProfile) {
      logger.log('profile : ' + (resolvedProfile as Cubism2Live2DProfile).PROFILE_NAME)
    }
    for (const profileKey in resolvedProfile as Cubism2Live2DProfile) {
      Runtime[profileKey] = (resolvedProfile as Cubism2Live2DProfile)[profileKey]
      if (shouldPrintProfile) {
        logger.log('  [' + profileKey + '] = ' + (resolvedProfile as Cubism2Live2DProfile)[profileKey])
      }
    }
  }

  /**
   * Performs one-time Live2D runtime startup and applies the default browser profile.
   */
  Runtime.init = function (): void {
    if (Runtime.isInitializationPending) {
      logger.log('Live2D %s', Runtime.versionString)
      Runtime.isInitializationPending = false
      let shouldInitializeProfile = false
      shouldInitializeProfile = true
      if (shouldInitializeProfile) {
        Runtime.initProfile()
      }
    }
  }

  /**
   * Reads the legacy version string.
   * @returns Cubism2 runtime version string from the min.js namespace.
   */
  Runtime.getVersionStr = function (): string {
    return Runtime.versionString
  }

  /**
   * Reads the legacy build number.
   * @returns Cubism2 runtime build number from the min.js namespace.
   */
  Runtime.getVersionNo = function (): number {
    return Runtime.buildNumber
  }

  /**
   * Reads the legacy verbose diagnostic flag used by affine, grid, and draw-data branches.
   * @returns True when min.js-compatible verbose diagnostic output is enabled.
   */
  Runtime.isVerboseLoggingEnabled = function (): boolean {
    return Runtime.verboseLoggingEnabled
  }

  /**
   * Stores the last Live2D runtime error code.
   * @param errorCode Legacy runtime error code set by model loading and validation branches.
   */
  Runtime.setErrorCode = function (errorCode: number): void {
    Runtime.lastErrorCode = errorCode
  }
  /**
   * Reads and clears the last Live2D runtime error code.
   * @returns Last error code, or zero after it has been consumed.
   */
  Runtime.getError = function (): number {
    const errorCode = Runtime.lastErrorCode
    Runtime.lastErrorCode = 0
    return errorCode
  }

  /**
   * Clears GL, framebuffer, and texture registries held by the static namespace.
   */
  Runtime.dispose = function (): void {
    Runtime.glContext = []
    Runtime.frameBuffers = []
    Runtime.fTexture = []
  }

  /**
   * Registers one WebGL context under a legacy numeric slot.
   * @param glContext WebGL-like context consumed by WebGL draw params.
   * @param glContextIndex Optional slot index; omitted values use slot 0 just like min.js.
   */
  Runtime.setGL = function <TContext>(
    glContext: TContext,
    glContextIndex?: number,
  ): void {
    const resolvedIndex = glContextIndex || 0
    Runtime.glContext[resolvedIndex] = glContext
  }

  /**
   * Reads a registered GL context by slot.
   * @param glContextIndex Slot index requested by model wrappers.
   * @returns Registered GL context, or undefined when the slot is empty.
   */
  Runtime.getGL = function <TContext = unknown>(glContextIndex?: number): TContext {
    return Runtime.glContext[glContextIndex as number] as TContext
  }

  /**
   * Updates the clipping mask framebuffer size shared by WebGL draw params.
   * @param bufferSize Square framebuffer edge length in pixels.
   */
  Runtime.setClippingMaskBufferSize = function (bufferSize: number): void {
    Runtime.clippingMaskBufferSize = bufferSize
  }

  /**
   * Reads the clipping mask framebuffer size.
   * @returns Current square framebuffer edge length in pixels.
   */
  Runtime.getClippingMaskBufferSize = function (): number {
    return Runtime.clippingMaskBufferSize
  }

  /**
   * Deletes one framebuffer slot and its paired GL registry entry.
   * @param glContextIndex Slot index whose framebuffer should be deleted.
   */
  Runtime.deleteBuffer = function (glContextIndex: number): void {
    const glContext = Runtime.getGL(glContextIndex) as { deleteFramebuffer: (framebuffer: unknown) => void }
    glContext.deleteFramebuffer(Runtime.frameBuffers[glContextIndex]!.framebuffer)
    delete Runtime.frameBuffers[glContextIndex]
    delete Runtime.glContext[glContextIndex]
  }

  return Runtime
}
