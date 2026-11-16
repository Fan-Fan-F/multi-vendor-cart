// 演示数据：平台商品 + 商户规则（原创虚构）
const SELLERS = {
  s1: {
    name: "数码优选旗舰店",
    shipping: { base: 8, perKg: 4, freeOver: 299 },
    coupons: [
      { id: "S1A", minSpend: 300, value: 30 },
      { id: "S1B", minSpend: 600, value: 80 },
    ],
  },
  s2: {
    name: "MUYU 家居馆",
    shipping: { base: 6, perKg: 3, freeOver: 99 },
    coupons: [
      { id: "S2A", minSpend: 99, value: 10 },
      { id: "S2B", minSpend: 199, value: 25 },
    ],
  },
  s3: {
    name: "环球食品直邮",
    shipping: { base: 15, perKg: 8, freeOver: 199 },
    coupons: [
      { id: "S3A", minSpend: 150, value: 15 },
    ],
  },
};

const PRODUCTS = [
  { id: "p1", name: "三模机械键盘 87 键", price: 329, sellerId: "s1", weight: 1.1, emoji: "⌨️", hue: 250 },
  { id: "p2", name: "无线鼠标 静音版", price: 69, sellerId: "s1", weight: 0.15, emoji: "🖱️", hue: 240 },
  { id: "p3", name: "显示器挂灯", price: 129, sellerId: "s1", weight: 0.5, emoji: "💡", hue: 230 },
  { id: "p4", name: "极简陶瓷马克杯", price: 49, sellerId: "s2", weight: 0.4, emoji: "☕", hue: 15 },
  { id: "p5", name: "北欧原木台灯", price: 199, sellerId: "s2", weight: 1.2, emoji: "🛋️", hue: 45 },
  { id: "p6", name: "桌面收纳五件套", price: 79, sellerId: "s2", weight: 0.8, emoji: "🗃️", hue: 30 },
  { id: "p7", name: "进口坚果礼盒 1kg", price: 128, sellerId: "s3", weight: 1.0, emoji: "🥜", hue: 35 },
  { id: "p8", name: "哥伦比亚咖啡豆 500g", price: 98, sellerId: "s3", weight: 0.5, emoji: "🫘", hue: 20 },
  { id: "p9", name: "比利时黑巧克力 300g", price: 86, sellerId: "s3", weight: 0.3, emoji: "🍫", hue: 10 },
];

const PLATFORM_COUPONS = [
  { id: "none", name: "不使用平台券", coupon: null },
  { id: "plat10", name: "平台券：满 300 打 9 折（封顶 50）", coupon: { type: "percent", value: 10, minSpend: 300, cap: 50 } },
  { id: "plat30", name: "平台券：满 200 减 30", coupon: { type: "flat", value: 30, minSpend: 200 } },
];
