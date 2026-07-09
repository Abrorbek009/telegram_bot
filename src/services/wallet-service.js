const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { env } = require("../config/env");
const { generateId } = require("../utils/id");

async function createTransaction({
  user,
  type,
  serviceType,
  paymentMethod,
  amount,
  currency = env.defaultCurrency,
  status = "pending",
  metadata = {},
  providerPaymentId = "",
  paymentUrl = "",
}) {
  return Transaction.create({
    transactionId: generateId("TX"),
    user: user._id,
    telegramId: user.telegramId,
    type,
    serviceType,
    paymentMethod,
    amount,
    currency,
    status,
    metadata,
    providerPaymentId,
    paymentUrl,
    completedAt: status === "completed" ? new Date() : null,
  });
}

async function completeTopupTransaction(transaction, providerPaymentId = "") {
  if (transaction.status === "completed") {
    return transaction;
  }

  const user = await User.findById(transaction.user);
  if (!user) {
    throw new Error("User not found for transaction");
  }

  user.wallet.balance += transaction.amount;
  user.transactionsCount += 1;
  await user.save();

  transaction.status = "completed";
  transaction.providerPaymentId = providerPaymentId || transaction.providerPaymentId;
  transaction.completedAt = new Date();
  await transaction.save();

  return transaction;
}

async function failTransaction(transaction, reason) {
  transaction.status = "failed";
  transaction.metadata = { ...transaction.metadata, failureReason: reason };
  await transaction.save();
  return transaction;
}

async function debitWallet({
  user,
  amount,
  serviceType,
  metadata = {},
}) {
  if (user.wallet.balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  user.wallet.balance -= amount;
  user.transactionsCount += 1;
  await user.save();

  return createTransaction({
    user,
    type: "purchase",
    serviceType,
    paymentMethod: "wallet",
    amount: -Math.abs(amount),
    status: "completed",
    metadata,
  });
}

async function creditWallet({
  user,
  amount,
  type,
  serviceType,
  paymentMethod,
  metadata = {},
}) {
  user.wallet.balance += amount;
  user.transactionsCount += 1;
  await user.save();

  return createTransaction({
    user,
    type,
    serviceType,
    paymentMethod,
    amount,
    status: "completed",
    metadata,
  });
}

async function refundWallet({ user, amount, metadata = {} }) {
  return creditWallet({
    user,
    amount,
    type: "refund",
    serviceType: "refund",
    paymentMethod: "admin",
    metadata,
  });
}

async function getRecentTransactions(userId, limit = 10) {
  return Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
}

async function findTransactionById(transactionId) {
  return Transaction.findOne({ transactionId });
}

module.exports = {
  completeTopupTransaction,
  createTransaction,
  creditWallet,
  debitWallet,
  failTransaction,
  findTransactionById,
  getRecentTransactions,
  refundWallet,
};
