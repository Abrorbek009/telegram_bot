const sessions = new Map();

function setSession(chatId, state, data = {}) {
  sessions.set(String(chatId), {
    state,
    data,
    updatedAt: new Date(),
  });
}

function getSession(chatId) {
  return sessions.get(String(chatId)) || null;
}

function clearSession(chatId) {
  sessions.delete(String(chatId));
}

function hasState(chatId, state) {
  const session = getSession(chatId);
  return session?.state === state;
}

module.exports = {
  clearSession,
  getSession,
  hasState,
  setSession,
};
