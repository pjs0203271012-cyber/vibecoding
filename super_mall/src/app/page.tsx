import Link from "next/link";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import ProductCard from "@/components/product/ProductCard";
import Pagination from "@/components/ui/Pagination";

/** 首页的查询参数 */
interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

/** 构建带查询参数的 URL */
function buildUrl(params: { search?: string; category?: string; page?: number }): string {
  const sp = new URLSearchParams();
  if (params.search) sp.set("search", params.search);
  if (params.category) sp.set("category", params.category);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const q = sp.toString();
  return q ? `/?${q}` : "/";
}

/** 首页 — 商品浏览 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const activeCategory = params.category || "";
  const page = parseInt(params.page || "1", 10);

  // 并行获取商品和分类数据（直接调用共享查询函数，无 HTTP 自调用）
  const [{ products, pagination }, categories] = await Promise.all([
    getProducts({ search, category: activeCategory, page }),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mini Mall 商城</h1>

      {/* 搜索栏 */}
      <form className="mb-6" action="/">
        <div className="relative max-w-md">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="搜索商品名称或描述..."
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {search && (
            <Link
              href={buildUrl({ category: activeCategory })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </Link>
          )}
        </div>
        {/* 保留分类参数 */}
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
      </form>

      {/* 分类标签切换 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={buildUrl({ search })}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          全部
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={buildUrl({ search, category: cat.slug })}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name} ({cat.productCount})
          </Link>
        ))}
      </div>

      {/* 商品网格 */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 分页 */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            getHref={(p) => buildUrl({ search, category: activeCategory, page: p })}
          />
        </>
      ) : (
        /* 空状态 */
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">没有找到相关商品</p>
          {(search || activeCategory) && (
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
              清除筛选条件
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
