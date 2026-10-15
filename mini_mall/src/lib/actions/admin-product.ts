"use server";

// ============================================================
// 商品 CRUD（管理员专用）
// ⚠️ 铁律：每个 Action 第一行先调用 requireAdmin() 鉴权！
// ============================================================
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 商品表单 Action 的返回类型（配合 useActionState 使用）
export type ProductActionResult = { error: string } | null;

// 表单解析结果：要么校验失败带错误信息，要么校验通过带字段
type ParsedProductForm =
  | { error: string }
  | {
      fields: {
        name: string;
        description: string;
        price: number;
        imageUrl: string;
        stock: number;
        categoryId: number;
      };
    };

/**
 * 解析并校验商品表单数据（新建和编辑共用）
 * 价格在表单里以「元」填写，这里转换成「分」存入数据库
 * 注意：显式声明返回类型，让调用方的 "error" in parsed 判别可以正确窄化类型
 */
async function parseProductForm(formData: FormData): Promise<ParsedProductForm> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceYuan = String(formData.get("price") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const stockStr = String(formData.get("stock") ?? "").trim();
  const categoryIdStr = String(formData.get("categoryId") ?? "").trim();

  // ---------- 服务端校验 ----------
  if (!name) return { error: "请填写商品名称" };
  const priceCents = Math.round(parseFloat(priceYuan) * 100); // 元 → 分
  if (Number.isNaN(priceCents) || priceCents <= 0) {
    return { error: "请填写正确的价格（大于 0）" };
  }
  const stock = parseInt(stockStr, 10);
  if (Number.isNaN(stock) || stock < 0) {
    return { error: "请填写正确的库存（不小于 0）" };
  }
  const categoryId = parseInt(categoryIdStr, 10);
  if (Number.isNaN(categoryId)) return { error: "请选择分类" };

  // 分类必须存在
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "分类不存在" };

  return {
    fields: { name, description, price: priceCents, imageUrl, stock, categoryId },
  };
}

/**
 * 新建商品：校验 → 创建 → 跳回商品列表
 */
export async function createProduct(
  prevState: ProductActionResult,
  formData: FormData
): Promise<ProductActionResult> {
  await requireAdmin();

  const parsed = await parseProductForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.product.create({ data: parsed.fields });

  // 商品变了，前台首页和后台列表都要刷新缓存
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

/**
 * 编辑商品：校验 → 更新 → 跳回商品列表
 * 商品 id 通过表单隐藏字段传入
 */
export async function updateProduct(
  prevState: ProductActionResult,
  formData: FormData
): Promise<ProductActionResult> {
  await requireAdmin();

  const idStr = String(formData.get("id") ?? "");
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return { error: "商品不存在" };

  const parsed = await parseProductForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.product.update({ where: { id }, data: parsed.fields });

  revalidatePath("/");
  revalidatePath(`/products/${id}`);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

/**
 * 删除商品（购物车里的相关条目会级联删除）
 */
export async function deleteProduct(productId: number) {
  await requireAdmin();

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/");
  revalidatePath("/admin/products");
  return { ok: true };
}
