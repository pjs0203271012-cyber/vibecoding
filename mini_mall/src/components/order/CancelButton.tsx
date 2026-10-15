"use client";

// 取消订单按钮（客户端组件）：点击调用 cancelOrder Server Action
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/lib/actions/order";

export default function CancelButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    // 先弹确认框，避免误触
    if (!window.confirm("确定要取消这个订单吗？")) return;
    setMessage("");
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if ("error" in result) {
        setMessage(`❌ ${result.error}`);
      } else {
        router.refresh(); // 取消成功后刷新页面
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleCancel}
        disabled={pending}
        className="rounded-xl border border-gray-300 px-6 py-2.5 text-gray-600 hover:border-red-400 hover:text-red-600 disabled:opacity-60"
      >
        取消订单
      </button>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
