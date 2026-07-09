const { confirmWebhookPayment, validateWebhook } = require("../services/payment-service");
const { logger } = require("../services/logger");

function createWebhookHandler(provider) {
  return async function webhookHandler(req, res) {
    try {
      const isValid = validateWebhook(provider, req.body || {}, req.headers || {});
      if (!isValid) {
        return res.status(401).json({ ok: false, error: "Invalid webhook signature" });
      }

      const result = await confirmWebhookPayment(provider, req.body || {});

      logger.info("Webhook payment confirmed", {
        provider,
        transactionId: result.transaction.transactionId,
      });

      return res.json({
        ok: true,
        transactionId: result.transaction.transactionId,
      });
    } catch (error) {
      logger.error("Webhook processing failed", {
        provider,
        error: error.message,
      });

      return res.status(500).json({ ok: false, error: error.message });
    }
  };
}

function healthController(req, res) {
  res.json({
    ok: true,
    service: "telegram-wallet-bot",
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  createWebhookHandler,
  healthController,
};
