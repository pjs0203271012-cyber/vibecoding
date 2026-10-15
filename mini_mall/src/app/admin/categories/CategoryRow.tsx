"use client";

// 分类行（客户端组件）：行内重命名 + 删除
import { useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateCategory, deleteCategory } from "@/lib/actions/admin-category";

type CategoryRowProps = {
  category: { id: number; name: string };
  productCount: number; // 该分类下的商品数
};

export default function CategoryRow({ category, productCount }: CategoryRowProps) {
  const router = useRouter();
  // 重命名表单的状态
  const [state, formAction, pending] = useActionState(updateCategory, null);
  // 删除操作的反馈
  const [deleteError, setDeleteError] = useState("");
  const [deleting, startDeleting] = useTransition();

  function handleDelete() {
    if (productCount > 0) {
      alert(`「${category.name}」下还有 ${productCount} 个商品，无法删除`);
      return;
    }
    if (!window.confirm(`确定要删除分类「${category.name}」吗？`)) return;
    setDeleteError("");
    startDeleting(async () => {
      const result = await deleteCategory(category.id);
      if ("error" in result) {
        setDeleteError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="border-b border-gray-100 p-4 last:border-b-0">
      <form action={formAction} className="flex items-center gap-3">
        {/* 隐藏字段：分类 id */}
        <input type="hidden" name="id" value={category.id} />
        {/* 分类名输入框（可直接修改后保存） */}
        <input
          type="text"
          name="name"
          defaultValue={category.name}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <span className="w-20 shrink-0 text-xs text-gray-400">
          {productCount} 件商品
        </span>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 text-sm text-gray-400 hover:text-red-600 disabled:opacity-50"
        >
          删除
        </button>
      </form>
      {/* 重命名/删除的错误提示 */}
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
    </div>
  );
}
