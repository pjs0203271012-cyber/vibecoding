// ============================================================
// 通用工具函数
// ============================================================

/**
 * 把「分」格式化成「元」的显示字符串
 * 例：formatPrice(1299) → "¥12.99"
 * 价格在数据库里以 Int 存分，避免浮点运算误差
 */
export function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

/**
 * 生成订单号：年月日时分秒 + 4 位随机数
 * 例：20261015223011 4821
 */
export function generateOrderNo(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const timestamp =
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const random = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return timestamp + String(random);
}

/**
 * 格式化日期时间为「YYYY-MM-DD HH:mm」的显示字符串
 */
export function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
