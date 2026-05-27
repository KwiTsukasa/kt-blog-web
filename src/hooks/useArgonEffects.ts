import { onBeforeUnmount, onMounted, type Ref } from 'vue';

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
  let frameId = 0;

  /**
   * requestAnimationFrame 合并滚动与 resize 更新，避免滚动模式过渡抖动。
   */
  const scheduleUpdate = () => {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      syncToolbar(refs);
      syncLeftbar(refs);
    });
  };

  onMounted(() => {
    scheduleUpdate();
    document.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
  });

  onBeforeUnmount(() => {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
    }

    document.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', scheduleUpdate);
  });
}

/**
 * @param top 目标滚动位置，默认滚动到页面顶部。
 * @param duration 动画时长，Argon 回顶默认约 800ms。
 */
export function smoothScrollTo(top = 0, duration = 800) {
  const start = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
  const distance = top - start;
  const startTime = performance.now();

  /**
   * @param progress 0 到 1 的动画进度。
   * @returns easeOutExpo 缓动后的进度。
   */
  const easeOutExpo = (progress: number) => (progress >= 1 ? 1 : 1 - 2 ** (-10 * progress));

  /**
   * @param now 当前 requestAnimationFrame 时间戳。
   */
  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeOutExpo(progress));
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

/**
 * @param callback 待注册的滚动更新回调。
 * @returns 清理函数，用于组件卸载时释放监听。
 */
export function onArgonScroll(callback: () => void): Cleanup {
  let frameId = 0;

  const scheduleUpdate = () => {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      callback();
    });
  };

  scheduleUpdate();
  document.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });

  return () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
    }

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
    toolbar.classList.toggle('kt-blog__header-navbar--no-blur', scrollTop < 30);
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

  const startTransitionHeight = 30;
  const endTransitionHeight = content.getBoundingClientRect().top + scrollTop - 75;
  const maxOpacity = themeRoot?.classList.contains('kt-blog--toolbar-blur') ? 0.65 : 0.85;

  if (scrollTop < startTransitionHeight) {
    toolbar.style.setProperty('background-color', 'rgba(var(--toolbar-color), 0)', 'important');
    toolbar.style.setProperty('box-shadow', 'none');
    toolbar.style.setProperty('backdrop-filter', 'blur(0px)');
    toolbar.classList.add('kt-blog__header-navbar--ontop');
    return;
  }

  if (scrollTop > endTransitionHeight) {
    toolbar.style.setProperty('background-color', `rgba(var(--toolbar-color), ${maxOpacity})`, 'important');
    toolbar.style.removeProperty('box-shadow');
    toolbar.style.setProperty('backdrop-filter', 'blur(16px)');
    toolbar.classList.remove('kt-blog__header-navbar--ontop');
    return;
  }

  const progress = (scrollTop - startTransitionHeight) / (endTransitionHeight - startTransitionHeight);
  toolbar.style.setProperty('background-color', `rgba(var(--toolbar-color), ${progress * maxOpacity})`, 'important');
  toolbar.style.removeProperty('box-shadow');
  toolbar.style.setProperty('backdrop-filter', progress > 0.3 ? 'blur(16px)' : 'blur(0px)');
  toolbar.classList.remove('kt-blog__header-navbar--ontop');
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
  const shouldStick = part1OffsetTop + leftbarPart1.offsetHeight + 10 - scrollTop <= 90;
  const canHeadroom = part1OffsetTop + leftbarPart1.offsetHeight + 10 - scrollTop <= 20;
  const themeRoot = leftbarPart1.closest('.kt-blog');

  leftbarPart2.classList.toggle('kt-blog__sidebar-panel--sticky', shouldStick);
  themeRoot?.classList.toggle('kt-blog--leftbar-can-headroom', canHeadroom);
}
