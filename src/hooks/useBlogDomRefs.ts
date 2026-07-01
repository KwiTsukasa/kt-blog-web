import { type ComponentPublicInstance } from 'vue';

import { createBlogElementRef, createBlogFocusableRef } from '@/factories/blogDomFactory';

type FocusableTarget = HTMLElement | ComponentPublicInstance | null;

const postArticleRef = createBlogElementRef<HTMLElement>();
const postCommentRef = createBlogElementRef<HTMLElement>();
const postCommentInputRef = createBlogFocusableRef<FocusableTarget>();
const postContentRef = createBlogElementRef<HTMLElement>();

/**
 * @param target 文章正文容器 DOM，供阅读进度计算使用。
 */
export function setBlogPostArticleRef(target: HTMLElement | null) {
  postArticleRef.value = target;
}

/**
 * @param target 文章正文内容 DOM，供文章目录库从真实 heading 节点生成目录。
 */
export function setBlogPostContentRef(target: HTMLElement | null) {
  postContentRef.value = target;
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
    postContentRef,
  };
}

/**
 * 清理文章页注册过的 DOM ref，避免离开文章页后悬浮按钮读到过期节点。
 */
export function clearBlogPostRefs() {
  postArticleRef.value = null;
  postCommentRef.value = null;
  postCommentInputRef.value = null;
  postContentRef.value = null;
}
