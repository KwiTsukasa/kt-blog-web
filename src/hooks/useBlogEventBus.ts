import mitt from 'mitt';

export type BlogTaxonomyModal = 'categories' | 'tags';

type BlogEventMap = {
  'blog:sidebar:close': undefined;
  'blog:search:open': undefined;
  'blog:taxonomy:open': BlogTaxonomyModal;
};

const blogEventBus = mitt<BlogEventMap>();

/**
 * 提供博客搜索、分类标签弹窗与移动侧栏关闭入口共用的 mitt 事件总线。
 * @returns 带事件类型约束的博客界面事件总线。
 */
export function useBlogEventBus() {
  return blogEventBus;
}
