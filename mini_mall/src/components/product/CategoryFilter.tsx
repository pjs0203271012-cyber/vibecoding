import Link from "next/link";
import type { Category } from "@prisma/client";

// 分类筛选栏：点击分类跳转到 /?category=id，同时保留当前搜索词 q
type CategoryFilterProps = {
  categories: Category[];
  activeId?: number; // 当前选中的分类 id，不传表示「全部」
  q?: string; // 当前搜索词，点击分类时保留
};

export default function CategoryFilter({ categories, activeId, q = "" }: CategoryFilterProps) {
  // 未选中和选中两种样式
  const baseClass =
    "rounded-full px-4 py-1.5 text-sm transition-colors";
  const inactiveClass = "bg-white text-gray-600 border border-gray-200 hover:border-brand-500 hover:text-brand-600";
  const activeClass = "bg-brand-600 text-white border border-brand-600";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 「全部」按钮 */}
      <Link
        href={`/${q ? `?q=${encodeURIComponent(q)}` : ""}`}
        className={`${baseClass} ${activeId ? inactiveClass : activeClass}`}
      >
        全部
      </Link>
      {/* 每个分类一个按钮 */}
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/?category=${c.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={`${baseClass} ${activeId === c.id ? activeClass : inactiveClass}`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
