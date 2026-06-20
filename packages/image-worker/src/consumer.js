const { Kafka } = require("kafkajs");
const { processImage } = require("./processor");
const { updateStatus } = require("./db");
const { sendProcessed } = require("./producer");

const kafka = new Kafka({
  clientId: "image-worker",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const consumer = kafka.consumer({ groupId: "image-worker-group" });
const producer = kafka.producer();

async function startConsumer() {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: "image.uploaded", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`Получена задача: ${data.filename}`);

      try {
        console.log(`Шаг 1: обработка ${data.originalPath}`);
        await processImage(data.originalPath, data.filename);
        console.log(`Шаг 2: обновление статуса`);
        await updateStatus(data.imageId, data.filename, data.entityType, data.entityId);
        console.log(`Шаг 3: отправка подтверждения`);
        await sendProcessed(producer, data.imageId, data.filename);
        console.log(`Готово: ${data.filename}`);
      } catch (err) {
        console.error(`Ошибка обработки ${data.filename}:`, err.message);
        console.error(err.stack);
      }
    },
  });
}

module.exports = { startConsumer };
