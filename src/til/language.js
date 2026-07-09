const { getLang, hasLang, setLang } = require("../services/language-store");

function sendLanguageMenu(bot, chatId) {
  return bot.sendMessage(chatId, "Tilni tanlang / Choose language / Выберите язык:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇺🇿 O'zbek", callback_data: "lang:uz" }],
        [{ text: "🇷🇺 Русский", callback_data: "lang:ru" }],
        [{ text: "🇬🇧 English", callback_data: "lang:en" }],
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
