import { articleContentHtml } from './blogArticleContent';

export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  categories?: BlogArticleCategoryTerm[];
  tags: string[];
  cover: string;
  date: string;
  readTime: string;
  author: string;
  views: number;
  comments: number;
  words: number;
  content: string[];
  headings?: BlogArticleHeading[];
  contentHtml?: string;
}

export interface BlogArticleHeading {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface BlogArticleCategoryTerm {
  slug: string;
  label: string;
}

export interface BlogCategory {
  slug: string;
  label: string;
  description: string;
  count: number;
  color: string;
}

export interface BlogTag {
  slug: string;
  label: string;
  color: string;
  count: number;
}

export const categories: BlogCategory[] = [
  {
    slug: 'public',
    label: 'public',
    description: '默认公开分类。',
    count: 1,
    color: 'purple',
  },
  {
    slug: 'nas',
    label: 'NAS',
    description: '飞牛 NAS、Docker、Jenkins、k3d/K8s 与公网访问方案。',
    count: 3,
    color: 'blue',
  },
  {
    slug: 'vue',
    label: 'Vue',
    description: 'Vue 前端工程、在线文档集成与项目实践。',
    count: 2,
    color: 'purple',
  },
  {
    slug: 'node',
    label: 'Node',
    description: 'NestJS、TypeORM 与 Node 服务搭建记录。',
    count: 1,
    color: 'green',
  },
  {
    slug: 'mqtt',
    label: 'MQTT',
    description: 'MQTT、topic 与前端消息通信方案。',
    count: 1,
    color: 'orange',
  },
];

export const tags: BlogTag[] = [
  { slug: 'nas', label: 'NAS', color: 'blue', count: 3 },
  { slug: 'vue', label: 'Vue', color: 'purple', count: 2 },
  { slug: 'node', label: 'Node', color: 'green', count: 1 },
  { slug: 'mqtt', label: 'MQTT', color: 'orange', count: 1 },
];

const articleHeadings: Record<number, BlogArticleHeading[]> = {
  9: [
    { level: 2, id: 'header-id-1', text: '官方文档' },
    { level: 2, id: 'header-id-2', text: '项目 demo' },
    { level: 2, id: 'header-id-3', text: '1. 环境准备' },
    { level: 3, id: 'header-id-4', text: '1-1. 全局安装 @nestjs/cli 并初始化' },
    { level: 2, id: 'header-id-5', text: '2. 安装 typeOrm 并初始化数据库' },
    { level: 3, id: 'header-id-6', text: '2-1. 新建 Entity 实体映射类，映射数据库数据' },
    { level: 3, id: 'header-id-7', text: '2-2. 连接数据库' },
    { level: 2, id: 'header-id-8', text: '3. 创建 controller 接口' },
    { level: 3, id: 'header-id-9', text: '3-1. 按模块开发，创建 user 文件夹存放 user 模块文件' },
    { level: 3, id: 'header-id-10', text: '3-2. 包含上述中一个完整模块需要的四个文件' },
    { level: 3, id: 'header-id-11', text: '3-3. 编写 service 和 controller 文件，并在 module 文件内注入并抛出 module 文件' },
    { level: 4, id: 'header-id-12', text: '1. 实现此模块需要的方法' },
    { level: 4, id: 'header-id-13', text: '2. 实现此模块接口' },
    { level: 4, id: 'header-id-14', text: '3. 将文件在 module.ts 文件内引入并抛出 module.ts' },
    { level: 4, id: 'header-id-15', text: '4. 在 app.module.ts 项目模块入口文件中中引入自定义模块' },
    { level: 2, id: 'header-id-16', text: '4. 启动 node 服务' },
  ],
  20: [
    { level: 2, id: 'header-id-1', text: '如何在项目中使用 MQTT' },
    { level: 3, id: 'header-id-2', text: '安装 mqtt' },
    { level: 3, id: 'header-id-3', text: '封装工具类和 Hooks' },
    { level: 4, id: 'header-id-4', text: '工具类' },
    { level: 4, id: 'header-id-5', text: 'Hooks' },
    { level: 3, id: 'header-id-6', text: '使用示例' },
    { level: 2, id: 'header-id-7', text: '什么是 MQTT 主题？' },
    { level: 2, id: 'header-id-8', text: 'MQTT 主题通配符' },
    { level: 3, id: 'header-id-9', text: '单层通配符' },
    { level: 3, id: 'header-id-10', text: '多层通配符' },
    { level: 2, id: 'header-id-11', text: '以 $ 开头的主题' },
    { level: 3, id: 'header-id-12', text: '系统主题' },
    { level: 3, id: 'header-id-13', text: '共享订阅' },
    { level: 2, id: 'header-id-14', text: '不同场景中的主题设计' },
    { level: 3, id: 'header-id-15', text: '智能家居' },
    { level: 3, id: 'header-id-16', text: '充电桩' },
    { level: 3, id: 'header-id-17', text: '即时消息' },
    { level: 2, id: 'header-id-18', text: 'MQTT 主题常见问题及解答' },
    { level: 3, id: 'header-id-19', text: '主题的层级及长度有什么限制吗？' },
    { level: 3, id: 'header-id-20', text: '服务器对主题数量有限制吗？' },
    { level: 3, id: 'header-id-21', text: '通配符主题订阅与普通主题订阅性能是否一致？' },
    { level: 3, id: 'header-id-22', text: '重叠订阅了普通主题和通配符主题时如何接收消息？' },
    { level: 3, id: 'header-id-23', text: '同一个主题能被共享订阅与普通订阅同时使用吗？' },
    { level: 3, id: 'header-id-24', text: '常见的 MQTT 主题使用建议有哪些？' },
  ],
  41: [
    { level: 2, id: 'header-id-1', text: '1. 架构说明' },
    { level: 2, id: 'header-id-2', text: '2. 最终采用方案' },
    { level: 2, id: 'header-id-3', text: '3. 网络规划' },
    { level: 2, id: 'header-id-4', text: '4. 腾讯云防火墙放行' },
    { level: 2, id: 'header-id-5', text: '5. 腾讯云安装 WireGuard' },
    { level: 2, id: 'header-id-6', text: '6. 腾讯云生成 WireGuard 服务端密钥' },
    { level: 2, id: 'header-id-7', text: '7. 腾讯云创建临时 wg0 配置' },
    { level: 2, id: 'header-id-8', text: '8. 腾讯云创建添加飞牛 Peer 的脚本' },
    { level: 2, id: 'header-id-9', text: '9. 飞牛 OS 安装 WireGuard' },
    { level: 2, id: 'header-id-10', text: '10. 飞牛生成 WireGuard 客户端密钥' },
    { level: 2, id: 'header-id-11', text: '11. 飞牛写入 wg0 配置' },
    { level: 2, id: 'header-id-12', text: '12. 腾讯云添加飞牛 Peer' },
    { level: 2, id: 'header-id-13', text: '13. 验证 WireGuard 隧道' },
    { level: 2, id: 'header-id-14', text: '14. 飞牛启动临时测试服务' },
    { level: 2, id: 'header-id-15', text: '15. 后续服务访问方式' },
    { level: 2, id: 'header-id-16', text: '16. 常用维护命令' },
    { level: 3, id: 'header-id-17', text: '腾讯云' },
    { level: 3, id: 'header-id-18', text: '飞牛 OS' },
    { level: 3, id: 'header-id-19', text: '查看端口' },
    { level: 3, id: 'header-id-20', text: '抓包排查' },
    { level: 2, id: 'header-id-21', text: '17. 常见问题' },
    { level: 3, id: 'header-id-22', text: '17.1 Docker WireGuard 报权限错误' },
    { level: 3, id: 'header-id-23', text: '17.2 latest-handshake 为 0' },
    { level: 3, id: 'header-id-24', text: '17.3 ping 不通 10.66.66.2' },
    { level: 3, id: 'header-id-25', text: '17.4 curl 飞牛服务不通' },
    { level: 2, id: 'header-id-26', text: '18. 最终成功状态' },
  ],
  46: [
    { level: 2, id: 'header-id-1', text: '1. 架构说明' },
    { level: 2, id: 'header-id-2', text: '2. 前置条件' },
    { level: 2, id: 'header-id-3', text: '3. DNS 配置' },
    { level: 2, id: 'header-id-4', text: '4. 腾讯云防火墙放行' },
    { level: 2, id: 'header-id-5', text: '5. 安装 Docker 和 Compose' },
    { level: 2, id: 'header-id-6', text: '6. 创建 Caddy 目录' },
    { level: 2, id: 'header-id-7', text: '7. 创建 Docker Compose' },
    { level: 2, id: 'header-id-8', text: '8. 编写 Caddyfile' },
    { level: 2, id: 'header-id-9', text: '9. MCD 24444 特殊端口配置' },
    { level: 2, id: 'header-id-10', text: '10. 启动 Caddy' },
    { level: 2, id: 'header-id-11', text: '11. 重载或重启 Caddy' },
    { level: 2, id: 'header-id-12', text: '12. 验证访问' },
    { level: 2, id: 'header-id-13', text: '13. 常见问题' },
    { level: 3, id: 'header-id-14', text: '13.1 Caddy 未启动' },
    { level: 3, id: 'header-id-15', text: '13.2 80/443 被其他服务占用' },
    { level: 3, id: 'header-id-16', text: '13.3 后端 HTTP/HTTPS 写反' },
    { level: 3, id: 'header-id-17', text: '13.4 Caddy 返回 502' },
    { level: 3, id: 'header-id-18', text: '13.5 Socket.IO/ WebSocket 服务异常' },
    { level: 2, id: 'header-id-19', text: '14. 生产建议' },
    { level: 3, id: 'header-id-20', text: '14.1 飞牛管理后台加 Basic Auth' },
    { level: 3, id: 'header-id-21', text: '14.2 数据库不走 Caddy' },
    { level: 2, id: 'header-id-22', text: '15. 最终维护命令' },
  ],
  50: [
    { level: 2, id: 'header-id-1', text: '1. 方案摘要' },
    { level: 2, id: 'header-id-2', text: '2. 建设目标' },
    { level: 3, id: 'header-id-3', text: '2.1 业务目标' },
    { level: 3, id: 'header-id-4', text: '2.2 技术目标' },
    { level: 2, id: 'header-id-5', text: '3. 总体架构' },
    { level: 3, id: 'header-id-6', text: '3.1 分层职责' },
    { level: 3, id: 'header-id-7', text: '3.2 为什么采用 k3d/K3s' },
    { level: 2, id: 'header-id-8', text: '4. 命名与资源规范' },
    { level: 2, id: 'header-id-9', text: '5. 端口与目录规范' },
    { level: 3, id: 'header-id-10', text: '5.1 端口规范' },
    { level: 3, id: 'header-id-11', text: '5.2 目录规范' },
    { level: 2, id: 'header-id-12', text: '6. Jenkins 流水线设计' },
    { level: 3, id: 'header-id-13', text: '6.1 发布目标' },
    { level: 3, id: 'header-id-14', text: '6.2 流水线阶段' },
    { level: 3, id: 'header-id-15', text: '6.3 镜像标签策略' },
    { level: 2, id: 'header-id-16', text: '7. K8s 运行态设计' },
    { level: 3, id: 'header-id-17', text: '7.1 Deployment' },
    { level: 3, id: 'header-id-18', text: '7.2 Service' },
    { level: 3, id: 'header-id-19', text: '7.3 探针与资源限制' },
    { level: 2, id: 'header-id-20', text: '8. 配置与密钥设计' },
    { level: 2, id: 'header-id-21', text: '9. 初始化与切换方案' },
    { level: 3, id: 'header-id-22', text: '9.1 安全初始化' },
    { level: 3, id: 'header-id-23', text: '9.2 正式切换' },
    { level: 3, id: 'header-id-24', text: '9.3 网络问题处理' },
    { level: 2, id: 'header-id-25', text: '10. 日常发布 SOP' },
    { level: 2, id: 'header-id-26', text: '11. 回滚方案' },
    { level: 3, id: 'header-id-27', text: '11.1 K8s 标准回滚' },
    { level: 3, id: 'header-id-28', text: '11.2 指定镜像回滚' },
    { level: 3, id: 'header-id-29', text: '11.3 退回旧 Docker 模式' },
    { level: 2, id: 'header-id-30', text: '12. 运维与排障' },
    { level: 2, id: 'header-id-31', text: '13. 安全边界' },
    { level: 2, id: 'header-id-32', text: '14. 备份与恢复建议' },
    { level: 2, id: 'header-id-33', text: '15. 后续演进路线' },
    { level: 3, id: 'header-id-34', text: '15.1 巩固后端 K8s 发布' },
    { level: 3, id: 'header-id-35', text: '15.2 前端、Ingress 与观测' },
    { level: 2, id: 'header-id-36', text: '16. 验收标准' },
    { level: 2, id: 'header-id-37', text: '17. 核心命令速查' },
  ],
  61: [
    { level: 1, id: 'header-id-1', text: 'QQBot NAS 接入记录' },
    { level: 2, id: 'header-id-2', text: '当前远程状态' },
    { level: 2, id: 'header-id-3', text: '当前拓扑' },
    { level: 2, id: 'header-id-4', text: '插件平台生产包发现' },
    { level: 2, id: 'header-id-5', text: '待实施设计入口' },
    { level: 2, id: 'header-id-6', text: '部署脚本' },
    { level: 2, id: 'header-id-7', text: '验证结果' },
    { level: 2, id: 'header-id-8', text: '扫码登录链路' },
    { level: 2, id: 'header-id-9', text: '经常下线排查' },
    { level: 2, id: 'header-id-10', text: '参考来源' },
  ],
};

export const articles: BlogArticle[] = [
  {
    id: 61,
    slug: 'qqbot-nas-access-record',
    title: 'QQBot NAS 接入记录',
    excerpt:
      '记录 QQBot 迁入 NAS 后的运行状态、容器部署、NapCat 登录链路与后续稳定性观察。',
    category: 'public',
    categorySlug: 'public',
    tags: [],
    cover: '/argon/theme/landing.jpg',
    date: '2026-06-18 11:11',
    readTime: '18 分钟',
    author: 'KwiTsukasa',
    views: 16,
    comments: 0,
    words: 4035,
    headings: articleHeadings[61],
    contentHtml: articleContentHtml[61],
    content: [
      'QQBot/NapCat 在 NAS、K8s、WordPress 管理链路中的接入、部署与验证记录。',
    ],
  },
  {
    id: 50,
    slug: 'fnos-nas-docker-jenkins-k3d-k8s',
    title: '飞牛 NAS Docker、Jenkins 与 k3d/K8s 一体化技术方案',
    excerpt:
      '说明：本文为脱敏版技术方案。项目名、仓库地址、端口、目录、域名、内网地址、主机名和密钥路径均使用通用占位符，落地时请替换为自己的实际环境。',
    category: 'NAS',
    categorySlug: 'nas',
    tags: ['NAS'],
    cover: '/argon/theme/img-2-1200x1000.jpg',
    date: '2026-05-16 16:43',
    readTime: '14 分钟',
    author: 'KwiTsukasa',
    views: 39,
    comments: 0,
    words: 3151,
    headings: articleHeadings[50],
    contentHtml: articleContentHtml[50],
    content: [
      '本方案面向小型私有化部署场景，目标是在飞牛 NAS 上把 Docker、Jenkins、前端静态发布和后端 API 容器发布整合成一套可持续迭代的标准流程。',
      '飞牛 NAS 作为内网计算与数据承载节点，Jenkins 负责编排流水线，k3d/K8s 承载后端服务，Nginx 承载前端静态站点与反向代理。',
      '后续 kt-blog-web 对接本地 Markdown 博客接口后，这类文章会直接来自本地文章接口，前台只负责还原 Argon 的展示结构。',
    ],
  },
  {
    id: 46,
    slug: 'tencent-cloud-caddy-reverse-proxy',
    title: '腾讯云 Caddy 反向代理部署方案',
    excerpt:
      '架构说明：公网用户通过 HTTPS 访问腾讯云轻量服务器 Caddy，由 Caddy 反向代理到内网服务或隧道入口。',
    category: 'NAS',
    categorySlug: 'nas',
    tags: ['NAS'],
    cover: '/argon/theme/img-1-1200x1000.jpg',
    date: '2026-05-12 12:00',
    readTime: '16 分钟',
    author: 'KwiTsukasa',
    views: 18,
    comments: 0,
    words: 860,
    headings: articleHeadings[46],
    contentHtml: articleContentHtml[46],
    content: [
      'Caddy 适合快速处理 HTTPS、自动证书和简单反代场景。',
      '当家庭网络中的服务不能直接暴露时，可以通过云服务器进行统一入口转发。',
    ],
  },
  {
    id: 41,
    slug: 'vps-home-nas-wireguard-ipv4',
    title: 'VPS + 家宽NAS + WireGuard 公网IPV4方案',
    excerpt:
      '目标链路：公网用户访问腾讯云公网 IPv4，腾讯云通过 WireGuard 隧道访问家宽飞牛 OS 服务。',
    category: 'NAS',
    categorySlug: 'nas',
    tags: ['NAS'],
    cover: '/argon/theme/landing.jpg',
    date: '2026-05-12 11:58',
    readTime: '14 分钟',
    author: 'KwiTsukasa',
    views: 14,
    comments: 0,
    words: 940,
    headings: articleHeadings[41],
    contentHtml: articleContentHtml[41],
    content: [
      'WireGuard 负责把云端入口和家庭 NAS 拉到同一个虚拟网络中。',
      'Caddy 或 Nginx 再负责域名、HTTPS 和后端服务反向代理。',
    ],
  },
  {
    id: 35,
    slug: 'onlyoffice-online-docs-integration',
    title: 'OnlyOffice在线文档集成方案',
    excerpt:
      '在 index.html 文件中使用 script 引入后端服务部署后生成的 onlyOffice js 文件，并创建公用配置。',
    category: 'Vue',
    categorySlug: 'vue',
    tags: ['Vue'],
    cover: '/argon/theme/promo-1.png',
    date: '2025-10-31 16:16',
    readTime: '11 分钟',
    author: 'KwiTsukasa',
    views: 19,
    comments: 0,
    words: 274,
    content: [
      'OnlyOffice 集成重点在于文档服务地址、回调地址、token 和编辑器配置。',
      '前端只需要封装稳定的初始化组件，具体文档状态由后端统一托管。',
    ],
  },
  {
    id: 20,
    slug: 'mqtt-topic-guide',
    title: '在项目中快速使用MQTT,以及topic详解',
    excerpt:
      '如何在项目中使用 MQTT，安装 mqtt，封装工具类和 Hooks 工具类，理解 topic 的层级与通配规则。',
    category: 'MQTT',
    categorySlug: 'mqtt',
    categories: [
      { slug: 'mqtt', label: 'MQTT' },
      { slug: 'vue', label: 'Vue' },
    ],
    tags: ['MQTT', 'Vue'],
    cover: '/argon/theme/img-2-1200x1000.jpg',
    date: '2025-10-29 16:50',
    readTime: '17 分钟',
    author: 'KwiTsukasa',
    views: 22,
    comments: 0,
    words: 2483,
    headings: articleHeadings[20],
    contentHtml: articleContentHtml[20],
    content: [
      'MQTT 的核心在于轻量连接、主题订阅和消息分发。',
      '在前端项目中需要把连接状态、订阅清理和消息回调都收敛到统一 hooks 中。',
    ],
  },
  {
    id: 9,
    slug: 'nestjs-typeorm-node-service',
    title: '使用Nest.js与TypeORM搭建Node服务',
    excerpt:
      '官方文档、TypeORM、项目 demo、环境准备、全局安装 CLI 并初始化服务。',
    category: 'Node',
    categorySlug: 'node',
    tags: ['Node'],
    cover: '/argon/theme/img-1-1200x1000.jpg',
    date: '2025-10-29 15:38',
    readTime: '13 分钟',
    author: 'KwiTsukasa',
    views: 23,
    comments: 0,
    words: 598,
    headings: articleHeadings[9],
    contentHtml: articleContentHtml[9],
    content: [
      'NestJS 负责组织模块、控制器、服务和依赖注入。',
      'TypeORM 负责实体映射、数据源配置和数据库查询。',
    ],
  },
];

export const getArticleBySlug = (slug: string) => articles.find((article) => article.slug === slug);

export const getCategoryBySlug = (slug: string) =>
  categories.find((category) => category.slug === slug);

export const getTagBySlug = (slug: string) => tags.find((tag) => tag.slug === slug);

export const getTagSlugByLabel = (label: string) =>
  tags.find((tag) => tag.label === label)?.slug ?? label.toLowerCase().replace(/\s+/g, '-');

/**
 * @param article Blog article whose WordPress heading outline should drive the Argon leftbar catalog.
 * @returns Captured heading outline; empty means Argon's `have_catalog()` would hide the catalog tab.
 */
export const getArticleCatalogHeadings = (article: Pick<BlogArticle, 'headings'> | null | undefined) =>
  article?.headings ?? [];

/**
 * @param slug Category slug from a local route or taxonomy link.
 * @returns Static fallback articles whose full WordPress category list contains the slug.
 */
export const getArticlesByCategory = (slug: string) =>
  articles.filter((article) => isArticleInCategory(article, slug));

export const getArticlesByTag = (slug: string) => {
  const tag = getTagBySlug(slug);
  if (!tag) {
    return [];
  }

  return articles.filter((article) => article.tags.includes(tag.label));
};

/**
 * @param keyword Search text entered through the Argon header or sidebar search.
 * @returns Static fallback articles matching title, excerpt, category terms, tags, or body text.
 */
export const searchArticles = (keyword: string) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return articles;
  }

  return articles.filter((article) => {
    const haystack = [
      article.title,
      article.excerpt,
      article.category,
      ...getArticleCategories(article).map((category) => category.label),
      ...article.tags,
      ...article.content,
      stripHtmlText(article.contentHtml ?? ''),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedKeyword);
  });
};

/**
 * @param html WordPress-rendered article body that may contain block tags and code snippets.
 * @returns Plain text index material so local search still sees the full article body without rendering HTML.
 */
function stripHtmlText(html: string) {
  return html
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

/**
 * @param source Current article whose categories and tags define related-article candidates.
 * @returns Up to three static fallback articles sharing at least one category or tag.
 */
export const getRelatedArticles = (source: BlogArticle) =>
  articles
    .filter(
      (article) =>
        article.id !== source.id &&
        (hasSharedCategory(article, source) ||
          article.tags.some((tag) => source.tags.includes(tag))),
    )
    .slice(0, 3);

/**
 * @param article Blog article whose WordPress category membership should be read.
 * @returns All category terms for the article, falling back to its primary category for older records.
 */
export function getArticleCategories(article: Pick<BlogArticle, 'categories' | 'category' | 'categorySlug'>) {
  if (article.categories?.length) {
    return article.categories;
  }

  return [{ label: article.category, slug: article.categorySlug }];
}

/**
 * @param article Blog article to test.
 * @param slug Local category slug from the route or taxonomy link.
 * @returns Whether the article belongs to the category, including secondary WordPress categories.
 */
export function isArticleInCategory(article: BlogArticle, slug: string) {
  return getArticleCategories(article).some((category) => category.slug === slug);
}

/**
 * @param left First article in a related-article comparison.
 * @param right Second article in a related-article comparison.
 * @returns Whether both articles share at least one WordPress category slug.
 */
export function hasSharedCategory(left: BlogArticle, right: BlogArticle) {
  const rightCategorySlugs = new Set(getArticleCategories(right).map((category) => category.slug));

  return getArticleCategories(left).some((category) => rightCategorySlugs.has(category.slug));
}
