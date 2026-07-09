const PremiumRequest = require("../models/PremiumRequest");
const User = require("../models/User");
const { PREMIUM_PLANS } = require("../config/catalog");
const { generateId } = require("../utils/id");
const { debitWallet, refundWallet } = require("./wallet-service");

async function createPremiumRequest(user, planKey) {
  const plan = PREMIUM_PLANS[planKey];
  if (!plan) {
    throw new Error("Premium plan not found");
  }

  if (user.premium.status === "pending") {
    throw new Error("Premium request already pending");
  }

  const transaction = await debitWallet({
    user,
    amount: plan.amount,
    serviceType: "premium",
    metadata: { planKey },
  });

  const request = await PremiumRequest.create({
    requestId: generateId("PREM"),
    user: user._id,
    telegramId: user.telegramId,
    planKey,
    planTitle: plan.titles[user.language] || plan.titles.uz,
    amount: plan.amount,
    transaction: transaction._id,
    status: "pending",
  });

  user.premium.status = "pending";
  user.premium.lastPlanKey = planKey;
  user.premium.lastRequestAt = new Date();
  await user.save();

  return { request, transaction, plan };
}

async function approvePremiumRequest(requestId, adminTelegramId) {
  const request = await PremiumRequest.findOne({ requestId }).populate("user");
  if (!request) {
    throw new Error("Premium request not found");
  }

  if (request.status !== "pending") {
    throw new Error("Premium request already processed");
  }

  const user = await User.findById(request.user._id);
  const plan = PREMIUM_PLANS[request.planKey];
  const expiresAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

  request.status = "approved";
  request.adminTelegramId = String(adminTelegramId || "");
  request.decidedAt = new Date();
  await request.save();

  user.premium.status = "active";
  user.premium.expiresAt = expiresAt;
  user.premium.lastPlanKey = request.planKey;
  user.premium.lastApprovedAt = new Date();
  await user.save();

  return { request, user, expiresAt };
}

async function rejectPremiumRequest(requestId, adminTelegramId, reason = "") {
  const request = await PremiumRequest.findOne({ requestId }).populate("user");
  if (!request) {
    throw new Error("Premium request not found");
  }

  if (request.status !== "pending") {
    throw new Error("Premium request already processed");
  }

  const user = await User.findById(request.user._id);

  request.status = "rejected";
  request.adminTelegramId = String(adminTelegramId || "");
  request.rejectionReason = reason;
  request.decidedAt = new Date();
  await request.save();

  await refundWallet({
    user,
    amount: request.amount,
    metadata: {
      premiumRequestId: request.requestId,
      reason: reason || "Premium request rejected by admin",
    },
  });

  user.premium.status = "rejected";
  user.premium.lastRejectedAt = new Date();
  await user.save();

  return { request, user };
}

async function getPendingPremiumRequests(limit = 20) {
  return PremiumRequest.find({ status: "pending" }).sort({ createdAt: -1 }).limit(limit);
}

module.exports = {
  approvePremiumRequest,
  createPremiumRequest,
  getPendingPremiumRequests,
  rejectPremiumRequest,
};
