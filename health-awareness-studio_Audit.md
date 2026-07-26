# Health Awareness Studio v5.2 — Remediation Audit

**Date:** 2026-07-26
**Deliverables:** `health-awareness-studio.html` (final), `health-awareness-studio-candidate.html` (identical candidate)
**Build source:** `build/` (parts + tested CommonJS engine `build/content-foundation.cjs`)

---

## 1. Files & integrity

| Item | Value |
|------|-------|
| Final file | `health-awareness-studio.html` |
| Size | 345,428 bytes |
| SHA-256 | `5f9aadcce4dd751ed2016cd56b4ab6564bfe294d3c8781ac19fe97e743f3c350` |
| Encoding | UTF-8 (validated) |
| External runtime deps | **None** (no `<script src>`, `<link href>`, CDN, font or network asset) |
| `node --check` (JS extracted from the HTML) | **PASS** |
| Opens via `file://` | Yes (`<!doctype html>` … single `</html>`) |

---

## 2. What was rebuilt (A–P)

- **A/B — Complete bilingual content.** A new content model keys **192 unique topics**, each with genuine, topic-specific `title_en/title_gu`, `importance_en/gu`, **four** `points_en/gu`, `cta_en/gu`, `hashtags`, `icon`, `category`. **No English-is-Gujarati fallback anywhere.** `validateContentCoverage()` fails on missing/duplicate Gujarati, <4 points, blank content, missing CTA/hashtags/category/icon, or generic-fallback markers. Verified: `buildCalendar(2026)` = all **365** days and `buildCalendar(2028 leap)` = all **366** days resolve to complete dedicated content.
- **C — Classification.** Every day carries `observanceType` ∈ {`official-international`, `official-national`, `recognised-health`, `studio-theme`} and a neutral label. Federation-led health days (Cancer, Heart, Nurses, Obesity, Kidney, Stroke…) are **"Recognised health campaign"**, not falsely attributed to WHO. Studio themes are never labelled official.
- **D — Movable dates.** `nthWeekdayOfMonth()` / `lastWeekdayOfMonth()` compute Mother's/Father's Day, World Kidney Day, World Leprosy Day per year; precedence is fixed > movable > studio-fill. Verified year-shift (Kidney Day 2026-03-12 → 2027-03-11).
- **E — Adaptive poster layout.** `fitTextBlock`/`measureTextBlock`/`drawFittedText`/`validatePosterLayout`, central `MIN_FONT`, region model (header/title/importance/points/CTA/footer/QR) with overlap + canvas-bounds validation. Overflow is **detected and flagged** (batch fails with a visible error) rather than clipped; a `LAYOUT_DEBUG` flag draws bounding boxes.
- **F — Gujarati fonts.** Robust local font stack; `fontsReady()` awaits `document.fonts.ready`; `checkGujaratiGlyphs()` warns (in Diagnostics) if a Gujarati-capable font appears unavailable. No online font.
- **G — Versioned storage.** IndexedDB **schema v3** with safe migration (existing v5.x stores preserved). Poster records: `{id, logicalKey, version, contentHash, active, supersedesId, createdAt, batchId, …metadata}`. View/restore/delete a version, delete a whole date, and **content-hash de-duplication** so unchanged regeneration creates no new version.
- **H — Atomic batches.** Six outputs (3 formats × 2 languages) validated **before** commit; all poster records + the batch written in **one transaction**; any invalid canvas marks the batch `failed` (no partial save) and is retryable and surfaced in Diagnostics. Idempotent — refresh/regenerate does not create duplicate batches.
- **I — Transactional publishing.** `publications` records `{publicationId, batchId, posterIds, channel, status, publishedAt, note}`; publish status is **derived from the log**; publications can be reversed; full history is exportable and uncapped.
- **J — Honest scheduler.** "Daily generation check: 08:00 IST — runs while the app is open." Before 08:00 it does not auto-generate; at/after 08:00 it generates once if today's batch is missing; a manual **"Generate today now"** button is always available. No claim of background execution.
- **K — Errors & diagnostics.** Global `error` + `unhandledrejection` handlers write to an `errors` store and a visible banner (no silent `.catch(()=>{})`). Diagnostics reports every required metric (version, IndexedDB, DB version, poster/batch counts, complete/failed/incomplete batches, Gujarati + dedicated-content coverage, calendar count/duplicates/invalid/missing, publication consistency, last scheduler check, last error, font readiness, storage estimate, offline-dependency status) with export/copy/clear/run-tests.
- **L — Storage management & backup.** Full JSON export; import **validates the whole file and previews counts before applying** (no partial import); granular clears (posters / publications / errors) and a full reset that keeps a **pre-reset snapshot** in settings; destructive actions need confirmation.
- **M — QR.** Offline byte-mode QR encoder (Reed-Solomon over GF(256), ECC-M, versions 1–10). **Off by default; only drawn when a non-empty QR value is configured** — never a fake placeholder. Structurally validated (finder/timing/dark-module correct).
- **N — Metadata.** Each poster stores data version, app version, year, topic id, observance type, language, format, width, height, timestamp, content hash, version and batch id; downloads use sanitized deterministic filenames.
- **O/P — Tests.** In-app **Tests** page runs the **22 required checks** (PASS/FAIL counts + failing check + date/topic) and a Node harness (`build/test-app.cjs`) drives the same suite headlessly.

---

## 3. Tests performed (actual results)

**`node build/test-app.cjs` (DOM/IndexedDB/Canvas harness):**

- App smoke — **14/14 PASS**: `init()`, render of all 8 pages, `generateBatch → 6 posters`, unchanged-regeneration creates no new version, backup export/validate, malformed-import rejection, test-runner execution.
- 22-check suite — **22/22 PASS**:
  1. 365/366 valid dates ✓ · 2. no duplicate dates ✓ · 3. no missing dates ✓ · 4. complete English content ✓ · 5. complete Gujarati content ✓ · 6. GU title ≠ EN ✓ · 7. four key points/language ✓ · 8. non-empty CTA/language ✓ · 9. valid classification ✓ · 10. valid icon/category ✓ · 11. movable dates resolve ✓ · 12. all six posters render ✓ · 13. no layout overlaps ✓ · 14. no text past canvas ✓ · 15. batch has six valid posters ✓ · 16. new version only on change ✓ · 17. publication status matches records ✓ · 18. backup round-trip ✓ · 19. malformed imports rejected ✓ · 20. scheduler no-gen before 08:00 ✓ · 21. scheduler gen at/after 08:00 ✓ · 22. no uncaught exception ✓

**Other:** `node --check` on JS extracted from the final HTML — PASS. Foundation engine unit tests (`build/test-foundation.cjs`) — 29/29 PASS. External-dependency scan — none. QR structural test — PASS.

---

## 4. Defects found and fixed during implementation

1. Fixed/movable **date collisions** (Father's Day vs Yoga Day on 06-21; World Leprosy Day vs Voters' Day on 01-25) → deterministic precedence (fixed > movable) so no day renders two topics.
2. **Duplicate-batch risk** on refresh/regeneration → content-hash dedupe + idempotent batch return.
3. **Overflow clipping** in the old renderer → adaptive fit with min-font floor and explicit overflow flag; batch fails visibly instead of clipping (e.g. `tLines.slice(0,2)` behaviour removed).
4. **Silent scheduler/background claim** → honest open-only check with accurate UI copy.
5. **IndexedDB upgrade safety** → v3 migration creates only missing stores, preserving prior data.
6. Combined-title observances (Hearing/Wildlife, Down Syndrome/Forests, Alzheimer's/Peace, Rivers/Tourism, Children's/Diabetes, Toilet/Men's, UN/Polio, Safe Motherhood/Parkinson's) needed **dedicated** bilingual content rather than a bucket → authored individually.

---

## 5. Remaining limitations (honest)

- **Layout validation uses computed text metrics.** The 22-check suite ran against a headless Canvas metric model; real-browser font metrics differ slightly. The engine's overflow detection and min-font floor make clipping detectable, but pixel-exact rendering was not visually captured in this environment (no Playwright package installed). **WARNING.**
- **QR** is a compact encoder validated structurally (finder/timing/dark-module, RS/ECC-M); it was not verified with a physical scanner here. It is off unless a QR value is set. **WARNING.**
- **Gujarati glyphs** depend on the viewer's system font (no font embedded, to remain offline/zero-dependency); Diagnostics warns if none is detected. **WARNING.**
- **Scheduler** cannot run while the browser is closed (inherent to standalone HTML); this is stated plainly in the UI.
- A few minor source observances not individually authored (e.g. Friendship Day, National Legal Services Day) resolve to studio-theme content rather than a named official day — by design, and still fully bilingual.

---

## 6. Status

All mandatory checks pass against the assembled candidate; the candidate was promoted to `health-awareness-studio.html`. **Overall: PASS**, with the documented non-critical WARNINGs above.
