import { createCubism2EyeBlink } from './cubism2EyeBlink'
import type {
  Live2DCoreModel,
  Live2DCoreMotion,
  Live2DCoreMotionConstructor,
  Live2DHitAreas,
  Live2DModelSettings,
  Live2DMotionQueueManager,
  Live2DMotionSetting,
  MotionQueueManagerConstructor,
} from './live2dRuntimeTypes'

const IDLE_MOTION_PRIORITY = 1
const INTERACTION_MOTION_PRIORITY = 2
const DEFAULT_MOTION_FADE_MILLIS = 1_000

export interface CreateCubism2ModelAnimatorOptions {
  Live2DMotion: Live2DCoreMotionConstructor
  MotionQueueManager: MotionQueueManagerConstructor
  loadMotionBytes(url: string): Promise<ArrayBuffer>
  now?: () => number
  random?: () => number
  settings: Live2DModelSettings
}

export interface Cubism2ModelAnimator {
  preloadMotionGroup(groupName: string): Promise<void>
  setPointerTarget(x: number, y: number): void
  startMotionForPoint(x: number, y: number): Promise<boolean>
  startRandomMotion(groupName: string, priority?: number): Promise<boolean>
  stop(): void
  update(model: Live2DCoreModel): void
}

interface PriorityMotionManager {
  cancelReservation(priority: number): void
  isFinished(): boolean
  reserveMotion(priority: number): boolean
  startMotion(motion: Live2DCoreMotion, priority: number): number
  stopAllMotions(): void
  updateParam(model: Live2DCoreModel): boolean
}

interface Cubism2TargetPoint {
  currentX: number
  currentY: number
  lastUpdateMillis: number
  targetX: number
  targetY: number
  velocityX: number
  velocityY: number
}

/**
 * 创建同时管理动作优先级、眼睛眨动、指针注视和平滑呼吸参数的 Cubism2 动画器。
 * @param options - 控制可选分支、阈值或适配器的参数。
 * @returns 新建的同时管理动作优先级、眼睛眨动、指针注视和平滑呼吸参数的 Cubism2 动画器，包含 `preloadMotionGroup`、`setPointerTarget`、`startMotionForPoint`、`startRandomMotion`、`stop` 等字段。
 */
export function createCubism2ModelAnimator(
  options: CreateCubism2ModelAnimatorOptions,
): Cubism2ModelAnimator {
  const now = options.now ?? Date.now
  const random = options.random ?? Math.random
  const motionManager = createPriorityMotionManager(options.MotionQueueManager)
  const loadingMotions = new Map<string, Promise<Live2DCoreMotion>>()
  const loadedMotions = new Map<string, Live2DCoreMotion>()
  const targetPoint = createTargetPoint()
  const startedAtMillis = now()
  let stopped = false
  const eyeBlink = createCubism2EyeBlink({ now, random })

  /*
   * Resolves one motion setting to its model-relative request URL.
   * @param motion Motion entry read from the model settings.
   * @returns URL accepted by the renderer's binary fetch helper.
   */
  const resolveMotionUrl = (motion: Live2DMotionSetting): string => {
    const baseUrl = (() => {
      if (options.settings.baseUrl.endsWith('/')) {
        return options.settings.baseUrl
      }
      return `${options.settings.baseUrl}/`
    })()
    return `${baseUrl}${motion.file.replace(/^\.\//, '')}`
  }

  /*
   * Loads and parses one MTN once, applying the ModelSettingJson fade defaults from min.js.
   * @param setting Motion entry selected from a named group.
   * @returns Parsed Cubism2 motion ready for the queue.
   */
  const loadMotion = (setting: Live2DMotionSetting): Promise<Live2DCoreMotion> => {
    const motionUrl = resolveMotionUrl(setting)
    const loaded = loadedMotions.get(motionUrl)
    if (loaded) {
      return Promise.resolve(loaded)
    }
    const loading = loadingMotions.get(motionUrl)
    if (loading) {
      return loading
    }
    const nextLoading = options
      .loadMotionBytes(motionUrl)
      .then((motionBytes) => {
        const motion = options.Live2DMotion.loadMotion(motionBytes)
        motion.setFadeIn(setting.fadeIn ?? DEFAULT_MOTION_FADE_MILLIS)
        motion.setFadeOut(setting.fadeOut ?? DEFAULT_MOTION_FADE_MILLIS)
        if (!stopped) {
          loadedMotions.set(motionUrl, motion)
        }
        loadingMotions.delete(motionUrl)
        return motion
      })
      .catch((error: unknown) => {
        loadingMotions.delete(motionUrl)
        throw error
      })
    loadingMotions.set(motionUrl, nextLoading)
    return nextLoading
  }

  /*
   * Starts a selected motion synchronously when it was preloaded, otherwise after its fetch completes.
   * @param setting Motion entry selected from the model group.
   * @param priority Source-compatible idle or interaction priority.
   * @returns Promise resolving true after the motion starts, or false when stopped.
   */
  const startMotion = (setting: Live2DMotionSetting, priority: number): Promise<boolean> => {
    const motionUrl = resolveMotionUrl(setting)
    const loaded = loadedMotions.get(motionUrl)
    if (loaded) {
      motionManager.startMotion(loaded, priority)
      return Promise.resolve(true)
    }
    return loadMotion(setting)
      .then((motion) => {
        if (stopped) {
          motionManager.cancelReservation(priority)
          return false
        }
        motionManager.startMotion(motion, priority)
        return true
      })
      .catch((error: unknown) => {
        motionManager.cancelReservation(priority)
        throw error
      })
  }

  return {
    /**
     * 在 `createCubism2ModelAnimator` 中，并行加载指定 Cubism2 动作分组中的全部 MTN 文件；分组缺失时直接完成。
     * @param groupName - 用于索引 `options.settings.motions` 的分组名称。
     */
    async preloadMotionGroup(groupName) {
      const group = options.settings.motions[groupName] ?? []
      await Promise.all(group.map((setting) => loadMotion(setting)))
    },
    /**
     * 注视平滑器将页面指针对应的横纵目标写入状态，由后续动画帧逐步追踪。
     * @param x - 归一化后的水平注视目标。
     * @param y - 归一化后的垂直注视目标。
     */
    setPointerTarget(x, y) {
      targetPoint.targetX = x
      targetPoint.targetY = y
    },
    /**
     * 在 `createCubism2ModelAnimator` 中，根据模型命中区域选择交互动效，未命中时返回 false。
     * @param x - 待转换或命中测试的横坐标。
     * @param y - 待转换或命中测试的纵坐标。
     * @returns 命中区域对应动作是否成功启动。
     */
    startMotionForPoint(x, y) {
      const groupName = resolveHitMotionGroup(options.settings.hitAreas, x, y)
      if (!groupName) {
        return Promise.resolve(false)
      }
      return this.startRandomMotion(groupName, INTERACTION_MOTION_PRIORITY)
    },
    /**
     * 在 `createCubism2ModelAnimator` 中，启动随机动效；返回指定分组中的随机动作是否成功启动。
     * @param groupName - 用于索引 `options.settings.motions` 的分组名称。
     * @param priority - 决定动作预留或执行顺序的优先级；未提供时使用 `INTERACTION_MOTION_PRIORITY`。
     * @returns 指定分组中的随机动作是否成功启动。
     */
    startRandomMotion(groupName, priority = INTERACTION_MOTION_PRIORITY) {
      const group = options.settings.motions[groupName] ?? []
      if (stopped || group.length === 0 || !motionManager.reserveMotion(priority)) {
        return Promise.resolve(false)
      }
      const motionIndex = Math.floor(random() * group.length)
      const setting = group[motionIndex]
      if (!setting) {
        motionManager.cancelReservation(priority)
        return Promise.resolve(false)
      }
      return startMotion(setting, priority)
    },
    /**
     * 在 `createCubism2ModelAnimator` 中，停止当前 Cubism2 动作并释放动作管理状态。
     */
    stop() {
      stopped = true
      motionManager.stopAllMotions()
      loadingMotions.clear()
      loadedMotions.clear()
    },
    /**
     * 在 `createCubism2ModelAnimator` 中，按当前帧推进 Cubism2 动作参数与过渡状态。
     * @param model - 待驱动、投影或渲染的模型实例。
     */
    update(model) {
      if (motionManager.isFinished()) {
        void this.startRandomMotion('idle', IDLE_MOTION_PRIORITY).catch((error: unknown) => {
          console.warn('[KT Blog] Live2D idle motion failed.', error)
        })
      }

      model.loadParam()
      const motionUpdated = motionManager.updateParam(model)
      if (!motionUpdated) {
        eyeBlink.update(model)
      }
      model.saveParam()

      const currentTimeMillis = now()
      updateTargetPoint(targetPoint, currentTimeMillis)
      const elapsedSeconds = (currentTimeMillis - startedAtMillis) / 1_000
      const phase = elapsedSeconds * 2 * Math.PI
      const dragX = targetPoint.currentX
      const dragY = targetPoint.currentY
      model.addToParamFloat('PARAM_ANGLE_X', dragX * 30, 1)
      model.addToParamFloat('PARAM_ANGLE_Y', dragY * 30, 1)
      model.addToParamFloat('PARAM_ANGLE_Z', dragX * dragY * -30, 1)
      model.addToParamFloat('PARAM_BODY_ANGLE_X', dragX * 10, 1)
      model.addToParamFloat('PARAM_EYE_BALL_X', dragX, 1)
      model.addToParamFloat('PARAM_EYE_BALL_Y', dragY, 1)
      model.addToParamFloat('PARAM_ANGLE_X', Number(15 * Math.sin(phase / 6.5345)), 0.5)
      model.addToParamFloat('PARAM_ANGLE_Y', Number(8 * Math.sin(phase / 3.5345)), 0.5)
      model.addToParamFloat('PARAM_ANGLE_Z', Number(10 * Math.sin(phase / 5.5345)), 0.5)
      model.addToParamFloat('PARAM_BODY_ANGLE_X', Number(4 * Math.sin(phase / 15.5345)), 0.5)
      model.setParamFloat('PARAM_BREATH', Number(0.5 + 0.5 * Math.sin(phase / 3.2345)), 1)
      model.update()
    },
  }
}

/**
 * Cubism2 动作队列通过当前与预留优先级阻止低优先级动作抢占，并在播放结束后重置状态。
 * @param QueueManager - 用于创建 Cubism2 动作队列的构造器。
 * @returns 封装动作预留、播放、取消与重置规则的优先级管理器，包含 `cancelReservation`、`isFinished`、`reserveMotion`、`startMotion`、`stopAllMotions` 等字段。
 */
function createPriorityMotionManager(
  QueueManager: MotionQueueManagerConstructor,
): PriorityMotionManager {
  const queue: Live2DMotionQueueManager = new QueueManager()
  let currentPriority = 0
  let reservedPriority = 0

  return {
    /**
     * 在 `createPriorityMotionManager` 中，仅当给定优先级与当前预留一致时取消 Cubism2 动作预留。
     * @param priority - 决定动作预留或执行顺序的优先级。
     */
    cancelReservation(priority) {
      if (reservedPriority === priority) {
        reservedPriority = 0
      }
    },
    /**
     * 在 `createPriorityMotionManager` 中，读取 Cubism2 动作队列是否已经播放完毕。
     * @returns Cubism2 动作队列是否已结束。
     */
    isFinished() {
      return queue.isFinished()
    },
    /**
     * 仅当新优先级同时高于当前播放和已有预留时占用下一次 Cubism2 动作槽位。
     * @param priority - 准备播放动作的候选优先级。
     * @returns 成功更新预留优先级时为 true，被更高或同级动作阻止时为 false。
     */
    reserveMotion(priority) {
      if (reservedPriority >= priority || currentPriority >= priority) {
        return false
      }
      reservedPriority = priority
      return true
    },
    /**
     * 在 `createPriorityMotionManager` 中，启动动效；返回Cubism2 动作队列返回的动作句柄编号。
     * @param motion - 提交给 Cubism2 动作队列播放的动作实例。
     * @param priority - 决定动作预留或执行顺序的优先级。
     * @returns Cubism2 动作队列返回的动作句柄编号。
     */
    startMotion(motion, priority) {
      if (priority === reservedPriority) {
        reservedPriority = 0
      }
      currentPriority = priority
      return queue.startMotion(motion)
    },
    /**
     * 在 `createPriorityMotionManager` 中，停止 Cubism2 队列中的全部动作，并清零当前与预留优先级。
     */
    stopAllMotions() {
      queue.stopAllMotions()
      currentPriority = 0
      reservedPriority = 0
    },
    /**
     * 在 `createPriorityMotionManager` 中，把 Cubism2 队列的动作参数写入模型，并在队列结束时清零当前优先级。
     * @param model - 待驱动、投影或渲染的模型实例。
     * @returns 动作队列写入模型后的参数更新状态。
     */
    updateParam(model) {
      const updated = queue.updateParam(model)
      if (queue.isFinished()) {
        currentPriority = 0
      }
      return updated
    },
  }
}

/**
 * 注视平滑器通过全零位置、目标、速度与时间建立首次指针更新的稳定初态。
 * @returns 可直接用于 Cubism2 注视插值的全零目标点状态。
 */
function createTargetPoint(): Cubism2TargetPoint {
  return {
    currentX: 0,
    currentY: 0,
    lastUpdateMillis: 0,
    targetX: 0,
    targetY: 0,
    velocityX: 0,
    velocityY: 0,
  }
}

/**
 * 按经过时间、加速度与制动距离推进 Cubism2 目标点的位置和速度。
 * @param point - 待转换或命中测试的二维坐标点。
 * @param currentTimeMillis - 写入 `point.lastUpdateMillis` 的`currentTimeMillis`。
 */
function updateTargetPoint(point: Cubism2TargetPoint, currentTimeMillis: number): void {
  const epsilon = 0.01
  const frameRate = 30
  const timeToMaxSpeed = 0.15
  const maxVelocity = 40 / 7.5 / frameRate
  if (point.lastUpdateMillis === 0) {
    point.lastUpdateMillis = currentTimeMillis
    return
  }
  const deltaTimeWeight = ((currentTimeMillis - point.lastUpdateMillis) * frameRate) / 1_000
  point.lastUpdateMillis = currentTimeMillis
  const framesToMaxSpeed = timeToMaxSpeed * frameRate
  const maxAcceleration = (deltaTimeWeight * maxVelocity) / framesToMaxSpeed
  const deltaX = point.targetX - point.currentX
  const deltaY = point.targetY - point.currentY
  if (Math.abs(deltaX) <= epsilon && Math.abs(deltaY) <= epsilon) {
    return
  }
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  const targetVelocityX = (maxVelocity * deltaX) / distance
  const targetVelocityY = (maxVelocity * deltaY) / distance
  let accelerationX = targetVelocityX - point.velocityX
  let accelerationY = targetVelocityY - point.velocityY
  const acceleration = Math.sqrt(accelerationX * accelerationX + accelerationY * accelerationY)
  if (acceleration < -maxAcceleration || acceleration > maxAcceleration) {
    accelerationX *= maxAcceleration / acceleration
    accelerationY *= maxAcceleration / acceleration
  }
  point.velocityX += accelerationX
  point.velocityY += accelerationY

  const brakingVelocity =
    0.5 *
    (Math.sqrt(
      maxAcceleration * maxAcceleration +
        16 * maxAcceleration * distance -
        8 * maxAcceleration * distance,
    ) -
      maxAcceleration)
  const currentVelocity = Math.sqrt(
    point.velocityX * point.velocityX + point.velocityY * point.velocityY,
  )
  if (currentVelocity > brakingVelocity) {
    point.velocityX *= brakingVelocity / currentVelocity
    point.velocityY *= brakingVelocity / currentVelocity
  }
  point.currentX += point.velocityX
  point.currentY += point.velocityY
}

/**
 * 头部命中时选择 flick_head，身体命中时选择 tap_body，其他坐标返回 null。
 * @param hitAreas - 包含 `hitAreas.headX`、`hitAreas.headY`、`hitAreas.bodyX`、`hitAreas.bodyY` 字段的`hitAreas`对象。
 * @param x - 待转换或命中测试的横坐标。
 * @param y - 待转换或命中测试的纵坐标。
 * @returns 命中区域对应的 flick_head 或 tap_body 动作组；未命中时为 null。
 */
function resolveHitMotionGroup(
  hitAreas: Live2DHitAreas,
  x: number,
  y: number,
): 'flick_head' | 'tap_body' | null {
  if (isPointInsideRanges(x, y, hitAreas.headX, hitAreas.headY)) {
    return 'flick_head'
  }
  if (isPointInsideRanges(x, y, hitAreas.bodyX, hitAreas.bodyY)) {
    return 'tap_body'
  }
  return null
}

/**
 * 仅在横纵区间均存在且坐标同时落入两个闭区间时确认命中。
 * @param x - 待转换或命中测试的横坐标。
 * @param y - 待转换或命中测试的纵坐标。
 * @param xRange - 横坐标允许命中的闭区间；省略时判定失败。
 * @param yRange - 纵坐标允许命中的闭区间；省略时判定失败。
 * @returns 仅在横纵区间均存在且坐标同时落入两个闭区间时确认命中是否成立。
 */
function isPointInsideRanges(
  x: number,
  y: number,
  xRange?: [number, number],
  yRange?: [number, number],
): boolean {
  if (!xRange || !yRange) {
    return false
  }
  return (
    Math.min(...xRange) <= x &&
    x <= Math.max(...xRange) &&
    Math.min(...yRange) <= y &&
    y <= Math.max(...yRange)
  )
}
