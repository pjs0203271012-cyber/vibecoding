/**
 * 心悦会员体系：等级与折扣率
 *
 * 累计消费门槛（含税实付）:
 *   0 — 普通用户 (0.00)
 *   1 — 心悦1   (¥8,000)  9.8折
 *   2 — 心悦2   (¥80,000) 9.5折
 *   3 — 心悦3   (¥800,000) 9.0折
 */

/** 会员等级配置：门槛 / 折扣率 / 名称 */
const MEMBERSHIP_TIERS = [
  { level: 0, threshold: 0, discountRate: 1.0, name: "普通用户" },
  { level: 1, threshold: 8_000, discountRate: 0.98, name: "心悦1" },
  { level: 2, threshold: 80_000, discountRate: 0.95, name: "心悦2" },
  { level: 3, threshold: 800_000, discountRate: 0.90, name: "心悦3" },
] as const;

/** 根据累计消费金额计算当前会员等级 */
export function getMembershipLevel(totalSpent: number): number {
  let level = 0;
  for (const tier of MEMBERSHIP_TIERS) {
    if (totalSpent >= tier.threshold) level = tier.level;
  }
  return level;
}

/** 根据会员等级获取折扣率 */
export function getDiscountRate(level: number): number {
  const tier = MEMBERSHIP_TIERS.find((t) => t.level === level);
  return tier?.discountRate ?? 1.0;
}

/** 获取会员等级名称 */
export function getMembershipName(level: number): string {
  const tier = MEMBERSHIP_TIERS.find((t) => t.level === level);
  return tier?.name ?? "普通用户";
}

/**
 * 计算折扣后金额，保留两位小数
 * finalAmount = totalAmount × discountRate
 */
export function calculateFinalAmount(totalAmount: number, discountRate: number): number {
  return Math.round(totalAmount * discountRate * 100) / 100;
}
