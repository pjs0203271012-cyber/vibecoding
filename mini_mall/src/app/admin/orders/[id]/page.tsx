import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import {
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_TEXT,
  type OrderStatus,
} from "@/lib/constants";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import AdminOrderStatusButtons, {
  type Transition,
} from "@/components/admin/AdminOrderStatusButtons";

export const metadata = { title: "订单详情" };

// 后台订单详情页：完整订单信息 + 状态流转操作
export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (Number.isNaN(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: true },
  });
  if (!order) notFound();

  const status = order.status as OrderStatus;

  // ---------- 根据状态机流转表生成允许的操作按钮 ----------
  // 按钮显隐的「唯一权威」是 lib/constants.ts 里的 ORDER_STATUS_FLOW
  const nextStatuses = ORDER_STATUS_FLOW[status];
  const transitions: Transition[] = nextStatuses.map((to) => {
    switch (to) {
      case ORDER_STATUS.SHIPPED:
        return { to, label: "🚚 发货", confirmText: "确认已发货吗？" };
      case ORDER_STATUS.COMPLETED:
        return { to, label: "✅ 完成订单", confirmText: "确认订单已完成吗？" };
      case ORDER_STATUS.CANCELLED:
        return { to, label: "取消订单", confirmText: "确定要取消这个订单吗？" };
      default:
        return {
          to,
          label: `变更为「${ORDER_STATUS_TEXT[to]}」`,
          confirmText: "确认执行此操作吗？",
        };
    }
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/orders"
        className="inline-block text-sm text-gray-500 hover:text-brand-600"
      >
        ← 返回订单列表
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* 订单头部 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-xl font-bold">订单详情</h1>
            <p className="mt-1 text-sm text-gray-400">
              订单号 <span className="font-mono">{order.orderNo}</span> ·{" "}
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* 下单用户信息 */}
        <h2 className="mb-3 font-semibold">下单用户</h2>
        <div className="mb-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p>
            {order.user.name}（{order.user.email}）
          </p>
        </div>

        {/* 商品清单 */}
        <h2 className="mb-3 font-semibold">商品清单</h2>
        <div className="mb-6 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-2xl">
                {item.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "🛍️"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.productName}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* 收货信息 */}
        <h2 className="mb-3 font-semibold">收货信息</h2>
        <div className="mb-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p>
            {order.receiverName}（{order.receiverPhone}）
          </p>
          <p className="mt-1">{order.address}</p>
          {order.remark && <p className="mt-1 text-gray-400">备注：{order.remark}</p>}
        </div>

        {/* 金额 + 状态流转操作 */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-gray-600">
              订单金额：
              <span className="text-2xl font-bold text-brand-600">
                {formatPrice(order.totalAmount)}
              </span>
            </p>
            {order.paidAt && (
              <p className="mt-1 text-xs text-gray-400">
                支付时间 {formatDateTime(order.paidAt)}
              </p>
            )}
          </div>
          {/* 状态流转按钮：由状态机决定显示哪些操作 */}
          <AdminOrderStatusButtons orderId={order.id} transitions={transitions} />
        </div>
      </div>
    </div>
  );
}
