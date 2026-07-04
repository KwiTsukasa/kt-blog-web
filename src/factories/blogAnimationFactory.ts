export const BLOG_ANIMATION_TIMING_MS = {
  catalogManualLock: 400,
  catalogNormal: 400,
  floatSideUnload: 300,
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
  live2dDesktopMinWidthPx: 1200,
} as const;

export const BLOG_LIVE2D_IDLE_MOTION = {
  bobPx: 5,
  breathScale: 0.018,
  pointerMaxRotateDeg: 1.8,
  pointerMaxX: 8,
  pointerMaxY: 5,
  pointerSmoothing: 0.1,
  swayDeg: 1.15,
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

export interface BlogLive2DIdleAnimatorHandle {
  /**
   * Stops the frame loop, removes pointer listeners, and restores the canvas transform owned before animation.
   */
  destroy: () => void;
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
 * Adds a lightweight visual idle loop around the self-hosted Pio canvas.
 * The current reconstructed MOC has no shipped motion/physics files, so this
 * wrapper-level motion keeps the character alive without claiming Cubism rigging.
 * @param canvas Pio canvas owned by `BlogLive2D`; its inline transform is restored on destroy.
 * @returns Lifecycle handle that must be destroyed with the runtime mount handle.
 */
export function createBlogLive2DIdleAnimator(canvas: HTMLCanvasElement): BlogLive2DIdleAnimatorHandle {
  const initialTransform = canvas.style.transform;
  let frameId = 0;
  let disposed = false;
  let startedAt = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerX = 0;
  let pointerY = 0;

  /**
   * Tracks the visitor pointer as a small parallax target around the fixed Pio canvas.
   * @param event Pointer movement on the document viewport.
   */
  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = Math.max(-1, Math.min(1, (event.clientX - centerX) / Math.max(rect.width, 1)));
    const normalizedY = Math.max(-1, Math.min(1, (event.clientY - centerY) / Math.max(rect.height, 1)));
    pointerTargetX = normalizedX * BLOG_LIVE2D_IDLE_MOTION.pointerMaxX;
    pointerTargetY = normalizedY * BLOG_LIVE2D_IDLE_MOTION.pointerMaxY;
  };

  /**
   * Lets the idle loop ease Pio back to neutral when the pointer leaves the document.
   */
  const onPointerLeave = () => {
    pointerTargetX = 0;
    pointerTargetY = 0;
  };

  /**
   * Applies one visual idle frame and schedules the next frame until teardown.
   * @param timestamp Browser animation timestamp supplied by requestAnimationFrame.
   */
  const tick = (timestamp: number) => {
    if (disposed) {
      return;
    }
    if (!startedAt) {
      startedAt = timestamp;
    }

    const elapsedSeconds = (timestamp - startedAt) / 1000;
    pointerX += (pointerTargetX - pointerX) * BLOG_LIVE2D_IDLE_MOTION.pointerSmoothing;
    pointerY += (pointerTargetY - pointerY) * BLOG_LIVE2D_IDLE_MOTION.pointerSmoothing;
    const bob = Math.sin(elapsedSeconds * 1.65) * BLOG_LIVE2D_IDLE_MOTION.bobPx;
    const scale = 1 + Math.sin(elapsedSeconds * 2.1) * BLOG_LIVE2D_IDLE_MOTION.breathScale;
    const rotate =
      Math.sin(elapsedSeconds * 0.95) * BLOG_LIVE2D_IDLE_MOTION.swayDeg
      + (pointerX / BLOG_LIVE2D_IDLE_MOTION.pointerMaxX) * BLOG_LIVE2D_IDLE_MOTION.pointerMaxRotateDeg;

    canvas.style.transform = [
      initialTransform,
      `translate3d(${(pointerX * 0.45).toFixed(2)}px, ${(bob + pointerY * 0.35).toFixed(2)}px, 0)`,
      `rotate(${rotate.toFixed(3)}deg)`,
      `scale(${scale.toFixed(4)})`,
    ]
      .filter(Boolean)
      .join(' ');
    frameId = requestBlogFrame(tick);
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave);
  frameId = requestBlogFrame(tick);

  return {
    destroy: () => {
      disposed = true;
      cancelBlogFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      canvas.style.transform = initialTransform;
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
