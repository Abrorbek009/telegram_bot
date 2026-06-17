const { ADMIN_USERNAME, PREMIUM_PLANS } = require("../config/catalog");
const { readStats } = require("../services/stats-store");
const { formatNumber } = require("../utils/format");

function getTexts(lang = "uz") {
  const t = {
    uz: {
      welcomeTitle: "Xush kelibsiz",
      bought: "✨ Bot yordamida sotib olingan",
      stars: "yulduzlar",
      buttons: {
        buyStars: "⭐ Yulduzlarni sotib oling",
        buyPremium: "🛍 Premium sotib oling",
        faq: "📌 Tez-tez so‘raladigan savollar",
        profile: "👤 Profil",
        calc: "🧮 Kalkulyator",
        top: "🏆 Eng yaxshi xaridorlar",
      },
      replies: {
        faq: `
📌 <b>Ko‘p so‘raladigan savollar:</b>

❓ <b>Tovar qanday beriladi?</b>
💬 Yulduzlar buyurtma paytida ko‘rsatgan akkauntingizga tushadi.

❓ <b>Premium qanday beriladi?</b>
💬 Premium sovg‘a sifatida profilingizga yuboriladi va darhol ochiladi.

❓ <b>Yulduzlar qanchada keladi?</b>
💬 Odatda 15 soniya ichida yetib boradi.

❓ <b>Faqat o‘zim uchun sotib olsam bo‘ladimi?</b>
💬 Yo‘q, istalgan foydalanuvchiga yuborishingiz mumkin.

❓ <b>Blok yoki refund bo‘ladimi?</b>
💬 Yo‘q, biz Telegram rasmiy tizimidan foydalanamiz.
        `,
        calc: "🚀 Kerakli yulduz sonini yuboring. Masalan: <b>100</b>",
        calcInvalid: "❌ Iltimos, faqat musbat son yuboring. Masalan: <b>100</b>",
        top: "🏆 Top xaridorlar (tez orada).",
        pickFromMenu: "❓ Iltimos, menyudan tanlang.",
        starsHeader: "⭐ <b>Yulduz sotib olish bo‘limi</b>\n\nPaketni tanlang 👇",
        premiumHeader:
          "🛍 <b>Premium tariflar</b>\n\nQaysi tarif kerakligini tanlang 👇\n\n" +
          `📩 <b>Murojaat:</b> @${ADMIN_USERNAME}\n` +
          "📝 <i>Eslatma: nima olishingizni adminga yozing.</i>",
      },
    },

    ru: {
      welcomeTitle: "Добро пожаловать",
      bought: "✨ С помощью бота куплено",
      stars: "звёзд",
      buttons: {
        buyStars: "⭐ Купить звезды",
        buyPremium: "🛍 Премиум",
        faq: "📌 FAQ",
        profile: "👤 Профиль",
        calc: "🧮 Калькулятор",
        top: "🏆 Топ",
      },
      replies: {
        faq: `
📌 <b>Часто задаваемые вопросы:</b>

❓ <b>Как происходит выдача товара?</b>
💬 Звёзды приходят на указанный аккаунт.

❓ <b>Как выдаётся премиум?</b>
💬 Премиум приходит подарком.

❓ <b>Как быстро доставка?</b>
💬 Обычно до 15 секунд.

❓ <b>Можно ли купить не себе?</b>
💬 Да, можно отправить любому пользователю.

❓ <b>Есть ли риск?</b>
💬 Нет, используется официальная система Telegram.
        `,
        calc: "🚀 Отправьте нужное количество звёзд. Например: <b>100</b>",
        calcInvalid: "❌ Пожалуйста, отправьте только положительное число. Например: <b>100</b>",
        top: "🏆 Топ (скоро).",
        pickFromMenu: "❓ Выберите из меню.",
        starsHeader: "⭐ <b>Покупка звёзд</b>\n\nВыберите пакет 👇",
        premiumHeader:
          "🛍 <b>Тарифы Premium</b>\n\nВыберите нужный тариф 👇\n\n" +
          `📩 <b>Для связи:</b> @${ADMIN_USERNAME}\n` +
          "📝 <i>Напишите админу, что именно хотите купить.</i>",
      },
    },

    en: {
      welcomeTitle: "Welcome",
      bought: "✨ Bought using bot",
      stars: "stars",
      buttons: {
        buyStars: "⭐ Buy stars",
        buyPremium: "🛍 Premium",
        faq: "📌 FAQ",
        profile: "👤 Profile",
        calc: "🧮 Calculator",
        top: "🏆 Top",
      },
      replies: {
        faq: `
📌 <b>Frequently Asked Questions:</b>

❓ <b>How is the product delivered?</b>
💬 Stars are sent to your account.

❓ <b>How is premium delivered?</b>
💬 Premium is sent as a gift.

❓ <b>How fast is delivery?</b>
💬 Usually within 15 seconds.

❓ <b>Can I send to others?</b>
💬 Yes, to any @username.

❓ <b>Is it safe?</b>
💬 Yes, official Telegram system is used.
        `,
        calc: "🚀 Send the required number of stars. Example: <b>100</b>",
        calcInvalid: "❌ Please send only a positive number. Example: <b>100</b>",
        top: "🏆 Top (soon).",
        pickFromMenu: "❓ Choose from menu.",
        starsHeader: "⭐ <b>Buy stars</b>\n\nChoose a package 👇",
        premiumHeader:
          "🛍 <b>Premium plans</b>\n\nChoose the plan you need 👇\n\n" +
          `📩 <b>Contact:</b> @${ADMIN_USERNAME}\n` +
          "📝 <i>Please message the admin with what you want to buy.</i>",
      },
    },
  };

  return t[lang] || t.uz;
}

function getStarsKeyboard() {
  return [
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
  ];
}

async function sendWelcomeAndMenu(bot, msg, lang) {
  const chatId = msg.chat.id;
  const tx = getTexts(lang);
  const stats = readStats();

  const username = msg.from?.username
    ? `@${msg.from.username}`
    : msg.from?.first_name || "friend";

  const totalLine = `<b>${formatNumber(stats.botBought)} ${tx.stars}</b>`;
  const approx = stats.approxUSD ? ` (~${stats.approxUSD}$)` : "";

  const text =
    `⭐ <b>${tx.welcomeTitle}, ${username}</b>\n\n` +
    `${tx.bought}\n` +
    `${totalLine}${approx}`;

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
    },
  });
}

async function sendStarsMenu(bot, chatId, lang) {
  const tx = getTexts(lang);

  return bot.sendMessage(chatId, tx.replies.starsHeader, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: getStarsKeyboard(),
    },
  });
}

async function sendPremiumMenu(bot, chatId, lang) {
  const tx = getTexts(lang);
  const premiumButtons = Object.keys(PREMIUM_PLANS).map((key) => [
    {
      text: PREMIUM_PLANS[key].title[lang] || PREMIUM_PLANS[key].title.uz,
      callback_data: `prem:${key}`,
    },
  ]);

  return bot.sendMessage(chatId, tx.replies.premiumHeader, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: premiumButtons,
    },
  });
}

module.exports = {
  getTexts,
  sendPremiumMenu,
  sendStarsMenu,
  sendWelcomeAndMenu,
};
