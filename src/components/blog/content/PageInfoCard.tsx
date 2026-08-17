import { defineComponent, type PropType } from 'vue'

type PageInfoVariant = 'archive' | 'search'

export default defineComponent({
  name: 'PageInfoCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    meta: {
      type: String,
      default: '',
    },
    variant: {
      type: String as PropType<PageInfoVariant>,
      default: 'archive',
    },
  },
  /*
   * @param props Argon page-information copy and variant used to mirror archive/search geometry.
   * @param slots Optional slot content such as the live search filter row that sits before result metadata.
   * @returns Render function for the WordPress Argon page-information card surface.
   */
  setup(props, { slots }) {
    return () => {
      const isSearch = props.variant === 'search'

      return (
        <div class="kt-blog__page-info-wrap">
          <div
            class={[
              'kt-blog__page-info',
              `kt-blog__page-info--${props.variant}`,
              'kt-blog__card',
              'kt-blog__card--gradient-secondary',
              'kt-blog__card--large-shadow',
            ]}
          >
            <div class="kt-blog__page-info-body kt-blog__card-body">
              <h3 class="kt-blog__page-info-title">{props.title}</h3>
              {(() => {
                if (props.description) {
                  if (isSearch) {
                    return <p class="kt-blog__page-info-lead">{props.description}</p>
                  }
                  return <p class="kt-blog__page-info-description">{props.description}</p>
                }
                return null
              })()}
              {slots.default?.()}
              {(() => {
                if (props.meta) {
                  return <p class="kt-blog__page-info-meta">{props.meta}</p>
                }
                return null
              })()}
            </div>
          </div>
        </div>
      )
    }
  },
})
