"use client";

import { useState, useEffect, useCallback } from "react";

import { STATUS_LABELS, STATUS_COLORS } from "@/lib/orders";

interface OrderItem { id: string; product: { id: string; name: string }; quantity: number; price: number; }
interface Order { id: string; totalAmount: number; discountRate: number; finalAmount: number; status: string; createdAt: string; items: OrderItem[]; user: { id: string; name: string; email: string }; }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (res.status === 401 || res.status === 403) { setError("需要管理员权限"); setLoading(false); return; }
    const data = await res.json();
    setOrders(data.orders);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateStatus(orderId: string, newStatus: string) {
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "操作失败"); return; }
      setMessage("状态已更新");
      fetchOrders();
      setTimeout(() => setMessage(""), 3000);
    } catch { setError("网络错误"); }
  }

  if (loading) return <div className="p-6"><div className="h-64 bg-gray-200 rounded-xl animate-pulse" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">订单管理</h1>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}<button onClick={() => setError("")} className="ml-2">✕</button></div>}
      {message && <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{message}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">订单编号</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">用户</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">金额</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">状态</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">时间</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.user.name}</div>
                    <div className="text-xs text-gray-400">{o.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {o.discountRate < 1 && <span className="text-gray-400 line-through text-xs mr-1">¥{o.totalAmount.toLocaleString()}</span>}
                    <span className="font-medium">¥{o.finalAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleString("zh-CN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      {o.status === "PENDING" && (
                        <button onClick={() => updateStatus(o.id, "PAID")} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">设为已支付</button>
                      )}
                      {o.status === "PAID" && (
                        <button onClick={() => updateStatus(o.id, "SHIPPED")} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200">设为已发货</button>
                      )}
                      {(o.status === "PENDING" || o.status === "PAID" || o.status === "SHIPPED") && (
                        <button onClick={() => updateStatus(o.id, "CANCELLED")} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">取消</button>
                      )}
                      <button onClick={() => setExpandedId(expandedId === o.id ? null : o.id)} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">
                        {expandedId === o.id ? "收起" : "详情"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">暂无订单</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 展开的订单详情 */}
        {expandedId && (() => {
          const o = orders.find((x) => x.id === expandedId);
          if (!o) return null;
          return (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">订单明细</h4>
              <div className="space-y-1 text-sm">
                {o.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
