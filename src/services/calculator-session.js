const pendingCalculatorChats = new Set();

function startCalculator(chatId) {
  pendingCalculatorChats.add(String(chatId));
}

function stopCalculator(chatId) {
  pendingCalculatorChats.delete(String(chatId));
}

function isCalculatorPending(chatId) {
  return pendingCalculatorChats.has(String(chatId));
}

module.exports = {
  isCalculatorPending,
  startCalculator,
  stopCalculator,
};
