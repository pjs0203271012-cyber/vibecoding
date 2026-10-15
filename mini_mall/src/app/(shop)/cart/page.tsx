import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import CartItemRow from "@/components/cart/CartItemRow";

export const metadata = { title: "购物车" };

// 购物车页（服务端组件）：读取当前用户的购物车条目
export default async function CartPage() {
  // 未登录会被 redirect 到登录页（proxy 已经拦过一道，这里再兜底一次）
  const user = await requireUser();

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: { product: true }, // 条目上要显示商品信息
    orderBy: { createdAt: "desc" },
  });

  // 合计金额（服务端从数据库实时计算，绝不信任前端）
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 空购物车状态
  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-gray-400">
        <p className="text-5xl">🛒</p>
        <p className="mt-4">购物车还是空的</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">我的购物车</h1>

      {/* 购物车条目列表 */}
      <div className="space-y-3">
        {cartItems.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* 合计 + 去结算 */}
      <div className="mt-6 flex items-center justify-end gap-6 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-gray-600">
          合计：
          <span className="text-2xl font-bold text-brand-600">
            {formatPrice(totalAmount)}
          </span>
        </p>
        <Link
          href="/checkout"
          className="rounded-xl bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
        >
          去结算
        </Link>
      </div>
    </div>
  );
}
