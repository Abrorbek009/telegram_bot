require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { registerHandlers } = require("./src/handlers");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN topilmadi. .env faylni tekshir!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("✅ Bot ishga tushdi...");

bot.getMe()
  .then((me) => console.log(`✅ Token OK. Bot: @${me.username}`))
  .catch((err) => {
    console.error("❌ Token xato yoki revoke qilingan!");
    console.error(err?.response?.body || err?.message || err);
    process.exit(1);
  });

// hamma logikani ulaymiz
registerHandlers(bot);