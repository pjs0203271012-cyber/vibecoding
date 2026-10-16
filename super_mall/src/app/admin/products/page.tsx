"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";

interface Category { id: string; name: string; slug: string; }
interface Product { id: string; name: string; price: number; stock: number; imageUrl: string; categoryId: string; category: Category; }
interface Pagination { page: number; pageSize: number; total: number; totalPages: number; }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 筛选状态
  const [categoryFilter, setCategoryFilter] = useState("");

  // 表单状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: 0, stock: 0, imageUrl: "", categoryId: "" });
  const [formOpen, setFormOpen] = useState(false);

  const fetchProducts = useCallback(async (page: number, cat: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (cat) params.set("category", cat);

    const res = await fetch(`/api/admin/products?${params}`);
    if (res.status === 401 || res.status === 403) { setError("需要管理员权限"); setLoading(false); return; }
    const data = await res.json();
    setProducts(data.products);
    setPagination(data.pagination);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) { const data = await res.json(); setCategories(data.categories); }
  }, []);

  useEffect(() => {
    fetchProducts(1, "");
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  /** 切换分类筛选 */
  function handleCategoryChange(slug: string) {
    setCategoryFilter(slug);
    fetchProducts(1, slug);
  }

  /** 切换页码 */
  function goToPage(page: number) {
    fetchProducts(page, categoryFilter);
  }

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", description: "", price: 0, stock: 0, imageUrl: "", categoryId: categories[0]?.id || "" });
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({ name: p.name, description: "", price: p.price, stock: p.stock, imageUrl: p.imageUrl, categoryId: p.categoryId });
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };

    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "操作失败"); return; }
      setMessage(editingId ? "商品已更新" : "商品已创建");
      setFormOpen(false);
      fetchProducts(pagination.page, categoryFilter);
      setTimeout(() => setMessage(""), 3000);
    } catch { setError("网络错误"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除此商品吗？")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); setError(d.error || "删除失败"); return; }
      setMessage("商品已删除");
      fetchProducts(pagination.page, categoryFilter);
      setTimeout(() => setMessage(""), 3000);
    } catch { setError("网络错误"); }
  }

  /** 渲染分页按钮 */
  function renderPagination() {
    const { page, totalPages } = pagination;
    if (totalPages <= 1) return null;

    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-1 mt-4">
        <button
          onClick={() => goToPage(1)}
          disabled={page === 1}
          className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          首页
        </button>
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goToPage(p)}
            className={`px-3 py-1 text-sm rounded border ${
              p === page
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          下一页
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={page === totalPages}
          className="px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          末页
        </button>
        <span className="ml-2 text-xs text-gray-500">
          共 {pagination.total} 条，第 {page}/{totalPages} 页
        </span>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return <div className="p-6"><div className="h-64 bg-gray-200 rounded-xl animate-pulse" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">新增商品</button>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}<button onClick={() => setError("")} className="ml-2">✕</button></div>}
      {message && <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{message}</div>}

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleCategoryChange("")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !categoryFilter ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          全部分类
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategoryChange(c.slug)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === c.slug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* 商品表格 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">商品</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">分类</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">价格</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">库存</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl || "/file.svg"} alt={p.name} className="w-10 h-10 rounded bg-gray-100 object-cover" />
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category.name}</td>
                  <td className="px-4 py-3 text-right font-medium">¥{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline mr-3">编辑</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">删除</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">暂无商品</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      {renderPagination()}

      {/* 创建/编辑表单弹窗 */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFormOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? "编辑商品" : "新增商品"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价格 *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">库存 *</label>
                  <input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图片 URL</label>
                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
                <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="">请选择分类</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">{editingId ? "保存修改" : "创建商品"}</button>
                <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
