require("dotenv").config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (typeof value === "undefined") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 3000),
  botToken: process.env.BOT_TOKEN || "",
  mongoUri: process.env.MONGODB_URI || "",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  adminChatIds: (process.env.ADMIN_CHAT_IDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  logLevel: process.env.LOG_LEVEL || "info",
  defaultCurrency: process.env.DEFAULT_CURRENCY || "UZS",
  walletMinTopup: toNumber(process.env.WALLET_MIN_TOPUP, 10000),
  walletReferralBonus: toNumber(process.env.REFERRAL_BONUS_AMOUNT, 5000),
  referredUserBonus: toNumber(process.env.REFERRED_USER_BONUS_AMOUNT, 2000),
  rewardReferralOnFirstTopup: toBoolean(process.env.REFERRAL_REWARD_ON_FIRST_TOPUP, true),
  telegramStarsProviderToken: process.env.TELEGRAM_STARS_PROVIDER_TOKEN || "",
  telegramStarsRate: toNumber(process.env.TELEGRAM_STARS_RATE, 1000),
  paymeMerchantId: process.env.PAYME_MERCHANT_ID || "",
  paymeSecretKey: process.env.PAYME_SECRET_KEY || "",
  paymeCallbackToken: process.env.PAYME_CALLBACK_TOKEN || "",
  paymeCheckoutUrlTemplate:
    process.env.PAYME_CHECKOUT_URL_TEMPLATE ||
    "https://checkout.paycom.uz/{merchantId}?amount={amount}&account[transactionId]={transactionId}",
  clickServiceId: process.env.CLICK_SERVICE_ID || "",
  clickMerchantId: process.env.CLICK_MERCHANT_ID || "",
  clickSecretKey: process.env.CLICK_SECRET_KEY || "",
  clickCheckoutUrlTemplate:
    process.env.CLICK_CHECKOUT_URL_TEMPLATE ||
    "https://my.click.uz/services/pay?service_id={serviceId}&merchant_id={merchantId}&amount={amount}&transaction_param={transactionId}",
};

function validateEnv() {
  const missing = [];

  if (!env.botToken) missing.push("BOT_TOKEN");
  if (!env.mongoUri) missing.push("MONGODB_URI");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

module.exports = {
  env,
  validateEnv,
};
