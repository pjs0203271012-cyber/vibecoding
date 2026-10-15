"use server";

// ============================================================
// 订单相关 Server Actions：下单、模拟支付、取消订单
// ⚠️ 铁律：每个 Action 第一行先调用 requireUser() 鉴权！
// ============================================================
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ORDER_STATUS } from "@/lib/constants";
import { generateOrderNo } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 下单 Action 的返回类型（配合 useActionState 使用）
export type CreateOrderResult = { error: string } | { orderId: number } | null;

/**
 * 下单（结算页表单提交）
 * 事务内完成三件事：创建订单 + 写商品快照条目 + 清空购物车
 * 事务保证「要么全部成功，要么全部回滚」，不会出现
 * 「订单建了但购物车没清」的中间状态。
 */
export async function createOrder(
  prevState: CreateOrderResult,
  formData: FormData
): Promise<CreateOrderResult> {
  const user = await requireUser();

  // ---------- 读取并校验收货信息 ----------
  const receiverName = String(formData.get("receiverName") ?? "").trim();
  const receiverPhone = String(formData.get("receiverPhone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const remark = String(formData.get("remark") ?? "").trim();

  if (!receiverName) return { error: "请填写收货人姓名" };
  if (!/^1\d{10}$/.test(receiverPhone)) return { error: "请填写正确的 11 位手机号" };
  if (!address) return { error: "请填写收货地址" };

  // ---------- 读取购物车 ----------
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.userId },
    include: { product: true },
  });
  if (cartItems.length === 0) return { error: "购物车是空的" };

  // 订单总金额：服务端从数据库实时计算，绝不信任前端传来的金额
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // ---------- 事务：创建订单 + 快照条目 + 清空购物车 ----------
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId: user.userId,
        totalAmount,
        receiverName,
        receiverPhone,
        address,
        remark,
        // 订单条目存「商品快照」：把下单那一刻的名称/图片/价格复制进来，
        // 之后商品改价或删除都不影响历史订单
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.imageUrl,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
    });
    // 下单成功后才清空购物车（同一事务内）
    await tx.cartItem.deleteMany({ where: { userId: user.userId } });
    return created;
  });

  // 下单成功 → 跳转到订单详情页
  revalidatePath("/cart");
  redirect(`/orders/${order.id}`);
}

/**
 * 模拟支付：PENDING → PAID，记录支付时间
 * updateMany 的 where 同时校验「订单归属 + 当前状态」：
 * 不是自己的订单、或不是待支付状态，count 都是 0 → 报错。
 * 一条语句同时防越权 + 防重复支付。
 */
export async function payOrder(orderId: number) {
  const user = await requireUser();

  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      userId: user.userId, // 只能支付自己的订单
      status: ORDER_STATUS.PENDING, // 只有待支付订单可以支付
    },
    data: { status: ORDER_STATUS.PAID, paidAt: new Date() },
  });
  if (result.count === 0) {
    return { error: "订单不存在或当前状态不可支付" };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}

/**
 * 取消订单：PENDING → CANCELLED（仅用户自己的订单）
 */
export async function cancelOrder(orderId: number) {
  const user = await requireUser();

  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      userId: user.userId,
      status: ORDER_STATUS.PENDING, // 只有待支付订单可以取消
    },
    data: { status: ORDER_STATUS.CANCELLED },
  });
  if (result.count === 0) {
    return { error: "订单不存在或当前状态不可取消" };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}
