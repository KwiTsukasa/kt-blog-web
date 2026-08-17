import { BLOG_ANIMATION_TIMING_MS, runAfterBlogDelay } from '@/factories/blogAnimationFactory'
import { upgradeArgonCodeblocks } from '@/factories/argonCodeblockFactory'

interface ArgonPostContentRuntimeState {
  closeFancybox?: () => void
}

/**
 * 文章根节点通过统一点击委托启用 Argon 代码块、折叠与 Fancybox 交互。
 * @param root - 承载当前文章 HTML 并接收冒泡点击的根节点。
 * @returns 移除点击监听、关闭图片预览并退出代码全屏的清理函数。
 */
export function bindArgonPostContentEffects(root: HTMLElement) {
  const runtimeState: ArgonPostContentRuntimeState = {}

  upgradeArgonCodeblocks(root)
  normalizeArgonCodeblockLineNumbers(root)

  /*
   * @param event Click bubbling from Argon-rendered controls inside the current post body.
   */
  const handleClick = (event: MouseEvent) => {
    handleArgonPostContentClick(event, root, runtimeState)
  }

  root.addEventListener('click', handleClick)

  return () => {
    root.removeEventListener('click', handleClick)
    runtimeState.closeFancybox?.()
    clearFullscreenCodeblocks(root)
  }
}

/**
 * 在当前文章根节点内分派 Fancybox、折叠标题与代码块控制按钮点击，忽略路由遗留节点。
 * @param event - 触发当前处理流程的事件对象。
 * @param root - 限制查找或路径解析范围的根节点。
 * @param runtimeState - 包含 `runtimeState.closeFancybox` 字段的`runtimeState`对象。
 */
function handleArgonPostContentClick(
  event: MouseEvent,
  root: HTMLElement,
  runtimeState: ArgonPostContentRuntimeState,
) {
  const target = (() => {
    if (event.target instanceof Element) {
      return event.target
    }
    return null
  })()
  const fancyboxWrapper = target?.closest<HTMLElement>('.fancybox-wrapper[href]')
  if (fancyboxWrapper && root.contains(fancyboxWrapper)) {
    event.preventDefault()
    runtimeState.closeFancybox?.()
    runtimeState.closeFancybox = openArgonFancybox(fancyboxWrapper, root, () => {
      runtimeState.closeFancybox = undefined
    })
    return
  }

  const collapseTitle = target?.closest<HTMLElement>('.collapse-block-title')
  if (collapseTitle && root.contains(collapseTitle)) {
    event.preventDefault()
    toggleCollapseBlock(collapseTitle)
    return
  }

  const control = target?.closest<HTMLElement>('.hljs-control-btn')
  if (!control || !root.contains(control)) {
    return
  }

  const codeBlock = control.closest<HTMLElement>(
    'pre.hljs-codeblock, pre.wp-block-code.hljs-codeblock',
  )
  if (!codeBlock || !root.contains(codeBlock)) {
    return
  }

  event.preventDefault()
  handleCodeblockControl(control, codeBlock)
}

/**
 * 挂载与 Argon 样式兼容的图片画廊，绑定键盘和按钮导航，并返回完整清理函数。
 * @param activeWrapper - 当前 Fancybox 图片对应的包装节点。
 * @param root - 限制查找或路径解析范围的根节点。
 * @param onClose - Fancybox 关闭后用于恢复页面状态的回调。
 * @returns 用于关闭当前 Fancybox 的函数。
 */
function openArgonFancybox(activeWrapper: HTMLElement, root: HTMLElement, onClose: () => void) {
  const galleryItems = collectFancyboxItems(root)
  const activeIndex = Math.max(
    0,
    galleryItems.findIndex((item) => item.wrapper === activeWrapper),
  )
  let currentIndex = activeIndex
  const container = createFancyboxContainer(galleryItems.length)
  const stage = container.querySelector<HTMLElement>('.fancybox-stage')!
  const indexText = container.querySelector<HTMLElement>('[data-fancybox-index]')!

  /*
   * @param nextIndex Gallery index requested by the navigation controls.
   */
  const renderSlide = (nextIndex: number) => {
    currentIndex = normalizeGalleryIndex(nextIndex, galleryItems.length)
    const item = galleryItems[currentIndex] ?? galleryItems[0]
    if (!item) {
      return
    }

    indexText.textContent = String(currentIndex + 1)
    stage.replaceChildren(createFancyboxSlide(item))
  }

  /*
   * Removes the current Fancybox shell and restores the body classes touched by Argon.
   */
  const close = () => {
    document.removeEventListener('keydown', handleKeydown)
    container.remove()
    document.body.classList.remove('fancybox-active', 'compensate-for-scrollbar')
    onClose()
  }

  /*
   * @param event Keyboard event used to match Fancybox close and gallery navigation shortcuts.
   */
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      renderSlide(currentIndex - 1)
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      renderSlide(currentIndex + 1)
    }
  }

  container.querySelector('.fancybox-bg')?.addEventListener('click', close)
  container.querySelector('.fancybox-button--close')?.addEventListener('click', close)
  container
    .querySelector('.fancybox-button--arrow_left')
    ?.addEventListener('click', () => renderSlide(currentIndex - 1))
  container
    .querySelector('.fancybox-button--arrow_right')
    ?.addEventListener('click', () => renderSlide(currentIndex + 1))
  container
    .querySelector('.fancybox-button--fsenter')
    ?.addEventListener('click', () => container.classList.toggle('fancybox-is-fullscreen'))
  container
    .querySelector('.fancybox-button--zoom')
    ?.addEventListener('click', () => container.classList.toggle('fancybox-is-zoomed'))

  document.body.classList.add('fancybox-active', 'compensate-for-scrollbar')
  document.body.append(container)
  document.addEventListener('keydown', handleKeydown)
  renderSlide(currentIndex)

  return close
}

/**
 * 按 DOM 顺序收集文章中的 Fancybox 包装节点，并解析图片地址与替代文本。
 * @param root - 限制查找或路径解析范围的根节点。
 * @returns 按 DOM 顺序排列的 Fancybox 图片地址、替代文本与包装节点。
 */
function collectFancyboxItems(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>('.fancybox-wrapper[href]')).map(
    (wrapper) => ({
      alt: wrapper.querySelector('img')?.getAttribute('alt') ?? '',
      href: wrapper.getAttribute('href') ?? wrapper.querySelector('img')?.getAttribute('src') ?? '',
      wrapper,
    }),
  )
}

/**
 * Fancybox 外壳将图片总数、操作工具、前后导航与展示舞台组合为可聚焦对话框。
 * @param count - 当前图片集的总数，写入预览计数栏。
 * @returns 带对话框语义且尚未挂载的 Fancybox 容器节点。
 */
function createFancyboxContainer(count: number) {
  const container = document.createElement('div')
  container.className =
    'fancybox-container fancybox-show-toolbar fancybox-show-infobar fancybox-show-nav fancybox-is-open fancybox-can-swipe'
  container.setAttribute('role', 'dialog')
  container.setAttribute('tabindex', '-1')
  container.innerHTML = `
    <div class="fancybox-bg"></div>
    <div class="fancybox-inner">
      <div class="fancybox-infobar"><span data-fancybox-index>1</span>&nbsp;/&nbsp;<span data-fancybox-count>${count}</span></div>
      <div class="fancybox-toolbar">
        ${createFancyboxButtonHtml('zoom', '搜索', 'fa fa-search-plus')}
        ${createFancyboxButtonHtml('fsenter', '全屏', 'fa fa-expand')}
        ${createFancyboxButtonHtml('thumbs', '缩略图', 'fa fa-th')}
        ${createFancyboxButtonHtml('close', '关闭', 'fa fa-times')}
      </div>
      <div class="fancybox-navigation">
        ${createFancyboxButtonHtml('arrow_left', '上一张', 'fa fa-angle-left')}
        ${createFancyboxButtonHtml('arrow_right', '下一张', 'fa fa-angle-right')}
      </div>
      <div class="fancybox-stage"></div>
    </div>
  `

  return container
}

/**
 * 把当前画廊图片地址与替代文本装入 Fancybox 幻灯片节点。
 * @param item - 待转换或汇总的条目。
 * @returns 承载当前图片地址与替代文本的 Fancybox 幻灯片节点。
 */
function createFancyboxSlide(item: ReturnType<typeof collectFancyboxItems>[number]) {
  const slide = document.createElement('div')
  slide.className =
    'fancybox-slide fancybox-slide--image fancybox-slide--current fancybox-slide--complete'

  const content = document.createElement('div')
  content.className = 'fancybox-content'

  const image = document.createElement('img')
  image.className = 'fancybox-image'
  image.src = item.href
  image.alt = item.alt

  content.append(image)
  slide.append(content)

  return slide
}

/**
 * 用取模把画廊索引环绕到有效范围，空画廊固定返回零。
 * @param nextIndex - 用于计算 `nextIndex + count` 的`nextIndex`。
 * @param count - 限制处理条目或循环次数的数量。
 * @returns 规范化后的`GalleryIndex`。
 */
function normalizeGalleryIndex(nextIndex: number, count: number) {
  if (count <= 0) {
    return 0
  }

  return (nextIndex + count) % count
}

/**
 * 把按钮修饰类、无障碍标签和 Font Awesome 图标拼成 Fancybox 工具栏按钮 HTML。
 * @param modifier - 拼入 Fancybox 按钮类名的修饰符。
 * @param label - 写入 Fancybox 按钮 aria-label 的文本。
 * @param iconClass - 写入 Fancybox 按钮图标的样式类。
 * @returns 包含修饰类、无障碍标签与图标的 Fancybox 按钮 HTML。
 */
function createFancyboxButtonHtml(modifier: string, label: string, iconClass: string) {
  return `<button type="button" class="fancybox-button fancybox-button--${modifier}" aria-label="${label}"><i class="${iconClass}"></i></button>`
}

/**
 * 点击折叠标题时把祖先内容块状态与 `aria-expanded` 同步；找不到内容块时保持页面不变。
 * @param title - 触发折叠操作并承载无障碍展开状态的标题节点。
 */
function toggleCollapseBlock(title: HTMLElement) {
  const block = title.closest<HTMLElement>('.collapse-block')
  if (!block) {
    return
  }

  const collapsed = block.classList.toggle('collapsed')
  title.setAttribute('aria-expanded', String(!collapsed))
}

/**
 * 让 Argon 代码块行号数量与源码行数保持一致。
 * @param root - 限制查找或路径解析范围的根节点。
 */
function normalizeArgonCodeblockLineNumbers(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>('pre.hljs-codeblock, pre.wp-block-code.hljs-codeblock')
    .forEach((codeBlock) => {
      const rows = Array.from(
        codeBlock.querySelectorAll<HTMLTableRowElement>('table.hljs-ln > tbody > tr'),
      )

      rows.forEach((row, index) => {
        const lineNumber = row.querySelector<HTMLElement>('.hljs-ln-numbers')
        const lineNumberInner = lineNumber?.querySelector<HTMLElement>('.hljs-ln-n')
        const lineCode = row.querySelector<HTMLElement>('.hljs-ln-code')
        const lineNumberValue =
          lineNumber?.getAttribute('data-line-number') ||
          lineNumberInner?.getAttribute('data-line-number') ||
          lineCode?.getAttribute('data-line-number') ||
          String(index + 1)

        lineNumber?.setAttribute('data-line-number', lineNumberValue)
        lineNumberInner?.setAttribute('data-line-number', lineNumberValue)
        lineCode?.setAttribute('data-line-number', lineNumberValue)
      })
    })
}

/**
 * 根据控制按钮切换代码块的折叠、展开或全屏状态。
 * @param control - 触发代码块复制或展示操作的控制按钮。
 * @param codeBlock - 待升级控制栏或读取源码的代码块元素。
 */
function handleCodeblockControl(control: HTMLElement, codeBlock: HTMLElement) {
  if (control.classList.contains('hljs-control-toggle-linenumber')) {
    codeBlock.classList.toggle('hljs-hide-linenumber')
    return
  }

  if (control.classList.contains('hljs-control-toggle-break-line')) {
    codeBlock.classList.toggle('hljs-break-line')
    return
  }

  if (control.classList.contains('hljs-control-fullscreen')) {
    const fullscreen = codeBlock.classList.toggle('hljs-codeblock-fullscreen')
    document.documentElement.classList.toggle('noscroll', fullscreen)
    document.documentElement.classList.toggle('codeblock-fullscreen', fullscreen)
    return
  }

  if (control.classList.contains('hljs-control-copy')) {
    copyCodeblockText(codeBlock, control)
  }
}

/**
 * 代码复制仅在 Clipboard API 可用时写入源码，并用按钮状态与提示区分成功、失败或不支持。
 * @param codeBlock - 提供按可见行顺序拼接的待复制源码。
 * @param control - 记录复制结果状态的代码块控制按钮。
 */
function copyCodeblockText(codeBlock: HTMLElement, control: HTMLElement) {
  const text = readCodeblockText(codeBlock)

  if (!navigator.clipboard?.writeText) {
    control.dataset.ktCopyStatus = 'unsupported'
    showArgonCodeCopyToast(false)
    return
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      control.dataset.ktCopyStatus = 'success'
      showArgonCodeCopyToast(true)
    })
    .catch(() => {
      control.dataset.ktCopyStatus = 'failed'
      showArgonCodeCopyToast(false)
    })
}

/**
 * 更新并显示代码复制结果提示，延时后自动隐藏。
 * @param success - 代码复制是否成功，用于选择提示文本与样式。
 */
function showArgonCodeCopyToast(success: boolean) {
  const wrapper = ensureArgonToastWrapper()
  const toast = document.createElement('div')
  toast.className = 'iziToast shadow'
  if (success) {
    toast.style.backgroundColor = '#2dce89'
  } else {
    toast.style.backgroundColor = '#f5365c'
  }
  toast.innerHTML = `
    <span class="iziToast-title">${(() => {
      if (success) {
        return '复制成功'
      }
      return '复制失败'
    })()}</span>
    <span class="iziToast-message">${(() => {
      if (success) {
        return '代码已复制到剪贴板'
      }
      return '请手动复制代码'
    })()}</span>
  `
  wrapper.append(toast)
  runAfterBlogDelay(() => {
    toast.remove()
    if (wrapper.childElementCount === 0) {
      wrapper.remove()
    }
  }, BLOG_ANIMATION_TIMING_MS.toastVisible)
}

/**
 * 复用已挂载的 Argon 右上角提示容器，缺失时创建并追加到 body。
 * @returns 已挂载或新创建的 Argon 右上角提示容器。
 */
function ensureArgonToastWrapper() {
  const existing = document.querySelector<HTMLElement>(
    '.iziToast-wrapper.iziToast-wrapper-topRight',
  )
  if (existing) {
    return existing
  }

  const wrapper = document.createElement('div')
  wrapper.className = 'iziToast-wrapper iziToast-wrapper-topRight'
  document.body.append(wrapper)

  return wrapper
}

/**
 * 优先按 Argon 行号单元格拼接源码，没有行号表时回退 code 元素文本。
 * @param codeBlock - 待升级控制栏或读取源码的代码块元素。
 * @returns 读取到的`CodeblockText`；没有可展示内容时返回空字符串。
 */
function readCodeblockText(codeBlock: HTMLElement) {
  const lineCells = Array.from(codeBlock.querySelectorAll<HTMLElement>('.hljs-ln-code'))
  if (lineCells.length > 0) {
    return lineCells.map((line) => line.innerText).join('\n')
  }

  return codeBlock.querySelector('code')?.textContent ?? ''
}

/**
 * 内容效果清理阶段把所有全屏代码块与页面锁滚动类恢复为普通状态。
 * @param root - 限定需要退出全屏的代码块查找范围。
 */
function clearFullscreenCodeblocks(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>('.hljs-codeblock-fullscreen')
    .forEach((block) => block.classList.remove('hljs-codeblock-fullscreen'))
  document.documentElement.classList.remove('noscroll', 'codeblock-fullscreen')
}
