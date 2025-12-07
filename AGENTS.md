# AGENTS.md

** 请始终使用简体中文和用户对话 **

## 项目概述

Agili 的 Hacker Podcast - 一个基于 AI 的中文播客生成器，自动抓取 Hacker News 每日热门文章，通过 AI 生成中文摘要并使用 Edge TTS 转换为音频播客。

**在线演示：** https://hacker-podcast.agi.li
**RSS 订阅：** https://hacker-podcast.agi.li/rss.xml

## 技术栈

- **框架：** Next.js 16 与 App Router
- **运行时：** Cloudflare Workers（通过 OpenNext 适配器部署）
- **AI/ML：** OpenAI API，Edge TTS（Minimax Audio）
- **存储：** Cloudflare KV，R2 对象存储
- **内容提取：** Jina AI，Firecrawl，Cheerio
- **UI：** React 19，Tailwind CSS 4，shadcn/ui，Radix UI
- **构建：** pnpm，wrangler

## 常用开发命令

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev                    # 启动 Next.js 开发服务器
pnpm dev:worker            # 启动 Cloudflare Worker 开发服务器
curl -X POST http://localhost:8787  # 手动触发工作流

# 构建和部署
pnpm build                 # 构建 Next.js 应用
pnpm deploy:worker         # 部署 Cloudflare Worker
pnpm deploy                # 部署完整应用（包括构建）
pnpm preview               # 本地预览生产构建

# 代码检查
pnpm lint                  # 运行 ESLint
pnpm lint:fix              # 自动修复 ESLint 问题, 优先使用此命令

# 测试
pnpm tests                 # 运行集成测试

# 类型生成
pnpm cf-typegen           # 生成 Cloudflare 类型定义
```

## 开发工作流

### 本地开发设置

1. **安装依赖：**

   ```bash
   pnpm install
   ```

2. **配置环境变量：**

   `.env.locall`（根目录）：

   ```
   NODE_ENV=development
   NEXT_STATIC_HOST=http://localhost:3000/static
   ```

   `worker/.env.locall`：

   ```
   NODE_ENV=development
   HACKER_PODCAST_WORKER_URL=https://your-worker-url
   HACKER_PODCAST_R2_BUCKET_URL=https://your-bucket-url
   OPENAI_API_KEY=your_api_key
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_MODEL=gpt-4.1
   ```

3. **启动开发服务器：**
   ```bash
   pnpm dev:worker  # Worker 运行在端口 8787
   pnpm dev         # Next.js 应用运行在端口 3000
   ```

### 架构概览

项目分为两个主要部分：

#### 1. **Worker**（`worker/` 目录）

- Cloudflare Worker 负责数据抓取、AI 处理和音频生成
- 通过 cron 每日 23:30 UTC 自动运行（`worker/wrangler.jsonc:21-24`）
- 暴露一个工作流引擎来处理 Hacker News 内容
- 处理来自 R2 存储的静态文件服务
- 关键文件：
  - `worker/index.ts` - 主入口点，处理定时事件和静态文件请求
  - `workflow/index.ts` - 工作流引擎，协调内容生成管道
  - `workflow/utils.ts` - 内容提取工具（Jina、Firecrawl、Cheerio）
  - `workflow/prompt.ts` - 内容摘要的 AI 提示
  - `workflow/tts.ts` - 文本转语音转换

#### 2. **Web 应用**（`app/` 目录）

- Next.js 应用用于展示内容和提供 RSS 订阅
- 通过 OpenNext 适配器部署到 Cloudflare Pages
- 提供文章页面、首页和 RSS 订阅
- 关键路由：
  - `app/page.tsx` - 首页显示最近文章
  - `app/episode/[date]/page.tsx` - 单个文章页面
  - `app/rss.xml/route.ts` - RSS 订阅生成
  - `app/static/[...path]/route.ts` - 静态资源代理

### 内容处理管道

1. **定时触发**（每日 23:30 UTC）
2. **获取热门故事** 从 Hacker News（workflow/index.ts:54-64）
3. **提取内容** 使用 Jina/Firecrawl（workflow/utils.ts:65-100）
4. **AI 摘要** 使用 OpenAI（workflow/index.ts:75-80）
5. **生成播客脚本** 使用 AI（workflow/index.ts:86-94）
6. **文本转语音** 通过 Edge TTS/Minimax Audio（workflow/tts.ts）
7. **存储** 在 Cloudflare KV 和 R2 存储中
8. **服务** 通过 Web 应用和 RSS 订阅

## 项目结构

```
/Users/miantiao-me/code/hacker-podcast
├── app/                    # Next.js 应用路由页面
│   ├── post/[date]/        # 动态文章页面
│   ├── rss.xml/            # RSS 订阅端点
│   ├── static/             # 静态资源代理
│   ├── page.tsx            # 首页
│   └── layout.tsx          # 根布局
├── worker/                 # Cloudflare Worker
│   ├── index.ts            # Worker 入口点
│   ├── static/             # 静态资源
│   └── wrangler.jsonc      # Worker 配置
├── workflow/               # 工作流引擎
│   ├── index.ts            # 主工作流类
│   ├── utils.ts            # 内容提取工具
│   ├── prompt.ts           # AI 提示
│   └── tts.ts              # 文本转语音
├── components/             # React 组件
│   ├── ui/                 # shadcn/ui 组件
│   └── article-card.tsx    # 文章显示组件
├── types/                  # TypeScript 类型定义
│   ├── story.d.ts          # 故事数据类型
│   └── article.d.ts        # 文章数据类型
├── config.ts               # 应用配置
├── next.config.mjs         # Next.js 配置
├── wrangler.jsonc          # 主部署配置
└── open-next.config.ts     # OpenNext Cloudflare 适配器配置
```

## 关键配置

### Cloudflare 资源（wrangler.jsonc）

- **KV 命名空间：** `HACKER_PODCAST_KV` - 存储处理后的内容
- **R2 存储桶：**
  - `HACKER_PODCAST_R2` - 存储音频文件
  - `NEXT_INC_CACHE_R2_BUCKET` - 存储增量缓存
- **工作流：** `HACKER_PODCAST_WORKFLOW` - 运行每日内容生成
- **Durable Objects：** 缓存优化（DOQueueHandler、DOShardedTagCache、BucketCachePurge）

### 环境变量

**Worker（生产环境密钥）：**

- `OPENAI_API_KEY` - OpenAI API 密钥
- `OPENAI_BASE_URL` - OpenAI API 基础 URL
- `OPENAI_MODEL` - OpenAI 模型名称（默认：gpt-4.1）
- `HACKER_PODCAST_WORKER_URL` - Worker 自引用 URL
- `HACKER_PODCAST_R2_BUCKET_URL` - 音频文件的 R2 存储桶 URL
- `JINA_KEY`（可选）- Jina AI API 密钥
- `FIRECRAWL_KEY`（可选）- Firecrawl API 密钥

**Next.js（生产环境）：**

- `NODE_ENV` - 环境（production/development）
- `NEXT_PUBLIC_BASE_URL` - Web 服务地址
- `NEXT_STATIC_HOST` - 静态资源主机（R2 存储桶 URL）

## 部署流程

1. **配置 Cloudflare 资源：**
   - 创建 R2 存储桶并绑定域名
   - 创建 KV 命名空间
   - 在 `wrangler.jsonc` 中更新资源 ID

2. **设置密钥：**

   ```bash
   pnpm wrangler secret put --cwd worker HACKER_PODCAST_WORKER_URL
   pnpm wrangler secret put --cwd worker HACKER_PODCAST_R2_BUCKET_URL
   pnpm wrangler secret put --cwd worker OPENAI_API_KEY
   pnpm wrangler secret put --cwd worker OPENAI_BASE_URL
   pnpm wrangler secret put --cwd worker OPENAI_MODEL

   pnpm wrangler secret put NODE_ENV
   pnpm wrangler secret put NEXT_PUBLIC_BASE_URL
   pnpm wrangler secret put NEXT_STATIC_HOST
   ```

3. **部署：**
   ```bash
   pnpm deploy:worker  # 部署 Worker
   pnpm deploy         # 部署 Next.js 应用
   ```

## 重要实现说明

- **本地 TTS 限制：** Edge TTS 转换在本地开发时可能会卡住。调试时建议注释掉 TTS 代码（README.md:82-83）
- **音频合并：** 需要 Cloudflare 的浏览器渲染，不支持本地测试。使用 `pnpm tests` 进行测试（README.md:83）
- **开发模式：** 只处理 3 篇文章（生产环境为 10 篇）以加快测试速度（workflow/index.ts:61）
- **内容提取备用方案：** 首先使用 Jina AI，失败时回退到 Firecrawl（workflow/utils.ts:68-78）
- **重试逻辑：** 所有工作流步骤都有 5 次重试和指数退避（workflow/index.ts:28-35）

## 开发最佳实践

### TypeScript

- 启用严格模式
- 使用接口进行类型检查
- 使用 Zod 进行运行时验证

### React/Next.js

- App Router 与 Server Components
- 使用 `getCloudflareContext` 进行服务端数据获取
- 适当的重新验证（首页 600 秒，文章页面 3600 秒）
- 错误边界和 notFound() 用于 404 页面

### UI/样式

- shadcn/ui 组件与 Tailwind CSS
- 实用优先的定制设计令牌方法
- 使用 Tailwind 修饰符实现响应式设计

### 代码质量

- 使用 @antfu/eslint-config 的 ESLint
- 通过 simple-git-hooks 实现的预提交钩子
- 构建期间忽略 TypeScript（next.config.mjs:14-15）
- 构建期间忽略 ESLint（next.config.mjs:11-12）

## 当前开发特性

强制执行以下最佳实践：

- 函数式组件和钩子
- Zod 进行运行时验证
- 使用 Tailwind 的实用优先 CSS
- Radix UI 用于可访问组件
- Lucide React 用于图标
- Cheerio 用于服务端 HTML 解析

## 测试

运行集成测试：

```bash
pnpm tests
```

本地测试 Worker 工作流：

```bash
pnpm dev:worker
curl -X POST http://localhost:8787
```

## 故障排除

- **Worker 未触发：** 检查 `worker/wrangler.jsonc:21-24` 中的 cron 计划
- **内容未加载：** 验证 `wrangler.jsonc` 中的 KV 和 R2 绑定
- **TTS 失败：** 检查 OPENAI_API_KEY 和 TTS 服务配置
- **构建错误：** 检查 `next.config.mjs` 中的 TypeScript 忽略标志
