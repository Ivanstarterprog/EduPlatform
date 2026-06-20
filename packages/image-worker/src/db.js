const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://root:example@localhost:27017/eduplatform?authSource=admin";

async function connectDb() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB подключён");
}

async function updateStatus(imageId, filename, entityType, entityId) {
  const db = mongoose.connection.db;

  const Image = db.collection("images");
  await Image.updateOne(
    { _id: new mongoose.Types.ObjectId(imageId) },
    { $set: { status: "ready", url: `/uploads/processed/${filename}` } }
  );

  if (entityType === "course") {
    const Course = db.collection("courses");
    await Course.updateOne(
      { _id: new mongoose.Types.ObjectId(entityId), "coverImage.filename": filename },
      { $set: { "coverImage.status": "ready", "coverImage.url": `/uploads/processed/${filename}` } }
    );
  }

  if (entityType === "lesson") {
    const Lesson = db.collection("lessons");
    await Lesson.updateOne(
      { _id: new mongoose.Types.ObjectId(entityId), "images.filename": filename },
      { $set: { "images.$.status": "ready", "images.$.url": `/uploads/processed/${filename}` } }
    );
  }
}

module.exports = { connectDb, updateStatus };
