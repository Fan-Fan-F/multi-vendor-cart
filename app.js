// 多商户拆单演示 UI
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => "¥" + n.toFixed(2);

  const cart = {}; // productId -> qty

  /* ---------- 商品列表 ---------- */
  function renderProducts() {
    $("#productList").innerHTML = PRODUCTS.map(p => `
      <div class="p-row">
        <div class="p-emoji" style="background:hsl(${p.hue},65%,92%)">${p.emoji}</div>
        <div class="p-info">
          <p class="p-name">${p.name}</p>
          <p class="p-seller">🏪 ${SELLERS[p.sellerId].name} · ${p.weight}kg</p>
        </div>
        <span class="p-price">${fmt(p.price)}</span>
        <div class="p-qty">
          <button data-dec="${p.id}">−</button>
          <span>${cart[p.id] || 0}</span>
          <button data-inc="${p.id}">＋</button>
        </div>
      </div>
    `).join("");
  }

  $("#productList").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (inc) cart[inc.dataset.inc] = (cart[inc.dataset.inc] || 0) + 1;
    if (dec) {
      const id = dec.dataset.dec;
      cart[id] = (cart[id] || 0) - 1;
      if (cart[id] <= 0) delete cart[id];
    }
    renderProducts();
    recalc();
  });

  /* ---------- 平台券 ---------- */
  $("#platSelect").innerHTML = PLATFORM_COUPONS.map(p =>
    `<option value="${p.id}">${p.name}</option>`).join("");
  $("#platSelect").addEventListener("change", recalc);

  /* ---------- 拆单 ---------- */
  function recalc() {
    const items = Object.entries(cart).map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      return { ...p, qty };
    });

    if (!items.length) {
      $("#subOrders").innerHTML = `<p class="empty-cart">从左侧加购商品，这里实时展示拆单结果</p>`;
      $("#summaryCard").hidden = true;
      return;
    }

    const platCoupon = PLATFORM_COUPONS.find(p => p.id === $("#platSelect").value).coupon;
    const result = SplitEngine.split(items, SELLERS, platCoupon);

    $("#subOrders").innerHTML = result.subOrders.map((o, i) => `
      <div class="sub-order">
        <div class="so-head">
          <span class="so-seller">📦 子订单 ${i + 1} · ${o.sellerName}</span>
          <span class="so-no">SO-${Date.now().toString().slice(-6)}-${i + 1}</span>
        </div>
        <div class="so-items">
          ${o.items.map(it => `${it.emoji} ${it.name} × ${it.qty} — ${fmt(it.price * it.qty)}`).join("<br>")}
        </div>
        <div class="so-lines">
          <div class="so-line"><span>商品金额</span><b>${fmt(o.goodsAmount)}</b></div>
          <div class="so-line"><span>店铺券${o.coupon ? ` <span class="coupon-tag">${o.coupon.id} 满${o.coupon.minSpend}减${o.coupon.value}</span>` : "（无可用）"}</span>
            <span class="neg">-${fmt(o.couponDiscount)}</span></div>
          <div class="so-line ${o.freeShipping ? "ship-free" : ""}"><span>运费</span>
            <span>${o.freeShipping ? `<span class="free-tag">免运费</span>` : fmt(o.shipping)}</span></div>
          ${o.platformShare ? `<div class="so-line"><span>平台券分摊</span><span class="neg">-${fmt(o.platformShare)}</span></div>` : ""}
        </div>
        <div class="so-pay"><span>本子单应付</span><strong>${fmt(o.payable)}</strong></div>
      </div>
    `).join("");

    const s = result.summary;
    $("#summaryCard").hidden = false;
    $("#summaryCard").innerHTML = `
      <h3>汇总（共拆出 ${s.orderCount} 个子订单）</h3>
      <div class="sm-row"><span>商品总额</span><span>${fmt(s.goodsTotal)}</span></div>
      <div class="sm-row"><span>店铺券合计</span><span class="neg">-${fmt(s.sellerCouponTotal)}</span></div>
      <div class="sm-row"><span>平台券合计</span><span class="neg">-${fmt(s.platformDiscount)}</span></div>
      <div class="sm-row"><span>运费合计</span><span>${fmt(s.shippingTotal)}</span></div>
      <div class="sm-total"><span>应付总额</span><strong>${fmt(s.payableTotal)}</strong></div>
      <p class="sm-note">平台券已按各子订单券后金额占比精确分摊到分，末单承担舍入差。</p>`;
  }

  renderProducts();
  recalc();
})();
