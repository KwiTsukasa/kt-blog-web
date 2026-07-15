interface Cubism2RuntimeInfoLogger {
  logWithLegacyPrefix: (message: string) => void
}

interface Cubism2BrowserSystemInfo {
  userAgent: string
  os?: string
  isIPhone?: boolean
  isIPad?: boolean
  isAndroid?: boolean
  version?: number
}

interface Cubism2BrowserRuntimeInfoConstructor {
  new (): unknown
  SYSTEM_INFO: Cubism2BrowserSystemInfo | null
  USER_AGENT: string
  isIPhone: () => boolean | undefined
  isIOS: () => boolean | undefined
  isAndroid: () => boolean | undefined
  getOSVersion: () => number | undefined
  getOS: () => string
  setup: () => void
}

export interface CreateCubism2BrowserRuntimeInfoOptions {
  logger: Cubism2RuntimeInfoLogger
  userAgent: string
}

/**
 * Creates the browser runtime detector used by the legacy Cubism2 SDK.
 * @param options Runtime dependencies sourced from the min.js capsule.
 * @returns Cubism2 browser runtime info constructor with static detection helpers.
 */
export function createCubism2BrowserRuntimeInfo(
  options: CreateCubism2BrowserRuntimeInfoOptions,
): Cubism2BrowserRuntimeInfoConstructor {
  /**
   * Legacy static holder for user-agent-derived browser and OS data.
   */
  function Cubism2BrowserRuntimeInfo(): void {}

  const RuntimeInfo = Cubism2BrowserRuntimeInfo as unknown as Cubism2BrowserRuntimeInfoConstructor
  RuntimeInfo.SYSTEM_INFO = null
  RuntimeInfo.USER_AGENT = options.userAgent

  /**
   * Ensures `SYSTEM_INFO` has been parsed before a getter reads it.
   * @returns Parsed browser system info.
   */
  function ensureSystemInfo(): Cubism2BrowserSystemInfo {
    if (!RuntimeInfo.SYSTEM_INFO) {
      RuntimeInfo.setup()
    }
    return RuntimeInfo.SYSTEM_INFO!
  }

  /**
   * Parses an OS version from a user-agent substring into the legacy integer encoding.
   * @param userAgent User-agent string being parsed.
   * @param versionStartIndex Offset where the version number starts.
   * @returns Encoded version number using the original `major*1000000 + minor*1000 + patch` layout.
   */
  function parseOsVersion(userAgent: string, versionStartIndex: number): number {
    const versionParts = userAgent.substring(versionStartIndex).split(/[ _,;.]/)
    let encodedVersion = 0
    for (let partIndex = 0; partIndex <= 2; partIndex++) {
      const versionPart = versionParts[partIndex]
      if (versionPart == null || isNaN(Number(versionPart))) {
        break
      }
      const parsedVersionPart = parseInt(versionPart)
      if (parsedVersionPart < 0 || parsedVersionPart > 999) {
        options.logger.logWithLegacyPrefix('err : ' + parsedVersionPart + ' @UtHtml5.setup()')
        encodedVersion = 0
        break
      }
      encodedVersion += parsedVersionPart * Math.pow(1000, 2 - partIndex)
    }
    return encodedVersion
  }

  /**
   * @returns True when the parsed user-agent is iPhone.
   */
  RuntimeInfo.isIPhone = function (): boolean | undefined {
    return ensureSystemInfo().isIPhone
  }

  /**
   * @returns True when the parsed user-agent is iPhone or iPad.
   */
  RuntimeInfo.isIOS = function (): boolean | undefined {
    const systemInfo = ensureSystemInfo()
    return systemInfo.isIPhone || systemInfo.isIPad
  }

  /**
   * @returns True when the parsed user-agent is Android.
   */
  RuntimeInfo.isAndroid = function (): boolean | undefined {
    return ensureSystemInfo().isAndroid
  }

  /**
   * @returns Encoded OS version from the parsed user-agent.
   */
  RuntimeInfo.getOSVersion = function (): number | undefined {
    return ensureSystemInfo().version
  }

  /**
   * @returns Legacy OS label used by Cubism2 rendering branches.
   */
  RuntimeInfo.getOS = function (): string {
    const systemInfo = ensureSystemInfo()
    if (systemInfo.isIPhone || systemInfo.isIPad) {
      return 'iOS'
    }
    if (systemInfo.isAndroid) {
      return 'Android'
    }
      return 'Unknown OS'
  }

  /**
   * Parses the user-agent and caches the legacy browser runtime information.
   * @returns Nothing; mutates `SYSTEM_INFO`.
   */
  RuntimeInfo.setup = function (): void {
    const userAgent = RuntimeInfo.USER_AGENT
    const systemInfo: Cubism2BrowserSystemInfo = (RuntimeInfo.SYSTEM_INFO = {
      userAgent,
    })
    let matchIndex = userAgent.indexOf('iPhone OS ')
    if (matchIndex >= 0) {
      systemInfo.os = 'iPhone'
      systemInfo.isIPhone = true
      systemInfo.version = parseOsVersion(userAgent, matchIndex + 'iPhone OS '.length)
      return
    }

    matchIndex = userAgent.indexOf('iPad')
    if (matchIndex >= 0) {
      matchIndex = userAgent.indexOf('CPU OS')
      if (matchIndex < 0) {
        options.logger.logWithLegacyPrefix(' err : ' + userAgent + ' @UtHtml5.setup()')
        return
      }
      systemInfo.os = 'iPad'
      systemInfo.isIPad = true
      systemInfo.version = parseOsVersion(userAgent, matchIndex + 'CPU OS '.length)
      return
    }

    matchIndex = userAgent.indexOf('Android')
    if (matchIndex >= 0) {
      systemInfo.os = 'Android'
      systemInfo.isAndroid = true
      systemInfo.version = parseOsVersion(userAgent, matchIndex + 'Android '.length)
      return
    }

    systemInfo.os = '-'
    systemInfo.version = -1
  }

  return RuntimeInfo
}
