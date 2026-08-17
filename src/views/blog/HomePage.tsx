import { defineComponent } from 'vue'

import ArticleList from '@/components/blog/content/ArticleList'
import BlogLayout from '@/components/blog/layout/BlogLayout'
import { useBlogArticles } from '@/hooks/useBlogArticles'

export default defineComponent({
  name: 'BlogHomePage',
  setup() {
    const { articles } = useBlogArticles()

    return () => (
      <BlogLayout>
        <ArticleList articles={articles.value} />
      </BlogLayout>
    )
  },
})
