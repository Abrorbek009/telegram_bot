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
      return `Ваш Premium активирован.\nДействует до: ${formatDate(expiresAt)}`;
    }

    return `Запрос на Premium отклонен.${reason ? `\nПричина: ${reason}` : ""}`;
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
