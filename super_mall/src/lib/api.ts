/**
 * API 类型定义汇总
 * 实际查询逻辑已迁移至 @/lib/products 和 @/lib/categories，
 * 供 API Route 和 Server Component 共享复用。
 */

// 从共享模块重新导出类型，方便统一导入
export type { ProductWithCategory, ProductListResult, GetProductsParams } from "./products";
export type { CategoryWithCount } from "./categories";
