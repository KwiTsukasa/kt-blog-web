export interface Cubism2ParamDefinitionInstance {
  minValue: number | null
  maxValue: number | null
  defaultValue: number | null
  paramId: unknown | null
  readParamDefinition: (reader: Cubism2ParamDefinitionReader) => void
  getMinValue: () => number | null
  getMaxValue: () => number | null
  getDefaultValue: () => number | null
  getParamID: () => unknown | null
}

export interface Cubism2ParamDefinitionSetInstance {
  paramDefinitions: Cubism2ParamDefinitionInstance[] | null
  getParamDefinitions: () => Cubism2ParamDefinitionInstance[] | null
  initializeParamDefinitions: () => void
  readParamDefinitionSet: (reader: Cubism2ParamDefinitionReader) => void
  addParamDefinition: (paramDefinition: Cubism2ParamDefinitionInstance) => void
}

export interface Cubism2ParamDefinitionReader {
  readFloat32: () => number
  readObject: () => unknown
}

export type Cubism2ParamDefinitionConstructor = {
  new (): Cubism2ParamDefinitionInstance
  prototype: Cubism2ParamDefinitionInstance
}

export type Cubism2ParamDefinitionSetConstructor = {
  new (): Cubism2ParamDefinitionSetInstance
  prototype: Cubism2ParamDefinitionSetInstance
}

export interface CreateCubism2ParamDefinitionsOptions {
  isBootstrapping: () => boolean
}

export interface Cubism2ParamDefinitionConstructors {
  Cubism2ParamDefinition: Cubism2ParamDefinitionConstructor
  Cubism2ParamDefinitionSet: Cubism2ParamDefinitionSetConstructor
}

/**
 * Creates parameter-definition constructors used by the min.js-derived MOC reader.
 * @param options Runtime hook that preserves the legacy prototype-bootstrap guard.
 * @returns Param-definition constructors bound to the supplied bootstrapping guard.
 */
export function createCubism2ParamDefinitions(
  options: CreateCubism2ParamDefinitionsOptions,
): Cubism2ParamDefinitionConstructors {
  /**
   * Holds the collection of parameter default/min/max definitions deserialized from MOC data.
   */
  function Cubism2ParamDefinitionSet(this: Cubism2ParamDefinitionSetInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.paramDefinitions = null
  }

  const ParamDefinitionSet =
    Cubism2ParamDefinitionSet as unknown as Cubism2ParamDefinitionSetConstructor

  /**
   * Reads the parameter definition records owned by this set.
   * @returns Array of parameter definitions, or null before the set has been read.
   */
  ParamDefinitionSet.prototype.getParamDefinitions = function ():
    | Cubism2ParamDefinitionInstance[]
    | null {
    return this.paramDefinitions
  }

  /**
   * Initializes the parameter-definition collection used by empty model fallbacks.
   */
  ParamDefinitionSet.prototype.initializeParamDefinitions = function (): void {
    this.paramDefinitions = new Array()
  }

  /**
   * Deserializes all parameter definitions from the model binary.
   * @param reader Binary reader positioned at a parameter-definition-set payload.
   */
  ParamDefinitionSet.prototype.readParamDefinitionSet = function (
    reader: Cubism2ParamDefinitionReader,
  ): void {
    this.paramDefinitions = reader.readObject() as Cubism2ParamDefinitionInstance[] | null
  }

  /**
   * Adds one parameter definition record to the set.
   * @param paramDefinition Default/min/max metadata for one Cubism parameter.
   */
  ParamDefinitionSet.prototype.addParamDefinition = function (
    paramDefinition: Cubism2ParamDefinitionInstance,
  ): void {
    this.paramDefinitions!.push(paramDefinition)
  }

  /**
   * Holds one parameter's authored min, max, default, and identifier values.
   */
  function Cubism2ParamDefinition(this: Cubism2ParamDefinitionInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.minValue = null
    this.maxValue = null
    this.defaultValue = null
    this.paramId = null
  }

  const ParamDefinition = Cubism2ParamDefinition as unknown as Cubism2ParamDefinitionConstructor

  /**
   * Deserializes one parameter definition record from the model binary.
   * @param reader Binary reader positioned at a type-131 parameter-definition payload.
   */
  ParamDefinition.prototype.readParamDefinition = function (
    reader: Cubism2ParamDefinitionReader,
  ): void {
    this.minValue = reader.readFloat32()
    this.maxValue = reader.readFloat32()
    this.defaultValue = reader.readFloat32()
    this.paramId = reader.readObject()
  }

  /**
   * Reads the authored minimum parameter value.
   * @returns Minimum value stored in the MOC parameter definition.
   */
  ParamDefinition.prototype.getMinValue = function (): number | null {
    return this.minValue
  }

  /**
   * Reads the authored maximum parameter value.
   * @returns Maximum value stored in the MOC parameter definition.
   */
  ParamDefinition.prototype.getMaxValue = function (): number | null {
    return this.maxValue
  }

  /**
   * Reads the authored default parameter value.
   * @returns Default value stored in the MOC parameter definition.
   */
  ParamDefinition.prototype.getDefaultValue = function (): number | null {
    return this.defaultValue
  }

  /**
   * Reads the parameter ID associated with this definition.
   * @returns ParamID object/string stored in the MOC parameter definition.
   */
  ParamDefinition.prototype.getParamID = function (): unknown | null {
    return this.paramId
  }

  return {
    Cubism2ParamDefinition: ParamDefinition,
    Cubism2ParamDefinitionSet: ParamDefinitionSet,
  }
}
