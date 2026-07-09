const express = require("express");
const routes = require("./routes/webhooks");
const { logger } = require("./services/logger");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(routes);

  app.use((error, req, res, next) => {
    logger.error("Unhandled HTTP error", {
      error: error.message,
      path: req.path,
    });

    res.status(500).json({ ok: false, error: "Internal server error" });
  });

  return app;
}

module.exports = {
  createApp,
};
