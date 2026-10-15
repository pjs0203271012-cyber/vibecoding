import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/admin-product";

export const metadata = { title: "新建商品" };

// 新建商品页：ProductForm 不传 initialData，action 用 createProduct
export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/admin/products"
        className="inline-block text-sm text-gray-500 hover:text-brand-600"
      >
        ← 返回商品列表
      </Link>
      <h1 className="text-2xl font-bold">新建商品</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ProductForm action={createProduct} categories={categories} />
      </div>
    </div>
  );
}
