interface Cubism2UtSystemLike {
  getUserTimeMSec: () => number
}

interface Cubism2AutoEyeBlinkModelLike {
  setParamFloat: (paramId: unknown, value: number) => void
}

export const AutoEyeBlinkState = {
  Closed: 'STATE_CLOSED',
  Closing: 'STATE_CLOSING',
  First: 'STATE_FIRST',
  Interval: 'STATE_INTERVAL',
  Opening: 'STATE_OPENING',
} as const

export type AutoEyeBlinkStateValue = (typeof AutoEyeBlinkState)[keyof typeof AutoEyeBlinkState]

export interface Cubism2AutoEyeBlinkInstance {
  blinkIntervalMillis: number | null
  closedMillis: number | null
  closingMillis: number | null
  currentState: AutoEyeBlinkStateValue | null
  isEyeOpenPositive: boolean | null
  leftEyeParamId: string | null
  nextBlinkMillis: number | null
  openingMillis: number | null
  rightEyeParamId: string | null
  scheduleNextBlinkMillis: () => number
  setBlinkIntervalMillis: (blinkIntervalMillis: number) => void
  setBlinkMotionMillis: (closingMillis: number, closedMillis: number, openingMillis: number) => void
  stateStartMillis: number | null
  updateBlinkParameters: (model: Cubism2AutoEyeBlinkModelLike) => void
}

export type Cubism2AutoEyeBlinkConstructor = {
  new (): Cubism2AutoEyeBlinkInstance
  prototype: Cubism2AutoEyeBlinkInstance
}

export interface CreateCubism2AutoEyeBlinkOptions {
  UtSystem: Cubism2UtSystemLike
  isBootstrapping: () => boolean
  random?: () => number
}

export interface Cubism2AutoEyeBlinkConstructors {
  AutoEyeBlinkState: typeof AutoEyeBlinkState
  Cubism2AutoEyeBlink: Cubism2AutoEyeBlinkConstructor
}

/**
 * Creates the Cubism2 SDK2 automatic eye-blink constructor recovered from `ar/az` in min.js.
 * @param options Runtime clock, bootstrapping guard, and optional legacy random source.
 * @returns Auto-eye-blink constructor plus restored state constants.
 */
export function createCubism2AutoEyeBlink(
  options: CreateCubism2AutoEyeBlinkOptions,
): Cubism2AutoEyeBlinkConstructors {
  const readRandomUnit = options.random ?? Math.random

  /**
   * Cubism2 automatic eye-blink state machine that writes both eye-open parameters.
   */
  function Cubism2AutoEyeBlink(this: Cubism2AutoEyeBlinkInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.nextBlinkMillis = null
    this.stateStartMillis = null
    this.currentState = null
    this.isEyeOpenPositive = null
    this.leftEyeParamId = null
    this.rightEyeParamId = null
    this.blinkIntervalMillis = null
    this.closingMillis = null
    this.closedMillis = null
    this.openingMillis = null
    this.currentState = AutoEyeBlinkState.First
    this.blinkIntervalMillis = 4000
    this.closingMillis = 100
    this.closedMillis = 50
    this.openingMillis = 150
    this.isEyeOpenPositive = true
    this.leftEyeParamId = 'PARAM_EYE_L_OPEN'
    this.rightEyeParamId = 'PARAM_EYE_R_OPEN'
  }

  const AutoEyeBlink = Cubism2AutoEyeBlink as unknown as Cubism2AutoEyeBlinkConstructor

  /**
   * Computes the next blink timestamp using the original random interval formula.
   * @returns Absolute user-time timestamp in milliseconds for the next blink.
   */
  AutoEyeBlink.prototype.scheduleNextBlinkMillis = function (): number {
    const currentUserTimeMillis = options.UtSystem.getUserTimeMSec()
    const randomUnit = readRandomUnit()
    return currentUserTimeMillis + randomUnit * (2 * Number(this.blinkIntervalMillis) - 1)
  }

  /**
   * Sets the random blink interval window used when scheduling the next blink.
   * @param blinkIntervalMillis Base interval in milliseconds from the model settings.
   */
  AutoEyeBlink.prototype.setBlinkIntervalMillis = function (blinkIntervalMillis: number): void {
    this.blinkIntervalMillis = blinkIntervalMillis
  }

  /**
   * Sets close, hold-closed, and open durations for one blink cycle.
   * @param closingMillis Duration used to move eyes from open to closed.
   * @param closedMillis Duration to keep eyes fully closed.
   * @param openingMillis Duration used to move eyes from closed back to open.
   */
  AutoEyeBlink.prototype.setBlinkMotionMillis = function (
    closingMillis: number,
    closedMillis: number,
    openingMillis: number,
  ): void {
    this.closingMillis = closingMillis
    this.closedMillis = closedMillis
    this.openingMillis = openingMillis
  }

  /**
   * Advances the blink state machine and writes the resulting eye-open values to the model.
   * @param model Live2D model facade that accepts parameter updates by Cubism parameter ID.
   */
  AutoEyeBlink.prototype.updateBlinkParameters = function (
    model: Cubism2AutoEyeBlinkModelLike,
  ): void {
    const currentUserTimeMillis = options.UtSystem.getUserTimeMSec()
    let eyeOpenValue: number
    let phaseProgress = 0

    switch (this.currentState) {
      case AutoEyeBlinkState.Closing:
        phaseProgress =
          (currentUserTimeMillis - Number(this.stateStartMillis)) / Number(this.closingMillis)
        if (phaseProgress >= 1) {
          phaseProgress = 1
          this.currentState = AutoEyeBlinkState.Closed
          this.stateStartMillis = currentUserTimeMillis
        }
        eyeOpenValue = 1 - phaseProgress
        break
      case AutoEyeBlinkState.Closed:
        phaseProgress =
          (currentUserTimeMillis - Number(this.stateStartMillis)) / Number(this.closedMillis)
        if (phaseProgress >= 1) {
          this.currentState = AutoEyeBlinkState.Opening
          this.stateStartMillis = currentUserTimeMillis
        }
        eyeOpenValue = 0
        break
      case AutoEyeBlinkState.Opening:
        phaseProgress =
          (currentUserTimeMillis - Number(this.stateStartMillis)) / Number(this.openingMillis)
        if (phaseProgress >= 1) {
          phaseProgress = 1
          this.currentState = AutoEyeBlinkState.Interval
          this.nextBlinkMillis = this.scheduleNextBlinkMillis()
        }
        eyeOpenValue = phaseProgress
        break
      case AutoEyeBlinkState.Interval:
        if (Number(this.nextBlinkMillis) < currentUserTimeMillis) {
          this.currentState = AutoEyeBlinkState.Closing
          this.stateStartMillis = currentUserTimeMillis
        }
        eyeOpenValue = 1
        break
      case AutoEyeBlinkState.First:
      default:
        this.currentState = AutoEyeBlinkState.Interval
        this.nextBlinkMillis = this.scheduleNextBlinkMillis()
        eyeOpenValue = 1
        break
    }

    if (!this.isEyeOpenPositive) {
      eyeOpenValue = -eyeOpenValue
    }

    model.setParamFloat(this.leftEyeParamId, eyeOpenValue)
    model.setParamFloat(this.rightEyeParamId, eyeOpenValue)
  }

  return {
    AutoEyeBlinkState,
    Cubism2AutoEyeBlink: AutoEyeBlink,
  }
}
