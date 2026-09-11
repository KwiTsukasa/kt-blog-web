import { describe, expect, it, afterEach } from 'vitest';

import { upgradeArgonCodeblocks } from '@/factories/argonCodeblockFactory';

describe('upgradeArgonCodeblocks', registerArgonCodeblockFactoryTests);

/**
 * Registers Argon codeblock runtime upgrade tests against jsdom-rendered post content.
 */
function registerArgonCodeblockFactoryTests() {
  afterEach(resetDocumentBody);

  it('upgrades backend-generated base codeblocks into Argon line tables and controls', runBaseCodeblockUpgradeTest);
  it('ignores the serializer newline appended to markdown fenced code blocks', runTrailingNewlineCodeblockTest);
  it('keeps existing WordPress runtime codeblocks idempotent', runExistingRuntimeCodeblockIdempotenceTest);

  it('upgrades unmarked WordPress and standard fences while leaving prose pre alone', () => {
    document.body.innerHTML = '<pre class="wp-block-code"><code>const x = 1;<br>  console.log(x);</code></pre><pre><code class="language-json">{&quot;ok&quot;:true}</code></pre><pre>prose</pre>';
    upgradeArgonCodeblocks(document.body);
    upgradeArgonCodeblocks(document.body);
    expect(document.querySelectorAll('pre.hljs-codeblock')).toHaveLength(2);
    expect(document.querySelectorAll('.hljs-control')).toHaveLength(2);
    const lines = document.querySelectorAll('.hljs-ln-code');
    expect(lines[1]?.textContent).toBe('  console.log(x);');
    expect(document.querySelector('.hljs-attr')).not.toBeNull();
  });

  it('preserves multiline highlighting, blank lines and escaped source without injecting HTML', () => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-typescript';
    code.textContent = '/* first\n  second */\n\nconst html = "<img src=x onerror=alert(1)>";\n';
    pre.append(code);
    document.body.append(pre);
    upgradeArgonCodeblocks(document.body);
    const lines = Array.from(pre.querySelectorAll('.hljs-ln-code'));
    expect(lines.map((line) => line.textContent).join('\n')).toBe('/* first\n  second */\n\nconst html = "<img src=x onerror=alert(1)>";');
    expect(lines[1]?.querySelector('.hljs-comment')?.textContent).toBe('  second */');
    expect(lines[3]?.querySelector('.hljs-string')).not.toBeNull();
    expect(pre.querySelector('img')).toBeNull();
  });

  it('keeps explicit unknown and plaintext languages readable without auto detection', () => {
    document.body.innerHTML = '<pre><code class="language-unknown">const a = 1;</code></pre><pre><code class="hljs plaintext">const b = 2;</code></pre>';
    upgradeArgonCodeblocks(document.body);
    expect(document.querySelectorAll('.hljs-keyword')).toHaveLength(0);
    expect(document.querySelectorAll('.hljs-ln-code')).toHaveLength(2);
  });
}

/**
 * Clears article markup between tests because the factory mutates the supplied DOM root in place.
 */
function resetDocumentBody() {
  document.body.innerHTML = '';
}

/**
 * Verifies plain backend code text becomes the line-number table and control shell expected by Argon.
 */
function runBaseCodeblockUpgradeTest() {
  document.body.innerHTML = `
    <article id="post_content">
      <pre class="wp-block-code hljs-codeblock"><code class="hljs typescript">const a = 1;
const b = a + 1;</code></pre>
    </article>
  `;
  const root = document.querySelector<HTMLElement>('#post_content')!;

  upgradeArgonCodeblocks(root);

  const pre = root.querySelector<HTMLElement>('pre.wp-block-code.hljs-codeblock')!;
  const rows = pre.querySelectorAll('table.hljs-ln > tbody > tr');
  const lineNumbers = pre.querySelectorAll<HTMLElement>('.hljs-ln-numbers');
  const lineNumberInners = pre.querySelectorAll<HTMLElement>('.hljs-ln-n');
  const lineCodes = pre.querySelectorAll<HTMLElement>('.hljs-ln-code');

  expect(rows).toHaveLength(2);
  expect(lineNumbers).toHaveLength(2);
  expect(lineNumberInners).toHaveLength(2);
  expect(lineCodes).toHaveLength(2);
  expect(lineNumbers[0]?.dataset.lineNumber).toBe('1');
  expect(lineNumberInners[0]?.dataset.lineNumber).toBe('1');
  expect(lineCodes[0]?.dataset.lineNumber).toBe('1');
  expect(lineCodes[0]?.textContent).toBe('const a = 1;');
  expect(lineNumbers[1]?.dataset.lineNumber).toBe('2');
  expect(lineNumberInners[1]?.dataset.lineNumber).toBe('2');
  expect(lineCodes[1]?.dataset.lineNumber).toBe('2');
  expect(lineCodes[1]?.textContent).toBe('const b = a + 1;');
  expect(pre.querySelectorAll(':scope > .hljs-control')).toHaveLength(1);
  expect(pre.querySelector('.hljs-control-toggle-linenumber')).not.toBeNull();
  expect(pre.querySelector('.hljs-control-toggle-break-line')).not.toBeNull();
  expect(pre.querySelector('.hljs-control-copy')).not.toBeNull();
  expect(pre.querySelector('.hljs-control-fullscreen')).not.toBeNull();
}

/**
 * Verifies API-rendered fenced code blocks do not show an extra blank Argon line for serializer-only newline.
 */
function runTrailingNewlineCodeblockTest() {
  document.body.innerHTML = `
    <article id="post_content">
      <pre class="wp-block-code hljs-codeblock"><code class="hljs typescript">const a = 1;
const b = a + 1;
</code></pre>
    </article>
  `;
  const root = document.querySelector<HTMLElement>('#post_content')!;

  upgradeArgonCodeblocks(root);

  const pre = root.querySelector<HTMLElement>('pre.wp-block-code.hljs-codeblock')!;
  const lineCodes = pre.querySelectorAll<HTMLElement>('.hljs-ln-code');

  expect(pre.querySelectorAll('table.hljs-ln > tbody > tr')).toHaveLength(2);
  expect(lineCodes[0]?.textContent).toBe('const a = 1;');
  expect(lineCodes[1]?.textContent).toBe('const b = a + 1;');
}

/**
 * Verifies saved WordPress runtime DOM is detected and not wrapped with duplicate tables or controls.
 */
function runExistingRuntimeCodeblockIdempotenceTest() {
  document.body.innerHTML = `
    <article id="post_content">
      <pre class="wp-block-code hljs-codeblock">
        <code class="hljs typescript" hljs-codeblock-inner="">
          <table class="hljs-ln"><tbody><tr>
            <td class="hljs-ln-line hljs-ln-numbers hljs"><div class="hljs-ln-n"></div></td>
            <td class="hljs-ln-line hljs-ln-code">const a = 1;</td>
          </tr></tbody></table>
        </code>
        <div class="hljs-control hljs hljs-title">
          <div class="hljs-control-btn hljs-control-toggle-linenumber"><i class="fa fa-list"></i></div>
        </div>
      </pre>
    </article>
  `;
  const root = document.querySelector<HTMLElement>('#post_content')!;

  upgradeArgonCodeblocks(root);
  upgradeArgonCodeblocks(root);

  const pre = root.querySelector<HTMLElement>('pre.wp-block-code.hljs-codeblock')!;

  expect(pre.querySelectorAll('table.hljs-ln')).toHaveLength(1);
  expect(pre.querySelectorAll(':scope > .hljs-control')).toHaveLength(1);
  expect(pre.querySelectorAll('table.hljs-ln > tbody > tr')).toHaveLength(1);
  expect(pre.querySelector('.hljs-ln-code')?.textContent).toBe('const a = 1;');
}
