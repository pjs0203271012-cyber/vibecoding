import { NextResponse } from "next/server";
import { getCategories } from "@/lib/categories";

/**
 * GET /api/categories
 * 返回所有分类，包含每个分类下的商品数量
 */
export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}
