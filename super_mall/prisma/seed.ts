import { PrismaClient } from "@prisma/client";
import { getProductImageUrl } from "../src/lib/product-image";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始填充种子数据...");

  // 清理旧数据
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 创建分类
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "手机数码", slug: "phones-digital" },
    }),
    prisma.category.create({
      data: { name: "服装鞋帽", slug: "clothing" },
    }),
    prisma.category.create({
      data: { name: "食品饮料", slug: "food-drinks" },
    }),
    prisma.category.create({
      data: { name: "家居用品", slug: "home" },
    }),
    prisma.category.create({
      data: { name: "图书音像", slug: "books" },
    }),
  ]);

  // 创建商品
  const products = [
    // 手机数码
    { name: "iPhone 16 Pro Max", description: "苹果最新旗舰手机，A18 Pro 芯片，钛金属机身，256GB 存储", price: 9999, imageUrl: getProductImageUrl(categories[0].slug, 0), stock: 50, categoryId: categories[0].id },
    { name: "华为 Mate 70 Pro", description: "麒麟 9100 芯片，鸿蒙系统，卫星通信，512GB 存储", price: 7999, imageUrl: getProductImageUrl(categories[0].slug, 1), stock: 30, categoryId: categories[0].id },
    { name: "小米 15 Ultra", description: "骁龙 8 Gen 4，徕卡全焦段四摄，120W 快充", price: 6499, imageUrl: getProductImageUrl(categories[0].slug, 2), stock: 40, categoryId: categories[0].id },
    { name: "AirPods Pro 3", description: "主动降噪，自适应音频，USB-C 充电，空间音频", price: 1899, imageUrl: getProductImageUrl(categories[0].slug, 3), stock: 100, categoryId: categories[0].id },
    { name: "iPad Air M4", description: "11 英寸 Liquid Retina 显示屏，M4 芯片，支持 Apple Pencil Pro", price: 5499, imageUrl: getProductImageUrl(categories[0].slug, 4), stock: 25, categoryId: categories[0].id },

    // 服装鞋帽
    { name: "经典款羊绒大衣", description: "100% 纯羊绒，中长款设计，双面呢手工缝制，经典驼色", price: 2999, imageUrl: getProductImageUrl(categories[1].slug, 0), stock: 20, categoryId: categories[1].id },
    { name: "Nike Air Max 2025", description: "全新气垫科技，轻质透气鞋面，运动休闲两用", price: 1299, imageUrl: getProductImageUrl(categories[1].slug, 1), stock: 60, categoryId: categories[1].id },
    { name: "李宁全城 12 篮球鞋", description: "䨻科技中底，碳纤维抗扭片，实战利器", price: 899, imageUrl: getProductImageUrl(categories[1].slug, 2), stock: 45, categoryId: categories[1].id },
    { name: "优衣库轻薄羽绒服", description: "750FP 蓬松度，轻至 200g，收纳方便，防泼水", price: 599, imageUrl: getProductImageUrl(categories[1].slug, 3), stock: 80, categoryId: categories[1].id },

    // 食品饮料
    { name: "云南古树普洱茶饼", description: "357g 古树春茶，手工石磨压制，回甘生津", price: 398, imageUrl: getProductImageUrl(categories[2].slug, 0), stock: 15, categoryId: categories[2].id },
    { name: "瑞士莲特醇黑巧克力", description: "70% 可可含量，丝滑口感，进口原料", price: 68, imageUrl: getProductImageUrl(categories[2].slug, 1), stock: 200, categoryId: categories[2].id },
    { name: "三只松鼠坚果大礼包", description: "每日坚果 30 袋装，核桃/腰果/巴旦木混合", price: 128, imageUrl: getProductImageUrl(categories[2].slug, 2), stock: 150, categoryId: categories[2].id },
    { name: "农夫山泉 NFC 果汁", description: "100% 鲜榨橙汁，非浓缩还原，冷藏锁鲜", price: 28, imageUrl: getProductImageUrl(categories[2].slug, 3), stock: 300, categoryId: categories[2].id },

    // 家居用品
    { name: "戴森 V16 无线吸尘器", description: "最强吸力，激光探测微尘，LCD 屏实时显示", price: 4999, imageUrl: getProductImageUrl(categories[3].slug, 0), stock: 10, categoryId: categories[3].id },
    { name: "小米智能门锁 2 Pro", description: "3D 结构光人脸识别，指纹解锁，HomeKit 接入", price: 1899, imageUrl: getProductImageUrl(categories[3].slug, 1), stock: 35, categoryId: categories[3].id },
    { name: "网易严选乳胶枕", description: "泰国天然乳胶，双向拉伸工艺，透气不闷热", price: 199, imageUrl: getProductImageUrl(categories[3].slug, 2), stock: 120, categoryId: categories[3].id },
    { name: "MUJI 超声波香薰机", description: "静音加湿，4 档定时，LED 氛围灯", price: 350, imageUrl: getProductImageUrl(categories[3].slug, 3), stock: 40, categoryId: categories[3].id },

    // 图书音像
    { name: "《深入理解计算机系统》", description: "CS:APP 原书第 3 版，从程序员视角理解计算机系统", price: 139, imageUrl: getProductImageUrl(categories[4].slug, 0), stock: 55, categoryId: categories[4].id },
    { name: "《三体》全集纪念版", description: "刘慈欣科幻巨著，雨果奖获奖作品，含三册精装", price: 168, imageUrl: getProductImageUrl(categories[4].slug, 1), stock: 200, categoryId: categories[4].id },
    { name: "《JavaScript 高级程序设计》", description: "第 5 版，前端开发者必读红宝书，全面覆盖 ES2024", price: 129, imageUrl: getProductImageUrl(categories[4].slug, 2), stock: 80, categoryId: categories[4].id },
    { name: "周杰伦《最伟大的作品》CD", description: "典藏版 CD，含 12 首全新创作，附赠精美歌词本", price: 158, imageUrl: getProductImageUrl(categories[4].slug, 3), stock: 30, categoryId: categories[4].id },
  ];

  await prisma.product.createMany({ data: products });

  console.log(`✅ 种子数据填充完成：${categories.length} 个分类，${products.length} 个商品`);
}

main()
  .catch((e) => {
    console.error("种子数据填充失败：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
