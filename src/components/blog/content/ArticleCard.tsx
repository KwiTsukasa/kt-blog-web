import {
  CalendarOutlined,
  CommentOutlined,
  EyeOutlined,
  ReadOutlined,
  TagsOutlined,
} from '@antdv-next/icons'
import { defineComponent, type PropType } from 'vue'
import { RouterLink } from 'vue-router'

import { getArticleCategories, type BlogArticle } from '@/data/blog'
import { blogPostCardId } from '@/factories/blogDomFactory'
import { useBlogArticles } from '@/hooks/useBlogArticles'

export default defineComponent({
  name: 'ArticleCard',
  props: {
    article: {
      type: Object as PropType<BlogArticle>,
      required: true,
    },
  },
  setup(props) {
    const { getTagSlugByLabel } = useBlogArticles()

    return () => (
      <article
        id={blogPostCardId(props.article.id)}
        class="kt-blog__post kt-blog__post--preview kt-blog__card post card bg-white shadow-sm border-0"
      >
        <header class="kt-blog__post-header kt-blog__post-header--center post-header text-center">
          <RouterLink class="kt-blog__post-title post-title" to={`/post/${props.article.slug}`}>
            {props.article.title}
          </RouterLink>
          <div class="kt-blog__post-meta post-meta">
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--time post-meta-detail">
              <CalendarOutlined />
              <span>{props.article.date}</span>
            </div>
            <div class="kt-blog__post-meta-divider post-meta-devide">|</div>
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--views post-meta-detail">
              <EyeOutlined />
              <span>{props.article.views}</span>
            </div>
            <div class="kt-blog__post-meta-divider post-meta-devide">|</div>
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--comments post-meta-detail">
              <CommentOutlined />
              <span>{props.article.comments}</span>
            </div>
            <div class="kt-blog__post-meta-divider post-meta-devide">|</div>
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--categories post-meta-detail">
              {getArticleCategories(props.article).map((category) => (
                <RouterLink
                  key={category.slug}
                  class="kt-blog__post-category-link"
                  target="_blank"
                  to={`/category/${category.slug}`}
                >
                  {category.label}
                </RouterLink>
              ))}
            </div>
            <br />
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--words post-meta-detail">
              <ReadOutlined />
              <span>{props.article.words} 字</span>
            </div>
            <div class="kt-blog__post-meta-divider post-meta-devide">|</div>
            <div class="kt-blog__post-meta-item kt-blog__post-meta-item--reading-time post-meta-detail">
              <span>{props.article.readTime}</span>
            </div>
          </div>
        </header>

        <div class="kt-blog__post-content post-content">{props.article.excerpt}</div>

        {(() => {
          if (props.article.tags.length) {
            return (
              <div class="kt-blog__post-tags post-tags">
                <TagsOutlined />
                {props.article.tags.map((tag) => (
                  <RouterLink
                    key={tag}
                    class="kt-blog__tag kt-blog__tag--secondary kt-blog__post-tag tag badge badge-secondary post-meta-detail-tag"
                    target="_blank"
                    to={`/tag/${getTagSlugByLabel(tag)}`}
                  >
                    {tag}
                  </RouterLink>
                ))}
              </div>
            )
          }
          return null
        })()}
      </article>
    )
  },
})
