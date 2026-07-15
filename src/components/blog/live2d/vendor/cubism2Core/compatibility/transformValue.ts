export interface Cubism2TransformValueMocVersionLike {
  LIVE2D_FORMAT_VERSION_V2_10_SDK2: number
}

export interface Cubism2TransformValueReader {
  getFormatVersion: () => number
  readBoolean: () => boolean
  readFloat32: () => number
}

export interface Cubism2TransformValueInstance {
  copyFrom: (transformValue: Cubism2TransformValueLike) => void
  emptyLifecycleHook: () => void
  readTransformValue: (reader: Cubism2TransformValueReader) => void
  reflectX: boolean
  reflectY: boolean
  rotationDegrees: number
  scaleX: number
  scaleY: number
  translationX: number
  translationY: number
}

export interface Cubism2TransformValueLike {
  reflectX: boolean
  reflectY: boolean
  rotationDegrees: number
  scaleX: number
  scaleY: number
  translationX: number
  translationY: number
}

export interface Cubism2TransformValueConstructor {
  new (): Cubism2TransformValueInstance
  prototype: Cubism2TransformValueInstance
}

export interface CreateCubism2TransformValueOptions {
  Cubism2MocVersion: Cubism2TransformValueMocVersionLike
  isBootstrapping: () => boolean
}

/**
 * Creates the type-69 Cubism2 transform-value constructor used by transform base data.
 * @param options Runtime dependencies for format-version-gated reflection flags and prototype bootstrapping.
 * @returns Transform-value constructor bound to the supplied compatibility dependencies.
 */
export function createCubism2TransformValue(
  options: CreateCubism2TransformValueOptions,
): Cubism2TransformValueConstructor {
  /**
   * Stores one authored transform sample from a type-69 MOC object.
   */
  function Cubism2TransformValue(this: Cubism2TransformValueInstance): void {
    if (options.isBootstrapping()) {
      return
    }

    this.translationX = 0
    this.translationY = 0
    this.scaleX = 1
    this.scaleY = 1
    this.rotationDegrees = 0
    this.reflectX = false
    this.reflectY = false
  }

  const TransformValue = Cubism2TransformValue as unknown as Cubism2TransformValueConstructor

  /**
   * Copies an authored transform sample into this interpolation slot.
   * @param transformValue Source sample selected from the transform grid corner table.
   * @returns Nothing; this object receives translation, scale, rotation, and reflection flags.
   */
  TransformValue.prototype.copyFrom = function (transformValue: Cubism2TransformValueLike): void {
    this.translationX = transformValue.translationX
    this.translationY = transformValue.translationY
    this.scaleX = transformValue.scaleX
    this.scaleY = transformValue.scaleY
    this.rotationDegrees = transformValue.rotationDegrees
    this.reflectX = transformValue.reflectX
    this.reflectY = transformValue.reflectY
  }

  /**
   * Reads a type-69 transform sample from the Cubism2 MOC binary stream.
   * @param reader Cubism2 binary reader positioned at the transform-value payload.
   * @returns Nothing; reflection flags are present only in SDK2 v2.10+ payloads.
   */
  TransformValue.prototype.readTransformValue = function (
    reader: Cubism2TransformValueReader,
  ): void {
    this.translationX = reader.readFloat32()
    this.translationY = reader.readFloat32()
    this.scaleX = reader.readFloat32()
    this.scaleY = reader.readFloat32()
    this.rotationDegrees = reader.readFloat32()

    if (reader.getFormatVersion() >= options.Cubism2MocVersion.LIVE2D_FORMAT_VERSION_V2_10_SDK2) {
      this.reflectX = reader.readBoolean()
      this.reflectY = reader.readBoolean()
    }
  }

  /**
   * Preserves the source-proven empty lifecycle slot on transform samples.
   * @returns Nothing; the source hook has no side effects.
   */
  TransformValue.prototype.emptyLifecycleHook = function (): void {}

  return TransformValue
}
