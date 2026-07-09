const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    telegramId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["topup", "purchase", "promo_bonus", "referral_bonus", "refund"],
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: ["wallet_topup", "stars", "premium", "promo", "referral", "refund"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["click", "payme", "telegram_stars", "wallet", "promo", "referral", "admin"],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "UZS" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    providerPaymentId: { type: String, default: "" },
    paymentUrl: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

transactionSchema.index({ createdAt: -1, telegramId: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
