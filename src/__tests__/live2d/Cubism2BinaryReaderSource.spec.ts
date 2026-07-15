import { describe, expect, it } from 'vitest'

import { createCubism2BinaryReader } from '../../components/blog/live2d/vendor/cubism2Core/binaryReader'

class TestCoreError extends Error {}

class IntegerValue {
  constructor(
    readonly value: number,
    readonly signed: boolean,
  ) {}
}

class CapturedValue {
  readonly values: unknown[]

  constructor(...values: unknown[]) {
    this.values = values
  }
}

/** Creates the reader constructor with deterministic semantic test dependencies. */
function createReaderConstructor() {
  const idConstructor = { getID: (value: unknown) => ({ value }) }
  return createCubism2BinaryReader({
    Cubism2CoreError: TestCoreError,
    Cubism2MocVersion: {
      OBJECT_REFERENCE_TYPE_TAG: 99,
      createObjectByTypeTag: () => null,
    },
    idConstructors: {
      BaseDataID: idConstructor,
      DrawDataID: idConstructor,
      ParamID: idConstructor,
      PartsDataID: idConstructor,
    },
    isBootstrapping: () => false,
    valueConstructors: {
      affineTransformConstructor: CapturedValue,
      floatRectangleConstructor: CapturedValue,
      integerValueConstructor: IntegerValue,
      pointConstructor: CapturedValue,
      rectangleConstructor: CapturedValue,
      xyValueConstructor: CapturedValue,
    },
  })
}

describe('Cubism2 binary-reader immutable source behavior', () => {
  it('preserves reviewed binaryReader.ts source behavior through semantic TypeScript', () => {
    const Cubism2BinaryReader = createReaderConstructor()
    const bytes = new Uint8Array([0b10100000, 42, 0x81, 0x02])
    const reader = new Cubism2BinaryReader(new DataView(bytes.buffer))

    expect([reader.readBit(), reader.readBit(), reader.readBit()]).toEqual([true, false, true])
    expect(reader.readInt8()).toBe(42)
    expect(reader.readVariableLengthIntRaw()).toBe(130)
    reader.setFormatVersion(210)
    expect(reader.getFormatVersion()).toBe(210)
    expect(reader.offset).toBe(4)
    expect(reader.bitOffset).toBe(0)

    const integerReader = new Cubism2BinaryReader(new DataView(new ArrayBuffer(4)))
    expect(integerReader.readValueForTypeTag(10)).toEqual(new IntegerValue(0, true))
    expect(integerReader.objectCache).toEqual([])
    expect(integerReader.readObjectByTypeTag(0)).toBeNull()
    expect(integerReader.objectCache).toEqual([null])
    expect(() => integerReader.readValueForTypeTag(29)).toThrow(TestCoreError)
  })

  it('preserves object-reference lookup and primitive offset advancement', () => {
    const Cubism2BinaryReader = createReaderConstructor()
    const buffer = new ArrayBuffer(18)
    const view = new DataView(buffer)
    view.setInt32(0, 0)
    view.setFloat32(4, 1.25)
    view.setFloat64(8, 2.5)
    view.setInt16(16, -7)
    const reader = new Cubism2BinaryReader(view)
    const cached = { cached: true }
    reader.objectCache.push(cached)

    expect(reader.readObjectByTypeTag(99)).toBe(cached)
    expect(reader.readFloat32()).toBe(1.25)
    expect(reader.readFloat64()).toBe(2.5)
    expect(reader.readInt16()).toBe(-7)
    expect(reader.offset).toBe(18)
  })
})
