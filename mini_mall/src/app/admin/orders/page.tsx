import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS, type OrderStatus } from "@/lib/constants";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";

export const metadata = { title: "订单管理" };

// 后台订单管理列表页：支持按状态筛选（?status=）
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  // 校验筛选值是否合法（防止任意字符串进查询）
  const statusFilter = Object.values(ORDER_STATUS).includes(sp.status as OrderStatus)
    ? sp.status
    : "";

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter } : {},
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  // 筛选按钮：全部 + 五种状态
  const filterItems = [
    { value: "", label: "全部" },
    { value: ORDER_STATUS.PENDING, label: "待支付" },
    { value: ORDER_STATUS.PAID, label: "已支付" },
    { value: ORDER_STATUS.SHIPPED, label: "已发货" },
    { value: ORDER_STATUS.COMPLETED, label: "已完成" },
    { value: ORDER_STATUS.CANCELLED, label: "已取消" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">订单管理</h1>
      </div>

      {/* 状态筛选栏（GET 链接，状态体现在 URL 上） */}
      <div className="flex flex-wrap gap-2">
        {filterItems.map((item) => (
          <Link
            key={item.value}
            href={item.value ? `/admin/orders?status=${item.value}` : "/admin/orders"}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              statusFilter === item.value
                ? "bg-brand-600 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* 订单表格 */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-400">
              <th className="px-4 py-3 font-normal">订单号</th>
              <th className="px-4 py-3 font-normal">用户</th>
              <th className="px-4 py-3 font-normal">金额</th>
              <th className="px-4 py-3 font-normal">状态</th>
              <th className="px-4 py-3 font-normal">下单时间</th>
              <th className="px-4 py-3 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  暂无订单
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{order.orderNo}</td>
                <td className="px-4 py-3">
                  <p>{order.user.name}</p>
                  <p className="text-xs text-gray-400">{order.user.email}</p>
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatPrice(order.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    查看详情
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
