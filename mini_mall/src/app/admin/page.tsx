import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";

export const metadata = { title: "仪表盘" };

// 后台仪表盘：4 张统计卡 + 最近 5 笔订单
export default async function AdminDashboardPage() {
  // 并行查询各项统计数据（Promise.all 同时执行，互不等待）
  const [productCount, orderCount, paidAgg, pendingShipCount, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      // 销售额 = 已支付/已发货/已完成订单的金额合计（待支付、已取消不计入）
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: [ORDER_STATUS.PAID, ORDER_STATUS.SHIPPED, ORDER_STATUS.COMPLETED] },
        },
      }),
      // 待发货 = 已支付但还没发货的订单数
      prisma.order.count({ where: { status: ORDER_STATUS.PAID } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: true },
      }),
    ]);

  // 统计卡片配置
  const stats = [
    { label: "商品总数", value: String(productCount) },
    { label: "订单总数", value: String(orderCount) },
    { label: "销售额", value: formatPrice(paidAgg._sum.totalAmount ?? 0) },
    { label: "待发货", value: String(pendingShipCount) },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 最近订单 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">最近订单</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-brand-600 hover:underline"
          >
            查看全部 →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">暂无订单</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-400">
                <th className="pb-2 font-normal">订单号</th>
                <th className="pb-2 font-normal">用户</th>
                <th className="pb-2 font-normal">金额</th>
                <th className="pb-2 font-normal">状态</th>
                <th className="pb-2 font-normal">时间</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50">
                  <td className="py-2.5 font-mono text-xs">{order.orderNo}</td>
                  <td className="py-2.5">{order.user.name}</td>
                  <td className="py-2.5">{formatPrice(order.totalAmount)}</td>
                  <td className="py-2.5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-2.5 text-gray-400">
                    {formatDateTime(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
