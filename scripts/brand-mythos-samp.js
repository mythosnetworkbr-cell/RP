const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'App.js');
let source = fs.readFileSync(file, 'utf8');

const replacements = [
  [/News\s*RP/gi, 'MYTHØS SAMP'],
  [/NewsRP/gi, 'MYTHØS SAMP'],
  [/MYTHØS\s+ROLEPLAY/gi, 'MYTHØS SAMP'],
  [/MYTHØS\s+RP/gi, 'MYTHØS SAMP'],
  [/MYTHOS\s+ROLEPLAY/gi, 'MYTHØS SAMP'],
  [/MYTHOS\s+RP/gi, 'MYTHØS SAMP'],
  [/ROLEPLAY/gi, 'SAMP'],
  [/\bRP\b/g, 'SAMP'],
  [/#ff202e/gi, '#8a2be2'],
  [/#19ff62/gi, '#c04eff'],
  [/mythos-rp-launcher/gi, 'mythos-samp'],
];

for (const [pattern, replacement] of replacements) {
  source = source.replace(pattern, replacement);
}

fs.writeFileSync(file, source);
console.log('MYTHØS SAMP branding applied to App.js');
