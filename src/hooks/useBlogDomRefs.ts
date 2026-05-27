import { shallowRef, type ComponentPublicInstance } from 'vue';

type FocusableTarget = HTMLElement | ComponentPublicInstance | null;

const postArticleRef = shallowRef<HTMLElement | null>(null);
const postCommentRef = shallowRef<HTMLElement | null>(null);
const postCommentInputRef = shallowRef<FocusableTarget>(null);

/**
 * @param target 文章正文容器 DOM，供阅读进度计算使用。
 */
export function setBlogPostArticleRef(target: HTMLElement | null) {
  postArticleRef.value = target;
}

/**
 * @param target 评论区 DOM，供悬浮评论按钮滚动定位使用。
 */
export function setBlogPostCommentRef(target: HTMLElement | null) {
  postCommentRef.value = target;
}

/**
 * @param target 评论输入组件或原生输入 DOM，供跳转评论后聚焦使用。
 */
export function setBlogPostCommentInputRef(target: FocusableTarget) {
  postCommentInputRef.value = target;
}

/**
 * @returns 当前博客页面需要跨组件读取的 DOM ref。
 */
export function useBlogDomRefs() {
  return {
    postArticleRef,
    postCommentInputRef,
    postCommentRef,
  };
}

/**
 * 清理文章页注册过的 DOM ref，避免离开文章页后悬浮按钮读到过期节点。
 */
export function clearBlogPostRefs() {
  postArticleRef.value = null;
  postCommentRef.value = null;
  postCommentInputRef.value = null;
}
