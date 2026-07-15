# kt-blog-web

KT 博客前台 demo，基于 Argon WordPress 主题的视觉资产重新实现，技术栈为 Vue 3、TSX、Vite、antdv-next。

## 技术约定

- 页面语法：Vue TSX。
- 组件库：antdv-next。
- 样式：SCSS，类名按 BEM 组织。
- 路由：hash 模式，便于静态部署。
- 静态资产：默认使用旧线上博客真实资源，`public/blog-assets/` 保留本地备份兜底；不得把 Argon demo 图片作为默认背景、头像或 fallback 封面。

## 本地运行

```sh
pnpm install
pnpm dev
```

## 常用校验

```sh
pnpm run type-check
pnpm run build
pnpm test:unit
pnpm exec playwright test e2e/argon-parity/pages.spec.ts --project=chromium
pnpm exec playwright test e2e/argon-parity/interactions.spec.ts --project=chromium
pnpm exec playwright test e2e/argon-parity/baseline.spec.ts --project=chromium
```

`baseline.spec.ts` 只在需要重新抓旧 WordPress Argon 基准时运行；常规本地回归跑 `pages.spec.ts` 和 `interactions.spec.ts`。公开域名 `https://blog.kwitsukasa.top/` 当前是 KT Blog Web 静态站入口，不是只读基准站；旧 WordPress 端口只作为视觉/交互基准和回滚入口。

## Argon 还原范围

- `e2e/argon-parity` 保存与旧 WordPress Argon 基准对齐的页面、视口和交互矩阵；公开域名切到 KT Blog Web 后，基准抓取必须显式使用旧 WordPress 入口。
- 本地 hash 路由按语义映射 WordPress query 路由：文章、分类、标签、搜索和月份归档都用同一套矩阵验证。
- 页面根节点通过 `kt-blog--home/search/category/tag/archive/post` 暴露 Argon 页面语义，方便样式、测试和 Admin iframe 预览复用。
- 公开 Blog API 返回非空文章列表时优先使用 API；API 不可用或返回空列表时保留内置 WordPress 抓取文章种子，避免数据未迁移期间线上静态站变成空站。
- 主题接口若仍返回 `/argon/theme/*` 历史 demo 占位图，前端必须映射回旧线上博客资源；本地备份只用于兜底，避免静态站重新露出模板图。
- 文章正文以线上 WordPress `#post_content` 渲染结果和 Argon `style.css` / `argontheme.js` 为准；代码块控制条、复制 toast、Fancybox 图片预览、正文链接 hover、分隔线和图片 lazyload 都必须有 Playwright 断言。
- `hljs-codeblock` 静态快照需要恢复 Argon `highlightjs-line-numbers` 运行时生成的 `data-line-number` 与 `.hljs-ln-n::before`，否则行号列会坍塌成 0px。
- 左栏 overview sticky/relative 切换用 no-headroom 回归用例固定，解除 fixed 后不得重放卡片入场动画或产生缩放闪烁。
- 左栏文章目录/站点概览切换必须保留 Bootstrap tab fade 节奏，采用 active/show 分帧保持 Argon 手感；回归用例需要断言切换中 opacity 处于 0 到 1 之间，而不是只检查最终显隐。
- Argon motion、滚动几何、延迟、RAF 调度、DOM id/selector、hash anchor 和跨组件 ref 必须从 `src/factories/blogAnimationFactory.ts` 与 `src/factories/blogDomFactory.ts` 取值；组件和 Hook 不再散写行为层 id、裸 `requestAnimationFrame`、裸 `setTimeout` 或重复 timing。
- Live2D 使用旧 WordPress 站点同款 Cubism2 MOC 资源，`BlogLive2D` 与 `src/components/blog/live2d/runtime/*` 负责 canvas、Pio/Tia catalog、MOC metadata、选择缓存、WebGL 渲染、页面级鼠标视差和模型/服装直达切换。当前 `vendor/cubism2Core/compatibility/*`、`legacyKernel.ts`、`sdkGlobalInstaller.ts` 和 `window.Live2D*` 仍是反混淆迁移路径，不是最终架构；目标是调用方直接导入类型化、语义化的 TS Core API。运行时不得 append 原始 `live2d.min.js`，也不得恢复旧 `InitLive2D`、隐藏按钮轮换、自研 `KtPioLive2D`、manifest runtime、canvas transform fallback、`live2d-widgets` 或随机 CDN 模型。
- Cubism2 反混淆只以 `public/live2d/wordpress-moc/live2d.min.js` 为源码，并严格按“函数名恢复 -> 调用逻辑理清 -> 拆分压缩耦合 -> 变量名恢复”推进。进度维护在 `docs/blog-live2d-cubism2-minjs-deobfuscation-ledger.md`；稳定函数/调用决策和已复审 `module-splits.json` 位于 `docs/live2d-deobfuscation/`。当前 627 个函数身份、1411 个调用和 627 个模块 owner 决策已闭合，实际源码迁移审计仍为 5 migrated / 562 pending / 60 omitted；迁移必须直接在生产实现中使用源码可证的语义名，禁止短名映射层和兼容 alias。现有 TS 名或测试通过都不能替代恢复证明，最终交付是可维护 TS Core。
- Modal 不强求一比一复刻线上 Argon 动画，打开/关闭 motion 与 `centered` 居中定位交给 antdv-next；外层按 `packages/@core/ui-kit/popup-ui/src/modal/modal.vue` 保留 Header/Content/Footer 三段能力、`p-0`、`max-height`、纵向 flex、Content `min-h-40` 滚动和 `px-5 py-4`/`p-3`/`p-2` 间距，但无 footer slot 时不渲染 footer，不搬 draggable/fullscreen/loading/footer 按钮等复杂能力，自有颜色只守 Blog 主题色和暗色可读性。
- Admin 文章预览通过 `VITE_KT_BLOG_WEB_BASE_URL` 打开公开 Blog Web 路由，本地默认 `http://127.0.0.1:5173/#/post/<slug>?adminPreview=1&articleId=<id>`。

## 来源与许可证

| 一级来源 | 使用方式 | License |
| --- | --- | --- |
| [Argon Theme](https://github.com/solstice23/argon-theme) | 博客视觉资产、主题样式、滚动/搜索/过渡参考和页脚主题署名 | GPL-3.0 |
| Pio/Tia Cubism2 MOC runtime/model assets | MinIO `moc/` 源用于旧 WordPress Live2D 视觉行为还原；Cubism2 v2 TypeScript Core 由旧 WordPress `live2d.min.js` 按反混淆清单恢复 | 上游本地包未显式附带 license，外部分发前必须复核 |
