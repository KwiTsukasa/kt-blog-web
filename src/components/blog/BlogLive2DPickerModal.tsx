import { defineComponent, type PropType } from 'vue';

import { resolveLive2DCostumeLabel } from './live2d/live2dCostumeLabels';
import type { Live2DModelEntry, Live2DModelSettings } from './live2d/runtime/live2dRuntimeTypes';
import BlogModal from './BlogModal';

type PickerOptionStatus = 'active' | 'current' | 'preview' | null;

export default defineComponent({
  name: 'BlogLive2DPickerModal',
  props: {
    activeModelKey: {
      type: String,
      default: '',
    },
    activeTextureIndex: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    models: {
      type: Array as PropType<readonly Live2DModelEntry[]>,
      required: true,
    },
    open: {
      type: Boolean,
      default: false,
    },
    pending: {
      type: Boolean,
      default: false,
    },
    previewTextureIndex: {
      type: Number,
      default: 0,
    },
    settings: {
      type: Object as PropType<Live2DModelSettings | null>,
      default: null,
    },
    type: {
      type: String as PropType<'model' | 'texture'>,
      required: true,
    },
  },
  emits: ['close', 'confirm-texture', 'preview-texture', 'select-model'],
  /**
   * @param props Picker modal state and active Live2D runtime metadata.
   * @param emit Emits close and selection events to the Blog Live2D owner component.
   * @returns Render function for model or costume selection.
   */
  setup(props, { emit }) {
    /**
     * Renders one selectable button with committed or preview state.
     * @param label Button label.
     * @param status Visual state for a model, committed costume, or previewed costume.
     * @param pressed Whether the option is currently applied to the visible model.
     * @param onClick Selection handler.
     * @returns Selectable picker button.
     */
    const renderOption = (label: string, status: PickerOptionStatus, pressed: boolean, onClick: () => void) => (
      <button
        aria-pressed={pressed}
        class={['kt-blog__live2d-picker-option', status && `kt-blog__live2d-picker-option--${status}`]}
        disabled={props.pending}
        title={label}
        type="button"
        onClick={onClick}
      >
        <span class="kt-blog__live2d-picker-option-label">{label}</span>
        {status === 'active' || status === 'current' ? (
          <span class="kt-blog__live2d-picker-option-badge">当前</span>
        ) : null}
        {status === 'preview' ? <span class="kt-blog__live2d-picker-option-badge">预览中</span> : null}
      </button>
    );

    /**
     * Renders registered character choices.
     * @returns Model choice list.
     */
    const renderModelOptions = () => (
      <div class="kt-blog__live2d-picker-grid">
        {props.models.map((model) =>
          renderOption(
            model.label,
            model.key === props.activeModelKey ? 'active' : null,
            model.key === props.activeModelKey,
            () => emit('select-model', model.key),
          ),
        )}
      </div>
    );

    /**
     * Renders texture choices for the active model.
     * @returns Texture choice list or loading/empty state.
     */
    const renderTextureOptions = () => {
      if (!props.settings) {
        return <div class="kt-blog__live2d-picker-empty">服装信息读取中。</div>;
      }
      if (props.settings.textures.length === 0) {
        return <div class="kt-blog__live2d-picker-empty">当前模型没有可切换服装。</div>;
      }
      return (
        <>
          <div aria-live="polite" class="kt-blog__live2d-picker-preview-status">
            {resolveTexturePreviewStatus(
              props.settings,
              props.activeTextureIndex,
              props.previewTextureIndex,
              props.pending,
            )}
          </div>
          <div aria-busy={props.pending} class="kt-blog__live2d-picker-grid">
            {props.settings.textures.map((texture, index) => {
              const current = index === props.activeTextureIndex;
              const preview = index === props.previewTextureIndex;
              const status: PickerOptionStatus = preview && !current ? 'preview' : current ? 'current' : null;
              return renderOption(resolveLive2DCostumeLabel(texture), status, preview, () =>
                emit('preview-texture', index),
              );
            })}
          </div>
        </>
      );
    };

    return () => (
      <BlogModal
        className="kt-blog__live2d-picker-modal"
        open={props.open}
        size="md"
        title={props.type === 'model' ? '选择看板娘' : '选择服装'}
        onClose={() => emit('close')}
        v-slots={{
          default: () => (
            <>
              {props.errorMessage ? (
                <div aria-live="assertive" class="kt-blog__live2d-picker-error">
                  {props.errorMessage}
                </div>
              ) : null}
              {props.type === 'model' ? renderModelOptions() : renderTextureOptions()}
            </>
          ),
          footer:
            props.type === 'texture'
              ? () => (
                  <>
                    <button
                      class="kt-blog__button kt-blog__button--neutral kt-blog__button--small"
                      disabled={props.pending}
                      type="button"
                      onClick={() => emit('close')}
                    >
                      取消
                    </button>
                    <button
                      class="kt-blog__button kt-blog__button--primary kt-blog__button--small"
                      disabled={props.pending}
                      type="button"
                      onClick={() => emit('confirm-texture')}
                    >
                      使用此服装
                    </button>
                  </>
                )
              : undefined,
        }}
      />
    );
  },
});

/**
 * Builds the live-region message for the texture picker.
 * @param settings Active model settings containing texture names.
 * @param activeTextureIndex Persisted texture index.
 * @param previewTextureIndex Texture currently rendered on the model.
 * @param pending Whether a renderer operation is in flight.
 * @returns Concise Chinese preview instruction or progress message.
 */
function resolveTexturePreviewStatus(
  settings: Live2DModelSettings,
  activeTextureIndex: number,
  previewTextureIndex: number,
  pending: boolean,
): string {
  if (pending) {
    return '正在切换服装预览…';
  }
  if (previewTextureIndex !== activeTextureIndex) {
    const texture = settings.textures[previewTextureIndex];
    if (texture) {
      return `正在预览：${resolveLive2DCostumeLabel(texture)}`;
    }
  }
  return '点击服装后，可在左下角看板娘上即时预览。';
}
