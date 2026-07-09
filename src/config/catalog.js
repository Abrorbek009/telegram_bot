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
    amount: 45000,
    durationDays: 30,
    titles: {
      uz: "1 oy (akauntga ulanib)",
      ru: "1 месяц (с привязкой к аккаунту)",
      en: "1 month (linked to account)",
    },
  },
  "3m_nolink": {
    amount: 198000,
    durationDays: 90,
    titles: {
      uz: "3 oy (ulanmasdan)",
      ru: "3 месяца (без привязки)",
      en: "3 months (without linking)",
    },
  },
  "6m_nolink": {
    amount: 260000,
    durationDays: 180,
    titles: {
      uz: "6 oy (ulanmasdan)",
      ru: "6 месяцев (без привязки)",
      en: "6 months (without linking)",
    },
  },
  "1y_nolink": {
    amount: 379999,
    durationDays: 365,
    titles: {
      uz: "1 yil (ulanmasdan)",
      ru: "1 год (без привязки)",
      en: "1 year (without linking)",
    },
  },
  "1y_link": {
    amount: 299000,
    durationDays: 365,
    titles: {
      uz: "1 yil (akauntga ulanib)",
      ru: "1 год (с привязкой к аккаунту)",
      en: "1 year (linked to account)",
    },
  },
};

module.exports = {
  ADMIN_URL,
  ADMIN_USERNAME,
  PREMIUM_PLANS,
  STAR_PRICES,
};
