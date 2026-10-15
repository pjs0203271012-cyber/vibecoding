import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "@/lib/actions/admin-product";

export const metadata = { title: "编辑商品" };

// 编辑商品页：读取商品数据回填表单，action 用 updateProduct
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (Number.isNaN(productId)) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.category.findMany({ orderBy: { id: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/admin/products"
        className="inline-block text-sm text-gray-500 hover:text-brand-600"
      >
        ← 返回商品列表
      </Link>
      <h1 className="text-2xl font-bold">编辑商品</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ProductForm
          action={updateProduct}
          categories={categories}
          initialData={{
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            categoryId: product.categoryId,
          }}
        />
      </div>
    </div>
  );
}
