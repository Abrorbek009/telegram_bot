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

  // ✅ callback: stars paket + premium + til tanlash
  bot.on("callback_query", async (q) => {
    const chatId = q.message?.chat?.id;
    const data = q.data;

    if (!chatId || !data) return;

    // =========================
    // ⭐ STARS PAKET BOSILGANDA
    // =========================
    if (data.startsWith("stars:")) {
      const amount = Number(data.split(":")[1]);
      await bot.answerCallbackQuery(q.id);

      const prices = {
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

      const price = prices[amount] || 0;
      const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

      const text =
        `⭐ <b>Yulduzchalar olib berish xizmati</b>\n\n` +
        `✅ Siz <b>${amount}</b> ta Stars tanladingiz\n` +
        `💵 Narxi: <b>${fmt(price)}</b> so‘m\n\n` +
        `📩 <b>Admin bilan bog‘lanish:</b>\n` +
        `@muxammadjonovw\n\n` +
        `📝 <i>Eslatma: nechta Stars olmoqchi ekaningizni adminga yozing.</i>`;

      return bot.sendMessage(chatId, text, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📩 Adminga yozish", url: "https://t.me/muxammadjonovw" }],
          ],
        },
      });
    }

    // =========================
    // 🛍 PREMIUM TANLANGANDA
    // =========================
    if (data.startsWith("prem:")) {
      await bot.answerCallbackQuery(q.id);

      const key = data.split(":")[1];

      const premiums = {
        "1m_link": {
          title: "✅ 1 oylik premium (akauntga ulanib)",
          price: "45 000 so‘m yoki 45 olmos",
        },
        "3m_nolink": {
          title: "✅ 3 oylik premium (akauntga ulanmasdan)",
          price: "198 000 so‘m",
        },
        "6m_nolink": {
          title: "✅ 6 oylik premium (akauntga ulanmasdan)",
          price: "260 000 so‘m",
        },
        "1y_nolink": {
          title: "✅ 1 yillik premium (akauntga ulanmasdan)",
          price: "379 999 so‘m 👻 (Asl narxida 😍)",
        },
        "1y_link": {
          title: "✅ 1 yillik premium (akauntga ulanib)",
          price: "299 000 so‘m",
        },
      };

      const p = premiums[key];
      if (!p) return;

      const text =
        `🛍 <b>Premium buyurtma</b>\n\n` +
        `${p.title}\n` +
        `💵 Narxi: <b>${p.price}</b>\n\n` +
        `📩 <b>Murojaat uchun:</b>\n` +
        `@muxammadjonovw\n\n` +
        `📝 <i>Eslatma: qaysi tarifni tanlaganingizni adminga yozing.</i>`;

      return bot.sendMessage(chatId, text, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📩 Adminga yozish", url: "https://t.me/muxammadjonovw" }],
          ],
        },
      });
    }

    // =========================
    // 🌐 LANGUAGE TANLASH
    // =========================
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
      } catch (e) {}

      const fakeMsg = { chat: { id: chatId }, from: q.from };
      return sendWelcomeAndMenu(bot, fakeMsg, lang);
    }

    return;
  });

  // tugmalar va oddiy xabarlar
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;
    if (text.startsWith("/")) return;

    if (!hasLang(chatId)) {
      return sendLanguageMenu(bot, chatId);
    }

    const lang = getLang(chatId);
    const tx = getTexts(lang);

    // ⭐ Stars bo‘limi: matn + inline tugmalar
    if (text === tx.buttons.buyStars) {
      const header = "⭐ <b>Yulduz sotib olish bo‘limi</b>\n\nPaketni tanlang 👇";
      return bot.sendMessage(chatId, header, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⭐ 15", callback_data: "stars:15" },
              { text: "⭐ 100", callback_data: "stars:100" },
              { text: "⭐ 150", callback_data: "stars:150" },
              { text: "⭐ 250", callback_data: "stars:250" },
              { text: "⭐ 350", callback_data: "stars:350" },
            ],
            [
              { text: "⭐ 500", callback_data: "stars:500" },
              { text: "⭐ 750", callback_data: "stars:750" },
              { text: "⭐ 1000", callback_data: "stars:1000" },
            ],
            [
              { text: "⭐ 1500", callback_data: "stars:1500" },
              { text: "⭐ 2500", callback_data: "stars:2500" },
            ],
            [
              { text: "⭐ 5000", callback_data: "stars:5000" },
              { text: "⭐ 10000", callback_data: "stars:10000" },
            ],
            [
              { text: "⭐ 50000", callback_data: "stars:50000" },
              { text: "⭐ 100000", callback_data: "stars:100000" },
            ],
          ],
        },
      });
    }

    // 🛍 Premium bo‘limi: tugmalar bilan
    if (text === tx.buttons.buyPremium) {
      const textPremium =
        "🛍 <b>Premium tariflar</b>\n\n" +
        "Qaysi tarif kerakligini tanlang 👇\n\n" +
        "📩 <b>Murojaat:</b> @muxammadjonovw\n" +
        "📝 <i>Eslatma: nima olishingizni adminga yozing.</i>";

      return bot.sendMessage(chatId, textPremium, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ 1 oy (akauntga ulanib)", callback_data: "prem:1m_link" }],
            [{ text: "✅ 3 oy (ulanmasdan)", callback_data: "prem:3m_nolink" }],
            [{ text: "✅ 6 oy (ulanmasdan)", callback_data: "prem:6m_nolink" }],
            [{ text: "✅ 1 yil (ulanmasdan)", callback_data: "prem:1y_nolink" }],
            [{ text: "✅ 1 yil (akauntga ulanib)", callback_data: "prem:1y_link" }],
          ],
        },
      });
    }

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

    if (e?.response?.body?.error_code === 409) {
      console.error("409 conflict – boshqa joyda bot ishlayapti. Lokalni to'xtating yoki Render'ni to'xtating.");
      process.exit(1);
    }
  });
}

module.exports = { registerHandlers };