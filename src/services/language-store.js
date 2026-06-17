const fs = require("fs");
const path = require("path");

const dataDir = path.resolve(__dirname, "../../data");
const storePath = path.join(dataDir, "user-languages.json");
const memoryStore = new Map();

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, "{}", "utf8");
  }
}

function loadStore() {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw || "{}");

    for (const [chatId, lang] of Object.entries(parsed)) {
      memoryStore.set(String(chatId), lang);
    }
  } catch (error) {
    console.error("Til saqlash fayli o‘qilmadi:", error.message);
  }
}

function saveStore() {
  ensureStoreFile();

  try {
    const payload = Object.fromEntries(memoryStore.entries());
    fs.writeFileSync(storePath, JSON.stringify(payload, null, 2), "utf8");
  } catch (error) {
    console.error("Til saqlash fayliga yozilmadi:", error.message);
  }
}

function hasLang(chatId) {
  return memoryStore.has(String(chatId));
}

function getLang(chatId) {
  return memoryStore.get(String(chatId)) || "uz";
}

function setLang(chatId, lang) {
  memoryStore.set(String(chatId), lang);
  saveStore();
}

loadStore();

module.exports = {
  getLang,
  hasLang,
  setLang,
  storePath,
};
