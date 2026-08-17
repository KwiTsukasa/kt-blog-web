export interface Cubism2ViewPoint {
  x: number
  y: number
}
type Cubism2PointerCanvas = Pick<HTMLCanvasElement, 'height' | 'width' | 'getBoundingClientRect'>
type Cubism2ClientPoint = Pick<MouseEvent, 'clientX' | 'clientY'>
type Cubism2PointerViewport = Pick<Window, 'innerHeight' | 'innerWidth'>

/**
 * 把浏览器客户区坐标按画布边界和绘图缓冲尺寸换算为以模型中心为原点的命中坐标。
 * @param canvas - 提供 Live2D 投影宽高的画布。
 * @param point - 待转换或命中测试的二维坐标点。
 * @returns 以模型中心为原点且受画布缩放影响的命中坐标，包含 `x`、`y` 等字段。
 */
export function toCubism2ModelPoint(
  canvas: Cubism2PointerCanvas,
  point: Cubism2ClientPoint,
): Cubism2ViewPoint {
  const bounds = canvas.getBoundingClientRect()
  const cssWidth = Math.max(bounds.width, 1)
  const cssHeight = Math.max(bounds.height, 1)
  const deviceX = ((point.clientX - bounds.left) * canvas.width) / cssWidth
  const deviceY = ((point.clientY - bounds.top) * canvas.height) / cssHeight
  const coordinateScale = Math.max(canvas.width, 1)
  return {
    x: ((deviceX - canvas.width / 2) * 2) / coordinateScale,
    y: ((canvas.height / 2 - deviceY) * 2) / coordinateScale,
  }
}

/**
 * 把全页面指针相对模型中心的距离映射到受视口边缘和画布宽高比限制的注视范围。
 * @param canvas - 提供 Live2D 投影宽高的画布。
 * @param viewport - 包含 `viewport.innerWidth`、`viewport.innerHeight` 字段的`viewport`对象。
 * @param point - 待转换或命中测试的二维坐标点。
 * @returns 受视口边缘和画布宽高比限制的注视坐标，包含 `x`、`y` 等字段。
 */
export function toCubism2PageTarget(
  canvas: Cubism2PointerCanvas,
  viewport: Cubism2PointerViewport,
  point: Cubism2ClientPoint,
): Cubism2ViewPoint {
  const bounds = canvas.getBoundingClientRect()
  const cssWidth = Math.max(bounds.width, 1)
  const cssHeight = Math.max(bounds.height, 1)
  const centerX = bounds.left + cssWidth / 2
  const centerY = bounds.top + cssHeight / 2
  const deltaX = point.clientX - centerX
  const deltaY = point.clientY - centerY
  const horizontalDistanceToViewportEdge = Math.max(
    (() => {
      if (deltaX < 0) {
        return centerX
      }
      return viewport.innerWidth - centerX
    })(),
    1,
  )
  const verticalDistanceToViewportEdge = Math.max(
    (() => {
      if (deltaY < 0) {
        return centerY
      }
      return viewport.innerHeight - centerY
    })(),
    1,
  )
  const verticalRange = canvas.height / Math.max(canvas.width, 1)
  const normalizedY = (() => {
    if (deltaY === 0) {
      return 0
    }
    return (-deltaY / verticalDistanceToViewportEdge) * verticalRange
  })()
  return {
    x: Math.max(-1, Math.min(1, deltaX / horizontalDistanceToViewportEdge)),
    y: Math.max(-verticalRange, Math.min(verticalRange, normalizedY)),
  }
}
