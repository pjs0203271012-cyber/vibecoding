import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import ProductImage from "@/components/product/ProductImage";
import CheckoutForm from "./CheckoutForm";

export const metadata = { title: "结算" };

// 结算页（服务端组件）：左侧收货信息表单，右侧商品清单
export default async function CheckoutPage() {
  const user = await requireUser();

  // 读取购物车（结算的商品来源）
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: { product: true },
  });

  // 购物车是空的 → 回购物车页
  if (cartItems.length === 0) redirect("/cart");

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">确认订单</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 左侧：收货信息表单（客户端组件） */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">收货信息</h2>
          <CheckoutForm />
        </div>

        {/* 右侧：商品清单 */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 font-semibold">商品清单</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <ProductImage
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatPrice(item.product.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 合计金额 */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
            <span className="text-gray-600">应付总额</span>
            <span className="text-2xl font-bold text-brand-600">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
