export interface Cubism2IdInstance {
  id: string | undefined
  createEmptyID?: () => Cubism2IdInstance
  createEmptyInstance?: () => Cubism2IdInstance
  toString: () => string | undefined
}

type Cubism2IdCache = Record<string, Cubism2IdInstance> & {
  clear?: () => void
}

export type Cubism2IdConstructor = {
  new (id?: string): Cubism2IdInstance
  prototype: Cubism2IdInstance
  idCache: Cubism2IdCache
  getID(id: string | undefined): Cubism2IdInstance
}

export type Cubism2PartsDataIdConstructor = Cubism2IdConstructor & {
  resetPartsDataIdCache: () => void
}

export type Cubism2ParamIdConstructor = Cubism2IdConstructor & {
  resetParamIdCache: () => void
}

export type Cubism2DrawDataIdConstructor = Cubism2IdConstructor & {
  resetDrawDataIdCache: () => void
}

export type Cubism2BaseDataIdConstructor = Cubism2IdConstructor & {
  defaultBaseDataId: Cubism2IdInstance | null
  getDefaultBaseDataID: () => Cubism2IdInstance
  resetCache: () => void
}

export type Cubism2IdBaseConstructor = {
  new (id?: string): Cubism2IdInstance
  prototype: Cubism2IdInstance
  resetAllIdCaches: () => void
}

export interface CreateCubism2IdTypesOptions {
  isBootstrapping: () => boolean
}

export interface Cubism2IdTypeConstructors {
  BaseDataID: Cubism2BaseDataIdConstructor
  Cubism2IdBase: Cubism2IdBaseConstructor
  DrawDataID: Cubism2DrawDataIdConstructor
  ParamID: Cubism2ParamIdConstructor
  PartsDataID: Cubism2PartsDataIdConstructor
}

/**
 * Creates legacy Cubism2 ID constructors with shared cache semantics.
 * @param options Runtime hook that preserves the legacy prototype-bootstrap guard.
 * @returns ID constructor set used by model parameters, parts, draw data, and base data.
 */
export function createCubism2IdTypes(
  options: CreateCubism2IdTypesOptions,
): Cubism2IdTypeConstructors {
  /**
   * Clears a legacy ID cache whether it is backed by the original `.clear()` helper or a plain object.
   * @param idCache Mutable constructor-level cache keyed by raw Cubism2 ID text.
   */
  function resetIdCache(idCache: Cubism2IdCache): void {
    if (typeof idCache.clear === 'function') {
      idCache.clear()
      return
    }

    for (const cacheKey of Object.keys(idCache)) {
      delete idCache[cacheKey]
    }
  }

  /**
   * Reads one cached legacy ID object or creates it through the requested constructor.
   * @param constructor ID constructor that owns the cache.
   * @param id Raw Cubism2 ID text read from API calls or MOC data.
   * @returns Stable ID object for the supplied text until the constructor cache is reset.
   */
  function readOrCreateCachedId(
    constructor: Cubism2IdConstructor,
    id: string | undefined,
  ): Cubism2IdInstance {
    const cacheKey = String(id)
    var cachedId = constructor.idCache[cacheKey]
    if (cachedId == null) {
      cachedId = new constructor(id)
      constructor.idCache[cacheKey] = cachedId
    }
    return cachedId
  }

  /**
   * Base legacy ID value shared by parameter, part, draw, and base-data IDs.
   * @param id Raw Cubism2 ID text attached to this object.
   */
  function Cubism2IdBase(this: Cubism2IdInstance, id?: string): void {
    if (options.isBootstrapping()) {
      return
    }
    this.id = id
  }

  const IdBase = Cubism2IdBase as unknown as Cubism2IdBaseConstructor

  /**
   * Converts a legacy ID object back to its raw text.
   * @returns Raw Cubism2 ID text carried by this object.
   */
  IdBase.prototype.toString = function (): string | undefined {
    return this.id
  }

  /**
   * Legacy parts-data ID value used for part opacity lookups.
   * @param id Raw Cubism2 parts-data ID text.
   */
  function PartsDataID(this: Cubism2IdInstance, id?: string): void {
    if (options.isBootstrapping()) {
      return
    }
    Cubism2IdBase.prototype.constructor.call(this, id)
  }

  const PartsDataIdConstructor = PartsDataID as unknown as Cubism2PartsDataIdConstructor
  PartsDataIdConstructor.prototype = new IdBase()
  PartsDataIdConstructor.idCache = new Object() as Cubism2IdCache

  /**
   * Clears cached parts-data ID objects.
   */
  PartsDataIdConstructor.resetPartsDataIdCache = function (): void {
    resetIdCache(PartsDataIdConstructor.idCache)
  }

  /**
   * Reads or creates a parts-data ID object.
   * @param id Raw Cubism2 parts-data ID text.
   * @returns Cached parts-data ID object.
   */
  PartsDataIdConstructor.getID = function (id: string | undefined): Cubism2IdInstance {
    return readOrCreateCachedId(PartsDataIdConstructor, id)
  }

  /**
   * Creates an empty parts-data ID instance for legacy deserialization paths.
   * @returns Empty parts-data ID object.
   */
  PartsDataIdConstructor.prototype.createEmptyInstance = function (): Cubism2IdInstance {
    return new PartsDataIdConstructor()
  }

  /**
   * Legacy parameter ID value used for model parameter lookups.
   * @param id Raw Cubism2 parameter ID text.
   */
  function ParamID(this: Cubism2IdInstance, id?: string): void {
    if (options.isBootstrapping()) {
      return
    }
    Cubism2IdBase.prototype.constructor.call(this, id)
  }

  const ParamIdConstructor = ParamID as unknown as Cubism2ParamIdConstructor
  ParamIdConstructor.prototype = new IdBase()
  ParamIdConstructor.idCache = new Object() as Cubism2IdCache

  /**
   * Clears cached parameter ID objects.
   */
  ParamIdConstructor.resetParamIdCache = function (): void {
    resetIdCache(ParamIdConstructor.idCache)
  }

  /**
   * Reads or creates a parameter ID object.
   * @param id Raw Cubism2 parameter ID text.
   * @returns Cached parameter ID object.
   */
  ParamIdConstructor.getID = function (id: string | undefined): Cubism2IdInstance {
    return readOrCreateCachedId(ParamIdConstructor, id)
  }

  /**
   * Creates an empty parameter ID instance for legacy deserialization paths.
   * @returns Empty parameter ID object.
   */
  ParamIdConstructor.prototype.createEmptyInstance = function (): Cubism2IdInstance {
    return new ParamIdConstructor()
  }

  /**
   * Legacy draw-data ID value used for drawable mesh lookups.
   * @param id Raw Cubism2 draw-data ID text.
   */
  function DrawDataID(this: Cubism2IdInstance, id?: string): void {
    if (options.isBootstrapping()) {
      return
    }
    Cubism2IdBase.prototype.constructor.call(this, id)
  }

  const DrawDataIdConstructor = DrawDataID as unknown as Cubism2DrawDataIdConstructor
  DrawDataIdConstructor.prototype = new IdBase()
  DrawDataIdConstructor.idCache = new Object() as Cubism2IdCache

  /**
   * Clears cached draw-data ID objects.
   */
  DrawDataIdConstructor.resetDrawDataIdCache = function (): void {
    resetIdCache(DrawDataIdConstructor.idCache)
  }

  /**
   * Reads or creates a draw-data ID object.
   * @param id Raw Cubism2 draw-data ID text.
   * @returns Cached draw-data ID object.
   */
  DrawDataIdConstructor.getID = function (id: string | undefined): Cubism2IdInstance {
    return readOrCreateCachedId(DrawDataIdConstructor, id)
  }

  /**
   * Creates an empty draw-data ID instance for legacy deserialization paths.
   * @returns Empty draw-data ID object.
   */
  DrawDataIdConstructor.prototype.createEmptyInstance = function (): Cubism2IdInstance {
    return new DrawDataIdConstructor()
  }

  /**
   * Legacy base-data ID value used for base/deformer target lookups.
   * @param id Raw Cubism2 base-data ID text.
   */
  function BaseDataID(this: Cubism2IdInstance, id?: string): void {
    if (options.isBootstrapping()) {
      return
    }
    Cubism2IdBase.prototype.constructor.call(this, id)
  }

  const BaseDataIdConstructor = BaseDataID as unknown as Cubism2BaseDataIdConstructor
  BaseDataIdConstructor.prototype = new IdBase()
  BaseDataIdConstructor.defaultBaseDataId = null
  BaseDataIdConstructor.idCache = new Object() as Cubism2IdCache

  /**
   * Reads the special Cubism2 `DST_BASE` base-data ID object.
   * @returns Cached `DST_BASE` base-data ID object.
   */
  BaseDataIdConstructor.getDefaultBaseDataID = function (): Cubism2IdInstance {
    if (BaseDataIdConstructor.defaultBaseDataId == null) {
      BaseDataIdConstructor.defaultBaseDataId = BaseDataIdConstructor.getID('DST_BASE')
    }
    return BaseDataIdConstructor.defaultBaseDataId
  }

  /**
   * Clears cached base-data ID objects and the `DST_BASE` singleton.
   */
  BaseDataIdConstructor.resetCache = function (): void {
    resetIdCache(BaseDataIdConstructor.idCache)
    BaseDataIdConstructor.defaultBaseDataId = null
  }

  /**
   * Reads or creates a base-data ID object.
   * @param id Raw Cubism2 base-data ID text.
   * @returns Cached base-data ID object.
   */
  BaseDataIdConstructor.getID = function (id: string | undefined): Cubism2IdInstance {
    return readOrCreateCachedId(BaseDataIdConstructor, id)
  }

  /**
   * Creates an empty base-data ID instance for legacy deserialization paths.
   * @returns Empty base-data ID object.
   */
  BaseDataIdConstructor.prototype.createEmptyID = function (): Cubism2IdInstance {
    return new BaseDataIdConstructor()
  }

  /**
   * Clears every legacy ID cache so subsequent MOC/API lookups receive new object identities.
   */
  IdBase.resetAllIdCaches = function resetAllIdCaches(): void {
    ParamIdConstructor.resetParamIdCache()
    BaseDataIdConstructor.resetCache()
    DrawDataIdConstructor.resetDrawDataIdCache()
    PartsDataIdConstructor.resetPartsDataIdCache()
  }

  return {
    BaseDataID: BaseDataIdConstructor,
    Cubism2IdBase: IdBase,
    DrawDataID: DrawDataIdConstructor,
    ParamID: ParamIdConstructor,
    PartsDataID: PartsDataIdConstructor,
  }
}
