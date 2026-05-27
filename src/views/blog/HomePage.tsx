import { defineComponent } from 'vue';

import ArticleList from '@/components/blog/ArticleList';
import BlogLayout from '@/components/blog/BlogLayout';
import { articles } from '@/data/blog';

export default defineComponent({
  name: 'BlogHomePage',
  setup() {
    return () => (
      <BlogLayout>
        <ArticleList articles={articles} />
      </BlogLayout>
    );
  },
});
