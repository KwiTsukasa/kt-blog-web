import { CommentOutlined, FolderOpenOutlined, HistoryOutlined, ReadOutlined } from '@antdv-next/icons';
import { defineComponent, type PropType } from 'vue';
import { RouterLink } from 'vue-router';

import type { BlogArticle, BlogCategory } from '@/data/blog';

export default defineComponent({
  name: 'BlogRightbar',
  props: {
    articles: {
      type: Array as PropType<BlogArticle[]>,
      required: true,
    },
    categories: {
      type: Array as PropType<BlogCategory[]>,
      required: true,
    },
  },
  setup(props) {
    const archiveMonths = Array.from(new Set(props.articles.map((article) => article.date.slice(0, 7))));

    return () => (
      <aside class="kt-blog__rightbar" role="complementary">
        <div class="kt-blog__rightbar-widget kt-blog__card">
          <h2 class="kt-blog__rightbar-title">
            <ReadOutlined />
            近期文章
          </h2>
          <ul class="kt-blog__rightbar-list">
            {props.articles.slice(0, 5).map((article) => (
              <li key={article.slug} class="kt-blog__rightbar-list-item">
                <RouterLink to={`/post/${article.slug}`}>{article.title}</RouterLink>
              </li>
            ))}
          </ul>
        </div>

        <div class="kt-blog__rightbar-widget kt-blog__card">
          <h2 class="kt-blog__rightbar-title">
            <CommentOutlined />
            近期评论
          </h2>
          <ol class="kt-blog__rightbar-list kt-blog__rightbar-list--comments">
            {props.articles.slice(0, 4).map((article) => (
              <li key={article.slug} class="kt-blog__rightbar-comment">
                <span class="kt-blog__rightbar-comment-author">KT Admin</span>
                <span> 发表在 </span>
                <RouterLink to={`/post/${article.slug}`}>{article.title}</RouterLink>
              </li>
            ))}
          </ol>
        </div>

        <div class="kt-blog__rightbar-widget kt-blog__card">
          <h2 class="kt-blog__rightbar-title">
            <HistoryOutlined />
            归档
          </h2>
          <ul class="kt-blog__rightbar-list">
            {archiveMonths.map((month) => (
              <li key={month} class="kt-blog__rightbar-list-item">
                <RouterLink to="/archives">{month}</RouterLink>
              </li>
            ))}
          </ul>
        </div>

        <div class="kt-blog__rightbar-widget kt-blog__card">
          <h2 class="kt-blog__rightbar-title">
            <FolderOpenOutlined />
            分类
          </h2>
          <ul class="kt-blog__rightbar-list kt-blog__rightbar-list--categories">
            {props.categories.map((category) => (
              <li key={category.slug} class="kt-blog__rightbar-category">
                <RouterLink to={`/category/${category.slug}`}>{category.label}</RouterLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    );
  },
});
