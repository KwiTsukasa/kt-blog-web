import type { Live2DCoreModel } from './live2dRuntimeTypes';

type Cubism2ProjectionModel = Pick<Live2DCoreModel, 'getCanvasHeight' | 'getCanvasWidth' | 'setMatrix'>;
type Cubism2ProjectionCanvas = Pick<HTMLCanvasElement, 'height' | 'width'>;

/**
 * Applies the original Cubism2 `projection × view × modelMatrix` transform to a loaded model.
 * @param model Loaded Cubism2 model that owns the WebGL draw matrix.
 * @param canvas Runtime canvas whose aspect ratio defines the projection scale.
 * @param layout Optional `index.json` layout fields applied in the original source order.
 */
export function configureCubism2ModelProjection(
  model: Cubism2ProjectionModel,
  canvas: Cubism2ProjectionCanvas,
  layout?: Record<string, number>,
): void {
  if (typeof model.setMatrix !== 'function') {
    throw new Error('Cubism2 model does not expose setMatrix().');
  }
  model.setMatrix(
    createCubism2ModelProjectionMatrix(
      model.getCanvasWidth(),
      model.getCanvasHeight(),
      canvas.width,
      canvas.height,
      layout,
    ),
  );
}

/**
 * Reconstructs the source L2DModelMatrix, layout overrides, and canvas projection as one matrix.
 * @param modelWidth Cubism2 logical model canvas width.
 * @param modelHeight Cubism2 logical model canvas height.
 * @param canvasWidth WebGL drawing-buffer width.
 * @param canvasHeight WebGL drawing-buffer height.
 * @param layout Optional model layout values from `index.json`.
 * @returns Column-major matrix passed directly to `Live2DModelWebGL.setMatrix()`.
 */
function createCubism2ModelProjectionMatrix(
  modelWidth: number,
  modelHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  layout?: Record<string, number>,
): Float32Array {
  if (![modelWidth, modelHeight, canvasWidth, canvasHeight].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Cubism2 model and canvas dimensions must be positive.');
  }

  let scaleX = 2 / modelWidth;
  let scaleY = -scaleX;
  let translateX = -1;
  let translateY = -(modelHeight * scaleY) / 2;

  const width = readLayoutNumber(layout, 'width');
  if (width !== undefined) {
    scaleX = width / modelWidth;
    scaleY = -scaleX;
  }
  const height = readLayoutNumber(layout, 'height');
  if (height !== undefined) {
    scaleX = height / modelHeight;
    scaleY = -scaleX;
  }
  translateX = readLayoutNumber(layout, 'x') ?? translateX;
  translateY = readLayoutNumber(layout, 'y') ?? translateY;

  const centerX = readLayoutNumber(layout, 'center_x');
  if (centerX !== undefined) {
    translateX = centerX - (modelWidth * scaleX) / 2;
  }
  const centerY = readLayoutNumber(layout, 'center_y');
  if (centerY !== undefined) {
    translateY = centerY - (modelHeight * scaleY) / 2;
  }
  translateY = readLayoutNumber(layout, 'top') ?? translateY;
  const bottom = readLayoutNumber(layout, 'bottom');
  if (bottom !== undefined) {
    translateY = bottom - modelHeight * scaleY;
  }
  translateX = readLayoutNumber(layout, 'left') ?? translateX;
  const right = readLayoutNumber(layout, 'right');
  if (right !== undefined) {
    translateX = right - modelWidth * scaleX;
  }

  const projectionScaleY = canvasWidth / canvasHeight;
  return new Float32Array([
    scaleX, 0, 0, 0,
    0, scaleY * projectionScaleY, 0, 0,
    0, 0, 1, 0,
    translateX, translateY * projectionScaleY, 0, 1,
  ]);
}

/**
 * Reads one finite numeric layout value without coercing malformed external JSON.
 * @param layout Optional raw layout map.
 * @param key Cubism2 layout key read in source order.
 * @returns Finite numeric value, or undefined when absent or invalid.
 */
function readLayoutNumber(layout: Record<string, number> | undefined, key: string): number | undefined {
  const value = layout?.[key];
  return Number.isFinite(value) ? value : undefined;
}
