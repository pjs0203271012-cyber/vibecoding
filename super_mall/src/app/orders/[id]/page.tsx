"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getMembershipName } from "@/lib/membership";

/** 订单详情类型 */
interface OrderItemDetail {
  id: string;
  product: { id: string; name: string; imageUrl: string };
  quantity: number;
  price: number;
}

interface OrderDetail {
  id: string;
  totalAmount: number;
  discountRate: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItemDetail[];
  user?: { name: string };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

/** 订单详情页 */
export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.status === 401) {
        router.push(`/login?redirect=/orders/${orderId}`);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrder(data.order);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  /** 执行订单操作（支付/取消等） */
  async function updateStatus(newStatus: string, label: string) {
    if (label === "取消订单" && !confirm("确定要取消此订单吗？")) return;

    setActionLoading(label);
    setMessage("");
    setError(false);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(true);
        setMessage(data.error || "操作失败");
        return;
      }

      setOrder(data.order);
      setMessage(label + "成功");
    } catch {
      setError(true);
      setMessage("网络错误");
    } finally {
      setActionLoading("");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  /** 渲染订单操作按钮 */
  function renderActions() {
    if (!order) return null;

    const buttons: { label: string; status: string; style: string }[] = [];

    if (order.status === "PENDING") {
      buttons.push({ label: "模拟支付", status: "PAID", style: "bg-green-600 hover:bg-green-700" });
      buttons.push({ label: "取消订单", status: "CANCELLED", style: "bg-gray-500 hover:bg-gray-600" });
    } else if (order.status === "PAID") {
      buttons.push({ label: "取消订单", status: "CANCELLED", style: "bg-gray-500 hover:bg-gray-600" });
    }

    if (buttons.length === 0) return null;

    return (
      <div className="mt-6 flex flex-wrap gap-3">
        {buttons.map((btn) => (
          <button
            key={btn.status}
            onClick={() => updateStatus(btn.status, btn.label)}
            disabled={actionLoading !== ""}
            className={`px-6 py-2 text-white font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${btn.style}`}
          >
            {actionLoading === btn.label ? "处理中..." : btn.label}
          </button>
        ))}
      </div>
    );
  }

  /* ==================== 渲染 ==================== */

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">订单详情</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-lg">订单不存在</p>
          <Link href="/orders" className="mt-4 inline-block text-blue-600 hover:underline">
            返回订单列表
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = STATUS_LABELS[order.status] || order.status;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">首页</Link>
        <span>/</span>
        <Link href="/orders" className="hover:text-blue-600">我的订单</Link>
        <span>/</span>
        <span className="text-gray-900">{order.id.slice(-8).toUpperCase()}</span>
      </nav>

      {/* 订单状态标题 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
        <span className="text-sm font-medium text-gray-500">{statusLabel}</span>
      </div>

      {/* 操作反馈 */}
      {message && (
        <div className={`mb-4 text-sm px-4 py-2 rounded-lg ${
          error ? "text-red-600 bg-red-50 border border-red-200" : "text-green-600 bg-green-50 border border-green-200"
        }`}>
          {message}
        </div>
      )}

      {/* 商品明细 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-600">商品明细</span>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 items-center">
              {/* 图片 */}
              <Link href={`/products/${item.product.id}`} className="shrink-0">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              {/* 名称 + 数量 + 单价 */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">
                  ¥{item.price.toLocaleString()} × {item.quantity}
                </p>
              </div>

              {/* 小计 */}
              <span className="font-medium text-gray-900">
                ¥{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* 金额汇总 */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 space-y-1 text-sm">
          {order.discountRate < 1 && (
            <>
              <div className="flex justify-between text-gray-500">
                <span>原价合计</span>
                <span>¥{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>会员折扣</span>
                <span>{(order.discountRate * 10).toFixed(1)} 折</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>实付金额</span>
            <span className="text-red-600">¥{order.finalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 订单信息 */}
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 space-y-1 text-sm text-gray-500">
        <div className="flex justify-between">
          <span>订单编号</span>
          <span className="font-mono">{order.id}</span>
        </div>
        <div className="flex justify-between">
          <span>下单时间</span>
          <span>{new Date(order.createdAt).toLocaleString("zh-CN")}</span>
        </div>
        <div className="flex justify-between">
          <span>订单状态</span>
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      {renderActions()}
    </div>
  );
}
