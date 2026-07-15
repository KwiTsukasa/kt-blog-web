import type { Cubism2LDTransformConstructor, Cubism2LDTransformInstance } from './ldTransform'

interface Cubism2LDGLLive2DOptions {
  DEBUG_DATA: Record<string, number | undefined>
  IGNORE_CLIP?: boolean
  IGNORE_EXPAND?: boolean
  USE_ADJUST_TRANSLATION?: boolean
  USE_CACHED_POLYGON_IMAGE?: boolean
}

interface Cubism2LDGLDebugLogger {
  logException: (error: unknown) => void
  logWithLegacyPrefix: (message: unknown) => void
}

interface Cubism2CanvasLike {
  height: number
  width: number
  getContext?: (contextId: '2d') => Cubism2CanvasRenderingContext | null
  setAttribute?: (name: string, value: number | string) => void
}

interface Cubism2CanvasRenderingContext {
  globalAlpha?: number
  beginPath: () => void
  clip: () => void
  drawImage?: (...args: unknown[]) => void
  lineTo: (x: number, y: number) => void
  moveTo: (x: number, y: number) => void
  restore?: () => void
  rect?: (x: number, y: number, width: number, height: number) => void
  save?: () => void
  transform?: (
    scaleX: number,
    skewY: number,
    skewX: number,
    scaleY: number,
    translateX: number,
    translateY: number,
  ) => void
  translate?: (x: number, y: number) => void
}

interface Cubism2LDGLDrawContext {
  sourceDrawData: {
    gl_cacheImage?: Record<number, Cubism2CachedPolygonCanvas>
  }
}

interface Cubism2CachedPolygonCanvas {
  cacheCanvas: Cubism2CanvasLike
  cacheContext: Cubism2CanvasRenderingContext
}

export interface CreateCubism2LDGLOptions {
  LDTransform: Cubism2LDTransformConstructor
  Live2D: Cubism2LDGLLive2DOptions
  UtDebug: Cubism2LDGLDebugLogger
  solveAffineTransform: (
    sourceX: number,
    sourceY: number,
    originX: number,
    originY: number,
    basisXX: number,
    basisXY: number,
    basisYX: number,
    basisYY: number,
    output: number[],
  ) => void
}

export interface Cubism2LDGLInstance {
  cacheImages: Record<string, unknown>
  canvas: Cubism2CanvasLike
  context: Cubism2CanvasRenderingContext
  drawElements: (
    textureCanvas: Cubism2CanvasLike,
    triangleIndices: ArrayLike<number>,
    vertexArray: ArrayLike<number>,
    uvArray: ArrayLike<number>,
    opacity: number,
    expansionMargin: number | null | undefined,
    drawTransform: Cubism2LDTransformInstance | null,
    drawContext: Cubism2LDGLDrawContext,
  ) => void
  currentOpacity: number
  offsetX: number
  offsetY: number
  restoreViewportClip: () => void
  saveViewportClip: () => void
  scaleX: number
  scaleY: number
  setViewport: (x: number, y: number, width: number, height: number) => void
  viewport: number[]
}

export type Cubism2LDGLConstructor = {
  new (canvas: Cubism2CanvasLike, context: Cubism2CanvasRenderingContext): Cubism2LDGLInstance
  clip: (
    canvasContext: Cubism2CanvasRenderingContext,
    sourceTransform: Cubism2LDTransformInstance,
    expansionMargin: number,
    firstEdgeLength: number,
    sourceX0: number,
    sourceY0: number,
    sourceX1: number,
    sourceY1: number,
    sourceX2: number,
    sourceY2: number,
    targetX0: number,
    targetY0: number,
    targetX1: number,
    targetY1: number,
    targetX2: number,
    targetY2: number,
  ) => void
  clipWithTransform: (
    canvasContext: Cubism2CanvasRenderingContext,
    transform: Cubism2LDTransformInstance | null,
    ...coordinates: number[]
  ) => void
  createCanvas: (width: number, height: number) => Cubism2CanvasLike
  dumpValues: (...values: number[]) => void
  expandClip: (
    canvasContext: Cubism2CanvasRenderingContext,
    sourceTransform: Cubism2LDTransformInstance,
    expansionMargin: number,
    firstEdgeLength: number,
    targetX0: number,
    targetY0: number,
    targetX1: number,
    targetY1: number,
    targetX2: number,
    targetY2: number,
  ) => boolean
  prototype: Cubism2LDGLInstance
  inverseTransformScratch: Cubism2LDTransformInstance
  pointScratch: number[]
  sourceBasisScratch: number[]
  targetBasisScratch: number[]
  triangleTransformScratch: Cubism2LDTransformInstance
}

/**
 * Creates the legacy LDGL Canvas renderer helper with readable clipping and triangle mapping logic.
 * @param options Dependencies supplied by the min.js-derived compatibility capsule.
 * @returns Legacy LDGL constructor and static helper namespace.
 */
export function createCubism2LDGL(options: CreateCubism2LDGLOptions): Cubism2LDGLConstructor {
  const { LDTransform, Live2D, UtDebug, solveAffineTransform } = options

  /**
   * Stores per-canvas LDGL render state for the old Canvas2D renderer path.
   * @param canvas Canvas-like texture target used for dimensions and offscreen cache creation.
   * @param context Canvas2D-like rendering context used by the legacy renderer.
   */
  function LDGL(
    this: Cubism2LDGLInstance,
    canvas: Cubism2CanvasLike,
    context: Cubism2CanvasRenderingContext,
  ): void {
    this.canvas = canvas
    this.context = context
    this.viewport = [0, 0, canvas.width, canvas.height]
    this.scaleX = 1
    this.offsetX = 0
    this.scaleY = 1
    this.offsetY = 0
    this.currentOpacity = -1
    this.cacheImages = {}
  }

  const Renderer = LDGL as unknown as Cubism2LDGLConstructor

  Renderer.triangleTransformScratch = new LDTransform()
  Renderer.inverseTransformScratch = new LDTransform()
  Renderer.sourceBasisScratch = [0, 0]
  Renderer.targetBasisScratch = [0, 0]
  Renderer.pointScratch = [0, 0]

  /**
   * Updates the current viewport rectangle used by the legacy context clipping step.
   * @param x Viewport X origin.
   * @param y Viewport Y origin.
   * @param width Viewport width.
   * @param height Viewport height.
   */
  Renderer.prototype.setViewport = function (
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    this.viewport = [x, y, width, height]
  }

  /**
   * Saves the context and clips it to the current LDGL viewport.
   */
  Renderer.prototype.saveViewportClip = function (): void {
    this.context.save?.()
    const viewportBounds = this.viewport
    if (viewportBounds != null) {
      this.context.beginPath()
      this.context.rect?.(
        viewportBounds[0]!,
        viewportBounds[1]!,
        viewportBounds[2]!,
        viewportBounds[3]!,
      )
      this.context.clip()
    }
  }

  /**
   * Restores the Canvas2D context after LDGL clipped drawing.
   */
  Renderer.prototype.restoreViewportClip = function (): void {
    this.context.restore?.()
  }

  /**
   * Draws one mesh by mapping each texture triangle onto its destination triangle.
   * @param textureCanvas Source texture image/canvas.
   * @param triangleIndices Triangle index buffer consumed in groups of three.
   * @param vertexArray Destination model-space vertex array laid out as x/y pairs.
   * @param uvArray Source UV array laid out as u/v pairs.
   * @param opacity Global alpha value applied before drawing.
   * @param expansionMargin Clip expansion amount; legacy callers pass null to use default.
   * @param drawTransform Optional LDTransform applied to destination vertices before drawing.
   * @param drawContext Source draw context used to cache per-triangle canvases.
   */
  function drawTriangleElements(
    renderer: Cubism2LDGLInstance,
    textureCanvas: Cubism2CanvasLike,
    triangleIndices: ArrayLike<number>,
    vertexArray: ArrayLike<number>,
    uvArray: ArrayLike<number>,
    opacity: number,
    expansionMargin: number | null | undefined,
    drawTransform: Cubism2LDTransformInstance | null,
    drawContext: Cubism2LDGLDrawContext,
  ): void {
    try {
      if (opacity !== renderer.currentOpacity) {
        renderer.currentOpacity = opacity
        renderer.context.globalAlpha = opacity
      }
      const indexCount = triangleIndices.length
      const textureWidth = textureCanvas.width
      const textureHeight = textureCanvas.height
      const canvasContext = renderer.context
      const offsetX = renderer.offsetX
      const offsetY = renderer.offsetY
      const scaleX = renderer.scaleX
      const scaleY = renderer.scaleY
      const triangleTransform = Renderer.triangleTransformScratch
      const sourceBasisScratch = Renderer.sourceBasisScratch
      const targetBasisScratch = Renderer.targetBasisScratch
      const pointScratch = Renderer.pointScratch

      for (let triangleCursor = 0; triangleCursor < indexCount; triangleCursor += 3) {
        canvasContext.save?.()

        const vertexIndex0 = triangleIndices[triangleCursor]!
        const vertexIndex1 = triangleIndices[triangleCursor + 1]!
        const vertexIndex2 = triangleIndices[triangleCursor + 2]!

        let targetX0 = offsetX + scaleX * vertexArray[vertexIndex0 * 2]!
        let targetY0 = offsetY + scaleY * vertexArray[vertexIndex0 * 2 + 1]!
        let targetX1 = offsetX + scaleX * vertexArray[vertexIndex1 * 2]!
        let targetY1 = offsetY + scaleY * vertexArray[vertexIndex1 * 2 + 1]!
        let targetX2 = offsetX + scaleX * vertexArray[vertexIndex2 * 2]!
        let targetY2 = offsetY + scaleY * vertexArray[vertexIndex2 * 2 + 1]!

        if (drawTransform) {
          drawTransform.transformPointForLDGL(targetX0, targetY0, pointScratch)
          targetX0 = pointScratch[0]!
          targetY0 = pointScratch[1]!
          drawTransform.transformPointForLDGL(targetX1, targetY1, pointScratch)
          targetX1 = pointScratch[0]!
          targetY1 = pointScratch[1]!
          drawTransform.transformPointForLDGL(targetX2, targetY2, pointScratch)
          targetX2 = pointScratch[0]!
          targetY2 = pointScratch[1]!
        }

        const sourceX0 = textureWidth * uvArray[vertexIndex0 * 2]!
        const sourceY0 = textureHeight - textureHeight * uvArray[vertexIndex0 * 2 + 1]!
        const sourceX1 = textureWidth * uvArray[vertexIndex1 * 2]!
        const sourceY1 = textureHeight - textureHeight * uvArray[vertexIndex1 * 2 + 1]!
        const sourceX2 = textureWidth * uvArray[vertexIndex2 * 2]!
        const sourceY2 = textureHeight - textureHeight * uvArray[vertexIndex2 * 2 + 1]!
        const sourceAngle = Math.atan2(sourceY1 - sourceY0, sourceX1 - sourceX0)
        const targetAngle = Math.atan2(targetY1 - targetY0, targetX1 - targetX0)
        const targetEdgeX = targetX1 - targetX0
        const targetEdgeY = targetY1 - targetY0
        const targetEdgeLength = Math.sqrt(targetEdgeX * targetEdgeX + targetEdgeY * targetEdgeY)
        const sourceEdgeX = sourceX1 - sourceX0
        const sourceEdgeY = sourceY1 - sourceY0
        const sourceEdgeLength = Math.sqrt(sourceEdgeX * sourceEdgeX + sourceEdgeY * sourceEdgeY)
        const triangleScale = targetEdgeLength / sourceEdgeLength

        solveAffineTransform(
          sourceX2,
          sourceY2,
          sourceX0,
          sourceY0,
          sourceX1 - sourceX0,
          sourceY1 - sourceY0,
          -(sourceY1 - sourceY0),
          sourceX1 - sourceX0,
          sourceBasisScratch,
        )
        solveAffineTransform(
          targetX2,
          targetY2,
          targetX0,
          targetY0,
          targetX1 - targetX0,
          targetY1 - targetY0,
          -(targetY1 - targetY0),
          targetX1 - targetX0,
          targetBasisScratch,
        )

        const shearX = (targetBasisScratch[0]! - sourceBasisScratch[0]!) / sourceBasisScratch[1]!
        let sourceLeft = Math.min(sourceX0, sourceX1, sourceX2)
        let sourceRight = Math.max(sourceX0, sourceX1, sourceX2)
        let sourceTop = Math.min(sourceY0, sourceY1, sourceY2)
        let sourceBottom = Math.max(sourceY0, sourceY1, sourceY2)
        const sourceLeftFloor = Math.floor(sourceLeft)
        const sourceTopFloor = Math.floor(sourceTop)
        const sourceRightCeil = Math.ceil(sourceRight)
        const sourceBottomCeil = Math.ceil(sourceBottom)

        triangleTransform.identity()
        triangleTransform.translate(targetX0, targetY0)
        triangleTransform.rotate(targetAngle)
        triangleTransform.scale(1, targetBasisScratch[1]! / sourceBasisScratch[1]!)
        triangleTransform.shear(shearX, 0)
        triangleTransform.scale(triangleScale, triangleScale)
        triangleTransform.rotate(-sourceAngle)
        triangleTransform.translate(-sourceX0, -sourceY0)
        triangleTransform.setContext(
          canvasContext as Parameters<Cubism2LDTransformInstance['setContext']>[0],
        )

        const useDefaultExpansionMargin = true
        const defaultExpansionMargin = 1.2
        let clipExpansion = expansionMargin
        if (!clipExpansion) {
          clipExpansion = useDefaultExpansionMargin ? defaultExpansionMargin : 0
        }
        if (Live2D.IGNORE_EXPAND) {
          clipExpansion = 0
        }

        if (Live2D.USE_CACHED_POLYGON_IMAGE) {
          const sourceDrawData = drawContext.sourceDrawData
          sourceDrawData.gl_cacheImage = sourceDrawData.gl_cacheImage || {}
          if (!sourceDrawData.gl_cacheImage[triangleCursor]) {
            const cacheCanvas = Renderer.createCanvas(
              sourceRightCeil - sourceLeftFloor,
              sourceBottomCeil - sourceTopFloor,
            )
            Live2D.DEBUG_DATA.LDGL_CANVAS_MB = Live2D.DEBUG_DATA.LDGL_CANVAS_MB || 0
            Live2D.DEBUG_DATA.LDGL_CANVAS_MB +=
              (sourceRightCeil - sourceLeftFloor) * (sourceBottomCeil - sourceTopFloor) * 4
            const cacheContext = cacheCanvas.getContext?.('2d')
            if (!cacheContext) {
              canvasContext.restore?.()
              continue
            }
            cacheContext.translate?.(-sourceLeftFloor, -sourceTopFloor)
            Renderer.clip(
              cacheContext,
              triangleTransform,
              clipExpansion,
              targetEdgeLength,
              sourceX0,
              sourceY0,
              sourceX1,
              sourceY1,
              sourceX2,
              sourceY2,
              targetX0,
              targetY0,
              targetX1,
              targetY1,
              targetX2,
              targetY2,
            )
            cacheContext.drawImage?.(textureCanvas, 0, 0)
            sourceDrawData.gl_cacheImage[triangleCursor] = {
              cacheCanvas,
              cacheContext,
            }
          }
          canvasContext.drawImage?.(
            sourceDrawData.gl_cacheImage[triangleCursor]!.cacheCanvas,
            sourceLeftFloor,
            sourceTopFloor,
          )
        } else {
          if (!Live2D.IGNORE_CLIP) {
            Renderer.clip(
              canvasContext,
              triangleTransform,
              clipExpansion,
              targetEdgeLength,
              sourceX0,
              sourceY0,
              sourceX1,
              sourceY1,
              sourceX2,
              sourceY2,
              targetX0,
              targetY0,
              targetX1,
              targetY1,
              targetX2,
              targetY2,
            )
          }
          if (Live2D.USE_ADJUST_TRANSLATION) {
            sourceLeft = 0
            sourceRight = textureWidth
            sourceTop = 0
            sourceBottom = textureHeight
          }
          canvasContext.drawImage?.(
            textureCanvas,
            sourceLeft,
            sourceTop,
            sourceRight - sourceLeft,
            sourceBottom - sourceTop,
            sourceLeft,
            sourceTop,
            sourceRight - sourceLeft,
            sourceBottom - sourceTop,
          )
        }
        canvasContext.restore?.()
      }
    } catch (error) {
      UtDebug.logException(error)
    }
  }

  /**
   * Legacy `drawElements` entry retained for Canvas2D renderer callers.
   * @param textureCanvas Source texture image/canvas.
   * @param triangleIndices Triangle index buffer consumed in groups of three.
   * @param vertexArray Destination model-space vertex array laid out as x/y pairs.
   * @param uvArray Source UV array laid out as u/v pairs.
   * @param opacity Global alpha value applied before drawing.
   * @param expansionMargin Clip expansion amount; legacy callers pass null to use default.
   * @param drawTransform Optional LDTransform applied to destination vertices before drawing.
   * @param drawContext Source draw context used to cache per-triangle canvases.
   */
  Renderer.prototype.drawElements = function (
    textureCanvas: Cubism2CanvasLike,
    triangleIndices: ArrayLike<number>,
    vertexArray: ArrayLike<number>,
    uvArray: ArrayLike<number>,
    opacity: number,
    expansionMargin: number | null | undefined,
    drawTransform: Cubism2LDTransformInstance | null,
    drawContext: Cubism2LDGLDrawContext,
  ): void {
    drawTriangleElements(
      this,
      textureCanvas,
      triangleIndices,
      vertexArray,
      uvArray,
      opacity,
      expansionMargin,
      drawTransform,
      drawContext,
    )
  }

  /**
   * Clips one triangle, optionally expanding it outward to hide sampling cracks.
   * @param canvasContext Canvas context receiving the clip path.
   * @param sourceTransform Transform from source triangle coordinates to target coordinates.
   * @param expansionMargin Pixel expansion amount; small values skip expansion.
   * @param firstEdgeLength Length of the first target edge used for expansion normalization.
   * @param sourceX0 First source triangle X coordinate.
   * @param sourceY0 First source triangle Y coordinate.
   * @param sourceX1 Second source triangle X coordinate.
   * @param sourceY1 Second source triangle Y coordinate.
   * @param sourceX2 Third source triangle X coordinate.
   * @param sourceY2 Third source triangle Y coordinate.
   * @param targetX0 First target triangle X coordinate.
   * @param targetY0 First target triangle Y coordinate.
   * @param targetX1 Second target triangle X coordinate.
   * @param targetY1 Second target triangle Y coordinate.
   * @param targetX2 Third target triangle X coordinate.
   * @param targetY2 Third target triangle Y coordinate.
   */
  Renderer.clip = function (
    canvasContext,
    sourceTransform,
    expansionMargin,
    firstEdgeLength,
    sourceX0,
    sourceY0,
    sourceX1,
    sourceY1,
    sourceX2,
    sourceY2,
    targetX0,
    targetY0,
    targetX1,
    targetY1,
    targetX2,
    targetY2,
  ): void {
    if (expansionMargin > 0.02) {
      Renderer.expandClip(
        canvasContext,
        sourceTransform,
        expansionMargin,
        firstEdgeLength,
        targetX0,
        targetY0,
        targetX1,
        targetY1,
        targetX2,
        targetY2,
      )
    } else {
      Renderer.clipWithTransform(
        canvasContext,
        null,
        sourceX0,
        sourceY0,
        sourceX1,
        sourceY1,
        sourceX2,
        sourceY2,
      )
    }
  }

  /**
   * Expands a target triangle and clips the transformed polygon.
   * @param canvasContext Canvas context receiving the expanded clip path.
   * @param sourceTransform Transform inverted to move expanded target coordinates into source space.
   * @param expansionMargin Expansion distance in pixels.
   * @param firstEdgeLength Length of the first target edge.
   * @param targetX0 First target triangle X coordinate.
   * @param targetY0 First target triangle Y coordinate.
   * @param targetX1 Second target triangle X coordinate.
   * @param targetY1 Second target triangle Y coordinate.
   * @param targetX2 Third target triangle X coordinate.
   * @param targetY2 Third target triangle Y coordinate.
   * @returns True when the inverse transform exists and clipping was applied.
   */
  function expandClipPolygon(
    canvasContext: Cubism2CanvasRenderingContext,
    sourceTransform: Cubism2LDTransformInstance,
    expansionMargin: number,
    firstEdgeLength: number,
    targetX0: number,
    targetY0: number,
    targetX1: number,
    targetY1: number,
    targetX2: number,
    targetY2: number,
  ): boolean {
    const edge10X = targetX1 - targetX0
    const edge10Y = targetY1 - targetY0
    const edge20X = targetX2 - targetX0
    const edge20Y = targetY2 - targetY0
    const signedExpansion =
      edge10X * edge20Y - edge10Y * edge20X > 0 ? expansionMargin : -expansionMargin
    const normal10X = -edge10Y
    const normal10Y = edge10X
    const edge21X = targetX2 - targetX1
    const edge21Y = targetY2 - targetY1
    const normal21X = -edge21Y
    const normal21Y = edge21X
    const edge21Length = Math.sqrt(edge21X * edge21X + edge21Y * edge21Y)
    const normal20X = -edge20Y
    const normal20Y = edge20X
    const edge20Length = Math.sqrt(edge20X * edge20X + edge20Y * edge20Y)

    const expandedX0a = targetX0 - (signedExpansion * normal10X) / firstEdgeLength
    const expandedY0a = targetY0 - (signedExpansion * normal10Y) / firstEdgeLength
    const expandedX1a = targetX1 - (signedExpansion * normal10X) / firstEdgeLength
    const expandedY1a = targetY1 - (signedExpansion * normal10Y) / firstEdgeLength
    const expandedX1b = targetX1 - (signedExpansion * normal21X) / edge21Length
    const expandedY1b = targetY1 - (signedExpansion * normal21Y) / edge21Length
    const expandedX2a = targetX2 - (signedExpansion * normal21X) / edge21Length
    const expandedY2a = targetY2 - (signedExpansion * normal21Y) / edge21Length
    const expandedX2b = targetX2 + (signedExpansion * normal20X) / edge20Length
    const expandedY2b = targetY2 + (signedExpansion * normal20Y) / edge20Length
    const expandedX0b = targetX0 + (signedExpansion * normal20X) / edge20Length
    const expandedY0b = targetY0 + (signedExpansion * normal20Y) / edge20Length
    const inverseTransform = Renderer.inverseTransformScratch
    const inverted = sourceTransform.invertInto(inverseTransform)
    if (inverted == null) {
      return false
    }

    Renderer.clipWithTransform(
      canvasContext,
      inverseTransform,
      expandedX0a,
      expandedY0a,
      expandedX1a,
      expandedY1a,
      expandedX1b,
      expandedY1b,
      expandedX2a,
      expandedY2a,
      expandedX2b,
      expandedY2b,
      expandedX0b,
      expandedY0b,
    )
    return true
  }

  Renderer.expandClip = expandClipPolygon

  /**
   * Creates a clipping path from coordinate pairs and optionally transforms each point first.
   * @param canvasContext Canvas context receiving the path.
   * @param transform Optional LDTransform applied to every coordinate pair.
   * @param coordinates Coordinate pairs laid out as x/y numbers.
   */
  Renderer.clipWithTransform = function (
    canvasContext: Cubism2CanvasRenderingContext,
    transform: Cubism2LDTransformInstance | null,
    ...coordinates: number[]
  ): void {
    if (coordinates.length < 3 * 2) {
      UtDebug.logWithLegacyPrefix('err : @LDGL.clip()')
      return
    }
    if (transform != null && !(transform instanceof LDTransform)) {
      UtDebug.logWithLegacyPrefix('LDGL.clip received a zero horizontal transform scale')
      return
    }

    const transformedPoint = Renderer.pointScratch
    canvasContext.beginPath()
    if (transform) {
      transform.transformPointForLDGL(coordinates[0]!, coordinates[1]!, transformedPoint)
      canvasContext.moveTo(transformedPoint[0]!, transformedPoint[1]!)
      for (let coordinateIndex = 2; coordinateIndex < coordinates.length; coordinateIndex += 2) {
        transform.transformPointForLDGL(
          coordinates[coordinateIndex]!,
          coordinates[coordinateIndex + 1]!,
          transformedPoint,
        )
        canvasContext.lineTo(transformedPoint[0]!, transformedPoint[1]!)
      }
    } else {
      canvasContext.moveTo(coordinates[0]!, coordinates[1]!)
      for (let coordinateIndex = 2; coordinateIndex < coordinates.length; coordinateIndex += 2) {
        canvasContext.lineTo(coordinates[coordinateIndex]!, coordinates[coordinateIndex + 1]!)
      }
    }
    canvasContext.clip()
  }

  /**
   * Creates an offscreen canvas used by the legacy polygon cache path.
   * @param width Canvas width in pixels.
   * @param height Canvas height in pixels.
   * @returns Canvas element with legacy width/height attributes set.
   */
  Renderer.createCanvas = function (width: number, height: number): Cubism2CanvasLike {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', String(width))
    canvas.setAttribute('height', String(height))
    if (!canvas) {
      UtDebug.logWithLegacyPrefix(`err : ${canvas}`)
    }
    return canvas as unknown as Cubism2CanvasLike
  }

  /**
   * Dumps numeric values in the old LDGL debug format.
   * @param values Numeric values to print with three decimals.
   */
  Renderer.dumpValues = function (...values: number[]): void {
    let debugText = ''
    for (let valueIndex = 0; valueIndex < values.length; valueIndex += 1) {
      debugText += `[${valueIndex}]= ${values[valueIndex]!.toFixed(3)} , `
    }
    console.log(debugText)
  }

  return Renderer
}
