import type { Cubism2UtSystemStatic } from './runtimeUtilities'

export interface Cubism2AffineTransformInstance {
  scaleX: number
  skewY: number
  skewX: number
  scaleY: number
  translateX: number
  translateY: number
  stateFlags: number
  copyMode: number
  composeFromScaleSkewRotationTranslation: (decomposedValues: ArrayLike<number>) => void
  decomposeToScaleSkewRotationTranslation: (decomposedValues: { [index: number]: number }) => void
  interpolateDecomposedTransform: (
    fromTransform: Cubism2AffineTransformInstance,
    toTransform: Cubism2AffineTransformInstance,
    interpolationRate: number,
    outputTransform: Cubism2AffineTransformInstance,
  ) => void
  writeRawMatrixValues: (matrixValues: { [index: number]: number }) => void
  transform: (
    sourcePoints: ArrayLike<number>,
    targetPoints: { [index: number]: number },
    pointCount: number,
  ) => void
  update: () => void
}

export interface Cubism2AffineTransformConstructor {
  new (...legacyConstructorValues: number[]): Cubism2AffineTransformInstance
  COPY_MODE_IDENTITY: number
  COPY_MODE_NEGATIVE_DETERMINANT: number
  COPY_MODE_TRANSLATE_ONLY: number
  STATE_IDENTITY: number
  STATE_SCALE: number
  STATE_SKEW: number
  STATE_TRANSLATE: number
  prototype: Cubism2AffineTransformInstance
}

export interface CreateCubism2AffineTransformOptions {
  UtSystem: Pick<Cubism2UtSystemStatic, 'copyArraySegmentForward'>
  isBootstrapping: () => boolean
  isVerboseLoggingEnabled?: () => boolean
  logger?: Pick<Console, 'log'>
}

type NumericSlots = ArrayLike<number> | { [index: number]: number }

const MATRIX_SCALE_X_INDEX = 0
const MATRIX_SKEW_Y_INDEX = 1
const MATRIX_SKEW_X_INDEX = 2
const MATRIX_SCALE_Y_INDEX = 3
const MATRIX_TRANSLATE_X_INDEX = 4
const MATRIX_TRANSLATE_Y_INDEX = 5
const STATE_IDENTITY = 0
const STATE_TRANSLATE = 1
const STATE_SCALE = 2
const STATE_SKEW = 4
const COPY_MODE_NEGATIVE_DETERMINANT = -1
const COPY_MODE_IDENTITY = 0
const COPY_MODE_TRANSLATE_ONLY = 1

/**
 * Reads one numeric slot from a fixed legacy matrix/vector buffer.
 * @param values Array-like Cubism2 buffer whose caller has already validated layout length.
 * @param index Numeric slot index in the packed buffer.
 * @returns Number stored at the requested slot.
 */
function readNumericSlot(values: NumericSlots, index: number): number {
  return values[index]!
}

/**
 * Creates the Cubism2 SDK2 affine-transform constructor.
 * @param options Runtime array-copy helper, bootstrap guard, and optional verbose logger.
 * @returns Constructor exposing the semantic affine-transform surface.
 */
export function createCubism2AffineTransform(
  options: CreateCubism2AffineTransformOptions,
): Cubism2AffineTransformConstructor {
  const logger = options.logger ?? console

  /**
   * Stores one 2D affine matrix in Cubism2's six-value layout.
   * @param legacyConstructorValues Ignored float payloads from the old reader constructor path; min.js kept construction identity-only.
   */
  function Cubism2AffineTransform(
    this: Cubism2AffineTransformInstance,
    ...legacyConstructorValues: number[]
  ): void {
    void legacyConstructorValues
    if (options.isBootstrapping()) {
      return
    }
    this.scaleX = 1
    this.skewY = 0
    this.skewX = 0
    this.scaleY = 1
    this.translateX = 0
    this.translateY = 0
    this.stateFlags = STATE_IDENTITY
    this.copyMode = COPY_MODE_IDENTITY
  }

  const AffineTransform = Cubism2AffineTransform as unknown as Cubism2AffineTransformConstructor

  AffineTransform.COPY_MODE_NEGATIVE_DETERMINANT = COPY_MODE_NEGATIVE_DETERMINANT
  AffineTransform.COPY_MODE_IDENTITY = COPY_MODE_IDENTITY
  AffineTransform.COPY_MODE_TRANSLATE_ONLY = COPY_MODE_TRANSLATE_ONLY
  AffineTransform.STATE_IDENTITY = STATE_IDENTITY
  AffineTransform.STATE_TRANSLATE = STATE_TRANSLATE
  AffineTransform.STATE_SCALE = STATE_SCALE
  AffineTransform.STATE_SKEW = STATE_SKEW

  /**
   * Applies this affine matrix to one packed x/y point array.
   * @param sourcePoints Packed source coordinates in `[x0, y0, x1, y1...]` order.
   * @param targetPoints Mutable packed destination coordinates.
   * @param pointCount Number of x/y pairs to transform.
   */
  AffineTransform.prototype.transform = function (
    sourcePoints: ArrayLike<number>,
    targetPoints: { [index: number]: number },
    pointCount: number,
  ): void {
    let scaleX, skewX, translateX, skewY, scaleY, translateY
    let sourceOffset = 0
    let targetOffset = 0
    switch (this.stateFlags) {
      default:
        return
      case AffineTransform.STATE_SKEW | AffineTransform.STATE_SCALE | AffineTransform.STATE_TRANSLATE:
        scaleX = this.scaleX
        skewX = this.skewX
        translateX = this.translateX
        skewY = this.skewY
        scaleY = this.scaleY
        translateY = this.translateY
        while (--pointCount >= 0) {
          const sourceX = readNumericSlot(sourcePoints, sourceOffset++)
          const sourceY = readNumericSlot(sourcePoints, sourceOffset++)
          targetPoints[targetOffset++] = scaleX * sourceX + skewX * sourceY + translateX
          targetPoints[targetOffset++] = skewY * sourceX + scaleY * sourceY + translateY
        }
        return
      case AffineTransform.STATE_SKEW | AffineTransform.STATE_SCALE:
        scaleX = this.scaleX
        skewX = this.skewX
        skewY = this.skewY
        scaleY = this.scaleY
        while (--pointCount >= 0) {
          const sourceX = readNumericSlot(sourcePoints, sourceOffset++)
          const sourceY = readNumericSlot(sourcePoints, sourceOffset++)
          targetPoints[targetOffset++] = scaleX * sourceX + skewX * sourceY
          targetPoints[targetOffset++] = skewY * sourceX + scaleY * sourceY
        }
        return
      case AffineTransform.STATE_SKEW | AffineTransform.STATE_TRANSLATE:
        skewX = this.skewX
        translateX = this.translateX
        skewY = this.skewY
        translateY = this.translateY
        while (--pointCount >= 0) {
          const sourceX = readNumericSlot(sourcePoints, sourceOffset++)
          targetPoints[targetOffset++] =
            skewX * readNumericSlot(sourcePoints, sourceOffset++) + translateX
          targetPoints[targetOffset++] = skewY * sourceX + translateY
        }
        return
      case AffineTransform.STATE_SKEW:
        skewX = this.skewX
        skewY = this.skewY
        while (--pointCount >= 0) {
          const sourceX = readNumericSlot(sourcePoints, sourceOffset++)
          targetPoints[targetOffset++] = skewX * readNumericSlot(sourcePoints, sourceOffset++)
          targetPoints[targetOffset++] = skewY * sourceX
        }
        return
      case AffineTransform.STATE_SCALE | AffineTransform.STATE_TRANSLATE:
        scaleX = this.scaleX
        translateX = this.translateX
        scaleY = this.scaleY
        translateY = this.translateY
        while (--pointCount >= 0) {
          targetPoints[targetOffset++] =
            scaleX * readNumericSlot(sourcePoints, sourceOffset++) + translateX
          targetPoints[targetOffset++] =
            scaleY * readNumericSlot(sourcePoints, sourceOffset++) + translateY
        }
        return
      case AffineTransform.STATE_SCALE:
        scaleX = this.scaleX
        scaleY = this.scaleY
        while (--pointCount >= 0) {
          targetPoints[targetOffset++] = scaleX * readNumericSlot(sourcePoints, sourceOffset++)
          targetPoints[targetOffset++] = scaleY * readNumericSlot(sourcePoints, sourceOffset++)
        }
        return
      case AffineTransform.STATE_TRANSLATE:
        translateX = this.translateX
        translateY = this.translateY
        while (--pointCount >= 0) {
          targetPoints[targetOffset++] = readNumericSlot(sourcePoints, sourceOffset++) + translateX
          targetPoints[targetOffset++] = readNumericSlot(sourcePoints, sourceOffset++) + translateY
        }
        return
      case AffineTransform.STATE_IDENTITY:
        if (sourcePoints != targetPoints || sourceOffset != targetOffset) {
          options.UtSystem.copyArraySegmentForward(
            sourcePoints,
            sourceOffset,
            targetPoints,
            targetOffset,
            pointCount * 2,
          )
        }
    }
  }

  /**
   * Recomputes transform state flags used by the fast transform switch paths.
   */
  AffineTransform.prototype.update = function (): void {
    if (this.skewX == 0 && this.skewY == 0) {
      if (this.scaleX == 1 && this.scaleY == 1) {
        if (this.translateX == 0 && this.translateY == 0) {
          this.stateFlags = AffineTransform.STATE_IDENTITY
          this.copyMode = AffineTransform.COPY_MODE_IDENTITY
        } else {
          this.stateFlags = AffineTransform.STATE_TRANSLATE
          this.copyMode = AffineTransform.COPY_MODE_TRANSLATE_ONLY
        }
      } else {
        if (this.translateX == 0 && this.translateY == 0) {
          this.stateFlags = AffineTransform.STATE_SCALE
          this.copyMode = AffineTransform.COPY_MODE_NEGATIVE_DETERMINANT
        } else {
          this.stateFlags = AffineTransform.STATE_SCALE | AffineTransform.STATE_TRANSLATE
          this.copyMode = AffineTransform.COPY_MODE_NEGATIVE_DETERMINANT
        }
      }
    } else {
      if (this.scaleX == 0 && this.scaleY == 0) {
        if (this.translateX == 0 && this.translateY == 0) {
          this.stateFlags = AffineTransform.STATE_SKEW
          this.copyMode = AffineTransform.COPY_MODE_NEGATIVE_DETERMINANT
        } else {
          this.stateFlags = AffineTransform.STATE_SKEW | AffineTransform.STATE_TRANSLATE
          this.copyMode = AffineTransform.COPY_MODE_NEGATIVE_DETERMINANT
        }
      } else {
        if (this.translateX == 0 && this.translateY == 0) {
          this.stateFlags = AffineTransform.STATE_SKEW | AffineTransform.STATE_SCALE
          this.copyMode = AffineTransform.COPY_MODE_NEGATIVE_DETERMINANT
        } else {
          this.stateFlags =
            AffineTransform.STATE_SKEW |
            AffineTransform.STATE_SCALE |
            AffineTransform.STATE_TRANSLATE
          this.copyMode = AffineTransform.COPY_MODE_NEGATIVE_DETERMINANT
        }
      }
    }
  }

  /**
   * Decomposes the matrix into scale, skew, rotation, and translation values.
   * @param decomposedValues Six-value output buffer `[scaleX, scaleY, skew, rotation, translateX, translateY]`.
   */
  AffineTransform.prototype.decomposeToScaleSkewRotationTranslation = function (
    decomposedValues: { [index: number]: number },
  ): void {
    this.writeRawMatrixValues(decomposedValues)
    const scaleX = readNumericSlot(decomposedValues, MATRIX_SCALE_X_INDEX)
    const skewX = readNumericSlot(decomposedValues, MATRIX_SKEW_X_INDEX)
    const skewY = readNumericSlot(decomposedValues, MATRIX_SKEW_Y_INDEX)
    const scaleY = readNumericSlot(decomposedValues, MATRIX_SCALE_Y_INDEX)
    const decomposedScaleX = Math.sqrt(scaleX * scaleX + skewY * skewY)
    const determinant = scaleX * scaleY - skewX * skewY
    if (decomposedScaleX == 0) {
      if (options.isVerboseLoggingEnabled?.()) {
        logger.log('Affine transform decomposition encountered a zero scale')
      }
    } else {
      decomposedValues[MATRIX_SCALE_X_INDEX] = decomposedScaleX
      decomposedValues[MATRIX_SKEW_Y_INDEX] = determinant / decomposedScaleX
      decomposedValues[MATRIX_SKEW_X_INDEX] = (skewY * scaleY + scaleX * skewX) / determinant
      decomposedValues[MATRIX_SCALE_Y_INDEX] = Math.atan2(skewY, scaleX)
    }
  }

  /**
   * Interpolates two affine transforms by decomposing them before blending components.
   * @param fromTransform Start transform.
   * @param toTransform End transform.
   * @param interpolationRate Blend ratio from 0 to 1.
   * @param outputTransform Transform object receiving the composed blended matrix.
   */
  AffineTransform.prototype.interpolateDecomposedTransform = function (
    fromTransform: Cubism2AffineTransformInstance,
    toTransform: Cubism2AffineTransformInstance,
    interpolationRate: number,
    outputTransform: Cubism2AffineTransformInstance,
  ): void {
    const fromDecomposedValues = new Float32Array(6)
    const toDecomposedValues = new Float32Array(6)
    fromTransform.decomposeToScaleSkewRotationTranslation(fromDecomposedValues)
    toTransform.decomposeToScaleSkewRotationTranslation(toDecomposedValues)
    const blendedValues = new Float32Array(6)
    blendedValues[0] =
      readNumericSlot(fromDecomposedValues, 0) +
      (readNumericSlot(toDecomposedValues, 0) - readNumericSlot(fromDecomposedValues, 0)) *
        interpolationRate
    blendedValues[1] =
      readNumericSlot(fromDecomposedValues, 1) +
      (readNumericSlot(toDecomposedValues, 1) - readNumericSlot(fromDecomposedValues, 1)) *
        interpolationRate
    blendedValues[2] =
      readNumericSlot(fromDecomposedValues, 2) +
      (readNumericSlot(toDecomposedValues, 2) - readNumericSlot(fromDecomposedValues, 2)) *
        interpolationRate
    blendedValues[3] =
      readNumericSlot(fromDecomposedValues, 3) +
      (readNumericSlot(toDecomposedValues, 3) - readNumericSlot(fromDecomposedValues, 3)) *
        interpolationRate
    blendedValues[4] =
      readNumericSlot(fromDecomposedValues, 4) +
      (readNumericSlot(toDecomposedValues, 4) - readNumericSlot(fromDecomposedValues, 4)) *
        interpolationRate
    blendedValues[5] =
      readNumericSlot(fromDecomposedValues, 5) +
      (readNumericSlot(toDecomposedValues, 5) - readNumericSlot(fromDecomposedValues, 5)) *
        interpolationRate
    outputTransform.composeFromScaleSkewRotationTranslation(blendedValues)
  }

  /**
   * Composes the matrix from decomposed scale, skew, rotation, and translation values.
   * @param decomposedValues Six-value source buffer `[scaleX, scaleY, skew, rotation, translateX, translateY]`.
   */
  AffineTransform.prototype.composeFromScaleSkewRotationTranslation = function (
    decomposedValues: ArrayLike<number>,
  ): void {
    const rotationRadians = readNumericSlot(decomposedValues, MATRIX_SCALE_Y_INDEX)
    const decomposedScaleX = readNumericSlot(decomposedValues, MATRIX_SCALE_X_INDEX)
    const decomposedScaleY = readNumericSlot(decomposedValues, MATRIX_SKEW_Y_INDEX)
    const decomposedSkew = readNumericSlot(decomposedValues, MATRIX_SKEW_X_INDEX)
    const cosine = Math.cos(rotationRadians)
    const sine = Math.sin(rotationRadians)
    this.scaleX = decomposedScaleX * cosine
    this.skewY = decomposedScaleX * sine
    this.skewX = decomposedScaleY * (decomposedSkew * cosine - sine)
    this.scaleY = decomposedScaleY * (decomposedSkew * sine + cosine)
    this.translateX = readNumericSlot(decomposedValues, MATRIX_TRANSLATE_X_INDEX)
    this.translateY = readNumericSlot(decomposedValues, MATRIX_TRANSLATE_Y_INDEX)
    this.update()
  }

  /**
   * Writes the raw six-value affine matrix to the supplied buffer.
   * @param matrixValues Mutable output buffer receiving `[m00, m10, m01, m11, tx, ty]`.
   */
  AffineTransform.prototype.writeRawMatrixValues = function (matrixValues: {
    [index: number]: number
  }): void {
    matrixValues[MATRIX_SCALE_X_INDEX] = this.scaleX
    matrixValues[MATRIX_SKEW_Y_INDEX] = this.skewY
    matrixValues[MATRIX_SKEW_X_INDEX] = this.skewX
    matrixValues[MATRIX_SCALE_Y_INDEX] = this.scaleY
    matrixValues[MATRIX_TRANSLATE_X_INDEX] = this.translateX
    matrixValues[MATRIX_TRANSLATE_Y_INDEX] = this.translateY
  }

  return AffineTransform
}
