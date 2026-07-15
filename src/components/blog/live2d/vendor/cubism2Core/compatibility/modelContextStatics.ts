export interface Cubism2ModelContextStaticState {
  cleanParamFlag: boolean
  dirtyParamFlag: boolean
  emptyDrawOrderIndex: number
  endOfDrawOrderIndex: number
  fallbackParamMaxValue: number
  fallbackParamMinValue: number
  initialParamCapacity: number
  nextInstanceId: number
  reportUpdateErrors: boolean
  traceUpdatePhases: boolean
}

/**
 * Initializes the ModelContext static constants used by model updates.
 * @param target ModelContext constructor receiving source-compatible static state.
 */
export function initializeCubism2ModelContextStaticState(
  target: Cubism2ModelContextStaticState,
): void {
  target.nextInstanceId = 0
  target.reportUpdateErrors = true
  target.emptyDrawOrderIndex = -1
  target.endOfDrawOrderIndex = -1
  target.cleanParamFlag = false
  target.dirtyParamFlag = true
  target.fallbackParamMinValue = -1000000
  target.fallbackParamMaxValue = 1000000
  target.initialParamCapacity = 32
  target.traceUpdatePhases = false
}

/**
 * Allocates the next ModelContext instance ID from the shared monotonic counter.
 * @param target ModelContext constructor that stores the shared instance-id counter.
 * @returns Instance id that should be assigned to the newly created context.
 */
export function allocateCubism2ModelContextInstanceId(
  target: Cubism2ModelContextStaticState,
): number {
  return target.nextInstanceId++
}
