export interface Cubism2ViewPoint {
  x: number;
  y: number;
}
type Cubism2PointerCanvas = Pick<HTMLCanvasElement, 'height' | 'width' | 'getBoundingClientRect'>;
type Cubism2ClientPoint = Pick<MouseEvent, 'clientX' | 'clientY'>;

/**
 * Converts a page-level browser pointer into the bounded WordPress Cubism2 view range.
 * @param canvas Canvas whose bounds and drawing-buffer dimensions define the view range.
 * @param point Browser client coordinates from a mouse or touch event.
 * @returns View point projected from the model center to the canvas boundary when needed.
 */
export function toCubism2ViewPoint(
  canvas: Cubism2PointerCanvas,
  point: Cubism2ClientPoint,
): Cubism2ViewPoint {
  const bounds = canvas.getBoundingClientRect();
  const cssWidth = Math.max(bounds.width, 1);
  const cssHeight = Math.max(bounds.height, 1);
  const centerX = bounds.left + cssWidth / 2;
  const centerY = bounds.top + cssHeight / 2;
  const deltaX = point.clientX - centerX;
  const deltaY = point.clientY - centerY;
  const horizontalProjection = deltaX === 0
    ? Number.POSITIVE_INFINITY
    : cssWidth / 2 / Math.abs(deltaX);
  const verticalProjection = deltaY === 0
    ? Number.POSITIVE_INFINITY
    : cssHeight / 2 / Math.abs(deltaY);
  const projectionScale = Math.min(1, horizontalProjection, verticalProjection);
  const projectedX = centerX + deltaX * projectionScale;
  const projectedY = centerY + deltaY * projectionScale;
  const deviceX = (projectedX - bounds.left) * canvas.width / cssWidth;
  const deviceY = (projectedY - bounds.top) * canvas.height / cssHeight;
  const coordinateScale = Math.max(canvas.width, 1);
  return {
    x: (deviceX - canvas.width / 2) * 2 / coordinateScale,
    y: (canvas.height / 2 - deviceY) * 2 / coordinateScale,
  };
}
