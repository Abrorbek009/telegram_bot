const express = require("express");
const { createWebhookHandler, healthController } = require("../controllers/webhook-controller");

const router = express.Router();

router.get("/health", healthController);
router.post("/webhooks/payme", createWebhookHandler("payme"));
router.post("/webhooks/click", createWebhookHandler("click"));
router.post("/webhooks/telegram-stars", createWebhookHandler("telegram_stars"));

module.exports = router;
