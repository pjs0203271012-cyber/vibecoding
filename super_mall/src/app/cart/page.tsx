"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

/** 购物车条目类型 */
interface CartProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
}

interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct;
}

/** 购物车页面 */
export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** 获取购物车数据 */
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/login?redirect=/cart");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items);
      setTotalAmount(data.totalAmount);
    } catch {
      setError("加载购物车失败");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /** 修改数量 */
  async function updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return;
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "操作失败");
        return;
      }
      setError("");
      await fetchCart();
    } catch {
      setError("网络错误");
    } finally {
      setUpdatingId(null);
    }
  }

  /** 删除条目 */
  async function removeItem(itemId: string) {
    if (!confirm("确定要移除此商品吗？")) return;
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await fetchCart();
    } catch {
      setError("删除失败");
    } finally {
      setUpdatingId(null);
    }
  }

  /** 提交订单 */
  async function handleSubmitOrder() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "下单失败");
        return;
      }

      // 下单成功，跳转订单详情
      router.push(`/orders/${data.order.id}`);
    } catch {
      setError("网络错误");
    } finally {
      setSubmitting(false);
    }
  }

  /* ==================== 渲染 ==================== */

  // 加载中
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">购物车</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // 空购物车
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">购物车</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">购物车是空的</p>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        购物车（{items.length} 件）
      </h1>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
          <button onClick={() => setError("")} className="ml-2 hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* 商品列表 */}
      <div className="space-y-3">
        {items.map((item) => {
          const subtotal = item.product.price * item.quantity;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-center"
            >
              {/* 商品图片 */}
              <Link href={`/products/${item.product.id}`} className="shrink-0">
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </Link>

              {/* 商品名 + 单价 */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">
                  单价 ¥{item.product.price.toLocaleString()}
                </p>
                {/* 小计 */}
                <p className="text-sm font-medium text-red-600 mt-1">
                  小计 ¥{subtotal.toLocaleString()}
                </p>
              </div>

              {/* 数量控制 */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1 || updatingId === item.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {updatingId === item.id ? "..." : item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock || updatingId === item.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>

              {/* 删除按钮 */}
              <button
                onClick={() => removeItem(item.id)}
                disabled={updatingId === item.id}
                className="shrink-0 p-2 text-gray-400 hover:text-red-600 disabled:opacity-40 transition-colors"
                title="移除"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* 底部合计 + 提交 */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg text-gray-700">合计</span>
          <span className="text-2xl font-bold text-red-600">
            ¥{totalAmount.toLocaleString()}
          </span>
        </div>
        <button
          onClick={handleSubmitOrder}
          disabled={items.length === 0 || submitting}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "提交中..." : "提交订单"}
        </button>
      </div>
    </div>
  );
}
