const fs = require("fs");
const path = require("path");
const { logger } = require("./logger");

const statsPath = path.resolve(__dirname, "../../stats.json");

function readStats() {
  try {
    if (!fs.existsSync(statsPath)) {
      return { botBought: 0, autoLocked: 0, approxUSD: 0 };
    }

    const raw = fs.readFileSync(statsPath, "utf8");
    const parsed = JSON.parse(raw || "{}");

    return {
      botBought: Number(parsed.botBought) || 0,
      autoLocked: Number(parsed.autoLocked) || 0,
      approxUSD: Number(parsed.approxUSD) || 0,
    };
  } catch (error) {
    logger.error("Stats read failed", { error: error.message });
    return { botBought: 0, autoLocked: 0, approxUSD: 0 };
  }
}

module.exports = {
  readStats,
  statsPath,
};
