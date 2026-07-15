export interface Cubism2BaseContextInstance {
  sourceData: unknown
  partsIndex: unknown | null
  hasTransformFlag: boolean
  isActive: boolean
  totalScale: number
  interpolatedOpacity: number
  totalOpacity: number
  isRenderable: () => boolean
  setActive: (active: boolean) => void
  getSourceData: () => unknown
  setPartsIndex: (partsIndex: unknown) => void
  getPartsIndex: () => unknown | null
  hasTransform: () => boolean
  setTransformFlag: (transformFlag: boolean) => void
  getTotalScale: () => number
  setTotalScaleNotForClient: (totalScale: number) => void
  getInterpolatedOpacity: () => number
  setInterpolatedOpacity: (interpolatedOpacity: number) => void
  getTotalOpacity: (_unusedSourceData?: unknown) => number
  setTotalOpacity: (totalOpacity: number) => void
}

export type Cubism2BaseContextConstructor = {
  new (sourceData?: unknown): Cubism2BaseContextInstance
  prototype: Cubism2BaseContextInstance
}

export interface CreateCubism2BaseContextOptions {
  isBootstrapping: () => boolean
}

/**
 * Creates the shared base-data runtime context constructor used by transform and grid data.
 * @param options Runtime hook that preserves the legacy prototype-bootstrap guard.
 * @returns Base-context constructor bound to the supplied bootstrapping guard.
 */
export function createCubism2BaseContext(
  options: CreateCubism2BaseContextOptions,
): Cubism2BaseContextConstructor {
  /**
   * Stores common runtime state for Cubism2 base-data interpolation contexts.
   * @param sourceData MOC base data object that created this runtime context.
   */
  function Cubism2BaseContext(this: Cubism2BaseContextInstance, sourceData?: unknown): void {
    if (options.isBootstrapping()) {
      return
    }
    this.sourceData = null
    this.partsIndex = null
    this.hasTransformFlag = false
    this.isActive = true
    this.sourceData = sourceData
    this.totalScale = 1
    this.interpolatedOpacity = 1
    this.totalOpacity = 1
  }

  const BaseContext = Cubism2BaseContext as unknown as Cubism2BaseContextConstructor

  /**
   * Reports whether this context should participate in base-data processing.
   * @returns True when the context is active and no transform pass marked it unavailable.
   */
  BaseContext.prototype.isRenderable = function (): boolean {
    return this.isActive && !this.hasTransformFlag
  }

  /**
   * Updates the active flag used by visibility and dependency checks.
   * @param active True when the context can participate in the next runtime pass.
   */
  BaseContext.prototype.setActive = function (active: boolean): void {
    this.isActive = active
  }

  /**
   * Reads the source base data object that created this context.
   * @returns MOC base data object associated with this context.
   */
  BaseContext.prototype.getSourceData = function (): unknown {
    return this.sourceData
  }

  /**
   * Stores the parts index that owns this base context.
   * @param partsIndex Runtime parts index assigned by ModelContext initialization.
   */
  BaseContext.prototype.setPartsIndex = function (partsIndex: unknown): void {
    this.partsIndex = partsIndex
  }

  /**
   * Reads the runtime parts index that owns this context.
   * @returns Parts index assigned by ModelContext initialization.
   */
  BaseContext.prototype.getPartsIndex = function (): unknown | null {
    return this.partsIndex
  }

  /**
   * Reads the transform flag set while interpolating transformed points.
   * @returns True when the current transform pass marked this context as transform-flagged.
   */
  BaseContext.prototype.hasTransform = function (): boolean {
    return this.hasTransformFlag
  }

  /**
   * Updates the transform flag produced by transformed-point interpolation.
   * @param transformFlag Boolean flag returned through the min.js interpolation scratch array.
   */
  BaseContext.prototype.setTransformFlag = function (transformFlag: boolean): void {
    this.hasTransformFlag = transformFlag
  }

  /**
   * Reads the inherited total scale used when dependent base data copies parent state.
   * @returns Total scale multiplier stored on this context.
   */
  BaseContext.prototype.getTotalScale = function (): number {
    return this.totalScale
  }

  /**
   * Updates the inherited total scale used internally by dependent base data.
   * @param totalScale Total scale multiplier copied from a parent base context.
   */
  BaseContext.prototype.setTotalScaleNotForClient = function (totalScale: number): void {
    this.totalScale = totalScale
  }

  /**
   * Reads the opacity value produced by the current data interpolation step.
   * @returns Interpolated opacity before parent total opacity is applied.
   */
  BaseContext.prototype.getInterpolatedOpacity = function (): number {
    return this.interpolatedOpacity
  }

  /**
   * Stores the opacity value produced by the current data interpolation step.
   * @param interpolatedOpacity Opacity before parent total opacity is applied.
   */
  BaseContext.prototype.setInterpolatedOpacity = function (interpolatedOpacity: number): void {
    this.interpolatedOpacity = interpolatedOpacity
  }

  /**
   * Reads the total opacity after parent opacity and interpolation have been combined.
   * @param _unusedSourceData Unused source formal retained so the function arity matches SDK2.
   * @returns Total opacity multiplier for this context.
   */
  BaseContext.prototype.getTotalOpacity = function (_unusedSourceData?: unknown): number {
    return this.totalOpacity
  }

  /**
   * Stores the total opacity after parent opacity and interpolation have been combined.
   * @param totalOpacity Total opacity multiplier used by child contexts and drawing.
   */
  BaseContext.prototype.setTotalOpacity = function (totalOpacity: number): void {
    this.totalOpacity = totalOpacity
  }

  return BaseContext
}
