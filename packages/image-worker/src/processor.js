const sharp = require("sharp");
const path = require("path");

const UPLOADS_PROCESSED = path.join(__dirname, "..", "..", "..", "uploads", "processed");

async function processImage(originalPath, filename) {
  const meta = await sharp(originalPath).metadata();

  const watermarkWidth = Math.min(meta.width || 600, 600);
  const watermarkHeight = 60;
  const fontSize = Math.min(24, Math.floor(watermarkWidth * 0.04));

  const watermarkText = "Eduplatform - кто прочитал, тот молодец =)";
  const svgWatermark = Buffer.from(
    `<svg width="${watermarkWidth}" height="${watermarkHeight}" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="${Math.floor(fontSize * 1.5)}" font-family="Arial" font-size="${fontSize}" fill="rgba(255,255,255,0.6)">
        ${watermarkText}
      </text>
    </svg>`
  );

  const pipeline = sharp(originalPath).resize(1200, undefined, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80 });

  if (meta.width && meta.height && meta.width >= watermarkWidth && meta.height >= watermarkHeight) {
    await pipeline.composite([{ input: svgWatermark, gravity: "southeast" }]).toFile(path.join(UPLOADS_PROCESSED, filename));
  } else {
    await pipeline.toFile(path.join(UPLOADS_PROCESSED, filename));
  }
}

module.exports = { processImage };
