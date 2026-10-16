/**
 * 订单模块共享常量与工具
 * 供用户端 API (/api/orders) 和管理端 API (/api/admin/orders) 共同引用
 */

/** 订单状态允许的转换映射 */
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

/** 订单状态中文标签 */
export const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

/** 订单状态颜色映射（前端使用） */
export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

/** 根据状态码返回中文标签 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

/** 订单业务异常 */
export class OrderError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "OrderError";
    this.statusCode = statusCode;
  }
}
