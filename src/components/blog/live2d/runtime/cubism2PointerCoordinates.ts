export interface Cubism2ViewPoint {
  x: number;
  y: number;
}

type Cubism2PointerCanvas = Pick<HTMLCanvasElement, 'height' | 'width' | 'getBoundingClientRect'>;
type Cubism2ClientPoint = Pick<MouseEvent, 'clientX' | 'clientY'>;

/**
 * Converts a browser pointer into the source runtime's canvas-local Cubism2 view coordinates.
 * @param canvas Canvas whose drawing-buffer dimensions define `deviceToScreen`.
 * @param point Browser client coordinates from a mouse or touch event.
 * @returns Source view point where both axes use canvas width as the scale denominator.
 */
export function toCubism2ViewPoint(
  canvas: Cubism2PointerCanvas,
  point: Cubism2ClientPoint,
): Cubism2ViewPoint {
  const bounds = canvas.getBoundingClientRect();
  const cssWidth = Math.max(bounds.width, 1);
  const cssHeight = Math.max(bounds.height, 1);
  const deviceX = (point.clientX - bounds.left) * canvas.width / cssWidth;
  const deviceY = (point.clientY - bounds.top) * canvas.height / cssHeight;
  const coordinateScale = Math.max(canvas.width, 1);
  return {
    x: (deviceX - canvas.width / 2) * 2 / coordinateScale,
    y: (canvas.height / 2 - deviceY) * 2 / coordinateScale,
  };
}
