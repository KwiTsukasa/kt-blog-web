import { describe, expect, it } from 'vitest'

import { createCubism2ParamDefinitions } from '../../../src/components/blog/live2d/vendor/cubism2Core/paramDefinition'

describe('Cubism2 parameter-definition immutable source behavior', () => {
  it('preserves reviewed paramDefinition.ts source behavior through semantic TypeScript', () => {
    const { Cubism2ParamDefinition, Cubism2ParamDefinitionSet } = createCubism2ParamDefinitions({
      isBootstrapping: () => false,
    })
    const definition = new Cubism2ParamDefinition()
    const operations: string[] = []
    const observedDefinition = new Proxy(definition, {
      set(target, property, value, receiver) {
        operations.push(`write:${String(property)}:${String(value)}`)
        return Reflect.set(target, property, value, receiver)
      },
    })
    const floatValues = [-1, 1, 0]
    Cubism2ParamDefinition.prototype.readParamDefinition.call(observedDefinition, {
      readFloat32: () => {
        const value = floatValues.shift()!
        operations.push(`read:float:${value}`)
        return value
      },
      readObject: () => {
        operations.push('read:id')
        return 'PARAM_ANGLE_X'
      },
    })

    expect(operations).toEqual([
      'read:float:-1',
      'write:minValue:-1',
      'read:float:1',
      'write:maxValue:1',
      'read:float:0',
      'write:defaultValue:0',
      'read:id',
      'write:paramId:PARAM_ANGLE_X',
    ])
    expect([
      definition.getMinValue(),
      definition.getMaxValue(),
      definition.getDefaultValue(),
      definition.getParamID(),
    ]).toEqual([-1, 1, 0, 'PARAM_ANGLE_X'])

    const definitionSet = new Cubism2ParamDefinitionSet()
    expect(definitionSet.getParamDefinitions()).toBeNull()
    definitionSet.initializeParamDefinitions()
    definitionSet.addParamDefinition(definition)
    expect(definitionSet.getParamDefinitions()).toEqual([definition])
    const replacement = [new Cubism2ParamDefinition()]
    definitionSet.readParamDefinitionSet({
      readFloat32: () => 0,
      readObject: () => replacement,
    })
    expect(definitionSet.getParamDefinitions()).toBe(replacement)
  })

  it('preserves the prototype bootstrap guard for both constructors', () => {
    const { Cubism2ParamDefinition, Cubism2ParamDefinitionSet } = createCubism2ParamDefinitions({
      isBootstrapping: () => true,
    })

    expect(Object.keys(new Cubism2ParamDefinition())).toEqual([])
    expect(Object.keys(new Cubism2ParamDefinitionSet())).toEqual([])
  })
})
