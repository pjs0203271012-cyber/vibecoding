// PostCSS 配置：webpack 模式下处理 Tailwind CSS
// 说明：Turbopack 模式（默认的 npm run dev）用 @tailwindcss/turbopack 原生处理，
// 不需要这个文件；webpack 模式（next dev --webpack / next build --webpack）需要。
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
