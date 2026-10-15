"use client";

// 加入购物车按钮 + 数量选择器（客户端组件）：点击后调用 Server Action
import { useState, useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";

export default function AddToCartButton({ productId }: { productId: number }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  // useTransition：请求进行中 pending 为 true，用于按钮禁用和文案
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    setMessage("");
    startTransition(async () => {
      // 调用 Server Action（未登录时 Action 内部会 redirect 到登录页）
      const result = await addToCart(productId, quantity);
      if ("error" in result) {
        setMessage(`❌ ${result.error}`);
      } else {
        setMessage(`✅ 已加入购物车 ${quantity} 件`);
      }
    });
  }

  const quantityBtnClass =
    "h-9 w-9 rounded-lg border border-gray-300 text-gray-600 hover:border-brand-500 hover:text-brand-600 disabled:opacity-50";

  return (
    <div className="space-y-4">
      {/* 数量选择器 */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">数量</span>
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className={quantityBtnClass}
        >
          −
        </button>
        <span className="w-10 text-center font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(99, q + 1))}
          className={quantityBtnClass}
        >
          +
        </button>
        <span className="text-xs text-gray-400">库存充足</span>
      </div>

      {/* 加购按钮 */}
      <button
        onClick={handleAdd}
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60 md:w-auto md:px-10"
      >
        {pending ? "加入中…" : "加入购物车"}
      </button>

      {/* 操作结果提示 */}
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
