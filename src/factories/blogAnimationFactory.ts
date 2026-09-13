export const BLOG_ANIMATION_TIMING_MS = {
  catalogManualLock: 400,
  catalogNormal: 400,
  floatSideUnload: 300,
  scrollToTop: 800,
  toastVisible: 5000,
} as const

export const BLOG_SCROLL_GEOMETRY = {
  backTopVisibleScrollY: 400,
  catalogActivationOffsetPx: 80,
  catalogAutoScrollEdgePx: 20,
  catalogAutoScrollResetPx: 30,
  catalogScrollExtraPx: 8,
  leftbarHeadroomTopPx: 20,
  leftbarStickyGapPx: 10,
  leftbarStickyTopPx: 90,
  readingArticleOffsetPx: 80,
  readingExtraHeightPx: 50,
  toolbarBlurPx: 16,
  toolbarBlurThresholdRatio: 0.3,
  toolbarEndInsetPx: 75,
  toolbarMaxOpacityBlur: 0.65,
  toolbarMaxOpacitySolid: 0.85,
  toolbarStartTransitionPx: 30,
} as const

export const BLOG_VIEWPORT_GEOMETRY = {
  live2dDesktopMinWidthPx: 1200,
} as const

export interface BlogReadingGeometry {
  scrollTop: number
  scrollHeight: number
  viewportHeight: number
  articleTop: number
  articleHeight: number
}

/**
 * 在实际滚动容器坐标中计算文章阅读比例，以正文末端可见或滚动到底为完成边界。
 * @param geometry - 当前滚动位置、容器尺寸和文章在同一滚动坐标系中的起点与高度。
 * @returns 零到一的阅读比例；不可测量的布局返回零，已完整显示的短文章返回一。
 */
export function calculateBlogReadingProgress(geometry: BlogReadingGeometry): number {
  const { scrollTop, scrollHeight, viewportHeight, articleTop, articleHeight } = geometry
  if (!Object.values(geometry).every(Number.isFinite) || viewportHeight <= 0 || articleHeight <= 0) {
    return 0
  }

  const maxScroll = Math.max(0, scrollHeight - viewportHeight)
  const start = Math.max(0, articleTop - BLOG_SCROLL_GEOMETRY.readingArticleOffsetPx)
  const end = Math.max(0, Math.min(
    maxScroll,
    articleTop + articleHeight + BLOG_SCROLL_GEOMETRY.readingExtraHeightPx - viewportHeight,
  ))
  // 原生 scrollTop 可带小数，容器尺寸则按整数像素报告。
  if (scrollTop >= end - 1) {
    return 1
  }
  if (end <= start) {
    return 0
  }
  return Math.min(1, Math.max(0, (scrollTop - start) / (end - start)))
}

export const BLOG_MOTION_CSS_VARS = {
  backgroundEase: 'background 0.3s ease',
  backgroundImageOpacity: 'opacity 0.5s ease',
  menuHover: 'background 0.2s ease-in-out',
  modalPopover: 'opacity 0.25s ease, transform 0.25s ease',
  sidebarSearchInput:
    'width 0.3s cubic-bezier(0.4, 0, 0, 1), height 0.3s cubic-bezier(0.4, 0, 0, 1), opacity 0.3s cubic-bezier(0.4, 0, 0, 1), border-color 0.3s ease, box-shadow 0.15s ease',
  sidebarSearchTrigger:
    'width 0.3s cubic-bezier(0.4, 0, 0, 1), height 0.3s cubic-bezier(0.4, 0, 0, 1), opacity 0.3s cubic-bezier(0.4, 0, 0, 1), box-shadow 0.15s ease',
  sidebarTabBorder: 'border-bottom-color 0.2s ease',
  sidebarTabFade: 'opacity 0.15s linear',
} as const

export interface BlogFrameScheduler {
  cancel: () => void
  schedule: () => void
}

/**
 * 把博客动效时长映射序列化为带 kt-blog-motion 前缀的 CSS 自定义属性声明块。
 * @returns 带 kt-blog-motion 前缀的 CSS 自定义属性声明块。
 */
export function createBlogMotionCssVariables() {
  return Object.entries(BLOG_MOTION_CSS_VARS)
    .map(
      ([key, value]) =>
        `  --kt-blog-motion-${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}: ${value};`,
    )
    .join('\n')
}

/**
 * 把博客界面更新排入下一次浏览器动画帧，并返回可用于取消的帧编号。
 * @param callback - 操作完成或状态变化时调用的回调。
 * @returns 浏览器分配的动画帧编号。
 */
export function requestBlogFrame(callback: FrameRequestCallback) {
  return window.requestAnimationFrame(callback)
}

/**
 * 当动画帧编号非零时取消对应的浏览器调度。
 * @param frameId - 待取消的浏览器动画帧编号。
 */
export function cancelBlogFrame(frameId: number) {
  if (frameId) {
    window.cancelAnimationFrame(frameId)
  }
}

/**
 * 创建同一动画帧内只排队一次回调的调度器，并允许在组件卸载时取消待执行帧。
 * @param callback - 操作完成或状态变化时调用的回调。
 * @returns 新建的同一动画帧内只排队一次回调的调度器，并允许在组件卸载时取消待执行帧，包含 `cancel`、`schedule` 等字段。
 */
export function createBlogFrameScheduler(callback: () => void): BlogFrameScheduler {
  let frameId = 0

  return {
    cancel: () => {
      cancelBlogFrame(frameId)
      frameId = 0
    },
    schedule: () => {
      if (frameId) {
        return
      }

      frameId = requestBlogFrame(() => {
        frameId = 0
        callback()
      })
    },
  }
}

/**
 * 按给定毫秒数延后执行博客界面状态变更，并返回可取消的浏览器计时器编号。
 * @param callback - 操作完成或状态变化时调用的回调。
 * @param delayMs - 代码复制提示保持显示的毫秒数。
 * @returns 可取消的浏览器计时器编号。
 */
export function runAfterBlogDelay(callback: () => void, delayMs: number) {
  return window.setTimeout(callback, delayMs)
}

/**
 * 当浏览器延迟计时器存在时取消它，null 表示无需执行清理。
 * @param timerId - runAfterBlogDelay 返回的计时器编号或 null。
 */
export function clearBlogDelay(timerId: number | null) {
  if (timerId !== null) {
    window.clearTimeout(timerId)
  }
}

/**
 * 按指数缓出曲线映射动画进度，结束位置固定为一。
 * @param progress - 限制在零到一之间的动画进度。
 * @returns 指数缓出曲线映射后的进度。
 */
export function easeOutExpo(progress: number) {
  if (progress >= 1) {
    return 1
  }
  return 1 - 2 ** (-10 * progress)
}

/**
 * 按二次缓出曲线映射动画进度。
 * @param progress - 限制在零到一之间的动画进度。
 * @returns 二次缓出曲线映射后的进度。
 */
export function easeOutQuad(progress: number) {
  return 1 - (1 - progress) * (1 - progress)
}
