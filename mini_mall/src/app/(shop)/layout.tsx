import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// 前台路由组布局：(shop) 下的所有页面（首页、商品详情、购物车等）
// 共用 Header 和 Footer；括号不体现在 URL 上。
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
