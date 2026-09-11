import {
  CloseOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  VerticalAlignTopOutlined,
} from '@antdv-next/icons'
import { Popover, Segmented } from 'antdv-next'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'

import {
  BLOG_ANIMATION_TIMING_MS,
  BLOG_SCROLL_GEOMETRY,
  clearBlogDelay,
  runAfterBlogDelay,
} from '@/factories/blogAnimationFactory'
import { blogDomId } from '@/factories/blogDomFactory'
import { useBlogDomRefs } from '@/hooks/useBlogDomRefs'
import { getBlogScrollTop, onArgonScroll, smoothScrollTo } from '@/hooks/useArgonEffects'
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
    const { pageScrollRef, postArticleRef } = useBlogDomRefs()
    const panelOpen = ref(false)
    const popupHost = ref<HTMLDivElement>()
    const closeSettings = () => {
      panelOpen.value = false
    }
    const onPanelKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSettings()
    }
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

    const themeToggle = computed(() => {
      if (isDarkTheme.value) {
        return { label: '切换到日间模式', icon: SunOutlined }
      }
      return { label: '切换到夜间模式', icon: MoonOutlined }
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

    const settingsPlacement = computed(() => {
      if (floatLeft.value) return 'topLeft' as const
      return 'topRight' as const
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
      showBackTop.value = getBlogScrollTop() >= BLOG_SCROLL_GEOMETRY.backTopVisibleScrollY

      const article = postArticleRef.value
      if (!article) {
        readingProgress.value = 0
        return
      }

      const articleTop =
        article.getBoundingClientRect().top +
        getBlogScrollTop() -
        BLOG_SCROLL_GEOMETRY.readingArticleOffsetPx
      const availableDistance = Math.max(
        article.offsetHeight + BLOG_SCROLL_GEOMETRY.readingExtraHeightPx - window.innerHeight,
        (pageScrollRef.value?.scrollHeight || document.documentElement.scrollHeight) -
          window.innerHeight,
      )
      if (availableDistance <= 0) {
        readingProgress.value = 0
        return
      }

      const progress = (getBlogScrollTop() - articleTop) / availableDistance
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
      if (floatUnloaded.value) return
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
          aria-label={themeToggle.value.label}
          class="kt-blog__float-action kt-blog__float-action--theme kt-blog__button kt-blog__button--icon kt-blog__button--neutral"
          tooltip={themeToggle.value.label}
          onClick={() => {
            darkChecked.value = !darkChecked.value
          }}
        >
          <themeToggle.value.icon />
        </BlogButton>

        <Popover
          open={panelOpen.value}
          trigger="click"
          placement={settingsPlacement.value}
          classes={{ root: 'kt-blog__settings-popover' }}
          getPopupContainer={(trigger) => trigger.closest<HTMLElement>('.kt-blog') || document.body}
          onOpenChange={(open) => {
            panelOpen.value = open
          }}
          v-slots={{
            content: () => (
              <div ref={popupHost} onKeydown={onPanelKeydown}>
                <section class="kt-blog__settings-panel" role="dialog" aria-label="阅读设置">
                  <header class="kt-blog__settings-heading">
                    <div>
                      <strong>阅读设置</strong>
                      <p>按你的习惯调整，自动保存</p>
                    </div>
                    <BlogButton
                      type="text"
                      shape="circle"
                      aria-label="关闭阅读设置"
                      onClick={closeSettings}
                    >
                      <CloseOutlined />
                    </BlogButton>
                  </header>
                  <div class="kt-blog__settings-item kt-blog__settings-item--inline">
                    <span>夜间模式</span>
                    <BlogSwitch
                      aria-label="夜间模式"
                      checkedChildren="暗"
                      unCheckedChildren="亮"
                      v-model:checked={darkChecked.value}
                    />
                  </div>
                  <div class="kt-blog__settings-item">
                    <span>字体</span>
                    <Segmented
                      block
                      value={preferences.font}
                      options={[
                        { label: '无衬线', value: 'sans' },
                        { label: '衬线', value: 'serif' },
                      ]}
                      onChange={(value) => {
                        if (value === 'sans' || value === 'serif') setFontMode(value)
                      }}
                    />
                  </div>
                  <div class="kt-blog__settings-item">
                    <span>阴影</span>
                    <Segmented
                      block
                      value={preferences.shadow}
                      options={[
                        { label: '浅阴影', value: 'small' },
                        { label: '深阴影', value: 'big' },
                      ]}
                      onChange={(value) => {
                        if (value === 'small' || value === 'big') setShadowMode(value)
                      }}
                    />
                  </div>
                  <div class="kt-blog__settings-item">
                    <span>滤镜</span>
                    <Segmented
                      block
                      value={preferences.filter}
                      options={[...filterOptions]}
                      onChange={(value) => {
                        if (
                          value === 'off' ||
                          value === 'sunset' ||
                          value === 'darkness' ||
                          value === 'grayscale'
                        )
                          setFilterMode(value)
                      }}
                    />
                  </div>
                  <div class="kt-blog__settings-item">
                    <span>圆角</span>
                    <Segmented
                      block
                      value={preferences.radius}
                      options={[
                        { label: '直角', value: 0 },
                        { label: '4 px', value: 4 },
                        { label: '12 px', value: 12 },
                      ]}
                      onChange={(value) => {
                        if (typeof value === 'number') setRadius(value)
                      }}
                    />
                  </div>
                  <div class="kt-blog__settings-item">
                    <span>主题色</span>
                    <div class="kt-blog__settings-colors">
                      <BlogColorPicker
                        class="kt-blog__settings-color-picker"
                        v-model:value={themeColorValue.value}
                        valueFormat="hex"
                        disabledAlpha
                        showText
                        placement="topRight"
                        getPopupContainer={() => popupHost.value || document.body}
                        presets={[{ label: '预设颜色', colors: [...themeColors] }]}
                        onChange={(_value: unknown, cssColor: string) =>
                          updatePrimaryColor(cssColor)
                        }
                      />
                      <div class="kt-blog__settings-color-presets">
                        {themeColors.map((color) => (
                          <BlogButton
                            key={color}
                            aria-label={`主题色 ${color}`}
                            aria-pressed={
                              preferences.colorPrimary.toUpperCase() === color.toUpperCase()
                            }
                            class="kt-blog__settings-color"
                            shape="circle"
                            style={{ background: color }}
                            onClick={() => updatePrimaryColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ),
          }}
        >
          <BlogButton
            id={blogDomId('floatSettingsToggle')}
            aria-label="阅读设置"
            aria-expanded={panelOpen.value}
            onKeydown={onPanelKeydown}
            class="kt-blog__float-action kt-blog__float-action--settings kt-blog__button kt-blog__button--icon kt-blog__button--neutral"
            tooltip="设置"
          >
            <SettingOutlined />
          </BlogButton>
        </Popover>

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
