interface Cubism2MutableRectangle {
  x: number | null
  y: number | null
  width: number | null
  height: number | null
}

interface Cubism2RectanglePrototype extends Cubism2MutableRectangle {
  copyFromRectangle: (sourceRect: Cubism2MutableRectangle) => void
  getCenterX: () => number
  getCenterY: () => number
  getRight: () => number
  getBottom: () => number
  contains?: (x: number, y: number) => boolean
  expand?: (marginX: number, marginY: number) => void
}

type Cubism2RectangleConstructor = {
  new (): Cubism2RectanglePrototype
  prototype: Cubism2RectanglePrototype
}

export interface CreateCubism2GeometryOptions {
  isBootstrapping: () => boolean
}

export interface Cubism2GeometryConstructors {
  Cubism2Rectangle: Cubism2RectangleConstructor
  Cubism2FloatRectangle: Cubism2RectangleConstructor
}

/**
 * Creates the geometry constructors used by the min.js-derived Cubism2 runtime.
 * @param options Runtime hooks that preserve the legacy prototype-bootstrap guard.
 * @returns Rectangle constructors bound to the supplied bootstrapping guard.
 */
export function createCubism2Geometry(
  options: CreateCubism2GeometryOptions,
): Cubism2GeometryConstructors {
  /**
   * Stores integer-like Cubism2 rectangle bounds read from legacy binary data.
   */
  function Cubism2Rectangle(this: Cubism2MutableRectangle): void {
    if (options.isBootstrapping()) {
      return
    }
    this.x = null
    this.y = null
    this.width = null
    this.height = null
  }

  const Cubism2RectangleCtor = Cubism2Rectangle as unknown as Cubism2RectangleConstructor

  /**
   * @returns Horizontal center of this rectangle in model space.
   */
  Cubism2RectangleCtor.prototype.getCenterX = function (): number {
    return 0.5 * (this.x! + this.x! + this.width!)
  }

  /**
   * @returns Vertical center of this rectangle in model space.
   */
  Cubism2RectangleCtor.prototype.getCenterY = function (): number {
    return 0.5 * (this.y! + this.y! + this.height!)
  }

  /**
   * @returns Right edge computed from `x + width`.
   */
  Cubism2RectangleCtor.prototype.getRight = function (): number {
    return this.x! + this.width!
  }

  /**
   * @returns Bottom edge computed from `y + height`.
   */
  Cubism2RectangleCtor.prototype.getBottom = function (): number {
    return this.y! + this.height!
  }

  /**
   * Copies rectangle bounds from another rectangle-like object.
   * @param sourceRect Rectangle-like object containing `x`, `y`, `width`, and `height`.
   * @returns Nothing; mutates this rectangle in place.
   */
  Cubism2RectangleCtor.prototype.copyFromRectangle = function (
    sourceRect: Cubism2MutableRectangle,
  ): void {
    this.x = sourceRect.x
    this.y = sourceRect.y
    this.width = sourceRect.width
    this.height = sourceRect.height
  }

  /**
   * Stores floating-point clipping bounds used while arranging mask texture tiles.
   */
  function Cubism2FloatRectangle(this: Cubism2MutableRectangle): void {
    if (options.isBootstrapping()) {
      return
    }
    this.x = null
    this.y = null
    this.width = null
    this.height = null
  }

  const Cubism2FloatRectangleCtor = Cubism2FloatRectangle as unknown as Cubism2RectangleConstructor

  /**
   * @returns Horizontal center of this clipping rectangle.
   */
  Cubism2FloatRectangleCtor.prototype.getCenterX = function (): number {
    return this.x! + 0.5 * this.width!
  }

  /**
   * @returns Vertical center of this clipping rectangle.
   */
  Cubism2FloatRectangleCtor.prototype.getCenterY = function (): number {
    return this.y! + 0.5 * this.height!
  }

  /**
   * @returns Right edge computed from `x + width`.
   */
  Cubism2FloatRectangleCtor.prototype.getRight = function (): number {
    return this.x! + this.width!
  }

  /**
   * @returns Bottom edge computed from `y + height`.
   */
  Cubism2FloatRectangleCtor.prototype.getBottom = function (): number {
    return this.y! + this.height!
  }

  /**
   * Copies float rectangle bounds from another rectangle-like object.
   * @param sourceRect Rectangle-like object containing `x`, `y`, `width`, and `height`.
   * @returns Nothing; mutates this rectangle in place.
   */
  Cubism2FloatRectangleCtor.prototype.copyFromRectangle = function (
    sourceRect: Cubism2MutableRectangle,
  ): void {
    this.x = sourceRect.x
    this.y = sourceRect.y
    this.width = sourceRect.width
    this.height = sourceRect.height
  }

  /**
   * Preserves the legacy rectangle containment stub from min.js.
   * @param x Candidate X coordinate; ignored by the original implementation.
   * @param y Candidate Y coordinate; ignored by the original implementation.
   * @returns The original self-bound comparison result.
   */
  Cubism2FloatRectangleCtor.prototype.contains = function (x: number, y: number): boolean {
    return (
      this.x! <= this.x! &&
      this.y! <= this.y! &&
      this.x! <= this.x! + this.width! &&
      this.y! <= this.y! + this.height!
    )
  }

  /**
   * Expands the clipping rectangle equally on both sides for mask padding.
   * @param marginX Horizontal model-space padding.
   * @param marginY Vertical model-space padding.
   * @returns Nothing; mutates this rectangle in place.
   */
  Cubism2FloatRectangleCtor.prototype.expand = function (marginX: number, marginY: number): void {
    this.x = this.x! - marginX
    this.y = this.y! - marginY
    this.width = this.width! + marginX * 2
    this.height = this.height! + marginY * 2
  }

  return {
    Cubism2Rectangle: Cubism2RectangleCtor,
    Cubism2FloatRectangle: Cubism2FloatRectangleCtor,
  }
}
