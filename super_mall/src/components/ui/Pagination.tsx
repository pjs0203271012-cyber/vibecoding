import Link from "next/link";

/** 分页组件 Props */
interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  /** 生成分页链接，参数为页码 */
  getHref: (page: number) => string;
}

/** 分页导航组件 */
export default function Pagination({ page, totalPages, hasNext, hasPrev, getHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="分页导航">
      {hasPrev ? (
        <Link
          href={getHref(page - 1)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          上一页
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
          上一页
        </span>
      )}

      <span className="px-3 py-2 text-sm text-gray-600">
        第 {page} / {totalPages} 页
      </span>

      {hasNext ? (
        <Link
          href={getHref(page + 1)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          下一页
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
          下一页
        </span>
      )}
    </nav>
  );
}
