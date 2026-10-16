/**
 * 卡通产品图生成工具
 *
 * 为每个产品分类生成对应的卡通风格 SVG 图片（data URI），
 * 替代之前的 picsum.photos 随机图，让产品展示更贴合内容。
 */

/** 根据分类 slug 和产品序号生成卡通 SVG data URI */
export function getProductImageUrl(categorySlug: string, index: number): string {
  const svg = categoryIllustrations[categorySlug]?.(index) ?? fallbackIllustration(index);
  // 编码 SVG 为 data URI，确保中文正确编码
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/* ==================== 分类 → 卡通插图 ==================== */

type IllustrationFn = (i: number) => string;

const categoryIllustrations: Record<string, IllustrationFn> = {
  "phones-digital": phoneIllustration,
  clothing: clothingIllustration,
  "food-drinks": foodIllustration,
  home: homeIllustration,
  books: booksIllustration,
};

/** 手机数码 — 彩色设备造型 */
function phoneIllustration(i: number): string {
  const items = [
    { bg: "#e0f2fe", device: "#3b82f6", accent: "#f59e0b" },  // 蓝色手机
    { bg: "#fef3c7", device: "#1e293b", accent: "#10b981" },  // 深色手机
    { bg: "#fce7f3", device: "#ec4899", accent: "#6366f1" },  // 粉色手机
    { bg: "#e8f5e9", device: "#f5f5f5", accent: "#ef4444" },  // 白色耳机
    { bg: "#ede9fe", device: "#8b5cf6", accent: "#06b6d4" },  // 紫色平板
  ];
  const item = items[i % items.length];
  return svgTemplate({
    bg: item.bg,
    body: `
      <!-- 设备主体 -->
      <rect x="130" y="80" width="140" height="240" rx="18" fill="${item.device}" />
      <!-- 屏幕 -->
      <rect x="142" y="100" width="116" height="170" rx="6" fill="#fff" opacity="0.9" />
      <!-- 屏幕内容 -->
      <circle cx="200" cy="155" r="28" fill="${item.accent}" opacity="0.3" />
      <rect x="160" y="195" width="80" height="6" rx="3" fill="${item.accent}" opacity="0.4" />
      <rect x="165" y="207" width="70" height="4" rx="2" fill="${item.accent}" opacity="0.3" />
      <rect x="170" y="216" width="60" height="4" rx="2" fill="${item.accent}" opacity="0.25" />
      <!-- 底部按钮 -->
      <circle cx="200" cy="298" r="6" fill="#fff" opacity="0.5" />
      <!-- 装饰圆点 -->
      <circle cx="140" cy="110" r="4" fill="${item.accent}" opacity="0.6" />
    `,
  });
}

/** 服装鞋帽 — 衣帽鞋造型 */
function clothingIllustration(i: number): string {
  const items = [
    { bg: "#fef2f2", main: "#ef4444", sub: "#fca5a5" },  // 红色大衣
    { bg: "#f0f9ff", main: "#0ea5e9", sub: "#7dd3fc" },  // 蓝色运动鞋
    { bg: "#fffbeb", main: "#f59e0b", sub: "#fcd34d" },  // 橙色篮球鞋
    { bg: "#f1f5f9", main: "#475569", sub: "#94a3b8" },  // 灰色羽绒服
  ];
  const item = items[i % items.length];
  const shapes = [
    // 大衣 / 外套
    `<rect x="140" y="60" width="120" height="200" rx="12" fill="${item.main}" />
     <rect x="120" y="70" width="40" height="120" rx="10" fill="${item.main}" opacity="0.85" />
     <rect x="240" y="70" width="40" height="120" rx="10" fill="${item.main}" opacity="0.85" />
     <line x1="200" y1="60" x2="200" y2="260" stroke="${item.sub}" stroke-width="2" opacity="0.5" />
     <circle cx="200" cy="130" r="6" fill="${item.sub}" opacity="0.7" />
     <circle cx="200" cy="180" r="6" fill="${item.sub}" opacity="0.7" />`,
    // 运动鞋
    `<ellipse cx="200" cy="190" rx="80" ry="50" fill="${item.main}" />
     <ellipse cx="200" cy="180" rx="65" ry="35" fill="${item.sub}" opacity="0.5" />
     <rect x="120" y="140" width="160" height="40" rx="20" fill="${item.main}" opacity="0.7" />
     <circle cx="155" cy="210" r="8" fill="#fff" opacity="0.5" />
     <circle cx="200" cy="218" r="8" fill="#fff" opacity="0.5" />
     <circle cx="245" cy="210" r="8" fill="#fff" opacity="0.5" />`,
    // 篮球鞋
    `<ellipse cx="200" cy="200" rx="78" ry="45" fill="${item.main}" />
     <ellipse cx="200" cy="175" rx="60" ry="30" fill="${item.sub}" opacity="0.4" />
     <rect x="130" y="148" width="140" height="36" rx="18" fill="${item.main}" opacity="0.85" />
     <rect x="190" y="140" width="20" height="18" rx="3" fill="${item.sub}" opacity="0.6" />`,
    // 羽绒服
    `<rect x="130" y="60" width="140" height="200" rx="20" fill="${item.main}" />
     <rect x="130" y="60" width="140" height="30" rx="10" fill="${item.sub}" opacity="0.4" />
     <line x1="200" y1="60" x2="200" y2="90" stroke="${item.sub}" stroke-width="2" opacity="0.3" />
     <rect x="150" y="110" width="100" height="20" rx="10" fill="${item.sub}" opacity="0.25" />
     <rect x="150" y="150" width="100" height="20" rx="10" fill="${item.sub}" opacity="0.25" />
     <rect x="150" y="190" width="100" height="20" rx="10" fill="${item.sub}" opacity="0.25" />
     <circle cx="200" cy="130" r="5" fill="#fff" opacity="0.3" />
     <circle cx="200" cy="170" r="5" fill="#fff" opacity="0.3" />`,
  ];
  return svgTemplate({ bg: item.bg, body: shapes[i % shapes.length] });
}

/** 食品饮料 — 食物饮品类造型 */
function foodIllustration(i: number): string {
  const items = [
    { bg: "#fefce8", main: "#65a30d", sub: "#a3e635" },  // 茶饼（绿）
    { bg: "#fdf2f8", main: "#8b4513", sub: "#d2691e" },  // 巧克力（棕）
    { bg: "#fff7ed", main: "#c2410c", sub: "#fb923c" },  // 坚果（橙）
    { bg: "#fef2f2", main: "#f97316", sub: "#fdba74" },  // 果汁（橙黄）
  ];
  const item = items[i % items.length];
  const shapes = [
    // 圆形茶饼
    `<circle cx="200" cy="170" r="90" fill="${item.main}" />
     <circle cx="200" cy="170" r="70" fill="${item.sub}" opacity="0.5" />
     <circle cx="200" cy="170" r="30" fill="${item.main}" opacity="0.7" />
     <text x="200" y="178" text-anchor="middle" font-size="24" fill="#fff" opacity="0.6">茶</text>`,
    // 巧克力块
    `<rect x="110" y="70" width="180" height="200" rx="8" fill="${item.main}" />
     <line x1="200" y1="70" x2="200" y2="270" stroke="${item.sub}" stroke-width="3" opacity="0.4" />
     <line x1="110" y1="170" x2="290" y2="170" stroke="${item.sub}" stroke-width="3" opacity="0.4" />
     <line x1="110" y1="120" x2="290" y2="120" stroke="${item.sub}" stroke-width="3" opacity="0.4" />
     <line x1="110" y1="220" x2="290" y2="220" stroke="${item.sub}" stroke-width="3" opacity="0.4" />`,
    // 坚果礼包（袋装）
    `<rect x="120" y="80" width="160" height="200" rx="16" fill="${item.main}" />
     <rect x="120" y="80" width="160" height="50" rx="16" fill="${item.sub}" opacity="0.6" />
     <circle cx="165" cy="155" r="18" fill="${item.sub}" opacity="0.5" />
     <circle cx="220" cy="140" r="14" fill="${item.sub}" opacity="0.45" />
     <circle cx="190" cy="190" r="16" fill="${item.sub}" opacity="0.4" />
     <ellipse cx="240" cy="185" rx="12" ry="10" fill="${item.sub}" opacity="0.45" />`,
    // 果汁瓶
    `<rect x="150" y="60" width="100" height="210" rx="28" fill="${item.main}" />
     <rect x="160" y="50" width="80" height="30" rx="8" fill="${item.sub}" opacity="0.7" />
     <rect x="175" y="40" width="50" height="16" rx="6" fill="${item.main}" opacity="0.5" />
     <rect x="170" y="110" width="60" height="8" rx="4" fill="#fff" opacity="0.3" />
     <rect x="170" y="140" width="60" height="8" rx="4" fill="#fff" opacity="0.25" />
     <circle cx="200" cy="210" r="14" fill="#fff" opacity="0.2" />`,
  ];
  return svgTemplate({ bg: item.bg, body: shapes[i % shapes.length] });
}

/** 家居用品 — 家电家居造型 */
function homeIllustration(i: number): string {
  const items = [
    { bg: "#f8fafc", main: "#334155", sub: "#64748b" },  // 吸尘器
    { bg: "#f5f3ff", main: "#7c3aed", sub: "#a78bfa" },  // 门锁
    { bg: "#ecfeff", main: "#0891b2", sub: "#22d3ee" },  // 枕头
    { bg: "#fefce8", main: "#ca8a04", sub: "#facc15" },  // 香薰机
  ];
  const item = items[i % items.length];
  const shapes = [
    // 吸尘器 D 形
    `<ellipse cx="180" cy="180" rx="55" ry="75" fill="${item.main}" />
     <ellipse cx="180" cy="160" rx="40" ry="40" fill="${item.sub}" opacity="0.4" />
     <rect x="200" y="120" width="80" height="30" rx="10" fill="${item.main}" opacity="0.8" transform="rotate(-15, 200, 120)" />
     <rect x="260" y="90" width="40" height="20" rx="6" fill="${item.sub}" opacity="0.5" />`,
    // 智能门锁
    `<rect x="130" y="80" width="140" height="200" rx="16" fill="${item.main}" />
     <rect x="145" y="95" width="110" height="70" rx="10" fill="#111" opacity="0.8" />
     <circle cx="200" cy="130" r="16" fill="${item.sub}" opacity="0.6" />
     <rect x="190" y="190" width="20" height="60" rx="6" fill="${item.sub}" opacity="0.5" />
     <circle cx="155" cy="230" r="5" fill="${item.sub}" opacity="0.4" />
     <circle cx="245" cy="230" r="5" fill="${item.sub}" opacity="0.4" />`,
    // 乳胶枕
    `<path d="M110,200 Q200,100 290,200 L280,240 Q200,170 120,240 Z" fill="${item.main}" />
     <path d="M120,210 Q200,120 280,210 L275,230 Q200,155 125,230 Z" fill="${item.sub}" opacity="0.4" />
     <circle cx="160" cy="195" r="4" fill="#fff" opacity="0.3" />
     <circle cx="200" cy="175" r="4" fill="#fff" opacity="0.3" />
     <circle cx="240" cy="195" r="4" fill="#fff" opacity="0.3" />`,
    // 香薰机
    `<ellipse cx="200" cy="140" rx="70" ry="50" fill="${item.main}" />
     <ellipse cx="200" cy="130" rx="55" ry="30" fill="${item.sub}" opacity="0.4" />
     <ellipse cx="200" cy="120" rx="30" ry="16" fill="${item.sub}" opacity="0.3" />
     <rect x="180" y="175" width="40" height="20" rx="5" fill="${item.main}" opacity="0.8" />
     <!-- 雾气 -->
     <circle cx="185" cy="80" r="8" fill="#fff" opacity="0.4" />
     <circle cx="200" cy="60" r="12" fill="#fff" opacity="0.3" />
     <circle cx="215" cy="85" r="10" fill="#fff" opacity="0.35" />`,
  ];
  return svgTemplate({ bg: item.bg, body: shapes[i % shapes.length] });
}

/** 图书音像 — 书本 CD 造型 */
function booksIllustration(i: number): string {
  const items = [
    { bg: "#eff6ff", cover: "#2563eb", spine: "#1d4ed8", pages: "#dbeafe" },
    { bg: "#f0fdf4", cover: "#16a34a", spine: "#15803d", pages: "#dcfce7" },
    { bg: "#fef3c7", cover: "#d97706", spine: "#b45309", pages: "#fef9c3" },
    { bg: "#fdf2f8", cover: "#db2777", spine: "#be185d", pages: "#fce7f3" },
  ];
  const item = items[i % items.length];
  const isCD = i === 3;
  const body = isCD
    ? // CD 光盘
      `<circle cx="200" cy="170" r="100" fill="${item.cover}" />
       <circle cx="200" cy="170" r="80" fill="${item.pages}" opacity="0.6" />
       <circle cx="200" cy="170" r="60" fill="${item.cover}" opacity="0.8" />
       <circle cx="200" cy="170" r="20" fill="#fff" />
       <circle cx="200" cy="170" r="8" fill="${item.spine}" opacity="0.5" />`
    : // 书本
      `<rect x="90" y="70" width="30" height="220" rx="4" fill="${item.spine}" />
       <rect x="120" y="70" width="170" height="220" rx="4" fill="${item.cover}" />
       <rect x="125" y="80" width="160" height="200" rx="2" fill="${item.pages}" opacity="0.4" />
       <line x1="145" y1="105" x2="270" y2="105" stroke="#fff" stroke-width="2" opacity="0.53" />
       <rect x="145" y="120" width="110" height="8" rx="3" fill="#fff" opacity="0.5" />
       <rect x="145" y="138" width="80" height="5" rx="2" fill="#fff" opacity="0.35" />
       <rect x="145" y="192" width="100" height="6" rx="3" fill="#fff" opacity="0.4" />
       <rect x="145" y="208" width="70" height="4" rx="2" fill="#fff" opacity="0.3" />`;

  return svgTemplate({ bg: item.bg, body });
}

/** 兜底插画 */
function fallbackIllustration(i: number): string {
  const colors = ["#dbeafe", "#fef3c7", "#d1fae5", "#ede9fe", "#fee2e2"];
  const bg = colors[i % colors.length];
  return svgTemplate({
    bg,
    body: `<circle cx="200" cy="150" r="60" fill="#fff" opacity="0.5" />
           <rect x="150" y="220" width="100" height="12" rx="6" fill="#fff" opacity="0.4" />`,
  });
}

/* ==================== SVG 模板 ==================== */

interface SvgParams {
  bg: string;
  body: string;
}

function svgTemplate({ bg, body }: SvgParams): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.1" />
    </filter>
  </defs>
  <!-- 背景 -->
  <rect width="400" height="400" rx="16" fill="${bg}" />
  <!-- 背景装饰圆 -->
  <circle cx="80" cy="80" r="60" fill="#fff" opacity="0.3" />
  <circle cx="330" cy="320" r="80" fill="#fff" opacity="0.2" />
  <circle cx="350" cy="60" r="40" fill="#fff" opacity="0.15" />
  <!-- 主体内容（带阴影） -->
  <g filter="url(#shadow)">
    ${body}
  </g>
  <!-- 底部光晕 -->
  <ellipse cx="200" cy="340" rx="90" ry="12" fill="#000" opacity="0.06" />
</svg>`;
}
