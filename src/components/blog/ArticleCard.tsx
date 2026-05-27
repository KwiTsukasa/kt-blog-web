import {
  CalendarOutlined,
  CommentOutlined,
  EyeOutlined,
  ReadOutlined,
  TagsOutlined,
} from '@antdv-next/icons';
import { defineComponent, type PropType } from 'vue';
import { RouterLink } from 'vue-router';

import { getTagSlugByLabel, type BlogArticle } from '@/data/blog';

export default defineComponent({
  name: 'ArticleCard',
  props: {
    article: {
      type: Object as PropType<BlogArticle>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <article class="kt-blog__post kt-blog__post--preview kt-blog__card">
        <header class="kt-blog__post-header kt-blog__post-header--center">
          <RouterLink class="kt-blog__post-title" to={`/post/${props.article.slug}`}>
            {props.article.title}
          </RouterLink>
          <div class="kt-blog__post-meta">
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--time">
              <CalendarOutlined />
              <span>{props.article.date}</span>
            </div>
            <div class="kt-blog__post-meta-divider">|</div>
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--views">
              <EyeOutlined />
              <span>{props.article.views}</span>
            </div>
            <div class="kt-blog__post-meta-divider">|</div>
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--comments">
              <CommentOutlined />
              <span>{props.article.comments}</span>
            </div>
            <div class="kt-blog__post-meta-divider">|</div>
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--categories">
              <RouterLink class="kt-blog__post-category-link" to={`/category/${props.article.categorySlug}`}>
                {props.article.category}
              </RouterLink>
            </div>
            <br />
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--words">
              <ReadOutlined />
              <span>{props.article.words} 字</span>
            </div>
            <div class="kt-blog__post-meta-divider">|</div>
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--reading-time">
              <span>{props.article.readTime}</span>
            </div>
          </div>
        </header>

        <div class="kt-blog__post-content">{props.article.excerpt}</div>

        <div class="kt-blog__post-tags">
          <TagsOutlined />
          {props.article.tags.map((tag) => (
            <RouterLink
              key={tag}
              class="kt-blog__tag kt-blog__tag--secondary kt-blog__post-tag"
              to={`/tag/${getTagSlugByLabel(tag)}`}
            >
              {tag}
            </RouterLink>
          ))}
        </div>
      </article>
    );
  },
});
