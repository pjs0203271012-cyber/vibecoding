"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";

interface Category { id: string; name: string; slug: string; productCount: number; createdAt: string; }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    if (res.status === 401 || res.status === 403) { setError("需要管理员权限"); setLoading(false); return; }
    const data = await res.json();
    setCategories(data.categories);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "创建失败"); return; }
      setMessage("分类已创建");
      setFormOpen(false);
      setName("");
      setSlug("");
      fetchCategories();
      setTimeout(() => setMessage(""), 3000);
    } catch { setError("网络错误"); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string, productCount: number) {
    if (productCount > 0) { setError("该分类下有商品，无法删除"); return; }
    if (!confirm("确定要删除此分类吗？")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "删除失败"); return; }
      setMessage("分类已删除");
      fetchCategories();
      setTimeout(() => setMessage(""), 3000);
    } catch { setError("网络错误"); }
  }

  if (loading) return <div className="p-6"><div className="h-48 bg-gray-200 rounded-xl animate-pulse" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
        <button onClick={() => setFormOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">新增分类</button>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}<button onClick={() => setError("")} className="ml-2">✕</button></div>}
      {message && <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{message}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">名称</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">标识</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">商品数</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-right">{c.productCount}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleDelete(c.id, c.productCount)} className="text-red-600 hover:underline text-sm" disabled={c.productCount > 0}>删除</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">暂无分类</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新增分类弹窗 */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFormOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">新增分类</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
                <input required value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="如：手机数码" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标识 (slug) *</label>
                <input required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="如：phones-digital" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm">{submitting ? "创建中..." : "创建分类"}</button>
                <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
