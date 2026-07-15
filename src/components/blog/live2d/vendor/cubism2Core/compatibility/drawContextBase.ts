export interface Cubism2DrawContextBaseInstance {
  sourceDrawData: unknown | null
  partsIndex: unknown | null
  drawOrder: unknown | null
  interpolatedOpacity: unknown | null
  clippedFlagRef: boolean[]
  partsOpacity: unknown | null
  isActive: boolean
  baseOpacity: number
  clipBufPre_clipContext: unknown | null
  getSourceDrawData: () => unknown | null
  isClipped: () => boolean
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
    this.sourceDrawData = sourceDrawData ?? null
    this.partsIndex = null
    this.drawOrder = null
    this.interpolatedOpacity = null
    this.clippedFlagRef = [false]
    this.partsOpacity = null
    this.isActive = true
    this.baseOpacity = 1
    this.clipBufPre_clipContext = null
  }

  const DrawContextBase = Cubism2DrawContextBase as unknown as Cubism2DrawContextBaseConstructor

  /**
   * Reads whether Cubism2 interpolation marked this draw context as clipped/skipped.
   * @param drawContext Draw context instance carrying the semantic clipping flag reference.
   * @returns True when the context should be treated as clipped or unavailable.
   */
  function isDrawContextClipped(drawContext: Cubism2DrawContextBaseInstance): boolean {
    return drawContext.clippedFlagRef[0] === true
  }

  /**
   * Reads whether the draw context can be rendered in the current frame.
   * @param drawContext Draw context instance carrying active and clipping flags.
   * @returns True when the context is active and not clipped.
   */
  function isDrawContextRenderable(drawContext: Cubism2DrawContextBaseInstance): boolean {
    return drawContext.isActive && !isDrawContextClipped(drawContext)
  }

  /**
   * Reads the source draw data object attached when this context was created.
   * @param drawContext Draw context instance carrying the semantic source-draw-data slot.
   * @returns Original source draw data object.
   */
  function getSourceDrawData(drawContext: Cubism2DrawContextBaseInstance): unknown | null {
    return drawContext.sourceDrawData
  }

  /**
   * Reads whether this draw context is clipped or unavailable.
   * @returns True when interpolation or visibility excluded this draw context.
   */
  DrawContextBase.prototype.isClipped = function (): boolean {
    return isDrawContextClipped(this)
  }

  /**
   * Reads whether this draw context can be rendered in the current frame.
   * @returns True when this draw context is active and not clipped.
   */
  DrawContextBase.prototype.isRenderable = function (): boolean {
    return isDrawContextRenderable(this)
  }

  /**
   * Reads the source draw data object that created this context.
   * @returns Original source draw data object.
   */
  DrawContextBase.prototype.getSourceDrawData = function (): unknown | null {
    return getSourceDrawData(this)
  }

  return DrawContextBase
}
