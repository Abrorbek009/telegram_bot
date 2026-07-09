const { env } = require("../config/env");
const { logger } = require("./logger");

function isAdminTelegramId(telegramId) {
  return env.adminChatIds.includes(String(telegramId));
}

async function notifyAdmins(bot, text, extra = {}) {
  const deliveries = env.adminChatIds.map(async (adminId) => {
    try {
      await bot.sendMessage(adminId, text, extra);
    } catch (error) {
      logger.error("Admin notification failed", {
        adminId,
        error: error.message,
      });
    }
  });

  await Promise.all(deliveries);
}

module.exports = {
  isAdminTelegramId,
  notifyAdmins,
};
