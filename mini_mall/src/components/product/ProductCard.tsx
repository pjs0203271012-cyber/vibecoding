import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import ProductImage from "@/components/product/ProductImage";
import type { Product, Category } from "@prisma/client";

// 商品卡片：在首页网格中展示，整卡可点击跳转到详情页
type ProductCardProps = {
  product: Product & { category: Category };
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      {/* 商品图片：4:3 比例，悬停时轻微放大 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* 商品信息 */}
      <div className="space-y-1 p-3">
        <h3 className="truncate font-medium text-gray-900 group-hover:text-brand-600">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400">{product.category.name}</p>
        <p className="font-semibold text-brand-600">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
