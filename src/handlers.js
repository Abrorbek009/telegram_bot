// src/handlers.js
const { hasLang, getLang, setLang, sendLanguageMenu } = require("./til/language");
const { getTexts, sendWelcomeAndMenu } = require("./sotuv/menu");

function registerHandlers(bot) {
  // ✅ /language yoki /lang — til tanlashni chiqaradi
  bot.onText(/^\/(lang|language)$/, async (msg) => {
    const chatId = msg.chat.id;
    return sendLanguageMenu(bot, chatId);
  });

  // /start: avval til, til bo‘lsa menyu
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    if (!hasLang(chatId)) {
      return sendLanguageMenu(bot, chatId);
    }

    return sendWelcomeAndMenu(bot, msg, getLang(chatId));
  });

  // callback: til tanlash
  bot.on("callback_query", async (q) => {
    const chatId = q.message?.chat?.id;
    const data = q.data;
    if (!chatId || !data) return;
    if (!data.startsWith("lang:")) return;

    const lang = data.split(":")[1];
    if (!["uz", "ru", "en"].includes(lang)) return;

    setLang(chatId, lang);
    await bot.answerCallbackQuery(q.id);

    // “menu ready” deb edit qilamiz
    try {
      await bot.editMessageText("✅ OK", {
        chat_id: chatId,
        message_id: q.message.message_id,
      });
    } catch (e) {}

    // keyin welcome+menu
    const fakeMsg = { chat: { id: chatId }, from: q.from };
    await sendWelcomeAndMenu(bot, fakeMsg, lang);
  });

  // tugmalar va oddiy xabarlar
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text) return;
    if (text.startsWith("/")) return;

    // til hali tanlanmagan bo‘lsa — til menyusi qaytadi
    if (!hasLang(chatId)) {
      return sendLanguageMenu(bot, chatId);
    }

    const lang = getLang(chatId);
    const tx = getTexts(lang);

    if (text === tx.buttons.buyStars) return bot.sendMessage(chatId, tx.replies.buyStars);
    if (text === tx.buttons.buyPremium) return bot.sendMessage(chatId, tx.replies.buyPremium);
    if (text === tx.buttons.faq) return bot.sendMessage(chatId, tx.replies.faq);

    if (text === tx.buttons.profile) {
      return bot.sendMessage(
        chatId,
        `👤 ${tx.buttons.profile}\n\nUsername: @${msg.from.username || "yo‘q"}\nID: ${msg.from.id}`
      );
    }

    if (text === tx.buttons.calc) return bot.sendMessage(chatId, tx.replies.calc);
    if (text === tx.buttons.top) return bot.sendMessage(chatId, tx.replies.top);

    return bot.sendMessage(chatId, tx.replies.pickFromMenu);
  });

  // polling error
  bot.on("polling_error", (e) => {
    console.error("polling_error:", e?.response?.body || e?.message || e);
  });
}

module.exports = { registerHandlers };