import type { Cubism2AMotionConstructor, Cubism2MotionQueueEntryInstance } from './motionBase'
import {
  isMotionCurveLayout,
  isMotionCurveVisible,
  setMotionCurveKeyframeValues,
  setMotionCurveTarget,
  type Cubism2MotionCurveConstructor,
  type Cubism2MotionCurveInstance,
} from './motionParser'

type Cubism2LegacyMotionBytes = ArrayBufferLike | ArrayLike<number> | DataView

interface Cubism2LegacyMotionModelLike {
  getParamFloat: (paramId: string) => number
  setParamFloat: (paramId: string, value: number) => void
}

interface Cubism2LegacyMotionTextReader {
  createString: (motionData: DataView, startOffset: number, byteLength: number) => string
  getChar: (motionData: DataView, byteOffset: number) => string
  parseAsciiFloat: (
    motionData: ArrayBufferLike | DataView,
    byteLength: number,
    startOffset: number,
    parsedOffsetRef: number[],
  ) => number
  startsWith: (motionData: DataView, startOffset: number, token: string) => boolean
}

export interface Cubism2LegacyLive2DMotionInstance {
  dump: () => void
  durationMSec: number
  framesPerSecond: number
  getDurationMSec: () => number
  initializeMotionHook: () => void
  instanceId: number | null
  isLoop: () => boolean
  isLoopFadeIn: () => boolean
  loopEnabled: boolean
  loopFadeIn: boolean
  maxCurveValueCount: number
  motions: Cubism2MotionCurveInstance[]
  setLoop: (loop: boolean) => void
  setLoopFadeIn: (enabled: boolean) => void
  updateParamExe: (
    model: Cubism2LegacyMotionModelLike,
    userTimeMillis: number,
    blendedWeight: number,
    motionQueueEntry: Cubism2MotionQueueEntryInstance,
  ) => void
}

export type Cubism2LegacyLive2DMotionConstructor = {
  new (): Cubism2LegacyLive2DMotionInstance
  LAYOUT_PREFIX: string
  VISIBLE_PREFIX: string
  legacyStepScale: number
  loadMotion: (motionBytes: Cubism2LegacyMotionBytes) => Cubism2LegacyLive2DMotionInstance
  nextMotionSerial: number
  parsedValuesScratch: number[]
  prototype: Cubism2LegacyLive2DMotionInstance
}

export interface CreateCubism2LegacyMotionOptions {
  AMotion: Cubism2AMotionConstructor
  Cubism2MotionCurve: Cubism2MotionCurveConstructor
  MotionTextReader: Cubism2LegacyMotionTextReader
  isBootstrapping: () => boolean
}

export interface Cubism2LegacyMotionConstructors {
  LegacyLive2DMotion: Cubism2LegacyLive2DMotionConstructor
}

/**
 * Creates the dormant min.js legacy MTN parser branch kept for Cubism2 v2 compatibility.
 * @param options Base motion, active parser helpers, and bootstrapping guard used by the legacy branch.
 * @returns LegacyLive2DMotion constructor with parser and playback methods restored from min.js.
 */
export function createCubism2LegacyMotion(
  options: CreateCubism2LegacyMotionOptions,
): Cubism2LegacyMotionConstructors {
  /**
   * Normalizes legacy motion bytes to DataView so the parser no longer depends on broken char coercion.
   * @param motionBytes MTN data supplied as ArrayBuffer, DataView, typed array, or numeric byte array.
   * @returns DataView used by MotionTextReader for byte-accurate reads.
   */
  function normalizeLegacyMotionDataView(motionBytes: Cubism2LegacyMotionBytes): DataView {
    if ('getUint8' in motionBytes) {
      return motionBytes
    }
    if (ArrayBuffer.isView(motionBytes)) {
      return new DataView(motionBytes.buffer, motionBytes.byteOffset, motionBytes.byteLength)
    }
    if ('byteLength' in motionBytes && !('length' in motionBytes)) {
      return new DataView(motionBytes)
    }
    return new DataView(Uint8Array.from(motionBytes as ArrayLike<number>).buffer)
  }

  /**
   * Checks whether a byte character ends one legacy MTN line.
   * @param character Character returned by MotionTextReader.
   * @returns True for CR or LF line endings.
   */
  function isLegacyMotionLineBreak(character: string): boolean {
    return character === '\r' || character === '\n'
  }

  /**
   * Checks whether a byte character separates numeric values on one legacy MTN line.
   * @param character Character returned by MotionTextReader.
   * @returns True for comma, space, or tab separators.
   */
  function isLegacyMotionValueSeparator(character: string): boolean {
    return character === ',' || character === ' ' || character === '\t'
  }

  /**
   * Checks whether a byte character can start a legacy curve key.
   * @param charCode ASCII code for the current character.
   * @param character Current character read from the byte stream.
   * @returns True for ASCII letters and underscore.
   */
  function isLegacyMotionKeyStart(charCode: number, character: string): boolean {
    return (
      (97 <= charCode && charCode <= 122) || (65 <= charCode && charCode <= 90) || character === '_'
    )
  }

  /**
   * Creates and classifies one legacy curve by key prefix.
   * @param motionData MTN data wrapped in a DataView.
   * @param keyStartOffset Start offset of the curve key.
   * @param keyEndOffset Offset of the `=` delimiter.
   * @returns Curve instance populated with restored curve type and target id.
   */
  function createLegacyMotionCurve(
    motionData: DataView,
    keyStartOffset: number,
    keyEndOffset: number,
  ): Cubism2MotionCurveInstance {
    var motionCurve = new options.Cubism2MotionCurve()
    if (
      options.MotionTextReader.startsWith(
        motionData,
        keyStartOffset,
        LegacyMotionCtor.VISIBLE_PREFIX,
      )
    ) {
      setMotionCurveTarget(
        motionCurve,
        options.Cubism2MotionCurve.VISIBILITY_CURVE_TYPE,
        options.MotionTextReader.createString(
          motionData,
          keyStartOffset,
          keyEndOffset - keyStartOffset,
        ),
      )
      return motionCurve
    }
    if (
      options.MotionTextReader.startsWith(
        motionData,
        keyStartOffset,
        LegacyMotionCtor.LAYOUT_PREFIX,
      )
    ) {
      var layoutKeyStartOffset = keyStartOffset + LegacyMotionCtor.LAYOUT_PREFIX.length
      var layoutTargetId = options.MotionTextReader.createString(
        motionData,
        layoutKeyStartOffset,
        keyEndOffset - keyStartOffset - LegacyMotionCtor.LAYOUT_PREFIX.length,
      )
      var layoutCurveType: number | null = null
      if (options.MotionTextReader.startsWith(motionData, layoutKeyStartOffset, 'ANCHOR_X')) {
        layoutCurveType = options.Cubism2MotionCurve.LAYOUT_ANCHOR_X_CURVE_TYPE
      } else if (
        options.MotionTextReader.startsWith(motionData, layoutKeyStartOffset, 'ANCHOR_Y')
      ) {
        layoutCurveType = options.Cubism2MotionCurve.LAYOUT_ANCHOR_Y_CURVE_TYPE
      } else if (options.MotionTextReader.startsWith(motionData, layoutKeyStartOffset, 'SCALE_X')) {
        layoutCurveType = options.Cubism2MotionCurve.LAYOUT_SCALE_X_CURVE_TYPE
      } else if (options.MotionTextReader.startsWith(motionData, layoutKeyStartOffset, 'SCALE_Y')) {
        layoutCurveType = options.Cubism2MotionCurve.LAYOUT_SCALE_Y_CURVE_TYPE
      } else if (options.MotionTextReader.startsWith(motionData, layoutKeyStartOffset, 'X')) {
        layoutCurveType = options.Cubism2MotionCurve.LAYOUT_X_CURVE_TYPE
      } else if (options.MotionTextReader.startsWith(motionData, layoutKeyStartOffset, 'Y')) {
        layoutCurveType = options.Cubism2MotionCurve.LAYOUT_Y_CURVE_TYPE
      }
      setMotionCurveTarget(motionCurve, layoutCurveType, layoutTargetId)
      return motionCurve
    }
    setMotionCurveTarget(
      motionCurve,
      options.Cubism2MotionCurve.PARAMETER_CURVE_TYPE,
      options.MotionTextReader.createString(motionData, keyStartOffset, keyEndOffset - keyStartOffset),
    )
    return motionCurve
  }

  /**
   * Dormant legacy Live2DMotion parser retained from the min.js runtime.
   */
  function LegacyLive2DMotion(this: Cubism2LegacyLive2DMotionInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    options.AMotion.prototype.constructor.call(this)
    this.motions = new Array()
    this.instanceId = null
    this.instanceId = LegacyMotionCtor.nextMotionSerial++
    this.framesPerSecond = 30
    this.maxCurveValueCount = 0
    this.loopEnabled = true
    this.loopFadeIn = true
    this.durationMSec = -1
    this.initializeMotionHook()
  }

  const LegacyMotionCtor = LegacyLive2DMotion as unknown as Cubism2LegacyLive2DMotionConstructor
  LegacyMotionCtor.prototype = new options.AMotion() as unknown as Cubism2LegacyLive2DMotionInstance
  LegacyMotionCtor.VISIBLE_PREFIX = 'VISIBLE:'
  LegacyMotionCtor.LAYOUT_PREFIX = 'LAYOUT:'
  LegacyMotionCtor.nextMotionSerial = 0
  LegacyMotionCtor.parsedValuesScratch = []
  LegacyMotionCtor.legacyStepScale = 1

  /**
   * Parses legacy MTN text into the dormant Live2DMotion branch.
   * @param motionBytes Byte-like MTN payload consumed by the restored byte reader.
   * @returns Legacy motion populated with curve records and duration metadata.
   */
  LegacyMotionCtor.loadMotion = function (
    motionBytes: Cubism2LegacyMotionBytes,
  ): Cubism2LegacyLive2DMotionInstance {
    var motionDataView = normalizeLegacyMotionDataView(motionBytes)
    var motion = new LegacyMotionCtor()
    var parsedOffsetRef = [0]
    var byteLength = motionDataView.byteLength
    motion.maxCurveValueCount = 0
    for (var byteOffset = 0; byteOffset < byteLength; ++byteOffset) {
      var currentChar = options.MotionTextReader.getChar(motionDataView, byteOffset)
      var currentCharCode = currentChar.charCodeAt(0)
      if (isLegacyMotionLineBreak(currentChar)) {
        continue
      }
      if (currentChar === '#') {
        for (; byteOffset < byteLength; ++byteOffset) {
          if (
            isLegacyMotionLineBreak(options.MotionTextReader.getChar(motionDataView, byteOffset))
          ) {
            break
          }
        }
        continue
      }
      if (currentChar === '$') {
        var settingStartOffset = byteOffset
        var settingEqualsOffset = -1
        for (; byteOffset < byteLength; ++byteOffset) {
          currentChar = options.MotionTextReader.getChar(motionDataView, byteOffset)
          if (isLegacyMotionLineBreak(currentChar)) {
            break
          }
          if (currentChar === '=') {
            settingEqualsOffset = byteOffset
            break
          }
        }
        var isFpsSetting = false
        if (settingEqualsOffset >= 0) {
          if (
            settingEqualsOffset === settingStartOffset + 4 &&
            options.MotionTextReader.getChar(motionDataView, settingStartOffset + 1) === 'f' &&
            options.MotionTextReader.getChar(motionDataView, settingStartOffset + 2) === 'p' &&
            options.MotionTextReader.getChar(motionDataView, settingStartOffset + 3) === 's'
          ) {
            isFpsSetting = true
          }
          for (byteOffset = settingEqualsOffset + 1; byteOffset < byteLength; ++byteOffset) {
            currentChar = options.MotionTextReader.getChar(motionDataView, byteOffset)
            if (isLegacyMotionLineBreak(currentChar)) {
              break
            }
            if (isLegacyMotionValueSeparator(currentChar)) {
              continue
            }
            var settingValue = options.MotionTextReader.parseAsciiFloat(
              motionDataView,
              byteLength,
              byteOffset,
              parsedOffsetRef,
            )
            var settingEndOffset = parsedOffsetRef[0] ?? 0
            if (settingEndOffset > 0 && isFpsSetting && 5 < settingValue && settingValue < 121) {
              motion.framesPerSecond = settingValue
            }
            byteOffset = settingEndOffset - 1
          }
        }
        for (; byteOffset < byteLength; ++byteOffset) {
          if (
            isLegacyMotionLineBreak(options.MotionTextReader.getChar(motionDataView, byteOffset))
          ) {
            break
          }
        }
        continue
      }
      if (isLegacyMotionKeyStart(currentCharCode, currentChar)) {
        var keyStartOffset = byteOffset
        var keyEqualsOffset = -1
        for (; byteOffset < byteLength; ++byteOffset) {
          currentChar = options.MotionTextReader.getChar(motionDataView, byteOffset)
          if (isLegacyMotionLineBreak(currentChar)) {
            break
          }
          if (currentChar === '=') {
            keyEqualsOffset = byteOffset
            break
          }
        }
        if (keyEqualsOffset >= 0) {
          var motionCurve = createLegacyMotionCurve(motionDataView, keyStartOffset, keyEqualsOffset)
          motion.motions.push(motionCurve)
          var valueCount = 0
          LegacyMotionCtor.parsedValuesScratch.length = 0
          for (byteOffset = keyEqualsOffset + 1; byteOffset < byteLength; ++byteOffset) {
            currentChar = options.MotionTextReader.getChar(motionDataView, byteOffset)
            if (isLegacyMotionLineBreak(currentChar)) {
              break
            }
            if (isLegacyMotionValueSeparator(currentChar)) {
              continue
            }
            var curveValue = options.MotionTextReader.parseAsciiFloat(
              motionDataView,
              byteLength,
              byteOffset,
              parsedOffsetRef,
            )
            var parsedValueEndOffset = parsedOffsetRef[0] ?? 0
            if (parsedValueEndOffset > 0) {
              LegacyMotionCtor.parsedValuesScratch.push(curveValue)
              valueCount++
              if (parsedValueEndOffset < byteOffset) {
                console.log('Legacy motion parser offset moved backwards. @Live2DMotion.loadMotion()\n')
                break
              }
              byteOffset = parsedValueEndOffset - 1
            }
          }
          setMotionCurveKeyframeValues(
            motionCurve,
            new Float32Array(LegacyMotionCtor.parsedValuesScratch),
          )
          if (valueCount > motion.maxCurveValueCount) {
            motion.maxCurveValueCount = valueCount
          }
        }
      }
    }
    motion.durationMSec = ((1000 * motion.maxCurveValueCount) / motion.framesPerSecond) | 0
    return motion
  }

  /**
   * Reads the parsed duration for the dormant legacy motion branch.
   * @returns Parsed duration in milliseconds.
   */
  LegacyMotionCtor.prototype.getDurationMSec = function (): number {
    return this.durationMSec
  }

  /**
   * Dumps the first parsed values of each curve using the original debug print format.
   */
  LegacyMotionCtor.prototype.dump = function (): void {
    for (var curveIndex = 0; curveIndex < this.motions.length; curveIndex++) {
      var motionCurve = this.motions[curveIndex]!
      var curveValues = motionCurve.keyframeValues!
      console.log('motionCurve[%s] [%d]. ', motionCurve.targetId, curveValues.length)
      for (var valueIndex = 0; valueIndex < curveValues.length && valueIndex < 10; valueIndex++) {
        console.log('%5.2f ,', curveValues[valueIndex])
      }
      console.log('\n')
    }
  }

  /**
   * Applies parsed legacy curve values to one model update tick.
   * @param model Live2D model receiving parameter updates.
   * @param userTimeMillis Current Cubism2 user time used to derive the frame index.
   * @param blendedWeight Queue-computed motion weight after fade blending.
   * @param motionQueueEntry Queue entry carrying start time and finish flags.
   */
  LegacyMotionCtor.prototype.updateParamExe = function (
    model: Cubism2LegacyMotionModelLike,
    userTimeMillis: number,
    blendedWeight: number,
    motionQueueEntry: Cubism2MotionQueueEntryInstance,
  ): void {
    var elapsedMillis = userTimeMillis - motionQueueEntry.startTimeMillis
    var framePosition = (elapsedMillis * this.framesPerSecond) / 1000
    var frameIndex = framePosition | 0
    var frameFraction = framePosition - frameIndex
    for (var curveIndex = 0; curveIndex < this.motions.length; curveIndex++) {
      var motionCurve = this.motions[curveIndex]!
      var curveValues = motionCurve.keyframeValues!
      var curveValueCount = curveValues.length
      var curveTargetId = motionCurve.targetId!
      if (isMotionCurveVisible(motionCurve, options.Cubism2MotionCurve)) {
        var visibilityValue =
          curveValues[frameIndex >= curveValueCount ? curveValueCount - 1 : frameIndex]!
        model.setParamFloat(curveTargetId, visibilityValue)
      } else if (isMotionCurveLayout(motionCurve, options.Cubism2MotionCurve)) {
        continue
      } else {
        var currentParamValue = model.getParamFloat(curveTargetId)
        var currentCurveValue =
          curveValues[frameIndex >= curveValueCount ? curveValueCount - 1 : frameIndex]!
        var nextCurveValue =
          curveValues[frameIndex + 1 >= curveValueCount ? curveValueCount - 1 : frameIndex + 1]!
        var interpolatedCurveValue =
          currentCurveValue + (nextCurveValue - currentCurveValue) * frameFraction
        var blendedParamValue =
          currentParamValue + (interpolatedCurveValue - currentParamValue) * blendedWeight
        model.setParamFloat(curveTargetId, blendedParamValue)
      }
    }
    if (frameIndex >= this.maxCurveValueCount) {
      if (this.loopEnabled) {
        motionQueueEntry.startTimeMillis = userTimeMillis
        if (this.loopFadeIn) {
          motionQueueEntry.fadeInStartTimeMillis = userTimeMillis
        }
      } else {
        motionQueueEntry.isFinishedFlag = true
      }
    }
  }

  /**
   * Reads whether the dormant legacy motion branch loops.
   * @returns True when playback loops after the final frame.
   */
  LegacyMotionCtor.prototype.isLoop = function (): boolean {
    return this.loopEnabled
  }
  /**
   * Sets whether the dormant legacy motion branch loops.
   * @param loop True to loop after the parsed duration.
   */
  LegacyMotionCtor.prototype.setLoop = function (loop: boolean): void {
    this.loopEnabled = loop
  }
  /**
   * Reads whether loop restarts reset fade-in.
   * @returns True when loop restarts reset fade-in timing.
   */
  LegacyMotionCtor.prototype.isLoopFadeIn = function (): boolean {
    return this.loopFadeIn
  }

  /**
   * Sets whether loop restarts reset fade-in.
   * @param enabled True to restart fade-in whenever the motion loops.
   */
  LegacyMotionCtor.prototype.setLoopFadeIn = function (enabled: boolean): void {
    this.loopFadeIn = enabled
  }

  return {
    LegacyLive2DMotion: LegacyMotionCtor,
  }
}
