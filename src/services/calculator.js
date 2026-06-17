const { STAR_PRICES } = require("../config/catalog");
const { formatNumber } = require("../utils/format");

const PAYMENT_METHODS = [
  { name: "LZTMarket", multiplier: 1.0 },
  { name: "CryptoBot", multiplier: 1.0 },
  { name: "Heleket", multiplier: 0.985 },
  { name: "DigitalPay", multiplier: 1.03 },
];

const EXCHANGE_RATES = {
  UZS_TO_RUB: 52,
  RUB_TO_USD: 100,
  TON_TO_RUB: 75,
};

function getSortedPackages() {
  return Object.entries(STAR_PRICES)
    .map(([amount, price]) => ({ amount: Number(amount), price: Number(price) }))
    .sort((left, right) => left.amount - right.amount);
}

function estimateBaseUzs(starsAmount) {
  const packages = getSortedPackages();
  const exact = packages.find((entry) => entry.amount === starsAmount);

  if (exact) {
    return exact.price;
  }

  const bestTier = packages.reduce((best, current) => {
    const currentUnit = current.price / current.amount;

    if (!best) {
      return { ...current, unitPrice: currentUnit };
    }

    return currentUnit < best.unitPrice ? { ...current, unitPrice: currentUnit } : best;
  }, null);

  return Math.round(bestTier.unitPrice * starsAmount);
}

function roundCurrency(value) {
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Number(value.toFixed(1));
  return Number(value.toFixed(2));
}

function starWord(lang) {
  if (lang === "ru") return "звезд";
  if (lang === "uz") return "ta yulduz";
  return "stars";
}

function getLocalizedAmounts(baseUzs, lang) {
  const baseRub = baseUzs / EXCHANGE_RATES.UZS_TO_RUB;
  const baseUsd = baseRub / EXCHANGE_RATES.RUB_TO_USD;

  if (lang === "uz") {
    return {
      currency: "UZS",
      valueForMethod: (multiplier) => roundCurrency(baseUzs * multiplier),
      tonAmount: Number((baseRub / EXCHANGE_RATES.TON_TO_RUB).toFixed(4)),
      usdtTonAmount: Number(baseUsd.toFixed(2)),
    };
  }

  if (lang === "en") {
    return {
      currency: "USD",
      valueForMethod: (multiplier) => roundCurrency(baseUsd * multiplier),
      tonAmount: Number((baseRub / EXCHANGE_RATES.TON_TO_RUB).toFixed(4)),
      usdtTonAmount: Number(baseUsd.toFixed(2)),
    };
  }

  return {
    currency: "RUB",
    valueForMethod: (multiplier) => roundCurrency(baseRub * multiplier),
    tonAmount: Number((baseRub / EXCHANGE_RATES.TON_TO_RUB).toFixed(4)),
    usdtTonAmount: Number(baseUsd.toFixed(2)),
  };
}

function buildCalculatorText(lang, starsAmount) {
  const baseUzs = estimateBaseUzs(starsAmount);
  const localized = getLocalizedAmounts(baseUzs, lang);

  const labels = {
    uz: {
      intro: "Yuqorida mavjud to‘lov usullari bo‘yicha narx ko‘rsatilgan.",
      askAgain: "🚀 Yana hisoblash uchun kerakli qiymatni yuboring:",
    },
    ru: {
      intro: "Выше представлена стоимость в доступных методах оплаты с учетом комиссии.",
      askAgain: "🚀 Введите требуемое значение для расчета:",
    },
    en: {
      intro: "The cost above is shown across available payment methods including commission.",
      askAgain: "🚀 Enter the required amount for calculation:",
    },
  };

  const tx = labels[lang] || labels.uz;

  const methodLines = PAYMENT_METHODS.map((method) => {
    const value = localized.valueForMethod(method.multiplier);
    return `<b>${method.name}:</b> ${formatNumber(value)} ${localized.currency}`;
  }).join("\n");

  return (
    `${methodLines}\n` +
    `<b>TON | USDT TON</b>\n` +
    `├ ${localized.tonAmount} TON\n` +
    `└ ${localized.usdtTonAmount} USDT-TON\n\n` +
    `<i>${tx.intro} ${formatNumber(starsAmount)} ${starWord(lang)}.</i>\n\n` +
    `${tx.askAgain}`
  );
}

function parseCalculatorAmount(text) {
  const normalized = String(text || "").replace(/[^\d]/g, "");
  if (!normalized) return null;

  const value = Number(normalized);
  if (!Number.isInteger(value) || value <= 0) return null;

  return value;
}

module.exports = {
  buildCalculatorText,
  parseCalculatorAmount,
};
