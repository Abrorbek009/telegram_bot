const { hasLang, getLang, setLang, sendLanguageMenu } = require("./til/language");
const {
  getTexts,
  sendPremiumMenu,
  sendStarsMenu,
  sendWelcomeAndMenu,
} = require("./sotuv/menu");
const { ADMIN_URL, ADMIN_USERNAME, PREMIUM_PLANS, STAR_PRICES } = require("./config/catalog");
const { formatNumber } = require("./utils/format");
const { buildCalculatorText, parseCalculatorAmount } = require("./services/calculator");
const {
  isCalculatorPending,
  startCalculator,
  stopCalculator,
} = require("./services/calculator-session");

function buildStarsOrderText(amount) {
  const price = STAR_PRICES[amount] || 0;

  return (
    `⭐ <b>Yulduzchalar olib berish xizmati</b>\n\n` +
    `✅ Siz <b>${amount}</b> ta Stars tanladingiz\n` +
    `💵 Narxi: <b>${formatNumber(price)}</b> so‘m\n\n` +
    `📩 <b>Admin bilan bog‘lanish:</b>\n` +
    `@${ADMIN_USERNAME}\n\n` +
    `📝 <i>Eslatma: nechta Stars olmoqchi ekaningizni adminga yozing.</i>`
  );
}

function buildPremiumOrderText(planKey, lang) {
  const plan = PREMIUM_PLANS[planKey];
  if (!plan) return null;

  const title = plan.title[lang] || plan.title.uz;
  const price = plan.price[lang] || plan.price.uz;

  const headings = {
    uz: {
      title: "🛍 <b>Premium buyurtma</b>",
      price: "💵 Narxi:",
      contact: "📩 <b>Murojaat uchun:</b>",
      note: "📝 <i>Eslatma: qaysi tarifni tanlaganingizni adminga yozing.</i>",
      cta: "📩 Adminga yozish",
    },
    ru: {
      title: "🛍 <b>Заказ Premium</b>",
      price: "💵 Цена:",
      contact: "📩 <b>Для связи:</b>",
      note: "📝 <i>Напишите админу, какой тариф вы выбрали.</i>",
      cta: "📩 Написать админу",
    },
    en: {
      title: "🛍 <b>Premium order</b>",
      price: "💵 Price:",
      contact: "📩 <b>Contact admin:</b>",
      note: "📝 <i>Please message the admin with the selected plan.</i>",
      cta: "📩 Contact admin",
    },
  };

  const tx = headings[lang] || headings.uz;

  return {
    cta: tx.cta,
    text:
      `${tx.title}\n\n` +
      `${title}\n` +
      `${tx.price} <b>${price}</b>\n\n` +
      `${tx.contact}\n` +
      `@${ADMIN_USERNAME}\n\n` +
      tx.note,
  };
}

async function handleCallback(bot, q) {
  const chatId = q.message?.chat?.id;
  const data = q.data;

  if (!chatId || !data) return;

  if (data.startsWith("stars:")) {
    const amount = Number(data.split(":")[1]);
    await bot.answerCallbackQuery(q.id);
    stopCalculator(chatId);

    return bot.sendMessage(chatId, buildStarsOrderText(amount), {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "📩 Adminga yozish", url: ADMIN_URL }]],
      },
    });
  }

  if (data.startsWith("prem:")) {
    await bot.answerCallbackQuery(q.id);
    stopCalculator(chatId);

    const lang = getLang(chatId);
    const premiumOrder = buildPremiumOrderText(data.split(":")[1], lang);
    if (!premiumOrder) return;

    return bot.sendMessage(chatId, premiumOrder.text, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: premiumOrder.cta, url: ADMIN_URL }]],
      },
    });
  }

  if (data.startsWith("lang:")) {
    const lang = data.split(":")[1];
    if (!["uz", "ru", "en"].includes(lang)) return;

    setLang(chatId, lang);
    await bot.answerCallbackQuery(q.id);

    try {
      await bot.editMessageText("✅ OK", {
        chat_id: chatId,
        message_id: q.message.message_id,
      });
    } catch (error) {}

    const fakeMsg = { chat: { id: chatId }, from: q.from };
    return sendWelcomeAndMenu(bot, fakeMsg, lang);
  }
}

async function handleTextMessage(bot, msg) {
  const chatId = msg.chat.id;

  if (msg.voice || msg.video_note || msg.video) {
    await bot.sendMessage(
      chatId,
      "❌ Ovozli yoki video xabar yuborish mumkin emas.\nIltimos, matn yuboring."
    );

    try {
      await bot.deleteMessage(chatId, String(msg.message_id));
    } catch (error) {
      console.log("Xabar o‘chirilmadi:", error.message);
    }

    return;
  }

  const text = msg.text;
  if (!text) return;
  if (text.startsWith("/")) return;

  if (!hasLang(chatId)) {
    return sendLanguageMenu(bot, chatId);
  }

  const lang = getLang(chatId);
  const tx = getTexts(lang);

  if (isCalculatorPending(chatId)) {
    const amount = parseCalculatorAmount(text);

    if (!amount) {
      return bot.sendMessage(chatId, tx.replies.calcInvalid, {
        parse_mode: "HTML",
      });
    }

    return bot.sendMessage(chatId, buildCalculatorText(lang, amount), {
      parse_mode: "HTML",
    });
  }

  if (text === tx.buttons.buyStars) {
    stopCalculator(chatId);
    return sendStarsMenu(bot, chatId, lang);
  }

  if (text === tx.buttons.buyPremium) {
    stopCalculator(chatId);
    return sendPremiumMenu(bot, chatId, lang);
  }

  if (text === tx.buttons.faq) {
    stopCalculator(chatId);
    return bot.sendMessage(chatId, tx.replies.faq, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  }

  if (text === tx.buttons.profile) {
    stopCalculator(chatId);
    const missingUsername = lang === "ru" ? "нет" : lang === "en" ? "none" : "yo‘q";

    return bot.sendMessage(
      chatId,
      `👤 ${tx.buttons.profile}\n\nUsername: @${msg.from.username || missingUsername}\nID: ${msg.from.id}`
    );
  }

  if (text === tx.buttons.calc) {
    startCalculator(chatId);
    return bot.sendMessage(chatId, tx.replies.calc, {
      parse_mode: "HTML",
    });
  }

  if (text === tx.buttons.top) {
    stopCalculator(chatId);
    return bot.sendMessage(chatId, tx.replies.top);
  }

  return bot.sendMessage(chatId, tx.replies.pickFromMenu);
}

function registerHandlers(bot) {
  bot.onText(/^\/(lang|language)$/, async (msg) => {
    return sendLanguageMenu(bot, msg.chat.id);
  });

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    if (!hasLang(chatId)) {
      return sendLanguageMenu(bot, chatId);
    }

    return sendWelcomeAndMenu(bot, msg, getLang(chatId));
  });

  bot.on("callback_query", async (q) => {
    try {
      await handleCallback(bot, q);
    } catch (error) {
      console.error("callback_query error:", error?.message || error);
    }
  });

  bot.on("message", async (msg) => {
    try {
      await handleTextMessage(bot, msg);
    } catch (error) {
      console.error("message handler error:", error?.message || error);
    }
  });

  bot.on("polling_error", (error) => {
    console.error("polling_error:", error?.response?.body || error?.message || error);

    if (error?.response?.body?.error_code === 409) {
      console.error(
        "409 conflict - bot boshqa joyda ishlayapti. Lokal yoki serverdagi ikkinchi nusxani to‘xtating."
      );
      process.exit(1);
    }
  });
}

module.exports = { registerHandlers };
