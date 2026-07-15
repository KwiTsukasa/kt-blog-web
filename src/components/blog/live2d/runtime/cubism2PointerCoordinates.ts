export interface Cubism2ViewPoint {
  x: number;
  y: number;
}
type Cubism2PointerCanvas = Pick<HTMLCanvasElement, 'height' | 'width' | 'getBoundingClientRect'>;
type Cubism2ClientPoint = Pick<MouseEvent, 'clientX' | 'clientY'>;
type Cubism2PointerViewport = Pick<Window, 'innerHeight' | 'innerWidth'>;

/**
 * Converts a canvas interaction into the source Cubism2 model-view coordinates used for hit testing.
 * @param canvas Canvas whose bounds and drawing-buffer dimensions define the model-view transform.
 * @param point Browser client coordinates from a mouse or touch event.
 * @returns Source view point where both axes use the canvas width as the scale denominator.
 */
export function toCubism2ModelPoint(
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

/**
 * Maps page-wide pointer movement continuously into the Cubism2 look-at range around the model center.
 * @param canvas Canvas whose center is the neutral look-at origin and whose aspect ratio limits vertical motion.
 * @param viewport Browser viewport whose edges represent the maximum look-at targets in each direction.
 * @param point Browser client coordinates from a page-level pointer event.
 * @returns Bounded look-at target that retains distance across the whole visible page.
 */
export function toCubism2PageTarget(
  canvas: Cubism2PointerCanvas,
  viewport: Cubism2PointerViewport,
  point: Cubism2ClientPoint,
): Cubism2ViewPoint {
  const bounds = canvas.getBoundingClientRect();
  const cssWidth = Math.max(bounds.width, 1);
  const cssHeight = Math.max(bounds.height, 1);
  const centerX = bounds.left + cssWidth / 2;
  const centerY = bounds.top + cssHeight / 2;
  const deltaX = point.clientX - centerX;
  const deltaY = point.clientY - centerY;
  const horizontalDistanceToViewportEdge = Math.max(
    deltaX < 0 ? centerX : viewport.innerWidth - centerX,
    1,
  );
  const verticalDistanceToViewportEdge = Math.max(
    deltaY < 0 ? centerY : viewport.innerHeight - centerY,
    1,
  );
  const verticalRange = canvas.height / Math.max(canvas.width, 1);
  const normalizedY = deltaY === 0
    ? 0
    : -deltaY / verticalDistanceToViewportEdge * verticalRange;
  return {
    x: Math.max(-1, Math.min(1, deltaX / horizontalDistanceToViewportEdge)),
    y: Math.max(-verticalRange, Math.min(verticalRange, normalizedY)),
  };
}
