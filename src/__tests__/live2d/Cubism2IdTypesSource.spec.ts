import { describe, expect, it } from 'vitest'

import { createCubism2IdTypes } from '../../components/blog/live2d/vendor/cubism2Core/idTypes'

describe('Cubism2 ID types immutable source behavior', () => {
  it('preserves reviewed idTypes.ts source behavior through semantic TypeScript', () => {
    const constructors = createCubism2IdTypes({ isBootstrapping: () => false })
    const resetOrder: string[] = []
    constructors.ParamID.resetParamIdCache = () => {
      resetOrder.push('param')
    }
    constructors.BaseDataID.resetCache = () => {
      resetOrder.push('base')
    }
    constructors.DrawDataID.resetDrawDataIdCache = () => {
      resetOrder.push('draw')
    }
    constructors.PartsDataID.resetPartsDataIdCache = () => {
      resetOrder.push('parts')
    }

    constructors.Cubism2IdBase.resetAllIdCaches()

    expect(resetOrder).toEqual(['param', 'base', 'draw', 'parts'])
    expect(constructors.BaseDataID.getDefaultBaseDataID()).toBe(
      constructors.BaseDataID.getDefaultBaseDataID(),
    )
  })

  it('intentional source bug fix: deterministically clears plain-object caches and the sentinel', () => {
    const constructors = createCubism2IdTypes({ isBootstrapping: () => false })
    const previousIds = [
      constructors.ParamID.getID('PARAM_ANGLE_X'),
      constructors.BaseDataID.getID('BASE'),
      constructors.DrawDataID.getID('DRAW'),
      constructors.PartsDataID.getID('PARTS'),
    ]
    const previousDefault = constructors.BaseDataID.getDefaultBaseDataID()

    expect(() => constructors.Cubism2IdBase.resetAllIdCaches()).not.toThrow()
    expect(Object.keys(constructors.ParamID.idCache)).toEqual([])
    expect(Object.keys(constructors.BaseDataID.idCache)).toEqual([])
    expect(Object.keys(constructors.DrawDataID.idCache)).toEqual([])
    expect(Object.keys(constructors.PartsDataID.idCache)).toEqual([])
    expect(constructors.BaseDataID.defaultBaseDataId).toBeNull()
    expect(constructors.ParamID.getID('PARAM_ANGLE_X')).not.toBe(previousIds[0])
    expect(constructors.BaseDataID.getDefaultBaseDataID()).not.toBe(previousDefault)
  })
})
