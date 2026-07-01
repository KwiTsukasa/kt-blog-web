import { computed, defineComponent, type PropType } from 'vue';
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
    const visibleCategories = computed(() => sortTaxonomyByLabel(props.categories));
    const visibleTags = computed(() => sortTaxonomyByLabel(props.tags));

    return () => (
      <>
        <BlogModal
          className="kt-blog__taxonomy-modal kt-blog__taxonomy-modal--categories"
          title="分类"
          size="taxonomy"
          open={props.active === 'categories'}
          onClose={() => emit('close')}
        >
          {visibleCategories.value.map((category) => (
            <RouterLink
              key={category.slug}
              class="kt-blog__tag kt-blog__tag--secondary"
              to={`/category/${category.slug}`}
              onClick={() => emit('close')}
            >
              {category.label}
              {' '}
              <span class="kt-blog__tag-count">{category.count}</span>
            </RouterLink>
          ))}
        </BlogModal>

        <BlogModal
          className="kt-blog__taxonomy-modal kt-blog__taxonomy-modal--tags"
          title="标签"
          size="taxonomy"
          open={props.active === 'tags'}
          onClose={() => emit('close')}
        >
          {visibleTags.value.map((tag) => (
            <RouterLink
              key={tag.slug}
              class="kt-blog__tag kt-blog__tag--secondary"
              to={`/tag/${tag.slug}`}
              onClick={() => emit('close')}
            >
              {tag.label}
              {' '}
              <span class="kt-blog__tag-count">{tag.count}</span>
            </RouterLink>
          ))}
        </BlogModal>
      </>
    );
  },
});

/**
 * @param terms Category or tag records exposed by the local article source.
 * @returns Terms sorted like the live WordPress Argon taxonomy widgets.
 */
function sortTaxonomyByLabel<T extends BlogCategory | BlogTag>(terms: T[]) {
  return [...terms].sort((left, right) => left.label.localeCompare(right.label));
}
