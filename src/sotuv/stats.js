const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "stats.json");

function read() {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const j = JSON.parse(raw);
    return {
      botBought: Number(j.botBought) || 0,
      autoLocked: Number(j.autoLocked) || 0,
      approxUSD: Number(j.approxUSD) || 0,
    };
  } catch (e) {
    return { botBought: 0, autoLocked: 0, approxUSD: 0 };
  }
}

module.exports = { read };
