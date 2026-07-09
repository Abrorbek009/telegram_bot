const PromoCode = require("../models/PromoCode");
const { creditWallet } = require("./wallet-service");

async function redeemPromoCode(user, rawCode) {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) {
    throw new Error("Promo code is empty");
  }

  const promo = await PromoCode.findOne({ code, isActive: true });
  if (!promo) {
    throw new Error("Promo code not found");
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    throw new Error("Promo code expired");
  }

  if (promo.usedCount >= promo.maxUses) {
    throw new Error("Promo code usage limit reached");
  }

  if (promo.usedBy.some((item) => String(item.telegramId) === String(user.telegramId))) {
    throw new Error("Promo code already redeemed");
  }

  promo.usedCount += 1;
  promo.usedBy.push({
    user: user._id,
    telegramId: user.telegramId,
    usedAt: new Date(),
  });
  await promo.save();

  user.promoRedemptions.push(code);
  await user.save();

  const transaction = await creditWallet({
    user,
    amount: promo.bonusAmount,
    type: "promo_bonus",
    serviceType: "promo",
    paymentMethod: "promo",
    metadata: { promoCode: code },
  });

  return { promo, transaction };
}

module.exports = {
  redeemPromoCode,
};
