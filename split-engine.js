/**
 * SplitEngine — 多商户购物车拆单引擎（纯逻辑，Node/浏览器通用）
 *
 * 核心职责：把跨商户购物车拆成各商户子订单，分别套用
 * 商户券 / 商户运费规则，最后再套平台级优惠并向下分摊。
 */
"use strict";

const SplitEngine = (() => {

  /**
   * @param cartItems  [{ id, name, price, qty, sellerId, weight }]
   * @param sellers    { sellerId: { name, shipping: {base, freeOver}, coupons: [{id,minSpend,value}] } }
   * @param platformCoupon  { type: "percent"|"flat", value, minSpend, cap } 可空
   */
  function split(cartItems, sellers, platformCoupon = null) {
    // 1. 按商户分组
    const groups = new Map();
    for (const it of cartItems) {
      if (!groups.has(it.sellerId)) groups.set(it.sellerId, []);
      groups.get(it.sellerId).push(it);
    }

    // 2. 逐商户计算子订单
    const subOrders = [...groups.entries()].map(([sellerId, items]) => {
      const seller = sellers[sellerId];
      if (!seller) throw new Error(`unknown seller: ${sellerId}`);

      const goodsAmount = items.reduce((s, i) => s + i.price * i.qty, 0);
      const totalWeight = items.reduce((s, i) => s + (i.weight || 0) * i.qty, 0);

      // 商户券：取满足门槛的最优一张
      const bestCoupon = (seller.coupons || [])
        .filter(c => goodsAmount >= c.minSpend)
        .sort((a, b) => b.value - a.value)[0] || null;
      const couponDiscount = bestCoupon ? Math.min(bestCoupon.value, goodsAmount) : 0;

      // 运费：券后金额达标也免邮（常见规则：按券前判断的商家也存在，这里用券前金额）
      const shipping = seller.shipping.freeOver != null && goodsAmount >= seller.shipping.freeOver
        ? 0
        : seller.shipping.base + Math.max(0, totalWeight - 1) * (seller.shipping.perKg || 0);

      return {
        sellerId,
        sellerName: seller.name,
        items,
        goodsAmount: round2(goodsAmount),
        coupon: bestCoupon,
        couponDiscount: round2(couponDiscount),
        shipping: round2(shipping),
        freeShipping: shipping === 0,
        amountAfterCoupon: round2(goodsAmount - couponDiscount),
      };
    });

    // 3. 平台券：按各子订单券后金额占比分摊（保证可精确到分）
    const totalAfterSeller = subOrders.reduce((s, o) => s + o.amountAfterCoupon, 0);
    let platformDiscount = 0;
    if (platformCoupon && totalAfterSeller >= (platformCoupon.minSpend || 0)) {
      platformDiscount = platformCoupon.type === "percent"
        ? Math.min(totalAfterSeller * platformCoupon.value / 100, platformCoupon.cap || Infinity)
        : Math.min(platformCoupon.value, totalAfterSeller);
      platformDiscount = round2(platformDiscount);

      let allocated = 0;
      subOrders.forEach((o, idx) => {
        if (idx === subOrders.length - 1) {
          // 最后一单吃掉舍入差
          o.platformShare = round2(platformDiscount - allocated);
        } else {
          o.platformShare = round2(platformDiscount * o.amountAfterCoupon / totalAfterSeller);
          allocated += o.platformShare;
        }
        o.payable = round2(Math.max(0, o.amountAfterCoupon - o.platformShare) + o.shipping);
      });
    } else {
      subOrders.forEach(o => {
        o.platformShare = 0;
        o.payable = round2(o.amountAfterCoupon + o.shipping);
      });
    }

    return {
      subOrders,
      platformDiscount,
      summary: {
        goodsTotal: round2(subOrders.reduce((s, o) => s + o.goodsAmount, 0)),
        sellerCouponTotal: round2(subOrders.reduce((s, o) => s + o.couponDiscount, 0)),
        platformDiscount,
        shippingTotal: round2(subOrders.reduce((s, o) => s + o.shipping, 0)),
        payableTotal: round2(subOrders.reduce((s, o) => s + o.payable, 0)),
        orderCount: subOrders.length,
      },
    };
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  return { split };
})();

if (typeof module !== "undefined") module.exports = SplitEngine;
