import { onBeforeUnmount, onMounted, type Ref } from 'vue';

import {
  BLOG_ANIMATION_TIMING_MS,
  BLOG_SCROLL_GEOMETRY,
  createBlogFrameScheduler,
  easeOutExpo,
  requestBlogFrame,
} from '@/factories/blogAnimationFactory';

type Cleanup = () => void;

interface ArgonEffectRefs {
  bannerContainerRef: Ref<HTMLElement | null>;
  contentRef: Ref<HTMLElement | null>;
  leftbarPart1Ref: Ref<HTMLElement | null>;
  leftbarPart2Ref: Ref<HTMLElement | null>;
  toolbarRef: Ref<HTMLElement | null>;
}

/**
 * @param refs 由布局组件注册的关键 DOM 节点，替代具名 id 查询。
 */
export function useArgonEffects(refs: ArgonEffectRefs) {
  const frameScheduler = createBlogFrameScheduler(() => {
    syncToolbar(refs);
    syncLeftbar(refs);
  });

  /**
   * requestAnimationFrame 合并滚动与 resize 更新，避免滚动模式过渡抖动。
   */
  const scheduleUpdate = () => {
    frameScheduler.schedule();
  };

  onMounted(() => {
    scheduleUpdate();
    document.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
  });

  onBeforeUnmount(() => {
    frameScheduler.cancel();

    document.body.classList.remove('leftbar-can-headroom');
    document.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', scheduleUpdate);
  });
}

/**
 * @param top 目标滚动位置，默认滚动到页面顶部。
 * @param duration 动画时长，默认取 Argon 回顶约 800ms 的统一 motion token。
 */
export function smoothScrollTo(top = 0, duration = BLOG_ANIMATION_TIMING_MS.scrollToTop) {
  const start = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
  const distance = top - start;
  const startTime = performance.now();

  /**
   * @param now 当前 requestAnimationFrame 时间戳。
   */
  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeOutExpo(progress));
    if (progress < 1) {
      requestBlogFrame(step);
    }
  };

  requestBlogFrame(step);
}

/**
 * @param callback 待注册的滚动更新回调。
 * @returns 清理函数，用于组件卸载时释放监听。
 */
export function onArgonScroll(callback: () => void): Cleanup {
  const frameScheduler = createBlogFrameScheduler(callback);

  const scheduleUpdate = () => {
    frameScheduler.schedule();
  };

  scheduleUpdate();
  document.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });

  return () => {
    frameScheduler.cancel();

    document.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', scheduleUpdate);
  };
}

/**
 * @param refs 由布局组件注册的顶栏、banner 与内容容器节点。
 */
function syncToolbar(refs: ArgonEffectRefs) {
  const toolbar = refs.toolbarRef.value;
  if (!toolbar) {
    return;
  }

  const themeRoot = toolbar.closest('.kt-blog');
  const isNoBanner = themeRoot?.classList.contains('kt-blog--no-banner') ?? false;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.scrollY;

  if (isNoBanner) {
    toolbar.classList.toggle('kt-blog__header-navbar--no-blur', scrollTop < BLOG_SCROLL_GEOMETRY.toolbarStartTransitionPx);
    toolbar.classList.remove('kt-blog__header-navbar--ontop');
    toolbar.style.removeProperty('background-color');
    toolbar.style.removeProperty('box-shadow');
    toolbar.style.removeProperty('backdrop-filter');
    return;
  }

  const bannerContainer = refs.bannerContainerRef.value;
  const content = refs.contentRef.value;
  if (!bannerContainer || !content) {
    return;
  }

  const startTransitionHeight = BLOG_SCROLL_GEOMETRY.toolbarStartTransitionPx;
  const endTransitionHeight = content.getBoundingClientRect().top + scrollTop - BLOG_SCROLL_GEOMETRY.toolbarEndInsetPx;
  const maxOpacity = themeRoot?.classList.contains('kt-blog--toolbar-blur')
    ? BLOG_SCROLL_GEOMETRY.toolbarMaxOpacityBlur
    : BLOG_SCROLL_GEOMETRY.toolbarMaxOpacitySolid;

  if (scrollTop < startTransitionHeight) {
    toolbar.style.setProperty('background-color', 'rgba(var(--toolbar-color), 0)', 'important');
    toolbar.style.setProperty('box-shadow', 'none');
    toolbar.style.setProperty('backdrop-filter', 'blur(0px)');
    toolbar.classList.add('kt-blog__header-navbar--ontop');
    toolbar.classList.add('navbar-ontop');
    return;
  }

  if (scrollTop > endTransitionHeight) {
    toolbar.style.setProperty('background-color', `rgba(var(--toolbar-color), ${maxOpacity})`, 'important');
    toolbar.style.removeProperty('box-shadow');
    toolbar.style.setProperty('backdrop-filter', `blur(${BLOG_SCROLL_GEOMETRY.toolbarBlurPx}px)`);
    toolbar.classList.remove('kt-blog__header-navbar--ontop');
    toolbar.classList.remove('navbar-ontop');
    return;
  }

  const progress = (scrollTop - startTransitionHeight) / (endTransitionHeight - startTransitionHeight);
  toolbar.style.setProperty('background-color', `rgba(var(--toolbar-color), ${progress * maxOpacity})`, 'important');
  toolbar.style.removeProperty('box-shadow');
  toolbar.style.setProperty(
    'backdrop-filter',
    progress > BLOG_SCROLL_GEOMETRY.toolbarBlurThresholdRatio ? `blur(${BLOG_SCROLL_GEOMETRY.toolbarBlurPx}px)` : 'blur(0px)',
  );
  toolbar.classList.remove('kt-blog__header-navbar--ontop');
  toolbar.classList.remove('navbar-ontop');
}

/**
 * @param refs 由布局组件注册的左侧栏两段节点。
 */
function syncLeftbar(refs: ArgonEffectRefs) {
  const leftbarPart1 = refs.leftbarPart1Ref.value;
  const leftbarPart2 = refs.leftbarPart2Ref.value;
  if (!leftbarPart1 || !leftbarPart2) {
    return;
  }

  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.scrollY;
  const part1Rect = leftbarPart1.getBoundingClientRect();
  const part1OffsetTop = part1Rect.top + scrollTop;
  const leftbarBottom = part1OffsetTop + leftbarPart1.offsetHeight + BLOG_SCROLL_GEOMETRY.leftbarStickyGapPx - scrollTop;
  const shouldStick = leftbarBottom <= BLOG_SCROLL_GEOMETRY.leftbarStickyTopPx;
  const canHeadroom = leftbarBottom <= BLOG_SCROLL_GEOMETRY.leftbarHeadroomTopPx;

  leftbarPart2.classList.toggle('kt-blog__sidebar-panel--sticky', shouldStick);
  document.body.classList.toggle('leftbar-can-headroom', canHeadroom);
}
