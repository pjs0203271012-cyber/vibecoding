# Mini Mall — 微型电商项目

## 项目概述

一个功能完整的微型电商系统，支持商品浏览、用户注册登录、购物车、下单结算、心悦会员折扣、后台管理。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.2.6 |
| 语言 | TypeScript | 5.9.3 |
| 运行时 | Node.js | 24.x |
| ORM | Prisma | 5.22.0 |
| 数据库 | SQLite (Prisma 内置) | — |
| CSS | TailwindCSS | 4.3.0 |
| 认证 | next-auth (Credentials Provider) | 4.24.14 |
| 表单 | React Hook Form + Zod | 7.77.0 + 3.25.76 |
| 密码哈希 | bcryptjs | 3.0.3 |

## 项目结构

```
mini_mall/
├── prisma/
│   ├── schema.prisma      # 数据模型定义
│   └── dev.db             # SQLite 数据库文件
├── src/
│   ├── app/               # Next.js App Router 页面
│   │   ├── layout.tsx     # 根布局
│   │   ├── page.tsx       # 首页（商品列表）
│   │   ├── globals.css    # 全局样式 + TailwindCSS
│   │   ├── products/      # 商品相关页面
│   │   ├── cart/          # 购物车页面
│   │   ├── orders/        # 订单页面
│   │   ├── checkout/      # 结算页面
│   │   ├── profile/       # 个人中心
│   │   ├── login/         # 登录页
│   │   ├── register/      # 注册页
│   │   ├── search/        # 搜索页
│   │   ├── admin/         # 后台管理
│   │   └── api/           # API 路由
│   ├── components/        # 公共组件
│   ├── lib/               # 工具函数（Prisma 客户端、认证配置）
│   └── types/             # TypeScript 类型定义
├── public/                # 静态资源
├── .env                   # 环境变量
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 常用命令

```bash
npm run dev          # 启动开发服务器 (localhost:3000)
npm run build        # 生产构建
npm start            # 启动生产服务器
npx prisma studio    # 打开 Prisma 数据库管理界面
npx prisma db push   # 同步 schema 到数据库
npx prisma generate  # 重新生成 Prisma Client
```

## 数据模型

### User — 用户
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| email | String (unique) | 邮箱 |
| password | String | bcrypt 哈希密码 |
| name | String | 昵称 |
| role | String | USER / ADMIN |
| totalSpent | Float | 累计消费金额 |
| membershipLevel | Int | 心悦等级：0=普通, 1=心悦1, 2=心悦2, 3=心悦3 |
| createdAt | DateTime | 注册时间 |

### Category — 商品分类
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| name | String (unique) | 分类名称 |
| slug | String (unique) | URL 友好标识 |
| createdAt | DateTime | 创建时间 |

### Product — 商品
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| name | String | 商品名称 |
| description | String | 商品描述 |
| price | Float | 价格（元） |
| imageUrl | String | 图片 URL |
| stock | Int | 库存 |
| categoryId | String | 归属分类（外键） |
| createdAt | DateTime | 创建时间 |

### CartItem — 购物车条目
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| userId | String | 用户（外键，级联删除） |
| productId | String | 商品（外键，级联删除） |
| quantity | Int | 数量，默认 1 |
| — | @@unique([userId, productId]) | 同一用户同一商品唯一 |

### Order — 订单
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| userId | String | 用户（外键） |
| totalAmount | Float | 商品原价合计 |
| discountRate | Float | 下单时折扣率（1.0=原价, 0.98=9.8折） |
| finalAmount | Float | 折扣后实付金额 |
| status | String | PENDING / PAID / SHIPPED / COMPLETED / CANCELLED |
| createdAt | DateTime | 下单时间 |

### OrderItem — 订单明细
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (cuid) | 主键 |
| orderId | String | 订单（外键，级联删除） |
| productId | String | 商品（外键） |
| quantity | Int | 数量 |
| price | Float | 下单时商品单价（快照） |

## 心悦会员体系

用户累计消费达到门槛后自动升级，下单时按当前等级享受折扣。

| 等级 | 累计消费门槛 | 折扣率 | 折扣描述 |
|------|-------------|--------|---------|
| 0 — 普通 | 默认 | 1.00 | 原价 |
| 1 — 心悦1 | ¥8,000 | 0.98 | 9.8 折 |
| 2 — 心悦2 | ¥80,000 | 0.95 | 9.5 折 |
| 3 — 心悦3 | ¥800,000 | 0.90 | 9 折 |

**升级规则**：订单支付成功后，累加 `finalAmount` 到 `User.totalSpent`，然后根据总消费金额判定 `membershipLevel`。
**折扣计算**：`finalAmount = totalAmount × discountRate`，保留两位小数。

## 路由设计

| 路由 | 说明 | 权限 |
|------|------|------|
| `/` | 首页，商品列表 | 公开 |
| `/products/[id]` | 商品详情 | 公开 |
| `/search` | 搜索页 | 公开 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/cart` | 购物车 | 需登录 |
| `/checkout` | 结算页，显示会员折扣 | 需登录 |
| `/orders` | 我的订单 | 需登录 |
| `/orders/[id]` | 订单详情 | 需登录 |
| `/profile` | 个人中心，显示等级和累计消费 | 需登录 |
| `/admin` | 后台首页 | ADMIN |
| `/admin/products` | 商品管理 CRUD | ADMIN |
| `/admin/orders` | 订单管理 | ADMIN |
| `/admin/categories` | 分类管理 CRUD | ADMIN |

## 认证方案

- 使用 **next-auth Credentials Provider**（邮箱 + 密码）
- 密码用 `bcryptjs` 哈希存储
- Session 策略：**JWT**（默认），存在数据库 Session 表
- 通过 `getServerSession()` 在 Server Component / API Route 中获取用户
- 通过中间件 `middleware.ts` 保护需登录路由和 Admin 路由
- Prisma Adapter 管理 Session/Account 表

## 编码约定

### 文件命名
- 组件文件：`PascalCase.tsx`（如 `ProductCard.tsx`）
- 工具函数：`camelCase.ts`（如 `prisma.ts`、`auth.ts`）
- 类型定义：`camelCase.ts`（如 `types.ts`）

### 组件组织
- 按功能模块拆分：`components/product/`、`components/cart/`、`components/admin/`
- 页面逻辑留在 `app/` 对应路由下
- 可复用的 UI 放在 `components/ui/`

### 数据访问
- Prisma Client 单例：`src/lib/prisma.ts`
- 所有数据库操作通过 API Route 或 Server Action，不在客户端直接调用 Prisma
- API Route 返回 JSON，使用 Next.js Route Handler 格式

### 样式
- 全部使用 TailwindCSS 4 utility classes
- 不写自定义 CSS（除 `globals.css` 中的基础变量）
- 响应式：移动优先，`sm:` / `md:` / `lg:` 断点

### TypeScript
- strict mode
- 所有 props 定义 interface
- 使用 `@/` 路径别名导入

<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
