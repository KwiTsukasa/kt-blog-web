interface Cubism2BinaryReaderInstance {
  byteScratchBuffer: Int8Array
  bitOffset: number
  bitBuffer: number
  dataView: DataView
  formatVersion: number
  getFormatVersion: () => number
  objectCache: unknown[]
  offset: number
  scratchDataView: DataView
  stringScratchBuffer: Int8Array
  flushBitReadCursor: () => void
  readBoolean: () => boolean
  readBit: () => boolean
  readFloat32: () => number
  readFloat32Array: () => Float32Array
  readFloat64: () => number
  readFloat64Array: () => Float64Array
  readInt8: () => number
  readInt16: () => number
  readInt32: () => number
  readInt32Array: () => Int32Array
  readObject: () => unknown
  readObjectByTypeTag: (typeId: number) => unknown
  readString: () => string | undefined
  readUnsupportedLong: () => never
  readValueForTypeTag: (typeId: number) => unknown
  readVariableLengthInt: () => number
  readVariableLengthIntRaw: () => number
  setFormatVersion: (formatVersion: number) => void
}

export interface Cubism2BinaryReaderConstructor {
  new (dataView: DataView): Cubism2BinaryReaderInstance
  prototype: Cubism2BinaryReaderInstance
}

interface Cubism2CoreErrorConstructor {
  new (message: string): unknown
}

interface Cubism2MocVersionConstructor {
  OBJECT_REFERENCE_TYPE_TAG: number
  createObjectByTypeTag: (typeTag: number) => unknown | null
}

interface Cubism2VersionedValue {
  readGridBaseData?: (reader: Cubism2BinaryReaderInstance) => void
  readMeshDrawData?: (reader: Cubism2BinaryReaderInstance) => void
  readModelData?: (reader: Cubism2BinaryReaderInstance) => void
  readParamBinding?: (reader: Cubism2BinaryReaderInstance) => void
  readParamBindingSet?: (reader: Cubism2BinaryReaderInstance) => void
  readParamDefinition?: (reader: Cubism2BinaryReaderInstance) => void
  readParamDefinitionSet?: (reader: Cubism2BinaryReaderInstance) => void
  readPartsData?: (reader: Cubism2BinaryReaderInstance) => void
  readPartsDataLinks?: (reader: Cubism2BinaryReaderInstance) => void
  readTransformBaseData?: (reader: Cubism2BinaryReaderInstance) => void
  readTransformValue?: (reader: Cubism2BinaryReaderInstance) => void
}

interface Cubism2IdConstructor {
  getID: (idText: string | undefined) => unknown
}

type Cubism2ValueConstructor = new (...args: any[]) => unknown

export interface CreateCubism2BinaryReaderOptions {
  Cubism2CoreError: Cubism2CoreErrorConstructor
  Cubism2MocVersion: Cubism2MocVersionConstructor
  idConstructors: {
    BaseDataID: Cubism2IdConstructor
    DrawDataID: Cubism2IdConstructor
    ParamID: Cubism2IdConstructor
    PartsDataID: Cubism2IdConstructor
  }
  isBootstrapping: () => boolean
  valueConstructors: {
    affineTransformConstructor: Cubism2ValueConstructor
    floatRectangleConstructor: Cubism2ValueConstructor
    integerValueConstructor: Cubism2ValueConstructor
    pointConstructor: Cubism2ValueConstructor
    rectangleConstructor: Cubism2ValueConstructor
    xyValueConstructor: Cubism2ValueConstructor
  }
}

const TYPE_TAG_NULL = 0
const TYPE_TAG_STRING = 1
const TYPE_TAG_INTEGER = 10
const TYPE_TAG_FLOAT_RECT_64 = 11
const TYPE_TAG_FLOAT_RECT_32 = 12
const TYPE_TAG_POINT_64 = 13
const TYPE_TAG_POINT_32 = 14
const TYPE_TAG_OBJECT_ARRAY = 15
const TYPE_TAG_SECONDARY_INT32_ARRAY = 16
const TYPE_TAG_AFFINE_TRANSFORM = 17
const TYPE_TAG_RECTANGLE = 21
const TYPE_TAG_XY_VALUE = 22
const TYPE_TAG_THROWING_LEGACY_BRANCH = 23
const TYPE_TAG_INT32_ARRAY = 25
const TYPE_TAG_FLOAT64_ARRAY = 26
const TYPE_TAG_FLOAT32_ARRAY = 27
const TYPE_TAG_DRAW_DATA_ID = 50
const TYPE_TAG_BASE_DATA_ID = 51
const TYPE_TAG_PARAM_ID = 60
const TYPE_TAG_GRID_BASE_DATA = 65
const TYPE_TAG_PARAM_BINDING_SET = 66
const TYPE_TAG_PARAM_BINDING = 67
const TYPE_TAG_TRANSFORM_BASE_DATA = 68
const TYPE_TAG_TRANSFORM_VALUE = 69
const TYPE_TAG_MESH_DRAW_DATA = 70
const TYPE_TAG_PARAM_DEFINITION = 131
const TYPE_TAG_PARTS_DATA_ID = 134
const TYPE_TAG_PARTS_DATA = 133
const VERSIONED_OBJECT_TAG_MIN = 48
const TYPE_TAG_MODEL_IMPL = 136
const TYPE_TAG_PARAM_DEFINITION_SET = 137
const TYPE_TAG_PARTS_DATA_LINK_RECORD = 142

const UNSUPPORTED_RESERVED_TAGS = new Set([
  2, 3, 4, 5, 6, 7, 8, 9, 18, 19, 20, 24, 28,
])

/**
 * Deserializes a versioned MOC object through the semantic reader selected by its type tag.
 * @param versionedValue Newly constructed versioned MOC object.
 * @param typeTag Numeric MOC object type tag that selected the constructor.
 * @param reader Binary reader positioned at the object's payload.
 */
function readVersionedMocObject(
  versionedValue: Cubism2VersionedValue,
  typeTag: number,
  reader: Cubism2BinaryReaderInstance,
): void {
  switch (typeTag) {
    case TYPE_TAG_GRID_BASE_DATA:
      versionedValue.readGridBaseData?.(reader)
      break
    case TYPE_TAG_PARAM_BINDING_SET:
      versionedValue.readParamBindingSet?.(reader)
      break
    case TYPE_TAG_PARAM_BINDING:
      versionedValue.readParamBinding?.(reader)
      break
    case TYPE_TAG_TRANSFORM_BASE_DATA:
      versionedValue.readTransformBaseData?.(reader)
      break
    case TYPE_TAG_TRANSFORM_VALUE:
      versionedValue.readTransformValue?.(reader)
      break
    case TYPE_TAG_MESH_DRAW_DATA:
      versionedValue.readMeshDrawData?.(reader)
      break
    case TYPE_TAG_PARAM_DEFINITION:
      versionedValue.readParamDefinition?.(reader)
      break
    case TYPE_TAG_PARTS_DATA:
      versionedValue.readPartsData?.(reader)
      break
    case TYPE_TAG_MODEL_IMPL:
      versionedValue.readModelData?.(reader)
      break
    case TYPE_TAG_PARAM_DEFINITION_SET:
      versionedValue.readParamDefinitionSet?.(reader)
      break
    case TYPE_TAG_PARTS_DATA_LINK_RECORD:
      versionedValue.readPartsDataLinks?.(reader)
      break
  }
}

/**
 * Creates the MOC binary reader used by the min.js-derived Cubism2 runtime.
 * @param options Legacy constructors and static helpers injected by the runtime Core composition.
 * @returns Binary reader constructor with prototype methods matching the original SDK surface.
 */
export function createCubism2BinaryReader(
  options: CreateCubism2BinaryReaderOptions,
): Cubism2BinaryReaderConstructor {
  const {
    Cubism2CoreError,
    Cubism2MocVersion,
    idConstructors,
    valueConstructors,
  } = options
  const { BaseDataID, DrawDataID, ParamID, PartsDataID } = idConstructors
  const {
    affineTransformConstructor,
    floatRectangleConstructor,
    integerValueConstructor,
    pointConstructor,
    rectangleConstructor,
    xyValueConstructor,
  } = valueConstructors
  const objectReferenceTypeTag = Cubism2MocVersion.OBJECT_REFERENCE_TYPE_TAG
  let canUseTypedStringBuffer = true

  /**
   * Reads the compact Cubism2 MOC binary format used by the legacy WordPress model assets.
   * @param dataView Backing binary view; callers normalize ArrayBuffer before construction.
   */
  function Cubism2BinaryReader(this: Cubism2BinaryReaderInstance, dataView: DataView): void {
    if (options.isBootstrapping()) {
      return
    }
    this.byteScratchBuffer = new Int8Array(8)
    this.scratchDataView = new DataView(this.byteScratchBuffer.buffer)
    this.stringScratchBuffer = new Int8Array(1000)
    this.bitOffset = 0
    this.bitBuffer = 0
    this.formatVersion = 0
    this.objectCache = new Array()
    this.dataView = dataView
    this.offset = 0
  }

  const BinaryReader = Cubism2BinaryReader as unknown as Cubism2BinaryReaderConstructor

  /**
   * Reads a compact unsigned integer encoded in one to four 7-bit continuation bytes.
   * @returns Decoded integer value used for tags, lengths, and object references.
   */
  BinaryReader.prototype.readVariableLengthIntRaw = function (): number {
    const firstByte = this.readInt8()
    let secondByte, thirdByte, fourthByte
    if ((firstByte & 128) == 0) {
      return firstByte & 255
    } else {
      if (((secondByte = this.readInt8()) & 128) == 0) {
        return ((firstByte & 127) << 7) | (secondByte & 127)
      } else {
        if (((thirdByte = this.readInt8()) & 128) == 0) {
          return ((firstByte & 127) << 14) | ((secondByte & 127) << 7) | (thirdByte & 255)
        } else {
          if (((fourthByte = this.readInt8()) & 128) == 0) {
            return (
              ((firstByte & 127) << 21) |
              ((secondByte & 127) << 14) |
              ((thirdByte & 127) << 7) |
              (fourthByte & 255)
            )
          } else {
            throw new Cubism2CoreError('Invalid variable-length integer encoding')
          }
        }
      }
    }
  }

  /**
   * @returns MOC format version currently selected for this reader.
   */
  BinaryReader.prototype.getFormatVersion = function (): number {
    return this.formatVersion
  }

  /**
   * Stores the MOC format version so later tagged-value readers can branch safely.
   * @param formatVersion Version byte read after the `moc` file magic.
   */
  BinaryReader.prototype.setFormatVersion = function (formatVersion: number): void {
    this.formatVersion = formatVersion
  }

  /**
   * @returns Decoded variable-length integer from the byte stream.
   */
  BinaryReader.prototype.readVariableLengthInt = function (): number {
    return this.readVariableLengthIntRaw()
  }

  /**
   * Reads one 64-bit floating point value from the current byte-aligned offset.
   * @returns Float64 value and advances the byte offset by eight.
   */
  BinaryReader.prototype.readFloat64 = function (): number {
    this.flushBitReadCursor()
    this.offset += 8
    return this.dataView.getFloat64(this.offset - 8)
  }

  /**
   * Reads one 32-bit floating point value from the current byte-aligned offset.
   * @returns Float32 value and advances the byte offset by four.
   */
  BinaryReader.prototype.readFloat32 = function (): number {
    this.flushBitReadCursor()
    this.offset += 4
    return this.dataView.getFloat32(this.offset - 4)
  }

  /**
   * Reads one signed 32-bit integer from the current byte-aligned offset.
   * @returns Signed integer and advances the byte offset by four.
   */
  BinaryReader.prototype.readInt32 = function (): number {
    this.flushBitReadCursor()
    this.offset += 4
    return this.dataView.getInt32(this.offset - 4)
  }

  /**
   * Reads one signed byte from the current byte-aligned offset.
   * @returns Signed byte and advances the byte offset by one.
   */
  BinaryReader.prototype.readInt8 = function (): number {
    this.flushBitReadCursor()
    return this.dataView.getInt8(this.offset++)
  }

  /**
   * Reads one signed 16-bit integer from the current byte-aligned offset.
   * @returns Signed int16 and advances the byte offset by two.
   */
  BinaryReader.prototype.readInt16 = function (): number {
    this.flushBitReadCursor()
    this.offset += 2
    return this.dataView.getInt16(this.offset - 2)
  }

  /**
   * Preserves the legacy unsupported long-reader branch while keeping offset behavior intact.
   * @throws Cubism2CoreError because this SDK build never implemented 64-bit integer decoding.
   */
  BinaryReader.prototype.readUnsupportedLong = function (): never {
    this.flushBitReadCursor()
    this.offset += 8
    throw new Cubism2CoreError('Binary reader does not support 64-bit integer values')
  }

  /**
   * Reads one boolean flag encoded as a non-zero signed byte.
   * @returns True when the next byte is not zero.
   */
  BinaryReader.prototype.readBoolean = function (): boolean {
    this.flushBitReadCursor()
    return this.dataView.getInt8(this.offset++) != 0
  }

  /**
   * Reads a length-prefixed byte string from the MOC payload.
   * @returns JavaScript string reconstructed from byte character codes.
   */
  BinaryReader.prototype.readString = function (): string | undefined {
    this.flushBitReadCursor()
    const length = this.readVariableLengthInt()
    let typedCharCodes: Uint16Array | null = null
    if (canUseTypedStringBuffer) {
      try {
        const typedBuffer = new ArrayBuffer(length * 2)
        typedCharCodes = new Uint16Array(typedBuffer)
        for (let index = 0; index < length; ++index) {
          typedCharCodes[index] = this.dataView.getUint8(this.offset++)
        }
        return String.fromCharCode.apply(null, typedCharCodes as unknown as number[])
      } catch (error) {
        canUseTypedStringBuffer = false
      }
    }
    try {
      const fallbackCharCodes = new Array()
      if (typedCharCodes == null) {
        for (let index = 0; index < length; ++index) {
          fallbackCharCodes[index] = this.dataView.getUint8(this.offset++)
        }
      } else {
        for (let index = 0; index < length; ++index) {
          fallbackCharCodes[index] = typedCharCodes[index]
        }
      }
      return String.fromCharCode.apply(null, fallbackCharCodes)
    } catch (error) {
      console.log('Failed to read UTF-8 string: ' + error)
    }
  }

  /**
   * Reads a length-prefixed Int32Array from the current payload offset.
   * @returns Int32Array used by index lists and other model metadata.
   */
  BinaryReader.prototype.readInt32Array = function (): Int32Array {
    this.flushBitReadCursor()
    const length = this.readVariableLengthInt()
    const values = new Int32Array(length)
    for (let index = 0; index < length; index++) {
      values[index] = this.dataView.getInt32(this.offset)
      this.offset += 4
    }
    return values
  }

  /**
   * Reads a length-prefixed Float32Array from the current payload offset.
   * @returns Float32Array used by vertices, UVs, opacity, and motion data.
   */
  BinaryReader.prototype.readFloat32Array = function (): Float32Array {
    this.flushBitReadCursor()
    const length = this.readVariableLengthInt()
    const values = new Float32Array(length)
    for (let index = 0; index < length; index++) {
      values[index] = this.dataView.getFloat32(this.offset)
      this.offset += 4
    }
    return values
  }

  /**
   * Reads a length-prefixed Float64Array from the current payload offset.
   * @returns Float64Array used by high-precision model structures.
   */
  BinaryReader.prototype.readFloat64Array = function (): Float64Array {
    this.flushBitReadCursor()
    const length = this.readVariableLengthInt()
    const values = new Float64Array(length)
    for (let index = 0; index < length; index++) {
      values[index] = this.dataView.getFloat64(this.offset)
      this.offset += 8
    }
    return values
  }

  /**
   * Reads one tagged Cubism2 object or primitive value using the next encoded type tag.
   * @returns Decoded value, with non-reference values appended to the object cache.
   */
  BinaryReader.prototype.readObject = function (): unknown {
    return this.readObjectByTypeTag(-1)
  }

  /**
   * Reads one tagged value, optionally using a caller-supplied type tag.
   * @param typeId Type tag to decode, or a negative value to read the tag from the stream.
   * @returns Decoded object, primitive, ID wrapper, typed array, or cached object reference.
   */
  BinaryReader.prototype.readObjectByTypeTag = function (typeId: number): unknown {
    this.flushBitReadCursor()
    let valueTypeId = typeId
    if (valueTypeId < 0) {
      valueTypeId = this.readVariableLengthInt()
    }
    if (valueTypeId == objectReferenceTypeTag) {
      const objectIndex = this.readInt32()
      if (0 <= objectIndex && objectIndex < this.objectCache.length) {
        return this.objectCache[objectIndex]
      } else {
        throw new Cubism2CoreError('Object reference index is out of range')
      }
    } else {
      const value = this.readValueForTypeTag(valueTypeId)
      this.objectCache.push(value)
      return value
    }
  }

  /**
   * Dispatches one concrete non-reference type tag to its Cubism2 value reader.
   * @param typeId MOC binary type tag after object-reference handling has been excluded.
   * @returns Concrete decoded value for the supplied type tag.
   */
  BinaryReader.prototype.readValueForTypeTag = function (typeId: number): unknown {
    if (typeId == TYPE_TAG_NULL) {
      return null
    }
    if (typeId == TYPE_TAG_DRAW_DATA_ID) {
      const drawDataIdText = this.readString()
      return DrawDataID.getID(drawDataIdText)
    } else {
      if (typeId == TYPE_TAG_BASE_DATA_ID) {
        const baseDataIdText = this.readString()
        return BaseDataID.getID(baseDataIdText)
      } else {
        if (typeId == TYPE_TAG_PARTS_DATA_ID) {
          const partsDataIdText = this.readString()
          return PartsDataID.getID(partsDataIdText)
        } else {
          if (typeId == TYPE_TAG_PARAM_ID) {
            const paramIdText = this.readString()
            return ParamID.getID(paramIdText)
          }
        }
      }
    }
    if (typeId >= VERSIONED_OBJECT_TAG_MIN) {
      const versionedValue = Cubism2MocVersion.createObjectByTypeTag(
        typeId,
      ) as Cubism2VersionedValue | null
      if (versionedValue != null) {
        readVersionedMocObject(versionedValue, typeId, this)
        return versionedValue
      } else {
        return null
      }
    }
    switch (typeId) {
      case TYPE_TAG_STRING:
        return this.readString()
      case TYPE_TAG_INTEGER:
        return new integerValueConstructor(this.readInt32(), true)
      case TYPE_TAG_FLOAT_RECT_64:
        return new floatRectangleConstructor(
          this.readFloat64(),
          this.readFloat64(),
          this.readFloat64(),
          this.readFloat64(),
        )
      case TYPE_TAG_FLOAT_RECT_32:
        return new floatRectangleConstructor(
          this.readFloat32(),
          this.readFloat32(),
          this.readFloat32(),
          this.readFloat32(),
        )
      case TYPE_TAG_POINT_64:
        return new pointConstructor(this.readFloat64(), this.readFloat64())
      case TYPE_TAG_POINT_32:
        return new pointConstructor(this.readFloat32(), this.readFloat32())
      case TYPE_TAG_OBJECT_ARRAY: {
        const length = this.readVariableLengthInt()
        const values = new Array(length)
        for (let index = 0; index < length; index++) {
          values[index] = this.readObject()
        }
        return values
      }
      case TYPE_TAG_AFFINE_TRANSFORM:
        return new affineTransformConstructor(
          this.readFloat64(),
          this.readFloat64(),
          this.readFloat64(),
          this.readFloat64(),
          this.readFloat64(),
          this.readFloat64(),
        )
      case TYPE_TAG_RECTANGLE:
        return new rectangleConstructor(
          this.readInt32(),
          this.readInt32(),
          this.readInt32(),
          this.readInt32(),
        )
      case TYPE_TAG_XY_VALUE:
        return new xyValueConstructor(this.readInt32(), this.readInt32())
      case TYPE_TAG_THROWING_LEGACY_BRANCH:
        throw new Error('Unsupported legacy type tag 23')
      case TYPE_TAG_SECONDARY_INT32_ARRAY:
      case TYPE_TAG_INT32_ARRAY:
        return this.readInt32Array()
      case TYPE_TAG_FLOAT64_ARRAY:
        return this.readFloat64Array()
      case TYPE_TAG_FLOAT32_ARRAY:
        return this.readFloat32Array()
      default:
        if (UNSUPPORTED_RESERVED_TAGS.has(typeId)) {
          throw new Cubism2CoreError('Unsupported reserved type tag: ' + typeId)
        }
        throw new Cubism2CoreError('Unknown type tag: ' + typeId)
    }
  }

  /**
   * Reads one bit from the current byte buffer, refilling from the stream when exhausted.
   * @returns Boolean bit value in most-significant-bit-first order.
   */
  BinaryReader.prototype.readBit = function (): boolean {
    if (this.bitOffset == 0) {
      this.bitBuffer = this.readInt8()
    } else {
      if (this.bitOffset == 8) {
        this.bitBuffer = this.readInt8()
        this.bitOffset = 0
      }
    }
    return ((this.bitBuffer >> (7 - this.bitOffset++)) & 1) == 1
  }

  /**
   * Resets bit-level reading before byte-aligned primitive readers consume the stream.
   * @returns Nothing; mutates the bit cursor back to the next byte boundary.
   */
  BinaryReader.prototype.flushBitReadCursor = function (): void {
    if (this.bitOffset != 0) {
      this.bitOffset = 0
    }
  }

  return BinaryReader
}
