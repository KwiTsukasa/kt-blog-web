import { describe, expect, it, vi } from 'vitest'

import { createCubism2RuntimeUtilities } from '../../components/blog/live2d/vendor/cubism2Core/runtimeUtilities'

describe('Cubism2 runtime utilities immutable source behavior', () => {
  it('preserves reviewed runtimeUtilities.ts source behavior through semantic TypeScript', () => {
    const log = vi.fn()
    const runtime = createCubism2RuntimeUtilities({ logger: { log }, now: () => 25 })
    runtime.UtDebug.timerRecords.timer = {
      startedAtMillis: null,
      timerName: 'timer',
    }

    expect(runtime.UtDebug.dump('timer')).toBe(25)
    expect(log).toHaveBeenCalledWith('timer : 25ms')
    expect(runtime.UtDebug.end('timer')).toBe(25)

    const overlappingValues = [1, 2, 3, 4]
    runtime.UtSystem.copyArraySegmentForward(overlappingValues, 0, overlappingValues, 1, 3)
    expect(overlappingValues).toEqual([1, 1, 1, 1])
  })

  it('intentional source bug fix: keeps a semantic prefix while restoring fixed logger arity', () => {
    const log = vi.fn()
    const { UtDebug } = createCubism2RuntimeUtilities({ logger: { log } })

    ;(UtDebug.logWithLegacyPrefix as (...args: unknown[]) => void)(
      'message',
      'payload',
      'ignored',
    )

    expect(UtDebug.logWithLegacyPrefix.length).toBe(2)
    expect(log).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith('legacyLog : message\n', 'payload')
  })

  it('intentional source bug fix: uses the semantic clock and safely catches ordinary errors', () => {
    const { UtSystem } = createCubism2RuntimeUtilities()
    UtSystem.getTimeMSec = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(1).mockReturnValueOnce(2)

    expect(() => UtSystem.busyWaitWithBareClockLookup(2)).not.toThrow()
    expect(UtSystem.getTimeMSec).toHaveBeenCalledTimes(3)

    UtSystem.getTimeMSec = () => {
      throw new Error('clock failed')
    }
    expect(() => UtSystem.busyWaitWithBareClockLookup(1)).not.toThrow()
  })
})
