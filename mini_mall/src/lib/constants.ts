// ============================================================
// 全局常量：角色、订单状态、状态机流转表
// 因为 Prisma 5 的 SQLite 不支持 enum，数据库里存 String，
// 这里的 as const 对象提供 TypeScript 编译期类型约束。
// ============================================================

// ---------- 用户角色 ----------
export const ROLE = {
  CUSTOMER: "CUSTOMER", // 普通用户
  ADMIN: "ADMIN", // 管理员
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

// ---------- 订单状态 ----------
export const ORDER_STATUS = {
  PENDING: "PENDING", // 待支付
  PAID: "PAID", // 已支付
  SHIPPED: "SHIPPED", // 已发货
  COMPLETED: "COMPLETED", // 已完成
  CANCELLED: "CANCELLED", // 已取消
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// 状态的中文文案（页面上直接查表显示）
export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
  PENDING: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

// ---------- 订单状态机（唯一权威定义） ----------
// 每个状态允许到达的「下一个状态」列表。
// 页面按钮的显隐、Server Action 的校验都查这张表，
// 状态机只写一处，永远不会出现「页面和逻辑对不上」。
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED], // 待支付：可支付、可取消
  PAID: [ORDER_STATUS.SHIPPED], // 已支付：管理员可发货
  SHIPPED: [ORDER_STATUS.COMPLETED], // 已发货：管理员可完成
  COMPLETED: [], // 终态
  CANCELLED: [], // 终态
};
