import { createRouter, createWebHashHistory } from 'vue-router';

import ArchivePage from '@/views/blog/ArchivePage';
import BlogHomePage from '@/views/blog/HomePage';
import PostPage from '@/views/blog/PostPage';
import SearchPage from '@/views/blog/SearchPage';
import TermPage from '@/views/blog/TermPage';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'BlogHome',
      component: BlogHomePage,
    },
    {
      path: '/post/:slug',
      name: 'BlogPost',
      component: PostPage,
    },
    {
      path: '/category/:slug',
      name: 'BlogCategory',
      component: TermPage,
      meta: {
        termMode: 'category',
      },
    },
    {
      path: '/tag/:slug',
      name: 'BlogTag',
      component: TermPage,
      meta: {
        termMode: 'tag',
      },
    },
    {
      path: '/archives',
      name: 'BlogArchive',
      component: ArchivePage,
    },
    {
      path: '/search',
      name: 'BlogSearch',
      component: SearchPage,
    },
  ],
});

export default router;
