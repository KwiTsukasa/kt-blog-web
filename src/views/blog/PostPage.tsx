import { CalendarOutlined, CommentOutlined, EyeOutlined, ReadOutlined, TagsOutlined } from '@antdv-next/icons';
import { computed, defineComponent, onBeforeUnmount, ref, Transition, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import BlogLayout from '@/components/blog/BlogLayout';
import BlogShare from '@/components/blog/BlogShare';
import {
  BlogButton,
  BlogForm,
  BlogInput,
  BlogTextArea,
} from '@/components/blog/antdvComponents';
import { useBlogArticles } from '@/hooks/useBlogArticles';
import {
  clearBlogPostRefs,
  setBlogPostArticleRef,
  setBlogPostCommentInputRef,
  setBlogPostCommentRef,
} from '@/hooks/useBlogDomRefs';

export default defineComponent({
  name: 'BlogPostPage',
  setup() {
    const route = useRoute();
    const {
      articles,
      getArticleBySlug,
      getRelatedArticles,
      getTagSlugByLabel,
      loadArticle,
    } = useBlogArticles();
    const slug = computed(() => String(route.params.slug ?? ''));
    const article = computed(() => getArticleBySlug(slug.value) ?? articles.value[0]);
    const articleIndex = computed(() => articles.value.findIndex((item) => item.slug === article.value?.slug));
    const previousArticle = computed(() => {
      const index = articleIndex.value;

      return articles.value[index > 0 ? index - 1 : articles.value.length - 1] ?? article.value;
    });
    const nextArticle = computed(() => {
      const index = articleIndex.value;

      return articles.value[index >= 0 && index < articles.value.length - 1 ? index + 1 : 0] ?? article.value;
    });
    const relatedArticles = computed(() => (article.value ? getRelatedArticles(article.value) : []));
    const commentContent = ref('');
    const commentEmail = ref('');
    const commentName = ref('');

    onBeforeUnmount(() => {
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
            <article class="kt-blog__post kt-blog__post--full kt-blog__card">
              <div class="kt-blog__post-content">没有找到文章。</div>
            </article>
          </BlogLayout>
        );
      }

      const currentPreviousArticle = previousArticle.value ?? currentArticle;
      const currentNextArticle = nextArticle.value ?? currentArticle;

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
              ref={(target) => setBlogPostArticleRef(target as HTMLElement | null)}
              class="kt-blog__post kt-blog__post--full kt-blog__card"
            >
            <header class="kt-blog__post-header kt-blog__post-header--center">
              <RouterLink class="kt-blog__post-title" to={`/post/${currentArticle.slug}`}>
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
                  <RouterLink to={`/category/${currentArticle.categorySlug}`}>
                    {currentArticle.category}
                  </RouterLink>
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
                class="kt-blog__post-content kt-blog__post-content--full"
                innerHTML={currentArticle.contentHtml}
              />
            ) : (
              <div class="kt-blog__post-content kt-blog__post-content--full">
                {currentArticle.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
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

          <div class="kt-blog__post-navigation kt-blog__card">
            <div class="kt-blog__post-navigation-item kt-blog__post-navigation-item--previous">
              <span class="kt-blog__post-navigation-label">上一篇</span>
              <RouterLink to={`/post/${currentPreviousArticle.slug}`}>
                {currentPreviousArticle.title}
              </RouterLink>
            </div>
            <div class="kt-blog__post-navigation-item kt-blog__post-navigation-item--next">
              <span class="kt-blog__post-navigation-label">下一篇</span>
              <RouterLink to={`/post/${currentNextArticle.slug}`}>
                {currentNextArticle.title}
              </RouterLink>
            </div>
          </div>

          <div class="kt-blog__related-posts kt-blog__card">
            <h2 class="kt-blog__section-title">
              <ReadOutlined />
              <span>推荐文章</span>
            </h2>
            <div class="kt-blog__related-posts-list">
              {relatedArticles.value.map((relatedArticle) => (
                <RouterLink key={relatedArticle.slug} class="kt-blog__related-post" to={`/post/${relatedArticle.slug}`}>
                  <div class="kt-blog__related-post-inner kt-blog__related-post-inner--has-thumbnail">
                    <div class="kt-blog__related-post-title">{relatedArticle.title}</div>
                    <i class="kt-blog__related-post-arrow" />
                  </div>
                  <img class="kt-blog__related-post-thumbnail" src={relatedArticle.cover} alt={relatedArticle.title} />
                </RouterLink>
              ))}
            </div>
          </div>

          <div class="kt-blog__comments kt-blog__card">
            <div class="kt-blog__card-body">
              <h2 class="kt-blog__section-title">
                <CommentOutlined />
                评论
              </h2>
              <span>暂无评论</span>
            </div>
          </div>

          <div
            ref={(target) => setBlogPostCommentRef(target as HTMLElement | null)}
            class="kt-blog__comment-form kt-blog__card"
          >
            <div class="kt-blog__card-body">
              <h2 class="kt-blog__section-title">
                <CommentOutlined />
                <span class="kt-blog__comment-edit-hidden">发送评论</span>
              </h2>
              <BlogForm class="kt-blog__comment-form-body" layout="vertical">
                <div class="kt-blog__form-grid">
                  <div class="kt-blog__form-col kt-blog__form-col--full">
                    <BlogTextArea
                      ref={(target: any) => setBlogPostCommentInputRef(target)}
                      class="kt-blog__comment-form-content kt-blog__input"
                      placeholder="评论内容"
                      name="comment"
                      v-model:value={commentContent.value}
                    />
                  </div>
                </div>
                <div class="kt-blog__form-grid kt-blog__comment-edit-hidden">
                  <div class="kt-blog__form-col">
                    <div class="kt-blog__form-group">
                      <div class="kt-blog__input-group kt-blog__input-group--spaced">
                        <div class="kt-blog__input-addon-wrap">
                          <span class="kt-blog__input-addon">昵称</span>
                        </div>
                        <BlogInput
                          class="kt-blog__comment-form-name kt-blog__input"
                          placeholder="昵称"
                          name="author"
                          v-model:value={commentName.value}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="kt-blog__form-col">
                    <div class="kt-blog__form-group">
                      <div class="kt-blog__input-group kt-blog__input-group--spaced">
                        <div class="kt-blog__input-addon-wrap">
                          <span class="kt-blog__input-addon">邮箱</span>
                        </div>
                        <BlogInput
                          class="kt-blog__comment-form-email kt-blog__input"
                          placeholder="邮箱"
                          name="email"
                          v-model:value={commentEmail.value}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <BlogButton class="kt-blog__button kt-blog__button--primary">
                  发送评论
                </BlogButton>
              </BlogForm>
            </div>
          </div>
        </BlogLayout>
      );
    };
  },
});
