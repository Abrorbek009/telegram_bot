const { env } = require("../config/env");
const { renderTemplate } = require("../utils/template");
const { createTransaction, completeTopupTransaction, findTransactionById } = require("./wallet-service");
const { rewardReferralAfterFirstTopup } = require("./referral-service");

function assertTopupAmount(amount) {
  if (!Number.isFinite(amount) || amount < env.walletMinTopup) {
    throw new Error(`Minimum topup amount is ${env.walletMinTopup}`);
  }
}

async function createProviderTopup(user, provider, amount) {
  assertTopupAmount(amount);

  const transaction = await createTransaction({
    user,
    type: "topup",
    serviceType: "wallet_topup",
    paymentMethod: provider,
    amount,
    currency: env.defaultCurrency,
    status: "pending",
    metadata: {
      provider,
      userTelegramId: user.telegramId,
    },
  });

  let paymentUrl = "";

  if (provider === "payme") {
    paymentUrl = renderTemplate(env.paymeCheckoutUrlTemplate, {
      merchantId: env.paymeMerchantId,
      amount: amount * 100,
      transactionId: transaction.transactionId,
    });
  }

  if (provider === "click") {
    paymentUrl = renderTemplate(env.clickCheckoutUrlTemplate, {
      serviceId: env.clickServiceId,
      merchantId: env.clickMerchantId,
      amount,
      transactionId: transaction.transactionId,
    });
  }

  transaction.paymentUrl = paymentUrl;
  await transaction.save();

  return transaction;
}

function validateWebhook(provider, payload, headers) {
  if (provider === "payme") {
    const token = headers["x-payme-token"] || payload.callbackToken;
    return token && token === env.paymeCallbackToken;
  }

  if (provider === "click") {
    const secret = headers["x-click-secret"] || payload.secret_key;
    return secret && secret === env.clickSecretKey;
  }

  if (provider === "telegram_stars") {
    const secret = headers["x-telegram-stars-secret"] || payload.secret;
    return secret && secret === env.telegramStarsProviderToken;
  }

  return false;
}

async function confirmWebhookPayment(provider, payload) {
  const transactionId = payload.transactionId || payload.merchant_trans_id || payload.payload;
  const providerPaymentId = payload.providerPaymentId || payload.click_trans_id || payload.payme_trans_id || "";

  const transaction = await findTransactionById(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  await completeTopupTransaction(transaction, providerPaymentId);

  const populatedTransaction = await transaction.populate("user");
  const rewarded = await rewardReferralAfterFirstTopup(populatedTransaction.user);

  return { transaction, rewarded };
}

async function confirmTelegramStarsPayment(transactionId, providerPaymentId) {
  const transaction = await findTransactionById(transactionId);
  if (!transaction) {
    throw new Error("Telegram Stars transaction not found");
  }

  await completeTopupTransaction(transaction, providerPaymentId);

  const populatedTransaction = await transaction.populate("user");
  const rewarded = await rewardReferralAfterFirstTopup(populatedTransaction.user);

  return { transaction, rewarded };
}

module.exports = {
  confirmTelegramStarsPayment,
  confirmWebhookPayment,
  createProviderTopup,
  validateWebhook,
};
