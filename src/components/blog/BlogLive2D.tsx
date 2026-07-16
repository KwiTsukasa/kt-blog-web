import { defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

import BlogLive2DPickerModal from './BlogLive2DPickerModal';
import { BLOG_LIVE2D_MODELS } from './live2d/runtime/live2dRuntimeCatalog';
import type { Live2DModelSettings, Live2DResolvedState, Live2DTSRuntime } from './live2d/runtime/live2dRuntimeTypes';
import { createLive2DTSRuntime } from './live2d/runtime/live2dTsRuntime';
import { WORDPRESS_WAIFU_MIN_WIDTH } from './live2d/wordpressWidgetConfig';
import {
  mountWordPressWidgetController,
  type WordPressWidgetControllerHandle,
} from './live2d/wordpressWidgetController';
import { WORDPRESS_WAIFU_TOOLS } from './live2d/wordpressWidgetConfig';

export default defineComponent({
  name: 'BlogLive2D',
  /**
   * Owns the Blog Live2D widget, TypeScript runtime, and model/costume picker state.
   * @returns Render function that only creates the canvas on desktop viewports.
   */
  setup() {
    const isDesktop = window.innerWidth > WORDPRESS_WAIFU_MIN_WIDTH;
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const chatRef = ref<HTMLElement | null>(null);
    const closeButtonRef = ref<HTMLButtonElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const sendButtonRef = ref<HTMLButtonElement | null>(null);
    const tipsRef = ref<HTMLElement | null>(null);
    const toolRef = ref<HTMLElement | null>(null);
    const widgetRef = ref<HTMLElement | null>(null);
    const picker = reactive({
      activeModelKey: 'pio',
      activeTextureIndex: 0,
      errorMessage: '',
      modelOpen: false,
      pending: false,
      previewTextureIndex: 0,
      settings: null as Live2DModelSettings | null,
      textureOpen: false,
    });
    let disposed = false;
    let runtimeHandle: Live2DTSRuntime | null = null;
    let controllerHandle: WordPressWidgetControllerHandle | null = null;

    /**
     * Copies runtime state into Vue picker state.
     * @param state Runtime state returned by mount or switch operations.
     */
    const applyRuntimeState = (state: Live2DResolvedState) => {
      picker.activeModelKey = state.modelKey;
      picker.activeTextureIndex = state.textureIndex;
      picker.previewTextureIndex = state.textureIndex;
      picker.settings = state.settings;
    };

    /**
     * Opens the costume picker with its preview anchored to the committed texture.
     */
    const openTexturePicker = () => {
      picker.errorMessage = '';
      picker.previewTextureIndex = picker.activeTextureIndex;
      picker.textureOpen = true;
    };

    /**
     * Builds the element bag expected by the WordPress-style toolbar controller.
     * @returns Controller element bag, or null while refs are not connected.
     */
    const resolveControllerElements = () => {
      if (
        !canvasRef.value ||
        !chatRef.value ||
        !closeButtonRef.value ||
        !inputRef.value ||
        !sendButtonRef.value ||
        !tipsRef.value ||
        !toolRef.value ||
        !widgetRef.value
      ) {
        return null;
      }
      return {
        canvas: canvasRef.value,
        chat: chatRef.value,
        closeButton: closeButtonRef.value,
        input: inputRef.value,
        sendButton: sendButtonRef.value,
        tips: tipsRef.value,
        tool: toolRef.value,
        widget: widgetRef.value,
      };
    };

    onMounted(async () => {
      if (!isDesktop) {
        return;
      }
      await nextTick();
      const elements = resolveControllerElements();
      if (!elements) {
        return;
      }

      controllerHandle = mountWordPressWidgetController(elements, {
        onModelPickerRequested: () => {
          picker.errorMessage = '';
          picker.modelOpen = true;
        },
        onTexturePickerRequested: () => {
          openTexturePicker();
        },
      });

      try {
        const mountedHandle = createLive2DTSRuntime({ canvas: elements.canvas });
        const state = await mountedHandle.mount();
        if (disposed) {
          mountedHandle.destroy();
          return;
        }
        runtimeHandle = mountedHandle;
        applyRuntimeState(state);
      } catch (error: unknown) {
        console.warn('[KT Blog] Pio Live2D unavailable.', error);
      }
    });

    onBeforeUnmount(() => {
      disposed = true;
      controllerHandle?.destroy();
      controllerHandle = null;
      runtimeHandle?.destroy();
      runtimeHandle = null;
    });

    /**
     * Switches the active character from the picker modal.
     * @param modelKey Selected registered model key.
     */
    const selectModel = async (modelKey: string) => {
      if (!runtimeHandle) {
        return;
      }
      picker.pending = true;
      picker.errorMessage = '';
      try {
        const state = await runtimeHandle.switchModel(modelKey);
        applyRuntimeState(state);
        picker.modelOpen = false;
      } catch (error: unknown) {
        picker.errorMessage = resolveSelectionErrorMessage(error);
        console.warn('[KT Blog] Live2D model switch failed.', error);
      } finally {
        picker.pending = false;
      }
    };

    /**
     * Applies a costume to the visible model without committing it to storage.
     * @param textureIndex Selected preview texture index for the active model.
     */
    const previewTexture = async (textureIndex: number) => {
      if (!runtimeHandle || textureIndex === picker.previewTextureIndex) {
        return;
      }
      picker.pending = true;
      picker.errorMessage = '';
      try {
        await runtimeHandle.previewTexture(textureIndex);
        picker.previewTextureIndex = textureIndex;
      } catch (error: unknown) {
        picker.errorMessage = resolveSelectionErrorMessage(error);
        console.warn('[KT Blog] Live2D texture preview failed.', error);
      } finally {
        picker.pending = false;
      }
    };

    /**
     * Commits the currently previewed costume and closes the picker after persistence succeeds.
     */
    const confirmTexture = async () => {
      if (!runtimeHandle) {
        return;
      }
      picker.pending = true;
      picker.errorMessage = '';
      try {
        const state = await runtimeHandle.switchTexture(picker.previewTextureIndex);
        applyRuntimeState(state);
        picker.textureOpen = false;
      } catch (error: unknown) {
        picker.errorMessage = resolveSelectionErrorMessage(error);
        console.warn('[KT Blog] Live2D texture confirmation failed.', error);
      } finally {
        picker.pending = false;
      }
    };

    /**
     * Cancels costume selection, restoring the committed texture before closing the picker.
     */
    const closeTexturePicker = async () => {
      if (picker.pending) {
        return;
      }
      if (!runtimeHandle || picker.previewTextureIndex === picker.activeTextureIndex) {
        picker.errorMessage = '';
        picker.previewTextureIndex = picker.activeTextureIndex;
        picker.textureOpen = false;
        return;
      }

      picker.pending = true;
      picker.errorMessage = '';
      try {
        await runtimeHandle.previewTexture(picker.activeTextureIndex);
        picker.previewTextureIndex = picker.activeTextureIndex;
        picker.textureOpen = false;
      } catch (error: unknown) {
        picker.errorMessage = resolveSelectionErrorMessage(error);
        console.warn('[KT Blog] Live2D texture preview restore failed.', error);
      } finally {
        picker.pending = false;
      }
    };

    /**
     * Creates TSX-safe listener props for the picker component's kebab-case emits.
     * @returns Listener object accepted by Vue's generated TSX component types.
     */
    const pickerListeners = () => ({
      'onConfirm-texture': confirmTexture,
      'onPreview-texture': previewTexture,
      'onSelect-model': selectModel,
    });

    return () => {
      if (!isDesktop) {
        return null;
      }

      return (
        <>
          <div ref={widgetRef} class="waifu kt-blog__live2d-widget">
            <div ref={tipsRef} class="waifu-tips" />
            <canvas ref={canvasRef} id="live2d" class="live2d kt-blog__live2d-canvas" height={250} width={280} />
            <div ref={toolRef} class="waifu-tool">
              {WORDPRESS_WAIFU_TOOLS.map((item) => (
                <span
                  class={item.className}
                  data-live2d-action={item.action}
                  role="button"
                  tabindex="0"
                  title={item.title}
                />
              ))}
            </div>
            <div ref={chatRef} class="gptInput">
              <input ref={inputRef} id="live2dChatText" placeholder="和 Pio 说点什么..." type="text" />
              <button ref={sendButtonRef} id="live2dSend" type="button">
                发送
              </button>
              <button ref={closeButtonRef} id="live2dSendClose" type="button">
                关闭
              </button>
            </div>
          </div>
          <BlogLive2DPickerModal
            activeModelKey={picker.activeModelKey}
            activeTextureIndex={picker.activeTextureIndex}
            errorMessage={picker.errorMessage}
            models={BLOG_LIVE2D_MODELS}
            open={picker.modelOpen}
            pending={picker.pending}
            previewTextureIndex={picker.previewTextureIndex}
            settings={picker.settings}
            type="model"
            onClose={() => {
              picker.errorMessage = '';
              picker.modelOpen = false;
            }}
            {...pickerListeners()}
          />
          <BlogLive2DPickerModal
            activeModelKey={picker.activeModelKey}
            activeTextureIndex={picker.activeTextureIndex}
            errorMessage={picker.errorMessage}
            models={BLOG_LIVE2D_MODELS}
            open={picker.textureOpen}
            pending={picker.pending}
            previewTextureIndex={picker.previewTextureIndex}
            settings={picker.settings}
            type="texture"
            onClose={closeTexturePicker}
            {...pickerListeners()}
          />
        </>
      );
    };
  },
});

/**
 * Converts runtime selection failures into a stable modal message without leaking asset URLs.
 * @param error Original runtime, asset, or WebGL error thrown while switching.
 * @returns User-facing selection error text.
 */
function resolveSelectionErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes('texture index')) {
    return '服装切换失败，当前模型没有这个服装。';
  }
  return 'Live2D 切换失败，请稍后重试。';
}
