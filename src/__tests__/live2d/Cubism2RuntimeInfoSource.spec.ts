import { describe, expect, it, vi } from 'vitest'

import { createCubism2BrowserRuntimeInfo } from '../../components/blog/live2d/vendor/cubism2Core/runtimeInfo'

describe('Cubism2 browser runtime-info immutable source behavior', () => {
  it('preserves reviewed runtimeInfo.ts source behavior through semantic TypeScript', () => {
    const logger = { logWithLegacyPrefix: vi.fn() }
    const RuntimeInfo = createCubism2BrowserRuntimeInfo({
      logger,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X)',
    })

    expect(RuntimeInfo.SYSTEM_INFO).toBeNull()
    expect(RuntimeInfo.isIPhone()).toBe(true)
    expect(RuntimeInfo.isIOS()).toBe(true)
    expect(RuntimeInfo.isAndroid()).toBeUndefined()
    expect(RuntimeInfo.getOS()).toBe('iOS')
    expect(RuntimeInfo.getOSVersion()).toBe(17_004_001)
    expect(RuntimeInfo.SYSTEM_INFO).toMatchObject({
      isIPhone: true,
      os: 'iPhone',
      version: 17_004_001,
    })
    expect(logger.logWithLegacyPrefix).not.toHaveBeenCalled()
  })

  it('preserves Android, unknown, and malformed iPad parsing branches', () => {
    const android = createCubism2BrowserRuntimeInfo({
      logger: { logWithLegacyPrefix: vi.fn() },
      userAgent: 'Mozilla/5.0 (Linux; Android 14.2.3; Device)',
    })
    expect([android.isAndroid(), android.getOS(), android.getOSVersion()]).toEqual([
      true,
      'Android',
      14_002_003,
    ])

    const unknown = createCubism2BrowserRuntimeInfo({
      logger: { logWithLegacyPrefix: vi.fn() },
      userAgent: 'CustomDesktop/1.0',
    })
    expect([unknown.getOS(), unknown.getOSVersion()]).toEqual(['Unknown OS', -1])

    const logWithLegacyPrefix = vi.fn()
    const malformedIPad = createCubism2BrowserRuntimeInfo({
      logger: { logWithLegacyPrefix },
      userAgent: 'Mozilla iPad without cpu marker',
    })
    malformedIPad.setup()
    expect(logWithLegacyPrefix).toHaveBeenCalledWith(
      ' err : Mozilla iPad without cpu marker @UtHtml5.setup()',
    )
    expect(malformedIPad.getOS()).toBe('Unknown OS')
  })
})
