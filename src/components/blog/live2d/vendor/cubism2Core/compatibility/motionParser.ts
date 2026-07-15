import type { Cubism2AMotionConstructor, Cubism2MotionQueueEntryInstance } from './motionBase'

interface Cubism2MotionModelContextLike {
  getParamFloat: (paramIndex: number) => number
  getParamMax: (paramIndex: number) => number
  getParamMin: (paramIndex: number) => number
}

interface Cubism2MotionModelLike {
  getModelContext: () => Cubism2MotionModelContextLike
  getParamIndex: (paramId: string) => number
  setParamFloat: (paramId: string, value: number) => void
}

export interface Cubism2MotionCurveInstance {
  curveType: number | null
  keyframeValues: Float32Array | null
  targetId: string | null
}

export interface Cubism2MotionFloatArrayInstance {
  add: (value: number) => void
  clear: () => void
  size: number
  toCompactFloat32Array: () => Float32Array
  valueBuffer: Float32Array
}

export interface Cubism2Live2DMotionInstance {
  durationMSec: number
  dump: () => void
  framesPerSecond: number
  getDurationMSec: () => number
  getFramesPerSecond: () => number
  getLoopDurationMSec: () => number
  isLoopFadeIn: () => boolean
  isLoop: () => boolean
  lastWeight: number
  loopEnabled: boolean
  loopFadeIn: boolean
  maxCurveValueCount: number
  motionInstanceId: number
  motions: Cubism2MotionCurveInstance[]
  setFramesPerSecond: (framesPerSecond: number) => void
  setLoop: (loop: boolean) => void
  setLoopFadeIn: (enabled: boolean) => void
  updateParamExe: (
    model: Cubism2MotionModelLike,
    userTimeMillis: number,
    blendedWeight: number,
    motionQueueEntry: Cubism2MotionQueueEntryInstance,
  ) => void
}

export type Cubism2MotionCurveConstructor = {
  new (): Cubism2MotionCurveInstance
  LAYOUT_ANCHOR_X_CURVE_TYPE: number
  LAYOUT_ANCHOR_Y_CURVE_TYPE: number
  LAYOUT_SCALE_X_CURVE_TYPE: number
  LAYOUT_SCALE_Y_CURVE_TYPE: number
  LAYOUT_X_CURVE_TYPE: number
  LAYOUT_Y_CURVE_TYPE: number
  PARAMETER_CURVE_TYPE: number
  VISIBILITY_CURVE_TYPE: number
  prototype: Cubism2MotionCurveInstance
}

export type Cubism2MotionFloatArrayConstructor = {
  new (): Cubism2MotionFloatArrayInstance
  prototype: Cubism2MotionFloatArrayInstance
}

export type Cubism2Live2DMotionConstructor = {
  new (): Cubism2Live2DMotionInstance
  LAYOUT_PREFIX: string
  MTN_PREFIX_FADEIN: string
  MTN_PREFIX_FADEOUT: string
  VISIBLE_PREFIX: string
  legacyMotionVersion: number
  loadMotion: (motionData: ArrayBufferLike | DataView) => Cubism2Live2DMotionInstance
  nextMotionInstanceId: number
  prototype: Cubism2Live2DMotionInstance
}

export interface Cubism2MotionTextReader {
  parseAsciiFloat: (
    motionData: ArrayBufferLike | DataView,
    byteLength: number,
    startOffset: number,
    parsedOffsetRef: number[],
  ) => number
  createString: (motionData: DataView, startOffset: number, byteLength: number) => string
  getChar: (motionData: DataView, byteOffset: number) => string
  startsWith: (motionData: DataView, startOffset: number, token: string) => boolean
}

export interface CreateCubism2MotionParserOptions {
  AMotion: Cubism2AMotionConstructor
  isBootstrapping: () => boolean
}

export interface Cubism2MotionParserConstructors {
  Cubism2MotionCurve: Cubism2MotionCurveConstructor
  Cubism2MotionFloatArray: Cubism2MotionFloatArrayConstructor
  Live2DMotion: Cubism2Live2DMotionConstructor
  MotionTextReader: Cubism2MotionTextReader
}

/**
 * Stores the parsed curve identity on its semantic fields.
 * @param curve Curve record parsed from one MTN key.
 * @param curveType Restored curve kind numeric tag from Cubism2MotionCurve; null is kept for unknown legacy layout keys.
 * @param targetId Parameter, visibility, or layout target name extracted from the MTN key.
 */
export function setMotionCurveTarget(
  curve: Cubism2MotionCurveInstance,
  curveType: number | null,
  targetId: string | null,
): void {
  curve.targetId = targetId
  curve.curveType = curveType
}

/**
 * Stores parsed MTN frame values on the semantic field.
 * @param curve Curve record that owns the frame values.
 * @param keyframeValues Compact Float32Array parsed from the MTN value list.
 */
export function setMotionCurveKeyframeValues(
  curve: Cubism2MotionCurveInstance,
  keyframeValues: Float32Array | null,
): void {
  curve.keyframeValues = keyframeValues
}

/**
 * Checks whether a parsed curve controls a visibility slot instead of a normal parameter.
 * @param curve Curve record being evaluated during motion playback.
 * @param MotionCurve Constructor carrying the restored visibility numeric tag.
 * @returns True when the curve type matches the visibility branch.
 */
export function isMotionCurveVisible(
  curve: Cubism2MotionCurveInstance,
  MotionCurve: Cubism2MotionCurveConstructor,
): boolean {
  return curve.curveType === MotionCurve.VISIBILITY_CURVE_TYPE
}

/**
 * Checks whether a parsed curve is one of the six layout hint branches ignored by runtime parameter playback.
 * @param curve Curve record being evaluated during motion playback.
 * @param MotionCurve Constructor carrying the restored layout numeric range.
 * @returns True for X/Y/anchor/scale layout curve tags from min.js values 100 through 105.
 */
export function isMotionCurveLayout(
  curve: Cubism2MotionCurveInstance,
  MotionCurve: Cubism2MotionCurveConstructor,
): boolean {
  var curveType = curve.curveType
  return (
    curveType !== null &&
    MotionCurve.LAYOUT_X_CURVE_TYPE <= curveType &&
    curveType <= MotionCurve.LAYOUT_SCALE_Y_CURVE_TYPE
  )
}

/**
 * Creates the min.js-derived Cubism2 MTN parser and Live2DMotion constructor.
 * @param options Base motion constructor and bootstrapping guard supplied by the compatibility capsule.
 * @returns Live2DMotion plus parser helper constructors that replaced the compressed motion block.
 */
export function createCubism2MotionParser(
  options: CreateCubism2MotionParserOptions,
): Cubism2MotionParserConstructors {
  const VISIBLE_PREFIX = 'VISIBLE:'
  const LAYOUT_PREFIX = 'LAYOUT:'

  /**
   * Normalizes motion source bytes to the DataView shape used by the min.js parser.
   * @param motionData MTN data passed as an ArrayBuffer-like object or already wrapped DataView.
   * @returns DataView used by byte-offset parser helpers.
   */
  function normalizeMotionDataView(motionData: ArrayBufferLike | DataView): DataView {
    if ('getUint8' in motionData) {
      return motionData
    }
    return new DataView(motionData)
  }

  /**
   * Reads one ASCII character from the MTN byte stream.
   * @param motionData MTN bytes wrapped in a DataView.
   * @param byteOffset Byte offset to read.
   * @returns Single-character string decoded from the unsigned byte.
   */
  function readMotionByteChar(motionData: DataView, byteOffset: number): string {
    return String.fromCharCode(motionData.getUint8(byteOffset))
  }

  /**
   * Checks whether an ASCII token appears at a byte offset.
   * @param motionData MTN bytes wrapped in a DataView.
   * @param startOffset Token start offset.
   * @param token ASCII token to compare against the byte stream.
   * @returns True when the byte range matches the token exactly.
   */
  function startsWithAscii(motionData: DataView, startOffset: number, token: string): boolean {
    var endOffset = startOffset + token.length
    if (endOffset > motionData.byteLength) {
      return false
    }
    for (var byteOffset = startOffset; byteOffset < endOffset; byteOffset++) {
      if (readMotionByteChar(motionData, byteOffset) !== token.charAt(byteOffset - startOffset)) {
        return false
      }
    }
    return true
  }

  /**
   * Creates a JavaScript string from an MTN ASCII byte range.
   * @param motionData MTN bytes wrapped in a DataView.
   * @param startOffset First byte included in the string.
   * @param byteLength Number of bytes to decode.
   * @returns String represented by the byte range.
   */
  function createStringFromBytes(
    motionData: DataView,
    startOffset: number,
    byteLength: number,
  ): string {
    var characters = new Array<string>(byteLength)
    for (var byteIndex = 0; byteIndex < byteLength; byteIndex++) {
      characters[byteIndex] = String.fromCharCode(motionData.getUint8(startOffset + byteIndex))
    }
    return characters.join('')
  }

  /**
   * Parses one decimal number from an MTN byte stream and returns the next unread offset.
   * @param motionData MTN data passed as an ArrayBuffer-like object or DataView.
   * @param byteLength Total byte length used as the parser upper bound.
   * @param startOffset Byte offset where the number starts.
   * @param parsedOffsetRef Single-item output array receiving the next unread offset.
   * @returns Parsed signed decimal value.
   */
  function parseAsciiFloat(
    motionData: ArrayBufferLike | DataView,
    byteLength: number,
    startOffset: number,
    parsedOffsetRef: number[],
  ): number {
    var dataView = normalizeMotionDataView(motionData)
    var byteOffset = startOffset
    var isNegative = false
    var hasFraction = false
    var parsedValue = 0
    var currentChar = readMotionByteChar(dataView, byteOffset)
    if (currentChar === '-') {
      isNegative = true
      byteOffset++
    }
    var reachedNumberEnd = false
    for (; byteOffset < byteLength; byteOffset++) {
      currentChar = readMotionByteChar(dataView, byteOffset)
      switch (currentChar) {
        case '0':
          parsedValue = parsedValue * 10
          break
        case '1':
          parsedValue = parsedValue * 10 + 1
          break
        case '2':
          parsedValue = parsedValue * 10 + 2
          break
        case '3':
          parsedValue = parsedValue * 10 + 3
          break
        case '4':
          parsedValue = parsedValue * 10 + 4
          break
        case '5':
          parsedValue = parsedValue * 10 + 5
          break
        case '6':
          parsedValue = parsedValue * 10 + 6
          break
        case '7':
          parsedValue = parsedValue * 10 + 7
          break
        case '8':
          parsedValue = parsedValue * 10 + 8
          break
        case '9':
          parsedValue = parsedValue * 10 + 9
          break
        case '.':
          hasFraction = true
          byteOffset++
          reachedNumberEnd = true
          break
        default:
          reachedNumberEnd = true
          break
      }
      if (reachedNumberEnd) {
        break
      }
    }
    if (hasFraction) {
      var decimalPlace = 0.1
      var reachedFractionEnd = false
      for (; byteOffset < byteLength; byteOffset++) {
        currentChar = readMotionByteChar(dataView, byteOffset)
        switch (currentChar) {
          case '0':
            break
          case '1':
            parsedValue += decimalPlace * 1
            break
          case '2':
            parsedValue += decimalPlace * 2
            break
          case '3':
            parsedValue += decimalPlace * 3
            break
          case '4':
            parsedValue += decimalPlace * 4
            break
          case '5':
            parsedValue += decimalPlace * 5
            break
          case '6':
            parsedValue += decimalPlace * 6
            break
          case '7':
            parsedValue += decimalPlace * 7
            break
          case '8':
            parsedValue += decimalPlace * 8
            break
          case '9':
            parsedValue += decimalPlace * 9
            break
          default:
            reachedFractionEnd = true
            break
        }
        decimalPlace *= 0.1
        if (reachedFractionEnd) {
          break
        }
      }
    }
    if (isNegative) {
      parsedValue = -parsedValue
    }
    parsedOffsetRef[0] = byteOffset
    return parsedValue
  }

  const MotionTextReader: Cubism2MotionTextReader = {
    parseAsciiFloat,
    createString: createStringFromBytes,
    getChar: readMotionByteChar,
    startsWith: startsWithAscii,
  }

  /**
   * Growable float buffer used by legacy motion parser variants.
   */
  function Cubism2MotionFloatArray(this: Cubism2MotionFloatArrayInstance): void {
    this.valueBuffer = new Float32Array(100)
    this.size = 0
  }

  const MotionFloatArray =
    Cubism2MotionFloatArray as unknown as Cubism2MotionFloatArrayConstructor

  /**
   * Resets the motion float buffer without releasing capacity.
   */
  MotionFloatArray.prototype.clear = function (): void {
    this.size = 0
  }

  /**
   * Appends one parsed motion value, growing the backing array when needed.
   * @param value Parsed MTN value.
   */
  MotionFloatArray.prototype.add = function (value: number): void {
    if (this.valueBuffer.length <= this.size) {
      var expandedBuffer = new Float32Array(this.size * 2)
      expandedBuffer.set(this.valueBuffer.subarray(0, this.size), 0)
      this.valueBuffer = expandedBuffer
    }
    this.valueBuffer[this.size++] = value
  }

  /**
   * Copies the populated values into a compact Float32Array.
   * @returns Compact array containing only appended values.
   */
  MotionFloatArray.prototype.toCompactFloat32Array = function (): Float32Array {
    var compactBuffer = new Float32Array(this.size)
    compactBuffer.set(this.valueBuffer.subarray(0, this.size), 0)
    return compactBuffer
  }

  /**
   * One MTN curve entry mapped to a parameter, visibility slot, or layout hint.
   */
  function Cubism2MotionCurve(this: Cubism2MotionCurveInstance): void {
    this.targetId = null
    this.keyframeValues = null
    this.curveType = null
  }

  const MotionCurve = Cubism2MotionCurve as unknown as Cubism2MotionCurveConstructor
  MotionCurve.PARAMETER_CURVE_TYPE = 0
  MotionCurve.VISIBILITY_CURVE_TYPE = 1
  MotionCurve.LAYOUT_X_CURVE_TYPE = 100
  MotionCurve.LAYOUT_Y_CURVE_TYPE = 101
  MotionCurve.LAYOUT_ANCHOR_X_CURVE_TYPE = 102
  MotionCurve.LAYOUT_ANCHOR_Y_CURVE_TYPE = 103
  MotionCurve.LAYOUT_SCALE_X_CURVE_TYPE = 104
  MotionCurve.LAYOUT_SCALE_Y_CURVE_TYPE = 105

  /**
   * Classifies one MTN curve key and stores its restored curve type and target name.
   * @param motionData MTN bytes wrapped in a DataView.
   * @param keyStartOffset Start byte offset of the curve key.
   * @param keyEndOffset Offset of the `=` delimiter that ends the key.
   * @returns Motion curve configured with type and target ID.
   */
  function classifyMotionCurve(
    motionData: DataView,
    keyStartOffset: number,
    keyEndOffset: number,
  ): Cubism2MotionCurveInstance {
    var curve = new MotionCurve()
    if (startsWithAscii(motionData, keyStartOffset, MotionCtor.VISIBLE_PREFIX)) {
      setMotionCurveTarget(
        curve,
        MotionCurve.VISIBILITY_CURVE_TYPE,
        createStringFromBytes(motionData, keyStartOffset, keyEndOffset - keyStartOffset),
      )
      return curve
    }

    if (startsWithAscii(motionData, keyStartOffset, MotionCtor.LAYOUT_PREFIX)) {
      var layoutKeyStartOffset = keyStartOffset + LAYOUT_PREFIX.length
      var layoutTargetId = createStringFromBytes(
        motionData,
        layoutKeyStartOffset,
        keyEndOffset - keyStartOffset - LAYOUT_PREFIX.length,
      )
      var layoutCurveType: number | null = null
      if (startsWithAscii(motionData, layoutKeyStartOffset, 'ANCHOR_X')) {
        layoutCurveType = MotionCurve.LAYOUT_ANCHOR_X_CURVE_TYPE
      } else if (startsWithAscii(motionData, layoutKeyStartOffset, 'ANCHOR_Y')) {
        layoutCurveType = MotionCurve.LAYOUT_ANCHOR_Y_CURVE_TYPE
      } else if (startsWithAscii(motionData, layoutKeyStartOffset, 'SCALE_X')) {
        layoutCurveType = MotionCurve.LAYOUT_SCALE_X_CURVE_TYPE
      } else if (startsWithAscii(motionData, layoutKeyStartOffset, 'SCALE_Y')) {
        layoutCurveType = MotionCurve.LAYOUT_SCALE_Y_CURVE_TYPE
      } else if (startsWithAscii(motionData, layoutKeyStartOffset, 'X')) {
        layoutCurveType = MotionCurve.LAYOUT_X_CURVE_TYPE
      } else if (startsWithAscii(motionData, layoutKeyStartOffset, 'Y')) {
        layoutCurveType = MotionCurve.LAYOUT_Y_CURVE_TYPE
      }
      setMotionCurveTarget(curve, layoutCurveType, layoutTargetId)
      return curve
    }

    setMotionCurveTarget(
      curve,
      MotionCurve.PARAMETER_CURVE_TYPE,
      createStringFromBytes(motionData, keyStartOffset, keyEndOffset - keyStartOffset),
    )
    return curve
  }

  /**
   * Checks whether a byte character should be ignored between MTN values.
   * @param character Character read from the byte stream.
   * @returns True for comma, space, or tab separators.
   */
  function isMotionValueSeparator(character: string): boolean {
    return character === ',' || character === ' ' || character === '\t'
  }

  /**
   * Checks whether a byte character ends an MTN line.
   * @param character Character read from the byte stream.
   * @returns True for CR or LF.
   */
  function isMotionLineBreak(character: string): boolean {
    return character === '\r' || character === '\n'
  }

  /**
   * Checks whether a byte can start an MTN curve key.
   * @param charCode Character code read from the byte stream.
   * @param character Character read from the byte stream.
   * @returns True for ASCII letters or underscore.
   */
  function isMotionKeyStart(charCode: number, character: string): boolean {
    return (97 <= charCode && charCode <= 122) || (65 <= charCode && charCode <= 90) || character === '_'
  }

  /**
   * Public Cubism2 motion class for legacy MTN files.
   */
  function Live2DMotion(this: Cubism2Live2DMotionInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    options.AMotion.prototype.constructor.call(this)
    this.motions = new Array()
    this.motionInstanceId = MotionCtor.nextMotionInstanceId++
    this.framesPerSecond = 30
    this.maxCurveValueCount = 0
    this.loopEnabled = false
    this.loopFadeIn = true
    this.durationMSec = -1
    this.lastWeight = 0
  }

  const MotionCtor = Live2DMotion as unknown as Cubism2Live2DMotionConstructor
  MotionCtor.prototype = new options.AMotion() as unknown as Cubism2Live2DMotionInstance
  MotionCtor.VISIBLE_PREFIX = VISIBLE_PREFIX
  MotionCtor.LAYOUT_PREFIX = LAYOUT_PREFIX
  MotionCtor.MTN_PREFIX_FADEIN = 'FADEIN:'
  MotionCtor.MTN_PREFIX_FADEOUT = 'FADEOUT:'
  MotionCtor.nextMotionInstanceId = 0
  MotionCtor.legacyMotionVersion = 1

  /**
   * Parses one MTN motion into a Live2DMotion instance.
   * @param motionData MTN bytes supplied as ArrayBuffer-like object or DataView.
   * @returns Parsed Live2DMotion instance with curve list and duration fields populated.
   */
  MotionCtor.loadMotion = function (
    motionData: ArrayBufferLike | DataView,
  ): Cubism2Live2DMotionInstance {
    var motionDataView = normalizeMotionDataView(motionData)
    var motion = new MotionCtor()
    var parsedOffsetRef = [0]
    var byteLength = motionDataView.byteLength
    motion.maxCurveValueCount = 0
    for (var byteOffset = 0; byteOffset < byteLength; ++byteOffset) {
      var currentChar = readMotionByteChar(motionDataView, byteOffset)
      var currentCharCode = currentChar.charCodeAt(0)
      if (isMotionLineBreak(currentChar)) {
        continue
      }
      if (currentChar === '#') {
        for (; byteOffset < byteLength; ++byteOffset) {
          if (isMotionLineBreak(readMotionByteChar(motionDataView, byteOffset))) {
            break
          }
        }
        continue
      }
      if (currentChar === '$') {
        var settingStartOffset = byteOffset
        var settingEqualsOffset = -1
        for (; byteOffset < byteLength; ++byteOffset) {
          currentChar = readMotionByteChar(motionDataView, byteOffset)
          if (isMotionLineBreak(currentChar)) {
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
            readMotionByteChar(motionDataView, settingStartOffset + 1) === 'f' &&
            readMotionByteChar(motionDataView, settingStartOffset + 2) === 'p' &&
            readMotionByteChar(motionDataView, settingStartOffset + 3) === 's'
          ) {
            isFpsSetting = true
          }
          for (byteOffset = settingEqualsOffset + 1; byteOffset < byteLength; ++byteOffset) {
            currentChar = readMotionByteChar(motionDataView, byteOffset)
            if (isMotionLineBreak(currentChar)) {
              break
            }
            if (isMotionValueSeparator(currentChar)) {
              continue
            }
            var settingValue = parseAsciiFloat(
              motionDataView,
              byteLength,
              byteOffset,
              parsedOffsetRef,
            )
            var settingEndOffset = parsedOffsetRef[0] ?? 0
            if (settingEndOffset > 0 && isFpsSetting && 5 < settingValue && settingValue < 121) {
              motion.setFramesPerSecond(settingValue)
            }
            byteOffset = settingEndOffset - 1
          }
        }
        for (; byteOffset < byteLength; ++byteOffset) {
          if (isMotionLineBreak(readMotionByteChar(motionDataView, byteOffset))) {
            break
          }
        }
        continue
      }
      if (isMotionKeyStart(currentCharCode, currentChar)) {
        var keyStartOffset = byteOffset
        var keyEqualsOffset = -1
        for (; byteOffset < byteLength; ++byteOffset) {
          currentChar = readMotionByteChar(motionDataView, byteOffset)
          if (isMotionLineBreak(currentChar)) {
            break
          }
          if (currentChar === '=') {
            keyEqualsOffset = byteOffset
            break
          }
        }
        if (keyEqualsOffset >= 0) {
          var curve = classifyMotionCurve(motionDataView, keyStartOffset, keyEqualsOffset)
          motion.motions.push(curve)
          var valueCount = 0
          var parsedValues: number[] = []
          for (byteOffset = keyEqualsOffset + 1; byteOffset < byteLength; ++byteOffset) {
            currentChar = readMotionByteChar(motionDataView, byteOffset)
            if (isMotionLineBreak(currentChar)) {
              break
            }
            if (isMotionValueSeparator(currentChar)) {
              continue
            }
            var curveValue = parseAsciiFloat(motionDataView, byteLength, byteOffset, parsedOffsetRef)
            var parsedValueEndOffset = parsedOffsetRef[0] ?? 0
            if (parsedValueEndOffset > 0) {
              parsedValues.push(curveValue)
              valueCount++
              if (parsedValueEndOffset < byteOffset) {
                console.log('Parsed motion value offset moved backwards in Live2DMotion.loadMotion()\n')
                break
              }
              byteOffset = parsedValueEndOffset - 1
            }
          }
          setMotionCurveKeyframeValues(curve, new Float32Array(parsedValues))
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
   * Reads motion duration for one-shot playback.
   * @returns `-1` for looping motions, otherwise parsed MTN duration in milliseconds.
   */
  MotionCtor.prototype.getDurationMSec = function (): number {
    return this.loopEnabled ? -1 : this.durationMSec
  }

  /**
   * Reads full parsed MTN duration for loop scheduling.
   * @returns Parsed MTN duration in milliseconds.
   */
  MotionCtor.prototype.getLoopDurationMSec = function (): number {
    return this.durationMSec
  }

  /**
   * Dumps the first parsed values of each curve using the legacy debug shape.
   */
  MotionCtor.prototype.dump = function (): void {
    for (var curveIndex = 0; curveIndex < this.motions.length; curveIndex++) {
      var curve = this.motions[curveIndex]!
      var curveValues = curve.keyframeValues!
      console.log('motionCurve[%s] [%d]. ', curve.targetId, curveValues.length)
      for (var valueIndex = 0; valueIndex < curveValues.length && valueIndex < 10; valueIndex++) {
        console.log('%5.2f ,', curveValues[valueIndex])
      }
      console.log('\n')
    }
  }

  /**
   * Applies parsed MTN curves to a Cubism2 model for the current queue time.
   * @param model Model object receiving parameter writes.
   * @param userTimeMillis Current user-time timestamp in milliseconds.
   * @param blendedWeight Weight already computed by AMotion fade logic.
   * @param motionQueueEntry Queue entry carrying motion start and finish state.
   */
  MotionCtor.prototype.updateParamExe = function (
    model: Cubism2MotionModelLike,
    userTimeMillis: number,
    blendedWeight: number,
    motionQueueEntry: Cubism2MotionQueueEntryInstance,
  ): void {
    var elapsedMillis = userTimeMillis - motionQueueEntry.startTimeMillis
    var framePosition = (elapsedMillis * this.framesPerSecond) / 1000
    var frameIndex = framePosition | 0
    var frameBlend = framePosition - frameIndex
    for (var curveIndex = 0; curveIndex < this.motions.length; curveIndex++) {
      var curve = this.motions[curveIndex]!
      var curveValues = curve.keyframeValues!
      var valueCount = curveValues.length
      var curveTargetId = curve.targetId!
      if (isMotionCurveVisible(curve, MotionCurve)) {
        var visibilityValue = curveValues[frameIndex >= valueCount ? valueCount - 1 : frameIndex]!
        model.setParamFloat(curveTargetId, visibilityValue)
      } else if (isMotionCurveLayout(curve, MotionCurve)) {
        continue
      } else {
        var paramIndex = model.getParamIndex(curveTargetId)
        var modelContext = model.getModelContext()
        var paramMax = modelContext.getParamMax(paramIndex)
        var paramMin = modelContext.getParamMin(paramIndex)
        var jumpThresholdRatio = 0.4
        var jumpThreshold = jumpThresholdRatio * (paramMax - paramMin)
        var currentParamValue = modelContext.getParamFloat(paramIndex)
        var currentCurveValue = curveValues[frameIndex >= valueCount ? valueCount - 1 : frameIndex]!
        var nextCurveValue = curveValues[frameIndex + 1 >= valueCount ? valueCount - 1 : frameIndex + 1]!
        var interpolatedCurveValue
        if (
          (currentCurveValue < nextCurveValue && nextCurveValue - currentCurveValue > jumpThreshold) ||
          (currentCurveValue > nextCurveValue && currentCurveValue - nextCurveValue > jumpThreshold)
        ) {
          interpolatedCurveValue = currentCurveValue
        } else {
          interpolatedCurveValue =
            currentCurveValue + (nextCurveValue - currentCurveValue) * frameBlend
        }
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
    this.lastWeight = blendedWeight
  }

  /**
   * Reads whether this motion loops.
   * @returns True when loop playback is enabled.
   */
  MotionCtor.prototype.isLoop = function (): boolean {
    return this.loopEnabled
  }

  /**
   * Sets whether this motion should loop after its parsed duration.
   * @param loop True to loop the motion.
   */
  MotionCtor.prototype.setLoop = function (loop: boolean): void {
    this.loopEnabled = loop
  }

  /**
   * Reads frames per second parsed from the `$fps` setting.
   * @returns Motion frames per second.
   */
  MotionCtor.prototype.getFramesPerSecond = function (): number {
    return this.framesPerSecond
  }

  /**
   * Sets frames per second used by frame-position calculations.
   * @param framesPerSecond Target frames per second.
   */
  MotionCtor.prototype.setFramesPerSecond = function (framesPerSecond: number): void {
    this.framesPerSecond = framesPerSecond
  }

  /**
   * Reads whether looping motions reset fade-in on each loop.
   * @returns True when loop fade-in is enabled.
   */
  MotionCtor.prototype.isLoopFadeIn = function (): boolean {
    return this.loopFadeIn
  }

  /**
   * Sets whether looping motions reset fade-in on each loop.
   * @param enabled True to restart fade-in after each loop.
   */
  MotionCtor.prototype.setLoopFadeIn = function (enabled: boolean): void {
    this.loopFadeIn = enabled
  }

  return {
    Cubism2MotionCurve: MotionCurve,
    Cubism2MotionFloatArray: MotionFloatArray,
    Live2DMotion: MotionCtor,
    MotionTextReader,
  }
}
