import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS, ORDER_STATUS_TEXT, type OrderStatus } from "@/lib/constants";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import PayButton from "@/components/order/PayButton";
import CancelButton from "@/components/order/CancelButton";

export const metadata = { title: "订单详情" };

// 订单详情页（服务端组件）
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const orderId = Number(id);
  if (Number.isNaN(orderId)) notFound();

  // 查订单：where 里限定 userId，别人的订单直接 404（不泄露存在性）
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.userId !== user.userId) notFound();

  const status = order.status as OrderStatus;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/orders"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-brand-600"
      >
        ← 返回订单列表
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* 订单头部：订单号 + 状态 */}
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

        {/* 订单状态提示语 */}
        <p className="mb-6 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          当前状态：{ORDER_STATUS_TEXT[status]}
          {status === ORDER_STATUS.PENDING && "，请尽快完成支付"}
          {status === ORDER_STATUS.PAID && "，等待商家发货"}
          {status === ORDER_STATUS.SHIPPED && "，商品已发出，请注意查收"}
          {status === ORDER_STATUS.COMPLETED && "，交易已完成，感谢购买！"}
          {status === ORDER_STATUS.CANCELLED && "，订单已取消"}
        </p>

        {/* 商品快照列表 */}
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
              <p className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </p>
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

        {/* 金额 + 操作按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <p className="text-gray-600">
            实付金额：
            <span className="text-2xl font-bold text-brand-600">
              {formatPrice(order.totalAmount)}
            </span>
            {order.paidAt && (
              <span className="ml-3 text-xs text-gray-400">
                支付时间 {formatDateTime(order.paidAt)}
              </span>
            )}
          </p>

          {/* 只有待支付订单显示支付/取消按钮（状态机驱动按钮显隐） */}
          {status === ORDER_STATUS.PENDING && (
            <div className="flex gap-3">
              <CancelButton orderId={order.id} />
              <PayButton orderId={order.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
