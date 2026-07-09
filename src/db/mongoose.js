const mongoose = require("mongoose");
const { env } = require("../config/env");
const { logger } = require("../services/logger");

async function connectMongo() {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });

  logger.info("MongoDB connected");
}

module.exports = {
  connectMongo,
};
