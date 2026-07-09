const User = require("../models/User");
const { env } = require("../config/env");
const { creditWallet } = require("./wallet-service");

async function applyReferralFromStart(user, rawReferralCode) {
  if (!rawReferralCode || user.referredBy) {
    return { applied: false, reason: "skipped" };
  }

  const referralCode = String(rawReferralCode).trim().toUpperCase();
  if (!referralCode || user.referralCode === referralCode) {
    return { applied: false, reason: "self_referral" };
  }

  const inviter = await User.findOne({ referralCode });
  if (!inviter) {
    return { applied: false, reason: "not_found" };
  }

  user.referredBy = inviter._id;
  await user.save();

  inviter.referredUsersCount += 1;
  await inviter.save();

  return { applied: true, inviter };
}

async function rewardReferralAfterFirstTopup(user) {
  if (!env.rewardReferralOnFirstTopup) return { rewarded: false, reason: "disabled" };
  if (user.hasReceivedReferralReward) return { rewarded: false, reason: "already_rewarded" };
  if (!user.referredBy) return { rewarded: false, reason: "no_inviter" };

  const inviter = await User.findById(user.referredBy);
  if (!inviter) return { rewarded: false, reason: "inviter_missing" };

  await creditWallet({
    user: inviter,
    amount: env.walletReferralBonus,
    type: "referral_bonus",
    serviceType: "referral",
    paymentMethod: "referral",
    metadata: { invitedUserTelegramId: user.telegramId },
  });

  await creditWallet({
    user,
    amount: env.referredUserBonus,
    type: "referral_bonus",
    serviceType: "referral",
    paymentMethod: "referral",
    metadata: { inviterTelegramId: inviter.telegramId },
  });

  user.hasReceivedReferralReward = true;
  await user.save();

  return { rewarded: true, inviter };
}

module.exports = {
  applyReferralFromStart,
  rewardReferralAfterFirstTopup,
};
