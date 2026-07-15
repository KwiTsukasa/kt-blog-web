import type { Cubism2MathStatic } from './math'

export interface Cubism2Matrix44Instance {
  elements: Float32Array
  applyLocalScale: (scaleX: number, scaleY: number, scaleZ: number) => void
  applyLocalTranslation: (
    translateX: number,
    translateY: number,
    translateZ: number,
  ) => void
  copyFromSourceMatrix: (sourceMatrix: ArrayLike<number> | null) => void
  copyMatrixValues: () => Float32Array
  getBackingMatrixArray: () => Float32Array
  multiplyIntoTargetMatrix: (
    rightMatrix: Cubism2Matrix44Instance,
    targetMatrix: Cubism2Matrix44Instance | null,
    useAffineFastPath?: boolean,
  ) => Cubism2Matrix44Instance | null
  multiplyRawMatrixValues: (
    leftValues: MatrixValues,
    rightValues: MatrixValues,
    targetValues: WritableMatrixValues,
    useAffineFastPath?: boolean,
  ) => void
  multiplyWithAliasProtection: (
    leftValues: MatrixValues,
    rightValues: MatrixValues,
    targetValues: WritableMatrixValues,
    useAffineFastPath?: boolean,
  ) => void
  resetToIdentity: () => void
  rotateAroundXAxis: (radian: number) => void
  rotateAroundYAxis: (radian: number) => void
  rotateAroundZAxis: (radian: number) => void
}

export interface Cubism2Matrix44Constructor {
  new (): Cubism2Matrix44Instance
  prototype: Cubism2Matrix44Instance
}

export interface CreateCubism2Matrix44Options {
  Cubism2Math: Pick<Cubism2MathStatic, 'cos' | 'sin'>
}

type MatrixValues = ArrayLike<number>
type WritableMatrixValues = { [index: number]: number }

const MATRIX_ORDER = 16

/**
 * Reads one matrix slot from a fixed Cubism2 4x4 matrix buffer.
 * @param values Matrix-like buffer with caller-validated 16-slot layout.
 * @param index Slot index in Cubism2's column-major matrix layout.
 * @returns Number stored at the requested slot.
 */
function readMatrixValue(values: MatrixValues, index: number): number {
  return values[index]!
}

/**
 * Creates the Cubism2 4x4 matrix constructor restored from the min.js `ac` class.
 * @param options Math namespace that supplies legacy sin/cos implementations.
 * @returns Constructor preserving the legacy `Cubism2Matrix44` prototype surface.
 */
export function createCubism2Matrix44(
  options: CreateCubism2Matrix44Options,
): Cubism2Matrix44Constructor {
  const { Cubism2Math } = options

  /**
   * Stores one Cubism2 column-major 4x4 matrix.
   */
  function Cubism2Matrix44(this: Cubism2Matrix44Instance): void {
    this.elements = new Float32Array(MATRIX_ORDER)
    this.resetToIdentity()
  }

  const Matrix44 = Cubism2Matrix44 as unknown as Cubism2Matrix44Constructor

  /**
   * Resets this matrix to identity.
   */
  Matrix44.prototype.resetToIdentity = function (): void {
    for (let matrixIndex = 0; matrixIndex < MATRIX_ORDER; matrixIndex++) {
      this.elements[matrixIndex] = matrixIndex % 5 == 0 ? 1 : 0
    }
  }

  /**
   * Returns the live backing matrix array for legacy call sites that mutate directly.
   * @returns Mutable backing matrix values.
   */
  Matrix44.prototype.getBackingMatrixArray = function (): Float32Array {
    return this.elements
  }

  /**
   * Copies the current matrix values.
   * @returns New Float32Array containing this matrix snapshot.
   */
  Matrix44.prototype.copyMatrixValues = function (): Float32Array {
    return new Float32Array(this.elements)
  }

  /**
   * Replaces this matrix with a 16-slot matrix buffer.
   * @param sourceMatrix Source matrix in Cubism2 column-major layout; invalid lengths are ignored.
   */
  Matrix44.prototype.copyFromSourceMatrix = function (
    sourceMatrix: ArrayLike<number> | null,
  ): void {
    if (sourceMatrix == null || sourceMatrix.length != MATRIX_ORDER) {
      return
    }
    for (let matrixIndex = 0; matrixIndex < MATRIX_ORDER; matrixIndex++) {
      this.elements[matrixIndex] = readMatrixValue(sourceMatrix, matrixIndex)
    }
  }

  /**
   * Multiplies this matrix by another Cubism2 matrix and writes into a target matrix.
   * @param rightMatrix Right-hand matrix operand.
   * @param targetMatrix Target matrix object; null keeps legacy no-op behavior.
   * @param useAffineFastPath True when bottom row can be forced to `[0, 0, 0, 1]`.
   * @returns Target matrix object, or null when no target was supplied.
   */
  Matrix44.prototype.multiplyIntoTargetMatrix = function (
    rightMatrix: Cubism2Matrix44Instance,
    targetMatrix: Cubism2Matrix44Instance | null,
    useAffineFastPath?: boolean,
  ): Cubism2Matrix44Instance | null {
    if (targetMatrix == null) {
      return null
    }
    if (this == targetMatrix) {
      this.multiplyWithAliasProtection(
        this.elements,
        rightMatrix.elements,
        targetMatrix.elements,
        useAffineFastPath,
      )
    } else {
      this.multiplyRawMatrixValues(
        this.elements,
        rightMatrix.elements,
        targetMatrix.elements,
        useAffineFastPath,
      )
    }
    return targetMatrix
  }

  /**
   * Multiplies two raw matrix buffers with a temporary copy when target aliases the left operand.
   * @param leftValues Left-hand matrix values.
   * @param rightValues Right-hand matrix values.
   * @param targetValues Writable target matrix values.
   * @param useAffineFastPath True when bottom row can be forced to `[0, 0, 0, 1]`.
   */
  Matrix44.prototype.multiplyWithAliasProtection = function (
    leftValues: MatrixValues,
    rightValues: MatrixValues,
    targetValues: WritableMatrixValues,
    useAffineFastPath?: boolean,
  ): void {
    if (leftValues == targetValues) {
      const copiedTargetValues = new Array(MATRIX_ORDER)
      this.multiplyRawMatrixValues(leftValues, rightValues, copiedTargetValues, useAffineFastPath)
      for (let matrixIndex = MATRIX_ORDER - 1; matrixIndex >= 0; --matrixIndex) {
        targetValues[matrixIndex] = readMatrixValue(copiedTargetValues, matrixIndex)
      }
    } else {
      this.multiplyRawMatrixValues(leftValues, rightValues, targetValues, useAffineFastPath)
    }
  }

  /**
   * Multiplies two raw Cubism2 column-major matrix buffers.
   * @param leftValues Left-hand matrix values.
   * @param rightValues Right-hand matrix values.
   * @param targetValues Writable target matrix values.
   * @param useAffineFastPath True when bottom row can be forced to `[0, 0, 0, 1]`.
   */
  Matrix44.prototype.multiplyRawMatrixValues = function (
    leftValues: MatrixValues,
    rightValues: MatrixValues,
    targetValues: WritableMatrixValues,
    useAffineFastPath?: boolean,
  ): void {
    if (useAffineFastPath) {
      targetValues[0] =
        readMatrixValue(leftValues, 0) * readMatrixValue(rightValues, 0) +
        readMatrixValue(leftValues, 4) * readMatrixValue(rightValues, 1) +
        readMatrixValue(leftValues, 8) * readMatrixValue(rightValues, 2)
      targetValues[4] =
        readMatrixValue(leftValues, 0) * readMatrixValue(rightValues, 4) +
        readMatrixValue(leftValues, 4) * readMatrixValue(rightValues, 5) +
        readMatrixValue(leftValues, 8) * readMatrixValue(rightValues, 6)
      targetValues[8] =
        readMatrixValue(leftValues, 0) * readMatrixValue(rightValues, 8) +
        readMatrixValue(leftValues, 4) * readMatrixValue(rightValues, 9) +
        readMatrixValue(leftValues, 8) * readMatrixValue(rightValues, 10)
      targetValues[12] =
        readMatrixValue(leftValues, 0) * readMatrixValue(rightValues, 12) +
        readMatrixValue(leftValues, 4) * readMatrixValue(rightValues, 13) +
        readMatrixValue(leftValues, 8) * readMatrixValue(rightValues, 14) +
        readMatrixValue(leftValues, 12)
      targetValues[1] =
        readMatrixValue(leftValues, 1) * readMatrixValue(rightValues, 0) +
        readMatrixValue(leftValues, 5) * readMatrixValue(rightValues, 1) +
        readMatrixValue(leftValues, 9) * readMatrixValue(rightValues, 2)
      targetValues[5] =
        readMatrixValue(leftValues, 1) * readMatrixValue(rightValues, 4) +
        readMatrixValue(leftValues, 5) * readMatrixValue(rightValues, 5) +
        readMatrixValue(leftValues, 9) * readMatrixValue(rightValues, 6)
      targetValues[9] =
        readMatrixValue(leftValues, 1) * readMatrixValue(rightValues, 8) +
        readMatrixValue(leftValues, 5) * readMatrixValue(rightValues, 9) +
        readMatrixValue(leftValues, 9) * readMatrixValue(rightValues, 10)
      targetValues[13] =
        readMatrixValue(leftValues, 1) * readMatrixValue(rightValues, 12) +
        readMatrixValue(leftValues, 5) * readMatrixValue(rightValues, 13) +
        readMatrixValue(leftValues, 9) * readMatrixValue(rightValues, 14) +
        readMatrixValue(leftValues, 13)
      targetValues[2] =
        readMatrixValue(leftValues, 2) * readMatrixValue(rightValues, 0) +
        readMatrixValue(leftValues, 6) * readMatrixValue(rightValues, 1) +
        readMatrixValue(leftValues, 10) * readMatrixValue(rightValues, 2)
      targetValues[6] =
        readMatrixValue(leftValues, 2) * readMatrixValue(rightValues, 4) +
        readMatrixValue(leftValues, 6) * readMatrixValue(rightValues, 5) +
        readMatrixValue(leftValues, 10) * readMatrixValue(rightValues, 6)
      targetValues[10] =
        readMatrixValue(leftValues, 2) * readMatrixValue(rightValues, 8) +
        readMatrixValue(leftValues, 6) * readMatrixValue(rightValues, 9) +
        readMatrixValue(leftValues, 10) * readMatrixValue(rightValues, 10)
      targetValues[14] =
        readMatrixValue(leftValues, 2) * readMatrixValue(rightValues, 12) +
        readMatrixValue(leftValues, 6) * readMatrixValue(rightValues, 13) +
        readMatrixValue(leftValues, 10) * readMatrixValue(rightValues, 14) +
        readMatrixValue(leftValues, 14)
      targetValues[3] = targetValues[7] = targetValues[11] = 0
      targetValues[15] = 1
    } else {
      targetValues[0] =
        readMatrixValue(leftValues, 0) * readMatrixValue(rightValues, 0) +
        readMatrixValue(leftValues, 4) * readMatrixValue(rightValues, 1) +
        readMatrixValue(leftValues, 8) * readMatrixValue(rightValues, 2) +
        readMatrixValue(leftValues, 12) * readMatrixValue(rightValues, 3)
      targetValues[4] =
        readMatrixValue(leftValues, 0) * readMatrixValue(rightValues, 4) +
        readMatrixValue(leftValues, 4) * readMatrixValue(rightValues, 5) +
        readMatrixValue(leftValues, 8) * readMatrixValue(rightValues, 6) +
        readMatrixValue(leftValues, 12) * readMatrixValue(rightValues, 7)
      targetValues[8] =
        readMatrixValue(leftValues, 0) * readMatrixValue(rightValues, 8) +
        readMatrixValue(leftValues, 4) * readMatrixValue(rightValues, 9) +
        readMatrixValue(leftValues, 8) * readMatrixValue(rightValues, 10) +
        readMatrixValue(leftValues, 12) * readMatrixValue(rightValues, 11)
      targetValues[12] =
        readMatrixValue(leftValues, 0) * readMatrixValue(rightValues, 12) +
        readMatrixValue(leftValues, 4) * readMatrixValue(rightValues, 13) +
        readMatrixValue(leftValues, 8) * readMatrixValue(rightValues, 14) +
        readMatrixValue(leftValues, 12) * readMatrixValue(rightValues, 15)
      targetValues[1] =
        readMatrixValue(leftValues, 1) * readMatrixValue(rightValues, 0) +
        readMatrixValue(leftValues, 5) * readMatrixValue(rightValues, 1) +
        readMatrixValue(leftValues, 9) * readMatrixValue(rightValues, 2) +
        readMatrixValue(leftValues, 13) * readMatrixValue(rightValues, 3)
      targetValues[5] =
        readMatrixValue(leftValues, 1) * readMatrixValue(rightValues, 4) +
        readMatrixValue(leftValues, 5) * readMatrixValue(rightValues, 5) +
        readMatrixValue(leftValues, 9) * readMatrixValue(rightValues, 6) +
        readMatrixValue(leftValues, 13) * readMatrixValue(rightValues, 7)
      targetValues[9] =
        readMatrixValue(leftValues, 1) * readMatrixValue(rightValues, 8) +
        readMatrixValue(leftValues, 5) * readMatrixValue(rightValues, 9) +
        readMatrixValue(leftValues, 9) * readMatrixValue(rightValues, 10) +
        readMatrixValue(leftValues, 13) * readMatrixValue(rightValues, 11)
      targetValues[13] =
        readMatrixValue(leftValues, 1) * readMatrixValue(rightValues, 12) +
        readMatrixValue(leftValues, 5) * readMatrixValue(rightValues, 13) +
        readMatrixValue(leftValues, 9) * readMatrixValue(rightValues, 14) +
        readMatrixValue(leftValues, 13) * readMatrixValue(rightValues, 15)
      targetValues[2] =
        readMatrixValue(leftValues, 2) * readMatrixValue(rightValues, 0) +
        readMatrixValue(leftValues, 6) * readMatrixValue(rightValues, 1) +
        readMatrixValue(leftValues, 10) * readMatrixValue(rightValues, 2) +
        readMatrixValue(leftValues, 14) * readMatrixValue(rightValues, 3)
      targetValues[6] =
        readMatrixValue(leftValues, 2) * readMatrixValue(rightValues, 4) +
        readMatrixValue(leftValues, 6) * readMatrixValue(rightValues, 5) +
        readMatrixValue(leftValues, 10) * readMatrixValue(rightValues, 6) +
        readMatrixValue(leftValues, 14) * readMatrixValue(rightValues, 7)
      targetValues[10] =
        readMatrixValue(leftValues, 2) * readMatrixValue(rightValues, 8) +
        readMatrixValue(leftValues, 6) * readMatrixValue(rightValues, 9) +
        readMatrixValue(leftValues, 10) * readMatrixValue(rightValues, 10) +
        readMatrixValue(leftValues, 14) * readMatrixValue(rightValues, 11)
      targetValues[14] =
        readMatrixValue(leftValues, 2) * readMatrixValue(rightValues, 12) +
        readMatrixValue(leftValues, 6) * readMatrixValue(rightValues, 13) +
        readMatrixValue(leftValues, 10) * readMatrixValue(rightValues, 14) +
        readMatrixValue(leftValues, 14) * readMatrixValue(rightValues, 15)
      targetValues[3] =
        readMatrixValue(leftValues, 3) * readMatrixValue(rightValues, 0) +
        readMatrixValue(leftValues, 7) * readMatrixValue(rightValues, 1) +
        readMatrixValue(leftValues, 11) * readMatrixValue(rightValues, 2) +
        readMatrixValue(leftValues, 15) * readMatrixValue(rightValues, 3)
      targetValues[7] =
        readMatrixValue(leftValues, 3) * readMatrixValue(rightValues, 4) +
        readMatrixValue(leftValues, 7) * readMatrixValue(rightValues, 5) +
        readMatrixValue(leftValues, 11) * readMatrixValue(rightValues, 6) +
        readMatrixValue(leftValues, 15) * readMatrixValue(rightValues, 7)
      targetValues[11] =
        readMatrixValue(leftValues, 3) * readMatrixValue(rightValues, 8) +
        readMatrixValue(leftValues, 7) * readMatrixValue(rightValues, 9) +
        readMatrixValue(leftValues, 11) * readMatrixValue(rightValues, 10) +
        readMatrixValue(leftValues, 15) * readMatrixValue(rightValues, 11)
      targetValues[15] =
        readMatrixValue(leftValues, 3) * readMatrixValue(rightValues, 12) +
        readMatrixValue(leftValues, 7) * readMatrixValue(rightValues, 13) +
        readMatrixValue(leftValues, 11) * readMatrixValue(rightValues, 14) +
        readMatrixValue(leftValues, 15) * readMatrixValue(rightValues, 15)
    }
  }

  /**
   * Applies local-space translation to this matrix.
   * @param translateX Translation along the X axis.
   * @param translateY Translation along the Y axis.
   * @param translateZ Translation along the Z axis.
   */
  Matrix44.prototype.applyLocalTranslation = function (
    translateX: number,
    translateY: number,
    translateZ: number,
  ): void {
    this.elements[12] =
      readMatrixValue(this.elements, 0) * translateX +
      readMatrixValue(this.elements, 4) * translateY +
      readMatrixValue(this.elements, 8) * translateZ +
      readMatrixValue(this.elements, 12)
    this.elements[13] =
      readMatrixValue(this.elements, 1) * translateX +
      readMatrixValue(this.elements, 5) * translateY +
      readMatrixValue(this.elements, 9) * translateZ +
      readMatrixValue(this.elements, 13)
    this.elements[14] =
      readMatrixValue(this.elements, 2) * translateX +
      readMatrixValue(this.elements, 6) * translateY +
      readMatrixValue(this.elements, 10) * translateZ +
      readMatrixValue(this.elements, 14)
    this.elements[15] =
      readMatrixValue(this.elements, 3) * translateX +
      readMatrixValue(this.elements, 7) * translateY +
      readMatrixValue(this.elements, 11) * translateZ +
      readMatrixValue(this.elements, 15)
  }

  /**
   * Applies local-space scale to this matrix.
   * @param scaleX Scale along the X axis.
   * @param scaleY Scale along the Y axis.
   * @param scaleZ Scale along the Z axis.
   */
  Matrix44.prototype.applyLocalScale = function (
    scaleX: number,
    scaleY: number,
    scaleZ: number,
  ): void {
    this.elements[0] = readMatrixValue(this.elements, 0) * scaleX
    this.elements[4] = readMatrixValue(this.elements, 4) * scaleY
    this.elements[8] = readMatrixValue(this.elements, 8) * scaleZ
    this.elements[1] = readMatrixValue(this.elements, 1) * scaleX
    this.elements[5] = readMatrixValue(this.elements, 5) * scaleY
    this.elements[9] = readMatrixValue(this.elements, 9) * scaleZ
    this.elements[2] = readMatrixValue(this.elements, 2) * scaleX
    this.elements[6] = readMatrixValue(this.elements, 6) * scaleY
    this.elements[10] = readMatrixValue(this.elements, 10) * scaleZ
    this.elements[3] = readMatrixValue(this.elements, 3) * scaleX
    this.elements[7] = readMatrixValue(this.elements, 7) * scaleY
    this.elements[11] = readMatrixValue(this.elements, 11) * scaleZ
  }

  /**
   * Rotates this matrix around the X axis.
   * @param radian Rotation angle in radians.
   */
  Matrix44.prototype.rotateAroundXAxis = function (radian: number): void {
    const cosine = Cubism2Math.cos(radian)
    const sine = Cubism2Math.sin(radian)
    let previousValue = this.elements[4]!
    this.elements[4] = previousValue * cosine + this.elements[8]! * sine
    this.elements[8] = previousValue * -sine + this.elements[8]! * cosine
    previousValue = this.elements[5]!
    this.elements[5] = previousValue * cosine + this.elements[9]! * sine
    this.elements[9] = previousValue * -sine + this.elements[9]! * cosine
    previousValue = this.elements[6]!
    this.elements[6] = previousValue * cosine + this.elements[10]! * sine
    this.elements[10] = previousValue * -sine + this.elements[10]! * cosine
    previousValue = this.elements[7]!
    this.elements[7] = previousValue * cosine + this.elements[11]! * sine
    this.elements[11] = previousValue * -sine + this.elements[11]! * cosine
  }

  /**
   * Rotates this matrix around the Y axis.
   * @param radian Rotation angle in radians.
   */
  Matrix44.prototype.rotateAroundYAxis = function (radian: number): void {
    const cosine = Cubism2Math.cos(radian)
    const sine = Cubism2Math.sin(radian)
    let previousValue = this.elements[0]!
    this.elements[0] = previousValue * cosine + this.elements[8]! * -sine
    this.elements[8] = previousValue * sine + this.elements[8]! * cosine
    previousValue = this.elements[1]!
    this.elements[1] = previousValue * cosine + this.elements[9]! * -sine
    this.elements[9] = previousValue * sine + this.elements[9]! * cosine
    previousValue = this.elements[2]!
    this.elements[2] = previousValue * cosine + this.elements[10]! * -sine
    this.elements[10] = previousValue * sine + this.elements[10]! * cosine
    previousValue = this.elements[3]!
    this.elements[3] = previousValue * cosine + this.elements[11]! * -sine
    this.elements[11] = previousValue * sine + this.elements[11]! * cosine
  }

  /**
   * Rotates this matrix around the Z axis.
   * @param radian Rotation angle in radians.
   */
  Matrix44.prototype.rotateAroundZAxis = function (radian: number): void {
    const cosine = Cubism2Math.cos(radian)
    const sine = Cubism2Math.sin(radian)
    let previousValue = this.elements[0]!
    this.elements[0] = previousValue * cosine + this.elements[4]! * sine
    this.elements[4] = previousValue * -sine + this.elements[4]! * cosine
    previousValue = this.elements[1]!
    this.elements[1] = previousValue * cosine + this.elements[5]! * sine
    this.elements[5] = previousValue * -sine + this.elements[5]! * cosine
    previousValue = this.elements[2]!
    this.elements[2] = previousValue * cosine + this.elements[6]! * sine
    this.elements[6] = previousValue * -sine + this.elements[6]! * cosine
    previousValue = this.elements[3]!
    this.elements[3] = previousValue * cosine + this.elements[7]! * sine
    this.elements[7] = previousValue * -sine + this.elements[7]! * cosine
  }

  return Matrix44
}
