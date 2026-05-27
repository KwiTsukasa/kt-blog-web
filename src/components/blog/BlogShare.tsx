import {
  LinkOutlined,
  QqOutlined,
  ShareAltOutlined,
  WechatOutlined,
  WeiboOutlined,
} from '@antdv-next/icons';
import { defineComponent, ref } from 'vue';

import { BlogButton } from './antdvComponents';

export default defineComponent({
  name: 'BlogShare',
  setup() {
    const opened = ref(false);

    const copyLink = async () => {
      await navigator.clipboard?.writeText(window.location.href);
    };

    return () => (
      <div class={['kt-blog__share', opened.value && 'kt-blog__share--opened']}>
        <div class="kt-blog__share-panel" data-initialized="true">
          <a class="kt-blog__share-link kt-blog__share-link--wechat" data-tooltip="分享到微信">
            <BlogButton class="kt-blog__button kt-blog__button--icon kt-blog__button--success">
              <span class="kt-blog__button-icon-inner">
                <WechatOutlined />
              </span>
            </BlogButton>
          </a>
          <a class="kt-blog__share-link kt-blog__share-link--qq" data-tooltip="分享到 QQ">
            <BlogButton class="kt-blog__button kt-blog__button--icon kt-blog__button--primary">
              <span class="kt-blog__button-icon-inner">
                <QqOutlined />
              </span>
            </BlogButton>
          </a>
          <a class="kt-blog__share-link kt-blog__share-link--weibo" data-tooltip="分享到微博">
            <BlogButton class="kt-blog__button kt-blog__button--icon kt-blog__button--warning">
              <span class="kt-blog__button-icon-inner">
                <WeiboOutlined />
              </span>
            </BlogButton>
          </a>
          <a class="kt-blog__share-copy kt-blog__share-link kt-blog__share-link--copy" data-tooltip="复制链接" onClick={copyLink}>
            <BlogButton class="kt-blog__button kt-blog__button--icon kt-blog__button--default">
              <span class="kt-blog__button-icon-inner">
                <LinkOutlined />
              </span>
            </BlogButton>
          </a>
        </div>
        <BlogButton
          class="kt-blog__share-toggle kt-blog__button kt-blog__button--icon kt-blog__button--primary"
          data-tooltip="分享"
          onClick={() => {
            opened.value = true;
          }}
        >
          <span class="kt-blog__button-icon-inner">
            <ShareAltOutlined />
          </span>
        </BlogButton>
      </div>
    );
  },
});
