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
pnpm exec playwright test test/e2e/argon-parity/pages.spec.ts --project=chromium
pnpm exec playwright test test/e2e/argon-parity/interactions.spec.ts --project=chromium
pnpm exec playwright test test/e2e/argon-parity/baseline.spec.ts --project=chromium
CI=1 pnpm exec playwright test test/e2e/gateway-subpath.spec.ts --project=chromium
```

`baseline.spec.ts` 只在需要重新抓旧 WordPress Argon 基准时运行；常规本地回归跑 `pages.spec.ts` 和 `interactions.spec.ts`。公开域名 `https://blog.kwitsukasa.top/` 当前是 KT Blog Web 静态站入口，不是只读基准站；旧 WordPress 只作为历史视觉/交互来源，`48088` 已停用且不是当前可用的回滚入口。恢复必须另行授权，并按完整备份恢复演练执行。

同一生产构建支持旧正式域名根挂载和
`https://nas4.kwitsukasa.top:{动态端口}/blog/` 子路径挂载；静态资源保持
`./` 相对引用，API 与 Live2D 继续使用同 Origin 根相对 `/api/blog/*`。
`gateway-subpath.spec.ts` 使用生产 preview 验证资源不逃出 `/blog/`。完整
路由、动态端口、Caddy 回退和 WordPress 两阶段退役步骤见根仓库
`docs/unified-natmap-tls-gateway-operations.md`。

## 生产发布

Jenkins 生产发布必须显式传入当前 release commit 的
`EXPECTED_SOURCE_COMMIT`，且 checkout HEAD、远端 `main`、远端 `dev`
必须同时等于该 40 位小写 SHA。只有非 PR 的 `main` 可以进入 release mode，
`PUBLISH_BRANCH_PATTERN` 不能给其他分支授予生产写入权限。发布参数固定为
`VITE_BASE=./`、`VITE_KT_ADMIN_BASE_URL=/admin/`，任一参数带前后空白或
发生漂移都会在安装依赖前失败。远端 `main/dev` 查询复用 Jenkins SCM 凭据
`github-ssh-kt-template`，不得在 checkout 后裸连私有仓库。首次引入参数后，
Jenkins 旧任务若以空 SHA 启动，会按设计先刷新参数并停止，随后再用当前
commit 显式触发。

启用 `DEPLOY_NGINX_CONFIG` 时，流水线只接受仓库内
`deploy/nginx-blog.conf` 和既有 `kt-frontends-nginx` 挂载路径。发布先保存
并校验不可覆盖的生产配置硬链接备份；同一构建号存在 backup、candidate 或
restore 残留时立即停止。随后排他写入同目录候选并用 `mv` 原子替换；只有
`nginx -t`、reload 和容器内 SHA256 回读全部通过才提交结果。任一步失败或
收到终止信号，都会通过保留的备份原子恢复并重新 validate/reload。

## Argon 还原范围

- `test/e2e/argon-parity` 保存与旧 WordPress Argon 基准对齐的页面、视口和交互矩阵；公开域名切到 KT Blog Web 后，基准抓取必须显式使用旧 WordPress 入口。
- 本地 hash 路由按语义映射 WordPress query 路由：文章、分类、标签、搜索和月份归档都用同一套矩阵验证。
- 页面根节点通过 `kt-blog--home/search/category/tag/archive/post` 暴露 Argon 页面语义，方便样式、测试和 Admin iframe 预览复用。
- 公开文章和主题只请求当前 Origin 下的 `/api/blog/*` 契约；列表不可用或返回空列表时展示本地空态，不再注入 WordPress 抓取文章种子，也不接受 `/api/wordpress` 或跨 Origin 的接口覆盖。
- 主题接口若仍返回 `/argon/theme/*` 历史 demo 占位图，前端必须映射回旧线上博客资源；本地备份只用于兜底，避免静态站重新露出模板图。
- 文章正文以线上 WordPress `#post_content` 渲染结果和 Argon `style.css` / `argontheme.js` 为准；代码块控制条、复制 toast、Fancybox 图片预览、正文链接 hover、分隔线和图片 lazyload 都必须有 Playwright 断言。
- `hljs-codeblock` 静态快照需要恢复 Argon `highlightjs-line-numbers` 运行时生成的 `data-line-number` 与 `.hljs-ln-n::before`，否则行号列会坍塌成 0px。
- 左栏 overview sticky/relative 切换用 no-headroom 回归用例固定，解除 fixed 后不得重放卡片入场动画或产生缩放闪烁。
- 左栏文章目录/站点概览切换必须保留 Bootstrap tab fade 节奏，采用 active/show 分帧保持 Argon 手感；回归用例需要断言切换中 opacity 处于 0 到 1 之间，而不是只检查最终显隐。
- 左栏“管理”始终使用 KT Admin SSO：Jenkins 生产构建默认传入根相对 `VITE_KT_ADMIN_BASE_URL=/admin/`，运行时按当前 `window.location.origin` 保留动态 Host 与端口；本地默认使用 `http://localhost:5999/`，也可显式配置受控 HTTP(S) 绝对基址兼容旧入口。旧主题接口返回的 `/wp-admin/` 会在最终侧栏菜单中迁移到该入口；Blog 不跨域读取 Cookie，也不在 URL 中传递 token。
- Argon motion、滚动几何、延迟、RAF 调度、DOM id/selector、hash anchor 和跨组件 ref 必须从 `src/factories/blogAnimationFactory.ts` 与 `src/factories/blogDomFactory.ts` 取值；组件和 Hook 不再散写行为层 id、裸 `requestAnimationFrame`、裸 `setTimeout` 或重复 timing。
- Live2D 使用旧 WordPress 站点同款 Cubism2 MOC 资源，`BlogLive2D` 与 `src/components/blog/live2d/runtime/*` 负责 canvas、Pio/Tia catalog、MOC metadata、选择缓存、WebGL 渲染、真实 MTN 动作队列、全页面有界视线、canvas-local 触摸和模型/服装直达切换。服装弹窗按资源语义显示中文名，点击选项只在当前看板娘上即时预览，不写缓存；确认后保存，取消、遮罩或 Esc 会恢复原服装。点击命中保留原 `live2d.min.js` 的 canvas-local width 分母坐标；桌面鼠标视线以模型中心为零点，按中心到对应 viewport 边缘的距离连续归一化，使 canvas 外近/中/远距离仍可区分。运行时保持源码的 `loadParam -> motion/eye blink -> saveParam -> pointer/sine/breath -> update` 参数生命周期，并直接导入类型化、语义化的 TS Core；不包含 compatibility/global installer，也不得 append 原始 `live2d.min.js`。
- Cubism2 反混淆只以 `public/live2d/wordpress-moc/live2d.min.js` 为源码证据，并严格按“函数名恢复 -> 调用逻辑理清 -> 拆分压缩耦合 -> 变量名恢复 -> runtime 全覆盖”推进；生产运行时不得加载该 min.js。权威进度维护在 `docs/blog-live2d-cubism2-minjs-deobfuscation-ledger.md`，稳定决策位于 `docs/live2d-deobfuscation/`。当前主线已闭合：627/627 函数、1411/1411 调用、567 owned/60 omitted、578 参数/1169 局部/53 最终标识符；runtime 分类为 546 exact、14 intentional bug fix、7 defensive extension、60 omitted-unreachable。生产 Core 严格等于 38 个 owner module + 5 个 sealed support module、0 orphan，并直接由 `runtimeCore.ts`/renderer 消费；禁止重新引入 compatibility、legacy globals、alias、映射层或原始 min.js 加载。
- Modal 不强求一比一复刻线上 Argon 动画，打开/关闭 motion 与 `centered` 居中定位交给 antdv-next；外层按 `packages/@core/ui-kit/popup-ui/src/modal/modal.vue` 保留 Header/Content/Footer 三段能力、`p-0`、`max-height`、纵向 flex、Content `min-h-40` 滚动和 `px-5 py-4`/`p-3`/`p-2` 间距，但无 footer slot 时不渲染 footer，不搬 draggable/fullscreen/loading/footer 按钮等复杂能力，自有颜色只守 Blog 主题色和暗色可读性。
- Admin 文章预览通过 `VITE_KT_BLOG_WEB_BASE_URL` 打开公开 Blog Web 路由，本地默认 `http://127.0.0.1:5173/#/post/<slug>?adminPreview=1&articleId=<id>`。

## 来源与许可证

| 一级来源 | 使用方式 | License |
| --- | --- | --- |
| [Argon Theme](https://github.com/solstice23/argon-theme) | 博客视觉资产、主题样式、滚动/搜索/过渡参考和页脚主题署名 | GPL-3.0 |
| Pio/Tia Cubism2 MOC runtime/model assets | MinIO `moc/` 源用于旧 WordPress Live2D 视觉行为还原；Cubism2 v2 TypeScript Core 由旧 WordPress `live2d.min.js` 按反混淆清单恢复 | 上游本地包未显式附带 license，外部分发前必须复核 |
