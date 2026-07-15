interface Cubism2PointLike {
  x: number | null
  y: number | null
}

interface Cubism2IntegerValueInstance {
  color: unknown | null
}

interface Cubism2PointValuePrototype extends Cubism2PointLike {
  copyFromPoint: (sourceValue: Cubism2PointLike) => void
}

interface Cubism2XYValuePrototype extends Cubism2PointLike {
  setXYSlots: (x: number, y: number) => void
}

type Cubism2IntegerValueConstructor = {
  new (): Cubism2IntegerValueInstance
  prototype: Cubism2IntegerValueInstance
}

type Cubism2PointValueConstructor = {
  new (): Cubism2PointValuePrototype
  prototype: Cubism2PointValuePrototype
}

type Cubism2XYValueConstructor = {
  new (): Cubism2XYValuePrototype
  prototype: Cubism2XYValuePrototype
}

export interface CreateCubism2BasicValueTypesOptions {
  isBootstrapping: () => boolean
}

export interface Cubism2BasicValueTypeConstructors {
  Cubism2IntegerValue: Cubism2IntegerValueConstructor
  Cubism2PointValue: Cubism2PointValueConstructor
  Cubism2XYValue: Cubism2XYValueConstructor
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
  function Cubism2IntegerValue(this: Cubism2IntegerValueInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.color = null
  }

  const IntegerValue =
    Cubism2IntegerValue as unknown as Cubism2IntegerValueConstructor

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
  function Cubism2XYValue(this: Cubism2PointLike): void {
    if (options.isBootstrapping()) {
      return
    }
    this.x = null
    this.y = null
  }

  const XYValue = Cubism2XYValue as unknown as Cubism2XYValueConstructor

  /**
   * Sets the source-proven X/Y slots from two numeric arguments.
   * @param x First X/Y payload slot.
   * @param y Second X/Y payload slot.
   * @returns Nothing; mutates this tag-22 value in place.
   */
  XYValue.prototype.setXYSlots = function (x: number, y: number): void {
    this.x = x
    this.y = y
  }

  return {
    Cubism2IntegerValue: IntegerValue,
    Cubism2PointValue: PointValue,
    Cubism2XYValue: XYValue,
  }
}
