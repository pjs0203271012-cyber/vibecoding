"use client";

// 购物车条目行（客户端组件）：包含数量加减、删除按钮等交互
import { useTransition } from "react";
import { updateCartItemQuantity, removeCartItem } from "@/lib/actions/cart";
import { formatPrice } from "@/lib/utils";
import ProductImage from "@/components/product/ProductImage";
import type { CartItem, Product } from "@prisma/client";

type CartItemRowProps = {
  item: CartItem & { product: Product };
};

export default function CartItemRow({ item }: CartItemRowProps) {
  // useTransition：让交互期间按钮显示禁用状态，操作完成后页面自动刷新
  const [pending, startTransition] = useTransition();

  const subtotal = item.product.price * item.quantity; // 小计 = 单价 × 数量

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
      {/* 商品图 */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <ProductImage
          src={item.product.imageUrl}
          alt={item.product.name}
          sizes="80px"
          className="object-cover"
        />
      </div>

      {/* 商品名 + 单价 */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.product.name}</p>
        <p className="mt-1 text-sm text-gray-400">
          单价 {formatPrice(item.product.price)}
        </p>
      </div>

      {/* 数量加减 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            startTransition(() => {
              // void：忽略 Action 的返回值（startTransition 回调要求返回 void）
              void updateCartItemQuantity(item.id, item.quantity - 1);
            })
          }
          disabled={pending}
          className="h-8 w-8 rounded-lg border border-gray-300 text-gray-600 hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
        >
          −
        </button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <button
          onClick={() =>
            startTransition(() => {
              void updateCartItemQuantity(item.id, item.quantity + 1);
            })
          }
          disabled={pending}
          className="h-8 w-8 rounded-lg border border-gray-300 text-gray-600 hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
        >
          +
        </button>
      </div>

      {/* 小计 */}
      <p className="w-24 text-right font-medium text-brand-600">
        {formatPrice(subtotal)}
      </p>

      {/* 删除 */}
      <button
        onClick={() =>
          startTransition(() => {
            void removeCartItem(item.id);
          })
        }
        disabled={pending}
        className="text-sm text-gray-400 hover:text-red-600 disabled:opacity-50"
      >
        删除
      </button>
    </div>
  );
}
