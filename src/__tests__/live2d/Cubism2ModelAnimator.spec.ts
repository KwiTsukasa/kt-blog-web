import { describe, expect, it, vi } from 'vitest'

import { createCubism2ModelAnimator } from '../../components/blog/live2d/runtime/cubism2ModelAnimator'
import type {
  Live2DCoreModel,
  Live2DCoreMotion,
  Live2DMotionQueueManager,
  Live2DModelSettings,
} from '../../components/blog/live2d/runtime/live2dRuntimeTypes'

/**
 * Creates the smallest model-settings record needed by source-order animation tests.
 * @param overrides Settings fields replaced for one focused scenario.
 * @returns Cubism2 model settings with one idle and one body-tap motion.
 */
function createAnimationSettings(
  overrides: Partial<Live2DModelSettings> = {},
): Live2DModelSettings {
  return {
    baseUrl: '/api/blog/live2d/pio/moc/',
    hitAreas: {
      bodyX: [-0.5, 0.5],
      bodyY: [0.3, -0.9],
      headX: [-0.35, 0.6],
      headY: [0.19, -0.2],
    },
    model: 'model.moc',
    motions: {
      idle: [{ file: 'motions/Breath1.mtn' }],
      tap_body: [{ fadeIn: 250, fadeOut: 500, file: 'motions/Touch1.mtn' }],
    },
    textures: ['textures/default-costume.png'],
    url: '/api/blog/live2d/pio/moc/index.json',
    ...overrides,
  }
}

/**
 * Creates a model facade that records the semantic frame-update order.
 * @param calls Mutable call log populated by every model method.
 * @returns Model facade accepted by the Cubism2 animator.
 */
function createRecordingModel(calls: string[]): Live2DCoreModel {
  return {
    addToParamFloat(id) {
      calls.push(`add:${id}`)
    },
    draw() {
      calls.push('draw')
    },
    getCanvasHeight: () => 2,
    getCanvasWidth: () => 2,
    getModelContext: () => ({
      getParamFloat: () => 0,
      getParamMax: () => 1,
      getParamMin: () => -1,
    }),
    getParamIndex: () => 0,
    loadParam() {
      calls.push('loadParam')
    },
    saveParam() {
      calls.push('saveParam')
    },
    setParamFloat(id) {
      calls.push(`set:${id}`)
    },
    setTexture() {},
    update() {
      calls.push('update')
    },
  }
}

describe('Cubism2 model animator', () => {
  it('loads a real idle MTN and preserves the source frame-update order', async () => {
    const calls: string[] = []
    const motion: Live2DCoreMotion = {
      setFadeIn: vi.fn(),
      setFadeOut: vi.fn(),
    }
    const loadMotionBytes = vi.fn(async () => new ArrayBuffer(4))
    const motionConstructor = {
      loadMotion: vi.fn(() => motion),
    }

    class RecordingMotionQueueManager implements Live2DMotionQueueManager {
      private active = false

      /** @returns True until the first motion starts. */
      isFinished(): boolean {
        return !this.active
      }

      /** @returns Stable test motion handle. */
      startMotion(): number {
        calls.push('startMotion')
        this.active = true
        return 1
      }

      /** Stops all fake motions. */
      stopAllMotions(): void {
        this.active = false
      }

      /** @returns True while the fake idle motion is active. */
      updateParam(): boolean {
        calls.push('motion')
        return this.active
      }
    }

    const animator = createCubism2ModelAnimator({
      MotionQueueManager: RecordingMotionQueueManager,
      Live2DMotion: motionConstructor,
      loadMotionBytes,
      now: () => 1_000,
      random: () => 0,
      settings: createAnimationSettings(),
    })

    await animator.preloadMotionGroup('idle')
    animator.update(createRecordingModel(calls))

    expect(loadMotionBytes).toHaveBeenCalledWith(
      '/api/blog/live2d/pio/moc/motions/Breath1.mtn',
    )
    expect(motionConstructor.loadMotion).toHaveBeenCalledOnce()
    expect(motion.setFadeIn).toHaveBeenCalledWith(1_000)
    expect(motion.setFadeOut).toHaveBeenCalledWith(1_000)
    expect(calls).toEqual([
      'startMotion',
      'loadParam',
      'motion',
      'saveParam',
      'add:PARAM_ANGLE_X',
      'add:PARAM_ANGLE_Y',
      'add:PARAM_ANGLE_Z',
      'add:PARAM_BODY_ANGLE_X',
      'add:PARAM_EYE_BALL_X',
      'add:PARAM_EYE_BALL_Y',
      'add:PARAM_ANGLE_X',
      'add:PARAM_ANGLE_Y',
      'add:PARAM_ANGLE_Z',
      'add:PARAM_BODY_ANGLE_X',
      'set:PARAM_BREATH',
      'update',
    ])
  })

  it('starts the source motion group for a body hit instead of leaving taps inert', async () => {
    const startedMotions: Live2DCoreMotion[] = []
    const bodyMotion: Live2DCoreMotion = {
      setFadeIn: vi.fn(),
      setFadeOut: vi.fn(),
    }

    class TapMotionQueueManager implements Live2DMotionQueueManager {
      /** @returns True before the tap motion starts. */
      isFinished(): boolean {
        return startedMotions.length === 0
      }

      /**
       * Records the motion selected for the body hit.
       * @param motion Motion loaded from the matching group.
       * @returns Stable test motion handle.
       */
      startMotion(motion: Live2DCoreMotion): number {
        startedMotions.push(motion)
        return 2
      }

      /** Clears recorded motions. */
      stopAllMotions(): void {
        startedMotions.length = 0
      }

      /** @returns Whether a tap motion is active. */
      updateParam(): boolean {
        return startedMotions.length > 0
      }
    }

    const loadMotionBytes = vi.fn(async () => new ArrayBuffer(8))
    const animator = createCubism2ModelAnimator({
      MotionQueueManager: TapMotionQueueManager,
      Live2DMotion: { loadMotion: () => bodyMotion },
      loadMotionBytes,
      now: () => 2_000,
      random: () => 0,
      settings: createAnimationSettings(),
    })

    await expect(animator.startMotionForPoint(0, -0.5)).resolves.toBe(true)
    expect(loadMotionBytes).toHaveBeenCalledWith(
      '/api/blog/live2d/pio/moc/motions/Touch1.mtn',
    )
    expect(bodyMotion.setFadeIn).toHaveBeenCalledWith(250)
    expect(bodyMotion.setFadeOut).toHaveBeenCalledWith(500)
    expect(startedMotions).toEqual([bodyMotion])
  })
})
