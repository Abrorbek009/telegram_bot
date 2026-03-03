// src/til/language.js
const userLang = new Map(); // chatId -> 'uz' | 'ru' | 'en'

function hasLang(chatId) {
  return userLang.has(chatId);
}

function getLang(chatId) {
  return userLang.get(chatId) || "uz";
}

function setLang(chatId, lang) {
  userLang.set(chatId, lang);
}

function sendLanguageMenu(bot, chatId) {
  return bot.sendMessage(
    chatId,
    "Tilni tanlang / Choose language / Выберите язык:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🇺🇿 O‘zbek", callback_data: "lang:uz" }],
          [{ text: "🇷🇺 Русский", callback_data: "lang:ru" }],
          [{ text: "🇬🇧 English", callback_data: "lang:en" }],
        ],
      },
    }
  );
}

module.exports = {
  hasLang,
  getLang,
  setLang,
  sendLanguageMenu,
};