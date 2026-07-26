const F = require('./content-foundation.cjs');
let pass = 0, fail = 0;
const eq = (name, got, want) => { if (String(got) === String(want)) { pass++; } else { fail++; console.log(`  ✗ ${name}: got ${got}, want ${want}`); } };

// Movable-date engine — verify against known real dates.
// 2026: Mother's Day (2nd Sun May) = May 10; Father's Day (3rd Sun Jun) = Jun 21
eq("Mother's Day 2026", F.nthWeekdayOfMonth(2026,5,0,2), '2026-05-10');
eq("Father's Day 2026", F.nthWeekdayOfMonth(2026,6,0,3), '2026-06-21');
// World Kidney Day (2nd Thu Mar) 2026 = Mar 12
eq("World Kidney Day 2026", F.nthWeekdayOfMonth(2026,3,4,2), '2026-03-12');
// World Leprosy Day (last Sun Jan) 2026 = Jan 25
eq("World Leprosy Day 2026", F.lastWeekdayOfMonth(2026,1,0), '2026-01-25');
// Year sensitivity: Mother's Day 2027 (2nd Sun May) = May 9
eq("Mother's Day 2027", F.nthWeekdayOfMonth(2027,5,0,2), '2027-05-09');
// Father's Day 2025 (3rd Sun Jun) = Jun 15
eq("Father's Day 2025", F.nthWeekdayOfMonth(2025,6,0,3), '2025-06-15');
// last weekday guard: last Friday Feb 2026 = Feb 27
eq("Last Fri Feb 2026", F.lastWeekdayOfMonth(2026,2,5), '2026-02-27');
// nth overflow returns null: 5th Monday of Feb 2026 (none)
eq("5th Mon Feb 2026 (none)", F.nthWeekdayOfMonth(2026,2,1,5), 'null');

// resolveMovable for 2026
const mv = F.resolveMovable(2026);
eq("resolveMovable count", Object.keys(mv).length, 4);
eq("resolveMovable has May 10", !!mv['2026-05-10'], 'true');

// Content coverage: validate EVERY authored topic (studio + official health).
const allIds = Object.keys(F.TOPIC_CONTENT);
const cal = allIds.map((id, i) => ({ date: '2026-01-' + String((i%28)+1).padStart(2,'0'), topicId: id, content: F.TOPIC_CONTENT[id] }));
const failures = F.validateContentCoverage(cal);
if (failures.length === 0) { pass++; console.log(`  ✓ ${allIds.length} authored topics: full content coverage`); }
else { fail++; console.log('  ✗ topic coverage failures:', failures.length); failures.slice(0,15).forEach(f => console.log('     -', f.date, f.topic, '::', f.reason)); }
// Report authored count split
console.log(`  · studio themes: ${F.STUDIO_THEME_IDS.length}, total authored: ${allIds.length}`);

// Negative test: a broken content object must fail validation.
const bad = [{ date:'2026-06-01', topicId:'x', content:{ title_en:'X', title_gu:'X', importance_en:'a', importance_gu:'b', points_en:['1','2','3'], points_gu:['1','2','3','4'], cta_en:'', cta_gu:'y', hashtags:[], category:'C', icon:'' } }];
const bf = F.validateContentCoverage(bad);
const hasTitleDup = bf.some(f=>/identical to English/.test(f.reason));
const hasPointCount = bf.some(f=>/4 non-empty English/.test(f.reason));
const hasCTA = bf.some(f=>/missing English CTA/.test(f.reason));
const hasHash = bf.some(f=>/missing hashtags/.test(f.reason));
const hasIcon = bf.some(f=>/missing icon/.test(f.reason));
eq("negative: detects title dup", hasTitleDup, 'true');
eq("negative: detects <4 points", hasPointCount, 'true');
eq("negative: detects missing CTA", hasCTA, 'true');
eq("negative: detects missing hashtags", hasHash, 'true');
eq("negative: detects missing icon", hasIcon, 'true');

// ---- Full-year calendar coverage (the real test: every day has dedicated content) ----
for (const [year, expected] of [[2026, 365], [2028, 366]]) {
  const yc = F.buildCalendar(year);
  eq(`buildCalendar(${year}) day count`, yc.length, expected);
  // unique dates
  const ds = new Set(yc.map(r => r.date));
  eq(`buildCalendar(${year}) unique dates`, ds.size, expected);
  // every day classified
  const unclassified = yc.filter(r => !r.observanceType || !r.observanceLabel).length;
  eq(`buildCalendar(${year}) all classified`, unclassified, 0);
  // FULL content coverage for every single day
  const cf = F.validateContentCoverage(yc);
  if (cf.length === 0) { pass++; console.log(`  ✓ buildCalendar(${year}): all ${expected} days have complete dedicated content`); }
  else {
    fail++; console.log(`  ✗ buildCalendar(${year}) coverage failures:`, cf.length);
    cf.slice(0, 20).forEach(f => console.log('     -', f.date, f.topic, '::', f.reason));
  }
  // classification breakdown
  const byType = {};
  yc.forEach(r => { byType[r.observanceType] = (byType[r.observanceType]||0)+1; });
  console.log(`     ${year} breakdown:`, JSON.stringify(byType));
}

// Movable correctness inside built calendars
const c26 = F.buildCalendar(2026);
eq('2026 has movable Kidney Day on 03-12', !!c26.find(r=>r.date==='2026-03-12' && r.topicId==='world-kidney-day'), 'true');
eq('2026 has Mother\'s Day on 05-10', !!c26.find(r=>r.date==='2026-05-10' && r.topicId==='mothers-day'), 'true');
const c27 = F.buildCalendar(2027);
eq('2027 Kidney Day moves to 03-11', !!c27.find(r=>r.date==='2027-03-11' && r.topicId==='world-kidney-day'), 'true');

// Studio-theme days must NOT be labelled as official observances
const studioDays = c26.filter(r=>r.observanceType==='studio-theme');
eq('studio days exist', studioDays.length>0, 'true');
eq('no studio day claims official label', studioDays.every(r=>r.observanceLabel==='Daily studio awareness theme'), 'true');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
