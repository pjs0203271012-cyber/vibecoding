// ============================================================
// 种子数据脚本：创建演示账号、分类和商品
// 运行方式：npx prisma db seed（package.json 里已配置）
// 使用 upsert：重复运行不会产生重复数据（幂等）
// ============================================================
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ROLE } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  // ---------- 1. 演示账号 ----------
  // 管理员：admin@example.com / admin123
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {}, // 已存在则跳过
    create: {
      email: "admin@example.com",
      passwordHash: await bcrypt.hash("admin123", 12),
      name: "管理员",
      role: ROLE.ADMIN,
    },
  });
  // 普通用户：demo@example.com / demo123
  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash: await bcrypt.hash("demo123", 12),
      name: "演示用户",
      role: ROLE.CUSTOMER,
    },
  });
  console.log("✅ 已创建 2 个演示账号");

  // ---------- 2. 分类 ----------
  const categoryNames = ["数码家电", "服装鞋包", "家居生活", "食品饮料"];
  const categories: Record<string, number> = {};
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = category.id;
  }
  console.log(`✅ 已创建 ${categoryNames.length} 个分类`);

  // ---------- 3. 商品 ----------
  // 每个分类 3 个商品，共 12 个。
  // 图片用 picsum.photos 的 seed 图片（稳定、永不 404）。
  // 注意：价格单位是「分」，如 12900 表示 ¥129.00
  const products: Array<{
    name: string;
    description: string;
    price: number; // 分
    stock: number;
    categoryName: string;
    imageSeed: string; // picsum 的 seed 值，决定图片内容
  }> = [
    // 数码家电
    {
      name: "无线蓝牙耳机",
      description: "主动降噪，续航 30 小时，支持快充，佩戴舒适。",
      price: 12900,
      stock: 200,
      categoryName: "数码家电",
      imageSeed: "earbuds",
    },
    {
      name: "智能手表",
      description: "心率监测、运动记录、消息提醒，一周续航。",
      price: 39900,
      stock: 150,
      categoryName: "数码家电",
      imageSeed: "smartwatch",
    },
    {
      name: "便携蓝牙音箱",
      description: "IPX7 防水，360° 环绕音效，户外必备。",
      price: 15900,
      stock: 100,
      categoryName: "数码家电",
      imageSeed: "speaker",
    },
    // 服装鞋包
    {
      name: "纯棉基础T恤",
      description: "100% 新疆棉，透气亲肤，多色可选。",
      price: 5900,
      stock: 500,
      categoryName: "服装鞋包",
      imageSeed: "tshirt",
    },
    {
      name: "休闲帆布鞋",
      description: "经典款帆布鞋，防滑鞋底，百搭耐穿。",
      price: 9900,
      stock: 300,
      categoryName: "服装鞋包",
      imageSeed: "sneaker",
    },
    {
      name: "简约双肩包",
      description: "大容量多隔层，防泼水面料，通勤旅行两用。",
      price: 16900,
      stock: 250,
      categoryName: "服装鞋包",
      imageSeed: "backpack",
    },
    // 家居生活
    {
      name: "北欧风台灯",
      description: "三档调光，护眼暖光，简约设计点亮书桌。",
      price: 8900,
      stock: 120,
      categoryName: "家居生活",
      imageSeed: "lamp",
    },
    {
      name: "香薰蜡烛礼盒",
      description: "天然大豆蜡，四款香型，营造温馨氛围。",
      price: 7900,
      stock: 180,
      categoryName: "家居生活",
      imageSeed: "candle",
    },
    {
      name: "记忆棉枕头",
      description: "慢回弹记忆棉，贴合颈椎曲线，改善睡眠。",
      price: 13900,
      stock: 160,
      categoryName: "家居生活",
      imageSeed: "pillow",
    },
    // 食品饮料
    {
      name: "精品挂耳咖啡",
      description: "精选阿拉比卡豆，中度烘焙，一盒 10 包。",
      price: 4500,
      stock: 400,
      categoryName: "食品饮料",
      imageSeed: "coffee",
    },
    {
      name: "手工曲奇饼干",
      description: "黄油曲奇，酥脆香甜，下午茶好伴侣。",
      price: 3900,
      stock: 350,
      categoryName: "食品饮料",
      imageSeed: "cookie",
    },
    {
      name: "高山绿茶",
      description: "明前采摘，清香回甘，罐装 250g。",
      price: 11900,
      stock: 220,
      categoryName: "食品饮料",
      imageSeed: "greentea",
    },
  ];

  let created = 0;
  for (const p of products) {
    // 用「分类名+商品名」做唯一标识，通过 findFirst 判断是否已存在
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          imageUrl: `https://picsum.photos/seed/${p.imageSeed}/800/600`,
          categoryId: categories[p.categoryName],
        },
      });
      created++;
    }
  }
  console.log(`✅ 已创建 ${created} 个商品（共 ${products.length} 个定义，重复则跳过）`);
}

main()
  .catch((e) => {
    console.error("❌ 种子数据执行失败：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
