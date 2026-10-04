/* Render code-native brand artwork. Existing website illustrations are read-only inputs. */
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

async function main() {
  const icon = await fs.readFile(path.join(dist, 'favicon.svg'));
  for (const [size, name] of [[96,'favicon-96x96.png'],[180,'apple-touch-icon.png'],[192,'icon-192.png'],[512,'icon-512.png']]) {
    await sharp(icon).resize(size, size).png().toFile(path.join(dist, name));
  }
  // PNG image entries inside ICO preserve sharp alpha edges at each actual favicon size.
  const sizes = [16, 32, 48];
  const frames = await Promise.all(sizes.map(size => sharp(icon).resize(size, size).png().toBuffer()));
  const header = Buffer.alloc(6 + 16 * frames.length);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach((frame, i) => {
    const at = 6 + 16 * i;
    header[at] = sizes[i]; header[at+1] = sizes[i];
    header.writeUInt16LE(1, at+4); header.writeUInt16LE(32, at+6);
    header.writeUInt32LE(frame.length, at+8); header.writeUInt32LE(offset, at+12);
    offset += frame.length;
  });
  await fs.writeFile(path.join(dist, 'favicon.ico'), Buffer.concat([header, ...frames]));
  const cards = [
    {slug:'maxbob', image:'developer-workshop-v1.webp', kicker:'SENIOR AI & AUTOMATION ENGINEER', title:['Maksym','Babenko.'], copy:['AI agents. Browser automation.','Antifraud engineering. Python.'], foot:'8+ years building software', font:72},
    {slug:'octo-mcp', image:'projects/octo-mcp-v1.webp', kicker:'ENGINEERING CASE STUDY', title:['octo-mcp'], copy:['Give AI agents a browser','they can work with.'], foot:'Python · MCP · Playwright · CDP', font:70},
    {slug:'alpha-scout', image:'projects/alpha-scout-v1.webp', kicker:'ENGINEERING CASE STUDY', title:['alpha-scout'], copy:['From source collection','to LLM analysis and alerts.'], foot:'Python · LLM · FastAPI · Telegram', font:64},
    {slug:'browser-fingerprinting', image:'projects/nodriver-antidetect-v1.webp', kicker:'ENGINEERING CASE STUDY', title:['Browser','fingerprinting.'], copy:['Configure the environment.','Inspect the signals.'], foot:'Python · CDP · Browser diagnostics', font:53},
  ];
  const out = path.join(dist, 'assets/social');
  await fs.mkdir(out, {recursive:true});
  for (const c of cards) {
    const art = (await sharp(path.join(dist, 'assets', c.image)).png().toBuffer()).toString('base64');
    const mark = icon.toString('base64');
    const titleY = c.title.length > 1 ? 255 : 293;
    const title = c.title.map((s,i) => `<tspan x="56" y="${titleY+i*80}">${esc(s)}</tspan>`).join('');
    const copy = c.copy.map((s,i) => `<tspan x="58" y="${402+i*33}">${esc(s)}</tspan>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><clipPath id="art"><rect x="668" y="30" width="502" height="570" rx="24"/></clipPath></defs>
<rect width="1200" height="630" fill="#f5f0e4"/><rect x="14" y="14" width="1172" height="602" rx="30" fill="none" stroke="#d8d7c6"/>
<image href="data:image/png;base64,${art}" x="668" y="30" width="502" height="570" preserveAspectRatio="xMaxYMid slice" clip-path="url(#art)"/>
<image href="data:image/svg+xml;base64,${mark}" x="56" y="52" width="55" height="55"/>
<text x="126" y="91" font-family="Georgia,serif" font-size="35" fill="#304934">maxbob<tspan fill="#ac6750">.</tspan></text>
<text x="58" y="171" font-family="Helvetica,Arial,sans-serif" font-size="14" letter-spacing="1.9" fill="#607056">${esc(c.kicker)}</text>
<text font-family="Georgia,serif" font-size="${c.font}" letter-spacing="-2" fill="#2f3e30">${title}</text>
<text font-family="Helvetica,Arial,sans-serif" font-size="23" fill="#58634f">${copy}</text>
<path d="M58 489H602" stroke="#cdd5c3"/><text x="58" y="521" font-family="Helvetica,Arial,sans-serif" font-size="16" fill="#6a775e">${esc(c.foot)}</text>
<text x="58" y="570" font-family="Helvetica,Arial,sans-serif" font-size="19" font-weight="600" fill="#945f47">cv.maxbob.xyz</text>
${c.slug === 'maxbob' ? '' : '<text x="602" y="570" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="16" fill="#596b50">Maksym Babenko</text>'}
</svg>`;
    await sharp(Buffer.from(svg)).jpeg({quality:92, chromaSubsampling:'4:4:4'}).toFile(path.join(out, c.slug+'-v1.jpg'));
  }
  console.log('Built favicon SVG/ICO/PNG family and four 1200×630 social cards.');
}
main().catch(error => {console.error(error); process.exitCode = 1;});
