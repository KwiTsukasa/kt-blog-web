import { defineComponent, onBeforeUnmount, onMounted } from 'vue';

import {
  BLOG_ANIMATION_TIMING_MS,
  BLOG_VIEWPORT_GEOMETRY,
  clearBlogDelay,
  runAfterBlogDelay,
} from '@/factories/blogAnimationFactory';
import { BLOG_LIVE2D_SCRIPT_IDS, blogDomId, blogDomSelector, blogDomSelectorFromId } from '@/factories/blogDomFactory';

const LIVE2D_ASSET_BASE = 'https://blog.kwitsukasa.top/wp-content/plugins/live-2d/assets';
const LIVE2D_MODEL_API = 'https://live2d.fghrsh.net/api/';
const LIVE2D_SCRIPT_IDS = [
  [BLOG_LIVE2D_SCRIPT_IDS.live2dV1Core, `${LIVE2D_ASSET_BASE}/live2dv1.min.js?ver=2.2.1`, true],
  [BLOG_LIVE2D_SCRIPT_IDS.live2dV2Core, `${LIVE2D_ASSET_BASE}/cubism-core/live2dcubismcore.min.js?ver=2.2.1`, false],
  [BLOG_LIVE2D_SCRIPT_IDS.live2dV2Sdk, `${LIVE2D_ASSET_BASE}/live2dv2.min.js?ver=2.2.1`, true],
  [BLOG_LIVE2D_SCRIPT_IDS.live2dWeb, `${LIVE2D_ASSET_BASE}/live2dwebsdk.min.js?ver=2.2.1`, true],
] as const;

declare global {
  interface Window {
    initLive2dWeb?: () => void;
    live2d_settings?: Record<string, unknown>;
  }
}

export default defineComponent({
  name: 'BlogLive2D',
  setup() {
    let fallbackTimer: number | null = null;

    onMounted(() => {
      if (window.innerWidth < BLOG_VIEWPORT_GEOMETRY.live2dDesktopMinWidthPx) {
        return;
      }

      installLive2d()
        .then(() => {
          fallbackTimer = runAfterBlogDelay(ensureFallbackLive2dDom, BLOG_ANIMATION_TIMING_MS.live2dFallbackWarmup);
        })
        .catch(() => {
          ensureFallbackLive2dDom();
        });
    });

    onBeforeUnmount(() => {
      clearBlogDelay(fallbackTimer);
      document.querySelector(blogDomSelector('live2dFallback'))?.remove();
    });

    return () => null;
  },
});

/**
 * Loads and initializes the same public Live2D Web plugin assets used by the live WordPress Argon page.
 *
 * The local Vue app owns only the mounting lifecycle; rendering remains delegated to the
 * upstream Live2D scripts and the public model API so the visible widget is not a hand-drawn placeholder.
 */
async function installLive2d() {
  installLive2dSettings();
  appendLive2dStyle();

  for (const [id, src, isModule] of LIVE2D_SCRIPT_IDS) {
    await appendScriptOnce(id, src, isModule);
  }

  window.initLive2dWeb?.();
}

/**
 * Mirrors the live site's non-secret Live2D settings required for model selection and widget geometry.
 */
function installLive2dSettings() {
  window.live2d_settings = {
    currentPage: {
      get_the_id: 61,
      is_home: true,
      is_single: false,
    },
    localPath: `${LIVE2D_ASSET_BASE.replace('/assets', '')}/model`,
    settings: {
      aboutPageUrl: '#',
      aiProvider: 'live2dweb',
      apiType: false,
      canCloseLive2d: true,
      canSwitchHitokoto: true,
      canSwitchModel: true,
      canSwitchTextures: true,
      canTakeScreenshot: true,
      canTurnToAboutPage: true,
      canTurnToHomePage: true,
      hitokotoAPI: 'lwl12.com',
      homePageUrl: 'https://blog.kwitsukasa.top',
      isBotButton: true,
      live2dLayoutType: true,
      modelAPI: LIVE2D_MODEL_API,
      modelId: '1',
      modelPoint: {
        x: 0,
        y: 0,
        zoom: '1.0',
      },
      modelRandMode: 'rand',
      modelStorage: true,
      modelTexturesId: '53',
      modelTexturesRandMode: 'switch',
      protectV2: 'direct',
      screenshotCaptureName: 'live2d.png',
      showF12Message: true,
      showF12OpenMsg: true,
      showF12Status: true,
      showHitokoto: true,
      showToolMenu: true,
      waifuDraggable: 'axis-x',
      waifuDraggableRevert: true,
      waifuEdgeSide: 'left',
      waifuEdgeSize: 0,
      waifuFontSize: 12,
      waifuMinWidth: 768,
      waifuSize: {
        height: 250,
        width: 280,
      },
      waifuTipsSize: {
        height: 70,
        width: 250,
      },
    },
    userInfo: {
      certserialnumber: 0,
      sign: '',
      userName: '',
    },
    waifuTips: {
      click_msg: ['是...是不小心碰到了吧'],
      click_selector: '.waifu #live2d',
      console_open_msg: ['哈哈，你打开了控制台，是想要看看我的秘密吗？'],
      copy_message: ['转载要记得加上出处哦！'],
      hidden_message: ['我们还能再见面的吧...?'],
      hour_tips: [['default', '嗨~ 快来逗我玩吧！']],
      load_rand_textures: ['我的新衣服好看嘛?'],
      mouseover_msg: [],
      referrer_message: [['none', '欢迎阅读<span style="{highlight}">『{title}』</span>']],
      screenshot_message: ['照好了嘛，是不是很可爱呢？'],
    },
  };
}

/**
 * Adds the Live2D stylesheet once so the SDK-created DOM uses the same geometry as WordPress.
 */
function appendLive2dStyle() {
  if (document.querySelector(blogDomSelector('live2dStyle'))) {
    return;
  }

  const styleLink = document.createElement('link');
  styleLink.id = blogDomId('live2dStyle');
  styleLink.rel = 'stylesheet';
  styleLink.href = `${LIVE2D_ASSET_BASE}/waifu.css?ver=2.2.1`;
  document.head.appendChild(styleLink);
}

/**
 * @param id Stable script id used by the live WordPress plugin.
 * @param src Public script URL to load once.
 * @param isModule Whether the upstream script is loaded as an ES module on the live site.
 */
function appendScriptOnce(id: string, src: string, isModule: boolean) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(blogDomSelectorFromId(id))) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    if (isModule) {
      script.type = 'module';
    }
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Live2D script failed: ${src}`));
    document.body.appendChild(script);
  });
}

/**
 * Creates the same visible DOM contract as WordPress when the SDK is unavailable or still warming up.
 */
function ensureFallbackLive2dDom() {
  if (document.querySelector(blogDomSelector('live2dCanvas'))) {
    return;
  }

  const root = document.createElement('div');
  root.id = blogDomId('live2dFallback');
  root.className = 'waifu kt-blog__live2d-fallback';
  root.innerHTML = `
    <canvas id="${blogDomId('live2dCanvas')}" class="live2d" width="280" height="250"></canvas>
    <input type="text" id="${blogDomId('live2dChatText')}" />
    <button class="wp-element-button" id="${blogDomId('live2dSend')}">发送</button>
    <i id="${blogDomId('live2dSendClose')}" class="fa-solid fa-circle-xmark"></i>
  `;
  document.body.appendChild(root);
}
