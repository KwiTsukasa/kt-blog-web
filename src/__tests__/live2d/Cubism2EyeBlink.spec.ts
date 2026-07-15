import { describe, expect, it, vi } from 'vitest'

import { createCubism2EyeBlink } from '../../components/blog/live2d/runtime/cubism2EyeBlink'

describe('Cubism2 eye blink', () => {
  it('replays the source close-hold-open state sequence', () => {
    let currentTimeMillis = 1_000
    const setParamFloat = vi.fn()
    const eyeBlink = createCubism2EyeBlink({
      now: () => currentTimeMillis,
      random: () => 0,
    })

    eyeBlink.update({ setParamFloat })
    currentTimeMillis = 1_001
    eyeBlink.update({ setParamFloat })
    currentTimeMillis = 1_101
    eyeBlink.update({ setParamFloat })
    currentTimeMillis = 1_151
    eyeBlink.update({ setParamFloat })
    currentTimeMillis = 1_301
    eyeBlink.update({ setParamFloat })

    expect(setParamFloat.mock.calls.filter(([id]) => id === 'PARAM_EYE_L_OPEN'))
      .toEqual([
        ['PARAM_EYE_L_OPEN', 1],
        ['PARAM_EYE_L_OPEN', 1],
        ['PARAM_EYE_L_OPEN', 0],
        ['PARAM_EYE_L_OPEN', 0],
        ['PARAM_EYE_L_OPEN', 1],
      ])
    expect(setParamFloat).toHaveBeenCalledTimes(10)
  })
})
