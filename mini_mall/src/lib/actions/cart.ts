"use server";

// ============================================================
// 购物车相关 Server Actions
// ⚠️ 铁律：每个 Action 第一行先调用 requireUser() 鉴权！
// Action 是独立的 HTTP 入口，绕过页面直接请求也必须被拦住。
// ============================================================
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Action 的统一返回类型：成功返回 { ok: true }，失败返回 { error: 提示 }
export type ActionResult = { ok: true } | { error: string };

/**
 * 加入购物车
 * 同一商品重复加购只累加数量（利用 schema 里的 @@unique([userId, productId])）
 */
export async function addToCart(
  productId: number,
  quantity = 1
): Promise<ActionResult> {
  const user = await requireUser(); // 未登录 → 自动 redirect 到登录页

  // 校验商品是否存在
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "商品不存在" };

  // upsert：已存在则累加数量，不存在则新建一条
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.userId, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId: user.userId, productId, quantity },
  });

  revalidatePath("/cart"); // 刷新购物车页面的缓存
  return { ok: true };
}

/**
 * 修改购物车条目数量；数量 ≤ 0 时直接删除该条目
 */
export async function updateCartItemQuantity(
  itemId: number,
  quantity: number
): Promise<ActionResult> {
  const user = await requireUser();

  if (quantity <= 0) {
    // 数量减到 0 → 删除
    const result = await prisma.cartItem.deleteMany({
      where: { id: itemId, userId: user.userId }, // 只能操作自己的购物车
    });
    if (result.count === 0) return { error: "购物车条目不存在" };
    revalidatePath("/cart");
    return { ok: true };
  }

  const result = await prisma.cartItem.updateMany({
    where: { id: itemId, userId: user.userId },
    data: { quantity },
  });
  if (result.count === 0) return { error: "购物车条目不存在" };

  revalidatePath("/cart");
  return { ok: true };
}

/**
 * 删除购物车条目
 */
export async function removeCartItem(itemId: number): Promise<ActionResult> {
  const user = await requireUser();
  const result = await prisma.cartItem.deleteMany({
    where: { id: itemId, userId: user.userId },
  });
  if (result.count === 0) return { error: "购物车条目不存在" };

  revalidatePath("/cart");
  return { ok: true };
}
