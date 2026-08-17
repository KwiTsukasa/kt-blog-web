import { ShareAltOutlined } from '@antdv-next/icons'
import { defineComponent, ref } from 'vue'

import { blogDomId } from '@/factories/blogDomFactory'

import { BlogButton } from '../ui/antdvComponents'

type ShareChannel = {
  className: string
  color: 'default' | 'primary' | 'success' | 'warning'
  iconClass?: string
  key: string
  label: string
  textIcon?: string
}

const shareChannels: ShareChannel[] = [
  {
    className: 'wechat',
    color: 'success',
    iconClass: 'fa-brands fa-weixin',
    key: 'wechat',
    label: '分享到微信',
  },
  { className: 'douban', color: 'primary', key: 'douban', label: '分享到豆瓣', textIcon: '豆' },
  {
    className: 'qq',
    color: 'primary',
    iconClass: 'fa-brands fa-qq',
    key: 'qq',
    label: '分享到 QQ',
  },
  {
    className: 'qzone',
    color: 'primary',
    iconClass: 'fa-solid fa-star',
    key: 'qzone',
    label: '分享到 QQ 空间',
  },
  {
    className: 'weibo',
    color: 'warning',
    iconClass: 'fa-brands fa-weibo',
    key: 'weibo',
    label: '分享到微博',
  },
  {
    className: 'facebook',
    color: 'primary',
    iconClass: 'fa-brands fa-facebook-f',
    key: 'facebook',
    label: '分享到 Facebook',
  },
  {
    className: 'twitter',
    color: 'primary',
    iconClass: 'fa-brands fa-twitter',
    key: 'twitter',
    label: '分享到 Twitter',
  },
  {
    className: 'telegram',
    color: 'primary',
    iconClass: 'fa-brands fa-telegram',
    key: 'telegram',
    label: '分享到 Telegram',
  },
  {
    className: 'copy-link',
    color: 'default',
    iconClass: 'fa-solid fa-link',
    key: 'copy',
    label: '复制链接',
  },
]

export default defineComponent({
  name: 'BlogShare',
  setup() {
    const opened = ref(false)

    /*
     * 将当前文章 URL 写入剪贴板，匹配 Argon 分享面板里的复制链接按钮。
     */
    const copyLink = async () => {
      await navigator.clipboard?.writeText(window.location.href)
    }

    return () => (
      <div
        id={blogDomId('shareContainer')}
        class={['kt-blog__share-container', opened.value && 'kt-blog__share-container--opened']}
      >
        <BlogButton
          id={blogDomId('shareShow')}
          class="kt-blog__share-toggle kt-blog__button kt-blog__button--icon kt-blog__button--primary"
          data-tooltip="分享"
          onClick={() => {
            opened.value = true
          }}
        >
          <span class="kt-blog__button-icon-inner">
            <ShareAltOutlined />
          </span>
        </BlogButton>
        <div
          id={blogDomId('sharePanel')}
          class="kt-blog__share-panel share-component social-share"
          data-initialized="true"
        >
          {shareChannels.map((channel) => (
            <a
              id={(() => {
                if (channel.key === 'copy') {
                  return blogDomId('shareCopyLink')
                }
                return undefined
              })()}
              key={channel.key}
              class={[
                'kt-blog__share-link',
                `kt-blog__share-link--${channel.className}`,
                channel.key === 'copy' && 'kt-blog__share-copy',
              ]}
              data-tooltip={channel.label}
              href={buildShareHref(channel.key)}
              rel={(() => {
                if (channel.key === 'copy' || channel.key === 'wechat') {
                  return undefined
                }
                return 'noopener noreferrer'
              })()}
              target={(() => {
                if (channel.key === 'copy' || channel.key === 'wechat') {
                  return undefined
                }
                return '_blank'
              })()}
              onClick={(() => {
                if (channel.key === 'copy') {
                  return copyLink
                }
                return undefined
              })()}
            >
              <BlogButton
                class={[
                  'kt-blog__button kt-blog__button--icon',
                  `kt-blog__button--${channel.color}`,
                ]}
              >
                <span class="kt-blog__button-icon-inner">
                  {(() => {
                    if (channel.iconClass) {
                      return <i aria-hidden="true" class={channel.iconClass} />
                    }
                    return channel.textIcon
                  })()}
                </span>
              </BlogButton>
            </a>
          ))}
        </div>
      </div>
    )
  },
})

/**
 * 将当前页面地址与标题编码进豆瓣、QQ、微博等分享地址，不支持的平台返回空操作链接。
 * @param key - 用于在当前映射或缓存中定位记录的键。
 * @returns 构造出的`ShareHref`。
 */
function buildShareHref(key: string) {
  const pageUrl = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(document.title)

  if (key === 'douban')
    return `https://shuo.douban.com/!service/share?href=${pageUrl}&name=${title}`
  if (key === 'qq')
    return `https://connect.qq.com/widget/shareqq/index.html?url=${pageUrl}&title=${title}`
  if (key === 'qzone')
    return `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${pageUrl}&title=${title}`
  if (key === 'weibo')
    return `https://service.weibo.com/share/share.php?url=${pageUrl}&title=${title}`
  if (key === 'facebook') return `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`
  if (key === 'twitter') return `https://twitter.com/intent/tweet?text=${title}&url=${pageUrl}`
  if (key === 'telegram') return `https://telegram.me/share/url?url=${pageUrl}&text=${title}`

  return 'javascript:'
}
