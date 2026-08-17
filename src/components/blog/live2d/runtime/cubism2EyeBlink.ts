import type { Live2DCoreModel } from './live2dRuntimeTypes'

const DEFAULT_BLINK_INTERVAL_MILLIS = 4_000
const DEFAULT_CLOSING_MILLIS = 100
const DEFAULT_CLOSED_MILLIS = 50
const DEFAULT_OPENING_MILLIS = 150

type EyeBlinkState = 'closed' | 'closing' | 'first' | 'interval' | 'opening'
type EyeBlinkModel = Pick<Live2DCoreModel, 'setParamFloat'>

export interface Cubism2EyeBlink {
  setBlinkDurations(closingMillis: number, closedMillis: number, openingMillis: number): void
  setBlinkInterval(blinkIntervalMillis: number): void
  update(model: EyeBlinkModel): void
}

export interface CreateCubism2EyeBlinkOptions {
  now?: () => number
  random?: () => number
}

/**
 * 创建按时钟与随机间隔驱动双眼开合参数的 Cubism2 眨眼状态机。
 * @param options - 控制可选分支、阈值或适配器的参数；未提供时使用 `{}`。
 * @returns 新建的按时钟与随机间隔驱动双眼开合参数的 Cubism2 眨眼状态机，包含 `setBlinkDurations`、`setBlinkInterval`、`update` 等字段。
 */
export function createCubism2EyeBlink(options: CreateCubism2EyeBlinkOptions = {}): Cubism2EyeBlink {
  const now = options.now ?? Date.now
  const random = options.random ?? Math.random
  let state: EyeBlinkState = 'first'
  let nextBlinkMillis = 0
  let stateStartMillis = 0
  let blinkIntervalMillis = DEFAULT_BLINK_INTERVAL_MILLIS
  let closingMillis = DEFAULT_CLOSING_MILLIS
  let closedMillis = DEFAULT_CLOSED_MILLIS
  let openingMillis = DEFAULT_OPENING_MILLIS

  /*
   * Calculates the source-compatible absolute timestamp for the next blink.
   * @returns Next blink time in milliseconds.
   */
  const calculateNextBlinkMillis = (): number => now() + random() * (2 * blinkIntervalMillis - 1)

  return {
    /**
     * 在 `createCubism2EyeBlink` 中，替换 Cubism2 闭眼、保持闭合与睁眼三个阶段的持续毫秒数。
     * @param nextClosingMillis - 写入 `closingMillis` 的`nextClosingMillis`。
     * @param nextClosedMillis - 写入 `closedMillis` 的`nextClosedMillis`。
     * @param nextOpeningMillis - 写入 `openingMillis` 的`nextOpeningMillis`。
     */
    setBlinkDurations(nextClosingMillis, nextClosedMillis, nextOpeningMillis) {
      closingMillis = nextClosingMillis
      closedMillis = nextClosedMillis
      openingMillis = nextOpeningMillis
    },
    /**
     * 眨眼调度器通过替换随机间隔基准，控制下一次 Cubism2 眨眼的等待范围。
     * @param nextBlinkIntervalMillis - 新的两次眨眼间隔基准毫秒数。
     */
    setBlinkInterval(nextBlinkIntervalMillis) {
      blinkIntervalMillis = nextBlinkIntervalMillis
    },
    /**
     * 在 `createCubism2EyeBlink` 中，按当前帧推进 Cubism2 动作参数与过渡状态。
     * @param model - 待驱动、投影或渲染的模型实例。
     */
    update(model) {
      const currentTimeMillis = now()
      let eyeOpenValue = 1
      let phaseProgress = 0

      switch (state) {
        case 'closing':
          phaseProgress = (currentTimeMillis - stateStartMillis) / closingMillis
          if (phaseProgress >= 1) {
            phaseProgress = 1
            state = 'closed'
            stateStartMillis = currentTimeMillis
          }
          eyeOpenValue = 1 - phaseProgress
          break
        case 'closed':
          phaseProgress = (currentTimeMillis - stateStartMillis) / closedMillis
          if (phaseProgress >= 1) {
            state = 'opening'
            stateStartMillis = currentTimeMillis
          }
          eyeOpenValue = 0
          break
        case 'opening':
          phaseProgress = (currentTimeMillis - stateStartMillis) / openingMillis
          if (phaseProgress >= 1) {
            phaseProgress = 1
            state = 'interval'
            nextBlinkMillis = calculateNextBlinkMillis()
          }
          eyeOpenValue = phaseProgress
          break
        case 'interval':
          if (nextBlinkMillis < currentTimeMillis) {
            state = 'closing'
            stateStartMillis = currentTimeMillis
          }
          break
        case 'first':
        default:
          state = 'interval'
          nextBlinkMillis = calculateNextBlinkMillis()
          break
      }

      model.setParamFloat('PARAM_EYE_L_OPEN', eyeOpenValue)
      model.setParamFloat('PARAM_EYE_R_OPEN', eyeOpenValue)
    },
  }
}
