import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import ProductImage from "@/components/product/ProductImage";
import AddToCartButton from "@/components/cart/AddToCartButton";

// 动态生成浏览器标签页标题（如「无线蓝牙耳机 | Mini Mall」）
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });
  return { title: product?.name ?? "商品不存在" };
}

// 商品详情页
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 16 中 params 是 Promise，必须 await
  const { id } = await params;
  const productId = Number(id);

  // id 不是合法数字 → 404
  if (Number.isNaN(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  // 商品不存在 → 404
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* 返回链接 */}
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-brand-600"
      >
        ← 返回商品列表
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 左侧：商品大图 */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>

        {/* 右侧：商品信息 */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>

          {/* 价格：突出显示 */}
          <p className="text-3xl font-bold text-brand-600">
            {formatPrice(product.price)}
          </p>

          {/* 分类与库存 */}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>
              分类：
              <Link
                href={`/?category=${product.categoryId}`}
                className="text-brand-600 hover:underline"
              >
                {product.category.name}
              </Link>
            </span>
            <span>库存：{product.stock} 件</span>
          </div>

          {/* 商品描述 */}
          <div className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
            {product.description || "暂无描述"}
          </div>

          {/* 数量选择 + 加入购物车（客户端组件，未登录点击会被引导去登录） */}
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </div>
  );
}
