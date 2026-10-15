/**
 * BookmarkCard 组件
 * 展示单个书签的卡片，显示标题、URL、描述和标签列表
 * 纯展示组件（无状态），数据通过 Props 传入
 */

import type { BookmarkCardProps } from './types';

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  // 解构出书签的各个字段，方便使用
  const { title, url, description, tags } = bookmark;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* 标题：点击可跳转到书签链接 */}
      <h3 className="text-lg font-semibold text-gray-900">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 hover:underline"
        >
          {title}
        </a>
      </h3>

      {/* URL 地址 */}
      <p className="mt-1 truncate text-sm text-blue-600">{url}</p>

      {/* 描述：没有描述时不渲染 */}
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}

      {/* 标签列表：没有标签时不渲染 */}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
