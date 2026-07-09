# Wallet Upgrade Files`r`n`r`nGenerated source snapshot for the wallet system upgrade.`r`n`r`nNote: `package-lock.json` was updated automatically by `npm install` and is not duplicated here because it is generated.`r`n
## .gitignore

`$lang
node_modules
.env
data/
logs/

`$([Environment]::NewLine)
## .env.example

`$lang
BOT_TOKEN=your_bot_token_here
MONGODB_URI=mongodb://127.0.0.1:27017/telegram_wallet_bot
PORT=3000
APP_BASE_URL=https://your-domain.com
ADMIN_CHAT_IDS=123456789,987654321
LOG_LEVEL=info
DEFAULT_CURRENCY=UZS
WALLET_MIN_TOPUP=10000
REFERRAL_BONUS_AMOUNT=5000
REFERRED_USER_BONUS_AMOUNT=2000
REFERRAL_REWARD_ON_FIRST_TOPUP=true
TELEGRAM_STARS_PROVIDER_TOKEN=
TELEGRAM_STARS_RATE=1000
PAYME_MERCHANT_ID=your_payme_merchant_id
PAYME_SECRET_KEY=your_payme_secret
PAYME_CALLBACK_TOKEN=your_payme_callback_token
PAYME_CHECKOUT_URL_TEMPLATE=https://checkout.paycom.uz/{merchantId}?amount={amount}&account[transactionId]={transactionId}
CLICK_SERVICE_ID=your_click_service_id
CLICK_MERCHANT_ID=your_click_merchant_id
CLICK_SECRET_KEY=your_click_secret
CLICK_CHECKOUT_URL_TEMPLATE=https://my.click.uz/services/pay?service_id={serviceId}&merchant_id={merchantId}&amount={amount}&transaction_param={transactionId}

`$([Environment]::NewLine)
## package.json

`$lang

{
  "name": "saveinstayutubetgbot",
  "version": "1.0.0",
  "description": "Telegram downloader bot for Instagram and YouTube",
  "main": "index.js",
  "type": "commonjs",
  "engine": {
    "node": ">=16.0.0"
  },
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "keywords": [
    "telegram",
    "bot",
    "downloader",
    "instagram",
    "youtube"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^16.5.0",
    "express": "^4.21.2",
    "mongoose": "^8.15.2",
    "node-telegram-bot-api": "^0.61.0",
    "winston": "^3.17.0"
  }
}

`$([Environment]::NewLine)
## index.js

`$lang
const TelegramBot = require("node-telegram-bot-api");
const { createApp } = require("./src/app");
const { connectMongo } = require("./src/db/mongoose");
const { registerHandlers } = require("./src/handlers");
const { env, validateEnv } = require("./src/config/env");
const { logger } = require("./src/services/logger");

async function bootstrap() {
  validateEnv();
  await connectMongo();

  const bot = new TelegramBot(env.botToken, { polling: true });
  registerHandlers(bot);

  const app = createApp();
  app.listen(env.port, () => {
    logger.info("HTTP server started", { port: env.port });
  });

  const me = await bot.getMe();
  logger.info("Telegram bot started", { username: me.username });
}

bootstrap().catch((error) => {
  logger.error("Application bootstrap failed", { error: error.message });
  process.exit(1);
});

`$([Environment]::NewLine)
## src/app.js

`$lang
const express = require("express");
const routes = require("./routes/webhooks");
const { logger } = require("./services/logger");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(routes);

  app.use((error, req, res, next) => {
    logger.error("Unhandled HTTP error", {
      error: error.message,
      path: req.path,
    });

    res.status(500).json({ ok: false, error: "Internal server error" });
  });

  return app;
}

module.exports = {
  createApp,
};

`$([Environment]::NewLine)
## src/config/env.js

`$lang
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

`$([Environment]::NewLine)
## src/config/catalog.js

`$lang
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
      ru: "1 РјРµСЃСЏС† (СЃ РїСЂРёРІСЏР·РєРѕР№ Рє Р°РєРєР°СѓРЅС‚Сѓ)",
      en: "1 month (linked to account)",
    },
  },
  "3m_nolink": {
    amount: 198000,
    durationDays: 90,
    titles: {
      uz: "3 oy (ulanmasdan)",
      ru: "3 РјРµСЃСЏС†Р° (Р±РµР· РїСЂРёРІСЏР·РєРё)",
      en: "3 months (without linking)",
    },
  },
  "6m_nolink": {
    amount: 260000,
    durationDays: 180,
    titles: {
      uz: "6 oy (ulanmasdan)",
      ru: "6 РјРµСЃСЏС†РµРІ (Р±РµР· РїСЂРёРІСЏР·РєРё)",
      en: "6 months (without linking)",
    },
  },
  "1y_nolink": {
    amount: 379999,
    durationDays: 365,
    titles: {
      uz: "1 yil (ulanmasdan)",
      ru: "1 РіРѕРґ (Р±РµР· РїСЂРёРІСЏР·РєРё)",
      en: "1 year (without linking)",
    },
  },
  "1y_link": {
    amount: 299000,
    durationDays: 365,
    titles: {
      uz: "1 yil (akauntga ulanib)",
      ru: "1 РіРѕРґ (СЃ РїСЂРёРІСЏР·РєРѕР№ Рє Р°РєРєР°СѓРЅС‚Сѓ)",
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

`$([Environment]::NewLine)
## src/controllers/webhook-controller.js

`$lang
const { confirmWebhookPayment, validateWebhook } = require("../services/payment-service");
const { logger } = require("../services/logger");

function createWebhookHandler(provider) {
  return async function webhookHandler(req, res) {
    try {
      const isValid = validateWebhook(provider, req.body || {}, req.headers || {});
      if (!isValid) {
        return res.status(401).json({ ok: false, error: "Invalid webhook signature" });
      }

      const result = await confirmWebhookPayment(provider, req.body || {});

      logger.info("Webhook payment confirmed", {
        provider,
        transactionId: result.transaction.transactionId,
      });

      return res.json({
        ok: true,
        transactionId: result.transaction.transactionId,
      });
    } catch (error) {
      logger.error("Webhook processing failed", {
        provider,
        error: error.message,
      });

      return res.status(500).json({ ok: false, error: error.message });
    }
  };
}

function healthController(req, res) {
  res.json({
    ok: true,
    service: "telegram-wallet-bot",
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  createWebhookHandler,
  healthController,
};

`$([Environment]::NewLine)
## src/db/mongoose.js

`$lang
const mongoose = require("mongoose");
const { env } = require("../config/env");
const { logger } = require("../services/logger");

async function connectMongo() {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });

  logger.info("MongoDB connected");
}

module.exports = {
  connectMongo,
};

`$([Environment]::NewLine)
## src/handlers.js

`$lang
const { env } = require("./config/env");
const { ADMIN_URL, ADMIN_USERNAME, PREMIUM_PLANS, STAR_PRICES } = require("./config/catalog");
const { getLang, hasLang, sendLanguageMenu } = require("./til/language");
const {
  buildProfileText,
  buildReferralText,
  buildTransactionHistoryText,
  getTexts,
  sendPremiumMenu,
  sendStarsMenu,
  sendTopupMenu,
  sendWelcomeAndMenu,
} = require("./sotuv/menu");
const { buildCalculatorText, parseCalculatorAmount } = require("./services/calculator");
const { clearSession, getSession, setSession } = require("./services/bot-session");
const { logger } = require("./services/logger");
const { ensureUserFromTelegram, getUserByChatId, syncUserLanguage } = require("./services/user-service");
const { getRecentTransactions, debitWallet, createTransaction } = require("./services/wallet-service");
const { createProviderTopup, confirmTelegramStarsPayment } = require("./services/payment-service");
const { redeemPromoCode } = require("./services/promo-service");
const {
  approvePremiumRequest,
  createPremiumRequest,
  getPendingPremiumRequests,
  rejectPremiumRequest,
} = require("./services/premium-service");
const { applyReferralFromStart } = require("./services/referral-service");
const { isAdminTelegramId, notifyAdmins } = require("./services/admin-service");
const { formatDate, formatNumber } = require("./utils/format");

function parseAmount(text) {
  const numeric = String(text || "").replace(/[^\d]/g, "");
  const value = Number(numeric);
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function sendProfile(bot, chatId, lang) {
  const user = await getUserByChatId(chatId);
  const transactions = user ? user.transactionsCount : 0;
  if (!user) return;

  await bot.sendMessage(chatId, buildProfileText(lang, user, transactions), {
    parse_mode: "HTML",
  });
}

async function sendHistory(bot, chatId, lang) {
  const user = await getUserByChatId(chatId);
  if (!user) return;

  const transactions = await getRecentTransactions(user._id, 10);
  await bot.sendMessage(chatId, buildTransactionHistoryText(lang, transactions), {
    parse_mode: "HTML",
  });
}

async function sendReferral(bot, chatId, lang) {
  const user = await getUserByChatId(chatId);
  if (!user) return;

  const deepLink = `https://t.me/${(await bot.getMe()).username}?start=${user.referralCode}`;
  const text = `${buildReferralText(lang, user)}\n\nLink:\n${deepLink}`;

  await bot.sendMessage(chatId, text, { parse_mode: "HTML" });
}

async function createTelegramStarsInvoice(bot, chatId, user, amount) {
  const transaction = await createProviderTopup(user, "telegram_stars", amount);
  const starsAmount = Math.max(1, Math.ceil(amount / env.telegramStarsRate));
  const payload = transaction.transactionId;

  await bot.sendInvoice(
    chatId,
    "Wallet top-up",
    `Wallet balansini ${formatNumber(amount)} ${env.defaultCurrency} ga to'ldirish`,
    payload,
    env.telegramStarsProviderToken,
    "XTR",
    [{ label: "Wallet top-up", amount: starsAmount }]
  );

  return transaction;
}

async function handleWalletStarsPurchase(bot, chatId, amount, lang) {
  const user = await getUserByChatId(chatId);
  const tx = getTexts(lang);
  const packagePrice = STAR_PRICES[amount];

  if (!user || !packagePrice) return;

  try {
    await debitWallet({
      user,
      amount: packagePrice,
      serviceType: "stars",
      metadata: { starsAmount: amount },
    });
  } catch (error) {
    await bot.sendMessage(chatId, tx.replies.insufficientBalance);
    return;
  }

  await bot.sendMessage(chatId, tx.replies.starsPurchased);

  await notifyAdmins(
    bot,
    `New stars wallet order\nUser: @${user.username || "no_username"}\nTelegram ID: ${user.telegramId}\nStars: ${amount}\nPaid from wallet: ${formatNumber(packagePrice)} ${env.defaultCurrency}`
  );
}

async function handlePremiumWalletPurchase(bot, chatId, planKey, lang) {
  const user = await getUserByChatId(chatId);
  const tx = getTexts(lang);

  if (!user) return;

  try {
    const { request, plan } = await createPremiumRequest(user, planKey);

    await bot.sendMessage(chatId, tx.replies.premiumPending);

    await notifyAdmins(bot, buildAdminPremiumRequestText(user, request, planKey, plan.amount), {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Approve", callback_data: `admin:premium:approve:${request.requestId}` },
            { text: "Reject", callback_data: `admin:premium:reject:${request.requestId}` },
          ],
        ],
      },
    });
  } catch (error) {
    const message =
      error.message === "Insufficient wallet balance" ? tx.replies.insufficientBalance : error.message;
    await bot.sendMessage(chatId, message);
  }
}

function buildAdminPremiumRequestText(user, request, planKey, amount) {
  return (
    `Premium request pending\n` +
    `Request ID: ${request.requestId}\n` +
    `User: @${user.username || "no_username"}\n` +
    `Telegram ID: ${user.telegramId}\n` +
    `Plan: ${planKey}\n` +
    `Amount: ${formatNumber(amount)} ${env.defaultCurrency}`
  );
}

function buildPremiumDecisionText(lang, approved, expiresAt, reason = "") {
  if (lang === "ru") {
    if (approved) {
      return `Р’Р°С€ Premium Р°РєС‚РёРІРёСЂРѕРІР°РЅ.\nР”РµР№СЃС‚РІСѓРµС‚ РґРѕ: ${formatDate(expiresAt)}`;
    }

    return `Р—Р°РїСЂРѕСЃ РЅР° Premium РѕС‚РєР»РѕРЅРµРЅ.${reason ? `\nРџСЂРёС‡РёРЅР°: ${reason}` : ""}`;
  }

  if (lang === "en") {
    if (approved) {
      return `Your Premium is activated.\nValid until: ${formatDate(expiresAt)}`;
    }

    return `Premium request was rejected.${reason ? `\nReason: ${reason}` : ""}`;
  }

  if (approved) {
    return `Premium faollashtirildi.\nAmal qilish muddati: ${formatDate(expiresAt)}`;
  }

  return `Premium so'rovi rad etildi.${reason ? `\nSabab: ${reason}` : ""}`;
}

async function handleSession(bot, msg, user, lang) {
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  const tx = getTexts(lang);

  if (!session) return false;

  if (session.state === "calculator") {
    const amount = parseCalculatorAmount(msg.text);
    if (!amount) {
      await bot.sendMessage(chatId, tx.replies.calcInvalid, { parse_mode: "HTML" });
      return true;
    }

    await bot.sendMessage(chatId, buildCalculatorText(lang, amount));
    return true;
  }

  if (session.state === "await_topup_amount") {
    const amount = parseAmount(msg.text);
    if (!amount) {
      await bot.sendMessage(chatId, tx.replies.amountInvalid);
      return true;
    }

    clearSession(chatId);

    if (session.data.provider === "telegram_stars") {
      await createTelegramStarsInvoice(bot, chatId, user, amount);
      return true;
    }

    const transaction = await createProviderTopup(user, session.data.provider, amount);
    const providerName = session.data.provider === "click" ? "Click" : "Payme";
    const paymentUrlLine = transaction.paymentUrl ? `Link: ${transaction.paymentUrl}` : "Payment URL not configured";

    await bot.sendMessage(
      chatId,
      tx.replies.topupCreated
        .replace("{provider}", providerName)
        .replace("{transactionId}", transaction.transactionId)
        .replace("{amount}", `${formatNumber(amount)} ${env.defaultCurrency}`)
        .replace("{paymentUrl}", paymentUrlLine) +
        `\n\n${tx.replies.webhookWaiting}`,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
    return true;
  }

  if (session.state === "await_promo_code") {
    clearSession(chatId);

    try {
      const result = await redeemPromoCode(user, msg.text);
      await bot.sendMessage(
        chatId,
        `Promo applied.\nBonus: ${formatNumber(result.promo.bonusAmount)} ${env.defaultCurrency}`
      );
    } catch (error) {
      await bot.sendMessage(chatId, error.message);
    }

    return true;
  }

  return false;
}

async function handleCallback(bot, q) {
  const chatId = q.message?.chat?.id;
  const data = q.data;

  if (!chatId || !data) return;

  const user = await ensureUserFromTelegram(q);
  const lang = getLang(chatId);

  if (data.startsWith("lang:")) {
    const nextLang = data.split(":")[1];
    if (!["uz", "ru", "en"].includes(nextLang)) return;

    await syncUserLanguage(chatId, nextLang);
    await bot.answerCallbackQuery(q.id, { text: "Language updated" });

    try {
      await bot.editMessageText("OK", {
        chat_id: chatId,
        message_id: q.message.message_id,
      });
    } catch (error) {}

    await sendWelcomeAndMenu(bot, { chat: { id: chatId }, from: q.from }, nextLang);
    return;
  }

  if (data.startsWith("topup:")) {
    const provider = data.split(":")[1];
    setSession(chatId, "await_topup_amount", { provider });
    await bot.answerCallbackQuery(q.id);
    await bot.sendMessage(chatId, getTexts(lang).replies.amountPrompt, { parse_mode: "HTML" });
    return;
  }

  if (data.startsWith("walletbuy:stars:")) {
    const starsAmount = Number(data.split(":")[2]);
    await bot.answerCallbackQuery(q.id);
    await handleWalletStarsPurchase(bot, chatId, starsAmount, lang);
    return;
  }

  if (data.startsWith("walletbuy:premium:")) {
    const planKey = data.split(":")[2];
    await bot.answerCallbackQuery(q.id);
    await handlePremiumWalletPurchase(bot, chatId, planKey, lang);
    return;
  }

  if (data.startsWith("admin:premium:")) {
    if (!isAdminTelegramId(q.from.id)) {
      await bot.answerCallbackQuery(q.id, { text: "Access denied" });
      return;
    }

    const [, , action, requestId] = data.split(":");

    try {
      if (action === "approve") {
        const result = await approvePremiumRequest(requestId, q.from.id);
        await bot.answerCallbackQuery(q.id, { text: "Approved" });
        await bot.sendMessage(
          result.user.chatId,
          buildPremiumDecisionText(result.user.language, true, result.expiresAt)
        );
      } else if (action === "reject") {
        const result = await rejectPremiumRequest(requestId, q.from.id, "Rejected by admin");
        await bot.answerCallbackQuery(q.id, { text: "Rejected" });
        await bot.sendMessage(
          result.user.chatId,
          buildPremiumDecisionText(result.user.language, false, null, "Rejected by admin")
        );
      }
    } catch (error) {
      await bot.answerCallbackQuery(q.id, { text: error.message });
    }

    return;
  }

  if (data === "history:refresh") {
    await bot.answerCallbackQuery(q.id);
    await sendHistory(bot, chatId, lang);
  }
}

async function handleTextMessage(bot, msg) {
  const chatId = msg.chat.id;

  if (msg.voice || msg.video_note || msg.video) {
    await bot.sendMessage(chatId, "Ovozli yoki video xabar yuborish mumkin emas.\nIltimos, matn yuboring.");
    return;
  }

  const text = msg.text;
  if (!text) return;

  const user = await ensureUserFromTelegram(msg);

  if (text.startsWith("/")) return;

  if (!hasLang(chatId)) {
    await sendLanguageMenu(bot, chatId);
    return;
  }

  const lang = getLang(chatId);
  const tx = getTexts(lang);

  const handledBySession = await handleSession(bot, msg, user, lang);
  if (handledBySession) return;

  if (text === tx.buttons.buyStars) {
    clearSession(chatId);
    await sendStarsMenu(bot, chatId, lang);
    return;
  }

  if (text === tx.buttons.buyPremium) {
    clearSession(chatId);
    await sendPremiumMenu(bot, chatId, lang);
    return;
  }

  if (text === tx.buttons.topUp) {
    clearSession(chatId);
    await sendTopupMenu(bot, chatId, lang);
    return;
  }

  if (text === tx.buttons.transactions) {
    clearSession(chatId);
    await sendHistory(bot, chatId, lang);
    return;
  }

  if (text === tx.buttons.profile) {
    clearSession(chatId);
    await sendProfile(bot, chatId, lang);
    return;
  }

  if (text === tx.buttons.promo) {
    setSession(chatId, "await_promo_code");
    await bot.sendMessage(chatId, tx.replies.promoPrompt);
    return;
  }

  if (text === tx.buttons.referral) {
    clearSession(chatId);
    await sendReferral(bot, chatId, lang);
    return;
  }

  if (text === tx.buttons.calc) {
    setSession(chatId, "calculator");
    await bot.sendMessage(chatId, tx.replies.calc, { parse_mode: "HTML" });
    return;
  }

  if (text === tx.buttons.faq) {
    clearSession(chatId);
    await bot.sendMessage(chatId, tx.replies.faq, { parse_mode: "HTML" });
    return;
  }

  if (text === tx.buttons.top) {
    clearSession(chatId);
    await bot.sendMessage(chatId, tx.replies.top);
    return;
  }

  await bot.sendMessage(chatId, tx.replies.pickFromMenu);
}

async function handleStart(bot, msg, match) {
  const chatId = msg.chat.id;
  const referralCode = match?.[1] ? String(match[1]).trim() : "";

  const user = await ensureUserFromTelegram(msg);

  if (referralCode) {
    await applyReferralFromStart(user, referralCode);
  }

  if (!hasLang(chatId)) {
    await sendLanguageMenu(bot, chatId);
    return;
  }

  await sendWelcomeAndMenu(bot, msg, getLang(chatId));
}

async function handlePreCheckout(bot, query) {
  try {
    await bot.answerPreCheckoutQuery(query.id, true);
  } catch (error) {
    logger.error("Pre-checkout failed", { error: error.message });
  }
}

async function handleSuccessfulPayment(bot, msg) {
  try {
    if (!msg.successful_payment) return;

    const transactionId = msg.successful_payment.invoice_payload;
    const providerPaymentId = msg.successful_payment.telegram_payment_charge_id;
    const result = await confirmTelegramStarsPayment(transactionId, providerPaymentId);

    await bot.sendMessage(
      msg.chat.id,
      `Wallet to'ldirildi.\nTransaction: ${result.transaction.transactionId}\nAmount: ${formatNumber(
        result.transaction.amount
      )} ${result.transaction.currency}`
    );
  } catch (error) {
    logger.error("Successful payment handling failed", { error: error.message });
  }
}

function registerHandlers(bot) {
  bot.onText(/^\/(lang|language)$/i, async (msg) => {
    try {
      await sendLanguageMenu(bot, msg.chat.id);
    } catch (error) {
      logger.error("Language command failed", { error: error.message });
    }
  });

  bot.onText(/^\/start(?:\s+(.+))?$/i, async (msg, match) => {
    try {
      await handleStart(bot, msg, match);
    } catch (error) {
      logger.error("Start command failed", { error: error.message });
      await bot.sendMessage(msg.chat.id, "Botni ishga tushirishda xatolik yuz berdi.");
    }
  });

  bot.onText(/^\/premium_requests$/i, async (msg) => {
    try {
      if (!isAdminTelegramId(msg.from.id)) {
        await bot.sendMessage(msg.chat.id, "Admin access required.");
        return;
      }

      const requests = await getPendingPremiumRequests();
      if (!requests.length) {
        await bot.sendMessage(msg.chat.id, "Pending premium requests yo'q.");
        return;
      }

      for (const request of requests) {
        await bot.sendMessage(
          msg.chat.id,
          `Request: ${request.requestId}\nTelegram ID: ${request.telegramId}\nPlan: ${request.planKey}\nAmount: ${formatNumber(
            request.amount
          )} ${env.defaultCurrency}`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "Approve", callback_data: `admin:premium:approve:${request.requestId}` },
                  { text: "Reject", callback_data: `admin:premium:reject:${request.requestId}` },
                ],
              ],
            },
          }
        );
      }
    } catch (error) {
      logger.error("Premium requests command failed", { error: error.message });
    }
  });

  bot.on("callback_query", async (q) => {
    try {
      await handleCallback(bot, q);
    } catch (error) {
      logger.error("Callback handler failed", { error: error.message });
      if (q.message?.chat?.id) {
        await bot.sendMessage(q.message.chat.id, "Callback ishlovida xatolik yuz berdi.");
      }
    }
  });

  bot.on("pre_checkout_query", async (query) => {
    await handlePreCheckout(bot, query);
  });

  bot.on("message", async (msg) => {
    try {
      await handleSuccessfulPayment(bot, msg);
      await handleTextMessage(bot, msg);
    } catch (error) {
      logger.error("Message handler failed", { error: error.message });
      await bot.sendMessage(msg.chat.id, "Xabarni qayta ishlashda xatolik yuz berdi.");
    }
  });

  bot.on("polling_error", (error) => {
    logger.error("Polling error", {
      error: error?.response?.body || error?.message || error,
    });
  });
}

module.exports = { registerHandlers };

`$([Environment]::NewLine)
## src/models/User.js

`$lang
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: String, required: true, unique: true, index: true },
    chatId: { type: String, required: true, unique: true, index: true },
    username: { type: String, default: "" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    language: { type: String, enum: ["uz", "ru", "en"], default: "uz" },
    wallet: {
      balance: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "UZS" },
    },
    premium: {
      status: {
        type: String,
        enum: ["none", "pending", "active", "rejected"],
        default: "none",
        index: true,
      },
      expiresAt: { type: Date, default: null },
      lastPlanKey: { type: String, default: "" },
      lastRequestAt: { type: Date, default: null },
      lastApprovedAt: { type: Date, default: null },
      lastRejectedAt: { type: Date, default: null },
    },
    referralCode: { type: String, required: true, unique: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    referredUsersCount: { type: Number, default: 0, min: 0 },
    hasReceivedReferralReward: { type: Boolean, default: false },
    transactionsCount: { type: Number, default: 0, min: 0 },
    promoRedemptions: [{ type: String }],
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

userSchema.index({ username: 1 });

module.exports = mongoose.model("User", userSchema);

`$([Environment]::NewLine)
## src/models/Transaction.js

`$lang
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    telegramId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["topup", "purchase", "promo_bonus", "referral_bonus", "refund"],
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: ["wallet_topup", "stars", "premium", "promo", "referral", "refund"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["click", "payme", "telegram_stars", "wallet", "promo", "referral", "admin"],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "UZS" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    providerPaymentId: { type: String, default: "" },
    paymentUrl: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

transactionSchema.index({ createdAt: -1, telegramId: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);

`$([Environment]::NewLine)
## src/models/PromoCode.js

`$lang
const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String, default: "" },
    bonusAmount: { type: Number, required: true, min: 0 },
    maxUses: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, default: null, index: true },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        telegramId: { type: String, required: true },
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);

`$([Environment]::NewLine)
## src/models/PremiumRequest.js

`$lang
const mongoose = require("mongoose");

const premiumRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    telegramId: { type: String, required: true, index: true },
    planKey: { type: String, required: true, index: true },
    planTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminTelegramId: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    decidedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

premiumRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("PremiumRequest", premiumRequestSchema);

`$([Environment]::NewLine)
## src/routes/webhooks.js

`$lang
const express = require("express");
const { createWebhookHandler, healthController } = require("../controllers/webhook-controller");

const router = express.Router();

router.get("/health", healthController);
router.post("/webhooks/payme", createWebhookHandler("payme"));
router.post("/webhooks/click", createWebhookHandler("click"));
router.post("/webhooks/telegram-stars", createWebhookHandler("telegram_stars"));

module.exports = router;

`$([Environment]::NewLine)
## src/services/admin-service.js

`$lang
const { env } = require("../config/env");
const { logger } = require("./logger");

function isAdminTelegramId(telegramId) {
  return env.adminChatIds.includes(String(telegramId));
}

async function notifyAdmins(bot, text, extra = {}) {
  const deliveries = env.adminChatIds.map(async (adminId) => {
    try {
      await bot.sendMessage(adminId, text, extra);
    } catch (error) {
      logger.error("Admin notification failed", {
        adminId,
        error: error.message,
      });
    }
  });

  await Promise.all(deliveries);
}

module.exports = {
  isAdminTelegramId,
  notifyAdmins,
};

`$([Environment]::NewLine)
## src/services/bot-session.js

`$lang
const sessions = new Map();

function setSession(chatId, state, data = {}) {
  sessions.set(String(chatId), {
    state,
    data,
    updatedAt: new Date(),
  });
}

function getSession(chatId) {
  return sessions.get(String(chatId)) || null;
}

function clearSession(chatId) {
  sessions.delete(String(chatId));
}

function hasState(chatId, state) {
  const session = getSession(chatId);
  return session?.state === state;
}

module.exports = {
  clearSession,
  getSession,
  hasState,
  setSession,
};

`$([Environment]::NewLine)
## src/services/calculator.js

`$lang
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
  if (lang === "ru") return "Р·РІРµР·Рґ";
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
      intro: "Yuqorida mavjud to'lov usullari bo'yicha narx ko'rsatilgan.",
      askAgain: "Yana hisoblash uchun kerakli qiymatni yuboring:",
    },
    ru: {
      intro: "Р’С‹С€Рµ РїСЂРµРґСЃС‚Р°РІР»РµРЅР° СЃС‚РѕРёРјРѕСЃС‚СЊ РІ РґРѕСЃС‚СѓРїРЅС‹С… РјРµС‚РѕРґР°С… РѕРїР»Р°С‚С‹ СЃ СѓС‡РµС‚РѕРј РєРѕРјРёСЃСЃРёРё.",
      askAgain: "Р’РІРµРґРёС‚Рµ С‚СЂРµР±СѓРµРјРѕРµ Р·РЅР°С‡РµРЅРёРµ РґР»СЏ СЂР°СЃС‡РµС‚Р°:",
    },
    en: {
      intro: "The cost above is shown across available payment methods including commission.",
      askAgain: "Enter the required amount for calculation:",
    },
  };

  const tx = labels[lang] || labels.uz;

  const methodLines = PAYMENT_METHODS.map((method) => {
    const value = localized.valueForMethod(method.multiplier);
    return `${method.name}: ${formatNumber(value)} ${localized.currency}`;
  }).join("\n");

  return (
    `${methodLines}\n` +
    `TON | USDT TON\n` +
    `в”њ ${localized.tonAmount} TON\n` +
    `в”” ${localized.usdtTonAmount} USDT-TON\n\n` +
    `${tx.intro} ${formatNumber(starsAmount)} ${starWord(lang)}.\n\n` +
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

`$([Environment]::NewLine)
## src/services/language-store.js

`$lang
const fs = require("fs");
const path = require("path");
const { logger } = require("./logger");

const dataDir = path.resolve(__dirname, "../../data");
const storePath = path.join(dataDir, "user-languages.json");
const memoryStore = new Map();

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, "{}", "utf8");
  }
}

function loadStore() {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw || "{}");

    for (const [chatId, lang] of Object.entries(parsed)) {
      memoryStore.set(String(chatId), lang);
    }
  } catch (error) {
    logger.error("Language store read failed", { error: error.message });
  }
}

function saveStore() {
  ensureStoreFile();

  try {
    const payload = Object.fromEntries(memoryStore.entries());
    fs.writeFileSync(storePath, JSON.stringify(payload, null, 2), "utf8");
  } catch (error) {
    logger.error("Language store write failed", { error: error.message });
  }
}

function hasLang(chatId) {
  return memoryStore.has(String(chatId));
}

function getLang(chatId) {
  return memoryStore.get(String(chatId)) || "uz";
}

function setLang(chatId, lang) {
  memoryStore.set(String(chatId), lang);
  saveStore();
}

loadStore();

module.exports = {
  getLang,
  hasLang,
  setLang,
  storePath,
};

`$([Environment]::NewLine)
## src/services/logger.js

`$lang
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const { env } = require("../config/env");

const logsDir = path.resolve(__dirname, "../../logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, "app.log") }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const suffix = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
          return `${timestamp} ${level}: ${message}${suffix}`;
        })
      ),
    }),
  ],
});

module.exports = {
  logger,
};

`$([Environment]::NewLine)
## src/services/payment-service.js

`$lang
const { env } = require("../config/env");
const { renderTemplate } = require("../utils/template");
const { createTransaction, completeTopupTransaction, findTransactionById } = require("./wallet-service");
const { rewardReferralAfterFirstTopup } = require("./referral-service");

function assertTopupAmount(amount) {
  if (!Number.isFinite(amount) || amount < env.walletMinTopup) {
    throw new Error(`Minimum topup amount is ${env.walletMinTopup}`);
  }
}

async function createProviderTopup(user, provider, amount) {
  assertTopupAmount(amount);

  const transaction = await createTransaction({
    user,
    type: "topup",
    serviceType: "wallet_topup",
    paymentMethod: provider,
    amount,
    currency: env.defaultCurrency,
    status: "pending",
    metadata: {
      provider,
      userTelegramId: user.telegramId,
    },
  });

  let paymentUrl = "";

  if (provider === "payme") {
    paymentUrl = renderTemplate(env.paymeCheckoutUrlTemplate, {
      merchantId: env.paymeMerchantId,
      amount: amount * 100,
      transactionId: transaction.transactionId,
    });
  }

  if (provider === "click") {
    paymentUrl = renderTemplate(env.clickCheckoutUrlTemplate, {
      serviceId: env.clickServiceId,
      merchantId: env.clickMerchantId,
      amount,
      transactionId: transaction.transactionId,
    });
  }

  transaction.paymentUrl = paymentUrl;
  await transaction.save();

  return transaction;
}

function validateWebhook(provider, payload, headers) {
  if (provider === "payme") {
    const token = headers["x-payme-token"] || payload.callbackToken;
    return token && token === env.paymeCallbackToken;
  }

  if (provider === "click") {
    const secret = headers["x-click-secret"] || payload.secret_key;
    return secret && secret === env.clickSecretKey;
  }

  if (provider === "telegram_stars") {
    const secret = headers["x-telegram-stars-secret"] || payload.secret;
    return secret && secret === env.telegramStarsProviderToken;
  }

  return false;
}

async function confirmWebhookPayment(provider, payload) {
  const transactionId = payload.transactionId || payload.merchant_trans_id || payload.payload;
  const providerPaymentId = payload.providerPaymentId || payload.click_trans_id || payload.payme_trans_id || "";

  const transaction = await findTransactionById(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  await completeTopupTransaction(transaction, providerPaymentId);

  const populatedTransaction = await transaction.populate("user");
  const rewarded = await rewardReferralAfterFirstTopup(populatedTransaction.user);

  return { transaction, rewarded };
}

async function confirmTelegramStarsPayment(transactionId, providerPaymentId) {
  const transaction = await findTransactionById(transactionId);
  if (!transaction) {
    throw new Error("Telegram Stars transaction not found");
  }

  await completeTopupTransaction(transaction, providerPaymentId);

  const populatedTransaction = await transaction.populate("user");
  const rewarded = await rewardReferralAfterFirstTopup(populatedTransaction.user);

  return { transaction, rewarded };
}

module.exports = {
  confirmTelegramStarsPayment,
  confirmWebhookPayment,
  createProviderTopup,
  validateWebhook,
};

`$([Environment]::NewLine)
## src/services/premium-service.js

`$lang
const PremiumRequest = require("../models/PremiumRequest");
const User = require("../models/User");
const { PREMIUM_PLANS } = require("../config/catalog");
const { generateId } = require("../utils/id");
const { debitWallet, refundWallet } = require("./wallet-service");

async function createPremiumRequest(user, planKey) {
  const plan = PREMIUM_PLANS[planKey];
  if (!plan) {
    throw new Error("Premium plan not found");
  }

  if (user.premium.status === "pending") {
    throw new Error("Premium request already pending");
  }

  const transaction = await debitWallet({
    user,
    amount: plan.amount,
    serviceType: "premium",
    metadata: { planKey },
  });

  const request = await PremiumRequest.create({
    requestId: generateId("PREM"),
    user: user._id,
    telegramId: user.telegramId,
    planKey,
    planTitle: plan.titles[user.language] || plan.titles.uz,
    amount: plan.amount,
    transaction: transaction._id,
    status: "pending",
  });

  user.premium.status = "pending";
  user.premium.lastPlanKey = planKey;
  user.premium.lastRequestAt = new Date();
  await user.save();

  return { request, transaction, plan };
}

async function approvePremiumRequest(requestId, adminTelegramId) {
  const request = await PremiumRequest.findOne({ requestId }).populate("user");
  if (!request) {
    throw new Error("Premium request not found");
  }

  if (request.status !== "pending") {
    throw new Error("Premium request already processed");
  }

  const user = await User.findById(request.user._id);
  const plan = PREMIUM_PLANS[request.planKey];
  const expiresAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

  request.status = "approved";
  request.adminTelegramId = String(adminTelegramId || "");
  request.decidedAt = new Date();
  await request.save();

  user.premium.status = "active";
  user.premium.expiresAt = expiresAt;
  user.premium.lastPlanKey = request.planKey;
  user.premium.lastApprovedAt = new Date();
  await user.save();

  return { request, user, expiresAt };
}

async function rejectPremiumRequest(requestId, adminTelegramId, reason = "") {
  const request = await PremiumRequest.findOne({ requestId }).populate("user");
  if (!request) {
    throw new Error("Premium request not found");
  }

  if (request.status !== "pending") {
    throw new Error("Premium request already processed");
  }

  const user = await User.findById(request.user._id);

  request.status = "rejected";
  request.adminTelegramId = String(adminTelegramId || "");
  request.rejectionReason = reason;
  request.decidedAt = new Date();
  await request.save();

  await refundWallet({
    user,
    amount: request.amount,
    metadata: {
      premiumRequestId: request.requestId,
      reason: reason || "Premium request rejected by admin",
    },
  });

  user.premium.status = "rejected";
  user.premium.lastRejectedAt = new Date();
  await user.save();

  return { request, user };
}

async function getPendingPremiumRequests(limit = 20) {
  return PremiumRequest.find({ status: "pending" }).sort({ createdAt: -1 }).limit(limit);
}

module.exports = {
  approvePremiumRequest,
  createPremiumRequest,
  getPendingPremiumRequests,
  rejectPremiumRequest,
};

`$([Environment]::NewLine)
## src/services/promo-service.js

`$lang
const PromoCode = require("../models/PromoCode");
const { creditWallet } = require("./wallet-service");

async function redeemPromoCode(user, rawCode) {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) {
    throw new Error("Promo code is empty");
  }

  const promo = await PromoCode.findOne({ code, isActive: true });
  if (!promo) {
    throw new Error("Promo code not found");
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    throw new Error("Promo code expired");
  }

  if (promo.usedCount >= promo.maxUses) {
    throw new Error("Promo code usage limit reached");
  }

  if (promo.usedBy.some((item) => String(item.telegramId) === String(user.telegramId))) {
    throw new Error("Promo code already redeemed");
  }

  promo.usedCount += 1;
  promo.usedBy.push({
    user: user._id,
    telegramId: user.telegramId,
    usedAt: new Date(),
  });
  await promo.save();

  user.promoRedemptions.push(code);
  await user.save();

  const transaction = await creditWallet({
    user,
    amount: promo.bonusAmount,
    type: "promo_bonus",
    serviceType: "promo",
    paymentMethod: "promo",
    metadata: { promoCode: code },
  });

  return { promo, transaction };
}

module.exports = {
  redeemPromoCode,
};

`$([Environment]::NewLine)
## src/services/referral-service.js

`$lang
const User = require("../models/User");
const { env } = require("../config/env");
const { creditWallet } = require("./wallet-service");

async function applyReferralFromStart(user, rawReferralCode) {
  if (!rawReferralCode || user.referredBy) {
    return { applied: false, reason: "skipped" };
  }

  const referralCode = String(rawReferralCode).trim().toUpperCase();
  if (!referralCode || user.referralCode === referralCode) {
    return { applied: false, reason: "self_referral" };
  }

  const inviter = await User.findOne({ referralCode });
  if (!inviter) {
    return { applied: false, reason: "not_found" };
  }

  user.referredBy = inviter._id;
  await user.save();

  inviter.referredUsersCount += 1;
  await inviter.save();

  return { applied: true, inviter };
}

async function rewardReferralAfterFirstTopup(user) {
  if (!env.rewardReferralOnFirstTopup) return { rewarded: false, reason: "disabled" };
  if (user.hasReceivedReferralReward) return { rewarded: false, reason: "already_rewarded" };
  if (!user.referredBy) return { rewarded: false, reason: "no_inviter" };

  const inviter = await User.findById(user.referredBy);
  if (!inviter) return { rewarded: false, reason: "inviter_missing" };

  await creditWallet({
    user: inviter,
    amount: env.walletReferralBonus,
    type: "referral_bonus",
    serviceType: "referral",
    paymentMethod: "referral",
    metadata: { invitedUserTelegramId: user.telegramId },
  });

  await creditWallet({
    user,
    amount: env.referredUserBonus,
    type: "referral_bonus",
    serviceType: "referral",
    paymentMethod: "referral",
    metadata: { inviterTelegramId: inviter.telegramId },
  });

  user.hasReceivedReferralReward = true;
  await user.save();

  return { rewarded: true, inviter };
}

module.exports = {
  applyReferralFromStart,
  rewardReferralAfterFirstTopup,
};

`$([Environment]::NewLine)
## src/services/stats-store.js

`$lang
const fs = require("fs");
const path = require("path");
const { logger } = require("./logger");

const statsPath = path.resolve(__dirname, "../../stats.json");

function readStats() {
  try {
    if (!fs.existsSync(statsPath)) {
      return { botBought: 0, autoLocked: 0, approxUSD: 0 };
    }

    const raw = fs.readFileSync(statsPath, "utf8");
    const parsed = JSON.parse(raw || "{}");

    return {
      botBought: Number(parsed.botBought) || 0,
      autoLocked: Number(parsed.autoLocked) || 0,
      approxUSD: Number(parsed.approxUSD) || 0,
    };
  } catch (error) {
    logger.error("Stats read failed", { error: error.message });
    return { botBought: 0, autoLocked: 0, approxUSD: 0 };
  }
}

module.exports = {
  readStats,
  statsPath,
};

`$([Environment]::NewLine)
## src/services/user-service.js

`$lang
const crypto = require("crypto");
const User = require("../models/User");
const { getLang, setLang } = require("./language-store");

function buildReferralCode(telegramId) {
  const hash = crypto.createHash("sha256").update(String(telegramId)).digest("hex").slice(0, 8);
  return `REF${hash.toUpperCase()}`;
}

async function ensureUserFromTelegram(msgLike) {
  const chatId = String(msgLike.chat?.id || msgLike.message?.chat?.id || "");
  const from = msgLike.from || msgLike.message?.from || {};
  const telegramId = String(from.id || "");

  if (!chatId || !telegramId) {
    throw new Error("Cannot ensure user without chatId and telegramId");
  }

  const existing = await User.findOne({ telegramId });

  if (existing) {
    existing.chatId = chatId;
    existing.username = from.username || existing.username || "";
    existing.firstName = from.first_name || existing.firstName || "";
    existing.lastName = from.last_name || existing.lastName || "";
    existing.language = getLang(chatId);
    await existing.save();
    return existing;
  }

  const user = await User.create({
    telegramId,
    chatId,
    username: from.username || "",
    firstName: from.first_name || "",
    lastName: from.last_name || "",
    language: getLang(chatId),
    referralCode: buildReferralCode(telegramId),
  });

  return user;
}

async function getUserByChatId(chatId) {
  return User.findOne({ chatId: String(chatId) });
}

async function getUserByTelegramId(telegramId) {
  return User.findOne({ telegramId: String(telegramId) });
}

async function syncUserLanguage(chatId, lang) {
  setLang(chatId, lang);
  await User.updateOne({ chatId: String(chatId) }, { $set: { language: lang } });
}

module.exports = {
  ensureUserFromTelegram,
  getUserByChatId,
  getUserByTelegramId,
  syncUserLanguage,
};

`$([Environment]::NewLine)
## src/services/wallet-service.js

`$lang
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { env } = require("../config/env");
const { generateId } = require("../utils/id");

async function createTransaction({
  user,
  type,
  serviceType,
  paymentMethod,
  amount,
  currency = env.defaultCurrency,
  status = "pending",
  metadata = {},
  providerPaymentId = "",
  paymentUrl = "",
}) {
  return Transaction.create({
    transactionId: generateId("TX"),
    user: user._id,
    telegramId: user.telegramId,
    type,
    serviceType,
    paymentMethod,
    amount,
    currency,
    status,
    metadata,
    providerPaymentId,
    paymentUrl,
    completedAt: status === "completed" ? new Date() : null,
  });
}

async function completeTopupTransaction(transaction, providerPaymentId = "") {
  if (transaction.status === "completed") {
    return transaction;
  }

  const user = await User.findById(transaction.user);
  if (!user) {
    throw new Error("User not found for transaction");
  }

  user.wallet.balance += transaction.amount;
  user.transactionsCount += 1;
  await user.save();

  transaction.status = "completed";
  transaction.providerPaymentId = providerPaymentId || transaction.providerPaymentId;
  transaction.completedAt = new Date();
  await transaction.save();

  return transaction;
}

async function failTransaction(transaction, reason) {
  transaction.status = "failed";
  transaction.metadata = { ...transaction.metadata, failureReason: reason };
  await transaction.save();
  return transaction;
}

async function debitWallet({
  user,
  amount,
  serviceType,
  metadata = {},
}) {
  if (user.wallet.balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  user.wallet.balance -= amount;
  user.transactionsCount += 1;
  await user.save();

  return createTransaction({
    user,
    type: "purchase",
    serviceType,
    paymentMethod: "wallet",
    amount: -Math.abs(amount),
    status: "completed",
    metadata,
  });
}

async function creditWallet({
  user,
  amount,
  type,
  serviceType,
  paymentMethod,
  metadata = {},
}) {
  user.wallet.balance += amount;
  user.transactionsCount += 1;
  await user.save();

  return createTransaction({
    user,
    type,
    serviceType,
    paymentMethod,
    amount,
    status: "completed",
    metadata,
  });
}

async function refundWallet({ user, amount, metadata = {} }) {
  return creditWallet({
    user,
    amount,
    type: "refund",
    serviceType: "refund",
    paymentMethod: "admin",
    metadata,
  });
}

async function getRecentTransactions(userId, limit = 10) {
  return Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
}

async function findTransactionById(transactionId) {
  return Transaction.findOne({ transactionId });
}

module.exports = {
  completeTopupTransaction,
  createTransaction,
  creditWallet,
  debitWallet,
  failTransaction,
  findTransactionById,
  getRecentTransactions,
  refundWallet,
};

`$([Environment]::NewLine)
## src/sotuv/menu.js

`$lang
const { PREMIUM_PLANS, STAR_PRICES, ADMIN_USERNAME } = require("../config/catalog");
const { readStats } = require("../services/stats-store");
const { formatDate, formatNumber } = require("../utils/format");

function getTexts(lang = "uz") {
  const t = {
    uz: {
      welcomeTitle: "Xush kelibsiz",
      bought: "Bot orqali sotib olingan",
      stars: "yulduzlar",
      buttons: {
        buyStars: "в­ђ Yulduzlar",
        buyPremium: "Premium",
        topUp: "Balansni to'ldirish",
        transactions: "Tranzaksiyalar",
        profile: "Profil",
        promo: "Promo kod",
        referral: "Referral",
        calc: "Kalkulyator",
        faq: "FAQ",
        top: "Top",
      },
      replies: {
        faq:
          "<b>FAQ</b>\n\n" +
          "Yulduzlar va Premium bo'yicha buyurtmalar bot orqali qabul qilinadi.\n" +
          `Admin: @${ADMIN_USERNAME}`,
        calc: "Kerakli yulduz sonini yuboring. Masalan: <b>100</b>",
        calcInvalid: "Iltimos, musbat son yuboring. Masalan: <b>100</b>",
        top: "Top bo'limi keyingi bosqichda to'ldiriladi.",
        pickFromMenu: "Iltimos, menyudan tanlang.",
        topupPrompt: "To'lov turini tanlang:",
        amountPrompt: "Summani yuboring. Masalan: <b>50000</b>",
        amountInvalid: "Iltimos, to'g'ri summa yuboring.",
        promoPrompt: "Promo kodni yuboring:",
        starsHeader: "<b>Yulduz sotib olish</b>\nWallet orqali paket tanlang:",
        premiumHeader: "<b>Premium tariflar</b>\nWallet orqali tarif tanlang:",
        historyEmpty: "Tranzaksiyalar hali yo'q.",
        profilePremiumNone: "Yo'q",
        profilePremiumPending: "Kutilmoqda",
        profilePremiumRejected: "Rad etilgan",
        profilePremiumActive: "Faol",
        referralText:
          "Do'stlarni taklif qiling va bonus oling.\n" +
          "Sizning referral kodingiz: <b>{code}</b>\n" +
          "Taklif qilinganlar: <b>{count}</b>",
        insufficientBalance: "Wallet balansingiz yetarli emas.",
        premiumPending: "Premium so'rovingiz adminga yuborildi.",
        starsPurchased: "Buyurtma qabul qilindi. Admin tez orada siz bilan bog'lanadi.",
        topupCreated:
          "<b>{provider}</b> uchun to'lov yaratildi.\n" +
          "Transaction ID: <b>{transactionId}</b>\n" +
          "Summa: <b>{amount}</b>\n" +
          "{paymentUrl}",
        webhookWaiting: "To'lov tasdiqlangach wallet avtomatik to'ldiriladi.",
      },
    },
    ru: {
      welcomeTitle: "Р”РѕР±СЂРѕ РїРѕР¶Р°Р»РѕРІР°С‚СЊ",
      bought: "РљСѓРїР»РµРЅРѕ С‡РµСЂРµР· Р±РѕС‚Р°",
      stars: "Р·РІС‘Р·Рґ",
      buttons: {
        buyStars: "в­ђ Р—РІРµР·РґС‹",
        buyPremium: "Premium",
        topUp: "РџРѕРїРѕР»РЅРёС‚СЊ Р±Р°Р»Р°РЅСЃ",
        transactions: "РўСЂР°РЅР·Р°РєС†РёРё",
        profile: "РџСЂРѕС„РёР»СЊ",
        promo: "РџСЂРѕРјРѕРєРѕРґ",
        referral: "Р РµС„РµСЂР°Р»",
        calc: "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ",
        faq: "FAQ",
        top: "РўРѕРї",
      },
      replies: {
        faq:
          "<b>FAQ</b>\n\n" +
          "Р—Р°РєР°Р·С‹ РЅР° Р·РІРµР·РґС‹ Рё Premium РїСЂРёРЅРёРјР°СЋС‚СЃСЏ С‡РµСЂРµР· Р±РѕС‚Р°.\n" +
          `РђРґРјРёРЅ: @${ADMIN_USERNAME}`,
        calc: "РћС‚РїСЂР°РІСЊС‚Рµ РЅСѓР¶РЅРѕРµ РєРѕР»РёС‡РµСЃС‚РІРѕ Р·РІС‘Р·Рґ. РќР°РїСЂРёРјРµСЂ: <b>100</b>",
        calcInvalid: "РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РѕС‚РїСЂР°РІСЊС‚Рµ РїРѕР»РѕР¶РёС‚РµР»СЊРЅРѕРµ С‡РёСЃР»Рѕ. РќР°РїСЂРёРјРµСЂ: <b>100</b>",
        top: "Р Р°Р·РґРµР» С‚РѕРїР° Р±СѓРґРµС‚ Р·Р°РїРѕР»РЅРµРЅ РїРѕР·Р¶Рµ.",
        pickFromMenu: "РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РІС‹Р±РµСЂРёС‚Рµ РїСѓРЅРєС‚ РјРµРЅСЋ.",
        topupPrompt: "Р’С‹Р±РµСЂРёС‚Рµ СЃРїРѕСЃРѕР± РѕРїР»Р°С‚С‹:",
        amountPrompt: "РћС‚РїСЂР°РІСЊС‚Рµ СЃСѓРјРјСѓ. РќР°РїСЂРёРјРµСЂ: <b>50000</b>",
        amountInvalid: "РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РѕС‚РїСЂР°РІСЊС‚Рµ РєРѕСЂСЂРµРєС‚РЅСѓСЋ СЃСѓРјРјСѓ.",
        promoPrompt: "РћС‚РїСЂР°РІСЊС‚Рµ РїСЂРѕРјРѕРєРѕРґ:",
        starsHeader: "<b>РџРѕРєСѓРїРєР° Р·РІРµР·Рґ</b>\nР’С‹Р±РµСЂРёС‚Рµ РїР°РєРµС‚ РґР»СЏ РѕРїР»Р°С‚С‹ РёР· wallet:",
        premiumHeader: "<b>РўР°СЂРёС„С‹ Premium</b>\nР’С‹Р±РµСЂРёС‚Рµ С‚Р°СЂРёС„ РґР»СЏ РѕРїР»Р°С‚С‹ РёР· wallet:",
        historyEmpty: "РўСЂР°РЅР·Р°РєС†РёР№ РїРѕРєР° РЅРµС‚.",
        profilePremiumNone: "РќРµС‚",
        profilePremiumPending: "РћР¶РёРґР°РµС‚ РѕРґРѕР±СЂРµРЅРёСЏ",
        profilePremiumRejected: "РћС‚РєР»РѕРЅРµРЅ",
        profilePremiumActive: "РђРєС‚РёРІРµРЅ",
        referralText:
          "РџСЂРёРіР»Р°С€Р°Р№С‚Рµ РґСЂСѓР·РµР№ Рё РїРѕР»СѓС‡Р°Р№С‚Рµ Р±РѕРЅСѓСЃ.\n" +
          "Р’Р°С€ referral РєРѕРґ: <b>{code}</b>\n" +
          "РџСЂРёРіР»Р°С€РµРЅРѕ: <b>{count}</b>",
        insufficientBalance: "РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ СЃСЂРµРґСЃС‚РІ РІ wallet.",
        premiumPending: "Р—Р°РїСЂРѕСЃ РЅР° Premium РѕС‚РїСЂР°РІР»РµРЅ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂСѓ.",
        starsPurchased: "Р—Р°РєР°Р· РїСЂРёРЅСЏС‚. РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ СЃРІСЏР¶РµС‚СЃСЏ СЃ РІР°РјРё.",
        topupCreated:
          "<b>{provider}</b> РїР»Р°С‚РµР¶ СЃРѕР·РґР°РЅ.\n" +
          "Transaction ID: <b>{transactionId}</b>\n" +
          "РЎСѓРјРјР°: <b>{amount}</b>\n" +
          "{paymentUrl}",
        webhookWaiting: "РџРѕСЃР»Рµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ РїР»Р°С‚РµР¶Р° wallet РїРѕРїРѕР»РЅРёС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё.",
      },
    },
    en: {
      welcomeTitle: "Welcome",
      bought: "Purchased via bot",
      stars: "stars",
      buttons: {
        buyStars: "в­ђ Stars",
        buyPremium: "Premium",
        topUp: "Top up balance",
        transactions: "Transactions",
        profile: "Profile",
        promo: "Promo code",
        referral: "Referral",
        calc: "Calculator",
        faq: "FAQ",
        top: "Top",
      },
      replies: {
        faq:
          "<b>FAQ</b>\n\n" +
          "Stars and Premium orders are handled through the bot.\n" +
          `Admin: @${ADMIN_USERNAME}`,
        calc: "Send the required number of stars. Example: <b>100</b>",
        calcInvalid: "Please send a positive number. Example: <b>100</b>",
        top: "Top section will be filled in later.",
        pickFromMenu: "Please choose from the menu.",
        topupPrompt: "Choose a payment method:",
        amountPrompt: "Send the amount. Example: <b>50000</b>",
        amountInvalid: "Please send a valid amount.",
        promoPrompt: "Send your promo code:",
        starsHeader: "<b>Buy stars</b>\nChoose a wallet purchase package:",
        premiumHeader: "<b>Premium plans</b>\nChoose a wallet purchase plan:",
        historyEmpty: "No transactions yet.",
        profilePremiumNone: "None",
        profilePremiumPending: "Pending approval",
        profilePremiumRejected: "Rejected",
        profilePremiumActive: "Active",
        referralText:
          "Invite friends and earn bonuses.\n" +
          "Your referral code: <b>{code}</b>\n" +
          "Invited users: <b>{count}</b>",
        insufficientBalance: "Your wallet balance is not enough.",
        premiumPending: "Your Premium request was sent to the admin.",
        starsPurchased: "Your order was accepted. Admin will contact you soon.",
        topupCreated:
          "<b>{provider}</b> payment created.\n" +
          "Transaction ID: <b>{transactionId}</b>\n" +
          "Amount: <b>{amount}</b>\n" +
          "{paymentUrl}",
        webhookWaiting: "Wallet will be topped up automatically after payment confirmation.",
      },
    },
  };

  return t[lang] || t.uz;
}

function applyTemplate(text, params) {
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }, text);
}

function getMainKeyboard(lang) {
  const tx = getTexts(lang);
  return {
    keyboard: [
      [tx.buttons.buyStars, tx.buttons.buyPremium],
      [tx.buttons.topUp, tx.buttons.profile],
      [tx.buttons.transactions, tx.buttons.promo],
      [tx.buttons.referral, tx.buttons.calc],
      [tx.buttons.faq, tx.buttons.top],
    ],
    resize_keyboard: true,
  };
}

function getStarsInlineKeyboard() {
  return Object.keys(STAR_PRICES).map((amount) => [
    { text: `в­ђ ${amount}`, callback_data: `walletbuy:stars:${amount}` },
  ]);
}

function getPremiumInlineKeyboard(lang) {
  return Object.entries(PREMIUM_PLANS).map(([planKey, plan]) => [
    {
      text: `${plan.titles[lang] || plan.titles.uz} - ${formatNumber(plan.amount)} UZS`,
      callback_data: `walletbuy:premium:${planKey}`,
    },
  ]);
}

function getTopupInlineKeyboard() {
  return [
    [{ text: "Click", callback_data: "topup:click" }],
    [{ text: "Payme", callback_data: "topup:payme" }],
    [{ text: "Telegram Stars", callback_data: "topup:telegram_stars" }],
  ];
}

async function sendWelcomeAndMenu(bot, msg, lang) {
  const chatId = msg.chat.id;
  const tx = getTexts(lang);
  const stats = readStats();
  const username = msg.from?.username ? `@${msg.from.username}` : msg.from?.first_name || "friend";
  const text =
    `в­ђ <b>${tx.welcomeTitle}, ${username}</b>\n\n` +
    `${tx.bought}\n` +
    `<b>${formatNumber(stats.botBought)} ${tx.stars}</b>`;

  return bot.sendMessage(chatId, text, {
    parse_mode: "HTML",
    reply_markup: getMainKeyboard(lang),
  });
}

async function sendStarsMenu(bot, chatId, lang) {
  const tx = getTexts(lang);

  return bot.sendMessage(chatId, tx.replies.starsHeader, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: getStarsInlineKeyboard(),
    },
  });
}

async function sendPremiumMenu(bot, chatId, lang) {
  const tx = getTexts(lang);

  return bot.sendMessage(chatId, tx.replies.premiumHeader, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: getPremiumInlineKeyboard(lang),
    },
  });
}

async function sendTopupMenu(bot, chatId, lang) {
  const tx = getTexts(lang);

  return bot.sendMessage(chatId, tx.replies.topupPrompt, {
    reply_markup: {
      inline_keyboard: getTopupInlineKeyboard(),
    },
  });
}

function buildProfileText(lang, user, transactions) {
  const tx = getTexts(lang);
  const premiumStatusMap = {
    none: tx.replies.profilePremiumNone,
    pending: tx.replies.profilePremiumPending,
    rejected: tx.replies.profilePremiumRejected,
    active: tx.replies.profilePremiumActive,
  };

  const premiumStatus = premiumStatusMap[user.premium.status] || tx.replies.profilePremiumNone;
  const premiumExpires = user.premium.expiresAt ? `\nPremium expires: ${formatDate(user.premium.expiresAt)}` : "";

  return (
    `<b>${tx.buttons.profile}</b>\n\n` +
    `ID: <b>${user.telegramId}</b>\n` +
    `Username: <b>@${user.username || "none"}</b>\n` +
    `Balance: <b>${formatNumber(user.wallet.balance)} ${user.wallet.currency}</b>\n` +
    `Premium: <b>${premiumStatus}</b>${premiumExpires}\n` +
    `Transactions: <b>${transactions}</b>`
  );
}

function buildTransactionHistoryText(lang, transactions) {
  const tx = getTexts(lang);
  if (!transactions.length) return tx.replies.historyEmpty;

  const lines = transactions.map((item) => {
    return (
      `<b>${item.transactionId}</b>\n` +
      `${formatDate(item.createdAt)} | ${item.paymentMethod} | ${item.amount} ${item.currency}\n` +
      `${item.type} / ${item.status}`
    );
  });

  return `<b>${tx.buttons.transactions}</b>\n\n${lines.join("\n\n")}`;
}

function buildReferralText(lang, user) {
  const tx = getTexts(lang);
  return applyTemplate(tx.replies.referralText, {
    code: user.referralCode,
    count: user.referredUsersCount,
  });
}

module.exports = {
  buildProfileText,
  buildReferralText,
  buildTransactionHistoryText,
  getMainKeyboard,
  getTexts,
  sendPremiumMenu,
  sendStarsMenu,
  sendTopupMenu,
  sendWelcomeAndMenu,
};

`$([Environment]::NewLine)
## src/til/language.js

`$lang
const { getLang, hasLang, setLang } = require("../services/language-store");

function sendLanguageMenu(bot, chatId) {
  return bot.sendMessage(chatId, "Tilni tanlang / Choose language / Р’С‹Р±РµСЂРёС‚Рµ СЏР·С‹Рє:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "рџ‡єрџ‡ї O'zbek", callback_data: "lang:uz" }],
        [{ text: "рџ‡·рџ‡є Р СѓСЃСЃРєРёР№", callback_data: "lang:ru" }],
        [{ text: "рџ‡¬рџ‡§ English", callback_data: "lang:en" }],
      ],
    },
  });
}

module.exports = {
  getLang,
  hasLang,
  setLang,
  sendLanguageMenu,
};

`$([Environment]::NewLine)
## src/utils/format.js

`$lang
function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US").replace(/,/g, " ");
}

function formatDate(value) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toISOString().replace("T", " ").slice(0, 19);
}

module.exports = {
  formatDate,
  formatNumber,
};

`$([Environment]::NewLine)
## src/utils/id.js

`$lang
const crypto = require("crypto");

function generateId(prefix) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
  return `${prefix}_${suffix}`;
}

module.exports = {
  generateId,
};

`$([Environment]::NewLine)
## src/utils/template.js

`$lang
function renderTemplate(template, params) {
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, "g"), encodeURIComponent(String(value)));
  }, template);
}

module.exports = {
  renderTemplate,
};

`$([Environment]::NewLine)
