import { ORDER_STATUS, ORDER_STATUS_TEXT, type OrderStatus } from "@/lib/constants";

// 订单状态徽章：不同状态显示不同颜色
const STATUS_COLOR: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: "bg-amber-100 text-amber-700", // 待支付：黄色
  [ORDER_STATUS.PAID]: "bg-blue-100 text-blue-700", // 已支付：蓝色
  [ORDER_STATUS.SHIPPED]: "bg-purple-100 text-purple-700", // 已发货：紫色
  [ORDER_STATUS.COMPLETED]: "bg-green-100 text-green-700", // 已完成：绿色
  [ORDER_STATUS.CANCELLED]: "bg-gray-100 text-gray-500", // 已取消：灰色
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const s = status as OrderStatus;
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[s] ?? STATUS_COLOR[ORDER_STATUS.PENDING]}`}
    >
      {ORDER_STATUS_TEXT[s] ?? status}
    </span>
  );
}
