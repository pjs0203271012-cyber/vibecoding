import Link from "next/link";
import Image from "next/image";
import { getProductById } from "@/lib/products";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/product/AddToCartButton";

/** 商品详情页 Props */
interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

/** 商品详情页 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    console.error(`商品不存在：id=${id}`);
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 面包屑导航 */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          首页
        </Link>
        <span>/</span>
        <Link
          href={`/?category=${product.category.slug}`}
          className="hover:text-blue-600 transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* 商品主体 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左侧：商品图片 */}
        <div className="bg-gray-100 rounded-xl overflow-hidden relative aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* 右侧：商品信息 */}
        <div className="flex flex-col">
          <span className="inline-block w-fit px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full mb-3">
            {product.category.name}
          </span>

          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          {/* 价格 */}
          <div className="mt-4">
            <span className="text-3xl font-bold text-red-600">
              ¥{product.price.toLocaleString()}
            </span>
          </div>

          {/* 描述 */}
          <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

          {/* 库存状态 */}
          <div className="mt-6 flex items-center gap-4">
            {product.stock > 0 ? (
              <>
                <span className="flex items-center gap-1 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  有货
                </span>
                <span className="text-sm text-gray-500">
                  库存 {product.stock} 件
                </span>
              </>
            ) : (
              <span className="text-red-500 font-medium">暂时缺货</span>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="mt-8">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>
    </div>
  );
}
