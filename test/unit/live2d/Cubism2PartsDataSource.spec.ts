import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { createCubism2PartsData } from '../../../src/components/blog/live2d/vendor/cubism2Core/partsData'
import type { Cubism2PartsDataInstance } from '../../../src/components/blog/live2d/vendor/cubism2Core/partsData'

describe('Cubism2 parts-data immutable source behavior', () => {
  it('owns every link-record method on the semantic constructor', () => {
    const moduleSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/partsData.ts',
      ),
      'utf8',
    )

    expect(moduleSource).toContain(
      'Cubism2PartsDataLinkRecord.prototype.getBaseDataList = function',
    )
    expect(moduleSource).toContain(
      'Cubism2PartsDataLinkRecord.prototype.getDrawDataList = function',
    )
    expect(moduleSource).toContain(
      'Cubism2PartsDataLinkRecord.prototype.readPartsDataLinks = function',
    )
    expect(moduleSource).toContain(
      'Cubism2PartsDataLinkRecord.prototype.transferAndClearListsToPartsData = function',
    )
    expect(moduleSource).not.toMatch(/\bPartsDataLinkRecord\.prototype/)
  })

  it('preserves reviewed partsData.ts source behavior through semantic TypeScript', () => {
    const { Cubism2PartsDataLinkRecord } = createCubism2PartsData({
      isBootstrapping: vi.fn().mockReturnValue(false),
    })
    const linkRecord = new Cubism2PartsDataLinkRecord()
    const drawDataList = [{ draw: true }]
    const expectedError = new Error('base list read failed')
    const readObject = vi
      .fn()
      .mockReturnValueOnce('parts-id')
      .mockReturnValueOnce(drawDataList)
      .mockImplementationOnce(() => {
        throw expectedError
      })

    expect(() => linkRecord.readPartsDataLinks({ readBit: vi.fn(), readObject })).toThrow(
      expectedError,
    )
    expect(linkRecord).toMatchObject({
      baseDataList: null,
      drawDataList,
      partsId: 'parts-id',
    })
  })

  it('transfers base then draw lists and clears them in the source order', () => {
    const { Cubism2PartsDataLinkRecord } = createCubism2PartsData({
      isBootstrapping: vi.fn().mockReturnValue(false),
    })
    const linkRecord = new Cubism2PartsDataLinkRecord()
    const baseDataList = [{ base: true }]
    const drawDataList = [{ draw: true }]
    const calls: string[] = []
    linkRecord.baseDataList = baseDataList
    linkRecord.drawDataList = drawDataList
    const targetPartsData = {
      setBaseDataList: vi.fn((value: unknown[] | null) => {
        calls.push(`base:${String(value === baseDataList)}`)
      }),
      setDrawDataList: vi.fn((value: unknown[] | null) => {
        calls.push(`draw:${String(value === drawDataList)}`)
      }),
    } as unknown as Cubism2PartsDataInstance

    linkRecord.transferAndClearListsToPartsData(targetPartsData)

    expect(calls).toEqual(['base:true', 'draw:true'])
    expect(linkRecord).toMatchObject({ baseDataList: null, drawDataList: null })
  })

  it('retains the completed parts-data write prefix when a later read throws', () => {
    const { Cubism2PartsData } = createCubism2PartsData({
      isBootstrapping: vi.fn().mockReturnValue(false),
    })
    const partsData = new Cubism2PartsData()
    const baseDataList = [{ base: true }]
    const oldDrawDataList = [{ oldDraw: true }]
    const expectedError = new Error('draw list read failed')
    partsData.drawDataList = oldDrawDataList
    const readBit = vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false)
    const readObject = vi
      .fn()
      .mockReturnValueOnce('parts-id')
      .mockReturnValueOnce(baseDataList)
      .mockImplementationOnce(() => {
        throw expectedError
      })

    expect(() => partsData.readPartsData({ readBit, readObject })).toThrow(expectedError)
    expect(partsData).toMatchObject({
      baseDataList,
      drawDataList: oldDrawDataList,
      locked: true,
      partsId: 'parts-id',
      visible: false,
    })
  })

  it('preserves omitted and explicit undefined parts owners', () => {
    const { Cubism2PartsContext } = createCubism2PartsData({
      isBootstrapping: vi.fn().mockReturnValue(false),
    })

    expect(new Cubism2PartsContext()).toMatchObject({
      partsData: undefined,
      partsOpacity: null,
    })
    expect(new Cubism2PartsContext(undefined).partsData).toBeUndefined()
  })
})
