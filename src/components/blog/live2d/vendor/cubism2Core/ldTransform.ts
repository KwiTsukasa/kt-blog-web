interface Cubism2CanvasTransformContext {
  transform: (
    scaleX: number,
    skewY: number,
    skewX: number,
    scaleY: number,
    translateX: number,
    translateY: number,
  ) => void
}

export interface Cubism2LDTransformInstance {
  matrix: number[]
  concatenate: (rightTransform: Cubism2LDTransformInstance) => void
  identity: () => void
  invertInto: (targetTransform?: Cubism2LDTransformInstance) => Cubism2LDTransformInstance | null
  rotate: (radians: number) => void
  scale: (scaleX: number, scaleY: number) => void
  setContext: (canvasContext: Cubism2CanvasTransformContext) => void
  shear: (shearX: number, shearY: number) => void
  toString: () => string
  transformPoint: (sourceX: number, sourceY: number, outputPoint?: number[]) => number[]
  transformPointForLDGL: (sourceX: number, sourceY: number, outputPoint?: number[]) => number[]
  translate: (translateX: number, translateY: number) => void
}

export type Cubism2LDTransformConstructor = {
  new (): Cubism2LDTransformInstance
  prototype: Cubism2LDTransformInstance
}

const IDENTITY_MATRIX = [1, 0, 0, 0, 1, 0, 0, 0, 1]

/**
 * Creates the mutable 3x3 transform constructor used by LDGL clipping and canvas transforms.
 * @returns Legacy LDTransform constructor with readable internal matrix semantics.
 */
export function createCubism2LDTransform(): Cubism2LDTransformConstructor {
  /**
   * Stores one column-major 3x3 affine transform matrix used by the legacy Cubism2 renderer.
   */
  function LDTransform(this: Cubism2LDTransformInstance): void {
    this.matrix = [...IDENTITY_MATRIX]
  }

  const Transform = LDTransform as unknown as Cubism2LDTransformConstructor

  /**
   * Resets a mutable matrix array to the identity transform.
   * @param matrixValues Column-major 3x3 matrix array to mutate in place.
   */
  function resetMatrixToIdentity(matrixValues: number[]): void {
    matrixValues[0] = matrixValues[4] = matrixValues[8] = 1
    matrixValues[1] =
      matrixValues[2] =
      matrixValues[3] =
      matrixValues[5] =
      matrixValues[6] =
      matrixValues[7] =
        0
  }

  /**
   * Applies a transform matrix to one 2D source point.
   * @param matrixValues Column-major 3x3 matrix values.
   * @param sourceX Source point X coordinate in model or clip space.
   * @param sourceY Source point Y coordinate in model or clip space.
   * @param outputPoint Optional reusable output array supplied by legacy callers.
   * @returns Output array containing transformed X/Y coordinates.
   */
  function transformPoint(
    matrixValues: number[],
    sourceX: number,
    sourceY: number,
    outputPoint?: number[],
  ): number[] {
    const point = outputPoint ?? [0, 0]
    point[0] = matrixValues[0]! * sourceX + matrixValues[3]! * sourceY + matrixValues[6]!
    point[1] = matrixValues[1]! * sourceX + matrixValues[4]! * sourceY + matrixValues[7]!
    return point
  }

  /**
   * Writes the inverse of one transform into a target transform.
   * @param sourceTransform Transform whose matrix should be inverted.
   * @param targetTransform Optional target transform; every falsy value creates a new transform as in source.
   * @returns Target transform containing the inverse matrix, or null when the matrix is singular.
   */
  function invertInto(
    sourceTransform: Cubism2LDTransformInstance,
    targetTransform?: Cubism2LDTransformInstance,
  ): Cubism2LDTransformInstance | null {
    const inverseTransform = targetTransform || new Transform()
    const matrixValues = sourceTransform.matrix
    const m00 = matrixValues[0]!
    const m01 = matrixValues[1]!
    const m02 = matrixValues[2]!
    const m10 = matrixValues[3]!
    const m11 = matrixValues[4]!
    const m12 = matrixValues[5]!
    const m20 = matrixValues[6]!
    const m21 = matrixValues[7]!
    const m22 = matrixValues[8]!
    const determinant =
      m00 * m11 * m22 +
      m01 * m12 * m20 +
      m02 * m10 * m21 -
      m00 * m12 * m21 -
      m02 * m11 * m20 -
      m01 * m10 * m22

    if (determinant == 0) {
      return null
    }

    const inverseScale = 1 / determinant
    inverseTransform.matrix[0] = inverseScale * (m11 * m22 - m21 * m12)
    inverseTransform.matrix[1] = inverseScale * (m21 * m02 - m01 * m22)
    inverseTransform.matrix[2] = inverseScale * (m01 * m12 - m11 * m02)
    inverseTransform.matrix[3] = inverseScale * (m20 * m12 - m10 * m22)
    inverseTransform.matrix[4] = inverseScale * (m00 * m22 - m20 * m02)
    inverseTransform.matrix[5] = inverseScale * (m10 * m02 - m00 * m12)
    inverseTransform.matrix[6] = inverseScale * (m10 * m21 - m20 * m11)
    inverseTransform.matrix[7] = inverseScale * (m20 * m01 - m00 * m21)
    inverseTransform.matrix[8] = inverseScale * (m00 * m11 - m10 * m01)
    return inverseTransform
  }

  /**
   * Multiplies two legacy column-major transforms and writes the result into the left transform.
   * @param leftTransform Transform mutated with the combined matrix.
   * @param rightTransform Transform applied after the left transform.
   */
  function concatenateTransform(
    leftTransform: Cubism2LDTransformInstance,
    rightTransform: Cubism2LDTransformInstance,
  ): void {
    const matrixValues = leftTransform.matrix
    const rightMatrix = rightTransform.matrix
    const combined00 =
      matrixValues[0]! * rightMatrix[0]! +
      matrixValues[3]! * rightMatrix[1]! +
      matrixValues[6]! * rightMatrix[2]!
    const combined01 =
      matrixValues[1]! * rightMatrix[0]! +
      matrixValues[4]! * rightMatrix[1]! +
      matrixValues[7]! * rightMatrix[2]!
    const combined02 =
      matrixValues[2]! * rightMatrix[0]! +
      matrixValues[5]! * rightMatrix[1]! +
      matrixValues[8]! * rightMatrix[2]!
    const combined10 =
      matrixValues[0]! * rightMatrix[3]! +
      matrixValues[3]! * rightMatrix[4]! +
      matrixValues[6]! * rightMatrix[5]!
    const combined11 =
      matrixValues[1]! * rightMatrix[3]! +
      matrixValues[4]! * rightMatrix[4]! +
      matrixValues[7]! * rightMatrix[5]!
    const combined12 =
      matrixValues[2]! * rightMatrix[3]! +
      matrixValues[5]! * rightMatrix[4]! +
      matrixValues[8]! * rightMatrix[5]!
    const combined20 =
      matrixValues[0]! * rightMatrix[6]! +
      matrixValues[3]! * rightMatrix[7]! +
      matrixValues[6]! * rightMatrix[8]!
    const combined21 =
      matrixValues[1]! * rightMatrix[6]! +
      matrixValues[4]! * rightMatrix[7]! +
      matrixValues[7]! * rightMatrix[8]!
    const combined22 =
      matrixValues[2]! * rightMatrix[6]! +
      matrixValues[5]! * rightMatrix[7]! +
      matrixValues[8]! * rightMatrix[8]!

    matrixValues[0] = combined00
    matrixValues[1] = combined01
    matrixValues[2] = combined02
    matrixValues[3] = combined10
    matrixValues[4] = combined11
    matrixValues[5] = combined12
    matrixValues[6] = combined20
    matrixValues[7] = combined21
    matrixValues[8] = combined22
  }

  /**
   * Applies the current matrix to a CanvasRenderingContext2D-compatible target.
   * @param canvasContext Canvas 2D context or compatible object receiving the affine transform.
   */
  Transform.prototype.setContext = function (canvasContext: Cubism2CanvasTransformContext): void {
    const matrixValues = this.matrix
    canvasContext.transform(
      matrixValues[0]!,
      matrixValues[1]!,
      matrixValues[3]!,
      matrixValues[4]!,
      matrixValues[6]!,
      matrixValues[7]!,
    )
  }

  /**
   * Formats the matrix for legacy debug output.
   * @returns Compact string containing all matrix slots rounded to two decimals.
   */
  Transform.prototype.toString = function (): string {
    let debugText = 'LDTransform { '
    for (let matrixIndex = 0; matrixIndex < 9; matrixIndex += 1) {
      debugText += `${this.matrix[matrixIndex]!.toFixed(2)} ,`
    }
    debugText += ' }'
    return debugText
  }

  /**
   * Resets this transform to identity in place.
   */
  Transform.prototype.identity = function (): void {
    resetMatrixToIdentity(this.matrix)
  }

  /**
   * Applies this transform to one point for the LDGL renderer.
   * @param sourceX Source point X coordinate.
   * @param sourceY Source point Y coordinate.
   * @param outputPoint Optional reusable output array.
   * @returns Output array containing transformed X/Y coordinates.
   */
  Transform.prototype.transformPointForLDGL = function (
    sourceX: number,
    sourceY: number,
    outputPoint?: number[],
  ): number[] {
    return transformPoint(this.matrix, sourceX, sourceY, outputPoint)
  }

  /**
   * Applies this transform to one point through the public transform operation.
   * @param sourceX Source point X coordinate.
   * @param sourceY Source point Y coordinate.
   * @param outputPoint Optional reusable output array.
   * @returns Output array containing transformed X/Y coordinates.
   */
  Transform.prototype.transformPoint = function (
    sourceX: number,
    sourceY: number,
    outputPoint?: number[],
  ): number[] {
    return transformPoint(this.matrix, sourceX, sourceY, outputPoint)
  }

  /**
   * Writes this transform's inverse into a reusable target transform.
   * @param targetTransform Optional target transform reused by LDGL clipping code.
   * @returns Target transform containing the inverse matrix, or null for singular matrices.
   */
  Transform.prototype.invertInto = function (
    targetTransform?: Cubism2LDTransformInstance,
  ): Cubism2LDTransformInstance | null {
    return invertInto(this, targetTransform)
  }

  /**
   * Appends a translation in the local coordinate system of this matrix.
   * @param translateX X-axis translation amount.
   * @param translateY Y-axis translation amount.
   */
  Transform.prototype.translate = function (translateX: number, translateY: number): void {
    const matrixValues = this.matrix
    matrixValues[6] =
      matrixValues[0]! * translateX + matrixValues[3]! * translateY + matrixValues[6]!
    matrixValues[7] =
      matrixValues[1]! * translateX + matrixValues[4]! * translateY + matrixValues[7]!
    matrixValues[8] =
      matrixValues[2]! * translateX + matrixValues[5]! * translateY + matrixValues[8]!
  }

  /**
   * Appends axis-aligned scaling to this matrix.
   * @param scaleX X-axis scale factor.
   * @param scaleY Y-axis scale factor.
   */
  Transform.prototype.scale = function (scaleX: number, scaleY: number): void {
    const matrixValues = this.matrix
    matrixValues[0]! *= scaleX
    matrixValues[1]! *= scaleX
    matrixValues[2]! *= scaleX
    matrixValues[3]! *= scaleY
    matrixValues[4]! *= scaleY
    matrixValues[5]! *= scaleY
  }

  /**
   * Appends shear to this matrix using the legacy Cubism2 column-major order.
   * @param shearX X shear factor applied into the Y column.
   * @param shearY Y shear factor applied into the X column.
   */
  Transform.prototype.shear = function (shearX: number, shearY: number): void {
    const matrixValues = this.matrix
    const sheared00 = matrixValues[0]! + matrixValues[3]! * shearY
    const sheared01 = matrixValues[1]! + matrixValues[4]! * shearY
    const sheared02 = matrixValues[2]! + matrixValues[5]! * shearY
    matrixValues[3] = matrixValues[0]! * shearX + matrixValues[3]!
    matrixValues[4] = matrixValues[1]! * shearX + matrixValues[4]!
    matrixValues[5] = matrixValues[2]! * shearX + matrixValues[5]!
    matrixValues[0] = sheared00
    matrixValues[1] = sheared01
    matrixValues[2] = sheared02
  }

  /**
   * Appends rotation in radians to this matrix.
   * @param radians Rotation angle in radians.
   */
  Transform.prototype.rotate = function (radians: number): void {
    const matrixValues = this.matrix
    const cosine = Math.cos(radians)
    const sine = Math.sin(radians)
    const rotated00 = matrixValues[0]! * cosine + matrixValues[3]! * sine
    const rotated01 = matrixValues[1]! * cosine + matrixValues[4]! * sine
    const rotated02 = matrixValues[2]! * cosine + matrixValues[5]! * sine
    matrixValues[3] = -matrixValues[0]! * sine + matrixValues[3]! * cosine
    matrixValues[4] = -matrixValues[1]! * sine + matrixValues[4]! * cosine
    matrixValues[5] = -matrixValues[2]! * sine + matrixValues[5]! * cosine
    matrixValues[0] = rotated00
    matrixValues[1] = rotated01
    matrixValues[2] = rotated02
  }

  /**
   * Appends another transform by matrix multiplication into this transform's matrix.
   * @param rightTransform Transform applied after this transform.
   * @remarks This intentionally corrects the source's unqualified `m` write, which otherwise throws or mutates a global.
   */
  Transform.prototype.concatenate = function (rightTransform: Cubism2LDTransformInstance): void {
    concatenateTransform(this, rightTransform)
  }

  return Transform
}
