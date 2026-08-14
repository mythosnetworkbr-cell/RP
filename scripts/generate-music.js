const fs = require('fs');
const path = require('path');
const sampleRate = 11025;
const duration = 8;
const frames = sampleRate * duration;
const data = Buffer.alloc(frames * 2);
function noise(seed) { const x = Math.sin(seed * 12.9898) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; }
for (let i=0;i<frames;i++) { const t=i/sampleRate, beat=.6, beatIndex=Math.floor(t/beat), phase=t%beat; let s=0;
  if (phase<.16) { const f=105-65*(phase/.16); s+=.62*Math.sin(2*Math.PI*f*phase)*Math.exp(-22*phase); }
  if ((beatIndex%4===1||beatIndex%4===3)&&phase<.11) s+=.20*noise(i+19)*Math.exp(-34*phase);
  const hp=t%.3; if(hp<.035) s+=.075*noise(i+101)*Math.exp(-85*hp);
  const bass=[55,55,65.41,73.42,55,49,65.41,73.42][beatIndex%8]; s+=.18*Math.sin(2*Math.PI*bass*t)*Math.exp(-.9*phase);
  const chord=[220,261.63,293.66,329.63][Math.floor(beatIndex/2)%4]; s+=.035*Math.sin(2*Math.PI*chord*t);
  const sync=(t+.15)%1.2; if(sync>.72&&sync<.86) s+=.045*Math.sin(2*Math.PI*330*t)*(1-Math.abs(sync-.79)/.07);
  data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,s))*30000),i*2);
}
const header=Buffer.alloc(44); header.write('RIFF',0); header.writeUInt32LE(36+data.length,4); header.write('WAVE',8); header.write('fmt ',12); header.writeUInt32LE(16,16); header.writeUInt16LE(1,20); header.writeUInt16LE(1,22); header.writeUInt32LE(sampleRate,24); header.writeUInt32LE(sampleRate*2,28); header.writeUInt16LE(2,32); header.writeUInt16LE(16,34); header.write('data',36); header.writeUInt32LE(data.length,40);
const out=path.join(process.cwd(),'assets','mythos-beat.wav'); fs.mkdirSync(path.dirname(out),{recursive:true}); fs.writeFileSync(out,Buffer.concat([header,data])); console.log(`Generated ${out} (${44+data.length} bytes)`);
