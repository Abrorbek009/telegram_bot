// src/sotuv/menu.js

function getTexts(lang = "uz") {
  const t = {
    uz: {
      welcomeTitle: "Xush kelibsiz",
      bought: "✨ Bot yordamida sotib olingan",
      stars: "yulduzlar",
      autoLockedLabel: "(avto qotilgan)",
      buttons: {
        buyStars: "⭐ Yulduzlarni sotib oling",
        buyPremium: "🛍 Premium sotib oling",
        faq: "📌 Tez-tez so'raladigan savollar",
        profile: "👤 Profil",
        calc: "🧮 Kalkulyator",
        top: "🏆 Eng yaxshi xaridorlar",
      },
      replies: {
        buyStars: "⭐ Yulduz sotib olish bo‘limi",

        // ✅ BU YERGA PREMIUM MATNI QO'YILDI
        buyPremium:
          "🛍 <b>Premium tariflar</b>\n\n" +
          "✅ <b>1 oylik premium</b>\n" +
          "Akauntga ulanib\n" +
          "💵 45 000 so‘m yoki \n\n" +
          "✅ <b>3 oylik premium</b>\n" +
          "198 000 (akauntga ulanmasdan)\n\n" +
          "✅ <b>6 oylik premium</b>\n" +
          "260 000 (akauntga ulanmasdan)\n\n" +
          "✅ <b>1 yillik premium</b> (akauntga ulanmasdan)\n" +
          "Asl narxida 😍\n" +
          "💵 379 999 so‘m 👻\n\n" +
          "✅ <b>1 yillik premium</b> (akauntga ulanib)\n" +
          "💵 299 000 so‘m\n\n" +
          "📩 <b>Murojaat uchun:</b>\n" +
          "@muxammadjonovw\n\n" +
          "📝 <i>Eslatma: nima olishingizni adminga yozing.</i>",

        faq:
          "📌 Tez-tez so'raladigan savollar:\n1️⃣ Bot qanday ishlaydi?\n2️⃣ To‘lovlar qanday qilinadi?\n(tez orada to‘ldiriladi)",
        calc: "🧮 Kalkulyator (tez orada).",
        top: "🏆 Top xaridorlar (tez orada).",
        pickFromMenu: "❓ Iltimos, pastdagi menyudan tanlang.",
      },
    },

    ru: {
      welcomeTitle: "Добро пожаловать",
      bought: "✨ С помощью бота куплено",
      stars: "звёзд",
      autoLockedLabel: "(авто-заблокировано)",
      buttons: {
        buyStars: "⭐ Купить звёзды",
        buyPremium: "🛍 Купить Premium",
        faq: "📌 FAQ",
        profile: "👤 Профиль",
        calc: "🧮 Калькулятор",
        top: "🏆 Топ покупателей",
      },
      replies: {
        buyStars: "⭐ Раздел покупки звёзд (скоро).",
        buyPremium: "🛍 Premium (скоро).",
        faq: "📌 FAQ (скоро заполним).",
        calc: "🧮 Калькулятор (скоро).",
        top: "🏆 Топ покупателей (скоро).",
        pickFromMenu: "❓ Пожалуйста, выберите пункт из меню ниже.",
      },
    },

    en: {
      welcomeTitle: "Welcome",
      bought: "✨ Bought using the bot",
      stars: "stars",
      autoLockedLabel: "(auto-locked)",
      buttons: {
        buyStars: "⭐ Buy stars",
        buyPremium: "🛍 Buy Premium",
        faq: "📌 FAQ",
        profile: "👤 Profile",
        calc: "🧮 Calculator",
        top: "🏆 Top buyers",
      },
      replies: {
        buyStars: "⭐ Stars purchase section (coming soon).",
        buyPremium: "🛍 Premium (coming soon).",
        faq: "📌 FAQ (coming soon).",
        calc: "🧮 Calculator (coming soon).",
        top: "🏆 Top buyers (coming soon).",
        pickFromMenu: "❓ Please choose an option from the menu below.",
      },
    },
  };

  return t[lang] || t.uz;
}

const fs = require("fs");
const path = require("path");

function readStats() {
  try {
    const p = path.resolve(__dirname, "../../stats.json");
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, "utf8") || "{}");
      return {
        botBought: data.botBought || 0,
        autoLocked: data.autoLocked || 0,
        approxUSD: data.approxUSD || 0,
      };
    }
  } catch (e) {}

  return { botBought: 0, autoLocked: 0, approxUSD: 0 };
}

async function sendWelcomeAndMenu(bot, msg, lang) {
  const chatId = msg.chat.id;
  const tx = getTexts(lang);

  // ⚠️ readStats() sendeda bor edi — o'sha joyida qoladi
  const stats = readStats();

  const fmt = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const username = msg.from?.username
    ? `@${msg.from.username}`
    : msg.from?.first_name || "do‘stim";

  const totalLine = `<b>${fmt(stats.botBought)} ${tx.stars}</b>`;
  const autoLockedLine = stats.autoLocked
    ? `<b>${fmt(stats.autoLocked)}</b> ${tx.stars} ${tx.autoLockedLabel}`
    : "";

  const approx = stats.approxUSD ? ` (~${stats.approxUSD}$)` : "";

  const text =
    `⭐ <b>${tx.welcomeTitle}, ${username}</b>\n\n` +
    `${tx.bought}\n` +
    `${totalLine}${approx}` +
    (autoLockedLine ? `\n${autoLockedLine}` : "");

  return bot.sendMessage(chatId, text, {
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [
        [tx.buttons.buyStars],
        [tx.buttons.buyPremium],
        [tx.buttons.faq, tx.buttons.profile],
        [tx.buttons.calc, tx.buttons.top],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  });
}

module.exports = {
  getTexts,
  sendWelcomeAndMenu,
};