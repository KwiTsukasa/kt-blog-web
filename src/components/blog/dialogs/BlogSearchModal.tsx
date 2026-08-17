import { SearchOutlined } from '@antdv-next/icons'
import { defineComponent, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { BlogButton, BlogForm, BlogInput } from '../ui/antdvComponents'
import BlogModal from './BlogModal'

export default defineComponent({
  name: 'BlogSearchModal',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const router = useRouter()
    const keyword = ref('')

    watch(
      () => props.open,
      (open) => {
        if (!open) {
          keyword.value = ''
        }
      },
    )

    const submitSearch = () => {
      const query = keyword.value.trim()
      if (!query) {
        return
      }

      router.push({
        name: 'BlogSearch',
        query: { q: query },
      })
      emit('close')
    }

    return () => (
      <BlogModal
        className="kt-blog__search-modal"
        title="搜索"
        size="sm"
        open={props.open}
        onClose={() => emit('close')}
      >
        <BlogForm class="kt-blog__search-modal-form" onFinish={submitSearch}>
          <div class="kt-blog__form-group kt-blog__form-group--spaced">
            <div class="kt-blog__input-group">
              <div class="kt-blog__input-addon-wrap">
                <span class="kt-blog__input-addon">
                  <SearchOutlined />
                </span>
              </div>
              <BlogInput
                name="s"
                class="kt-blog__input"
                placeholder="搜索什么..."
                autocomplete="off"
                v-model:value={keyword.value}
              />
            </div>
          </div>
          <div class="kt-blog__search-modal-actions">
            <BlogButton class="kt-blog__button kt-blog__button--primary" htmlType="submit">
              搜索
            </BlogButton>
          </div>
        </BlogForm>
      </BlogModal>
    )
  },
})
