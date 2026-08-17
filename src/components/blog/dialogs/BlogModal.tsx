import { defineComponent, type PropType } from 'vue'

import { BlogModalComponent } from '../ui/antdvComponents'

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
      type: String as PropType<'sm' | 'md' | 'taxonomy'>,
      default: 'md',
    },
  },
  emits: ['close'],
  /*
   * @param props Modal state and sizing options mapped to the local Blog theme surface.
   * @param emit Emits close requests from escape, close button, or mask interaction.
   * @param slots Modal content supplied by search or taxonomy features.
   * @returns Render function that delegates modal motion to antdv-next and keeps Blog-owned theme classes.
   */
  setup(props, { emit, slots }) {
    const modalWidth = (() => {
      if (props.size === 'sm') {
        return 420
      }
      if (props.size === 'taxonomy') {
        return 500
      }
      return 620
    })()

    return () => {
      const footerSlot = slots.footer?.()
      const modalFooter = (() => {
        if (footerSlot?.length) {
          return <div class="kt-blog__modal-footer">{footerSlot}</div>
        }
        return null
      })()

      return (
        <div
          class={[
            'kt-blog__modal-host',
            (() => {
              if (props.open) {
                return 'kt-blog__modal-host--open'
              }
              return ''
            })(),
            props.className,
          ]}
        >
          <BlogModalComponent
            centered
            class="kt-blog__modal"
            footer={modalFooter}
            getContainer={false}
            maskClosable
            open={props.open}
            title={<div class="kt-blog__modal-header">{props.title}</div>}
            width={modalWidth}
            wrapClassName="kt-blog__modal-wrap"
            onCancel={() => emit('close')}
          >
            <div class="kt-blog__modal-content">
              <div class="kt-blog__modal-body">{slots.default?.()}</div>
            </div>
          </BlogModalComponent>
        </div>
      )
    }
  },
})
