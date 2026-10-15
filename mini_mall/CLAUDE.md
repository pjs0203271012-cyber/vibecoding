# Mini Mall 迷你商城 · 项目指南

用 **Next.js 16 + TypeScript + Prisma 5 + SQLite + TailwindCSS 4** 构建的微型电商项目。功能：商品浏览（列表/详情/搜索/分类筛选）、用户注册登录、购物车、下单与模拟支付、后台管理（商品/分类/订单）。

## 常用命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 启动开发服务器（Turbopack，端口 3000；被占用时自动换 3001） |
| `npm run build` | 生产构建（含 TypeScript 类型检查） |
| `npx prisma migrate dev` | 修改 schema 后同步数据库结构（会自动执行 seed） |
| `npx prisma db seed` | 灌入种子数据（可重复执行，幂等） |
| `npx prisma studio` | 数据库可视化界面 |
| `npx tsc --noEmit` | 单独跑类型检查 |

种子账号：管理员 `admin@example.com / admin123`，普通用户 `demo@example.com / demo123`。
⚠️ 修改 `prisma/schema.prisma` 后必须重新 migrate + generate，dev 热重载不感知 schema 变化。

## 技术栈版本注意点（本机已验证）

- **Next.js 16**：`params` / `searchParams` / `cookies()` 都是 Promise，必须 `await`；`middleware.ts` 已弃用，路由守卫在 `src/proxy.ts`（导出 `proxy` 函数）；页面里的 `redirect()` 在 dev 下通过 meta-refresh 客户端跳转实现（curl 看到 200 + NEXT_REDIRECT 是正常现象，不是 bug）
- **Prisma 5 + SQLite**：不支持 enum（6.2 才支持）→ 角色/订单状态用 String + `as const` 常量（见 `src/lib/constants.ts`）
- **TailwindCSS 4**：CSS-first 配置，无 tailwind.config.js；主题在 `src/app/globals.css` 的 `@theme` 里；⚠️ 本机自动源检测失效，`@source "../.."` 指令不能删，否则生成 0 个工具类
- **npm 11**：`package.json` 里的 `allowScripts` 白名单是安装依赖（sharp/Prisma）必需的，不要删
- 价格用 **Int 存「分」**（¥12.99 → 1299），显示用 `formatPrice()` 转回元，禁止用 Float/Decimal

## 目录结构与分层原则

```
src/
├── proxy.ts               # 路由守卫（拦截 /cart /checkout /orders /admin）
├── app/
│   ├── (shop)/            # 前台页面（首页/详情/购物车/结算/订单/登录/注册）
│   ├── admin/             # 后台页面（仪表盘/商品/分类/订单）
│   └── api/auth/          # 仅认证用 Route Handler（注册/登录/登出）
├── components/            # 可复用 UI，按业务分组（layout/product/cart/order/admin）
└── lib/
    ├── prisma.ts          # PrismaClient 单例（globalThis 防热重载多实例）
    ├── auth.ts            # JWT 签发/验证、getSession/requireUser/requireAdmin
    ├── constants.ts       # 角色、订单状态常量 + 状态机流转表（唯一权威定义）
    ├── utils.ts           # formatPrice、generateOrderNo、formatDateTime
    └── actions/           # 全部 Server Actions，按业务拆分（cart/order/admin-*）
```

- `app/` 只放页面（取数据 + 渲染），不写业务逻辑
- `lib/actions/` 放所有写库操作，每个文件顶部 `"use server"`
- `components/` 默认服务端组件；需要 onClick/useState 的才加 `"use client"`
- 读数据（商品列表/详情等）直接 Server Component 查 Prisma，不建 API
- 登录/注册用 Route Handler（精确控制 Cookie）；购物车/下单/后台 CRUD 用 Server Actions（表单 `<form action>` + `useActionState`）

## 核心设计决策（改动前必读）

1. **订单条目是商品快照**（`OrderItem` 无外键）：下单时复制商品名/图片/价格，之后商品改价/删除不影响历史订单
2. **订单状态机**：`PENDING → PAID → SHIPPED → COMPLETED`，`PENDING → CANCELLED`。唯一权威定义是 `constants.ts` 的 `ORDER_STATUS_FLOW`——页面按钮显隐、Action 校验都查它，改状态机只改这一处
3. **下单在事务内**：创建订单 + 写快照条目 + 清空购物车，金额服务端从数据库实时计算，绝不信任前端
4. **购物车去重**：`@@unique([userId, productId])` + upsert，重复加购只累加数量

## 安全铁律

- **每个 Server Action / Route Handler 第一行鉴权**：`requireUser()` / `requireAdmin()`（后台用后者）。Action 是独立 HTTP 入口，这是真正的安全边界；proxy.ts 只是体验层
- 状态类操作的 `updateMany` where 同时带 `id + userId + status`——一条语句防越权 + 防重复操作
- 密码 bcrypt 哈希（bcryptjs），`passwordHash` 绝不进 JWT / 返回前端；登录失败统一提示「邮箱或密码错误」
- `JWT_SECRET` 在 `.env`（已 gitignore），模板见 `.env.example`

## 代码风格

- 中文注释，解释「为什么」而不是「做了什么」
- 组件/页面拆分保持小而专一；新增 Action 按业务放进 `lib/actions/` 对应文件
- 表单校验在服务端 Action 里做一遍（前端校验只是体验）
