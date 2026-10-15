// 全局加载状态：页面数据加载时显示
export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-gray-400">
      <p className="animate-pulse">加载中…</p>
    </div>
  );
}
