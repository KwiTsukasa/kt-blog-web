import type { Cubism2MathStatic } from './math'

interface Cubism2UtSystemLike {
  getUserTimeMSec: () => number
}

interface Cubism2UtDebugLike {
  logDebug: (message: string, ...args: unknown[]) => void
  logWithLegacyPrefix: (message: string, ...args: unknown[]) => void
}

export interface Cubism2MotionModelContextLike {
  getParamFloat: (paramIndex: number) => number
  getParamMax: (paramIndex: number) => number
  getParamMin: (paramIndex: number) => number
}

export interface Cubism2MotionModelLike {
  getModelContext: () => Cubism2MotionModelContextLike
  getParamIndex: (paramId: string) => number
  setParamFloat: (paramId: string, value: number) => void
}

export interface Cubism2MotionQueueEntryInstance {
  endTimeMillis: number
  fadeInStartTimeMillis: number
  getMotionHandle: () => number
  isAvailable: boolean
  isFinished: () => boolean
  isFinishedFlag: boolean
  motion: Cubism2AMotionInstance | null
  motionHandle: number
  scheduleFadeOut: (fadeOutMillis: number) => void
  startTimeMillis: number
}

type Cubism2AMotionStateValue = number | null | undefined

export interface Cubism2AMotionInstance {
  fadeInMillis: Cubism2AMotionStateValue
  fadeOutMillis: Cubism2AMotionStateValue
  getWeight: () => Cubism2AMotionStateValue
  getFadeOutMillis: () => Cubism2AMotionStateValue
  initializeMotionHook: () => void
  motionWeight: Cubism2AMotionStateValue
  setWeight: (weight: number) => void
  getDurationMSec: () => number
  getFadeOut: () => Cubism2AMotionStateValue
  getLoopDurationMSec: () => number
  setFadeIn: (fadeInMillis: number) => void
  setFadeOut: (fadeOutMillis: number) => void
  updateParam: (model: Cubism2MotionModelLike, motionQueueEntry: Cubism2MotionQueueEntryInstance) => void
  updateParamExe: (
    model: Cubism2MotionModelLike,
    userTimeMillis: number,
    blendedWeight: number,
    motionQueueEntry: Cubism2MotionQueueEntryInstance,
  ) => void
}

export interface Cubism2MotionQueueManagerInstance {
  dumpMotionQueue: () => void
  getMotionQueueEntries: () => Cubism2MotionQueueEntryInstance[]
  isFinished: (motionHandle?: number) => boolean
  motions: Cubism2MotionQueueEntryInstance[]
  setVerboseLoggingEnabled: (enabled: boolean) => void
  startMotion: (motion: Cubism2AMotionInstance | null, priority?: number) => number
  stopAllMotions: () => void
  updateParam: (model: Cubism2MotionModelLike) => boolean
  verboseLoggingEnabled: boolean
}

export type Cubism2AMotionConstructor = {
  new (): Cubism2AMotionInstance
  calculateLegacyCurveWeight: (
    elapsedMillis: number,
    durationMillis: number,
    curvePositionMillis: number,
  ) => number
  prototype: Cubism2AMotionInstance
}

export type Cubism2MotionQueueEntryConstructor = {
  new (): Cubism2MotionQueueEntryInstance
  prototype: Cubism2MotionQueueEntryInstance
  nextMotionHandle: number
}

export type Cubism2MotionQueueManagerConstructor = {
  new (): Cubism2MotionQueueManagerInstance
  prototype: Cubism2MotionQueueManagerInstance
}

export interface CreateCubism2MotionBaseOptions {
  Cubism2Math: Cubism2MathStatic
  UtDebug: Cubism2UtDebugLike
  UtSystem: Cubism2UtSystemLike
  isBootstrapping: () => boolean
}

export interface Cubism2MotionBaseConstructors {
  AMotion: Cubism2AMotionConstructor
  Cubism2MotionQueueEntry: Cubism2MotionQueueEntryConstructor
  MotionQueueManager: Cubism2MotionQueueManagerConstructor
}

/**
 * Creates the Cubism2 base motion and queue constructors used by MTN motion playback.
 * @param options Runtime dependencies that keep the min.js-derived constructors isolated from globals.
 * @returns Base motion, motion queue manager, and queue entry constructors.
 */
export function createCubism2MotionBase(
  options: CreateCubism2MotionBaseOptions,
): Cubism2MotionBaseConstructors {
  /**
   * Applies the sine easing curve used by min.js for fade-in and fade-out weights.
   * @param normalizedTime Elapsed fraction in the `[0, 1]` range before clamping.
   * @returns Sine-smoothed value clamped to `[0, 1]`.
   */
  function easeSine(normalizedTime: number): number {
    if (normalizedTime < 0) {
      return 0
    }
    if (normalizedTime > 1) {
      return 1
    }
    return 0.5 - 0.5 * Math.cos(normalizedTime * options.Cubism2Math.PI)
  }

  /**
   * Base Cubism2 motion type that applies fade and weight before delegating model updates.
   */
  function AMotion(this: Cubism2AMotionInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.fadeInMillis = 1000
    this.fadeOutMillis = 1000
    this.motionWeight = 1
    this.initializeMotionHook()
  }

  const BaseMotion = AMotion as unknown as Cubism2AMotionConstructor

  /**
   * Computes the legacy cubic-style weight helper exposed by AMotion.
   * @param elapsedMillis Elapsed time inside the curve.
   * @param durationMillis Total curve duration.
   * @param curvePositionMillis Curve position value used by the original helper.
   * @returns Normalized curve weight in the `[0, 1]` range.
   */
  BaseMotion.calculateLegacyCurveWeight = function (
    elapsedMillis: number,
    durationMillis: number,
    curvePositionMillis: number,
  ): number {
    var elapsedRatio = elapsedMillis / durationMillis
    var curveRatio = curvePositionMillis / durationMillis
    var mirroredCurveRatio = curveRatio
    var firstControlWeight = 1 / 3
    var secondControlWeight = 2 / 3
    var firstControlEase = 1 - (1 - curveRatio) * (1 - curveRatio)
    var secondControlEase = 1 - (1 - mirroredCurveRatio) * (1 - mirroredCurveRatio)
    var startValue = 0
    var firstControlValue =
      (1 - curveRatio) * firstControlWeight * firstControlEase +
      (mirroredCurveRatio * secondControlWeight +
        (1 - mirroredCurveRatio) * firstControlWeight) *
        (1 - firstControlEase)
    var secondControlValue =
      (mirroredCurveRatio + (1 - mirroredCurveRatio) * secondControlWeight) * secondControlEase +
      (curveRatio * firstControlWeight + (1 - curveRatio) * secondControlWeight) *
        (1 - secondControlEase)
    var endValue = 1
    var cubicA = endValue - 3 * secondControlValue + 3 * firstControlValue - startValue
    var cubicB = 3 * secondControlValue - 6 * firstControlValue + 3 * startValue
    var cubicC = 3 * firstControlValue - 3 * startValue
    var cubicD = startValue

    if (elapsedRatio <= 0) {
      return 0
    }
    if (elapsedRatio >= 1) {
      return 1
    }

    var interpolationParameter = elapsedRatio
    var parameterSquared = interpolationParameter * interpolationParameter
    var parameterCubed = interpolationParameter * parameterSquared
    return (
      cubicA * parameterCubed +
      cubicB * parameterSquared +
      cubicC * interpolationParameter +
      cubicD
    )
  }

  /**
   * Legacy hook invoked by the AMotion constructor; subclasses may override it.
   */
  BaseMotion.prototype.initializeMotionHook = function (): void {}

  /**
   * Sets the fade-in duration used to ramp motion weight from zero.
   * @param fadeInMillis Fade-in duration in milliseconds.
   */
  BaseMotion.prototype.setFadeIn = function (fadeInMillis: number): void {
    this.fadeInMillis = fadeInMillis
  }

  /**
   * Sets the fade-out duration used when the queue schedules this motion to end.
   * @param fadeOutMillis Fade-out duration in milliseconds.
   */
  BaseMotion.prototype.setFadeOut = function (fadeOutMillis: number): void {
    this.fadeOutMillis = fadeOutMillis
  }

  /**
   * Sets the base motion weight before fade-in and fade-out multipliers are applied.
   * @param weight Base motion weight used by `updateParam`.
   */
  BaseMotion.prototype.setWeight = function (weight: number): void {
    this.motionWeight = weight
  }

  /**
   * Reads the configured fade-out duration.
   * @returns Fade-out duration in milliseconds.
   */
  BaseMotion.prototype.getFadeOut = function (): Cubism2AMotionStateValue {
    return this.fadeOutMillis
  }

  /**
   * Reads the configured fade-out duration through the distinct millisecond getter.
   * @returns Fade-out duration in milliseconds.
   */
  BaseMotion.prototype.getFadeOutMillis = function (): Cubism2AMotionStateValue {
    return this.fadeOutMillis
  }

  /**
   * Reads the base motion weight before fade multipliers.
   * @returns Base motion weight.
   */
  BaseMotion.prototype.getWeight = function (): Cubism2AMotionStateValue {
    return this.motionWeight
  }

  /**
   * Reads the motion duration; base motions are unbounded until subclasses override this method.
   * @returns `-1` to indicate an unbounded base motion.
   */
  BaseMotion.prototype.getDurationMSec = function (): number {
    return -1
  }

  /**
   * Reads the loop duration; base motions are unbounded until subclasses override this method.
   * @returns `-1` to indicate an unbounded base motion.
   */
  BaseMotion.prototype.getLoopDurationMSec = function (): number {
    return -1
  }

  /**
   * Applies one motion update after computing fade-in, fade-out, and base weight.
   * @param model Model object receiving motion parameter updates.
   * @param motionQueueEntry Queue entry carrying timing and finish state for this motion.
   */
  BaseMotion.prototype.updateParam = function (
    model: Cubism2MotionModelLike,
    motionQueueEntry: Cubism2MotionQueueEntryInstance,
  ): void {
    if (!motionQueueEntry.isAvailable || motionQueueEntry.isFinishedFlag) {
      return
    }

    var userTimeMillis = options.UtSystem.getUserTimeMSec()
    if (motionQueueEntry.startTimeMillis < 0) {
      motionQueueEntry.startTimeMillis = userTimeMillis
      motionQueueEntry.fadeInStartTimeMillis = userTimeMillis
      var durationMillis = this.getDurationMSec()
      if (motionQueueEntry.endTimeMillis < 0) {
        motionQueueEntry.endTimeMillis =
          durationMillis <= 0 ? -1 : motionQueueEntry.startTimeMillis + durationMillis
      }
    }

    var blendedWeight = this.motionWeight as number
    // Keep source loose equality/coercion: motion timing fields may be nullish at runtime.
    var fadeInWeight =
      this.fadeInMillis == 0
        ? 1
        : easeSine((userTimeMillis - motionQueueEntry.fadeInStartTimeMillis) / (this.fadeInMillis as number))
    var fadeOutWeight =
      this.fadeOutMillis == 0 || motionQueueEntry.endTimeMillis < 0
        ? 1
        : easeSine((motionQueueEntry.endTimeMillis - userTimeMillis) / (this.fadeOutMillis as number))

    blendedWeight = blendedWeight * fadeInWeight * fadeOutWeight
    if (!(0 <= blendedWeight && blendedWeight <= 1)) {
      console.log('### assert!! ### ')
    }
    this.updateParamExe(model, userTimeMillis, blendedWeight, motionQueueEntry)
    if (motionQueueEntry.endTimeMillis > 0 && motionQueueEntry.endTimeMillis < userTimeMillis) {
      motionQueueEntry.isFinishedFlag = true
    }
  }

  /**
   * Subclass hook that applies weighted motion values to the model.
   * @param model Model object receiving parameter updates.
   * @param userTimeMillis Current user-time timestamp in milliseconds.
   * @param blendedWeight Fade-adjusted motion weight.
   * @param motionQueueEntry Queue entry that owns timing and finish state.
   */
  BaseMotion.prototype.updateParamExe = function (
    model: Cubism2MotionModelLike,
    userTimeMillis: number,
    blendedWeight: number,
    motionQueueEntry: Cubism2MotionQueueEntryInstance,
  ): void {
    void model
    void userTimeMillis
    void blendedWeight
    void motionQueueEntry
  }

  /**
   * Queue manager that owns active Cubism2 motion entries.
   */
  function MotionQueueManager(this: Cubism2MotionQueueManagerInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.motions = null as unknown as Cubism2MotionQueueEntryInstance[]
    this.verboseLoggingEnabled = false
    this.motions = new Array()
  }

  const QueueManager = MotionQueueManager as unknown as Cubism2MotionQueueManagerConstructor

  /**
   * Reads the backing queue for tests and legacy diagnostics.
   * @returns Mutable motion queue entry list.
   */
  QueueManager.prototype.getMotionQueueEntries = function (): Cubism2MotionQueueEntryInstance[] {
    return this.motions
  }

  /**
   * Starts a new motion and schedules existing motions to fade out.
   * @param motion Motion object to enqueue; null keeps legacy `-1` result behavior.
   * @param priority Legacy priority argument accepted but unused by this SDK2 queue.
   * @returns Motion handle assigned to the new queue entry, or `-1` when motion is null.
   */
  QueueManager.prototype.startMotion = function (
    motion: Cubism2AMotionInstance | null,
    priority?: number,
  ): number {
    void priority
    var previousMotionCount = this.motions.length
    for (var motionIndex = 0; motionIndex < previousMotionCount; ++motionIndex) {
      var existingEntry = this.motions[motionIndex]
      if (existingEntry == null) {
        continue
      }
      existingEntry.scheduleFadeOut(existingEntry.motion!.getFadeOut() as number)
      if (this.verboseLoggingEnabled) {
        options.UtDebug.logDebug(
          'MotionQueueManager[size:%2d]->startMotion() / start fade-out (m%d)\n',
          previousMotionCount,
          existingEntry.motionHandle,
        )
      }
    }

    if (motion == null) {
      return -1
    }

    var newEntry = new MotionQueueEntry()
    newEntry.motion = motion
    this.motions.push(newEntry)
    var motionHandle = newEntry.motionHandle
    if (this.verboseLoggingEnabled) {
      options.UtDebug.logDebug(
        'MotionQueueManager[size:%2d]->startMotion() / new motion (m%d)\n',
        previousMotionCount,
        motionHandle,
      )
    }
    return motionHandle
  }

  /**
   * Updates every active motion and removes completed or invalid queue entries.
   * @param model Model object passed to each motion update.
   * @returns True when at least one motion was updated or an exception was handled.
   */
  QueueManager.prototype.updateParam = function (model: Cubism2MotionModelLike): boolean {
    try {
      var didUpdateMotion = false
      for (var motionIndex = 0; motionIndex < this.motions.length; motionIndex++) {
        var queueEntry = this.motions[motionIndex]
        if (queueEntry == null) {
          this.motions.splice(motionIndex, 1)
          motionIndex--
          continue
        }
        var motion = queueEntry.motion
        if (motion == null) {
          this.motions = this.motions.splice(motionIndex, 1)
          motionIndex--
          continue
        }
        motion.updateParam(model, queueEntry)
        didUpdateMotion = true
        if (queueEntry.isFinished()) {
          if (this.verboseLoggingEnabled) {
            options.UtDebug.logDebug(
              'MotionQueueManager[size:%2d]->updateParam() / remove motion (m%d)\n',
              this.motions.length - 1,
              queueEntry.motionHandle,
            )
          }
          this.motions.splice(motionIndex, 1)
          motionIndex--
        }
      }
      return didUpdateMotion
    } catch (error) {
      options.UtDebug.logWithLegacyPrefix(error as string)
      return true
    }
  }

  /**
   * Checks whether all motions, or one motion handle, have finished.
   * @param motionHandle Optional handle returned by `startMotion`.
   * @returns True when the requested motion scope has no unfinished entries.
   */
  QueueManager.prototype.isFinished = function (motionHandle?: number): boolean {
    if (arguments.length >= 1) {
      for (var motionIndex = 0; motionIndex < this.motions.length; motionIndex++) {
        var queueEntry = this.motions[motionIndex]
        if (queueEntry == null) {
          continue
        }
        if (queueEntry.motionHandle == motionHandle && !queueEntry.isFinished()) {
          return false
        }
      }
      return true
    }

    for (var motionIndex = 0; motionIndex < this.motions.length; motionIndex++) {
      var queueEntry = this.motions[motionIndex]
      if (queueEntry == null) {
        this.motions.splice(motionIndex, 1)
        motionIndex--
        continue
      }
      var motion = queueEntry.motion
      if (motion == null) {
        this.motions.splice(motionIndex, 1)
        motionIndex--
        continue
      }
      if (!queueEntry.isFinished()) {
        return false
      }
    }
    return true
  }

  /**
   * Removes every active motion entry from the queue.
   */
  QueueManager.prototype.stopAllMotions = function (): void {
    for (var motionIndex = 0; motionIndex < this.motions.length; motionIndex++) {
      var queueEntry = this.motions[motionIndex]
      if (queueEntry == null) {
        this.motions.splice(motionIndex, 1)
        motionIndex--
        continue
      }
      var motion = queueEntry.motion
      if (motion == null) {
        this.motions.splice(motionIndex, 1)
        motionIndex--
        continue
      }
      this.motions.splice(motionIndex, 1)
      motionIndex--
    }
  }

  /**
   * Enables or disables legacy verbose queue logging.
   * @param enabled True to emit queue debug messages.
   */
  QueueManager.prototype.setVerboseLoggingEnabled = function (enabled: boolean): void {
    this.verboseLoggingEnabled = enabled
  }

  /**
   * Dumps the active motion queue to the console using the original debug shape.
   */
  QueueManager.prototype.dumpMotionQueue = function (): void {
    console.log('-- motion queue --\n')
    for (var motionIndex = 0; motionIndex < this.motions.length; motionIndex++) {
      var queueEntry = this.motions[motionIndex]!
      var motion = queueEntry.motion
      console.log('MotionQueueEnt[%d] :: %s\n', this.motions.length, motion!.toString())
    }
  }

  /**
   * One active motion queue entry with timing and fade-out state.
   */
  function Cubism2MotionQueueEntry(this: Cubism2MotionQueueEntryInstance): void {
    this.motion = null
    this.isAvailable = true
    this.isFinishedFlag = false
    this.startTimeMillis = -1
    this.fadeInStartTimeMillis = -1
    this.endTimeMillis = -1
    this.motionHandle = MotionQueueEntry.nextMotionHandle++
  }

  const MotionQueueEntry =
    Cubism2MotionQueueEntry as unknown as Cubism2MotionQueueEntryConstructor
  MotionQueueEntry.nextMotionHandle = 0

  /**
   * Reads whether this queue entry has finished.
   * @returns True when the entry is marked finished.
   */
  MotionQueueEntry.prototype.isFinished = function (): boolean {
    return this.isFinishedFlag
  }

  /**
   * Schedules this entry to fade out no later than the supplied fade duration.
   * @param fadeOutMillis Fade-out duration in milliseconds from current user time.
   */
  MotionQueueEntry.prototype.scheduleFadeOut = function scheduleFadeOut(
    this: Cubism2MotionQueueEntryInstance,
    fadeOutMillis: number,
  ): void {
    var userTimeMillis = options.UtSystem.getUserTimeMSec()
    var scheduledEndTime = userTimeMillis + fadeOutMillis
    if (this.endTimeMillis < 0 || scheduledEndTime < this.endTimeMillis) {
      this.endTimeMillis = scheduledEndTime
    }
  }

  /**
   * Reads this entry's stable motion handle.
   * @returns Motion handle assigned when the queue entry was created.
   */
  MotionQueueEntry.prototype.getMotionHandle = function (): number {
    return this.motionHandle
  }

  return {
    AMotion: BaseMotion,
    Cubism2MotionQueueEntry: MotionQueueEntry,
    MotionQueueManager: QueueManager,
  }
}
