import { defineComponent, type PropType } from 'vue';

import type { Live2DModelEntry, Live2DModelSettings } from './live2d/runtime/live2dRuntimeTypes';
import BlogModal from './BlogModal';

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
    settings: {
      type: Object as PropType<Live2DModelSettings | null>,
      default: null,
    },
    type: {
      type: String as PropType<'model' | 'texture'>,
      required: true,
    },
  },
  emits: ['close', 'select-model', 'select-texture'],
  /**
   * @param props Picker modal state and active Live2D runtime metadata.
   * @param emit Emits close and selection events to the Blog Live2D owner component.
   * @returns Render function for model or costume selection.
   */
  setup(props, { emit }) {
    /**
     * Renders one selectable button with active state.
     * @param label Button label.
     * @param active Whether this option is selected.
     * @param onClick Selection handler.
     * @returns Selectable picker button.
     */
    const renderOption = (label: string, active: boolean, onClick: () => void) => (
      <button
        class={['kt-blog__live2d-picker-option', active && 'kt-blog__live2d-picker-option--active']}
        disabled={props.pending}
        type="button"
        onClick={onClick}
      >
        <span class="kt-blog__live2d-picker-option-label">{label}</span>
        {active ? <span class="kt-blog__live2d-picker-option-badge">当前</span> : null}
      </button>
    );

    /**
     * Renders registered character choices.
     * @returns Model choice list.
     */
    const renderModelOptions = () => (
      <div class="kt-blog__live2d-picker-grid">
        {props.models.map((model) =>
          renderOption(model.label, model.key === props.activeModelKey, () => emit('select-model', model.key)),
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
        <div class="kt-blog__live2d-picker-grid">
          {props.settings.textures.map((texture, index) =>
            renderOption(resolveTextureLabel(texture, index), index === props.activeTextureIndex, () =>
              emit('select-texture', index),
            ),
          )}
        </div>
      );
    };

    return () => (
      <BlogModal
        className="kt-blog__live2d-picker-modal"
        open={props.open}
        size="md"
        title={props.type === 'model' ? '选择看板娘' : '选择服装'}
        onClose={() => emit('close')}
      >
        {props.errorMessage ? <div class="kt-blog__live2d-picker-error">{props.errorMessage}</div> : null}
        {props.type === 'model' ? renderModelOptions() : renderTextureOptions()}
      </BlogModal>
    );
  },
});

/**
 * Builds a human-readable costume label from a texture path.
 * @param texture Texture path from the Cubism2 model settings.
 * @param index Texture index passed to the TS runtime.
 * @returns Label shown in the costume picker.
 */
function resolveTextureLabel(texture: string, index: number): string {
  const filename = texture.split('/').pop()?.replace(/\.[^.]+$/, '') || `costume-${index + 1}`;
  if (index === 0) {
    return `默认服装`;
  }
  return filename.replace(/[-_]+/g, ' ');
}
