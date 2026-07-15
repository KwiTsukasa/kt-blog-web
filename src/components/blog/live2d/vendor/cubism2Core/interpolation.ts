type MutableNumberArray = ArrayLike<number> & {
  [index: number]: number
}

type PointTable = ArrayLike<number>

type PointTableList = ArrayLike<PointTable>

export interface Cubism2InterpolationModelContextLike {
  getScratchIndexBuffer: () => MutableNumberArray
  getScratchWeightBuffer: () => MutableNumberArray
}

export interface Cubism2InterpolationParamBindingSetLike<
  TModelContext extends Cubism2InterpolationModelContextLike = Cubism2InterpolationModelContextLike,
> {
  buildInterpolationCorners: (
    indexBuffer: MutableNumberArray,
    weightBuffer: MutableNumberArray,
    dimensionCount: number,
  ) => void
  resolveInterpolationWeights: (
    modelContext: TModelContext,
    dirtyFlagRef: boolean[],
  ) => number
}

export interface Cubism2InterpolationUtSystemLike {
  copyArraySegmentForward: (
    source: ArrayLike<number>,
    sourceOffset: number,
    target: MutableNumberArray,
    targetOffset: number,
    length: number,
  ) => void
}

export interface Cubism2InterpolationConstructor {
  interpolateFloat<TModelContext extends Cubism2InterpolationModelContextLike>(
    modelContext: TModelContext,
    paramBindingSet: Cubism2InterpolationParamBindingSetLike<TModelContext>,
    dirtyFlagRef: boolean[],
    sourceValues: ArrayLike<number> | null,
  ): number
  interpolateInteger<TModelContext extends Cubism2InterpolationModelContextLike>(
    modelContext: TModelContext,
    paramBindingSet: Cubism2InterpolationParamBindingSetLike<TModelContext>,
    dirtyFlagRef: boolean[],
    sourceValues: ArrayLike<number> | null,
  ): number
  interpolatePoints<TModelContext extends Cubism2InterpolationModelContextLike>(
    modelContext: TModelContext,
    paramBindingSet: Cubism2InterpolationParamBindingSetLike<TModelContext>,
    dirtyFlagRef: boolean[],
    pointCount: number,
    pointValues: PointTableList | null,
    outputPoints: MutableNumberArray | null,
    valueOffset: number,
    tupleStride: number,
  ): void
  new (): unknown
}

export interface Cubism2InterpolationConstructors {
  Cubism2Interpolation: Cubism2InterpolationConstructor
}

export interface CreateCubism2InterpolationOptions {
  UtSystem: Cubism2InterpolationUtSystemLike
}

interface InterpolationState {
  cornerIndexes: MutableNumberArray
  cornerWeights: MutableNumberArray
  dimensionCount: number
}

/**
 * Creates the Cubism2 SDK2 interpolation helper used by grid and transform data.
 * @param options Utility dependencies used by the direct point-copy branch.
 * @returns Interpolation constructor exposing semantic scalar and point interpolation methods.
 */
export function createCubism2Interpolation(
  options: CreateCubism2InterpolationOptions,
): Cubism2InterpolationConstructors {
  /**
   * Namespace constructor retained for SDK2 compatibility; interpolation behavior is static.
   */
  function Cubism2Interpolation(): void {}

  const Interpolation = Cubism2Interpolation as unknown as Cubism2InterpolationConstructor

  /**
   * Resolves interpolation corners through the supplied parameter binding set.
   * @param modelContext Runtime model context that owns reusable scratch buffers.
   * @param paramBindingSet Parameter bindings that map current parameter values to corners.
   * @param dirtyFlagRef Single-item dirty flag reference mutated by the binding set.
   * @returns Dimension count plus populated scratch corner indexes and weights.
   */
  function resolveInterpolationState<TModelContext extends Cubism2InterpolationModelContextLike>(
    modelContext: TModelContext,
    paramBindingSet: Cubism2InterpolationParamBindingSetLike<TModelContext>,
    dirtyFlagRef: boolean[],
  ): InterpolationState {
    const dimensionCount = paramBindingSet.resolveInterpolationWeights(modelContext, dirtyFlagRef)
    const cornerIndexes = modelContext.getScratchIndexBuffer()
    const cornerWeights = modelContext.getScratchWeightBuffer()
    paramBindingSet.buildInterpolationCorners(cornerIndexes, cornerWeights, dimensionCount)
    return { cornerIndexes, cornerWeights, dimensionCount }
  }

  /**
   * Performs the SDK2 integer interpolation step with the same truncating bitwise cast.
   * @param start Start corner value.
   * @param end End corner value.
   * @param weight Interpolation weight between the two corners.
   * @returns Truncated integer value matching the min.js `| 0` behavior.
   */
  function interpolateIntegerStep(start: number, end: number, weight: number): number {
    return (start + (end - start) * weight) | 0
  }

  /**
   * Performs one SDK2 floating-point interpolation step without changing expression order.
   * @param start Start corner value.
   * @param end End corner value.
   * @param weight Interpolation weight between the two corners.
   * @returns Floating-point lerp result.
   */
  function interpolateFloatStep(start: number, end: number, weight: number): number {
    return start + (end - start) * weight
  }

  /**
   * Calculates one hypercube corner weight in SDK2 corner order.
   * @param cornerOrdinal Zero-based corner ordinal where axis 0 is the least-significant bit.
   * @param dimensionCount Number of active interpolation axes.
   * @param axisWeights Per-axis interpolation weights.
   * @returns Combined weight for the requested corner.
   */
  function calculateCornerWeight(
    cornerOrdinal: number,
    dimensionCount: number,
    axisWeights: ArrayLike<number>,
  ): number {
    let combinedWeight = 1
    for (let axisIndex = dimensionCount - 1; axisIndex >= 0; axisIndex -= 1) {
      const axisBit = (cornerOrdinal >> axisIndex) & 1
      const axisWeight = axisWeights[axisIndex] ?? 0
      combinedWeight *= axisBit === 0 ? 1 - axisWeight : axisWeight
    }
    return combinedWeight
  }

  /**
   * Calculates min.js high-dimensional scalar corner weights, preserving its `/= 2` loop.
   * @param dimensionCount Number of active interpolation axes.
   * @param axisWeights Per-axis interpolation weights.
   * @returns Weight per hypercube corner using the historical scalar fallback formula.
   */
  function calculateLegacyScalarFallbackWeights(
    dimensionCount: number,
    axisWeights: ArrayLike<number>,
  ): Float32Array {
    const cornerCount = 1 << dimensionCount
    const resolvedCornerWeights = new Float32Array(cornerCount)
    for (let cornerIndex = 0; cornerIndex < cornerCount; cornerIndex += 1) {
      let remainingCornerOrdinal = cornerIndex
      let combinedWeight = 1
      for (let axisIndex = 0; axisIndex < dimensionCount; axisIndex += 1) {
        combinedWeight *=
          remainingCornerOrdinal % 2 == 0 ? 1 - axisWeights[axisIndex]! : axisWeights[axisIndex]!
        remainingCornerOrdinal /= 2
      }
      resolvedCornerWeights[cornerIndex] = combinedWeight
    }
    return resolvedCornerWeights
  }

  /**
   * Interpolates a high-dimensional scalar value using the legacy generic fallback.
   * @param dimensionCount Number of active interpolation axes.
   * @param cornerIndexes Source value indexes selected for each corner.
   * @param cornerWeights Per-axis interpolation weights.
   * @param sourceValues Scalar values stored by corner index.
   * @param roundInteger True when the result must match SDK2 integer interpolation rounding.
   * @returns Interpolated scalar value.
   */
  function interpolateHighDimensionalScalar(
    dimensionCount: number,
    cornerIndexes: ArrayLike<number>,
    cornerWeights: ArrayLike<number>,
    sourceValues: ArrayLike<number>,
    roundInteger: boolean,
  ): number {
    const cornerCount = 1 << dimensionCount
    const resolvedCornerWeights = calculateLegacyScalarFallbackWeights(dimensionCount, cornerWeights)
    const cornerValues = new Float32Array(cornerCount)
    for (let cornerIndex = 0; cornerIndex < cornerCount; cornerIndex += 1) {
      cornerValues[cornerIndex] = sourceValues[cornerIndexes[cornerIndex]!]!
    }

    let interpolatedValue = 0
    for (let cornerIndex = 0; cornerIndex < cornerCount; cornerIndex += 1) {
      interpolatedValue += resolvedCornerWeights[cornerIndex]! * cornerValues[cornerIndex]!
    }
    return roundInteger ? (interpolatedValue + 0.5) | 0 : interpolatedValue
  }

  /**
   * Interpolates a point tuple hypercube for the common 1-4 dimensional SDK2 branches.
   * @param dimensionCount Number of active interpolation axes.
   * @param cornerIndexes Point table indexes selected for each corner.
   * @param cornerWeights Per-axis interpolation weights.
   * @param pointCount Number of x/y tuples to write.
   * @param pointValues Source point tables by corner index.
   * @param outputPoints Output point table receiving interpolated tuples.
   * @param valueOffset Output offset for the first tuple's x value.
   * @param tupleStride Distance between consecutive output tuple starts.
   */
  function interpolatePointHypercube(
    dimensionCount: number,
    cornerIndexes: ArrayLike<number>,
    cornerWeights: ArrayLike<number>,
    pointCount: number,
    pointValues: PointTableList,
    outputPoints: MutableNumberArray,
    valueOffset: number,
    tupleStride: number,
  ): void {
    const scalarCount = pointCount * 2
    const cornerCount = 1 << dimensionCount
    let outputOffset = valueOffset
    for (let sourceOffset = 0; sourceOffset < scalarCount; ) {
      let interpolatedX = 0
      let interpolatedY = 0
      const sourceYOffset = sourceOffset + 1
      for (let cornerIndex = 0; cornerIndex < cornerCount; cornerIndex += 1) {
        const cornerWeight = calculateCornerWeight(cornerIndex, dimensionCount, cornerWeights)
        const pointTable = pointValues[cornerIndexes[cornerIndex]!]!
        interpolatedX += cornerWeight * pointTable[sourceOffset]!
        interpolatedY += cornerWeight * pointTable[sourceYOffset]!
      }
      sourceOffset += 2
      outputPoints[outputOffset] = interpolatedX
      outputPoints[outputOffset + 1] = interpolatedY
      outputOffset += tupleStride
    }
  }

  /**
   * Preserves the min.js high-dimensional point fallback, including its typed-array coercion.
   * @param dimensionCount Number of active interpolation axes.
   * @param cornerIndexes Point table indexes selected for each corner.
   * @param cornerWeights Per-axis interpolation weights.
   * @param pointCount Number of x/y tuples to write.
   * @param pointValues Source point tables by corner index.
   * @param outputPoints Output point table receiving interpolated tuples.
   * @param valueOffset Output offset for the first tuple's x value.
   * @param tupleStride Distance between consecutive output tuple starts.
   */
  function interpolateHighDimensionalPointsLegacy(
    dimensionCount: number,
    cornerIndexes: ArrayLike<number>,
    cornerWeights: ArrayLike<number>,
    pointCount: number,
    pointValues: PointTableList,
    outputPoints: MutableNumberArray,
    valueOffset: number,
    tupleStride: number,
  ): void {
    const cornerCount = 1 << dimensionCount
    const resolvedCornerWeights = calculateLegacyScalarFallbackWeights(dimensionCount, cornerWeights)
    const legacyCornerPointTables = new Float32Array(cornerCount) as unknown as PointTable[] &
      MutableNumberArray
    for (let cornerIndex = 0; cornerIndex < cornerCount; cornerIndex += 1) {
      ;(legacyCornerPointTables as unknown as PointTable[])[cornerIndex] =
        pointValues[cornerIndexes[cornerIndex]!]!
    }

    const scalarCount = pointCount * 2
    let outputOffset = valueOffset
    for (let sourceOffset = 0; sourceOffset < scalarCount; ) {
      let interpolatedX = 0
      let interpolatedY = 0
      const sourceYOffset = sourceOffset + 1
      for (let cornerIndex = 0; cornerIndex < cornerCount; cornerIndex += 1) {
        const legacyPointTable = legacyCornerPointTables[cornerIndex] as unknown as PointTable
        interpolatedX += resolvedCornerWeights[cornerIndex]! * legacyPointTable[sourceOffset]!
        interpolatedY += resolvedCornerWeights[cornerIndex]! * legacyPointTable[sourceYOffset]!
      }
      sourceOffset += 2
      outputPoints[outputOffset] = interpolatedX
      outputPoints[outputOffset + 1] = interpolatedY
      outputOffset += tupleStride
    }
  }

  /**
   * Interpolates SDK2 draw-order integer values through the current parameter binding set.
   * @param modelContext Runtime model context that owns reusable scratch buffers.
   * @param paramBindingSet Parameter bindings that map current parameter values to corners.
   * @param dirtyFlagRef Single-item dirty flag reference mutated by the binding set.
   * @param sourceValues Scalar values indexed by interpolation corner.
   * @returns Interpolated draw-order integer.
   */
  Interpolation.interpolateInteger = function <
    TModelContext extends Cubism2InterpolationModelContextLike,
  >(
    modelContext: TModelContext,
    paramBindingSet: Cubism2InterpolationParamBindingSetLike<TModelContext>,
    dirtyFlagRef: boolean[],
    sourceValues: ArrayLike<number> | null,
  ): number {
    const { cornerIndexes, cornerWeights, dimensionCount } = resolveInterpolationState(
      modelContext,
      paramBindingSet,
      dirtyFlagRef,
    )
    const values = sourceValues!
    if (dimensionCount <= 0) {
      return values[cornerIndexes[0]!]!
    }
    if (dimensionCount == 1) {
      return interpolateIntegerStep(
        values[cornerIndexes[0]!]!,
        values[cornerIndexes[1]!]!,
        cornerWeights[0]!,
      )
    }
    if (dimensionCount == 2) {
      const bottom = interpolateIntegerStep(
        values[cornerIndexes[0]!]!,
        values[cornerIndexes[1]!]!,
        cornerWeights[0]!,
      )
      const top = interpolateIntegerStep(
        values[cornerIndexes[2]!]!,
        values[cornerIndexes[3]!]!,
        cornerWeights[0]!,
      )
      return interpolateIntegerStep(bottom, top, cornerWeights[1]!)
    }
    if (dimensionCount == 3) {
      const x00 = interpolateIntegerStep(
        values[cornerIndexes[0]!]!,
        values[cornerIndexes[1]!]!,
        cornerWeights[0]!,
      )
      const x01 = interpolateIntegerStep(
        values[cornerIndexes[2]!]!,
        values[cornerIndexes[3]!]!,
        cornerWeights[0]!,
      )
      const x10 = interpolateIntegerStep(
        values[cornerIndexes[4]!]!,
        values[cornerIndexes[5]!]!,
        cornerWeights[0]!,
      )
      const x11 = interpolateIntegerStep(
        values[cornerIndexes[6]!]!,
        values[cornerIndexes[7]!]!,
        cornerWeights[0]!,
      )
      const y0 = interpolateIntegerStep(x00, x01, cornerWeights[1]!)
      const y1 = interpolateIntegerStep(x10, x11, cornerWeights[1]!)
      return interpolateIntegerStep(y0, y1, cornerWeights[2]!)
    }
    if (dimensionCount == 4) {
      const x000 = interpolateIntegerStep(
        values[cornerIndexes[0]!]!,
        values[cornerIndexes[1]!]!,
        cornerWeights[0]!,
      )
      const x001 = interpolateIntegerStep(
        values[cornerIndexes[2]!]!,
        values[cornerIndexes[3]!]!,
        cornerWeights[0]!,
      )
      const x010 = interpolateIntegerStep(
        values[cornerIndexes[4]!]!,
        values[cornerIndexes[5]!]!,
        cornerWeights[0]!,
      )
      const x011 = interpolateIntegerStep(
        values[cornerIndexes[6]!]!,
        values[cornerIndexes[7]!]!,
        cornerWeights[0]!,
      )
      const x100 = interpolateIntegerStep(
        values[cornerIndexes[8]!]!,
        values[cornerIndexes[9]!]!,
        cornerWeights[0]!,
      )
      const x101 = interpolateIntegerStep(
        values[cornerIndexes[10]!]!,
        values[cornerIndexes[11]!]!,
        cornerWeights[0]!,
      )
      const x110 = interpolateIntegerStep(
        values[cornerIndexes[12]!]!,
        values[cornerIndexes[13]!]!,
        cornerWeights[0]!,
      )
      const x111 = interpolateIntegerStep(
        values[cornerIndexes[14]!]!,
        values[cornerIndexes[15]!]!,
        cornerWeights[0]!,
      )
      const y00 = interpolateIntegerStep(x000, x001, cornerWeights[1]!)
      const y01 = interpolateIntegerStep(x010, x011, cornerWeights[1]!)
      const y10 = interpolateIntegerStep(x100, x101, cornerWeights[1]!)
      const y11 = interpolateIntegerStep(x110, x111, cornerWeights[1]!)
      const z0 = interpolateIntegerStep(y00, y01, cornerWeights[2]!)
      const z1 = interpolateIntegerStep(y10, y11, cornerWeights[2]!)
      return interpolateIntegerStep(z0, z1, cornerWeights[3]!)
    }
    return interpolateHighDimensionalScalar(
      dimensionCount,
      cornerIndexes,
      cornerWeights,
      values,
      true,
    )
  }

  /**
   * Interpolates SDK2 scalar float values through the current parameter binding set.
   * @param modelContext Runtime model context that owns reusable scratch buffers.
   * @param paramBindingSet Parameter bindings that map current parameter values to corners.
   * @param dirtyFlagRef Single-item dirty flag reference mutated by the binding set.
   * @param sourceValues Scalar values indexed by interpolation corner.
   * @returns Interpolated scalar float.
   */
  Interpolation.interpolateFloat = function <
    TModelContext extends Cubism2InterpolationModelContextLike,
  >(
    modelContext: TModelContext,
    paramBindingSet: Cubism2InterpolationParamBindingSetLike<TModelContext>,
    dirtyFlagRef: boolean[],
    sourceValues: ArrayLike<number> | null,
  ): number {
    const { cornerIndexes, cornerWeights, dimensionCount } = resolveInterpolationState(
      modelContext,
      paramBindingSet,
      dirtyFlagRef,
    )
    const values = sourceValues!
    if (dimensionCount <= 0) {
      return values[cornerIndexes[0]!]!
    }
    if (dimensionCount == 1) {
      const start = values[cornerIndexes[0]!]!
      const end = values[cornerIndexes[1]!]!
      const weightX = cornerWeights[0]!
      return start + (end - start) * weightX
    }
    if (dimensionCount == 2) {
      const bottomStart = values[cornerIndexes[0]!]!
      const bottomEnd = values[cornerIndexes[1]!]!
      const topStart = values[cornerIndexes[2]!]!
      const topEnd = values[cornerIndexes[3]!]!
      const weightX = cornerWeights[0]!
      const weightY = cornerWeights[1]!
      return (
        (1 - weightY) * (bottomStart + (bottomEnd - bottomStart) * weightX) +
        weightY * (topStart + (topEnd - topStart) * weightX)
      )
    }
    if (dimensionCount == 3) {
      return interpolateLegacyThreeDimensionalFloat(cornerIndexes, cornerWeights, values, 0)
    }
    if (dimensionCount == 4) {
      const weightW = cornerWeights[3]!
      return (
        (1 - weightW) *
          interpolateLegacyThreeDimensionalFloat(cornerIndexes, cornerWeights, values, 0) +
        weightW * interpolateLegacyThreeDimensionalFloat(cornerIndexes, cornerWeights, values, 8)
      )
    }
    return interpolateHighDimensionalScalar(
      dimensionCount,
      cornerIndexes,
      cornerWeights,
      values,
      false,
    )
  }

  /**
   * Interpolates one SDK2 three-dimensional scalar block using the original nested order.
   * @param cornerIndexes Source value indexes selected for each corner.
   * @param cornerWeights Per-axis interpolation weights.
   * @param sourceValues Scalar values stored by corner index.
   * @param cornerOffset First corner ordinal for the 3D block inside a larger hypercube.
   * @returns Interpolated scalar float.
   */
  function interpolateLegacyThreeDimensionalFloat(
    cornerIndexes: ArrayLike<number>,
    cornerWeights: ArrayLike<number>,
    sourceValues: ArrayLike<number>,
    cornerOffset: number,
  ): number {
    const weightX = cornerWeights[0]!
    const weightY = cornerWeights[1]!
    const weightZ = cornerWeights[2]!
    const value000 = sourceValues[cornerIndexes[cornerOffset]!]!
    const value001 = sourceValues[cornerIndexes[cornerOffset + 1]!]!
    const value010 = sourceValues[cornerIndexes[cornerOffset + 2]!]!
    const value011 = sourceValues[cornerIndexes[cornerOffset + 3]!]!
    const value100 = sourceValues[cornerIndexes[cornerOffset + 4]!]!
    const value101 = sourceValues[cornerIndexes[cornerOffset + 5]!]!
    const value110 = sourceValues[cornerIndexes[cornerOffset + 6]!]!
    const value111 = sourceValues[cornerIndexes[cornerOffset + 7]!]!
    return (
      (1 - weightZ) *
        ((1 - weightY) * interpolateFloatStep(value000, value001, weightX) +
          weightY * interpolateFloatStep(value010, value011, weightX)) +
      weightZ *
        ((1 - weightY) * interpolateFloatStep(value100, value101, weightX) +
          weightY * interpolateFloatStep(value110, value111, weightX))
    )
  }

  /**
   * Interpolates SDK2 point arrays into the active runtime point buffer.
   * @param modelContext Runtime model context that owns reusable scratch buffers.
   * @param paramBindingSet Parameter bindings that map current parameter values to corners.
   * @param dirtyFlagRef Single-item dirty flag reference mutated by the binding set.
   * @param pointCount Number of x/y tuples to write.
   * @param pointValues Source point tables by corner index.
   * @param outputPoints Output point table receiving interpolated tuples.
   * @param valueOffset Output offset for the first tuple's x value.
   * @param tupleStride Distance between consecutive output tuple starts.
   */
  Interpolation.interpolatePoints = function <
    TModelContext extends Cubism2InterpolationModelContextLike,
  >(
    modelContext: TModelContext,
    paramBindingSet: Cubism2InterpolationParamBindingSetLike<TModelContext>,
    dirtyFlagRef: boolean[],
    pointCount: number,
    pointValues: PointTableList | null,
    outputPoints: MutableNumberArray | null,
    valueOffset: number,
    tupleStride: number,
  ): void {
    const { cornerIndexes, cornerWeights, dimensionCount } = resolveInterpolationState(
      modelContext,
      paramBindingSet,
      dirtyFlagRef,
    )
    const values = pointValues!
    const output = outputPoints!
    const scalarCount = pointCount * 2
    let outputOffset = valueOffset
    if (dimensionCount <= 0) {
      const sourcePoints = values[cornerIndexes[0]!]!
      if (tupleStride == 2 && valueOffset == 0) {
        options.UtSystem.copyArraySegmentForward(sourcePoints, 0, output, 0, scalarCount)
        return
      }
      for (let sourceOffset = 0; sourceOffset < scalarCount; ) {
        output[outputOffset] = sourcePoints[sourceOffset++]!
        output[outputOffset + 1] = sourcePoints[sourceOffset++]!
        outputOffset += tupleStride
      }
      return
    }
    if (dimensionCount <= 4) {
      interpolatePointHypercube(
        dimensionCount,
        cornerIndexes,
        cornerWeights,
        pointCount,
        values,
        output,
        valueOffset,
        tupleStride,
      )
      return
    }
    interpolateHighDimensionalPointsLegacy(
      dimensionCount,
      cornerIndexes,
      cornerWeights,
      pointCount,
      values,
      output,
      valueOffset,
      tupleStride,
    )
  }

  return {
    Cubism2Interpolation: Interpolation,
  }
}
