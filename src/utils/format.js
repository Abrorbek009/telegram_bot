function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US").replace(/,/g, " ");
}

module.exports = {
  formatNumber,
};
