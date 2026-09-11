import { onBeforeUnmount, onMounted, type Ref } from 'vue'

import {
  BLOG_ANIMATION_TIMING_MS,
  BLOG_SCROLL_GEOMETRY,
  createBlogFrameScheduler,
  easeOutExpo,
  requestBlogFrame,
} from '@/factories/blogAnimationFactory'

import { useBlogDomRefs } from './useBlogDomRefs'

type Cleanup = () => void

interface ArgonEffectRefs {
  bannerContainerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  leftbarPart1Ref: Ref<HTMLElement | null>
  leftbarPart2Ref: Ref<HTMLElement | null>
  toolbarRef: Ref<HTMLElement | null>
}

/**
 * 取得当前页面的原生滚动位置，布局尚未挂载时回退到文档滚动位置。
 * @returns 当前滚动源距内容顶部的像素数。
 */
export function getBlogScrollTop() {
  const { pageScrollRef } = useBlogDomRefs()
  if (pageScrollRef.value) return pageScrollRef.value.scrollTop
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
}

/**
 * 将目录或回顶动画的位置写入页面原生滚动容器，未挂载时使用窗口。
 * @param top - 相对于滚动内容顶部的目标像素数。
 */
export function setBlogScrollTop(top: number) {
  const { pageScrollRef } = useBlogDomRefs()
  if (pageScrollRef.value) {
    pageScrollRef.value.scrollTop = top
    return
  }
  window.scrollTo(0, top)
}

/**
 * 在组件挂载后合并调度顶栏与左侧栏滚动效果，并在卸载时解除滚动和窗口监听。
 * @param refs - 页面滚动或布局同步所需的 DOM 引用。
 */
export function useArgonEffects(refs: ArgonEffectRefs) {
  const frameScheduler = createBlogFrameScheduler(() => {
    syncToolbar(refs)
    syncLeftbar(refs)
  })

  /*
   * requestAnimationFrame 合并滚动与 resize 更新，避免滚动模式过渡抖动。
   */
  const scheduleUpdate = () => {
    frameScheduler.schedule()
  }

  onMounted(() => {
    scheduleUpdate()
    document.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })
  })

  onBeforeUnmount(() => {
    frameScheduler.cancel()

    document.body.classList.remove('leftbar-can-headroom')
    document.removeEventListener('scroll', scheduleUpdate, true)
    window.removeEventListener('resize', scheduleUpdate)
  })
}

/**
 * 从当前滚动位置按指数缓出曲线移动到目标纵坐标。
 * @param top - 用于计算 `top - start` 的`top`；未提供时使用 `0`。
 * @param duration - 用于计算 `(now - startTime) / duration` 的`duration`；未提供时使用 `BLOG_ANIMATION_TIMING_MS.scrollToTop`。
 */
export function smoothScrollTo(top = 0, duration = BLOG_ANIMATION_TIMING_MS.scrollToTop) {
  const start = getBlogScrollTop()
  const distance = top - start
  const startTime = performance.now()

  /*
   * @param now 当前 requestAnimationFrame 时间戳。
   */
  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1)
    setBlogScrollTop(start + distance * easeOutExpo(progress))
    if (progress < 1) {
      requestBlogFrame(step)
    }
  }

  requestBlogFrame(step)
}

/**
 * 把滚动与窗口尺寸变化合并到动画帧回调，并返回取消调度与监听的清理函数。
 * @param callback - 操作完成或状态变化时调用的回调。
 * @returns 取消调度与监听的清理函数。
 */
export function onArgonScroll(callback: () => void): Cleanup {
  const frameScheduler = createBlogFrameScheduler(callback)

  const scheduleUpdate = () => {
    frameScheduler.schedule()
  }

  scheduleUpdate()
  document.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true })
  window.addEventListener('resize', scheduleUpdate, { passive: true })

  return () => {
    frameScheduler.cancel()

    document.removeEventListener('scroll', scheduleUpdate, true)
    window.removeEventListener('resize', scheduleUpdate)
  }
}

/**
 * 按页面是否有横幅及滚动区间同步顶栏透明度、模糊和置顶类。
 * @param refs - 页面滚动或布局同步所需的 DOM 引用。
 */
function syncToolbar(refs: ArgonEffectRefs) {
  const toolbar = refs.toolbarRef.value
  if (!toolbar) {
    return
  }

  const themeRoot = toolbar.closest('.kt-blog')
  const isNoBanner = themeRoot?.classList.contains('kt-blog--no-banner') ?? false
  const scrollTop = getBlogScrollTop()

  if (isNoBanner) {
    toolbar.classList.toggle(
      'kt-blog__header-navbar--no-blur',
      scrollTop < BLOG_SCROLL_GEOMETRY.toolbarStartTransitionPx,
    )
    toolbar.classList.remove('kt-blog__header-navbar--ontop')
    toolbar.style.removeProperty('background-color')
    toolbar.style.removeProperty('box-shadow')
    toolbar.style.removeProperty('backdrop-filter')
    return
  }

  const bannerContainer = refs.bannerContainerRef.value
  const content = refs.contentRef.value
  if (!bannerContainer || !content) {
    return
  }

  const startTransitionHeight = BLOG_SCROLL_GEOMETRY.toolbarStartTransitionPx
  const endTransitionHeight =
    content.getBoundingClientRect().top + scrollTop - BLOG_SCROLL_GEOMETRY.toolbarEndInsetPx
  const maxOpacity = (() => {
    if (themeRoot?.classList.contains('kt-blog--toolbar-blur')) {
      return BLOG_SCROLL_GEOMETRY.toolbarMaxOpacityBlur
    }
    return BLOG_SCROLL_GEOMETRY.toolbarMaxOpacitySolid
  })()

  if (scrollTop < startTransitionHeight) {
    toolbar.style.setProperty('background-color', 'rgba(var(--toolbar-color), 0)', 'important')
    toolbar.style.setProperty('box-shadow', 'none')
    toolbar.style.setProperty('backdrop-filter', 'blur(0px)')
    toolbar.classList.add('kt-blog__header-navbar--ontop')
    toolbar.classList.add('navbar-ontop')
    return
  }

  if (scrollTop > endTransitionHeight) {
    toolbar.style.setProperty(
      'background-color',
      `rgba(var(--toolbar-color), ${maxOpacity})`,
      'important',
    )
    toolbar.style.removeProperty('box-shadow')
    toolbar.style.setProperty('backdrop-filter', `blur(${BLOG_SCROLL_GEOMETRY.toolbarBlurPx}px)`)
    toolbar.classList.remove('kt-blog__header-navbar--ontop')
    toolbar.classList.remove('navbar-ontop')
    return
  }

  const progress =
    (scrollTop - startTransitionHeight) / (endTransitionHeight - startTransitionHeight)
  toolbar.style.setProperty(
    'background-color',
    `rgba(var(--toolbar-color), ${progress * maxOpacity})`,
    'important',
  )
  toolbar.style.removeProperty('box-shadow')
  toolbar.style.setProperty(
    'backdrop-filter',
    (() => {
      if (progress > BLOG_SCROLL_GEOMETRY.toolbarBlurThresholdRatio) {
        return `blur(${BLOG_SCROLL_GEOMETRY.toolbarBlurPx}px)`
      }
      return 'blur(0px)'
    })(),
  )
  toolbar.classList.remove('kt-blog__header-navbar--ontop')
  toolbar.classList.remove('navbar-ontop')
}

/**
 * 按左侧栏首段底部位置切换次段吸顶状态与 body 的 headroom 标记。
 * @param refs - 页面滚动或布局同步所需的 DOM 引用。
 */
function syncLeftbar(refs: ArgonEffectRefs) {
  const leftbarPart1 = refs.leftbarPart1Ref.value
  const leftbarPart2 = refs.leftbarPart2Ref.value
  if (!leftbarPart1 || !leftbarPart2) {
    return
  }

  const scrollTop = getBlogScrollTop()
  const part1Rect = leftbarPart1.getBoundingClientRect()
  const part1OffsetTop = part1Rect.top + scrollTop
  const leftbarBottom =
    part1OffsetTop + leftbarPart1.offsetHeight + BLOG_SCROLL_GEOMETRY.leftbarStickyGapPx - scrollTop
  const shouldStick = leftbarBottom <= BLOG_SCROLL_GEOMETRY.leftbarStickyTopPx
  const canHeadroom = leftbarBottom <= BLOG_SCROLL_GEOMETRY.leftbarHeadroomTopPx

  leftbarPart2.classList.toggle('kt-blog__sidebar-panel--sticky', shouldStick)
  document.body.classList.toggle('leftbar-can-headroom', canHeadroom)
}
