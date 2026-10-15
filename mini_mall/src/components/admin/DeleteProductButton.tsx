"use client";

// 删除商品按钮（客户端组件）：确认后调用 deleteProduct Server Action
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/lib/actions/admin-product";

export default function DeleteProductButton({ productId }: { productId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("确定要删除这个商品吗？删除后不可恢复。")) return;
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if ("error" in result) {
        alert(result.error);
      } else {
        router.refresh(); // 刷新商品列表
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-sm text-gray-400 hover:text-red-600 disabled:opacity-50"
    >
      删除
    </button>
  );
}
