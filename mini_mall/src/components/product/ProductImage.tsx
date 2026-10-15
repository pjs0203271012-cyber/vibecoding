"use client";

// 商品图片（客户端组件）：加载失败时自动显示占位符
// 用于所有展示商品图的地方，保证图片 URL 失效时界面不出现裂图
import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
  sizes?: string; // 响应式尺寸提示（next/image 性能优化用）
  className?: string; // 图片样式（如 object-cover）
  priority?: boolean; // 首屏图片可传 true 优先加载
};

export default function ProductImage({ src, alt, sizes, className, priority }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  // 没有图片地址或加载失败 → 显示占位符
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-4xl ${className ?? ""}`}>
        🛍️
      </div>
    );
  }

  // 注意：本组件按 fill 模式设计，父容器需要 relative + 固定尺寸
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
