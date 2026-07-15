import type { Live2DCoreModel } from './live2dRuntimeTypes';

const DEFAULT_BLINK_INTERVAL_MILLIS = 4_000;
const DEFAULT_CLOSING_MILLIS = 100;
const DEFAULT_CLOSED_MILLIS = 50;
const DEFAULT_OPENING_MILLIS = 150;

type EyeBlinkState = 'closed' | 'closing' | 'first' | 'interval' | 'opening';
type EyeBlinkModel = Pick<Live2DCoreModel, 'setParamFloat'>;

export interface Cubism2EyeBlink {
  setBlinkDurations(closingMillis: number, closedMillis: number, openingMillis: number): void;
  setBlinkInterval(blinkIntervalMillis: number): void;
  update(model: EyeBlinkModel): void;
}

export interface CreateCubism2EyeBlinkOptions {
  now?: () => number;
  random?: () => number;
}

/**
 * Creates the semantic Cubism2 `L2DEyeBlink` state machine restored from the source runtime.
 * @param options Injectable clock and random source used for deterministic verification.
 * @returns Eye-blink controller that writes the two Cubism eye-open parameters.
 */
export function createCubism2EyeBlink(
  options: CreateCubism2EyeBlinkOptions = {},
): Cubism2EyeBlink {
  const now = options.now ?? Date.now;
  const random = options.random ?? Math.random;
  let state: EyeBlinkState = 'first';
  let nextBlinkMillis = 0;
  let stateStartMillis = 0;
  let blinkIntervalMillis = DEFAULT_BLINK_INTERVAL_MILLIS;
  let closingMillis = DEFAULT_CLOSING_MILLIS;
  let closedMillis = DEFAULT_CLOSED_MILLIS;
  let openingMillis = DEFAULT_OPENING_MILLIS;

  /**
   * Calculates the source-compatible absolute timestamp for the next blink.
   * @returns Next blink time in milliseconds.
   */
  const calculateNextBlinkMillis = (): number => (
    now() + random() * (2 * blinkIntervalMillis - 1)
  );

  return {
    setBlinkDurations(nextClosingMillis, nextClosedMillis, nextOpeningMillis) {
      closingMillis = nextClosingMillis;
      closedMillis = nextClosedMillis;
      openingMillis = nextOpeningMillis;
    },
    setBlinkInterval(nextBlinkIntervalMillis) {
      blinkIntervalMillis = nextBlinkIntervalMillis;
    },
    update(model) {
      const currentTimeMillis = now();
      let eyeOpenValue = 1;
      let phaseProgress = 0;

      switch (state) {
        case 'closing':
          phaseProgress = (currentTimeMillis - stateStartMillis) / closingMillis;
          if (phaseProgress >= 1) {
            phaseProgress = 1;
            state = 'closed';
            stateStartMillis = currentTimeMillis;
          }
          eyeOpenValue = 1 - phaseProgress;
          break;
        case 'closed':
          phaseProgress = (currentTimeMillis - stateStartMillis) / closedMillis;
          if (phaseProgress >= 1) {
            state = 'opening';
            stateStartMillis = currentTimeMillis;
          }
          eyeOpenValue = 0;
          break;
        case 'opening':
          phaseProgress = (currentTimeMillis - stateStartMillis) / openingMillis;
          if (phaseProgress >= 1) {
            phaseProgress = 1;
            state = 'interval';
            nextBlinkMillis = calculateNextBlinkMillis();
          }
          eyeOpenValue = phaseProgress;
          break;
        case 'interval':
          if (nextBlinkMillis < currentTimeMillis) {
            state = 'closing';
            stateStartMillis = currentTimeMillis;
          }
          break;
        case 'first':
        default:
          state = 'interval';
          nextBlinkMillis = calculateNextBlinkMillis();
          break;
      }

      model.setParamFloat('PARAM_EYE_L_OPEN', eyeOpenValue);
      model.setParamFloat('PARAM_EYE_R_OPEN', eyeOpenValue);
    },
  };
}
