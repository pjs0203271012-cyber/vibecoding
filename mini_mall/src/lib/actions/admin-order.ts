"use server";

// ============================================================
// 订单管理（管理员专用）
// ⚠️ 铁律：每个 Action 第一行先调用 requireAdmin() 鉴权！
// ============================================================
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_TEXT,
  type OrderStatus,
} from "@/lib/constants";
import { revalidatePath } from "next/cache";

/**
 * 修改订单状态（后台发货/完成/取消）
 * 按状态机流转表 ORDER_STATUS_FLOW 校验：只允许合法的状态跳转。
 * 例如：已支付 PAID 可以发货 SHIPPED，但已完成 COMPLETED 不能做任何操作。
 */
export async function updateOrderStatus(orderId: number, newStatus: string) {
  await requireAdmin();

  // 校验目标状态是否合法
  if (!Object.values(ORDER_STATUS).includes(newStatus as OrderStatus)) {
    return { error: "非法的订单状态" };
  }
  const target = newStatus as OrderStatus;

  // 先查当前状态
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "订单不存在" };

  // 查状态机流转表：当前状态是否允许跳到目标状态
  const current = order.status as OrderStatus;
  const allowed = ORDER_STATUS_FLOW[current];
  if (!allowed.includes(target)) {
    return {
      error: `订单当前状态是「${ORDER_STATUS_TEXT[current]}」，不能变更为「${ORDER_STATUS_TEXT[target]}」`,
    };
  }

  // 用 updateMany 的 where 同时限定 id + 当前状态，防止并发下的重复流转
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: current },
    data: {
      status: target,
      // 后台取消订单（未支付）不记录支付时间
      ...(target === ORDER_STATUS.CANCELLED ? {} : {}),
    },
  });
  if (result.count === 0) return { error: "订单状态已变化，请刷新后重试" };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { ok: true };
}
