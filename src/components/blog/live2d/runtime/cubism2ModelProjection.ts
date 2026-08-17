import type { Live2DCoreModel } from './live2dRuntimeTypes'

type Cubism2ProjectionModel = Pick<
  Live2DCoreModel,
  'getCanvasHeight' | 'getCanvasWidth' | 'setMatrix'
>
type Cubism2ProjectionCanvas = Pick<HTMLCanvasElement, 'height' | 'width'>

/**
 * 按画布宽高计算并写入 Cubism2 模型投影矩阵。
 * @param model - 待驱动、投影或渲染的模型实例。
 * @param canvas - 提供 Live2D 投影宽高的画布。
 * @param layout - 控制模型或界面投影的布局配置；省略时按 undefined 的缺省分支处理。
 * @throws 当 `typeof model.setMatrix !== 'function'` 成立时抛出 `new Error('Cubism2 model does not expose setMatrix().')`。
 */
export function configureCubism2ModelProjection(
  model: Cubism2ProjectionModel,
  canvas: Cubism2ProjectionCanvas,
  layout?: Record<string, number>,
): void {
  if (typeof model.setMatrix !== 'function') {
    throw new Error('Cubism2 model does not expose setMatrix().')
  }
  model.setMatrix(
    createCubism2ModelProjectionMatrix(
      model.getCanvasWidth(),
      model.getCanvasHeight(),
      canvas.width,
      canvas.height,
      layout,
    ),
  )
}

/**
 * 验证模型与画布尺寸后计算 Cubism2 缩放和平移矩阵，并用有效 layout 字段覆盖默认投影。
 * @param modelWidth - 用于计算 `2 / modelWidth` 的模型宽度。
 * @param modelHeight - 用于计算 `modelHeight * scaleY` 的模型高度。
 * @param canvasWidth - 用于计算 `canvasWidth / canvasHeight` 的画布宽度。
 * @param canvasHeight - 用于计算 `canvasWidth / canvasHeight` 的画布高度。
 * @param layout - 控制模型或界面投影的布局配置；省略时按 undefined 的缺省分支处理。
 * @returns 构造出的`Cubism2ModelProjectionMatrix`。
 * @throws 当 `![modelWidth, modelHeight, canvasWidth, canvasHeight].every( (value) => Number.is…` 成立时抛出 `new Error('Cubism2 model and canvas dimensions must be positive.')`。
 */
function createCubism2ModelProjectionMatrix(
  modelWidth: number,
  modelHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  layout?: Record<string, number>,
): Float32Array {
  if (
    ![modelWidth, modelHeight, canvasWidth, canvasHeight].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new Error('Cubism2 model and canvas dimensions must be positive.')
  }

  let scaleX = 2 / modelWidth
  let scaleY = -scaleX
  let translateX = -1
  let translateY = -(modelHeight * scaleY) / 2

  const width = readLayoutNumber(layout, 'width')
  if (width !== undefined) {
    scaleX = width / modelWidth
    scaleY = -scaleX
  }
  const height = readLayoutNumber(layout, 'height')
  if (height !== undefined) {
    scaleX = height / modelHeight
    scaleY = -scaleX
  }
  translateX = readLayoutNumber(layout, 'x') ?? translateX
  translateY = readLayoutNumber(layout, 'y') ?? translateY

  const centerX = readLayoutNumber(layout, 'center_x')
  if (centerX !== undefined) {
    translateX = centerX - (modelWidth * scaleX) / 2
  }
  const centerY = readLayoutNumber(layout, 'center_y')
  if (centerY !== undefined) {
    translateY = centerY - (modelHeight * scaleY) / 2
  }
  translateY = readLayoutNumber(layout, 'top') ?? translateY
  const bottom = readLayoutNumber(layout, 'bottom')
  if (bottom !== undefined) {
    translateY = bottom - modelHeight * scaleY
  }
  translateX = readLayoutNumber(layout, 'left') ?? translateX
  const right = readLayoutNumber(layout, 'right')
  if (right !== undefined) {
    translateX = right - modelWidth * scaleX
  }

  const projectionScaleY = canvasWidth / canvasHeight
  return new Float32Array([
    scaleX,
    0,
    0,
    0,
    0,
    scaleY * projectionScaleY,
    0,
    0,
    0,
    0,
    1,
    0,
    translateX,
    translateY * projectionScaleY,
    0,
    1,
  ])
}

/**
 * 仅从 Live2D layout 读取有限数值，字段缺失或非有限数时返回 undefined。
 * @param layout - 控制模型或界面投影的布局配置。
 * @param key - 用于在当前映射或缓存中定位记录的键。
 * @returns 读取到的`LayoutNumber`；未命中或提前结束时返回 undefined。
 */
function readLayoutNumber(
  layout: Record<string, number> | undefined,
  key: string,
): number | undefined {
  const value = layout?.[key]
  if (Number.isFinite(value)) {
    return value
  }
  return undefined
}
