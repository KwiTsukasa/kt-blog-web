interface Cubism2PointLike {
  x: number | null
  y: number | null
}

interface Cubism2LegacyIntegerValueInstance {
  color: unknown | null
}

interface Cubism2PointValuePrototype extends Cubism2PointLike {
  copyFromPoint: (sourceValue: Cubism2PointLike) => void
}

interface Cubism2Tag22XYValuePrototype extends Cubism2PointLike {
  setXYSlots: (x: number, y: number) => void
}

type Cubism2LegacyIntegerValueConstructor = {
  new (): Cubism2LegacyIntegerValueInstance
  prototype: Cubism2LegacyIntegerValueInstance
}

type Cubism2PointValueConstructor = {
  new (): Cubism2PointValuePrototype
  prototype: Cubism2PointValuePrototype
}

type Cubism2Tag22XYValueConstructor = {
  new (): Cubism2Tag22XYValuePrototype
  prototype: Cubism2Tag22XYValuePrototype
}

export interface CreateCubism2BasicValueTypesOptions {
  isBootstrapping: () => boolean
}

export interface Cubism2BasicValueTypeConstructors {
  Cubism2LegacyIntegerValue: Cubism2LegacyIntegerValueConstructor
  Cubism2PointValue: Cubism2PointValueConstructor
  Cubism2Tag22XYValue: Cubism2Tag22XYValueConstructor
}

/**
 * Creates the low-coupling primitive value constructors used by the MOC binary reader.
 * @param options Runtime hook that preserves the legacy prototype-bootstrap guard.
 * @returns Primitive value constructors bound to the supplied bootstrapping guard.
 */
export function createCubism2BasicValueTypes(
  options: CreateCubism2BasicValueTypesOptions,
): Cubism2BasicValueTypeConstructors {
  /**
   * Legacy value body created for integer type-tag payloads.
   *
   * The original constructor ignores incoming reader arguments and only initializes `color`.
   * Keep that behavior until the upstream type-tag semantics are fully proven from call sites.
   */
  function Cubism2LegacyIntegerValue(this: Cubism2LegacyIntegerValueInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.color = null
  }

  const LegacyIntegerValue =
    Cubism2LegacyIntegerValue as unknown as Cubism2LegacyIntegerValueConstructor

  /**
   * Point-like value body used by point type-tag payloads and copy/set operations.
   */
  function Cubism2PointValue(this: Cubism2PointLike): void {
    if (options.isBootstrapping()) {
      return
    }
    this.x = null
    this.y = null
  }

  const PointValue = Cubism2PointValue as unknown as Cubism2PointValueConstructor

  /**
   * Copies X/Y coordinates from another point-like value.
   * @param sourceValue Point-like object containing `x` and `y`.
   * @returns Nothing; mutates this point in place.
   */
  PointValue.prototype.copyFromPoint = function (sourceValue: Cubism2PointLike): void {
    this.x = sourceValue.x
    this.y = sourceValue.y
  }

  /**
   * Stores the otherwise domain-unknown X/Y payload produced by MOC type tag 22.
   */
  function Cubism2Tag22XYValue(this: Cubism2PointLike): void {
    if (options.isBootstrapping()) {
      return
    }
    this.x = null
    this.y = null
  }

  const Tag22XYValue = Cubism2Tag22XYValue as unknown as Cubism2Tag22XYValueConstructor

  /**
   * Sets the source-proven X/Y slots from two numeric arguments.
   * @param x First X/Y payload slot.
   * @param y Second X/Y payload slot.
   * @returns Nothing; mutates this tag-22 value in place.
   */
  Tag22XYValue.prototype.setXYSlots = function (x: number, y: number): void {
    this.x = x
    this.y = y
  }

  return {
    Cubism2LegacyIntegerValue: LegacyIntegerValue,
    Cubism2PointValue: PointValue,
    Cubism2Tag22XYValue: Tag22XYValue,
  }
}
