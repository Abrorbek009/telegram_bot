const TelegramBot = require("node-telegram-bot-api");
const { createApp } = require("./src/app");
const { connectMongo } = require("./src/db/mongoose");
const { registerHandlers } = require("./src/handlers");
const { env, validateEnv } = require("./src/config/env");
const { logger } = require("./src/services/logger");

async function bootstrap() {
  validateEnv();
  await connectMongo();

  const bot = new TelegramBot(env.botToken, { polling: true });
  registerHandlers(bot);

  const app = createApp();
  app.listen(env.port, () => {
    logger.info("HTTP server started", { port: env.port });
  });

  const me = await bot.getMe();
  logger.info("Telegram bot started", { username: me.username });
}

bootstrap().catch((error) => {
  logger.error("Application bootstrap failed", { error: error.message });
  process.exit(1);
});
