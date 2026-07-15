import type { Cubism2VersionedMocObject } from './coreTypes'

type Cubism2MocObjectConstructor = new () => Cubism2VersionedMocObject

export interface CreateCubism2MocObjectFactoryOptions {
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

export interface Cubism2MocObjectFactory {
  createObjectByTypeTag: (typeTag: number) => Cubism2VersionedMocObject | null
}

const GRID_BASE_DATA_TAG = 65
const PARAM_BINDING_SET_TAG = 66
const PARAM_BINDING_TAG = 67
const TRANSFORM_BASE_DATA_TAG = 68
const TRANSFORM_VALUE_TAG = 69
const MESH_DRAW_DATA_TAG = 70
const PARAM_DEFINITION_TAG = 131
const PARTS_DATA_TAG = 133
const MODEL_IMPL_TAG = 136
const PARAM_DEFINITION_SET_TAG = 137
const PARTS_DATA_LINK_RECORD_TAG = 142

/**
 * Creates versioned MOC object bodies for normalized Cubism2 binary type tags.
 * @param options Constructors for each object type that can appear in the WordPress Cubism2 MOC stream.
 * @returns Factory used by `Cubism2MocVersion.createObjectByTypeTag` after unsupported-tag filtering.
 */
export function createCubism2MocObjectFactory(
  options: CreateCubism2MocObjectFactoryOptions,
): Cubism2MocObjectFactory {
  const {
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
  } = options

  return {
    /**
     * Instantiates a versioned MOC object body by the type tag parsed from Cubism2BinaryReader.
     * @param typeTag Numeric object tag read from the MOC stream after version translation.
     * @returns New legacy object instance, or null when this SDK build does not support the tag.
     */
    createObjectByTypeTag(typeTag: number): Cubism2VersionedMocObject | null {
      switch (typeTag) {
        case GRID_BASE_DATA_TAG:
          return new Cubism2GridBaseData()
        case PARAM_BINDING_SET_TAG:
          return new Cubism2ParamBindingSet()
        case PARAM_BINDING_TAG:
          return new Cubism2ParamBinding()
        case TRANSFORM_BASE_DATA_TAG:
          return new Cubism2TransformBaseData()
        case TRANSFORM_VALUE_TAG:
          return new Cubism2TransformValue()
        case MESH_DRAW_DATA_TAG:
          return new Cubism2MeshDrawData()
        case PARAM_DEFINITION_TAG:
          return new Cubism2ParamDefinition()
        case PARTS_DATA_TAG:
          return new Cubism2PartsData()
        case MODEL_IMPL_TAG:
          return new Cubism2ModelImpl()
        case PARAM_DEFINITION_SET_TAG:
          return new Cubism2ParamDefinitionSet()
        case PARTS_DATA_LINK_RECORD_TAG:
          return new Cubism2PartsDataLinkRecord()
        default:
          return null
      }
    },
  }
}
