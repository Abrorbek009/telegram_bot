const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: String, required: true, unique: true, index: true },
    chatId: { type: String, required: true, unique: true, index: true },
    username: { type: String, default: "" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    language: { type: String, enum: ["uz", "ru", "en"], default: "uz" },
    wallet: {
      balance: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "UZS" },
    },
    premium: {
      status: {
        type: String,
        enum: ["none", "pending", "active", "rejected"],
        default: "none",
        index: true,
      },
      expiresAt: { type: Date, default: null },
      lastPlanKey: { type: String, default: "" },
      lastRequestAt: { type: Date, default: null },
      lastApprovedAt: { type: Date, default: null },
      lastRejectedAt: { type: Date, default: null },
    },
    referralCode: { type: String, required: true, unique: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    referredUsersCount: { type: Number, default: 0, min: 0 },
    hasReceivedReferralReward: { type: Boolean, default: false },
    transactionsCount: { type: Number, default: 0, min: 0 },
    promoRedemptions: [{ type: String }],
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

userSchema.index({ username: 1 });

module.exports = mongoose.model("User", userSchema);
