// Exhaustive real-browser layout audit: every day × every format × every language.
const { chromium } = require('playwright-core');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '..', 'health-awareness-studio.html');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(FILE);
  await page.waitForFunction(() => typeof createPoster === 'function' && typeof buildCalendar === 'function' && typeof CAL !== 'undefined' && CAL != null && CAL.length > 0, { timeout: 15000 });
  const report = await page.evaluate(() => {
    const years = [2026, 2027, 2028];
    const fails = []; let count = 0; const topics = new Set();
    for (const y of years) {
      const cal = buildCalendar(y);
      for (const entry of cal) {
        topics.add(entry.topicId);
        for (const lang of LANGS) for (const fmt of FORMATS) {
          count++;
          const pr = createPoster(entry, fmt, lang);
          if (!pr.validation.ok) fails.push({ year: y, date: entry.date, topic: entry.topicId, lang, format: fmt.id, errors: pr.validation.errors });
        }
      }
    }
    return { count, fails, years, topicsCovered: topics.size };
  });
  await browser.close();
  console.log(`Validated ${report.count} posters across years ${report.years.join(', ')} — ${report.topicsCovered} distinct topics exercised`);
  console.log('Layout failures:', report.fails.length);
  report.fails.slice(0, 30).forEach(f => console.log('  ✗', f.year, f.date, f.topic, f.lang, f.format, JSON.stringify(f.errors)));
  console.log('Page errors:', errs.length ? errs.slice(0,5) : 'none');
  console.log('RESULT:', (report.fails.length === 0 && errs.length === 0) ? 'ALL POSTERS FIT' : 'OVERFLOW FOUND');
  process.exit((report.fails.length === 0 && errs.length === 0) ? 0 : 1);
})().catch(e => { console.error('DRIVER ERROR:', e); process.exit(2); });
