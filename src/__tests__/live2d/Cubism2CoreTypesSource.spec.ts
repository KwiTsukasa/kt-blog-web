import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { createCubism2CoreTypes } from '../../components/blog/live2d/vendor/cubism2Core/coreTypes'
import type { Cubism2MocObjectConstructor } from '../../components/blog/live2d/vendor/cubism2Core/coreTypes'

/** Creates a constructor that records the exact type-tag branch selected by the core owner. */
function createTaggedConstructor(
  label: string,
  constructionOrder: string[],
): Cubism2MocObjectConstructor {
  return class TaggedMocObject {
    readonly label = label

    /** Records construction so each switch branch can be distinguished without a helper factory. */
    constructor() {
      constructionOrder.push(label)
    }
  }
}

describe('Cubism2 core-types immutable source behavior', () => {
  it('preserves reviewed coreTypes.ts source behavior through semantic TypeScript', () => {
    const constructionOrder: string[] = []
    const constructors = {
      Cubism2GridBaseData: createTaggedConstructor('grid', constructionOrder),
      Cubism2MeshDrawData: createTaggedConstructor('mesh', constructionOrder),
      Cubism2ModelImpl: createTaggedConstructor('model', constructionOrder),
      Cubism2ParamBinding: createTaggedConstructor('binding', constructionOrder),
      Cubism2ParamBindingSet: createTaggedConstructor('binding-set', constructionOrder),
      Cubism2ParamDefinition: createTaggedConstructor('definition', constructionOrder),
      Cubism2ParamDefinitionSet: createTaggedConstructor('definition-set', constructionOrder),
      Cubism2PartsData: createTaggedConstructor('parts', constructionOrder),
      Cubism2PartsDataLinkRecord: createTaggedConstructor('parts-link', constructionOrder),
      Cubism2TransformBaseData: createTaggedConstructor('transform-base', constructionOrder),
      Cubism2TransformValue: createTaggedConstructor('transform-value', constructionOrder),
    }
    const { Cubism2MocVersion } = createCubism2CoreTypes({
      ...constructors,
      isBootstrapping: () => false,
    })
    const expectedBranches = [
      [65, 'grid'],
      [66, 'binding-set'],
      [67, 'binding'],
      [68, 'transform-base'],
      [69, 'transform-value'],
      [70, 'mesh'],
      [131, 'definition'],
      [133, 'parts'],
      [136, 'model'],
      [137, 'definition-set'],
      [142, 'parts-link'],
    ] as const

    for (const [typeTag, expectedLabel] of expectedBranches) {
      expect(Cubism2MocVersion.createObjectByTypeTag(typeTag)).toMatchObject({
        label: expectedLabel,
      })
    }
    expect(constructionOrder).toEqual(expectedBranches.map(([, label]) => label))

    const unsupportedLogger = vi.fn()
    Cubism2MocVersion.logUnsupportedTypeTag = unsupportedLogger
    let comparisonCount = 0
    const coercibleTypeTag = {
      /** Counts every source range comparison before the second switch rejects this value. */
      valueOf() {
        comparisonCount += 1
        return 120
      },
    } as unknown as number
    expect(Cubism2MocVersion.createObjectByTypeTag(coercibleTypeTag)).toBeNull()
    expect(comparisonCount).toBe(5)
    expect(unsupportedLogger).toHaveBeenCalledOnce()
    expect(unsupportedLogger).toHaveBeenCalledWith(coercibleTypeTag)

    const constructorError = new Error('model construction failed')
    const failingCoreTypes = createCubism2CoreTypes({
      ...constructors,
      Cubism2ModelImpl: class FailingModelImpl {
        /** Proves constructor exceptions escape the direct tag branch without interception. */
        constructor() {
          throw constructorError
        }
      },
      isBootstrapping: () => false,
    })
    expect(() => failingCoreTypes.Cubism2MocVersion.createObjectByTypeTag(136)).toThrow(
      constructorError,
    )

    const coreSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/coreTypes.ts',
      ),
      'utf8',
    )
    const capsuleSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/blog/live2d/vendor/cubism2Core/runtimeCore.ts',
      ),
      'utf8',
    )
    const removedHelperOwnerPath = resolve(
      process.cwd(),
      'src/components/blog/live2d/vendor/cubism2Core/mocObjectFactory.ts',
    )

    expect(coreSource).not.toContain('options.createObjectByTypeTag')
    expect(coreSource).not.toContain('isSupportedCubism2MocObjectTypeTag')
    expect(coreSource).not.toMatch(/["']_\$/)
    expect(capsuleSource).not.toMatch(/createVersionedMocObjectByTypeTag|deferredMocObjectFactory/)
    expect(existsSync(removedHelperOwnerPath)).toBe(false)
  })
})
