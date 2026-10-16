import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/products";

/**
 * GET /api/products/[id]
 * 返回商品详情，包含关联的分类信息
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  return NextResponse.json(product);
}
