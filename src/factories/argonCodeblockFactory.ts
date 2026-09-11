import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import powershell from 'highlight.js/lib/languages/powershell'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('powershell', powershell)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerAliases(['js', 'javascript', 'jsx', 'tsx'], { languageName: 'typescript' })
hljs.registerLanguage('xml', xml)
hljs.registerAliases(['vue'], { languageName: 'xml' })
hljs.registerLanguage('yaml', yaml)

/**
 * 扫描文章代码块并补齐 Argon 控制区与行号结构。
 * @param root - 限制查找或路径解析范围的根节点。
 */
export function upgradeArgonCodeblocks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('pre').forEach(upgradeArgonCodeblock)
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

  codeBlock.classList.add('hljs-codeblock')

  if (!hasDirectLineNumberTable(codeElement)) {
    const source = codeElement.cloneNode(true) as HTMLElement
    source.querySelectorAll('br').forEach((element) => element.replaceWith('\n'))
    const text = splitCodeText(source.textContent ?? '').join('\n')
    const lines = highlightCodeLines(text, codeElement)
    codeElement.replaceChildren(createArgonLineTable(lines))
    codeElement.classList.add('hljs')
    codeElement.setAttribute('hljs-codeblock-inner', '')
  }

  if (!getDirectControl(codeBlock)) {
    codeBlock.append(createArgonControl())
  }
}

/**
 * 对完整源码高亮后按文本换行拆分节点，保留跨行注释与字符串的颜色及原始缩进。
 * @param text - 已统一换行并去掉渲染器末尾换行的源码。
 * @param codeElement - 提供显式语言标记的原始代码节点。
 * @returns 每行独立且只含高亮器安全文本及样式节点的文档片段。
 */
function highlightCodeLines(text: string, codeElement: HTMLElement) {
  const container = document.createElement('div')
  const classes = [...codeElement.classList, ...codeElement.parentElement!.classList]
  const declared = classes.find((name) => /^(language|lang)-/.test(name))
  let language = declared?.replace(/^(language|lang)-/, '')
  if (!language) {
    language = classes.find((name) => name === 'plaintext' || name === 'text' || Boolean(hljs.getLanguage(name)))
  }

  if (text.length > 100000 || classes.includes('nohighlight') || classes.includes('no-highlight')) {
    container.textContent = text
  } else if (language) {
    if (hljs.getLanguage(language)) {
      container.innerHTML = hljs.highlight(text, { language, ignoreIllegals: true }).value
    } else {
      container.textContent = text
    }
  } else {
    container.innerHTML = hljs.highlightAuto(text, ['typescript', 'bash', 'json', 'yaml', 'sql', 'xml']).value
  }

  const lines = [document.createDocumentFragment()]
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const ancestors: HTMLElement[] = []
    let parent = node.parentElement
    while (parent && parent !== container) {
      ancestors.unshift(parent)
      parent = parent.parentElement
    }
    const segments = (node.textContent ?? '').split('\n')
    segments.forEach((segment, index) => {
      if (index > 0) lines.push(document.createDocumentFragment())
      let target: Node = lines[lines.length - 1]!
      for (const ancestor of ancestors) {
        const span = document.createElement('span')
        span.className = ancestor.className
        target.appendChild(span)
        target = span
      }
      target.appendChild(document.createTextNode(segment))
    })
    node = walker.nextNode()
  }
  return lines
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
function createArgonLineTable(lines: DocumentFragment[]) {
  const table = document.createElement('table')
  const tbody = document.createElement('tbody')
  table.className = 'hljs-ln'

  for (let index = 0; index < lines.length; index += 1) {
    tbody.append(createArgonLineRow(lines[index]!, index + 1))
  }

  table.append(tbody)

  return table
}

/**
 * 构建同时包含行号单元格与高亮代码单元格的 Argon 行。
 * @param line - 保留安全高亮节点的单行源码片段。
 * @param lineNumber - 写入代码行元素的行号。
 * @returns 包含行号及高亮源码片段的表格行。
 */
function createArgonLineRow(line: DocumentFragment, lineNumber: number) {
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
 * 将已经转义并高亮的源码节点写入单元格，不重新解析原始代码中的 HTML。
 * @param line - 高亮器生成且已经按换行拆分的节点片段。
 * @param lineNumber - 写入代码行元素的行号。
 * @returns 携带行号元数据和安全高亮内容的代码单元格。
 */
function createArgonLineCodeCell(line: DocumentFragment, lineNumber: number) {
  const cell = document.createElement('td')

  cell.className = 'hljs-ln-line hljs-ln-code'
  cell.dataset.lineNumber = String(lineNumber)
  cell.append(line)

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
