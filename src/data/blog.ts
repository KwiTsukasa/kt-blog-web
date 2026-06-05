export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  tags: string[];
  cover: string;
  date: string;
  readTime: string;
  author: string;
  views: number;
  comments: number;
  words: number;
  content: string[];
  contentHtml?: string;
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
  { slug: 'jenkins', label: 'Jenkins', color: 'geekblue', count: 1 },
  { slug: 'k3d', label: 'k3d/K8s', color: 'cyan', count: 1 },
  { slug: 'docker', label: 'Docker', color: 'volcano', count: 1 },
  { slug: 'nestjs', label: 'NestJS', color: 'magenta', count: 1 },
];

export const articles: BlogArticle[] = [
  {
    id: 50,
    slug: 'fnos-nas-docker-jenkins-k3d-k8s',
    title: '飞牛 NAS Docker、Jenkins 与 k3d/K8s 一体化技术方案',
    excerpt:
      '说明：本文为脱敏版技术方案。项目名、仓库地址、端口、目录、域名、内网地址、主机名和密钥路径均使用通用占位符，落地时请替换为自己的实际环境。',
    category: 'NAS',
    categorySlug: 'nas',
    tags: ['NAS', 'Docker', 'Jenkins', 'k3d/K8s'],
    cover: '/argon/theme/img-2-1200x1000.jpg',
    date: '2026-05-16 16:43',
    readTime: '14 分钟',
    author: 'KwiTsukasa',
    views: 8,
    comments: 0,
    words: 3151,
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
    tags: ['MQTT', 'Vue'],
    cover: '/argon/theme/img-2-1200x1000.jpg',
    date: '2025-10-29 16:50',
    readTime: '17 分钟',
    author: 'KwiTsukasa',
    views: 22,
    comments: 0,
    words: 2483,
    content: [
      'MQTT 的核心在于轻量连接、主题订阅和消息分发。',
      '在前端项目中需要把连接状态、订阅清理和消息回调都收敛到统一 hooks 中。',
    ],
  },
  {
    id: 9,
    slug: 'nestjs-typeorm-node-service',
    title: '使用NestJs与TypeORM搭建Node服务',
    excerpt:
      '官方文档、TypeORM、项目 demo、环境准备、全局安装 CLI 并初始化服务。',
    category: 'Node',
    categorySlug: 'node',
    tags: ['Node', 'NestJS'],
    cover: '/argon/theme/img-1-1200x1000.jpg',
    date: '2025-10-29 15:38',
    readTime: '13 分钟',
    author: 'KwiTsukasa',
    views: 23,
    comments: 0,
    words: 598,
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

export const getArticlesByCategory = (slug: string) =>
  articles.filter((article) => article.categorySlug === slug);

export const getArticlesByTag = (slug: string) => {
  const tag = getTagBySlug(slug);
  if (!tag) {
    return [];
  }

  return articles.filter((article) => article.tags.includes(tag.label));
};

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
      ...article.tags,
      ...article.content,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedKeyword);
  });
};

export const getRelatedArticles = (source: BlogArticle) =>
  articles
    .filter(
      (article) =>
        article.id !== source.id &&
        (article.categorySlug === source.categorySlug ||
          article.tags.some((tag) => source.tags.includes(tag))),
    )
    .slice(0, 3);
