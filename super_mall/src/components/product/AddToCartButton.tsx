"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** 加入购物车按钮 Props */
interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

/** 加入购物车按钮（客户端组件） */
export default function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleAddToCart() {
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push(`/login?redirect=/products/${productId}`);
        return;
      }

      if (!res.ok) {
        setError(true);
        setMessage(data.error || "加入购物车失败");
        return;
      }

      setMessage("已加入购物车");
    } catch {
      setError(true);
      setMessage("网络错误，请重试");
    } finally {
      setLoading(false);
      // 3 秒后自动清除消息
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div>
      <div className="flex gap-4">
        <button
          onClick={handleAddToCart}
          disabled={stock === 0 || loading}
          className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "添加中..." : stock === 0 ? "暂时缺货" : "加入购物车"}
        </button>
        <button
          onClick={() => router.push("/cart")}
          className="py-3 px-4 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
        >
          查看购物车
        </button>
      </div>

      {/* 操作反馈消息 */}
      {message && (
        <p
          className={`mt-2 text-sm ${error ? "text-red-600" : "text-green-600"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
