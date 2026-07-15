export interface Cubism2DrawContextBaseInstance {
  sourceDrawData: unknown | null
  partsIndex: unknown | null
  drawOrder: unknown | null
  interpolatedOpacity: unknown | null
  clippedFlagRef: boolean[]
  partsOpacity: unknown | null
  isActive: boolean
  baseOpacity: number
  clippingContext: unknown | null
  getSourceDrawData: () => unknown | null
  isClipped: () => unknown
  isRenderable: () => boolean
}

export type Cubism2DrawContextBaseConstructor = {
  new (sourceDrawData?: unknown): Cubism2DrawContextBaseInstance
  prototype: Cubism2DrawContextBaseInstance
}

export interface CreateCubism2DrawContextBaseOptions {
  isBootstrapping: () => boolean
}

/**
 * Creates the base draw-context constructor shared by WebGL mesh draw contexts.
 * @param options Runtime hook that preserves the legacy prototype-bootstrap guard.
 * @returns Base draw-context constructor bound to the supplied bootstrapping guard.
 */
export function createCubism2DrawContextBase(
  options: CreateCubism2DrawContextBaseOptions,
): Cubism2DrawContextBaseConstructor {
  /**
   * Stores mutable per-draw state generated while evaluating one Cubism2 draw data entry.
   * @param sourceDrawData Draw data object that owns the generated context.
   */
  function Cubism2DrawContextBase(
    this: Cubism2DrawContextBaseInstance,
    sourceDrawData?: unknown,
  ): void {
    if (options.isBootstrapping()) {
      return
    }
    this.sourceDrawData = null
    this.partsIndex = null
    this.drawOrder = null
    this.interpolatedOpacity = null
    this.clippedFlagRef = [false]
    this.partsOpacity = null
    this.isActive = true
    this.baseOpacity = 1
    this.clippingContext = null
    this.sourceDrawData = sourceDrawData
  }

  const DrawContextBase = Cubism2DrawContextBase as unknown as Cubism2DrawContextBaseConstructor

  /**
   * Reads whether this draw context is clipped or unavailable.
   * @returns The raw interpolation flag stored by the legacy runtime.
   */
  DrawContextBase.prototype.isClipped = function (): unknown {
    return this.clippedFlagRef[0]
  }

  /**
   * Reads whether this draw context can be rendered in the current frame.
   * @returns True when this draw context is active and not clipped.
   */
  DrawContextBase.prototype.isRenderable = function (): boolean {
    return this.isActive && !this.clippedFlagRef[0]
  }

  /**
   * Reads the source draw data object that created this context.
   * @returns Original source draw data object.
   */
  DrawContextBase.prototype.getSourceDrawData = function (): unknown | null {
    return this.sourceDrawData
  }

  return DrawContextBase
}
