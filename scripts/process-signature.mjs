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

const { data, info } = await sharp(source)
  .rotate()
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const brightness = (r + g + b) / 3;
  const purpleInk = b > r + 10 && b > g && brightness < 210;
  const darkInk = brightness < 145;

  if (purpleInk || darkInk) {
    data[i] = Math.min(255, Math.round(r * 0.55));
    data[i + 1] = Math.min(255, Math.round(g * 0.35));
    data[i + 2] = Math.min(255, Math.round(b * 0.95));
    data[i + 3] = 255;
  } else if (brightness > 170) {
    data[i + 3] = 0;
  } else {
    data[i + 3] = Math.max(0, Math.min(255, Math.round((170 - brightness) * 4)));
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ threshold: 10 })
  .resize({ width: 420, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log("Signature saved to", output);
