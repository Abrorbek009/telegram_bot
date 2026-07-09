const mongoose = require("mongoose");

const premiumRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    telegramId: { type: String, required: true, index: true },
    planKey: { type: String, required: true, index: true },
    planTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminTelegramId: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    decidedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

premiumRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("PremiumRequest", premiumRequestSchema);
