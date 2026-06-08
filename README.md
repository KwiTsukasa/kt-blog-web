# kt-blog-web

KT 博客前台 demo，基于 Argon WordPress 主题的视觉资产重新实现，技术栈为 Vue 3、TSX、Vite、antdv-next。

## 技术约定

- 页面语法：Vue TSX。
- 组件库：antdv-next。
- 样式：SCSS，类名按 BEM 组织。
- 路由：hash 模式，便于静态部署。
- 静态资产：只从 Argon 主题包抽取 demo 需要的图片，不引入 WordPress PHP 与主题脚本。

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
```

## 来源与许可证

| 一级来源 | 使用方式 | License |
| --- | --- | --- |
| [Argon Theme](https://github.com/solstice23/argon-theme) | 博客视觉资产、主题样式、滚动/搜索/过渡参考和页脚主题署名 | GPL-3.0 |
