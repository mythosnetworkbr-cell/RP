const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = process.cwd();
const source = path.join(root, 'assets', 'logo.svg');
const out = path.join(root, 'assets', 'app-icon.png');

async function main() {
  if (!fs.existsSync(source)) throw new Error(`Missing ${source}`);
  await sharp(source, {density: 1024})
    .resize(1024, 1024, {fit: 'cover', position: 'center'})
    .png({compressionLevel: 9})
    .toFile(out);
  console.log(`Generated ${out}`);
}

main().catch(error => { console.error(error); process.exit(1); });
