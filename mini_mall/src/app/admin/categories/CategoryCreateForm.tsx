"use client";

// 新增分类表单（客户端组件）
// 包装了一层：创建成功后清空输入框（useActionState 本身不会重置表单）
import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  type CategoryActionResult,
} from "@/lib/actions/admin-category";

export default function CategoryCreateForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: CategoryActionResult, formData: FormData) => {
      const result = await createCategory(null, formData);
      if (result === null) {
        formRef.current?.reset(); // 成功 → 清空输入框
        router.refresh(); // 刷新服务端组件，列表立即更新
      }
      return result;
    },
    null
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="text"
          name="name"
          required
          placeholder="分类名称，如：图书文创"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "添加中…" : "添加"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
