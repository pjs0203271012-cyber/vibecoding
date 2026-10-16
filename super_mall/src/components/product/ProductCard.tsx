import Link from "next/link";
import Image from "next/image";
import type { ProductWithCategory } from "@/lib/products";

/** 商品卡片组件 */
export default function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200"
    >
      {/* 商品图片 */}
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
        <p className="mt-1 text-xs text-gray-500 truncate">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-red-600">
            ¥{product.price.toLocaleString()}
          </span>
          {product.stock > 0 ? (
            <span className="text-xs text-green-600">有货</span>
          ) : (
            <span className="text-xs text-gray-400">缺货</span>
          )}
        </div>
        <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
          {product.category.name}
        </span>
      </div>
    </Link>
  );
}
