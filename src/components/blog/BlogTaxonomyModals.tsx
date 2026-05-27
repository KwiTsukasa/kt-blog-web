import { defineComponent, type PropType } from 'vue';
import { RouterLink } from 'vue-router';

import type { BlogCategory, BlogTag } from '@/data/blog';

import BlogModal from './BlogModal';

type ActiveModal = 'categories' | 'tags' | null;

export default defineComponent({
  name: 'BlogTaxonomyModals',
  props: {
    active: {
      type: String as PropType<ActiveModal>,
      default: null,
    },
    categories: {
      type: Array as PropType<BlogCategory[]>,
      required: true,
    },
    tags: {
      type: Array as PropType<BlogTag[]>,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    return () => (
      <>
        <BlogModal
          className="kt-blog__taxonomy-modal kt-blog__taxonomy-modal--categories"
          title="分类"
          open={props.active === 'categories'}
          onClose={() => emit('close')}
        >
          {props.categories.map((category) => (
            <RouterLink
              key={category.slug}
              class="kt-blog__tag kt-blog__tag--secondary"
              to={`/category/${category.slug}`}
              onClick={() => emit('close')}
            >
              {category.label}
              <span class="kt-blog__tag-count">{category.count}</span>
            </RouterLink>
          ))}
        </BlogModal>

        <BlogModal
          className="kt-blog__taxonomy-modal kt-blog__taxonomy-modal--tags"
          title="标签"
          open={props.active === 'tags'}
          onClose={() => emit('close')}
        >
          {props.tags.map((tag) => (
            <RouterLink
              key={tag.slug}
              class="kt-blog__tag kt-blog__tag--secondary"
              to={`/tag/${tag.slug}`}
              onClick={() => emit('close')}
            >
              {tag.label}
              <span class="kt-blog__tag-count">{tag.count}</span>
            </RouterLink>
          ))}
        </BlogModal>
      </>
    );
  },
});
