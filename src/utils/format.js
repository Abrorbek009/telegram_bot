function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US").replace(/,/g, " ");
}

function formatDate(value) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toISOString().replace("T", " ").slice(0, 19);
}

module.exports = {
  formatDate,
  formatNumber,
};
