import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

/** 每页商品数量 */
const PAGE_SIZE = 9;

/**
 * GET /api/products
 * 查询参数：
 *   search  — 模糊搜索商品名称和描述
 *   category — 按分类 slug 筛选
 *   page    — 页码，从 1 开始，默认 1
 *
 * 注意：SQLite 的 LIKE 操作符对 ASCII 字母默认不区分大小写，
 * 因此搜索 "iphone" 可以匹配到 "iPhone"。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const result = await getProducts({ search, category, page, pageSize: PAGE_SIZE });

  return NextResponse.json(result);
}
