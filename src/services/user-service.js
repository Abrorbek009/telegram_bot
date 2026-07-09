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
