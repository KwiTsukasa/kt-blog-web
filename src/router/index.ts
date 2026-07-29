import { createRouter, createWebHashHistory } from 'vue-router';

import ArchivePage from '@/views/blog/ArchivePage';
import BlogHomePage from '@/views/blog/HomePage';
import PostPage from '@/views/blog/PostPage';
import SearchPage from '@/views/blog/SearchPage';
import TermPage from '@/views/blog/TermPage';

import { resolveBlogRuntimeBase } from './runtimeBase';

const router = createRouter({
  history: createWebHashHistory(resolveBlogRuntimeBase()),
  routes: [
    {
      path: '/',
      name: 'BlogHome',
      component: BlogHomePage,
      meta: {
        argonKind: 'home',
      },
    },
    {
      path: '/post/:slug',
      name: 'BlogPost',
      component: PostPage,
      meta: {
        argonKind: 'post',
      },
    },
    {
      path: '/category/:slug',
      name: 'BlogCategory',
      component: TermPage,
      meta: {
        argonKind: 'category',
        termMode: 'category',
      },
    },
    {
      path: '/tag/:slug',
      name: 'BlogTag',
      component: TermPage,
      meta: {
        argonKind: 'tag',
        termMode: 'tag',
      },
    },
    {
      path: '/archives',
      name: 'BlogArchive',
      component: ArchivePage,
      meta: {
        argonKind: 'archive',
      },
    },
    {
      path: '/search',
      name: 'BlogSearch',
      component: SearchPage,
      meta: {
        argonKind: 'search',
      },
    },
  ],
});

export default router;
