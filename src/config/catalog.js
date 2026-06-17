const ADMIN_USERNAME = "muxammadjonovw";
const ADMIN_URL = `https://t.me/${ADMIN_USERNAME}`;

const STAR_PRICES = {
  15: 3999,
  100: 26000,
  150: 36999,
  250: 59999,
  350: 83999,
  500: 117999,
  750: 175999,
  1000: 233999,
  1500: 349999,
  2500: 579999,
  5000: 1159999,
  10000: 2299999,
  50000: 11599999,
  100000: 22999999,
};

const PREMIUM_PLANS = {
  "1m_link": {
    title: {
      uz: "✅ 1 oy (akauntga ulanib)",
      ru: "✅ 1 месяц (с привязкой к аккаунту)",
      en: "✅ 1 month (linked to account)",
    },
    price: {
      uz: "45 000 so‘m yoki 45 olmos",
      ru: "45 000 сум или 45 алмазов",
      en: "45,000 UZS or 45 diamonds",
    },
  },
  "3m_nolink": {
    title: {
      uz: "✅ 3 oy (ulanmasdan)",
      ru: "✅ 3 месяца (без привязки)",
      en: "✅ 3 months (without linking)",
    },
    price: {
      uz: "198 000 so‘m",
      ru: "198 000 сум",
      en: "198,000 UZS",
    },
  },
  "6m_nolink": {
    title: {
      uz: "✅ 6 oy (ulanmasdan)",
      ru: "✅ 6 месяцев (без привязки)",
      en: "✅ 6 months (without linking)",
    },
    price: {
      uz: "260 000 so‘m",
      ru: "260 000 сум",
      en: "260,000 UZS",
    },
  },
  "1y_nolink": {
    title: {
      uz: "✅ 1 yil (ulanmasdan)",
      ru: "✅ 1 год (без привязки)",
      en: "✅ 1 year (without linking)",
    },
    price: {
      uz: "379 999 so‘m 👻 (asl narxida 😍)",
      ru: "379 999 сум 👻 (по обычной цене 😍)",
      en: "379,999 UZS 👻 (regular price 😍)",
    },
  },
  "1y_link": {
    title: {
      uz: "✅ 1 yil (akauntga ulanib)",
      ru: "✅ 1 год (с привязкой к аккаунту)",
      en: "✅ 1 year (linked to account)",
    },
    price: {
      uz: "299 000 so‘m",
      ru: "299 000 сум",
      en: "299,000 UZS",
    },
  },
};

module.exports = {
  ADMIN_URL,
  ADMIN_USERNAME,
  PREMIUM_PLANS,
  STAR_PRICES,
};
