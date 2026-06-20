async function sendProcessed(producer, imageId, filename) {
  await producer.send({
    topic: "image.processed",
    messages: [{ value: JSON.stringify({ imageId, filename, status: "ready" }) }],
  });
  console.log(`Отправлено image.processed: ${filename}`);
}

module.exports = { sendProcessed };
