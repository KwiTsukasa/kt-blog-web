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
