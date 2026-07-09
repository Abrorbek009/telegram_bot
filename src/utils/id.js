const crypto = require("crypto");

function generateId(prefix) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 18).toUpperCase();
  return `${prefix}_${suffix}`;
}

module.exports = {
  generateId,
};
