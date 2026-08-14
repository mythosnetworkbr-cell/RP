const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 1024;
const pixels = Buffer.alloc(SIZE * SIZE * 4);
function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
function setPixel(x, y, r, g, b, a = 255) { if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return; const i = (y * SIZE + x) * 4; pixels[i] = clamp(r); pixels[i + 1] = clamp(g); pixels[i + 2] = clamp(b); pixels[i + 3] = clamp(a); }
function blend(x, y, r, g, b, a) { if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return; const i = (y * SIZE + x) * 4; const alpha = a / 255; pixels[i] = clamp(pixels[i] * (1 - alpha) + r * alpha); pixels[i + 1] = clamp(pixels[i + 1] * (1 - alpha) + g * alpha); pixels[i + 2] = clamp(pixels[i + 2] * (1 - alpha) + b * alpha); pixels[i + 3] = 255; }
function line(x0, y0, x1, y1, width, color) { const dx = x1 - x0, dy = y1 - y0, steps = Math.max(Math.abs(dx), Math.abs(dy)); for (let i = 0; i <= steps; i++) { const t = steps === 0 ? 0 : i / steps, x = x0 + dx * t, y = y0 + dy * t, r = Math.ceil(width / 2); for (let oy = -r; oy <= r; oy++) for (let ox = -r; ox <= r; ox++) if (ox * ox + oy * oy <= r * r) blend(Math.round(x + ox), Math.round(y + oy), ...color); } }
function polygon(points, color) { const minY = Math.max(0, Math.floor(Math.min(...points.map(p => p[1])))), maxY = Math.min(SIZE - 1, Math.ceil(Math.max(...points.map(p => p[1])))); for (let y = minY; y <= maxY; y++) { const xs = []; for (let i = 0; i < points.length; i++) { const a = points[i], b = points[(i + 1) % points.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); } xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x++) blend(x, y, ...color); } }
function roundedRect(x0, y0, x1, y1, radius, color) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const cx = x < x0 + radius ? x0 + radius : x > x1 - radius ? x1 - radius : x; const cy = y < y0 + radius ? y0 + radius : y > y1 - radius ? y1 - radius : y; if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) blend(x, y, ...color); } }
for (let y = 0; y < SIZE; y++) { const ty = y / (SIZE - 1); for (let x = 0; x < SIZE; x++) { const tx = x / (SIZE - 1); setPixel(x, y, 5 + 20 * tx + 6 * (1 - ty), 2 + 4 * tx, 14 + 45 * (1 - tx) + 18 * ty, 255); } }
roundedRect(46, 46, 978, 978, 155, [5, 4, 12, 255]);
line(135, 210, 300, 115, 7, [255, 0, 185, 255]); line(300, 115, 512, 70, 7, [210, 70, 255, 255]); line(512, 70, 730, 115, 7, [85, 100, 255, 255]); line(730, 115, 890, 210, 7, [0, 120, 255, 255]);
const crown = [[300,370],[330,230],[425,305],[512,190],[600,305],[695,230],[725,370],[680,455],[345,455]]; polygon(crown, [165,35,255,255]); line(300,370,725,370,18,[255,0,190,255]); line(345,455,680,455,20,[40,100,255,255]);
const m = [[210,670],[275,470],[350,650],[512,500],[674,650],[750,470],[815,670],[720,670],[674,565],[512,720],[350,565],[305,670]]; polygon(m,[240,240,248,255]); line(210,670,305,670,10,[255,0,190,255]); line(720,670,815,670,10,[35,100,255,255]);
const rp = [[340,760],[430,700],[520,745],[600,700],[690,760],[610,800],[520,770],[430,800]]; polygon(rp,[200,35,255,255]); line(340,760,430,800,8,[255,0,185,255]); line(610,800,690,760,8,[40,90,255,255]);
function crc32(buf) { let c = 0xffffffff; for (const byte of buf) { c ^= byte; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const t = Buffer.from(type); const out = Buffer.alloc(12 + data.length); out.writeUInt32BE(data.length,0); t.copy(out,4); data.copy(out,8); out.writeUInt32BE(crc32(Buffer.concat([t,data])),8+data.length); return out; }
const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE); for (let y=0;y<SIZE;y++){ raw[y*(SIZE*4+1)]=0; pixels.copy(raw,y*(SIZE*4+1)+1,y*SIZE*4,(y+1)*SIZE*4); }
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',Buffer.from([0,0,4,0,0,0,4,0,8,6,0,0,0])),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
const out = path.join(process.cwd(),'assets','app-icon.png'); fs.mkdirSync(path.dirname(out),{recursive:true}); fs.writeFileSync(out,png); console.log(`Generated ${out} (${png.length} bytes)`);
