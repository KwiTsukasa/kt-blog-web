export interface Cubism2PartsDataInstance {
  visible: boolean
  locked: boolean
  partsId: unknown | null
  baseDataList: unknown[] | null
  drawDataList: unknown[] | null
  initializePartsDataLists: () => void
  readPartsData: (reader: Cubism2PartsDataReader) => void
  createPartsContext: (modelContext: unknown) => Cubism2PartsContextInstance
  addBaseData: (baseData: unknown) => void
  addDrawData: (drawData: unknown) => void
  setBaseDataList: (baseDataList: unknown[] | null) => void
  setDrawDataList: (drawDataList: unknown[] | null) => void
  isVisible: () => boolean
  isLocked: () => boolean
  setVisible: (visible: boolean) => void
  setLocked: (locked: boolean) => void
  getBaseDataList: () => unknown[] | null
  getDrawDataList: () => unknown[] | null
  getPartsID: () => unknown | null
  getPartsIDForModelLookup: () => unknown | null
  setPartsIDViaMpSlot: (partsId: unknown) => void
  setPartsIDViaObSlot: (partsId: unknown) => void
}

export interface Cubism2PartsDataLinkRecordInstance {
  partsId: unknown | null
  baseDataList: unknown[] | null
  drawDataList: unknown[] | null
  getBaseDataList: () => unknown[] | null
  getDrawDataList: () => unknown[] | null
  readPartsDataLinks: (reader: Cubism2PartsDataReader) => void
  transferAndClearListsToPartsData: (partsData: Cubism2PartsDataInstance) => void
}

export interface Cubism2PartsContextInstance {
  partsOpacity: number | null
  partsData: Cubism2PartsDataInstance | null | undefined
  getPartsOpacity: () => number | null
  setPartsOpacity: (opacity: number) => void
}

export interface Cubism2PartsDataReader {
  readBit: () => boolean
  readObject: () => unknown
}

export type Cubism2PartsDataConstructor = {
  instanceCount: number
  new (): Cubism2PartsDataInstance
  prototype: Cubism2PartsDataInstance
}

export type Cubism2PartsDataLinkRecordConstructor = {
  recordCount: number
  new (): Cubism2PartsDataLinkRecordInstance
  prototype: Cubism2PartsDataLinkRecordInstance
}

export type Cubism2PartsContextConstructor = {
  new (partsData?: Cubism2PartsDataInstance): Cubism2PartsContextInstance
  prototype: Cubism2PartsContextInstance
}

export interface CreateCubism2PartsDataOptions {
  isBootstrapping: () => boolean
}

export interface Cubism2PartsDataConstructors {
  Cubism2PartsContext: Cubism2PartsContextConstructor
  Cubism2PartsData: Cubism2PartsDataConstructor
  Cubism2PartsDataLinkRecord: Cubism2PartsDataLinkRecordConstructor
}

/**
 * Creates Cubism2 parts-data constructors used by model initialization and draw opacity.
 * @param options Runtime hook that preserves the legacy prototype-bootstrap guard.
 * @returns Parts-data constructors bound to the supplied bootstrapping guard.
 */
export function createCubism2PartsData(
  options: CreateCubism2PartsDataOptions,
): Cubism2PartsDataConstructors {
  /**
   * Empty legacy prototype base used by the original Cubism2 parts context.
   */
  function Cubism2PartsContextBase(): void {}

  /**
   * Temporary type-142 MOC record that links shared base/draw lists into parts data.
   */
  const Cubism2PartsDataLinkRecord: Cubism2PartsDataLinkRecordConstructor =
    function (this: Cubism2PartsDataLinkRecordInstance): void {
      if (options.isBootstrapping()) {
        return
      }
      this.partsId = null
      this.baseDataList = null
      this.drawDataList = null
      Cubism2PartsDataLinkRecord.recordCount++
    } as unknown as Cubism2PartsDataLinkRecordConstructor

  Cubism2PartsDataLinkRecord.recordCount = 0

  /**
   * Reads the linked base-data list from the type-142 handoff record.
   * @returns Shared base-data list that should be assigned to the matching parts-data object.
   */
  Cubism2PartsDataLinkRecord.prototype.getBaseDataList = function (): unknown[] | null {
    return this.baseDataList
  }

  /**
   * Reads the linked draw-data list from the type-142 handoff record.
   * @returns Shared draw-data list that should be assigned to the matching parts-data object.
   */
  Cubism2PartsDataLinkRecord.prototype.getDrawDataList = function (): unknown[] | null {
    return this.drawDataList
  }

  /**
   * Reads the parts-data link record that carries shared draw/base data lists.
   * @param reader Cubism2 binary reader positioned at the type-142 link payload.
   */
  Cubism2PartsDataLinkRecord.prototype.readPartsDataLinks = function (
    reader: Cubism2PartsDataReader,
  ): void {
    this.partsId = reader.readObject()
    this.drawDataList = reader.readObject() as unknown[] | null
    this.baseDataList = reader.readObject() as unknown[] | null
  }

  /**
   * Moves linked base/draw data lists into a resolved parts-data object.
   * @param partsData Target type-133 Cubism2 parts-data object receiving the shared lists.
   */
  Cubism2PartsDataLinkRecord.prototype.transferAndClearListsToPartsData = function (
    partsData: Cubism2PartsDataInstance,
  ): void {
    partsData.setBaseDataList(this.baseDataList)
    partsData.setDrawDataList(this.drawDataList)
    this.baseDataList = null
    this.drawDataList = null
  }

  /**
   * Stores one Cubism2 parts block, including its parts ID, visibility, base list, and draw list.
   */
  function Cubism2PartsData(this: Cubism2PartsDataInstance): void {
    if (options.isBootstrapping()) {
      return
    }
    this.visible = true
    this.locked = false
    this.partsId = null
    this.baseDataList = null
    this.drawDataList = null
    PartsData.instanceCount++
  }

  const PartsData = Cubism2PartsData as unknown as Cubism2PartsDataConstructor
  PartsData.instanceCount = 0

  /**
   * Allocates empty base/draw data lists before child objects are appended by the reader.
   */
  PartsData.prototype.initializePartsDataLists = function (): void {
    this.baseDataList = new Array()
    this.drawDataList = new Array()
  }

  /**
   * Reads a type-133 parts-data payload from the Cubism2 binary stream.
   * @param reader Cubism2 binary reader positioned at the parts-data payload.
   */
  PartsData.prototype.readPartsData = function (reader: Cubism2PartsDataReader): void {
    this.locked = reader.readBit()
    this.visible = reader.readBit()
    this.partsId = reader.readObject()
    this.baseDataList = reader.readObject() as unknown[] | null
    this.drawDataList = reader.readObject() as unknown[] | null
  }

  /**
   * Creates the runtime parts context paired with this parts-data definition.
   * @param modelContext Reserved legacy init argument supplied by the SDK object initializer.
   * @returns Runtime parts context with initial opacity derived from the stored visibility flag.
   */
  PartsData.prototype.createPartsContext = function (
    modelContext: unknown,
  ): Cubism2PartsContextInstance {
    void modelContext
    var partsContext = new PartsContext(this)
    partsContext.setPartsOpacity(this.isVisible() ? 1 : 0)
    return partsContext
  }

  /**
   * Appends one base-data object while the type-133 parts-data body is being assembled.
   * @param baseData Base data object referenced by this parts block.
   */
  PartsData.prototype.addBaseData = function (baseData: unknown): void {
    if (this.baseDataList == null) {
      throw new Error('Base-data list is not initialized before addBaseData')
    }
    this.baseDataList.push(baseData)
  }

  /**
   * Appends one draw-data object while the type-133 parts-data body is being assembled.
   * @param drawData Draw data object referenced by this parts block.
   */
  PartsData.prototype.addDrawData = function (drawData: unknown): void {
    if (this.drawDataList == null) {
      throw new Error('Draw-data list is not initialized before addDrawData')
    }
    this.drawDataList.push(drawData)
  }

  /**
   * Replaces the base-data list after a link-record handoff.
   * @param baseDataList Resolved Cubism2 base-data list shared by this parts block.
   */
  PartsData.prototype.setBaseDataList = function (baseDataList: unknown[] | null): void {
    this.baseDataList = baseDataList
  }

  /**
   * Replaces the draw-data list after a link-record handoff.
   * @param drawDataList Resolved Cubism2 draw-data list shared by this parts block.
   */
  PartsData.prototype.setDrawDataList = function (drawDataList: unknown[] | null): void {
    this.drawDataList = drawDataList
  }

  /**
   * Reads the stored default visibility for this Cubism2 parts block.
   * @returns True when the part should start visible.
   */
  PartsData.prototype.isVisible = function (): boolean {
    return this.visible
  }

  /**
   * Reads whether this Cubism2 part is locked in the authored model.
   * @returns True when the part is locked.
   */
  PartsData.prototype.isLocked = function (): boolean {
    return this.locked
  }

  /**
   * Updates the stored default visibility flag used when initializing parts opacity.
   * @param visible True when the parts context should start visible.
   */
  PartsData.prototype.setVisible = function (visible: boolean): void {
    this.visible = visible
  }

  /**
   * Updates the authored lock state stored before visibility in the MOC payload.
   * @param locked True when the part is locked.
   */
  PartsData.prototype.setLocked = function (locked: boolean): void {
    this.locked = locked
  }

  /**
   * Returns the base-data list consumed by ModelContext while building runtime base tables.
   * @returns List of base-data definitions for this parts block.
   */
  PartsData.prototype.getBaseDataList = function (): unknown[] | null {
    return this.baseDataList
  }

  /**
   * Returns the draw-data list consumed by ModelContext while building draw order tables.
   * @returns List of draw-data definitions for this parts block.
   */
  PartsData.prototype.getDrawDataList = function (): unknown[] | null {
    return this.drawDataList
  }

  /**
   * Reads the public parts ID used by runtime parts lookup.
   * @returns Parts ID object/string for this Cubism2 parts block.
   */
  PartsData.prototype.getPartsID = function (): unknown | null {
    return this.partsId
  }

  /**
   * Reads the parts ID used by model-context lookup construction.
   * @returns Parts ID object/string for this Cubism2 parts block.
   */
  PartsData.prototype.getPartsIDForModelLookup = function (): unknown | null {
    return this.partsId
  }

  /**
   * Writes the parts ID through the source object's first setter slot.
   * @param partsId Parts ID object/string for this Cubism2 parts block.
   */
  PartsData.prototype.setPartsIDViaObSlot = function (partsId: unknown): void {
    this.partsId = partsId
  }

  /**
   * Writes the parts ID through the source object's second setter slot.
   * @param partsId Parts ID object/string for this Cubism2 parts block.
   */
  PartsData.prototype.setPartsIDViaMpSlot = function (partsId: unknown): void {
    this.partsId = partsId
  }

  /**
   * Stores the runtime state paired with one Cubism2 parts-data definition.
   * @param partsData Parts-data definition that created this runtime context.
   */
  function Cubism2PartsContext(
    this: Cubism2PartsContextInstance,
    partsData?: Cubism2PartsDataInstance,
  ): void {
    this.partsOpacity = null
    this.partsData = null
    this.partsData = partsData
  }

  const PartsContext = Cubism2PartsContext as unknown as Cubism2PartsContextConstructor
  PartsContext.prototype = Object.create(
    Cubism2PartsContextBase.prototype,
  ) as Cubism2PartsContextInstance

  /**
   * Reads the current parts opacity used by draw contexts.
   * @returns Opacity multiplier for every drawable under this parts block.
   */
  PartsContext.prototype.getPartsOpacity = function (): number | null {
    return this.partsOpacity
  }

  /**
   * Updates the current parts opacity used by draw contexts.
   * @param opacity Opacity multiplier resolved from initial visibility or model state updates.
   */
  PartsContext.prototype.setPartsOpacity = function (opacity: number): void {
    this.partsOpacity = opacity
  }

  return {
    Cubism2PartsContext: PartsContext,
    Cubism2PartsData: PartsData,
    Cubism2PartsDataLinkRecord,
  }
}
