require("dotenv").config();
const express = require("express");
const { connectDb } = require("./db");
const { startConsumer } = require("./consumer");

const app = express();
const PORT = process.env.PORT || 4000;

app.get("/health", (_req, res) => res.json({ status: "ok" }));

async function start() {
  await connectDb();
  await startConsumer();
  app.listen(PORT, () => console.log(`Image Worker запущен на порту ${PORT}`));
}

start().catch((err) => {
  console.error("Ошибка запуска Image Worker", err);
  process.exit(1);
});
