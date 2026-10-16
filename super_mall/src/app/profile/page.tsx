import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMembershipName, getDiscountRate } from "@/lib/membership";

/** 会员等级配置（与 membership.ts 保持同步） */
const TIERS = [
  { level: 0, threshold: 0, name: "普通用户" },
  { level: 1, threshold: 8_000, name: "心悦1" },
  { level: 2, threshold: 80_000, name: "心悦2" },
  { level: 3, threshold: 800_000, name: "心悦3" },
] as const;

/** 等级对应的颜色主题 */
const TIER_COLORS: Record<number, { bg: string; text: string; border: string; badge: string }> = {
  0: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", badge: "bg-gray-100 text-gray-600" },
  1: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  2: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
  3: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
};

/** 个人中心页面 */
export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const level = user.membershipLevel;
  const tierName = getMembershipName(level);
  const discountRate = getDiscountRate(level);
  const colors = TIER_COLORS[level] ?? TIER_COLORS[0];

  // 计算等级提升进度
  const currentTier = TIERS[level];
  const nextTier = TIERS[level + 1];
  const progressToNext = nextTier
    ? ((user.totalSpent - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100
    : 100;

  const discountPercent = Math.round((1 - discountRate) * 100);
  const joinedDate = new Date(user.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>

      {/* ========== 用户信息卡片 ========== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          {/* 头像 */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              注册于 {joinedDate}
              {user.role === "ADMIN" && (
                <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
                  管理员
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ========== 会员等级卡片 ========== */}
      <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">会员等级</p>
            <p className={`text-2xl font-bold ${colors.text}`}>{tierName}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
            {level === 0 ? "无折扣" : `${discountPercent === 0 ? "无" : discountPercent}% 折扣`}
          </span>
        </div>

        {/* 等级进度条 */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>¥{user.totalSpent.toLocaleString()}</span>
            {nextTier ? (
              <span>
                升级到 {nextTier.name} 还需 ¥
                {(nextTier.threshold - user.totalSpent).toLocaleString()}
              </span>
            ) : (
              <span>已达最高等级 🎉</span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                level === 0
                  ? "bg-blue-500"
                  : level === 1
                    ? "bg-purple-500"
                    : level === 2
                      ? "bg-amber-500"
                      : "bg-gradient-to-r from-amber-400 to-red-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progressToNext))}%` }}
            />
          </div>

          {/* 等级阶梯 */}
          <div className="flex justify-between text-xs text-gray-400 pt-1">
            {TIERS.map((t) => (
              <span key={t.level} className={level >= t.level ? "font-medium text-gray-600" : ""}>
                {t.name}
              </span>
            ))}
          </div>
        </div>

        {/* 折扣说明 */}
        {level > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200/60">
            <p className="text-sm text-gray-600">
              当前享受 <span className={`font-bold ${colors.text}`}>{(discountRate * 10).toFixed(1)} 折</span>
              （原价 × {discountRate}），下单时自动计算折扣后金额。
            </p>
          </div>
        )}
      </div>

      {/* ========== 消费统计 ========== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            ¥{user.totalSpent.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">累计消费</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{tierName}</p>
          <p className="text-xs text-gray-500 mt-1">当前等级</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {level === 0 ? "—" : `${discountPercent}%`}
          </p>
          <p className="text-xs text-gray-500 mt-1">折扣力度</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{joinedDate.slice(-5)}</p>
          <p className="text-xs text-gray-500 mt-1">加入日期</p>
        </div>
      </div>

      {/* ========== 快捷入口 ========== */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <Link
          href="/orders"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span className="text-sm font-medium text-gray-700">我的订单</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/cart"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🛒</span>
            <span className="text-sm font-medium text-gray-700">购物车</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚙️</span>
              <span className="text-sm font-medium text-gray-700">后台管理</span>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
