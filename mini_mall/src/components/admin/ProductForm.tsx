"use client";

// 商品表单（客户端组件）：新建和编辑共用
// 通过 props 传入不同的 Server Action 和初始数据
import { useActionState } from "react";
import Link from "next/link";
import type { Category } from "@prisma/client";
import type { ProductActionResult } from "@/lib/actions/admin-product";

type ProductFormProps = {
  action: (prev: ProductActionResult, formData: FormData) => Promise<ProductActionResult>;
  categories: Category[];
  // 编辑时传入初始数据；新建时不传
  initialData?: {
    id: number;
    name: string;
    description: string;
    price: number; // 分
    imageUrl: string;
    stock: number;
    categoryId: number;
  };
};

// 把「分」转回「元」的字符串（编辑表单回填用），如 1299 → "12.99"
function centsToYuan(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default function ProductForm({ action, categories, initialData }: ProductFormProps) {
  // useActionState：state 为校验错误提示，pending 为提交中状态
  const [state, formAction, pending] = useActionState(action, null);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <form action={formAction} className="space-y-4">
      {/* 编辑模式下用隐藏字段带上商品 id */}
      {initialData && <input type="hidden" name="id" value={initialData.id} />}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-gray-600">
          商品名称
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialData?.name}
          placeholder="如：无线蓝牙耳机"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm text-gray-600">
          商品描述
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialData?.description}
          placeholder="商品卖点、参数等介绍"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm text-gray-600">
            价格（元）
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min="0.01"
            step="0.01"
            defaultValue={initialData ? centsToYuan(initialData.price) : ""}
            placeholder="如：129.00"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="stock" className="mb-1 block text-sm text-gray-600">
            库存（件）
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            required
            min="0"
            step="1"
            defaultValue={initialData?.stock ?? 100}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-1 block text-sm text-gray-600">
          所属分类
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={initialData?.categoryId ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            请选择分类
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="imageUrl" className="mb-1 block text-sm text-gray-600">
          图片 URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={initialData?.imageUrl}
          placeholder="https://…（网络图片地址）"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-gray-400">
          可填 picsum.photos / unsplash 的图片地址，留空则显示占位图
        </p>
      </div>

      {/* 校验错误提示 */}
      {state && state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-8 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "保存中…" : "保存"}
        </button>
        <Link
          href="/admin/products"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-600 hover:bg-gray-50"
        >
          取消
        </Link>
      </div>
    </form>
  );
}
