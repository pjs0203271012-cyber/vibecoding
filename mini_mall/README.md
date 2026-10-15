# 🛍️ Mini Mall 迷你商城

一个用 **Next.js 16 + TypeScript + Prisma 5 + SQLite + TailwindCSS 4** 构建的微型电商学习项目，包含完整的商品浏览、用户认证、购物车、下单支付（模拟）和后台管理功能。

## 功能一览

**前台（顾客端）**
- 🛒 商品浏览：列表、详情、关键词搜索、分类筛选
- 👤 注册 / 登录（JWT + httpOnly Cookie，密码 bcrypt 加密）
- 🧺 购物车：加购、改数量、删除（登录后可用，数据存数据库）
- 📦 下单与订单管理：收货信息、订单快照、模拟支付、取消订单

**后台（管理员端）**
- 📊 仪表盘：商品数 / 订单数 / 销售额 / 待发货统计 + 最近订单
- 📦 商品管理：增删改查、搜索、价格「元→分」自动转换
- 🏷️ 分类管理：增删改（有商品的分类禁止删除）
- 📋 订单管理：状态筛选、发货、完成订单

## 快速开始

```bash
# 1. 安装依赖（.npmrc 已配置 npmmirror 国内镜像）
npm install

# 2. 配置环境变量：复制 .env.example 为 .env
#    DATABASE_URL 保持默认即可；
#    JWT_SECRET 用下面命令生成一个随机密钥填入：
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. 创建数据库表结构
npx prisma migrate dev --name init

# 4. 灌入种子数据（自动执行；之后可手动重跑 npx prisma db seed）
#    npm run dev 启动后访问 http://localhost:3000
npm run dev
```

## 演示账号

| 账号 | 密码 | 角色 |
|---|---|---|
| admin@example.com | admin123 | 管理员（可进 /admin 后台） |
| demo@example.com | demo123 | 普通用户 |

种子数据还包含 4 个分类（数码家电 / 服装鞋包 / 家居生活 / 食品饮料）和 12 个示例商品。

## 常用命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npx prisma migrate dev` | 修改 schema 后同步数据库结构 |
| `npx prisma db seed` | 灌入种子数据 |
| `npx prisma studio` | 打开数据库可视化界面 |

⚠️ 修改 `prisma/schema.prisma` 后必须重新 `migrate` + `generate`，开发服务器不会自动感知 schema 变化。

## 项目结构

```
src/
├── proxy.ts                 # 路由守卫（Next 16 起替代 middleware.ts）
├── app/
│   ├── (shop)/              # 前台页面（首页/详情/购物车/结算/订单/登录/注册）
│   ├── admin/               # 后台页面（仪表盘/商品/分类/订单）
│   └── api/auth/            # 认证接口（注册/登录/登出）
├── components/              # 可复用 UI 组件（按业务分组）
└── lib/
    ├── prisma.ts            # PrismaClient 单例
    ├── auth.ts              # JWT 签发/验证、getSession/requireUser/requireAdmin
    ├── constants.ts         # 角色、订单状态常量 + 状态机流转表
    ├── utils.ts             # formatPrice（分→元）、订单号生成等
    └── actions/             # 全部 Server Actions（按业务拆分）
```

分层原则：`app/` 只放页面（取数 + 渲染），`lib/actions/` 只放写库操作，`components/` 只放可复用 UI。

## 核心设计说明

- **价格用 Int 存「分」**：避免浮点误差（¥12.99 存 1299），显示时用 `formatPrice` 转回元
- **订单条目是商品快照**：下单时复制商品名/图片/价格，之后商品改价或删除不影响历史订单
- **订单状态机**：`待支付 → 已支付 → 已发货 → 已完成`（待支付可取消）。唯一权威定义在 `src/lib/constants.ts` 的 `ORDER_STATUS_FLOW`，页面按钮显隐和接口校验都查它
- **三层安全防护**：① `proxy.ts` 路由守卫拦未登录/非管理员访问；② 页面内 `requireUser`/`requireAdmin` 二次校验；③ 每个 Server Action 第一行鉴权（真正的安全边界）
- **金额永远服务端计算**：下单总价从数据库实时计算，绝不信任前端
- **角色/状态用 String 存**：Prisma 5 的 SQLite 不支持 enum，配合 `as const` 常量获得 TypeScript 类型安全

## 技术栈版本说明

- Next.js 16（App Router + Turbopack，`middleware.ts` 已弃用改用 `proxy.ts`）
- TailwindCSS 4（CSS-first 配置，无 `tailwind.config.js`，主题在 `globals.css` 的 `@theme` 里）
- Prisma 5.22（SQLite）
- jose（JWT）、bcryptjs（密码哈希）
