import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = process.argv[2];
const output = path.resolve(__dirname, "../public/assets/authorized-signature.png");

if (!source || !fs.existsSync(source)) {
  console.error("Source image not found:", source);
  process.exit(1);
}

fs.mkdirSync(path.dirname(output), { recursive: true });

const metadata = await sharp(source).metadata();
const cropWidth = Math.round(metadata.width * 0.68);
const cropHeight = Math.round(metadata.height * 0.5);
const cropLeft = Math.round((metadata.width - cropWidth) / 2);
const cropTop = Math.round(metadata.height * 0.24);

const { data, info } = await sharp(source)
  .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
  .rotate()
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const threshold = 152;
const outputData = Buffer.alloc(info.width * info.height * 4);

for (let i = 0, j = 0; i < data.length; i += 4, j += 4) {
  const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;

  if (gray >= threshold) {
    outputData[j + 3] = 0;
    continue;
  }

  const strength = Math.min(1, (threshold - gray) / 95);
  outputData[j] = 55;
  outputData[j + 1] = 24;
  outputData[j + 2] = 132;
  outputData[j + 3] = Math.round(120 + strength * 135);
}

await sharp(outputData, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ threshold: 10 })
  .resize({ width: 420, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(output);

const apiOutput = path.resolve(__dirname, "../api/assets/authorized-signature.png");
fs.mkdirSync(path.dirname(apiOutput), { recursive: true });
fs.copyFileSync(output, apiOutput);

console.log("Signature saved to", output);
