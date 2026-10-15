import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";

export const metadata = { title: "我的订单" };

// 我的订单列表页（服务端组件）
export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.userId },
    include: {
      items: true, // 列表页显示首件商品图
    },
    orderBy: { createdAt: "desc" },
  });

  // 空状态
  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-gray-400">
        <p className="text-5xl">📦</p>
        <p className="mt-4">还没有订单</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">我的订单</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            {/* 第一行：订单号 + 状态 */}
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="mr-3 font-mono">订单号 {order.orderNo}</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {/* 第二行：商品图 + 金额 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {/* 最多显示 3 个商品缩略图 */}
                {order.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-xs text-gray-400"
                  >
                    {item.productImage ? (
                      // 用普通 img 标签：订单快照图无需 next/image 优化
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
                ))}
                {order.items.length > 3 && (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-400">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium text-brand-600">
                  {formatPrice(order.totalAmount)}
                </p>
                {order.status === ORDER_STATUS.PENDING && (
                  <p className="mt-1 text-xs text-amber-600">待支付，点击去支付</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
