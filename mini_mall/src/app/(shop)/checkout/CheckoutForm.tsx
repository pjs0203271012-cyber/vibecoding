"use client";

// 收货信息表单（客户端组件）
// 用 useActionState 调用 Server Action：校验错误直接返回并渲染在表单上
import { useActionState } from "react";
import { createOrder } from "@/lib/actions/order";

export default function CheckoutForm() {
  // useActionState：state 是 Action 的返回值（错误提示），pending 是提交中状态
  const [state, formAction, pending] = useActionState(createOrder, null);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    // 表单的 action 直接指向 Server Action，提交即调用
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="receiverName" className="mb-1 block text-sm text-gray-600">
          收货人姓名
        </label>
        <input
          id="receiverName"
          name="receiverName"
          type="text"
          required
          placeholder="请输入收货人姓名"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="receiverPhone" className="mb-1 block text-sm text-gray-600">
          手机号
        </label>
        <input
          id="receiverPhone"
          name="receiverPhone"
          type="tel"
          required
          placeholder="11 位手机号"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm text-gray-600">
          收货地址
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          placeholder="省市区 + 详细地址"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="remark" className="mb-1 block text-sm text-gray-600">
          订单备注（选填）
        </label>
        <textarea
          id="remark"
          name="remark"
          rows={2}
          placeholder="如：工作日送货"
          className={inputClass}
        />
      </div>

      {/* 服务端校验错误提示 */}
      {state && "error" in state && state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "提交中…" : "提交订单"}
      </button>
      <p className="text-center text-xs text-gray-400">
        本项目为学习演示，提交订单不会产生真实扣款
      </p>
    </form>
  );
}
