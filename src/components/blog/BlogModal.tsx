import { defineComponent, type PropType } from 'vue';
import { Transition } from 'vue';

import { BlogModalComponent } from './antdvComponents';

export default defineComponent({
  name: 'BlogModal',
  props: {
    className: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    open: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<'sm' | 'md'>,
      default: 'md',
    },
  },
  emits: ['close'],
  setup(props, { emit, slots }) {
    return () => (
      <div class={['kt-blog__modal-host', props.className]}>
        <Transition name="kt-blog__modal" appear>
          {props.open ? (
            <BlogModalComponent
              centered
              class="kt-blog__modal"
              footer={null}
              getContainer={false}
              open={props.open}
              title={props.title}
              width={props.size === 'sm' ? 420 : 620}
              wrapClassName="kt-blog__modal-wrap"
              onCancel={() => emit('close')}
            >
              <div class="kt-blog__modal-body">{slots.default?.()}</div>
            </BlogModalComponent>
          ) : null}
        </Transition>
      </div>
    );
  },
});
