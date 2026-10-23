import { mkdirSync } from "fs";
import { join, basename } from "path";
import { fileURLToPath } from "url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const [input, slugArg] = process.argv.slice(2);
if (!input || !slugArg) {
  console.error("Usage: node scripts/optimise-image.mjs <photo.jpg> <slug>");
  console.error("Writes images/jobs/<slug>.webp and images/jobs/<slug>.jpg, then prints a jobs.json stub.");
  process.exit(1);
}

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("sharp is not installed. From the site folder run: npm install --no-save sharp");
  process.exit(1);
}

const slug = basename(slugArg).replace(/\.(jpe?g|webp|png)$/i, "");
mkdirSync(join(root, "images/jobs"), { recursive: true });
const pipeline = sharp(input, { failOn: "none" }).rotate();
await pipeline.clone().webp({ quality: 74, effort: 5 }).toFile(join(root, "images/jobs", `${slug}.webp`));
await pipeline.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(join(root, "images/jobs", `${slug}.jpg`));
const meta = await sharp(join(root, "images/jobs", `${slug}.jpg`)).metadata();
console.log(JSON.stringify({
  id: slug,
  src: slug,
  width: meta.width,
  height: meta.height,
  title: "",
  alt: "",
  caption: "",
  services: ["interior-painting"],
  beforeAfter: false,
  featured: false,
  weight: 70
}, null, 2));
