/**
 * Partner Portal F5 — the demo's "Self-Stocking vs Reseller Brain" maths (unchanged).
 *
 * Model A (self-stocking): the weekly budget goes to ads, and every order also locks its
 *   wholesale price in stock. Landed cost = wholesale + warehouse + packaging + damage risk.
 * Model B (Reseller Brain): no stock, so the same total capital (ads + would-be stock) all goes
 *   to ads. Cost per order = the Reseller Brain price.
 */
export const DEFAULTS = {
  dollarRate: 125,
  cpaUsd: 1.15,
  initialAdBudget: 10000,
  wholesalePrice: 500,
  warehouseCost: 5,
  packagingCost: 20,
  damageRiskCost: 20,
  rbDropshipPrice: 580,
  sellingPrice: 745,
};

const n = (v, fallback = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
};

export function calculatePitch(c) {
  const rate = n(c.dollarRate) > 0 ? n(c.dollarRate) : 125;
  const cpaUsd = n(c.cpaUsd) > 0 ? n(c.cpaUsd) : 1.15;
  const cpaBdt = cpaUsd * rate;
  const budget = Math.max(0, n(c.initialAdBudget));

  // Model A — self-stocking
  const selfOrders = cpaBdt > 0 ? Math.round(budget / cpaBdt) : 0;
  const lockedStockCapital = selfOrders * n(c.wholesalePrice);
  const totalWeeklyCapital = budget + lockedStockCapital;
  const selfLandedCost = n(c.wholesalePrice) + n(c.warehouseCost) + n(c.packagingCost) + n(c.damageRiskCost);
  const selfProfitPerOrder = n(c.sellingPrice) - selfLandedCost;
  const selfWeeklyProfit = selfOrders * selfProfitPerOrder;

  // Model B — Reseller Brain: the whole capital buys ads
  const rbWeeklyOrders = cpaBdt > 0 ? Math.round(totalWeeklyCapital / cpaBdt) : 0;
  const rbProfitPerOrder = n(c.sellingPrice) - n(c.rbDropshipPrice);
  const rbWeeklyProfit = rbWeeklyOrders * rbProfitPerOrder;

  return {
    rate, cpaUsd, cpaBdt, budget,
    selfOrders, selfDailyOrders: selfOrders / 7, lockedStockCapital, totalWeeklyCapital,
    selfLandedCost, selfProfitPerOrder, selfWeeklyProfit, selfDailyProfit: selfWeeklyProfit / 7, selfMonthlyProfit: (selfWeeklyProfit / 7) * 30,
    rbWeeklyOrders, rbDailyOrders: rbWeeklyOrders / 7, rbDailyAdBdt: totalWeeklyCapital / 7,
    rbProfitPerOrder, rbWeeklyProfit, rbDailyProfit: rbWeeklyProfit / 7, rbMonthlyProfit: (rbWeeklyProfit / 7) * 30,
    orderMultiplier: selfOrders > 0 ? rbWeeklyOrders / selfOrders : 0,
    extraProfit: rbWeeklyProfit - selfWeeklyProfit,
    extraDailyProfit: (rbWeeklyProfit - selfWeeklyProfit) / 7,
    extraMonthlyProfit: ((rbWeeklyProfit - selfWeeklyProfit) / 7) * 30,
  };
}

const money = (v) => `৳${Math.round(v).toLocaleString("en-BD")}`;

/**
 * Draws the client proposal card (1200×900 PNG) — the demo's "Download Proposal".
 * English text so it reads the same for every client.
 */
export function drawProposalCard(canvas, { calc, metrics: m, partnerName, productName }) {
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const font = (w, s) => `${w} ${s}px Inter, "Hind Siliguri", sans-serif`;
  const box = (x, y, w, h, r, fill, stroke) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  };
  const text = (t, x, y, f, color, align = "left") => { ctx.font = f; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(t, x, y); };

  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, 1200, 900);

  // Header
  const g = ctx.createLinearGradient(40, 0, 1160, 0);
  g.addColorStop(0, "#0F766E");
  g.addColorStop(1, "#10B981");
  box(40, 35, 1120, 130, 24, g);
  text("CLIENT ROI & DROPSHIPPING PROFIT PROPOSAL", 75, 78, font("bold", 16), "#CCFBF1");
  text(`${partnerName || "Partner"}  ×  Reseller Brain`, 75, 118, font("bold", 30), "#FFFFFF");
  text(`100% budget in marketing — zero stock hassle${productName ? `  ·  ${productName}` : ""}  ·  ${new Date().toLocaleDateString("en-GB")}`, 75, 148, font("normal", 15), "#ECFDF5");

  // Inputs bar
  box(40, 185, 1120, 90, 20, "#FFFFFF", "#E2E8F0");
  const params = [
    ["Weekly ad budget", money(m.budget)],
    ["Cost per order", `$${m.cpaUsd.toFixed(2)} (${money(m.cpaBdt)})`],
    ["Wholesale price", money(calc.wholesalePrice)],
    ["Reseller Brain price", money(calc.rbDropshipPrice)],
    ["Selling price", money(calc.sellingPrice)],
  ];
  params.forEach(([l, v], i) => {
    const x = 75 + i * 220;
    text(l.toUpperCase(), x, 220, font("bold", 12), "#64748B");
    text(v, x, 252, font("bold", 20), "#0F172A");
  });

  // Two models
  const col = (x, title, accent, bg, rows, profit, sub) => {
    box(x, 300, 545, 330, 22, bg, accent);
    text(title, x + 30, 345, font("bold", 22), accent);
    rows.forEach(([l, v], i) => {
      text(l, x + 30, 395 + i * 38, font("normal", 17), "#334155");
      text(v, x + 515, 395 + i * 38, font("bold", 18), "#0F172A", "right");
    });
    text("Weekly net profit", x + 30, 575, font("bold", 15), "#475569");
    text(money(profit), x + 515, 585, font("bold", 34), accent, "right");
    text(sub, x + 30, 610, font("normal", 14), "#64748B");
  };
  col(40, "Model A: Self-Stocking", "#E11D48", "#FFF1F2", [
    ["Weekly orders", Math.round(m.selfOrders).toLocaleString("en-BD")],
    ["Capital locked in stock", money(m.lockedStockCapital)],
    ["Landed cost / unit", money(m.selfLandedCost)],
    ["Profit / order", money(m.selfProfitPerOrder)],
  ], m.selfWeeklyProfit, `30-day est. ${money(m.selfMonthlyProfit)}`);
  col(615, "Model B: Automatic Dropshipping", "#0F766E", "#F0FDFA", [
    ["Weekly orders", Math.round(m.rbWeeklyOrders).toLocaleString("en-BD")],
    ["Capital locked in stock", money(0)],
    ["Full ad budget", money(m.totalWeeklyCapital)],
    ["Profit / order", money(m.rbProfitPerOrder)],
  ], m.rbWeeklyProfit, `30-day est. ${money(m.rbMonthlyProfit)}`);

  // Spotlight
  const g2 = ctx.createLinearGradient(40, 0, 1160, 0);
  g2.addColorStop(0, "#059669");
  g2.addColorStop(1, "#0D9488");
  box(40, 655, 1120, 150, 24, g2);
  text("EXTRA NET PROFIT WITH THE SAME CAPITAL", 75, 698, font("bold", 15), "#D1FAE5");
  text(`${m.extraProfit >= 0 ? "+" : "−"}${money(Math.abs(m.extraProfit))} / week`, 75, 752, font("bold", 44), "#FFFFFF");
  text(`${m.orderMultiplier.toFixed(1)}× more orders  ·  ${money(m.extraDailyProfit)} extra / day  ·  ${money(m.extraMonthlyProfit)} extra / 30 days`, 75, 785, font("normal", 17), "#ECFDF5");

  text("Estimate for discussion. Real results depend on ad performance. Reseller Brain — resellerbrain.com", 600, 850, font("normal", 14), "#64748B", "center");
}
