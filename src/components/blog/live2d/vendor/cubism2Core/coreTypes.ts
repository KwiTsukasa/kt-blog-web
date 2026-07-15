interface Cubism2CoreErrorInstance {
  message: string | null
}

interface Cubism2CoreErrorPrototype {
  toString: () => string | null
}

type Cubism2CoreErrorConstructor = {
  new (message: string): Cubism2CoreErrorInstance
  prototype: Cubism2CoreErrorPrototype
}

export type Cubism2VersionedMocObject = object

export type Cubism2MocObjectConstructor = new () => Cubism2VersionedMocObject

export interface Cubism2MocObjectConstructors {
  Cubism2GridBaseData: Cubism2MocObjectConstructor
  Cubism2MeshDrawData: Cubism2MocObjectConstructor
  Cubism2ModelImpl: Cubism2MocObjectConstructor
  Cubism2ParamBinding: Cubism2MocObjectConstructor
  Cubism2ParamBindingSet: Cubism2MocObjectConstructor
  Cubism2ParamDefinition: Cubism2MocObjectConstructor
  Cubism2ParamDefinitionSet: Cubism2MocObjectConstructor
  Cubism2PartsData: Cubism2MocObjectConstructor
  Cubism2PartsDataLinkRecord: Cubism2MocObjectConstructor
  Cubism2TransformBaseData: Cubism2MocObjectConstructor
  Cubism2TransformValue: Cubism2MocObjectConstructor
}

type Cubism2MocVersionConstructor = {
  new (): unknown
  LIVE2D_FORMAT_VERSION_V2_06_SDK2: number
  LIVE2D_FORMAT_VERSION_V2_07_SDK2: number
  LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER: number
  LIVE2D_FORMAT_VERSION_V2_09_SDK2: number
  LIVE2D_FORMAT_VERSION_V2_10_SDK2: number
  LIVE2D_FORMAT_VERSION_V2_11_SDK2_1: number
  MAX_SUPPORTED_FORMAT_VERSION: number
  LEGACY_MOC_MAGIC_SENTINEL_INT32: number
  INITIAL_FORMAT_VERSION: number
  LEGACY_OBJECT_TYPE_TAG_BASE: number
  OBJECT_REFERENCE_TYPE_TAG: number
  logUnsupportedTypeTag: (typeTag: number) => void
  createObjectByTypeTag: (typeTag: number) => Cubism2VersionedMocObject | null
}

export interface CreateCubism2CoreTypesOptions extends Cubism2MocObjectConstructors {
  isBootstrapping: () => boolean
}

export interface Cubism2CoreTypeConstructors {
  Cubism2CoreError: Cubism2CoreErrorConstructor
  Cubism2MocVersion: Cubism2MocVersionConstructor
}

const LIVE2D_FORMAT_VERSION_V2_06_SDK2 = 6
const LIVE2D_FORMAT_VERSION_V2_07_SDK2 = 7
const LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER = 8
const LIVE2D_FORMAT_VERSION_V2_09_SDK2 = 9
const LIVE2D_FORMAT_VERSION_V2_10_SDK2 = 10
const LIVE2D_FORMAT_VERSION_V2_11_SDK2_1 = 11
const MAX_SUPPORTED_FORMAT_VERSION = LIVE2D_FORMAT_VERSION_V2_11_SDK2_1
const LEGACY_MOC_MAGIC_SENTINEL_INT32 = -2004318072
const INITIAL_FORMAT_VERSION = 0
const LEGACY_OBJECT_TYPE_TAG_BASE = 23
const OBJECT_REFERENCE_TYPE_TAG = 33

/**
 * Creates low-level error and MOC-version helpers used by the min.js-derived Cubism2 runtime.
 * @param options Bootstrap state and the eleven concrete constructors selected by MOC type tags.
 * @returns Constructors exposing only semantic error and MOC-version APIs.
 */
export function createCubism2CoreTypes(
  options: CreateCubism2CoreTypesOptions,
): Cubism2CoreTypeConstructors {
  /**
   * Stores a legacy Cubism2 load/read error message.
   * @param message Error message carried through the Cubism2 SDK error path.
   */
  function Cubism2CoreError(this: Cubism2CoreErrorInstance, message: string): void {
    if (options.isBootstrapping()) {
      return
    }
    this.message = message
  }

  const CoreError = Cubism2CoreError as unknown as Cubism2CoreErrorConstructor

  /**
   * @returns Error message for runtime logging.
   */
  CoreError.prototype.toString = function (this: Cubism2CoreErrorInstance): string | null {
    return this.message
  }

  /**
   * Static holder for Cubism2 MOC format versions and binary object type tags.
   */
  function Cubism2MocVersion(): void {}

  const MocVersion = Cubism2MocVersion as unknown as Cubism2MocVersionConstructor
  MocVersion.LIVE2D_FORMAT_VERSION_V2_06_SDK2 = LIVE2D_FORMAT_VERSION_V2_06_SDK2
  MocVersion.LIVE2D_FORMAT_VERSION_V2_07_SDK2 = LIVE2D_FORMAT_VERSION_V2_07_SDK2
  MocVersion.LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER =
    LIVE2D_FORMAT_VERSION_WITH_CHECKSUM_MARKER
  MocVersion.LIVE2D_FORMAT_VERSION_V2_09_SDK2 = LIVE2D_FORMAT_VERSION_V2_09_SDK2
  MocVersion.LIVE2D_FORMAT_VERSION_V2_10_SDK2 = LIVE2D_FORMAT_VERSION_V2_10_SDK2
  MocVersion.LIVE2D_FORMAT_VERSION_V2_11_SDK2_1 = LIVE2D_FORMAT_VERSION_V2_11_SDK2_1
  MocVersion.MAX_SUPPORTED_FORMAT_VERSION = MAX_SUPPORTED_FORMAT_VERSION
  MocVersion.LEGACY_MOC_MAGIC_SENTINEL_INT32 = LEGACY_MOC_MAGIC_SENTINEL_INT32
  MocVersion.INITIAL_FORMAT_VERSION = INITIAL_FORMAT_VERSION
  MocVersion.LEGACY_OBJECT_TYPE_TAG_BASE = LEGACY_OBJECT_TYPE_TAG_BASE
  MocVersion.OBJECT_REFERENCE_TYPE_TAG = OBJECT_REFERENCE_TYPE_TAG

  /**
   * Logs an unsupported MOC object type tag exactly like the legacy min.js branch.
   * @param typeTag Numeric type tag read from the MOC object stream.
   */
  MocVersion.logUnsupportedTypeTag = function logUnsupportedTypeTag(typeTag: number): void {
    console.log('Cubism2 MOC object type is not supported: %d\n', typeTag)
  }

  /**
   * Creates a versioned MOC object instance from a binary type tag.
   * @param typeTag Numeric type tag after version-specific translation by `Cubism2BinaryReader`.
   * @returns New object instance, or null when the type is unsupported by this SDK build.
   */
  MocVersion.createObjectByTypeTag = function createObjectByTypeTag(
    typeTag: number,
  ): Cubism2VersionedMocObject | null {
    if (typeTag < 40) {
      MocVersion.logUnsupportedTypeTag(typeTag)
      return null
    } else if (typeTag < 50) {
      MocVersion.logUnsupportedTypeTag(typeTag)
      return null
    } else if (typeTag < 60) {
      MocVersion.logUnsupportedTypeTag(typeTag)
      return null
    } else if (typeTag < 100) {
      switch (typeTag) {
        case 65:
          return new options.Cubism2GridBaseData()
        case 66:
          return new options.Cubism2ParamBindingSet()
        case 67:
          return new options.Cubism2ParamBinding()
        case 68:
          return new options.Cubism2TransformBaseData()
        case 69:
          return new options.Cubism2TransformValue()
        case 70:
          return new options.Cubism2MeshDrawData()
        default:
          MocVersion.logUnsupportedTypeTag(typeTag)
          return null
      }
    } else if (typeTag < 150) {
      switch (typeTag) {
        case 131:
          return new options.Cubism2ParamDefinition()
        case 133:
          return new options.Cubism2PartsData()
        case 136:
          return new options.Cubism2ModelImpl()
        case 137:
          return new options.Cubism2ParamDefinitionSet()
        case 142:
          return new options.Cubism2PartsDataLinkRecord()
      }
    }
    MocVersion.logUnsupportedTypeTag(typeTag)
    return null
  }
  return {
    Cubism2CoreError: CoreError,
    Cubism2MocVersion: MocVersion,
  }
}
