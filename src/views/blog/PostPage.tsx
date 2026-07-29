import { CalendarOutlined, CommentOutlined, EyeOutlined, ReadOutlined, TagsOutlined } from '@antdv-next/icons';
import { computed, defineComponent, onBeforeUnmount, ref, Transition, type ComponentPublicInstance, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import BlogLayout from '@/components/blog/BlogLayout';
import BlogShare from '@/components/blog/BlogShare';
import {
  BlogForm,
  BlogInput,
  BlogTextArea,
} from '@/components/blog/antdvComponents';
import { getArticleCategories } from '@/data/blog';
import { blogDomId, blogPostParagraphId, toBlogHTMLElement } from '@/factories/blogDomFactory';
import { bindArgonPostContentEffects } from '@/hooks/useArgonPostContentEffects';
import { useBlogArticles } from '@/hooks/useBlogArticles';
import {
  clearBlogPostRefs,
  setBlogPostArticleRef,
  setBlogPostCommentInputRef,
  setBlogPostCommentRef,
  setBlogPostContentRef,
} from '@/hooks/useBlogDomRefs';

export default defineComponent({
  name: 'BlogPostPage',
  setup() {
    const route = useRoute();
    const {
      articles,
      getArticleBySlug,
      getTagSlugByLabel,
      loadArticle,
    } = useBlogArticles();
    const slug = computed(() => String(route.params.slug ?? ''));
    const article = computed(() => getArticleBySlug(slug.value));
    const articleIndex = computed(() => articles.value.findIndex((item) => item.slug === article.value?.slug));
    const previousArticle = computed(() => {
      const index = articleIndex.value;

      return index >= 0 && index < articles.value.length - 1 ? articles.value[index + 1] : null;
    });
    const nextArticle = computed(() => {
      const index = articleIndex.value;

      return index > 0 ? articles.value[index - 1] : null;
    });
    const commentContent = ref('');
    const commentEmail = ref('');
    const commentCaptcha = ref('');
    const commentName = ref('');
    let cleanupPostContentEffects: (() => void) | null = null;

    const registerPostContentRef = (target: Element | ComponentPublicInstance | null) => {
      cleanupPostContentEffects?.();
      cleanupPostContentEffects = null;

      const element = toBlogHTMLElement(target);
      setBlogPostContentRef(element);
      if (element) {
        cleanupPostContentEffects = bindArgonPostContentEffects(element);
      }
    };

    onBeforeUnmount(() => {
      cleanupPostContentEffects?.();
      cleanupPostContentEffects = null;
      clearBlogPostRefs();
    });

    watch(
      slug,
      (value) => {
        if (value) void loadArticle(value);
      },
      { immediate: true },
    );

    return () => {
      const currentArticle = article.value;

      if (!currentArticle) {
        return (
          <BlogLayout
            mainClass="kt-blog__main--post"
            pageTitle="文章不存在"
            pageDescription="当前文章可能已经移动或被删除。"
            pageMeta="0 个结果"
            showPageInfo={false}
          >
            <article class="kt-blog__post kt-blog__post--full kt-blog__card post post-full card bg-white shadow-sm border-0">
              <div class="kt-blog__post-content">没有找到文章。</div>
            </article>
          </BlogLayout>
        );
      }

      const currentPreviousArticle = previousArticle.value;
      const currentNextArticle = nextArticle.value;

      return (
        <BlogLayout
          mainClass="kt-blog__main--post"
          pageTitle={currentArticle.title}
          pageDescription={currentArticle.excerpt}
          pageMeta={`${currentArticle.views} 次阅读`}
          showPageInfo={false}
        >
          <Transition name="kt-blog__post-page-transition" mode="out-in" appear>
            <article
              key={currentArticle.slug}
              ref={(target) => setBlogPostArticleRef(toBlogHTMLElement(target))}
              class="kt-blog__post kt-blog__post--full kt-blog__card post post-full card bg-white shadow-sm border-0"
            >
            <header class="kt-blog__post-header kt-blog__post-header--center">
              <RouterLink id={blogDomId('postArticleTitle')} class="kt-blog__post-title" to={`/post/${currentArticle.slug}`}>
                {currentArticle.title}
              </RouterLink>
              <div class="kt-blog__post-meta">
                <div class="kt-blog__post-meta-item kt-blog__post-meta-item--time">
                  <CalendarOutlined />
                  <span>{currentArticle.date}</span>
                </div>
                <div class="kt-blog__post-meta-divider">|</div>
                <div class="kt-blog__post-meta-item kt-blog__post-meta-item--views">
                  <EyeOutlined />
                  <span>{currentArticle.views}</span>
                </div>
                <div class="kt-blog__post-meta-divider">|</div>
                <div class="kt-blog__post-meta-item kt-blog__post-meta-item--comments">
                  <CommentOutlined />
                  <span>{currentArticle.comments}</span>
                </div>
                <div class="kt-blog__post-meta-divider">|</div>
                <div class="kt-blog__post-meta-item kt-blog__post-meta-item--categories">
                  {getArticleCategories(currentArticle).map((category) => (
                    <RouterLink key={category.slug} to={`/category/${category.slug}`}>
                      {category.label}
                    </RouterLink>
                  ))}
                </div>
                <br />
                <div class="kt-blog__post-meta-item kt-blog__post-meta-item--words">
                  <ReadOutlined />
                  <span>{currentArticle.words} 字</span>
                </div>
                <div class="kt-blog__post-meta-divider">|</div>
                <div class="kt-blog__post-meta-item kt-blog__post-meta-item--reading-time">
                  <span>{currentArticle.readTime}</span>
                </div>
              </div>
            </header>

            {currentArticle.contentHtml ? (
              <div
                id={blogDomId('postContent')}
                ref={registerPostContentRef}
                class="kt-blog__post-content kt-blog__post-content--full post-content"
                innerHTML={currentArticle.contentHtml}
              />
            ) : (
              <div
                id={blogDomId('postContent')}
                ref={registerPostContentRef}
                class="kt-blog__post-content kt-blog__post-content--full post-content"
              >
                {currentArticle.content.map((paragraph, index) => (
                  <p id={blogPostParagraphId(index + 1)} key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}

            <div class="kt-blog__post-tags">
              <TagsOutlined />
              {currentArticle.tags.map((tag) => (
                <RouterLink
                  key={tag}
                  class="kt-blog__tag kt-blog__tag--secondary kt-blog__post-tag"
                  to={`/tag/${getTagSlugByLabel(tag)}`}
                >
                  {tag}
                </RouterLink>
              ))}
            </div>
            </article>
          </Transition>

          <BlogShare />

          <div id={blogDomId('comments')} class="kt-blog__comments kt-blog__card comments-area card shadow-sm">
            <div class="kt-blog__card-body card-body">
              <span>暂无评论</span>
            </div>
          </div>

          <div
            id={blogDomId('postComment')}
            ref={(target) => setBlogPostCommentRef(toBlogHTMLElement(target))}
            class="kt-blog__comment-form kt-blog__card card shadow-sm"
          >
            <div class="kt-blog__card-body card-body">
              <h2 class="kt-blog__section-title">
                <CommentOutlined />
                <span class="kt-blog__comment-edit-hidden">发送评论</span>
              </h2>
              <BlogForm class="kt-blog__comment-form-body" layout="vertical">
                <div class="kt-blog__form-grid kt-blog__form-grid--comment-content">
                  <div class="kt-blog__form-col kt-blog__form-col--full">
                    <BlogTextArea
                      id={blogDomId('postCommentContent')}
                      ref={(target: any) => setBlogPostCommentInputRef(target)}
                      class="kt-blog__comment-form-content kt-blog__input"
                      placeholder="评论内容"
                      name="comment"
                      v-model:value={commentContent.value}
                    />
                  </div>
                </div>
                <div class="kt-blog__form-grid kt-blog__form-grid--comment-identity kt-blog__comment-edit-hidden">
                  <div class="kt-blog__form-col kt-blog__form-col--name">
                    <div class="kt-blog__form-group">
                      <div class="kt-blog__input-group kt-blog__input-group--spaced input-group input-group-alternative mb-4">
                        <div class="kt-blog__input-addon-wrap">
                          <span class="kt-blog__input-addon input-group-text">
                            <i aria-hidden="true" class="fa fa-user-circle" />
                          </span>
                        </div>
                        <BlogInput
                          id={blogDomId('postCommentName')}
                          class="kt-blog__comment-form-name kt-blog__input"
                          placeholder="昵称"
                          name="author"
                          v-model:value={commentName.value}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="kt-blog__form-col kt-blog__form-col--email">
                    <div class="kt-blog__form-group">
                      <div class="kt-blog__input-group kt-blog__input-group--spaced input-group input-group-alternative mb-4">
                        <div class="kt-blog__input-addon-wrap">
                          <span class="kt-blog__input-addon input-group-text">
                            <i aria-hidden="true" class="fa fa-envelope" />
                          </span>
                        </div>
                        <BlogInput
                          id={blogDomId('postCommentEmail')}
                          class="kt-blog__comment-form-email kt-blog__input"
                          placeholder="邮箱"
                          name="email"
                          v-model:value={commentEmail.value}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="kt-blog__form-col kt-blog__form-col--captcha">
                    <div class="kt-blog__form-group">
                      <div class="kt-blog__input-group kt-blog__input-group--spaced input-group input-group-alternative mb-4 post-comment-captcha-container">
                        <div class="kt-blog__input-addon-wrap">
                          <span class="kt-blog__input-addon input-group-text">
                            <i aria-hidden="true" class="fa fa-key" />
                          </span>
                        </div>
                        <BlogInput
                          id={blogDomId('postCommentCaptcha')}
                          class="kt-blog__comment-form-captcha kt-blog__input"
                          placeholder="验证码"
                          v-model:value={commentCaptcha.value}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="kt-blog__comment-actions">
                  <div class="kt-blog__comment-markdown custom-control custom-checkbox comment-post-checkbox comment-post-use-markdown">
                    <input id={blogDomId('commentPostUseMarkdown')} class="custom-control-input" type="checkbox" checked />
                    <label class="custom-control-label" for={blogDomId('commentPostUseMarkdown')}>Markdown</label>
                  </div>
                  <div class="kt-blog__comment-action-buttons">
                    <button
                      id={blogDomId('commentEmotionButton')}
                      class="kt-blog__comment-emotion-button btn btn-icon btn-primary pull-right"
                      type="button"
                      title="表情"
                    >
                      <i aria-hidden="true" class="fa-regular fa-face-smile" />
                    </button>
                    <button id={blogDomId('postCommentSend')} class="btn btn-icon btn-primary comment-btn pull-right mr-0" type="button">
                      <span class="btn-inner--icon hide-on-comment-editing">
                        <i aria-hidden="true" class="fa-solid fa-paper-plane" />
                      </span>
                      <span class="btn-inner--text hide-on-comment-editing">发送</span>
                    </button>
                  </div>
                </div>
              </BlogForm>
            </div>
          </div>

          <div class="kt-blog__post-navigation kt-blog__card post-navigation card shadow-sm">
            <div class="kt-blog__post-navigation-item kt-blog__post-navigation-item--previous post-navigation-item post-navigation-pre">
              {currentPreviousArticle ? (
                <>
                  <span class="kt-blog__post-navigation-label page-navigation-extra-text">
                    <i aria-hidden="true" class="kt-blog__post-navigation-icon fa fa-arrow-circle-o-left fa-arrow-circle-left" />
                    上一篇
                  </span>
                  <RouterLink to={`/post/${currentPreviousArticle.slug}`}>
                    {currentPreviousArticle.title}
                  </RouterLink>
                </>
              ) : null}
            </div>
            <div class="kt-blog__post-navigation-item kt-blog__post-navigation-item--next post-navigation-item post-navigation-next">
              {currentNextArticle ? (
                <>
                  <span class="kt-blog__post-navigation-label page-navigation-extra-text">
                    下一篇
                    {' '}
                    <i aria-hidden="true" class="kt-blog__post-navigation-icon fa fa-arrow-circle-o-right fa-arrow-circle-right" />
                  </span>
                  <RouterLink to={`/post/${currentNextArticle.slug}`}>
                    {currentNextArticle.title}
                  </RouterLink>
                </>
              ) : null}
            </div>
          </div>
        </BlogLayout>
      );
    };
  },
});
