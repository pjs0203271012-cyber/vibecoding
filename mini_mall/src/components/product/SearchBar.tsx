// 搜索框：普通 HTML 表单，提交时跳转到 /?q=关键词
// 用 GET 表单而不是客户端状态，是因为搜索条件直接体现在 URL 上，
// 可刷新、可分享，实现也最简单。
export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/" method="GET" className="flex gap-2">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="搜索商品名称…"
        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        搜索
      </button>
    </form>
  );
}
