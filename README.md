# kt-blog-web

Vue 3/TSX 与 antdv-next 实现的 Argon 风格博客前台。

## 本地使用

按 package.json 的版本约束选择 Node/pnpm，在 Windows 工作区运行：

```powershell
pnpm install
pnpm dev
```

本地启动前核对 API 与公开资产配置；保留真实博客资源及本地备份，不把演示素材作为默认背景或头像。

## 验证与文档

```powershell
pnpm run type-check
```

按修改选择类型、构建或已有页面测试，发布须另满足授权与在线验收。公开前端环境配置可跟踪，真实凭据不进入客户端。

[中央项目文档](../../docs/projects/blog/index.md) 集中维护说明与历史资料。

## 来源与许可证


| 一级来源 | 使用方式 | License |
| --- | --- | --- |
| [Argon Theme](https://github.com/solstice23/argon-theme) | 博客视觉资产、主题样式、滚动/搜索/过渡参考和页脚主题署名 | GPL-3.0 |
| Pio/Tia Cubism2 MOC runtime/model assets | MinIO `moc/` 源用于旧 WordPress Live2D 视觉行为还原；Cubism2 v2 TypeScript Core 由旧 WordPress `live2d.min.js` 按反混淆清单恢复 | 上游本地包未显式附带 license，外部分发前必须复核 |
