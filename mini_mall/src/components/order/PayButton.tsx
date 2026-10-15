"use client";

// 模拟支付按钮（客户端组件）：点击调用 payOrder Server Action
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { payOrder } from "@/lib/actions/order";

export default function PayButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handlePay() {
    setMessage("");
    startTransition(async () => {
      const result = await payOrder(orderId);
      if ("error" in result) {
        setMessage(`❌ ${result.error}`);
      } else {
        // 支付成功后刷新页面（状态徽章会变成「已支付」）
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handlePay}
        disabled={pending}
        className="rounded-xl bg-brand-600 px-8 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "支付中…" : "确认支付"}
      </button>
      {/* 错误提示 */}
      {message && <p className="text-sm text-red-600">{message}</p>}
      <p className="text-xs text-gray-400">模拟支付：点击即支付成功，无真实扣款</p>
    </div>
  );
}
