export interface Cubism2LegacyWritableTypedArray<TValue extends number> {
  clear: () => void
  getCapacity: () => number
  put: (values: ArrayLike<TValue>) => void
  setWritePosition: (position: number) => void
}

export type Cubism2LegacyWritableFloatBuffer = Float32Array &
  Cubism2LegacyWritableTypedArray<number>
export type Cubism2LegacyWritableIndexBuffer = Int16Array &
  Cubism2LegacyWritableTypedArray<number>

/**
 * Adds the writable-buffer cursor methods that the SDK2 min.js helpers call on typed arrays.
 * @param buffer Typed array allocated for Cubism2 draw-param staging values.
 * @returns The same typed array with the legacy cursor and copy methods installed.
 */
function attachCubism2WritableBuffer<TBuffer extends Float32Array | Int16Array>(
  buffer: TBuffer,
): TBuffer & Cubism2LegacyWritableTypedArray<number> {
  const writableBuffer = buffer as TBuffer & Cubism2LegacyWritableTypedArray<number>
  let cursor = 0

  /**
   * Moves the write cursor to a caller-provided position.
   * @param position New cursor offset used by the next `put` call.
   */
  writableBuffer.setWritePosition = function (position: number): void {
    cursor = position
  }

  /**
   * Reports the backing typed-array capacity.
   * @returns Number of writable slots in the typed array.
   */
  writableBuffer.getCapacity = function (): number {
    return buffer.length
  }

  /**
   * Rewinds the cursor for buffer reuse without clearing the backing data.
   */
  writableBuffer.clear = function (): void {
    cursor = 0
  }

  /**
   * Copies source values into the typed array starting at the current cursor.
   * @param values Draw-param staging values supplied by the Cubism2 renderer path.
   */
  writableBuffer.put = function (values: ArrayLike<number>): void {
    for (let valueIndex = 0; valueIndex < values.length; valueIndex++) {
      buffer[cursor + valueIndex] = values[valueIndex] ?? 0
    }
    cursor += values.length
  }

  return writableBuffer
}

/**
 * Allocates a Float32Array with the SDK2 writable-buffer surface.
 * @param length Number of float slots to allocate.
 * @returns Float buffer that supports min.js `put`, `clear`, position, and capacity calls.
 */
export function createCubism2LegacyWritableFloatBuffer(
  length: number,
): Cubism2LegacyWritableFloatBuffer {
  return attachCubism2WritableBuffer(new Float32Array(length))
}

/**
 * Allocates an Int16Array with the SDK2 writable-buffer surface.
 * @param length Number of index slots to allocate.
 * @returns Index buffer that supports min.js `put`, `clear`, position, and capacity calls.
 */
export function createCubism2LegacyWritableIndexBuffer(
  length: number,
): Cubism2LegacyWritableIndexBuffer {
  return attachCubism2WritableBuffer(new Int16Array(length))
}
