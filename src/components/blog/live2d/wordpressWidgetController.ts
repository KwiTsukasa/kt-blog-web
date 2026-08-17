import type { WordPressWaifuToolAction } from './wordpressWidgetConfig'
import { WORDPRESS_WAIFU_MESSAGES } from './wordpressWidgetMessages'

const WORDPRESS_WAIFU_TIP_VISIBLE_MS = 5000
const WORDPRESS_WAIFU_CLOSE_DELAY_MS = 1300

export interface WordPressWidgetControllerElements {
  canvas: HTMLCanvasElement
  chat: HTMLElement
  closeButton: HTMLButtonElement
  input: HTMLInputElement
  sendButton: HTMLButtonElement
  tips: HTMLElement
  tool: HTMLElement
  widget: HTMLElement
}

export interface WordPressWidgetControllerHandle {
  /**
   * Removes event listeners owned by the Vue bridge without touching the legacy Live2D runtime.
   */
  destroy(): void
}

export interface WordPressWidgetControllerOptions {
  /**
   * Opens the Vue-owned model picker instead of cycling the legacy hidden model button.
   */
  onModelPickerRequested?: () => void
  /**
   * Opens the Vue-owned texture picker instead of cycling the legacy hidden texture button.
   */
  onTexturePickerRequested?: () => void
}

/**
 * WordPress 挂件通过工具栏、画布、复制和聊天事件恢复旧版交互，并由 Vue 回调接管模型选择。
 * @param elements - 挂件画布、提示、工具栏与聊天控件的 DOM 引用集合。
 * @param options - 可选的模型及纹理选择器打开回调。
 * @returns 可一次性解绑本控制器事件与计时器的销毁句柄。
 */
export function mountWordPressWidgetController(
  elements: WordPressWidgetControllerElements,
  options: WordPressWidgetControllerOptions = {},
): WordPressWidgetControllerHandle {
  let hideTipsTimer = 0
  let closeTimer = 0

  /*
   * Shows the WordPress-style tips bubble and schedules it to fade like the original plugin.
   * @param message Trusted local message rendered in the Pio tips bubble.
   */
  const showMessage = (message: string) => {
    window.clearTimeout(hideTipsTimer)
    elements.tips.textContent = message
    elements.tips.classList.add('show')
    hideTipsTimer = window.setTimeout(() => {
      elements.tips.classList.remove('show')
    }, WORDPRESS_WAIFU_TIP_VISIBLE_MS)
  }

  /*
   * Opens or closes the WordPress chat input panel and mirrors its state through tips.
   */
  const toggleChat = () => {
    const willShow = !elements.chat.classList.contains('show')
    elements.chat.classList.toggle('show', willShow)
    if (willShow) {
      elements.input.focus()
      showMessage(WORDPRESS_WAIFU_MESSAGES.chatOpen)
      return
    }
    showMessage(WORDPRESS_WAIFU_MESSAGES.chatClose)
  }

  /*
   * Saves the currently rendered Live2D canvas as a PNG when the browser allows canvas export.
   */
  const saveCanvas = () => {
    try {
      const link = document.createElement('a')
      link.href = elements.canvas.toDataURL('image/png')
      link.download = 'pio-live2d.png'
      document.body.appendChild(link)
      link.click()
      link.remove()
      showMessage(WORDPRESS_WAIFU_MESSAGES.photo)
    } catch {
      showMessage('当前画面无法保存。')
    }
  }

  /*
   * Dispatches one toolbar action using the same feature set exposed by the WordPress plugin shell.
   * @param action WordPress toolbar action encoded on the clicked `fui-*` icon span.
   */
  const dispatchToolAction = (action: WordPressWaifuToolAction) => {
    switch (action) {
      case 'home':
        window.location.href = '/'
        break
      case 'bot':
      case 'chat':
        toggleChat()
        break
      case 'close':
        showMessage(WORDPRESS_WAIFU_MESSAGES.close)
        window.clearTimeout(closeTimer)
        closeTimer = window.setTimeout(() => {
          elements.widget.style.display = 'none'
        }, WORDPRESS_WAIFU_CLOSE_DELAY_MS)
        break
      case 'info':
        showMessage(WORDPRESS_WAIFU_MESSAGES.about)
        break
      case 'model':
        options.onModelPickerRequested?.()
        break
      case 'photo':
        saveCanvas()
        break
      case 'texture':
        options.onTexturePickerRequested?.()
        break
      default:
        break
    }
  }

  /*
   * Handles clicks bubbling from the old `waifu-tool` span list.
   * @param event Browser click event emitted from the widget toolbar.
   */
  const handleToolClick = (event: Event) => {
    const target = (() => {
      if (event.target instanceof Element) {
        return event.target.closest<HTMLElement>('[data-live2d-action]')
      }
      return null
    })()
    const action = target?.dataset.live2dAction as WordPressWaifuToolAction | undefined
    if (!action) {
      return
    }
    event.preventDefault()
    dispatchToolAction(action)
  }

  /*
   * Displays one of the local touch messages when the canvas receives a pointer click.
   */
  const handleCanvasClick = () => {
    const messages = WORDPRESS_WAIFU_MESSAGES.touch
    const index = Math.floor(Math.random() * messages.length)
    showMessage(messages[index] ?? WORDPRESS_WAIFU_MESSAGES.welcome)
  }

  /*
   * Mirrors the WordPress plugin's copy feedback bubble after page content is copied.
   */
  const handleCopy = () => {
    showMessage(WORDPRESS_WAIFU_MESSAGES.copy)
  }

  /*
   * Closes the GPT input without removing the widget.
   * @param event Button click event from the WordPress input close control.
   */
  const handleChatClose = (event: Event) => {
    event.preventDefault()
    elements.chat.classList.remove('show')
    showMessage(WORDPRESS_WAIFU_MESSAGES.chatClose)
  }

  /*
   * Emits a local acknowledgement for the preserved WordPress GPT input surface.
   * @param event Submit click event from the WordPress input send control.
   */
  const handleChatSend = (event: Event) => {
    event.preventDefault()
    showMessage(
      (() => {
        if (elements.input.value.trim()) {
          return '我听到了。'
        }
        return '先写点内容吧。'
      })(),
    )
  }

  elements.tool.addEventListener('click', handleToolClick)
  elements.canvas.addEventListener('click', handleCanvasClick)
  document.addEventListener('copy', handleCopy)
  elements.closeButton.addEventListener('click', handleChatClose)
  elements.sendButton.addEventListener('click', handleChatSend)
  showMessage(WORDPRESS_WAIFU_MESSAGES.welcome)

  return {
    /**
     * 控制器通过清除提示计时器并解绑五类 DOM 事件，停止所有 Vue 管理的挂件交互。
     */
    destroy() {
      window.clearTimeout(hideTipsTimer)
      window.clearTimeout(closeTimer)
      elements.tool.removeEventListener('click', handleToolClick)
      elements.canvas.removeEventListener('click', handleCanvasClick)
      document.removeEventListener('copy', handleCopy)
      elements.closeButton.removeEventListener('click', handleChatClose)
      elements.sendButton.removeEventListener('click', handleChatSend)
    },
  }
}
