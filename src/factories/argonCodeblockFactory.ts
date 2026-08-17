const ARGON_CODEBLOCK_SELECTOR = 'pre.hljs-codeblock, pre.wp-block-code.hljs-codeblock'

/**
 * 扫描文章代码块并补齐 Argon 控制区与行号结构。
 * @param root - 限制查找或路径解析范围的根节点。
 */
export function upgradeArgonCodeblocks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(ARGON_CODEBLOCK_SELECTOR).forEach(upgradeArgonCodeblock)
}

/**
 * 为单个代码块补齐 Argon 控制按钮、行号与复制交互。
 * @param codeBlock - 待升级控制栏或读取源码的代码块元素。
 */
function upgradeArgonCodeblock(codeBlock: HTMLElement) {
  const codeElement = getDirectCodeElement(codeBlock)
  if (!codeElement) {
    return
  }

  if (!hasDirectLineNumberTable(codeElement)) {
    const lines = splitCodeText(codeElement.textContent ?? '')
    codeElement.replaceChildren(createArgonLineTable(lines))
    codeElement.setAttribute('hljs-codeblock-inner', '')
  }

  if (!getDirectControl(codeBlock)) {
    codeBlock.append(createArgonControl())
  }
}

/**
 * 仅从代码块的直接子节点中返回首个 code 元素，未命中时返回 null。
 * @param codeBlock - 待升级控制栏或读取源码的代码块元素。
 * @returns 读取到的`DirectCodeElement`；空值分支返回 null。
 */
function getDirectCodeElement(codeBlock: HTMLElement) {
  for (const child of codeBlock.children) {
    if (child.tagName.toLowerCase() === 'code') {
      return child as HTMLElement
    }
  }

  return null
}

/**
 * 代码元素仅检查直接子节点中的 hljs 行号表格，避免嵌套内容被误判为已升级。
 * @param codeElement - 准备执行 Argon 行号升级的 code 元素。
 * @returns 直接子节点已包含 table.hljs-ln 时为 true，否则为 false。
 */
function hasDirectLineNumberTable(codeElement: HTMLElement) {
  for (const child of codeElement.children) {
    if (child.matches('table.hljs-ln')) {
      return true
    }
  }

  return false
}

/**
 * 仅从代码块的直接子节点中返回 hljs-control 控制栏，未命中时返回 null。
 * @param codeBlock - 待升级控制栏或读取源码的代码块元素。
 * @returns 读取到的`DirectControl`；空值分支返回 null。
 */
function getDirectControl(codeBlock: HTMLElement) {
  for (const child of codeBlock.children) {
    if (child.matches('.hljs-control')) {
      return child as HTMLElement
    }
  }

  return null
}

/**
 * 源码文本通过统一 CRLF 与 CR 换行后拆行，并移除高亮器附带的单个末尾空行。
 * @param codeText - 从 code 元素读取的完整源码文本。
 * @returns 保留内部空行且没有多余末尾行的源码列表。
 */
function splitCodeText(codeText: string) {
  const lines = codeText.replace(/\r\n?/g, '\n').split('\n')
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    return lines.slice(0, -1)
  }

  return lines
}

/**
 * 按源码行顺序构建包含行号栏与代码栏的 Argon 表格。
 * @param lines - 待转换为 Argon 行号表格的源码行列表。
 * @returns 包含行号栏与代码栏的 Argon 表格。
 */
function createArgonLineTable(lines: string[]) {
  const table = document.createElement('table')
  const tbody = document.createElement('tbody')
  table.className = 'hljs-ln'

  for (let index = 0; index < lines.length; index += 1) {
    tbody.append(createArgonLineRow(lines[index] ?? '', index + 1))
  }

  table.append(tbody)

  return table
}

/**
 * 构建同时包含行号单元格与纯文本代码单元格的 Argon 行。
 * @param line - 写入 Argon 代码单元格的单行源码文本。
 * @param lineNumber - 写入代码行元素的行号。
 * @returns 构造完成的同时包含行号单元格与纯文本代码单元格的 Argon 行。
 */
function createArgonLineRow(line: string, lineNumber: number) {
  const row = document.createElement('tr')
  row.append(createArgonLineNumberCell(lineNumber), createArgonLineCodeCell(line, lineNumber))

  return row
}

/**
 * Argon 行号单元格将一基序号同时写入 td 与内部标记，保持样式和伪元素取值一致。
 * @param lineNumber - 写入代码行元素的行号。
 * @returns 构造完成的携带一基行号 data 属性的 Argon 行号单元格。
 */
function createArgonLineNumberCell(lineNumber: number) {
  const lineNumberText = String(lineNumber)
  const cell = document.createElement('td')
  const inner = document.createElement('div')

  cell.className = 'hljs-ln-line hljs-ln-numbers hljs'
  cell.dataset.lineNumber = lineNumberText
  inner.className = 'hljs-ln-n'
  inner.dataset.lineNumber = lineNumberText
  cell.append(inner)

  return cell
}

/**
 * Argon 代码单元格将序号写入元数据并仅用 textContent 放置源码，避免代码被解释为 HTML。
 * @param line - 写入 Argon 代码单元格的单行源码文本。
 * @param lineNumber - 写入代码行元素的行号。
 * @returns 构造完成的携带行号元数据且只写入纯文本源码的 Argon 代码单元格。
 */
function createArgonLineCodeCell(line: string, lineNumber: number) {
  const cell = document.createElement('td')

  cell.className = 'hljs-ln-line hljs-ln-code'
  cell.dataset.lineNumber = String(lineNumber)
  cell.textContent = line

  return cell
}

/**
 * 构建包含行号、折行、复制与全屏按钮的 Argon 代码块控制栏。
 * @returns 构造完成的包含行号、折行、复制与全屏按钮的 Argon 代码块控制栏。
 */
function createArgonControl() {
  const control = document.createElement('div')
  control.className = 'hljs-control hljs hljs-title'
  control.append(
    createArgonControlButton('hljs-control-toggle-linenumber', 'fa fa-list', [
      ['tooltip-hide-linenumber', '隐藏行号'],
      ['tooltip-show-linenumber', '显示行号'],
    ]),
    createArgonControlButton('hljs-control-toggle-break-line', 'fa fa-align-left', [
      ['tooltip-enable-breakline', '开启折行'],
      ['tooltip-disable-breakline', '关闭折行'],
    ]),
    createArgonControlButton('hljs-control-copy', 'fa fa-clipboard', [['tooltip', '复制']]),
    createArgonControlButton('hljs-control-fullscreen', 'fa fa-arrows-alt', [
      ['tooltip-fullscreen', '全屏'],
      ['tooltip-exit-fullscreen', '退出全屏'],
    ]),
  )

  return control
}

/**
 * 构建带修饰类、Font Awesome 图标与提示属性的 Argon 控制按钮。
 * @param modifier - 拼接到 Argon 控制按钮类名的修饰符。
 * @param iconClass - 写入 `icon.className` 的图标样式类。
 * @param attributes - 要逐项写入控制按钮的 HTML 属性。
 * @returns 构造完成的带修饰类、Font Awesome 图标与提示属性的 Argon 控制按钮。
 */
function createArgonControlButton(
  modifier: string,
  iconClass: string,
  attributes: [string, string][],
) {
  const button = document.createElement('div')
  const icon = document.createElement('i')

  button.className = `hljs-control-btn ${modifier}`
  icon.className = iconClass
  for (const [name, value] of attributes) {
    button.setAttribute(name, value)
  }
  button.append(icon)

  return button
}
