"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/** 订单列表项类型 */
interface OrderItemSummary {
  id: string;
  product: { id: string; name: string; imageUrl: string };
  quantity: number;
  price: number;
}

interface OrderSummary {
  id: string;
  totalAmount: number;
  discountRate: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItemSummary[];
}

import { STATUS_LABELS, STATUS_COLORS } from "@/lib/orders";

/** 订单列表页 */
export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        router.push("/login?redirect=/orders");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders);
    } catch {
      /* 静默失败 */
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">我的订单</h1>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">我的订单</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">暂无订单</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            去逛逛
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">我的订单</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const label = STATUS_LABELS[order.status] || order.status;
          const color = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-md transition-all"
            >
              {/* 订单头部：编号 + 状态 */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-mono">
                  {order.id.slice(-8).toUpperCase()}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                  {label}
                </span>
              </div>

              {/* 商品预览（最多 3 个） */}
              <div className="flex gap-2 mb-3">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {/* 商品图片用 img 标签，避免 next/image 服务端问题 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500 shrink-0">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              {/* 底部：金额 + 时间 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-900 font-medium">
                  {order.discountRate < 1 && (
                    <span className="text-gray-400 line-through mr-1 text-xs">
                      ¥{order.totalAmount.toLocaleString()}
                    </span>
                  )}
                  ¥{order.finalAmount.toLocaleString()}
                </span>
                <span className="text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
