export const BLOG_ANIMATION_TIMING_MS = {
  catalogManualLock: 400,
  catalogNormal: 400,
  floatSideUnload: 300,
  live2dFallbackWarmup: 1500,
  scrollToTop: 800,
  toastVisible: 5000,
} as const;

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
} as const;

export const BLOG_VIEWPORT_GEOMETRY = {
  live2dDesktopMinWidthPx: 768,
} as const;

export const BLOG_MOTION_CSS_VARS = {
  backgroundEase: 'background 0.3s ease',
  backgroundImageOpacity: 'opacity 0.5s ease',
  menuHover: 'background 0.2s ease-in-out',
  modalPopover: 'opacity 0.25s ease, transform 0.25s ease',
  sidebarSearchInput:
    'border-color 0.32s ease, box-shadow 0.32s ease, opacity 0.3s ease, transform 0.42s cubic-bezier(0.4, 0, 0, 1)',
  sidebarSearchTrigger:
    'border-color 0.32s ease, background-color 0.32s ease, opacity 0.28s ease, transform 0.42s cubic-bezier(0.4, 0, 0, 1)',
  sidebarTabBorder: 'border-bottom-color 0.2s ease',
  sidebarTabFade: 'opacity 0.15s linear',
} as const;

export interface BlogFrameScheduler {
  cancel: () => void;
  schedule: () => void;
}

/**
 * @returns CSS custom property block generated from the Blog animation factory.
 */
export function createBlogMotionCssVariables() {
  return Object.entries(BLOG_MOTION_CSS_VARS)
    .map(([key, value]) => `  --kt-blog-motion-${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}: ${value};`)
    .join('\n');
}

/**
 * @param callback Visual update that should run on the next browser animation frame.
 * @returns Browser frame id, allowing callers to cancel the queued visual work.
 */
export function requestBlogFrame(callback: FrameRequestCallback) {
  return window.requestAnimationFrame(callback);
}

/**
 * @param frameId Browser frame id returned by `requestBlogFrame`; zero means no queued work.
 */
export function cancelBlogFrame(frameId: number) {
  if (frameId) {
    window.cancelAnimationFrame(frameId);
  }
}

/**
 * @param callback Coalesced DOM read/write work that should run at most once per frame.
 * @returns Scheduler with explicit `schedule` and `cancel` methods for component lifecycles.
 */
export function createBlogFrameScheduler(callback: () => void): BlogFrameScheduler {
  let frameId = 0;

  return {
    cancel: () => {
      cancelBlogFrame(frameId);
      frameId = 0;
    },
    schedule: () => {
      if (frameId) {
        return;
      }

      frameId = requestBlogFrame(() => {
        frameId = 0;
        callback();
      });
    },
  };
}

/**
 * @param callback Delayed UI state mutation, usually matching an Argon transition window.
 * @param delayMs Delay in milliseconds from `BLOG_ANIMATION_TIMING_MS`.
 * @returns Browser timeout id so callers can cancel route or component teardown work.
 */
export function runAfterBlogDelay(callback: () => void, delayMs: number) {
  return window.setTimeout(callback, delayMs);
}

/**
 * @param timerId Timeout id returned by `runAfterBlogDelay`; null means no queued timer.
 */
export function clearBlogDelay(timerId: number | null) {
  if (timerId !== null) {
    window.clearTimeout(timerId);
  }
}

/**
 * @param progress Animation progress from 0 to 1.
 * @returns Exponential easing close to Argon's jQuery `easeOutExpo` scroll motion.
 */
export function easeOutExpo(progress: number) {
  return progress >= 1 ? 1 : 1 - 2 ** (-10 * progress);
}

/**
 * @param progress Animation progress from 0 to 1.
 * @returns jQuery UI `swing` value on the live Argon site, whose default easing resolves to `easeOutQuad`.
 */
export function easeOutQuad(progress: number) {
  return 1 - (1 - progress) * (1 - progress);
}
