import mitt from 'mitt';

export type BlogTaxonomyModal = 'categories' | 'tags';

type BlogEventMap = {
  'blog:search:open': undefined;
  'blog:taxonomy:open': BlogTaxonomyModal;
};

const blogEventBus = mitt<BlogEventMap>();

/**
 * @returns 博客主题内跨组件 UI 事件总线，用于搜索、分类、标签等全局交互下发。
 */
export function useBlogEventBus() {
  return blogEventBus;
}
