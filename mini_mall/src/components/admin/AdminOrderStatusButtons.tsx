"use client";

// 后台订单状态流转按钮（客户端组件）
// 服务端根据状态机流转表算出「允许的操作」后传入，客户端只负责渲染按钮和调用
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/admin-order";

export type Transition = {
  to: string; // 目标状态
  label: string; // 按钮文案，如「发货」
  confirmText: string; // 确认弹窗文案
};

export default function AdminOrderStatusButtons({
  orderId,
  transitions,
}: {
  orderId: number;
  transitions: Transition[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleClick(transition: Transition) {
    if (!window.confirm(transition.confirmText)) return;
    setMessage("");
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, transition.to);
      if ("error" in result) {
        setMessage(`❌ ${result.error}`);
      } else {
        router.refresh(); // 状态更新后刷新页面
      }
    });
  }

  if (transitions.length === 0) return null; // 终态订单无操作按钮

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex gap-3">
        {transitions.map((t) => (
          <button
            key={t.to}
            onClick={() => handleClick(t)}
            disabled={pending}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {t.label}
          </button>
        ))}
      </div>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
