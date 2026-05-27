import { FileTextOutlined } from '@antdv-next/icons';
import { defineComponent } from 'vue';

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
  },
  setup(props, { slots }) {
    return () => (
      <div class="kt-blog__page-info-wrap">
        <div class="kt-blog__page-info kt-blog__card kt-blog__card--gradient-secondary kt-blog__card--large-shadow">
          <div class="kt-blog__page-info-body kt-blog__card-body">
            <h3 class="kt-blog__page-info-title">{props.title}</h3>
            {props.description ? <p class="kt-blog__page-info-description">{props.description}</p> : null}
            {props.meta ? (
              <p class="kt-blog__page-info-meta">
                <FileTextOutlined />
                <span>{props.meta}</span>
              </p>
            ) : null}
            {slots.default?.()}
          </div>
        </div>
      </div>
    );
  },
});
