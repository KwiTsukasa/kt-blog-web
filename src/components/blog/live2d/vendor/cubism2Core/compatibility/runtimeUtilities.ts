export interface Cubism2DebugTimerRecordInstance {
  startedAtMillis: number | null
  timerName: string | number | null
}

export interface Cubism2UtDebugStatic {
  debugLevel: number
  dump: (timerName: string | number) => number
  dumpArrayValues: (label: string, values: ArrayLike<unknown>, suffix: string) => void
  dumpHexBytes: (bytes: ArrayLike<number>, byteLength: number) => void
  end: (timerName: string | number) => number
  logDebug: (message: unknown, payload?: unknown, ...ignored: unknown[]) => void
  logDebugWithBlankLine: (message: unknown, payload?: unknown, ...ignored: unknown[]) => void
  logException: (error: { stack?: unknown } | unknown) => void
  logWithLegacyPrefix: (message: unknown, ...args: unknown[]) => void
  start: (timerName: string | number) => void
  timerRecords: Record<string | number, Cubism2DebugTimerRecordInstance>
}

export interface Cubism2UtSystemStatic {
  NO_USER_TIME_SENTINEL: number
  alwaysTrueQuery: () => boolean
  busyWaitWithBareClockLookup: (busyWaitMillis: number) => void
  copyArraySegmentForward: <T>(
    sourceValues: ArrayLike<T>,
    sourceOffset: number,
    targetValues: { [index: number]: T },
    targetOffset: number,
    copyLength: number,
  ) => void
  getSystemTimeMSec: () => number
  getTimeMSec: () => number
  getUserTimeMSec: () => number
  emptyOneArgumentHook: (value: unknown) => void
  setUserTimeMSec: (userTimeMillis: number) => void
  updateUserTimeMSec: () => number
  userTimeMillis: number
}

export interface CreateCubism2RuntimeUtilitiesOptions {
  logger?: Pick<Console, 'log'>
  now?: () => number
}

export interface Cubism2RuntimeUtilities {
  UtDebug: Cubism2UtDebugStatic
  UtSystem: Cubism2UtSystemStatic
}

type Cubism2DebugTimerRecordConstructor = new () => Cubism2DebugTimerRecordInstance

/**
 * Creates Cubism2 SDK2 debug and system utility singletons without relying on global variables.
 * @param options Optional clock and logger used by tests and by the legacy runtime diagnostics.
 * @returns Runtime utility constructors/statics used by the min.js-derived compatibility capsule.
 */
export function createCubism2RuntimeUtilities(
  options: CreateCubism2RuntimeUtilitiesOptions = {},
): Cubism2RuntimeUtilities {
  const logger = options.logger ?? console
  const now = options.now ?? (() => new Date().getTime())

  /**
   * Records one named debug timer start so the legacy `UtDebug` API can compute elapsed time.
   */
  function DebugTimerRecord(this: Cubism2DebugTimerRecordInstance): void {
    this.timerName = null
    this.startedAtMillis = null
  }

  const TimerRecord = DebugTimerRecord as unknown as Cubism2DebugTimerRecordConstructor

  /**
   * Static Cubism2 debug helper namespace from SDK2.
   */
  function UtDebug(): void {}

  const DebugRuntime = UtDebug as unknown as Cubism2UtDebugStatic
  DebugRuntime.debugLevel = 0
  DebugRuntime.timerRecords = new Object() as Record<
    string | number,
    Cubism2DebugTimerRecordInstance
  >

  /**
   * Static Cubism2 system helper namespace from SDK2.
   */
  function UtSystem(): void {}

  const SystemRuntime = UtSystem as unknown as Cubism2UtSystemStatic
  SystemRuntime.NO_USER_TIME_SENTINEL = 0
  SystemRuntime.userTimeMillis = SystemRuntime.NO_USER_TIME_SENTINEL

  /**
   * Reads the current runtime clock used by both system and debug helpers.
   * @returns Current timestamp in milliseconds.
   */
  function readCurrentTimeMillis(): number {
    return now()
  }

  /**
   * Copies a contiguous region from one array-like object to another.
   * @param sourceValues Source array or typed array used by Cubism2 interpolation buffers.
   * @param sourceOffset First source index copied.
   * @param targetValues Mutable destination array or typed array.
   * @param targetOffset First destination index written.
   * @param copyLength Number of values copied.
   */
  function copyArraySegmentForward<T>(
    sourceValues: ArrayLike<T>,
    sourceOffset: number,
    targetValues: { [index: number]: T },
    targetOffset: number,
    copyLength: number,
  ): void {
    for (var valueIndex = 0; valueIndex < copyLength; valueIndex++) {
      targetValues[targetOffset + valueIndex] = sourceValues[sourceOffset + valueIndex] as T
    }
  }

  /**
   * Starts or resets a named debug timer.
   * @param timerName Timer key used by later `dump` or `end` calls.
   */
  DebugRuntime.start = function (timerName: string | number): void {
    var timerRecord = DebugRuntime.timerRecords[timerName]
    if (timerRecord == null) {
      var createdTimerRecord = new TimerRecord()
      createdTimerRecord.timerName = timerName
      DebugRuntime.timerRecords[timerName] = createdTimerRecord
      timerRecord = createdTimerRecord
    }
    timerRecord.startedAtMillis = SystemRuntime.getSystemTimeMSec()
  }

  /**
   * Logs and returns elapsed time for a named debug timer.
   * @param timerName Timer key previously passed to `start`.
   * @returns Elapsed milliseconds, or `-1` when no timer exists.
   */
  DebugRuntime.dump = function (timerName: string | number): number {
    var timerRecord = DebugRuntime.timerRecords[timerName]
    if (timerRecord != null && timerRecord.startedAtMillis != null) {
      var systemTimeMillis = SystemRuntime.getSystemTimeMSec()
      var elapsedMillis = systemTimeMillis - timerRecord.startedAtMillis
      logger.log(timerName + ' : ' + elapsedMillis + 'ms')
      return elapsedMillis
    }
    return -1
  }

  /**
   * Returns elapsed time for a named debug timer without logging it.
   * @param timerName Timer key previously passed to `start`.
   * @returns Elapsed milliseconds, or `-1` when no timer exists.
   */
  DebugRuntime.end = function (timerName: string | number): number {
    var timerRecord = DebugRuntime.timerRecords[timerName]
    if (timerRecord != null && timerRecord.startedAtMillis != null) {
      var systemTimeMillis = SystemRuntime.getSystemTimeMSec()
      return systemTimeMillis - timerRecord.startedAtMillis
    }
    return -1
  }

  /**
   * Emits the original SDK2 info-level debug log shape.
   * @param message Primary log message.
   * @param args Optional console payload.
   */
  DebugRuntime.logWithLegacyPrefix = function (message: unknown, ...args: unknown[]): void {
    logger.log('legacyLog : ' + message + '\n', ...args)
  }

  /**
   * Emits the original SDK2 plain debug log shape.
   * @param message Primary log message.
   * @param payload Second console argument preserved from the two-parameter debug helper.
   * @param ignored Extra call-site arguments accepted for legacy motion calls but intentionally ignored.
   */
  DebugRuntime.logDebug = function (
    message: unknown,
    payload?: unknown,
    ...ignored: unknown[]
  ): void {
    void ignored
    logger.log(message, payload)
  }

  /**
   * Emits a debug log followed by a blank line.
   * @param message Primary log message.
   * @param payload Second console argument preserved from the two-parameter debug helper.
   * @param ignored Extra call-site arguments accepted for compatibility but intentionally ignored.
   */
  DebugRuntime.logDebugWithBlankLine = function (
    message: unknown,
    payload?: unknown,
    ...ignored: unknown[]
  ): void {
    void ignored
    logger.log(message, payload)
    logger.log('\n')
  }

  /**
   * Logs a hexadecimal byte dump with the legacy grouping.
   * @param bytes Byte array or typed array to dump.
   * @param byteLength Number of bytes to read from `bytes`.
   */
  DebugRuntime.dumpHexBytes = function (
    bytes: ArrayLike<number>,
    byteLength: number,
  ): void {
    for (var byteIndex = 0; byteIndex < byteLength; byteIndex++) {
      if (byteIndex % 16 == 0 && byteIndex > 0) {
        logger.log('\n')
      } else if (byteIndex % 8 == 0 && byteIndex > 0) {
        logger.log('  ')
      }
      logger.log('%02X ', (bytes[byteIndex] ?? 0) & 255)
    }
    logger.log('\n')
  }

  /**
   * Logs numeric array contents with the original SDK2 label/suffix format.
   * @param label Header printed before values.
   * @param values Array-like values to print.
   * @param suffix Suffix printed after each value line.
   */
  DebugRuntime.dumpArrayValues = function (
    label: string,
    values: ArrayLike<unknown>,
    suffix: string,
  ): void {
    logger.log('%s\n', label)
    var valueCount = values.length
    for (var valueIndex = 0; valueIndex < valueCount; ++valueIndex) {
      logger.log('%5d', values[valueIndex])
      logger.log('%s\n', suffix)
      logger.log(',')
    }
    logger.log('\n')
  }

  /**
   * Logs an exception and its stack using the original SDK2 dump format.
   * @param error Error-like value thrown by legacy Cubism2 code.
   */
  DebugRuntime.logException = function (error: { stack?: unknown } | unknown): void {
    logger.log('dump exception : ' + error)
    logger.log('stack :: ' + (error as { stack?: unknown }).stack)
  }

  /**
   * Reports whether the browser runtime is active.
   * @returns Always true in the JavaScript SDK2 runtime.
   */
  SystemRuntime.alwaysTrueQuery = function (): boolean {
    return true
  }

  /**
   * Busy-waits for the requested number of milliseconds, preserving the legacy SDK2 helper.
   * @param busyWaitMillis Milliseconds to spin before returning.
   */
  SystemRuntime.busyWaitWithBareClockLookup = function (busyWaitMillis: number): void {
    try {
      var startTimeMillis = SystemRuntime.getTimeMSec()
      while (SystemRuntime.getTimeMSec() - startTimeMillis < busyWaitMillis) {}
    } catch (error) {
      if (error != null && typeof (error as { logException?: unknown }).logException === 'function') {
        ;(error as { logException: () => void }).logException()
      }
    }
  }

  /**
   * Reads current user time, falling back to system time when no override is set.
   * @returns User-controlled timestamp or current system timestamp in milliseconds.
   */
  SystemRuntime.getUserTimeMSec = function (): number {
    return SystemRuntime.userTimeMillis == SystemRuntime.NO_USER_TIME_SENTINEL
      ? SystemRuntime.getSystemTimeMSec()
      : SystemRuntime.userTimeMillis
  }

  /**
   * Overrides Cubism2 user time for deterministic playback or tests.
   * @param userTimeMillis Timestamp used by future `getUserTimeMSec` calls.
   */
  SystemRuntime.setUserTimeMSec = function (userTimeMillis: number): void {
    SystemRuntime.userTimeMillis = userTimeMillis
  }

  /**
   * Refreshes user time from the runtime clock.
   * @returns Updated user time in milliseconds.
   */
  SystemRuntime.updateUserTimeMSec = function (): number {
    var systemTimeMillis = SystemRuntime.getSystemTimeMSec()
    SystemRuntime.userTimeMillis = systemTimeMillis
    return systemTimeMillis
  }

  /**
   * Reads wall-clock time.
   * @returns Current timestamp in milliseconds.
   */
  SystemRuntime.getTimeMSec = function (): number {
    return readCurrentTimeMillis()
  }

  /**
   * Reads system wall-clock time.
   * @returns Current timestamp in milliseconds.
   */
  SystemRuntime.getSystemTimeMSec = function (): number {
    return readCurrentTimeMillis()
  }

  /**
   * Legacy no-op hook retained for SDK2 compatibility.
   * @param value Ignored value from old call sites.
   */
  SystemRuntime.emptyOneArgumentHook = function (value: unknown): void {
    void value
  }

  SystemRuntime.copyArraySegmentForward = copyArraySegmentForward

  return {
    UtDebug: DebugRuntime,
    UtSystem: SystemRuntime,
  }
}
