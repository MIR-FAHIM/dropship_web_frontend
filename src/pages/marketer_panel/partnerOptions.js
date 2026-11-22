// Partner Portal F8: choices shared by partner sign-up, profile settings and the admin view.
// Keys match MarketerProfile::NICHES / CAMPAIGN_TYPES on the API.
export const NICHES = [
  ["gadgets_electronics", "Smart Gadgets & Electronics", "স্মার্ট গ্যাজেট ও ইলেকট্রনিক্স"],
  ["fashion_beauty", "Fashion & Lifestyle", "ফ্যাশন ও লাইফস্টাইল"],
  ["health_lifestyle", "Health, Beauty & Organic", "হেলথ, বিউটি ও অর্গানিক"],
  ["home_kitchen", "Home Decor & Kitchen", "হোম ডেকর ও কিচেন"],
  ["kids_toys", "Kids & Toys", "কিডস ও টয়স"],
  ["general", "General / Mixed", "জেনারেল / মিক্সড"],
];

export const CAMPAIGN_TYPES = [
  ["purchase_website", "Purchase Campaign (Website/Pixel)", "পারচেজ ক্যাম্পেইন (ওয়েবসাইট/পিক্সেল)"],
  ["messenger", "Message Campaign (Inbox/WhatsApp)", "মেসেজ ক্যাম্পেইন (ইনবক্স/হোয়াটসঅ্যাপ)"],
  ["mixed", "Both Purchase & Message", "পারচেজ ও মেসেজ দুটোই"],
  ["tiktok_shop", "TikTok Shop / TikTok Ads", "টিকটক শপ / টিকটক অ্যাডস"],
];

export const labelOf = (list, key, lang = "en") => {
  const row = list.find((x) => x[0] === key);
  return row ? (lang === "bn" ? row[2] : row[1]) : key || "—";
};

/** The demo's level rule: Upper Level (Pro) if ad spend ≥ $10,000 or ≥ 100 campaigns. */
export const levelFor = (spendUsd, campaigns) =>
  Number(spendUsd) >= 10000 || Number(campaigns) >= 100 ? "pro" : "mid";

export const LEVEL_LABEL = { pro: ["Upper Level (Pro)", "আপার লেভেল (প্রো)"], mid: ["Mid Level", "মিড লেভেল"] };
