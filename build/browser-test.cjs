// Real-browser validation using the pre-installed Chromium via playwright-core.
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const EXE = '/opt/pw-browsers/chromium';
const FILE = 'file://' + path.resolve(__dirname, '..', 'health-awareness-studio.html');
const SHOT_DIR = path.resolve(__dirname, 'shots');

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

  await page.goto(FILE);
  // wait for app bootstrap
  await page.waitForFunction(() => window.HAS && typeof window.HAS.runAllTests === 'function', { timeout: 15000 });
  // let init's daily-check settle
  await page.waitForTimeout(500);

  // 1) Run the in-app 22-check suite in the REAL browser
  const results = await page.evaluate(async () => await window.HAS.runAllTests());
  const passN = results.filter(r => r.pass).length;

  // 2) Real-metrics poster layout validation for long EN + GU + movable + studio topics
  const layoutReport = await page.evaluate(() => {
    const pick = id => (typeof CAL !== 'undefined' ? CAL.find(r => r.topicId === id) : null);
    const samples = [
      pick('safe-motherhood-parkinsons-day'),   // long combined title
      pick('world-hearing-wildlife-day'),
      pick('older-persons-blood-donation-day'), // very long GU title
      pick('balanced-diet'),                    // studio
      (typeof todayEntry === 'function' ? todayEntry() : null)
    ].filter(Boolean);
    const out = [];
    samples.forEach(e => {
      LANGS.forEach(lang => FORMATS.forEach(fmt => {
        const pr = createPoster(e, fmt, lang);
        out.push({ date: e.date, topic: e.topicId, lang, format: fmt.id, ok: pr.validation.ok, errors: pr.validation.errors });
      }));
    });
    return { total: out.length, failures: out.filter(o => !o.ok) };
  });

  // 3) Save a few real poster PNGs to inspect for clipping
  const shots = await page.evaluate(() => {
    const pick = id => CAL.find(r => r.topicId === id);
    const list = [
      { e: pick('older-persons-blood-donation-day'), lang: 'gu', fmt: FORMATS[2] }, // long GU story
      { e: pick('safe-motherhood-parkinsons-day'), lang: 'en', fmt: FORMATS[0] },   // long EN square
      { e: pick('world-kidney-day'), lang: 'gu', fmt: FORMATS[1] }                  // movable GU feed
    ];
    return list.map(x => ({ name: x.e.topicId + '_' + x.lang + '_' + x.fmt.id, url: createPoster(x.e, x.fmt, x.lang).canvas.toDataURL('image/png') }));
  });
  shots.forEach(s => { const b64 = s.url.split(',')[1]; fs.writeFileSync(path.join(SHOT_DIR, s.name + '.png'), Buffer.from(b64, 'base64')); });

  // 4) Navigate the pages to ensure no runtime errors in real DOM
  const pages = ['home','calendar','generator','library','publishing','scheduler','diagnostics','tests','settings'];
  for (const p of pages) { await page.evaluate(pg => window.HAS.navigate(pg), p); await page.waitForTimeout(80); }

  await browser.close();

  console.log('===== REAL-BROWSER 22-CHECK SUITE =====');
  results.forEach((r, i) => console.log((r.pass ? '  ✓ ' : '  ✗ ') + (i + 1) + '. ' + r.name + (r.pass ? '' : '  [' + r.detail + (r.where ? ' @' + r.where : '') + ']')));
  console.log(`\n${passN}/${results.length} checks passed (real browser)`);
  console.log('\n===== REAL-METRICS LAYOUT =====');
  console.log(`Posters validated: ${layoutReport.total}, layout failures: ${layoutReport.failures.length}`);
  layoutReport.failures.slice(0, 10).forEach(f => console.log('  ✗', f.date, f.topic, f.lang, f.format, JSON.stringify(f.errors)));
  console.log('\nSaved poster screenshots:', shots.map(s => s.name).join(', '));
  console.log('Console/page errors:', consoleErrors.length ? consoleErrors.slice(0,8) : 'none');

  const ok = passN === results.length && layoutReport.failures.length === 0 && consoleErrors.length === 0;
  console.log('\nRESULT:', ok ? 'ALL PASS' : 'ISSUES FOUND');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error('DRIVER ERROR:', e); process.exit(2); });
