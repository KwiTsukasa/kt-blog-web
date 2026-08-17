import { SettingOutlined, VerticalAlignTopOutlined } from '@antdv-next/icons'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, Transition } from 'vue'

import {
  BLOG_ANIMATION_TIMING_MS,
  BLOG_SCROLL_GEOMETRY,
  clearBlogDelay,
  runAfterBlogDelay,
} from '@/factories/blogAnimationFactory'
import { blogDomId, blogSettingsFilterId } from '@/factories/blogDomFactory'
import { useBlogDomRefs } from '@/hooks/useBlogDomRefs'
import { onArgonScroll, smoothScrollTo } from '@/hooks/useArgonEffects'
import { useBlogTheme } from '@/hooks/useBlogTheme'

import { BlogButton, BlogColorPicker, BlogSwitch } from '../ui/antdvComponents'

const filterOptions = [
  { label: '关闭', value: 'off' },
  { label: '日落', value: 'sunset' },
  { label: '暗化', value: 'darkness' },
  { label: '灰度', value: 'grayscale' },
] as const

const themeColors = ['#c3a1ed', '#5e72e4', '#2dce89', '#fb6340'] as const

export default defineComponent({
  name: 'BlogFloatActions',
  setup() {
    const {
      isDarkTheme,
      preferences,
      setFilterMode,
      setFontMode,
      setPrimaryColor,
      setRadius,
      setShadowMode,
      setThemeMode,
    } = useBlogTheme()
    const { postArticleRef } = useBlogDomRefs()
    const panelOpen = ref(false)
    const floatLeft = ref(false)
    const floatUnloaded = ref(false)
    const showBackTop = ref(false)
    const readingProgress = ref(0)
    let cleanupScroll: (() => void) | null = null
    let floatSideTimer: number | null = null

    const darkChecked = computed({
      get: () => isDarkTheme.value,
      set: (checked: boolean) =>
        setThemeMode(
          (() => {
            if (checked) {
              return 'dark'
            }
            return 'light'
          })(),
        ),
    })

    /*
     * 更新 Argon 主题色，并把取色器或预设按钮传入的颜色规范成大写十六进制。
     *
     * @param color 取色器 value、CSS 色值或预设按钮色值；空值来自控件中间态，需要忽略。
     */
    const updatePrimaryColor = (color: string) => {
      if (!color) {
        return
      }

      const nextColor = (() => {
        if (color.startsWith('#')) {
          return color
        }
        return `#${color}`
      })()
      setPrimaryColor(nextColor.toUpperCase())
    }
    const themeColorValue = computed({
      get: () => preferences.colorPrimary,
      set: updatePrimaryColor,
    })

    const rootClass = computed(() => [
      'kt-blog__float-actions',
      floatLeft.value && 'kt-blog__float-actions--left',
      floatUnloaded.value && 'kt-blog__float-actions--unloaded',
      panelOpen.value && 'kt-blog__float-actions--settings-open',
    ])

    /*
     * 同步阅读进度、评论按钮与回顶按钮显隐，保持 Argon 悬浮按钮滚动逻辑。
     */
    const syncFabStatus = () => {
      showBackTop.value = window.scrollY >= BLOG_SCROLL_GEOMETRY.backTopVisibleScrollY

      const article = postArticleRef.value
      if (!article) {
        readingProgress.value = 0
        return
      }

      const articleTop =
        article.getBoundingClientRect().top +
        window.scrollY -
        BLOG_SCROLL_GEOMETRY.readingArticleOffsetPx
      const availableDistance = Math.max(
        article.offsetHeight + BLOG_SCROLL_GEOMETRY.readingExtraHeightPx - window.innerHeight,
        document.documentElement.scrollHeight - window.innerHeight,
      )
      if (availableDistance <= 0) {
        readingProgress.value = 0
        return
      }

      const progress = (window.scrollY - articleTop) / availableDistance
      if (Number.isFinite(progress)) {
        readingProgress.value = Math.min(Math.max(progress, 0), 1)
      } else {
        readingProgress.value = 0
      }
    }

    /*
     * 切换悬浮按钮左右位置，并复刻 Argon 的 300ms unloaded 过渡。
     */
    const toggleFloatSide = () => {
      floatUnloaded.value = true
      clearBlogDelay(floatSideTimer)
      floatSideTimer = runAfterBlogDelay(() => {
        floatLeft.value = !floatLeft.value
        window.localStorage.setItem(
          'Argon_fabs_Floating_Status',
          (() => {
            if (floatLeft.value) {
              return 'left'
            }
            return 'right'
          })(),
        )
        floatUnloaded.value = false
        floatSideTimer = null
      }, BLOG_ANIMATION_TIMING_MS.floatSideUnload)
    }

    onMounted(() => {
      floatLeft.value = window.localStorage.getItem('Argon_fabs_Floating_Status') === 'left'
      cleanupScroll = onArgonScroll(syncFabStatus)
    })

    onBeforeUnmount(() => {
      clearBlogDelay(floatSideTimer)
      cleanupScroll?.()
    })

    return () => (
      <div class={rootClass.value}>
        <BlogButton
          id={blogDomId('floatToggleSides')}
          aria-hidden="true"
          class="kt-blog__float-action kt-blog__float-action--toggle-side kt-blog__button kt-blog__button--icon kt-blog__button--neutral"
          tooltip-move-to-left="移至左侧"
          tooltip-move-to-right="移至右侧"
          onClick={toggleFloatSide}
        >
          <span aria-hidden="true">⇆</span>
        </BlogButton>

        <BlogButton
          id={blogDomId('floatBackToTop')}
          aria-label="Back To Top"
          class={[
            'kt-blog__float-action kt-blog__float-action--back-top kt-blog__button kt-blog__button--icon kt-blog__button--neutral',
            !showBackTop.value && 'kt-blog__float-action--hidden',
          ]}
          tooltip="回到顶部"
          onClick={() => smoothScrollTo()}
        >
          <VerticalAlignTopOutlined />
        </BlogButton>

        <BlogButton
          id={blogDomId('floatSettingsToggle')}
          aria-label="Open Blog Settings Menu"
          class="kt-blog__float-action kt-blog__float-action--settings kt-blog__button kt-blog__button--icon kt-blog__button--neutral"
          tooltip="设置"
          onClick={() => {
            panelOpen.value = !panelOpen.value
          }}
        >
          <SettingOutlined />
        </BlogButton>

        <Transition name="kt-blog__popover" appear>
          {(() => {
            if (panelOpen.value) {
              return (
                <div
                  id={blogDomId('blogSettingsPopup')}
                  class="kt-blog__settings-panel kt-blog__card"
                  aria-hidden={!panelOpen.value}
                >
                  <div
                    class="kt-blog__settings-close"
                    onClick={() => {
                      panelOpen.value = false
                    }}
                  >
                    ×
                  </div>

                  <div class="kt-blog__settings-item">
                    <span>夜间模式</span>
                    <BlogSwitch
                      class="kt-blog__settings-theme-switch"
                      checkedChildren="暗"
                      unCheckedChildren="亮"
                      v-model:checked={darkChecked.value}
                    />
                  </div>

                  <div class="kt-blog__settings-item">
                    <span>字体</span>
                    <BlogButton
                      id={blogDomId('settingsFontSansSerif')}
                      class={[
                        'kt-blog__settings-button kt-blog__settings-button--font kt-blog__settings-button--left',
                        preferences.font === 'sans' && 'kt-blog__settings-button--active',
                      ]}
                      onClick={() => setFontMode('sans')}
                    >
                      Sans Serif
                    </BlogButton>
                    <BlogButton
                      id={blogDomId('settingsFontSerif')}
                      class={[
                        'kt-blog__settings-button kt-blog__settings-button--font kt-blog__settings-button--right',
                        preferences.font === 'serif' && 'kt-blog__settings-button--active',
                      ]}
                      onClick={() => setFontMode('serif')}
                    >
                      Serif
                    </BlogButton>
                  </div>

                  <div class="kt-blog__settings-item">
                    <span>阴影</span>
                    <BlogButton
                      id={blogDomId('settingsShadowSmall')}
                      class={[
                        'kt-blog__settings-button kt-blog__settings-button--shadow kt-blog__settings-button--left',
                        preferences.shadow === 'small' && 'kt-blog__settings-button--active',
                      ]}
                      onClick={() => setShadowMode('small')}
                    >
                      浅阴影
                    </BlogButton>
                    <BlogButton
                      id={blogDomId('settingsShadowBig')}
                      class={[
                        'kt-blog__settings-button kt-blog__settings-button--shadow kt-blog__settings-button--right',
                        preferences.shadow === 'big' && 'kt-blog__settings-button--active',
                      ]}
                      onClick={() => setShadowMode('big')}
                    >
                      深阴影
                    </BlogButton>
                  </div>

                  <div class="kt-blog__settings-item kt-blog__settings-filter-row">
                    <span>滤镜</span>
                    {filterOptions.map((item) => (
                      <BlogButton
                        id={blogSettingsFilterId(item.value)}
                        key={item.value}
                        class={[
                          'kt-blog__settings-filter-button',
                          `kt-blog__settings-filter-button--${item.value}`,
                          preferences.filter === item.value &&
                            'kt-blog__settings-filter-button--active',
                        ]}
                        filter-name={item.value}
                        shape="circle"
                        onClick={() => setFilterMode(item.value)}
                      >
                        {item.label}
                      </BlogButton>
                    ))}
                  </div>

                  <div class="kt-blog__settings-item">
                    <span>圆角</span>
                    <BlogButton class="kt-blog__settings-button" onClick={() => setRadius(0)}>
                      0px
                    </BlogButton>
                    <BlogButton class="kt-blog__settings-button" onClick={() => setRadius(4)}>
                      4px
                    </BlogButton>
                    <BlogButton class="kt-blog__settings-button" onClick={() => setRadius(12)}>
                      12px
                    </BlogButton>
                  </div>

                  <div class="kt-blog__settings-item">
                    <span>主题色</span>
                    <BlogColorPicker
                      class="kt-blog__settings-color-picker"
                      v-model:value={themeColorValue.value}
                      valueFormat="hex"
                      showText
                      presets={[
                        {
                          label: 'Argon',
                          colors: [...themeColors],
                        },
                      ]}
                      onChange={(_value: unknown, cssColor: string) => updatePrimaryColor(cssColor)}
                    />
                    <div class="kt-blog__settings-color-presets">
                      {themeColors.map((color) => (
                        <BlogButton
                          key={color}
                          aria-label={`主题色 ${color}`}
                          class={[
                            'kt-blog__settings-color',
                            preferences.colorPrimary.toUpperCase() === color.toUpperCase() &&
                              'kt-blog__settings-color--active',
                          ]}
                          style={{ background: color }}
                          onClick={() => updatePrimaryColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })()}
        </Transition>

        <BlogButton
          id={blogDomId('floatReadingProgress')}
          aria-hidden="true"
          class={[
            'kt-blog__float-action kt-blog__float-action--progress kt-blog__button kt-blog__button--icon kt-blog__button--neutral',
            !readingProgress.value && 'kt-blog__float-action--hidden',
          ]}
          tooltip="阅读进度"
        >
          <div
            class="kt-blog__float-action-progress-bar"
            style={{ width: `${Math.round(readingProgress.value * 100)}%` }}
          />
          <span class="kt-blog__float-action-progress-text">
            {Math.round(readingProgress.value * 100)}%
          </span>
        </BlogButton>
      </div>
    )
  },
})
