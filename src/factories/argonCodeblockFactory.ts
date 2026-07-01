const ARGON_CODEBLOCK_SELECTOR = 'pre.hljs-codeblock, pre.wp-block-code.hljs-codeblock';

/**
 * @param root Rendered post content root that may contain backend-generated base Highlight.js blocks.
 *
 * Upgrades plain `<pre><code>` Argon codeblocks into the line-number table and control shell that the
 * live WordPress Argon runtime normally creates, while preserving existing runtime DOM idempotently.
 */
export function upgradeArgonCodeblocks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(ARGON_CODEBLOCK_SELECTOR).forEach(upgradeArgonCodeblock);
}

/**
 * @param codeBlock Highlight.js `<pre>` block to upgrade in place.
 */
function upgradeArgonCodeblock(codeBlock: HTMLElement) {
  const codeElement = getDirectCodeElement(codeBlock);
  if (!codeElement) {
    return;
  }

  if (!hasDirectLineNumberTable(codeElement)) {
    const lines = splitCodeText(codeElement.textContent ?? '');
    codeElement.replaceChildren(createArgonLineTable(lines));
    codeElement.setAttribute('hljs-codeblock-inner', '');
  }

  if (!getDirectControl(codeBlock)) {
    codeBlock.append(createArgonControl());
  }
}

/**
 * @param codeBlock Highlight.js `<pre>` block whose immediate `<code>` child owns code content.
 * @returns Direct `<code>` child, or null when the block is malformed.
 */
function getDirectCodeElement(codeBlock: HTMLElement) {
  for (const child of codeBlock.children) {
    if (child.tagName.toLowerCase() === 'code') {
      return child as HTMLElement;
    }
  }

  return null;
}

/**
 * @param codeElement Direct code element that may already contain Argon's line-number table.
 * @returns Whether the direct code child already owns a runtime `table.hljs-ln`.
 */
function hasDirectLineNumberTable(codeElement: HTMLElement) {
  for (const child of codeElement.children) {
    if (child.matches('table.hljs-ln')) {
      return true;
    }
  }

  return false;
}

/**
 * @param codeBlock Highlight.js `<pre>` block that may already own Argon's control shell.
 * @returns Direct `.hljs-control` child, or null when controls still need to be created.
 */
function getDirectControl(codeBlock: HTMLElement) {
  for (const child of codeBlock.children) {
    if (child.matches('.hljs-control')) {
      return child as HTMLElement;
    }
  }

  return null;
}

/**
 * @param codeText Plain code text from backend-generated HTML.
 * @returns Code lines preserving author-written empty lines while dropping one serializer-only trailing newline.
 */
function splitCodeText(codeText: string) {
  const lines = codeText.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    return lines.slice(0, -1);
  }

  return lines;
}

/**
 * @param lines Plain code lines to render into Highlight.js line-number rows.
 * @returns Argon-compatible line-number table.
 */
function createArgonLineTable(lines: string[]) {
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  table.className = 'hljs-ln';

  for (let index = 0; index < lines.length; index += 1) {
    tbody.append(createArgonLineRow(lines[index] ?? '', index + 1));
  }

  table.append(tbody);

  return table;
}

/**
 * @param line Plain code text for one rendered row.
 * @param lineNumber One-based line number mirrored into Argon's `data-line-number` attributes.
 * @returns Table row containing the line-number gutter and code cell.
 */
function createArgonLineRow(line: string, lineNumber: number) {
  const row = document.createElement('tr');
  row.append(createArgonLineNumberCell(lineNumber), createArgonLineCodeCell(line, lineNumber));

  return row;
}

/**
 * @param lineNumber One-based line number for the gutter cell.
 * @returns Argon-compatible line-number cell with inner `.hljs-ln-n` marker.
 */
function createArgonLineNumberCell(lineNumber: number) {
  const lineNumberText = String(lineNumber);
  const cell = document.createElement('td');
  const inner = document.createElement('div');

  cell.className = 'hljs-ln-line hljs-ln-numbers hljs';
  cell.dataset.lineNumber = lineNumberText;
  inner.className = 'hljs-ln-n';
  inner.dataset.lineNumber = lineNumberText;
  cell.append(inner);

  return cell;
}

/**
 * @param line Plain code text for one rendered row.
 * @param lineNumber One-based line number mirrored for selection/copy metadata.
 * @returns Argon-compatible code cell containing only text nodes from backend source text.
 */
function createArgonLineCodeCell(line: string, lineNumber: number) {
  const cell = document.createElement('td');

  cell.className = 'hljs-ln-line hljs-ln-code';
  cell.dataset.lineNumber = String(lineNumber);
  cell.textContent = line;

  return cell;
}

/**
 * @returns Argon-compatible codeblock control shell used by delegated post content effects.
 */
function createArgonControl() {
  const control = document.createElement('div');
  control.className = 'hljs-control hljs hljs-title';
  control.append(
    createArgonControlButton(
      'hljs-control-toggle-linenumber',
      'fa fa-list',
      [
        ['tooltip-hide-linenumber', '隐藏行号'],
        ['tooltip-show-linenumber', '显示行号'],
      ],
    ),
    createArgonControlButton(
      'hljs-control-toggle-break-line',
      'fa fa-align-left',
      [
        ['tooltip-enable-breakline', '开启折行'],
        ['tooltip-disable-breakline', '关闭折行'],
      ],
    ),
    createArgonControlButton('hljs-control-copy', 'fa fa-clipboard', [['tooltip', '复制']]),
    createArgonControlButton(
      'hljs-control-fullscreen',
      'fa fa-arrows-alt',
      [
        ['tooltip-fullscreen', '全屏'],
        ['tooltip-exit-fullscreen', '退出全屏'],
      ],
    ),
  );

  return control;
}

/**
 * @param modifier Argon control modifier class appended to the shared `.hljs-control-btn`.
 * @param iconClass Font Awesome class used by the existing Argon codeblock styles.
 * @param attributes Tooltip attributes consumed by CSS pseudo-elements.
 * @returns One icon-only codeblock control button.
 */
function createArgonControlButton(modifier: string, iconClass: string, attributes: [string, string][]) {
  const button = document.createElement('div');
  const icon = document.createElement('i');

  button.className = `hljs-control-btn ${modifier}`;
  icon.className = iconClass;
  for (const [name, value] of attributes) {
    button.setAttribute(name, value);
  }
  button.append(icon);

  return button;
}
