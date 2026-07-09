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
        buyStars: "⭐ Yulduzlar",
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
      welcomeTitle: "Добро пожаловать",
      bought: "Куплено через бота",
      stars: "звёзд",
      buttons: {
        buyStars: "⭐ Звезды",
        buyPremium: "Premium",
        topUp: "Пополнить баланс",
        transactions: "Транзакции",
        profile: "Профиль",
        promo: "Промокод",
        referral: "Реферал",
        calc: "Калькулятор",
        faq: "FAQ",
        top: "Топ",
      },
      replies: {
        faq:
          "<b>FAQ</b>\n\n" +
          "Заказы на звезды и Premium принимаются через бота.\n" +
          `Админ: @${ADMIN_USERNAME}`,
        calc: "Отправьте нужное количество звёзд. Например: <b>100</b>",
        calcInvalid: "Пожалуйста, отправьте положительное число. Например: <b>100</b>",
        top: "Раздел топа будет заполнен позже.",
        pickFromMenu: "Пожалуйста, выберите пункт меню.",
        topupPrompt: "Выберите способ оплаты:",
        amountPrompt: "Отправьте сумму. Например: <b>50000</b>",
        amountInvalid: "Пожалуйста, отправьте корректную сумму.",
        promoPrompt: "Отправьте промокод:",
        starsHeader: "<b>Покупка звезд</b>\nВыберите пакет для оплаты из wallet:",
        premiumHeader: "<b>Тарифы Premium</b>\nВыберите тариф для оплаты из wallet:",
        historyEmpty: "Транзакций пока нет.",
        profilePremiumNone: "Нет",
        profilePremiumPending: "Ожидает одобрения",
        profilePremiumRejected: "Отклонен",
        profilePremiumActive: "Активен",
        referralText:
          "Приглашайте друзей и получайте бонус.\n" +
          "Ваш referral код: <b>{code}</b>\n" +
          "Приглашено: <b>{count}</b>",
        insufficientBalance: "Недостаточно средств в wallet.",
        premiumPending: "Запрос на Premium отправлен администратору.",
        starsPurchased: "Заказ принят. Администратор свяжется с вами.",
        topupCreated:
          "<b>{provider}</b> платеж создан.\n" +
          "Transaction ID: <b>{transactionId}</b>\n" +
          "Сумма: <b>{amount}</b>\n" +
          "{paymentUrl}",
        webhookWaiting: "После подтверждения платежа wallet пополнится автоматически.",
      },
    },
    en: {
      welcomeTitle: "Welcome",
      bought: "Purchased via bot",
      stars: "stars",
      buttons: {
        buyStars: "⭐ Stars",
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
    { text: `⭐ ${amount}`, callback_data: `walletbuy:stars:${amount}` },
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
    `⭐ <b>${tx.welcomeTitle}, ${username}</b>\n\n` +
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
