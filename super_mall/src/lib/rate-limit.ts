/**
 * 内存速率限制器
 *
 * 基于固定窗口计数器算法，按 IP + 端点限制请求频率。
 * 适用于单进程部署（如开发环境、小型 VPS），
 * 多实例部署建议替换为 Redis 方案（@upstash/ratelimit）。
 */

/** 限流配置 */
interface RateLimitConfig {
  /** 窗口时间（毫秒） */
  windowMs: number;
  /** 窗口内最大请求数 */
  maxRequests: number;
}

/** 单个窗口的计数器 */
interface WindowCounter {
  count: number;
  resetAt: number;
}

/** 存储：key = "IP:endpoint" */
const store = new Map<string, WindowCounter>();

/** 定时清理过期条目（每 60 秒） */
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, counter] of store) {
    if (now > counter.resetAt) {
      store.delete(key);
    }
  }
}

/**
 * 检查是否触发速率限制
 * @param ip 客户端 IP 地址
 * @param endpoint 端点标识（如 "login"、"register"）
 * @param config 限流配置
 * @returns { allowed: boolean; remaining: number; resetAt: number }
 */
export function checkRateLimit(
  ip: string,
  endpoint: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup();

  const key = `${ip}:${endpoint}`;
  const now = Date.now();

  const existing = store.get(key);

  // 无记录或窗口已过期 → 新建计数器
  if (!existing || now > existing.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  // 窗口内计数
  existing.count++;

  if (existing.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * 从 NextRequest 中提取客户端 IP
 * 优先取 X-Forwarded-For（代理/负载均衡后），fallback 到连接地址
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // X-Forwarded-For 格式: "client, proxy1, proxy2"
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  // Node.js 环境下尝试从 socket 获取
  // 在 Edge Runtime 中不可用，但 Next.js middleware/route 会处理
  try {
    const req = request as Request & { socket?: { remoteAddress?: string } };
    return req.socket?.remoteAddress || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

/* ==================== 预设配置 ==================== */

/** 登录端点：每分钟最多 5 次 */
export const LOGIN_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 5,
};

/** 注册端点：每分钟最多 3 次 */
export const REGISTER_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 3,
};
