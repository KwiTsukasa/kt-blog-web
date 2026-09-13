import { type ComponentPublicInstance } from 'vue';

import { createBlogElementRef, createBlogFocusableRef } from '@/factories/blogDomFactory';

type FocusableTarget = HTMLElement | ComponentPublicInstance | null;

const pageScrollRef = createBlogElementRef<HTMLElement>();
const toolbarRef = createBlogElementRef<HTMLElement>();
const bannerContainerRef = createBlogElementRef<HTMLElement>();
const postArticleRef = createBlogElementRef<HTMLElement>();
const postCommentRef = createBlogElementRef<HTMLElement>();
const postCommentInputRef = createBlogFocusableRef<FocusableTarget>();
const postContentRef = createBlogElementRef<HTMLElement>();

/**
 * 更新文章容器引用，供阅读进度计算读取。
 * @param target - 待更新、比较或导航到的目标。
 */
export function setBlogPostArticleRef(target: HTMLElement | null) {
  postArticleRef.value = target;
}

/**
 * 更新文章正文引用，供目录从真实标题节点生成结构。
 * @param target - 待更新、比较或导航到的目标。
 */
export function setBlogPostContentRef(target: HTMLElement | null) {
  postContentRef.value = target;
}

/**
 * 更新评论区引用，供悬浮评论按钮滚动定位。
 * @param target - 待更新、比较或导航到的目标。
 */
export function setBlogPostCommentRef(target: HTMLElement | null) {
  postCommentRef.value = target;
}

/**
 * 更新评论输入引用，供跳转评论后恢复焦点。
 * @param target - 待更新、比较或导航到的目标。
 */
export function setBlogPostCommentInputRef(target: FocusableTarget) {
  postCommentInputRef.value = target;
}

/**
 * 提供跨路由保留的页面外壳引用和当前文章引用，供滚动效果、目录及阅读进度使用。
 * @returns 页头、横幅、原生滚动容器与当前文章及评论区的共享响应式引用。
 */
export function useBlogDomRefs() {
  return {
    pageScrollRef,
    toolbarRef,
    bannerContainerRef,
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
