/**
 * Public affine solver signature exposed by the recovered Cubism2 UtVector namespace.
 */
export type Cubism2SolveAffineCoordinates = (
  pointX: number,
  pointY: number,
  originX: number,
  originY: number,
  primaryBasisX: number,
  primaryBasisY: number,
  secondaryBasisX: number,
  secondaryBasisY: number,
  outputCoordinates?: number[] | null,
) => number[] | null

export interface Cubism2UtVectorStatic {
  solveAffineCoordinates: Cubism2SolveAffineCoordinates
}

export interface CreateCubism2UtVectorOptions {
  logger?: Pick<Console, 'log'>
}

/**
 * Solves the primary and secondary coordinates of a point in an affine basis.
 * @param pointX X coordinate of the point being projected into the basis.
 * @param pointY Y coordinate of the point being projected into the basis.
 * @param originX X coordinate of the affine basis origin.
 * @param originY Y coordinate of the affine basis origin.
 * @param primaryBasisX X component of the first basis vector.
 * @param primaryBasisY Y component of the first basis vector.
 * @param secondaryBasisX X component of the second basis vector.
 * @param secondaryBasisY Y component of the second basis vector.
 * @param outputCoordinates Optional two-slot buffer reused by LDGL triangle mapping.
 * @param logger Console-like sink used only for legacy NaN fallback diagnostics.
 * @returns `[primaryCoordinate, secondaryCoordinate]`, the supplied output buffer, or null for a singular basis.
 */
function solveAffineCoordinates(
  pointX: number,
  pointY: number,
  originX: number,
  originY: number,
  primaryBasisX: number,
  primaryBasisY: number,
  secondaryBasisX: number,
  secondaryBasisY: number,
  outputCoordinates?: number[] | null,
  logger: Pick<Console, 'log'> = console,
): number[] | null {
  const determinant = secondaryBasisX * primaryBasisY - secondaryBasisY * primaryBasisX
  if (determinant == 0) {
    return null
  }

  const secondaryCoordinate =
    ((pointX - originX) * primaryBasisY - (pointY - originY) * primaryBasisX) / determinant
  let primaryCoordinate: number
  if (primaryBasisX != 0) {
    primaryCoordinate = (pointX - originX - secondaryCoordinate * secondaryBasisX) / primaryBasisX
  } else {
    primaryCoordinate = (pointY - originY - secondaryCoordinate * secondaryBasisY) / primaryBasisY
  }

  if (Number.isNaN(primaryCoordinate)) {
    primaryCoordinate = (pointX - originX - secondaryCoordinate * secondaryBasisX) / primaryBasisX
    if (Number.isNaN(primaryCoordinate)) {
      primaryCoordinate = (pointY - originY - secondaryCoordinate * secondaryBasisY) / primaryBasisY
    }
    if (Number.isNaN(primaryCoordinate)) {
      logger.log('a is NaN @UtVector#solveAffineCoordinates() ')
      logger.log('v1x : ' + primaryBasisX)
      logger.log('v1x != 0 ? ' + (primaryBasisX != 0))
    }
  }

  if (outputCoordinates == null) {
    return [primaryCoordinate, secondaryCoordinate]
  }
  outputCoordinates[0] = primaryCoordinate
  outputCoordinates[1] = secondaryCoordinate
  return outputCoordinates
}

/**
 * Creates the Cubism2 SDK2 UtVector helper namespace for affine-coordinate projection.
 * @param options Optional logger used by the legacy NaN diagnostic branch.
 * @returns UtVector static helper with a semantic affine-coordinate solver.
 */
export function createCubism2UtVector(
  options: CreateCubism2UtVectorOptions = {},
): Cubism2UtVectorStatic {
  const logger = options.logger ?? console

  /**
   * Legacy UtVector namespace constructor retained only as a static helper container.
   */
  function UtVector(): void {}

  const Vector = UtVector as unknown as Cubism2UtVectorStatic

  /**
   * Solves a point's coordinates inside the supplied affine basis.
   * @param pointX X coordinate of the point being projected into the basis.
   * @param pointY Y coordinate of the point being projected into the basis.
   * @param originX X coordinate of the affine basis origin.
   * @param originY Y coordinate of the affine basis origin.
   * @param primaryBasisX X component of the first basis vector.
   * @param primaryBasisY Y component of the first basis vector.
   * @param secondaryBasisX X component of the second basis vector.
   * @param secondaryBasisY Y component of the second basis vector.
   * @param outputCoordinates Optional two-slot buffer reused by LDGL triangle mapping.
   * @returns `[primaryCoordinate, secondaryCoordinate]`, the supplied output buffer, or null for a singular basis.
   */
  Vector.solveAffineCoordinates = function (
    pointX: number,
    pointY: number,
    originX: number,
    originY: number,
    primaryBasisX: number,
    primaryBasisY: number,
    secondaryBasisX: number,
    secondaryBasisY: number,
    outputCoordinates?: number[] | null,
  ): number[] | null {
    return solveAffineCoordinates(
      pointX,
      pointY,
      originX,
      originY,
      primaryBasisX,
      primaryBasisY,
      secondaryBasisX,
      secondaryBasisY,
      outputCoordinates,
      logger,
    )
  }

  return Vector
}
