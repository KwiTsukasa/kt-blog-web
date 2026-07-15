import { createCubism2EyeBlink } from './cubism2EyeBlink';
import type {
  Live2DCoreModel,
  Live2DCoreMotion,
  Live2DCoreMotionConstructor,
  Live2DHitAreas,
  Live2DModelSettings,
  Live2DMotionQueueManager,
  Live2DMotionSetting,
  MotionQueueManagerConstructor,
} from './live2dRuntimeTypes';

const IDLE_MOTION_PRIORITY = 1;
const INTERACTION_MOTION_PRIORITY = 2;
const DEFAULT_MOTION_FADE_MILLIS = 1_000;

export interface CreateCubism2ModelAnimatorOptions {
  Live2DMotion: Live2DCoreMotionConstructor;
  MotionQueueManager: MotionQueueManagerConstructor;
  loadMotionBytes(url: string): Promise<ArrayBuffer>;
  now?: () => number;
  random?: () => number;
  settings: Live2DModelSettings;
}

export interface Cubism2ModelAnimator {
  preloadMotionGroup(groupName: string): Promise<void>;
  setPointerTarget(x: number, y: number): void;
  startMotionForPoint(x: number, y: number): Promise<boolean>;
  startRandomMotion(groupName: string, priority?: number): Promise<boolean>;
  stop(): void;
  update(model: Live2DCoreModel): void;
}

interface PriorityMotionManager {
  cancelReservation(priority: number): void;
  isFinished(): boolean;
  reserveMotion(priority: number): boolean;
  startMotion(motion: Live2DCoreMotion, priority: number): number;
  stopAllMotions(): void;
  updateParam(model: Live2DCoreModel): boolean;
}

interface Cubism2TargetPoint {
  currentX: number;
  currentY: number;
  lastUpdateMillis: number;
  targetX: number;
  targetY: number;
  velocityX: number;
  velocityY: number;
}

/**
 * Creates the source-ordered Cubism2 model animator used by the Blog renderer.
 * @param options Restored SDK constructors, model settings, clock, random source, and MTN loader.
 * @returns Animator that owns motion playback, eye blink, pointer smoothing, and parameter order.
 */
export function createCubism2ModelAnimator(
  options: CreateCubism2ModelAnimatorOptions,
): Cubism2ModelAnimator {
  const now = options.now ?? Date.now;
  const random = options.random ?? Math.random;
  const motionManager = createPriorityMotionManager(options.MotionQueueManager);
  const loadingMotions = new Map<string, Promise<Live2DCoreMotion>>();
  const loadedMotions = new Map<string, Live2DCoreMotion>();
  const targetPoint = createTargetPoint();
  const startedAtMillis = now();
  let stopped = false;
  const eyeBlink = createCubism2EyeBlink({ now, random });

  /**
   * Resolves one motion setting to its model-relative request URL.
   * @param motion Motion entry read from the model settings.
   * @returns URL accepted by the renderer's binary fetch helper.
   */
  const resolveMotionUrl = (motion: Live2DMotionSetting): string => {
    const baseUrl = options.settings.baseUrl.endsWith('/')
      ? options.settings.baseUrl
      : `${options.settings.baseUrl}/`;
    return `${baseUrl}${motion.file.replace(/^\.\//, '')}`;
  };

  /**
   * Loads and parses one MTN once, applying the ModelSettingJson fade defaults from min.js.
   * @param setting Motion entry selected from a named group.
   * @returns Parsed Cubism2 motion ready for the queue.
   */
  const loadMotion = (setting: Live2DMotionSetting): Promise<Live2DCoreMotion> => {
    const motionUrl = resolveMotionUrl(setting);
    const loaded = loadedMotions.get(motionUrl);
    if (loaded) {
      return Promise.resolve(loaded);
    }
    const loading = loadingMotions.get(motionUrl);
    if (loading) {
      return loading;
    }
    const nextLoading = options.loadMotionBytes(motionUrl)
      .then((motionBytes) => {
        const motion = options.Live2DMotion.loadMotion(motionBytes);
        motion.setFadeIn(setting.fadeIn ?? DEFAULT_MOTION_FADE_MILLIS);
        motion.setFadeOut(setting.fadeOut ?? DEFAULT_MOTION_FADE_MILLIS);
        if (!stopped) {
          loadedMotions.set(motionUrl, motion);
        }
        loadingMotions.delete(motionUrl);
        return motion;
      })
      .catch((error: unknown) => {
        loadingMotions.delete(motionUrl);
        throw error;
      });
    loadingMotions.set(motionUrl, nextLoading);
    return nextLoading;
  };

  /**
   * Starts a selected motion synchronously when it was preloaded, otherwise after its fetch completes.
   * @param setting Motion entry selected from the model group.
   * @param priority Source-compatible idle or interaction priority.
   * @returns Promise resolving true after the motion starts, or false when stopped.
   */
  const startMotion = (
    setting: Live2DMotionSetting,
    priority: number,
  ): Promise<boolean> => {
    const motionUrl = resolveMotionUrl(setting);
    const loaded = loadedMotions.get(motionUrl);
    if (loaded) {
      motionManager.startMotion(loaded, priority);
      return Promise.resolve(true);
    }
    return loadMotion(setting)
      .then((motion) => {
        if (stopped) {
          motionManager.cancelReservation(priority);
          return false;
        }
        motionManager.startMotion(motion, priority);
        return true;
      })
      .catch((error: unknown) => {
        motionManager.cancelReservation(priority);
        throw error;
      });
  };

  return {
    async preloadMotionGroup(groupName) {
      const group = options.settings.motions[groupName] ?? [];
      await Promise.all(group.map((setting) => loadMotion(setting)));
    },
    setPointerTarget(x, y) {
      targetPoint.targetX = x;
      targetPoint.targetY = y;
    },
    startMotionForPoint(x, y) {
      const groupName = resolveHitMotionGroup(options.settings.hitAreas, x, y);
      if (!groupName) {
        return Promise.resolve(false);
      }
      return this.startRandomMotion(groupName, INTERACTION_MOTION_PRIORITY);
    },
    startRandomMotion(groupName, priority = INTERACTION_MOTION_PRIORITY) {
      const group = options.settings.motions[groupName] ?? [];
      if (stopped || group.length === 0 || !motionManager.reserveMotion(priority)) {
        return Promise.resolve(false);
      }
      const motionIndex = Math.floor(random() * group.length);
      const setting = group[motionIndex];
      if (!setting) {
        motionManager.cancelReservation(priority);
        return Promise.resolve(false);
      }
      return startMotion(setting, priority);
    },
    stop() {
      stopped = true;
      motionManager.stopAllMotions();
      loadingMotions.clear();
      loadedMotions.clear();
    },
    update(model) {
      if (motionManager.isFinished()) {
        void this.startRandomMotion('idle', IDLE_MOTION_PRIORITY).catch((error: unknown) => {
          console.warn('[KT Blog] Live2D idle motion failed.', error);
        });
      }

      model.loadParam();
      const motionUpdated = motionManager.updateParam(model);
      if (!motionUpdated) {
        eyeBlink.update(model);
      }
      model.saveParam();

      const currentTimeMillis = now();
      updateTargetPoint(targetPoint, currentTimeMillis);
      const elapsedSeconds = (currentTimeMillis - startedAtMillis) / 1_000;
      const phase = elapsedSeconds * 2 * Math.PI;
      const dragX = targetPoint.currentX;
      const dragY = targetPoint.currentY;
      model.addToParamFloat('PARAM_ANGLE_X', dragX * 30, 1);
      model.addToParamFloat('PARAM_ANGLE_Y', dragY * 30, 1);
      model.addToParamFloat('PARAM_ANGLE_Z', dragX * dragY * -30, 1);
      model.addToParamFloat('PARAM_BODY_ANGLE_X', dragX * 10, 1);
      model.addToParamFloat('PARAM_EYE_BALL_X', dragX, 1);
      model.addToParamFloat('PARAM_EYE_BALL_Y', dragY, 1);
      model.addToParamFloat('PARAM_ANGLE_X', Number(15 * Math.sin(phase / 6.5345)), 0.5);
      model.addToParamFloat('PARAM_ANGLE_Y', Number(8 * Math.sin(phase / 3.5345)), 0.5);
      model.addToParamFloat('PARAM_ANGLE_Z', Number(10 * Math.sin(phase / 5.5345)), 0.5);
      model.addToParamFloat('PARAM_BODY_ANGLE_X', Number(4 * Math.sin(phase / 15.5345)), 0.5);
      model.setParamFloat('PARAM_BREATH', Number(0.5 + 0.5 * Math.sin(phase / 3.2345)), 1);
      model.update();
    },
  };
}

/**
 * Wraps the SDK2 queue with the priority reservation semantics used by L2DMotionManager.
 * @param QueueManager Restored semantic queue constructor.
 * @returns Priority-aware manager for idle and interaction motions.
 */
function createPriorityMotionManager(
  QueueManager: MotionQueueManagerConstructor,
): PriorityMotionManager {
  const queue: Live2DMotionQueueManager = new QueueManager();
  let currentPriority = 0;
  let reservedPriority = 0;

  return {
    cancelReservation(priority) {
      if (reservedPriority === priority) {
        reservedPriority = 0;
      }
    },
    isFinished() {
      return queue.isFinished();
    },
    reserveMotion(priority) {
      if (reservedPriority >= priority || currentPriority >= priority) {
        return false;
      }
      reservedPriority = priority;
      return true;
    },
    startMotion(motion, priority) {
      if (priority === reservedPriority) {
        reservedPriority = 0;
      }
      currentPriority = priority;
      return queue.startMotion(motion);
    },
    stopAllMotions() {
      queue.stopAllMotions();
      currentPriority = 0;
      reservedPriority = 0;
    },
    updateParam(model) {
      const updated = queue.updateParam(model);
      if (queue.isFinished()) {
        currentPriority = 0;
      }
      return updated;
    },
  };
}

/**
 * Creates the zeroed L2DTargetPoint state used for page-level look-at smoothing.
 * @returns Mutable source-compatible target point.
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
  };
}

/**
 * Advances L2DTargetPoint with the original acceleration and braking equations.
 * @param point Mutable target point state.
 * @param currentTimeMillis Current Cubism2 user time in milliseconds.
 */
function updateTargetPoint(point: Cubism2TargetPoint, currentTimeMillis: number): void {
  const epsilon = 0.01;
  const frameRate = 30;
  const timeToMaxSpeed = 0.15;
  const maxVelocity = (40 / 7.5) / frameRate;
  if (point.lastUpdateMillis === 0) {
    point.lastUpdateMillis = currentTimeMillis;
    return;
  }
  const deltaTimeWeight = (currentTimeMillis - point.lastUpdateMillis) * frameRate / 1_000;
  point.lastUpdateMillis = currentTimeMillis;
  const framesToMaxSpeed = timeToMaxSpeed * frameRate;
  const maxAcceleration = (deltaTimeWeight * maxVelocity) / framesToMaxSpeed;
  const deltaX = point.targetX - point.currentX;
  const deltaY = point.targetY - point.currentY;
  if (Math.abs(deltaX) <= epsilon && Math.abs(deltaY) <= epsilon) {
    return;
  }
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const targetVelocityX = (maxVelocity * deltaX) / distance;
  const targetVelocityY = (maxVelocity * deltaY) / distance;
  let accelerationX = targetVelocityX - point.velocityX;
  let accelerationY = targetVelocityY - point.velocityY;
  const acceleration = Math.sqrt(accelerationX * accelerationX + accelerationY * accelerationY);
  if (acceleration < -maxAcceleration || acceleration > maxAcceleration) {
    accelerationX *= maxAcceleration / acceleration;
    accelerationY *= maxAcceleration / acceleration;
  }
  point.velocityX += accelerationX;
  point.velocityY += accelerationY;

  const brakingVelocity = 0.5 * (
    Math.sqrt(maxAcceleration * maxAcceleration + 16 * maxAcceleration * distance - 8 * maxAcceleration * distance)
    - maxAcceleration
  );
  const currentVelocity = Math.sqrt(
    point.velocityX * point.velocityX + point.velocityY * point.velocityY,
  );
  if (currentVelocity > brakingVelocity) {
    point.velocityX *= brakingVelocity / currentVelocity;
    point.velocityY *= brakingVelocity / currentVelocity;
  }
  point.currentX += point.velocityX;
  point.currentY += point.velocityY;
}

/**
 * Resolves the custom WordPress hit ranges to the motion group used by the model package.
 * @param hitAreas Normalized custom body/head ranges from index.json.
 * @param x Model-space horizontal coordinate.
 * @param y Model-space vertical coordinate.
 * @returns `flick_head`, `tap_body`, or null when the point misses both ranges.
 */
function resolveHitMotionGroup(
  hitAreas: Live2DHitAreas,
  x: number,
  y: number,
): 'flick_head' | 'tap_body' | null {
  if (isPointInsideRanges(x, y, hitAreas.headX, hitAreas.headY)) {
    return 'flick_head';
  }
  if (isPointInsideRanges(x, y, hitAreas.bodyX, hitAreas.bodyY)) {
    return 'tap_body';
  }
  return null;
}

/**
 * Checks one point against possibly reversed WordPress range endpoints.
 * @param x Horizontal point coordinate.
 * @param y Vertical point coordinate.
 * @param xRange Horizontal endpoints from index.json.
 * @param yRange Vertical endpoints from index.json.
 * @returns True when both coordinates are inside their inclusive ranges.
 */
function isPointInsideRanges(
  x: number,
  y: number,
  xRange?: [number, number],
  yRange?: [number, number],
): boolean {
  if (!xRange || !yRange) {
    return false;
  }
  return (
    Math.min(...xRange) <= x
    && x <= Math.max(...xRange)
    && Math.min(...yRange) <= y
    && y <= Math.max(...yRange)
  );
}
