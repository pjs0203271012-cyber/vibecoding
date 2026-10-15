"use server";

// ============================================================
// 分类 CRUD（管理员专用）
// ⚠️ 铁律：每个 Action 第一行先调用 requireAdmin() 鉴权！
// ============================================================
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 分类表单 Action 的返回类型
export type CategoryActionResult = { error: string } | null;

// 删除/修改等操作的返回类型（显式声明，方便调用方窄化判别）
export type CategoryOpResult = { ok: true } | { error: string };

/**
 * 新增分类
 */
export async function createCategory(
  prevState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "请填写分类名称" };

  // 分类名唯一：重复时 Prisma 会抛唯一约束错误
  try {
    await prisma.category.create({ data: { name } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "该分类已存在" };
    }
    throw e;
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return null; // 成功返回 null（表单清空，无错误提示）
}

/**
 * 重命名分类
 */
export async function updateCategory(
  prevState: CategoryActionResult,
  formData: FormData
): Promise<CategoryActionResult> {
  await requireAdmin();

  const idStr = String(formData.get("id") ?? "");
  const id = parseInt(idStr, 10);
  const name = String(formData.get("name") ?? "").trim();
  if (Number.isNaN(id)) return { error: "分类不存在" };
  if (!name) return { error: "请填写分类名称" };

  try {
    await prisma.category.update({ where: { id }, data: { name } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "该分类已存在" };
    }
    throw e;
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return null;
}

/**
 * 删除分类
 * schema 里 Product.categoryId 是 onDelete: Restrict：
 * 分类下还有商品时，数据库会拒绝删除（外键约束错误 P2003）
 */
export async function deleteCategory(
  categoryId: number
): Promise<CategoryOpResult> {
  await requireAdmin();

  try {
    await prisma.category.delete({ where: { id: categoryId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return { error: "该分类下还有商品，无法删除" };
    }
    throw e;
  }

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { ok: true };
}
