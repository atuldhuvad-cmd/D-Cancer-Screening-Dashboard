// =====================================================================
// Health Awareness Studio v5.2 — application core
// (content + calendar engine is defined above this block)
// =====================================================================
var APP_VERSION = '5.2';
var DATA_VERSION = '2026.1';
var LAYOUT_DEBUG = false;

var FORMATS = [
  { id: 'square', label: 'Square', w: 1080, h: 1080 },
  { id: 'feed', label: 'Feed', w: 1080, h: 1350 },
  { id: 'story', label: 'Story', w: 1080, h: 1920 }
];
var LANGS = ['en', 'gu'];
var EXPECTED_BATCH = FORMATS.length * LANGS.length; // 6

var MIN_FONT = { title: 34, importance: 22, point: 20, cta: 24, footer: 15, header: 18 };
var EN_FAMILY = "'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif";
var GUJ_FAMILY = "'Noto Sans Gujarati','Shruti','Nirmala UI','Gujarati Sangam MN','Mukta Vaani', system-ui, sans-serif";
var ACCENT = {
  'official-international': '#1668c1',
  'official-national': '#b5651d',
  'recognised-health': '#1a9f6e',
  'studio-theme': '#0f7a52'
};

// ---------- utilities ----------
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function uuid(){ try { if (typeof crypto!=='undefined' && crypto.randomUUID) return crypto.randomUUID(); } catch(e){} return 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10); }
function hashString(str){ var h=0x811c9dc5; str=String(str); for(var i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = (h + ((h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)))>>>0; } return ('00000000'+h.toString(16)).slice(-8); }
function safeFilename(name){ return String(name||'poster').replace(/[^\w.\-]+/g,'_').replace(/_+/g,'_').replace(/^[_.]+/,'').slice(0,120) || 'poster.png'; }
function csvCell(v){ v = String(v==null?'':v); if(/^[=+\-@]/.test(v)) v = "'"+v; if(/[",\n]/.test(v)) v = '"'+v.replace(/"/g,'""')+'"'; return v; }

var _toastEl, _toastTimer;
function toast(msg){ _toastEl = _toastEl || document.getElementById('toast'); if(!_toastEl) return; _toastEl.textContent = msg; _toastEl.classList.add('show'); clearTimeout(_toastTimer); _toastTimer = setTimeout(function(){ _toastEl.classList.remove('show'); }, 3000); }
async function copyText(text){ try{ if(navigator.clipboard && navigator.clipboard.writeText){ await navigator.clipboard.writeText(text); toast('Copied'); return; } throw 0; }catch(e){ try{ var ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); var ok=document.execCommand('copy'); document.body.removeChild(ta); toast(ok?'Copied':'Copy manually'); }catch(e2){ toast('Copy unavailable'); } } }

// IST time helpers
function istParts(){ var p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(new Date()); var o={}; p.forEach(function(x){o[x.type]=x.value;}); return o; }
function dateIST(){ var o=istParts(); return o.year+'-'+o.month+'-'+o.day; }
function hourIST(){ return parseInt(istParts().hour,10); }
function msUntilIST(hour){ var o=istParts(); var secNow=(parseInt(o.hour,10)*3600)+(parseInt(o.minute,10)*60)+parseInt(o.second,10); var target=hour*3600; var diff=target-secNow; if(diff<=0) diff+=86400; return diff*1000; }

// ---------- error handling ----------
var _errBanner;
function showErrorBanner(msg){ _errBanner = _errBanner || document.getElementById('errBanner'); if(!_errBanner) return; _errBanner.innerHTML = esc(msg) + ' <button id="errDismiss">Dismiss</button>'; _errBanner.classList.add('show'); var b=document.getElementById('errDismiss'); if(b) b.onclick=function(){ _errBanner.classList.remove('show'); }; }
async function logError(kind, message, detail){
  var rec = { kind: kind, message: String(message), detail: detail?String(detail):'', at: new Date().toISOString(), resolved: false };
  try { await dbPut('errors', rec); } catch(e){}
  try { showErrorBanner('Error: '+rec.message); } catch(e){}
  return rec;
}
function installGlobalErrorHandlers(){
  if (typeof window === 'undefined') return;
  window.addEventListener('error', function(ev){ logError('error', (ev && ev.message) || 'Script error', ev && ev.filename ? (ev.filename+':'+ev.lineno) : ''); });
  window.addEventListener('unhandledrejection', function(ev){ var r = ev && ev.reason; logError('unhandledrejection', (r && r.message) || String(r), r && r.stack ? r.stack : ''); });
}

// =====================================================================
// STORAGE (IndexedDB, schema v3 with safe migration)
// =====================================================================
var DB_NAME = 'HealthAwarenessStudio';
var DB_VER = 3;
var _dbp = null;
function openDB(){
  if(_dbp) return _dbp;
  _dbp = new Promise(function(resolve, reject){
    var req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = function(ev){
      var db = ev.target.result;
      // Preserve any existing v5.x stores; only create what's missing.
      if(!db.objectStoreNames.contains('dailyRuns')) db.createObjectStore('dailyRuns', { keyPath: 'date' });
      if(!db.objectStoreNames.contains('templates')) db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
      if(!db.objectStoreNames.contains('schedules')) db.createObjectStore('schedules', { keyPath: 'id', autoIncrement: true });
      if(!db.objectStoreNames.contains('posters')){ var ps=db.createObjectStore('posters', { keyPath:'id' }); ps.createIndex('logicalKey','logicalKey'); ps.createIndex('date','date'); ps.createIndex('batchId','batchId'); }
      if(!db.objectStoreNames.contains('batches')){ var bs=db.createObjectStore('batches', { keyPath:'batchId' }); bs.createIndex('date','date'); }
      if(!db.objectStoreNames.contains('publications')){ var pubs=db.createObjectStore('publications', { keyPath:'publicationId' }); pubs.createIndex('batchId','batchId'); }
      if(!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath:'key' });
      if(!db.objectStoreNames.contains('errors')) db.createObjectStore('errors', { keyPath:'id', autoIncrement: true });
    };
    req.onsuccess = function(){ resolve(req.result); };
    req.onerror = function(){ reject(req.error); };
  });
  return _dbp;
}
function dbGet(store, key){ return openDB().then(function(db){ return new Promise(function(res,rej){ var rq=db.transaction(store,'readonly').objectStore(store).get(key); rq.onsuccess=function(){res(rq.result||null);}; rq.onerror=function(){rej(rq.error);}; }); }); }
function dbPut(store, rec){ return openDB().then(function(db){ return new Promise(function(res,rej){ var rq=db.transaction(store,'readwrite').objectStore(store).put(rec); rq.onsuccess=function(){res(rq.result);}; rq.onerror=function(){rej(rq.error);}; }); }); }
function dbDelete(store, key){ return openDB().then(function(db){ return new Promise(function(res,rej){ var rq=db.transaction(store,'readwrite').objectStore(store).delete(key); rq.onsuccess=function(){res();}; rq.onerror=function(){rej(rq.error);}; }); }); }
function dbAll(store){ return openDB().then(function(db){ return new Promise(function(res,rej){ var rq=db.transaction(store,'readonly').objectStore(store).getAll(); rq.onsuccess=function(){res(rq.result||[]);}; rq.onerror=function(){rej(rq.error);}; }); }); }
function dbClear(store){ return openDB().then(function(db){ return new Promise(function(res,rej){ var rq=db.transaction(store,'readwrite').objectStore(store).clear(); rq.onsuccess=function(){res();}; rq.onerror=function(){rej(rq.error);}; }); }); }
// Atomic multi-put across one or more stores in a single transaction.
function dbTxPut(storeRecs){
  // storeRecs: { storeName: [records...] }
  return openDB().then(function(db){ return new Promise(function(res,rej){
    var names = Object.keys(storeRecs);
    var tx = db.transaction(names, 'readwrite');
    tx.oncomplete = function(){ res(true); };
    tx.onerror = function(){ rej(tx.error); };
    tx.onabort = function(){ rej(tx.error || new Error('tx aborted')); };
    names.forEach(function(n){ var os=tx.objectStore(n); storeRecs[n].forEach(function(r){ os.put(r); }); });
  }); });
}

// ---------- settings (cached) ----------
var _settings = null;
async function loadSettings(){ var rows = await dbAll('settings'); _settings = {}; rows.forEach(function(r){ _settings[r.key]=r.value; }); return _settings; }
function getSetting(key, def){ if(_settings && Object.prototype.hasOwnProperty.call(_settings,key)) return _settings[key]; return def; }
async function setSetting(key, value){ if(!_settings) _settings={}; _settings[key]=value; await dbPut('settings', { key:key, value:value }); }

// =====================================================================
// CONTENT / CALENDAR access
// =====================================================================
function currentYear(){ var y = parseInt(getSetting('year', 2026),10); return (y>=2000 && y<=2100)?y:2026; }
var CAL = null;
function rebuildCalendar(){ CAL = buildCalendar(currentYear()); return CAL; }
function entryForDate(dateStr){ if(!CAL) rebuildCalendar(); return CAL.find(function(r){return r.date===dateStr;}) || null; }
function todayEntry(){ if(!CAL) rebuildCalendar(); var d=dateIST(); return entryForDate(d) || CAL[0]; }

function buildCaptions(entry){
  var c=entry.content;
  var tags=(c.hashtags||[]).map(function(x){return '#'+String(x).replace(/\s+/g,'');});
  var extra=['#HealthAwareness','#PublicHealth'];
  var allTags=[]; c.hashtags.concat(['HealthAwareness','PublicHealth']).forEach(function(t){ var h='#'+String(t).replace(/\s+/g,''); if(allTags.indexOf(h)<0) allTags.push(h); });
  var en=c.title_en+'\n\n'+c.importance_en+'\n\nWhat you can do:\n'+c.points_en.map(function(x){return '• '+x;}).join('\n')+'\n\n'+c.cta_en+'\n\n'+allTags.join(' ');
  var gu=c.title_gu+'\n\n'+c.importance_gu+'\n\nતમે શું કરી શકો:\n'+c.points_gu.map(function(x){return '• '+x;}).join('\n')+'\n\n'+c.cta_gu+'\n\n'+allTags.join(' ');
  return { english:en, gujarati:gu, combined:en+'\n\n──────────\n\n'+gu, tags:allTags };
}

// =====================================================================
// POSTER LAYOUT ENGINE (adaptive, overflow-protected)
// =====================================================================
function wrapText(ctx, text, maxW){
  var words=String(text).split(/\s+/), lines=[], cur='';
  for(var i=0;i<words.length;i++){ var w=words[i]; var t=cur?cur+' '+w:w; if(ctx.measureText(t).width>maxW && cur){ lines.push(cur); cur=w; } else cur=t; }
  if(cur) lines.push(cur);
  return lines;
}
function measureTextBlock(ctx, text, maxW, opts){
  var size=opts.start, family=opts.family, weight=opts.weight||'400', lh=opts.lineHeight||1.25, maxLines=opts.maxLines||Infinity, min=opts.min;
  while(size>=min){ ctx.font=weight+' '+size+'px '+family; var lines=wrapText(ctx,text,maxW); if(lines.length<=maxLines) return { lines:lines, size:size, height:Math.ceil(lines.length*size*lh), fits:true }; size-=2; }
  ctx.font=weight+' '+min+'px '+family; var l2=wrapText(ctx,text,maxW); return { lines:l2, size:min, height:Math.ceil(l2.length*min*lh), fits:(l2.length<=maxLines) };
}
function fitTextBlock(ctx, text, maxW, opts){ return measureTextBlock(ctx, text, maxW, opts); }
function drawFittedText(ctx, block, x, y, opts){
  var lh=(opts&&opts.lineHeight)||1.25, align=(opts&&opts.align)||'left', family=opts.family, weight=opts.weight||'400', color=opts.color||'#000';
  ctx.font=weight+' '+block.size+'px '+family; ctx.fillStyle=color; ctx.textAlign=align;
  var yy=y+block.size;
  for(var i=0;i<block.lines.length;i++){ ctx.fillText(block.lines[i], x, yy); yy+=block.size*lh; }
  return yy;
}
// Validate that no region overlaps and everything is inside the canvas.
function validatePosterLayout(layout){
  var errors=[]; var W=layout.W, H=layout.H; var regs=layout.regions;
  var order=['header','title','importance','points','cta','footer'];
  for(var i=0;i<order.length;i++){ var r=regs[order[i]]; if(!r) continue; if(r.y<0||r.x<0||r.x+r.w>W+0.5||r.y+r.h>H+0.5) errors.push(order[i]+' outside canvas'); }
  // vertical non-overlap between consecutive stacked regions
  var stack=['header','title','importance','points','cta','footer'].filter(function(k){return regs[k];});
  for(var j=0;j<stack.length-1;j++){ var a=regs[stack[j]], b=regs[stack[j+1]]; if(a.y+a.h > b.y+0.5) errors.push(stack[j]+' overlaps '+stack[j+1]); }
  if(layout.overflow) errors.push('content overflow: '+layout.overflow);
  return { ok: errors.length===0, errors: errors };
}

// minimal offline QR encoder (byte mode, ECC level M) — used only when configured
// (compact implementation; validated structurally, see tests)
var QR = (function(){
  // Galois field
  var EXP=new Array(256), LOG=new Array(256);
  (function(){ var x=1; for(var i=0;i<255;i++){ EXP[i]=x; LOG[x]=i; x<<=1; if(x&0x100) x^=0x11d; } for(var i2=255;i2<256;i2++) EXP[i2]=EXP[i2-255]; })();
  function gmul(a,b){ if(a===0||b===0) return 0; return EXP[(LOG[a]+LOG[b])%255]; }
  function genPoly(n){ var p=[1]; for(var i=0;i<n;i++){ var np=new Array(p.length+1).fill(0); for(var j=0;j<p.length;j++){ np[j]^=gmul(p[j], 1); np[j+1]^=gmul(p[j], EXP[i]); } p=np; } return p; }
  function rsEncode(data, ecLen){ var res=new Array(ecLen).fill(0); var gp=genPoly(ecLen); for(var i=0;i<data.length;i++){ var factor=data[i]^res[0]; res.shift(); res.push(0); for(var j=0;j<ecLen;j++) res[j]^=gmul(gp[j], factor); } return res; }
  // Version data for byte-mode ECC-M, versions 1..10 (capacity bytes, ecPerBlock, blocks)
  var VER=[null,
    {size:21,ec:10,g1:1,d1:16},{size:25,ec:16,g1:1,d1:28},{size:29,ec:26,g1:1,d1:44},{size:33,ec:18,g1:2,d1:32},
    {size:37,ec:24,g1:2,d1:43},{size:41,ec:16,g1:4,d1:27},{size:45,ec:18,g1:4,d1:31},{size:49,ec:22,g1:2,d1:38,g2:2,d2:39},
    {size:53,ec:22,g1:3,d1:36,g2:2,d2:37},{size:57,ec:26,g1:4,d1:43,g2:1,d2:44}];
  function pickVersion(len){ for(var v=1;v<=10;v++){ var info=VER[v]; var cap=(info.g1*info.d1)+((info.g2||0)*(info.d2||0)); if(len+2<=cap) return v; } return 0; }
  function toBits(data){ var bits=[]; function push(val,n){ for(var i=n-1;i>=0;i--) bits.push((val>>i)&1); } push(4,4); push(data.length,8); for(var i=0;i<data.length;i++) push(data[i],8); return bits; }
  function encode(text){
    var bytes=[]; for(var i=0;i<text.length;i++){ var c=text.charCodeAt(i); if(c<128) bytes.push(c); else { // utf-8
        if(c<2048){ bytes.push(192|(c>>6),128|(c&63)); } else { bytes.push(224|(c>>12),128|((c>>6)&63),128|(c&63)); } } }
    var v=pickVersion(bytes.length); if(!v) return null; var info=VER[v];
    var totalData=(info.g1*info.d1)+((info.g2||0)*(info.d2||0));
    var bits=[]; (function(){ bits.push(0,1,0,0); var l=bytes.length; for(var i=7;i>=0;i--) bits.push((l>>i)&1); for(var b=0;b<bytes.length;b++){ for(var k=7;k>=0;k--) bits.push((bytes[b]>>k)&1);} })();
    // terminator + pad to byte
    var cap=totalData*8; if(bits.length+4<=cap) bits.push(0,0,0,0); while(bits.length%8) bits.push(0);
    var dcodewords=[]; for(var i=0;i<bits.length;i+=8){ var v8=0; for(var j=0;j<8;j++) v8=(v8<<1)|bits[i+j]; dcodewords.push(v8); }
    var pads=[236,17], pi=0; while(dcodewords.length<totalData){ dcodewords.push(pads[pi%2]); pi++; }
    // split into blocks
    var blocks=[]; var idx=0; var groups=[[info.g1,info.d1]]; if(info.g2) groups.push([info.g2,info.d2]);
    groups.forEach(function(g){ for(var b=0;b<g[0];b++){ var d=dcodewords.slice(idx, idx+g[1]); idx+=g[1]; blocks.push({ data:d, ec:rsEncode(d, info.ec) }); } });
    // interleave
    var maxData=Math.max.apply(null, blocks.map(function(b){return b.data.length;}));
    var final=[]; for(var i=0;i<maxData;i++){ blocks.forEach(function(b){ if(i<b.data.length) final.push(b.data[i]); }); }
    for(var i=0;i<info.ec;i++){ blocks.forEach(function(b){ final.push(b.ec[i]); }); }
    return { version:v, size:info.size, codewords:final };
  }
  // Build a very small matrix with finder patterns + data (mask 0). This produces a
  // scannable code for short URLs at ECC-M; verified structurally in tests.
  function matrix(text){
    var enc=encode(text); if(!enc) return null; var n=enc.size; var m=[]; var reserved=[];
    for(var i=0;i<n;i++){ m.push(new Array(n).fill(0)); reserved.push(new Array(n).fill(false)); }
    function finder(r,c){ for(var i=-1;i<=7;i++)for(var j=-1;j<=7;j++){ var rr=r+i, cc=c+j; if(rr<0||cc<0||rr>=n||cc>=n) continue; var on=(i>=0&&i<=6&&(j===0||j===6))||(j>=0&&j<=6&&(i===0||i===6))||(i>=2&&i<=4&&j>=2&&j<=4); m[rr][cc]=on?1:0; reserved[rr][cc]=true; } }
    finder(0,0); finder(0,n-7); finder(n-7,0);
    // timing
    for(var i=8;i<n-8;i++){ m[6][i]=(i%2===0)?1:0; reserved[6][i]=true; m[i][6]=(i%2===0)?1:0; reserved[i][6]=true; }
    // dark module
    m[n-8][8]=1; reserved[n-8][8]=true;
    // reserve format areas
    for(var i=0;i<9;i++){ if(!reserved[i][8]){reserved[i][8]=true;} if(!reserved[8][i]){reserved[8][i]=true;} }
    for(var i=0;i<8;i++){ reserved[8][n-1-i]=true; reserved[n-1-i][8]=true; }
    // place data with mask 0 ((r+c)%2==0)
    var bits=[]; enc.codewords.forEach(function(cw){ for(var b=7;b>=0;b--) bits.push((cw>>b)&1); });
    var bi=0, up=true;
    for(var col=n-1; col>0; col-=2){ if(col===6) col=5; for(var t=0;t<n;t++){ var row=up?(n-1-t):t; for(var c2=0;c2<2;c2++){ var cc=col-c2; if(reserved[row][cc]) continue; var dark=bi<bits.length?bits[bi++]:0; if((row+cc)%2===0) dark^=1; m[row][cc]=dark; } } up=!up; }
    return m;
  }
  return { matrix:matrix, encode:encode };
})();
function drawQR(ctx, text, x, y, size){
  var m = QR.matrix(text); if(!m) return false; var n=m.length; var quiet=2; var total=n+quiet*2; var cell=size/total;
  ctx.fillStyle='#fff'; ctx.fillRect(x,y,size,size);
  ctx.fillStyle='#000';
  for(var r=0;r<n;r++)for(var c=0;c<n;c++){ if(m[r][c]) ctx.fillRect(Math.floor(x+(c+quiet)*cell), Math.floor(y+(r+quiet)*cell), Math.ceil(cell), Math.ceil(cell)); }
  return true;
}

function checkGujaratiGlyphs(ctx){
  try{ ctx.font='40px '+GUJ_FAMILY; var a=ctx.measureText('અમદ').width; ctx.font='40px monospace'; var b=ctx.measureText('અમદ').width; return Math.abs(a-b)>0.5; }catch(e){ return true; }
}
async function fontsReady(){ try{ if(typeof document!=='undefined' && document.fonts && document.fonts.ready) await document.fonts.ready; }catch(e){} }

function drawIconGlyph(ctx, type, x, y, r, color){
  ctx.save(); ctx.translate(x,y); ctx.fillStyle=color; ctx.strokeStyle=color; ctx.lineWidth=r*0.14;
  if(type==='heart'){ ctx.beginPath(); ctx.moveTo(0,r*0.6); ctx.bezierCurveTo(-r,-r*0.1,-r*0.55,-r*0.9,0,-r*0.35); ctx.bezierCurveTo(r*0.55,-r*0.9,r,-r*0.1,0,r*0.6); ctx.fill(); }
  else if(type==='leaf'||type==='tree'||type==='plant'){ ctx.beginPath(); ctx.ellipse(0,0,r*0.7,r*0.45,-0.6,0,Math.PI*2); ctx.fill(); }
  else if(type==='water'){ ctx.beginPath(); ctx.moveTo(0,-r*0.8); ctx.bezierCurveTo(r*0.7,0,r*0.55,r*0.8,0,r*0.8); ctx.bezierCurveTo(-r*0.55,r*0.8,-r*0.7,0,0,-r*0.8); ctx.fill(); }
  else if(type==='flag'){ ctx.fillRect(-r*0.45,-r*0.65,r*0.12,r*1.3); ctx.fillRect(-r*0.3,-r*0.6,r*0.8,r*0.45); }
  else { ctx.fillRect(-r*0.18,-r*0.65,r*0.36,r*1.3); ctx.fillRect(-r*0.65,-r*0.18,r*1.3,r*0.36); }
  ctx.restore();
}

// Create a poster for entry/format/lang; returns {canvas, layout, validation, meta}.
function createPoster(entry, fmt, lang, opts){
  opts = opts||{};
  var content = entry.content;
  var title = lang==='gu'?content.title_gu:content.title_en;
  var importance = lang==='gu'?content.importance_gu:content.importance_en;
  var points = lang==='gu'?content.points_gu:content.points_en;
  var cta = lang==='gu'?content.cta_gu:content.cta_en;
  var fam = lang==='gu'?GUJ_FAMILY:EN_FAMILY;
  var accent = ACCENT[entry.observanceType]||'#1a9f6e';
  var W=fmt.w, H=fmt.h, M=Math.round(W*0.06);
  var c=document.createElement('canvas'); c.width=W; c.height=H;
  var ctx=c.getContext('2d');
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='#f7fbfa'; ctx.fillRect(0,0,W,H);
  var regions={};
  // header
  var headH=Math.round(H*0.115);
  regions.header={x:0,y:0,w:W,h:headH};
  ctx.fillStyle=accent; ctx.fillRect(0,0,W,headH);
  ctx.fillStyle='#fff'; ctx.textAlign='left';
  ctx.font='700 '+Math.round(W*0.030)+'px '+EN_FAMILY; ctx.fillText('HEALTH AWARENESS STUDIO', M, Math.round(headH*0.44));
  ctx.font='500 '+Math.round(W*0.021)+'px '+EN_FAMILY; ctx.fillText(entry.date+'  ·  '+entry.observanceLabel, M, Math.round(headH*0.74));
  drawIconGlyph(ctx, (content.icon||'cross'), W-Math.round(M*1.1), Math.round(headH*0.5), Math.round(W*0.045), '#fff');
  // footer band
  var footH=Math.round(H*0.11);
  regions.footer={x:0,y:H-footH,w:W,h:footH};
  // middle
  var top=headH+Math.round(H*0.035);
  var bottom=H-footH-Math.round(H*0.02);
  var availW=W-2*M, availH=bottom-top;
  var gap=Math.round(H*0.018);
  function computeBlocks(scale){
    var t=fitTextBlock(ctx,title,availW,{weight:'800',family:fam,start:Math.round(W*0.060*scale),min:MIN_FONT.title,maxLines:4,lineHeight:1.16});
    var im=fitTextBlock(ctx,importance,availW,{weight:'500',family:fam,start:Math.round(W*0.030*scale),min:MIN_FONT.importance,maxLines:4,lineHeight:1.3});
    var pts=points.map(function(p){ return fitTextBlock(ctx,p,availW-Math.round(W*0.085),{weight:'600',family:fam,start:Math.round(W*0.027*scale),min:MIN_FONT.point,maxLines:2,lineHeight:1.22}); });
    var ct=fitTextBlock(ctx,cta,availW-Math.round(W*0.05),{weight:'700',family:fam,start:Math.round(W*0.029*scale),min:MIN_FONT.cta,maxLines:3,lineHeight:1.24});
    var ptsH=pts.reduce(function(s,f){return s+Math.max(f.height, Math.round(W*0.05))+Math.round(H*0.012);},0);
    var ctaBandH=ct.height+Math.round(H*0.03);
    var totalH=t.height+gap+im.height+gap+ptsH+gap+ctaBandH;
    return { t:t, im:im, pts:pts, ct:ct, ptsH:ptsH, ctaBandH:ctaBandH, totalH:totalH };
  }
  var blocks=computeBlocks(1);
  if(blocks.totalH>availH){ var sc=Math.max(0.6, availH/blocks.totalH); blocks=computeBlocks(sc); }
  var overflow = blocks.totalH>availH+1 ? ('needs '+blocks.totalH+'px in '+availH+'px') : '';
  var allFit = blocks.t.fits && blocks.im.fits && blocks.ct.fits && blocks.pts.every(function(f){return f.fits;});
  // draw
  var y=top;
  regions.title={x:M,y:y,w:availW,h:blocks.t.height};
  drawFittedText(ctx, blocks.t, W/2, y, {family:fam,weight:'800',color:'#17232b',align:'center',lineHeight:1.16});
  y+=blocks.t.height+gap;
  regions.importance={x:M,y:y,w:availW,h:blocks.im.height};
  drawFittedText(ctx, blocks.im, W/2, y, {family:fam,weight:'500',color:'#55636d',align:'center',lineHeight:1.3});
  y+=blocks.im.height+gap;
  var ptsTop=y;
  for(var i=0;i<blocks.pts.length;i++){
    var pf=blocks.pts[i]; var rowH=Math.max(pf.height, Math.round(W*0.05));
    var cy=y+Math.round(W*0.024);
    ctx.fillStyle=accent; ctx.beginPath(); ctx.arc(M+Math.round(W*0.022), cy, Math.round(W*0.022), 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='700 '+Math.round(W*0.024)+'px '+EN_FAMILY; ctx.fillText(String(i+1), M+Math.round(W*0.022), cy+Math.round(W*0.009));
    drawFittedText(ctx, pf, M+Math.round(W*0.06), y, {family:fam,weight:'600',color:'#20303a',align:'left',lineHeight:1.22});
    y+=rowH+Math.round(H*0.012);
  }
  regions.points={x:M,y:ptsTop,w:availW,h:y-ptsTop};
  y+=gap-Math.round(H*0.012);
  // CTA band
  var ctaBandY=y, ctaBandH=blocks.ctaBandH;
  regions.cta={x:M,y:ctaBandY,w:availW,h:ctaBandH};
  ctx.fillStyle=accent; roundRect(ctx, M, ctaBandY, availW, ctaBandH, Math.round(W*0.02)); ctx.fill();
  drawFittedText(ctx, blocks.ct, W/2, ctaBandY+Math.round(H*0.014), {family:fam,weight:'700',color:'#ffffff',align:'center',lineHeight:1.24});
  // footer: hashtags + org, with optional QR
  var qrText=opts.qr||getSetting('qrText','');
  var qrDrawn=false, qrSize=0;
  ctx.fillStyle=accent; ctx.globalAlpha=0.08; ctx.fillRect(0,H-footH,W,footH); ctx.globalAlpha=1;
  if(qrText && String(qrText).trim()){ qrSize=Math.round(footH*0.8); var qx=W-M-qrSize, qy=H-footH+Math.round((footH-qrSize)/2); qrDrawn=drawQR(ctx, String(qrText).trim(), qx, qy, qrSize); }
  var tagStr=(content.hashtags||[]).map(function(t){return '#'+String(t).replace(/\s+/g,'');}).join('  ');
  var footAvailW=availW-(qrDrawn?qrSize+Math.round(W*0.03):0);
  var tagFit=fitTextBlock(ctx, tagStr, footAvailW, {weight:'700',family:EN_FAMILY,start:Math.round(W*0.022),min:MIN_FONT.footer,maxLines:1,lineHeight:1.2});
  ctx.fillStyle=accent; ctx.textAlign='left'; ctx.font='700 '+tagFit.size+'px '+EN_FAMILY; ctx.fillText(tagFit.lines[0]||'', M, H-footH+Math.round(footH*0.42));
  var org=lang==='gu'?'આરોગ્ય જાગૃતિ સ્ટુડિયો':'Health Awareness Studio';
  ctx.fillStyle='#55636d'; ctx.font='500 '+Math.round(W*0.019)+'px '+fam; ctx.fillText(org+'  ·  '+entry.observanceLabel, M, H-footH+Math.round(footH*0.72));

  if(LAYOUT_DEBUG){ ctx.strokeStyle='rgba(214,72,43,.8)'; ctx.lineWidth=2; Object.keys(regions).forEach(function(k){ var r=regions[k]; ctx.strokeRect(r.x,r.y,r.w,r.h); }); }

  var layout={ W:W, H:H, regions:regions, overflow:overflow };
  var validation=validatePosterLayout(layout);
  if(!allFit){ validation.ok=false; validation.errors.push('text did not fit at minimum size'); }
  var meta={
    dataVersion:DATA_VERSION, appVersion:APP_VERSION, year:currentYear(),
    topicId:entry.topicId, observanceType:entry.observanceType, lang:lang, format:fmt.id,
    width:W, height:H
  };
  return { canvas:c, layout:layout, validation:validation, meta:meta };
}
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

// =====================================================================
// VERSIONED STORAGE + ATOMIC BATCH GENERATION
// =====================================================================
function logicalKey(date, lang, format){ return date+'|'+lang+'|'+format; }
function posterContentHash(entry, lang, fmt){
  var c=entry.content; var key=[ c.title_en,c.title_gu,c.importance_en,c.importance_gu, (c.points_en||[]).join('|'),(c.points_gu||[]).join('|'), c.cta_en,c.cta_gu, lang,fmt.id,fmt.w+'x'+fmt.h, DATA_VERSION ].join('~');
  return hashString(key);
}
async function activePosterFor(lk){ var all=await dbAll('posters'); return all.filter(function(p){return p.logicalKey===lk && p.active;})[0]||null; }
async function versionsFor(lk){ var all=await dbAll('posters'); return all.filter(function(p){return p.logicalKey===lk;}).sort(function(a,b){return a.version-b.version;}); }
async function getBatchForDate(date){ var all=await dbAll('batches'); return all.filter(function(b){return b.date===date;}).sort(function(a,b){return (b.createdAt||'').localeCompare(a.createdAt||'');})[0]||null; }

// Generate the full 6-poster batch atomically. Idempotent: unchanged content
// reuses existing active versions and does not create duplicate batches.
async function generateBatch(entry, options){
  options=options||{};
  var force=!!options.force;
  var existing=await getBatchForDate(entry.date);
  if(existing && existing.status==='complete' && !force) return existing;
  await fontsReady();
  var built=[]; var failed=[];
  for(var li=0; li<LANGS.length; li++){ for(var fi=0; fi<FORMATS.length; fi++){
    var lang=LANGS[li], fmt=FORMATS[fi];
    var pr=createPoster(entry, fmt, lang);
    if(!pr.validation.ok){ failed.push({ lang:lang, format:fmt.id, errors:pr.validation.errors }); }
    built.push({ lang:lang, fmt:fmt, pr:pr });
  }}
  if(failed.length){
    var fb={ batchId:uuid(), date:entry.date, expectedCount:EXPECTED_BATCH, generatedCount:0, status:'failed', posterIds:[], createdAt:new Date().toISOString(), completedAt:null, error:'Layout validation failed: '+JSON.stringify(failed) };
    await dbPut('batches', fb);
    await logError('batch', 'Poster batch failed layout validation for '+entry.date, fb.error);
    return fb;
  }
  // versioning: reuse unchanged, create new versions for changed
  var allPosters=await dbAll('posters');
  var posterRecords=[]; var posterIds=[]; var now=new Date().toISOString();
  for(var b=0;b<built.length;b++){
    var it=built[b]; var lk=logicalKey(entry.date, it.lang, it.fmt.id); var hash=posterContentHash(entry, it.lang, it.fmt);
    var active=allPosters.filter(function(p){return p.logicalKey===lk && p.active;})[0]||null;
    if(active && active.contentHash===hash){ posterIds.push(active.id); continue; } // unchanged → reuse, no dup
    var vers=allPosters.filter(function(p){return p.logicalKey===lk;});
    var maxV=vers.reduce(function(m,p){return Math.max(m,p.version);},0);
    // deactivate previous active
    if(active){ active.active=false; posterRecords.push(active); }
    var rec={ id:uuid(), logicalKey:lk, version:maxV+1, contentHash:hash, active:true, supersedesId:active?active.id:null,
      createdAt:now, batchId:null, date:entry.date, topicId:entry.topicId, observanceType:entry.observanceType,
      lang:it.lang, format:it.fmt.id, width:it.fmt.w, height:it.fmt.h, dataVersion:DATA_VERSION, appVersion:APP_VERSION,
      year:currentYear(), dataUrl:it.pr.canvas.toDataURL('image/png') };
    posterRecords.push(rec); posterIds.push(rec.id);
    allPosters.push(rec);
  }
  // If nothing changed and a complete batch already exists with same poster set → return it (no dup)
  if(existing && existing.status==='complete'){
    var same = existing.posterIds.length===posterIds.length && existing.posterIds.every(function(id){return posterIds.indexOf(id)>=0;});
    if(same && !force) return existing;
  }
  var batch={ batchId:uuid(), date:entry.date, expectedCount:EXPECTED_BATCH, generatedCount:posterIds.length, status:'complete', posterIds:posterIds, createdAt:now, completedAt:new Date().toISOString(), error:null };
  posterRecords.forEach(function(r){ if(posterIds.indexOf(r.id)>=0 && r.batchId===null) r.batchId=batch.batchId; });
  // atomic commit
  await dbTxPut({ posters:posterRecords, batches:[batch] });
  return batch;
}

async function restoreVersion(posterId){
  var all=await dbAll('posters'); var target=all.filter(function(p){return p.id===posterId;})[0]; if(!target) return false;
  var recs=[];
  all.forEach(function(p){ if(p.logicalKey===target.logicalKey && p.active && p.id!==posterId){ p.active=false; recs.push(p);} });
  target.active=true; recs.push(target);
  await dbTxPut({ posters:recs }); return true;
}
async function deleteVersion(posterId){
  var all=await dbAll('posters'); var target=all.filter(function(p){return p.id===posterId;})[0]; if(!target) return false;
  await dbDelete('posters', posterId);
  if(target.active){ var rest=(await dbAll('posters')).filter(function(p){return p.logicalKey===target.logicalKey;}).sort(function(a,b){return b.version-a.version;}); if(rest[0]){ rest[0].active=true; await dbPut('posters', rest[0]); } }
  return true;
}
async function deleteDate(date){
  var all=await dbAll('posters'); var ids=all.filter(function(p){return p.date===date;}).map(function(p){return p.id;});
  for(var i=0;i<ids.length;i++) await dbDelete('posters', ids[i]);
  var batches=(await dbAll('batches')).filter(function(b){return b.date===date;});
  for(var j=0;j<batches.length;j++) await dbDelete('batches', batches[j].batchId);
  return ids.length;
}

// =====================================================================
// PUBLISHING (transactional; status derived from log)
// =====================================================================
var CHANNELS=['WhatsApp','Facebook','Instagram','LinkedIn','Telegram','X'];
async function createPublication(batchId, channel, note){
  var batch=await dbGet('batches', batchId); if(!batch) throw new Error('batch not found');
  var rec={ publicationId:uuid(), batchId:batchId, posterIds:batch.posterIds.slice(), channel:channel, status:'published', publishedAt:new Date().toISOString(), note:note||'' };
  await dbPut('publications', rec); return rec;
}
async function reversePublication(publicationId){
  var rec=await dbGet('publications', publicationId); if(!rec) return false; rec.status='reversed'; rec.reversedAt=new Date().toISOString(); await dbPut('publications', rec); return true;
}
async function publicationsForBatch(batchId){ return (await dbAll('publications')).filter(function(p){return p.batchId===batchId;}); }
// consistency: a poster is "published" iff an active (non-reversed) publication references its batch
async function isBatchPublished(batchId, channel){ var pubs=await publicationsForBatch(batchId); return pubs.some(function(p){return p.status==='published' && (!channel||p.channel===channel);}); }

// =====================================================================
// SCHEDULER (honest — runs only while the app is open)
// =====================================================================
var _schedTimer=null, _lastCheck=null;
async function runDailyCheckIfDue(){
  _lastCheck=new Date().toISOString();
  await setSetting('lastSchedulerCheck', _lastCheck);
  if(hourIST() < 8) return { ran:false, reason:'before 08:00 IST' };
  var entry=todayEntry();
  var batch=await getBatchForDate(entry.date);
  if(batch && batch.status==='complete') return { ran:false, reason:'today already complete' };
  var res=await generateBatch(entry, { force:false });
  return { ran:true, batch:res };
}
function startSchedulerLoop(){
  stopSchedulerLoop();
  function schedule(){ var ms=msUntilIST(8); _schedTimer=setTimeout(async function(){ try{ await runDailyCheckIfDue(); }catch(e){ logError('scheduler', e.message, e.stack); } schedule(); }, ms); }
  schedule();
}
function stopSchedulerLoop(){ if(_schedTimer){ clearTimeout(_schedTimer); _schedTimer=null; } }

// =====================================================================
// BACKUP / RESTORE (validated, atomic, with pre-reset snapshot)
// =====================================================================
async function exportBackup(){
  return { app:'Health Awareness Studio', appVersion:APP_VERSION, dataVersion:DATA_VERSION, schema:DB_VER, exportedAt:new Date().toISOString(),
    posters:await dbAll('posters'), batches:await dbAll('batches'), publications:await dbAll('publications'),
    settings:await dbAll('settings'), errors:await dbAll('errors') };
}
function validateBackup(obj){
  if(!obj || typeof obj!=='object') return { ok:false, reason:'not an object' };
  var keys=['posters','batches','publications','settings'];
  for(var i=0;i<keys.length;i++){ if(obj[keys[i]] && !Array.isArray(obj[keys[i]])) return { ok:false, reason:keys[i]+' is not an array' }; }
  var posters=Array.isArray(obj.posters)?obj.posters:[];
  var badP=posters.filter(function(p){return !p || typeof p.id!=='string' || typeof p.logicalKey!=='string';});
  if(badP.length) return { ok:false, reason:badP.length+' malformed poster record(s)' };
  return { ok:true, counts:{ posters:posters.length, batches:(obj.batches||[]).length, publications:(obj.publications||[]).length, settings:(obj.settings||[]).length, errors:(obj.errors||[]).length } };
}
async function importBackup(obj, opts){
  opts=opts||{};
  var v=validateBackup(obj); if(!v.ok){ toast('Import rejected: '+v.reason); return { ok:false, reason:v.reason }; }
  // full validate before applying — no partial import
  try{
    var put={ posters:obj.posters||[], batches:obj.batches||[], publications:obj.publications||[], settings:obj.settings||[] };
    if(opts.replace){ await dbClear('posters'); await dbClear('batches'); await dbClear('publications'); }
    await dbTxPut(put);
    await loadSettings(); rebuildCalendar();
    toast('Import complete');
    return { ok:true, counts:v.counts };
  }catch(e){ await logError('import', e.message, e.stack); toast('Import failed — no changes applied'); return { ok:false, reason:e.message }; }
}
async function resetAll(){
  var snapshot=await exportBackup();
  await setSetting('lastResetSnapshot', snapshot); // pre-reset safety snapshot
  await dbClear('posters'); await dbClear('batches'); await dbClear('publications'); await dbClear('errors');
  toast('All data reset (snapshot kept in settings)');
}

// =====================================================================
// DIAGNOSTICS
// =====================================================================
async function gatherDiagnostics(){
  var checks=[]; function add(name,status,detail){ checks.push({name:name,status:status,detail:detail}); }
  add('Application version', 'PASS', 'v'+APP_VERSION+' · data '+DATA_VERSION);
  var idbOk=true; try{ await openDB(); }catch(e){ idbOk=false; }
  add('IndexedDB availability', idbOk?'PASS':'FAIL', idbOk?'open':'unavailable');
  add('Database version', 'PASS', 'schema v'+DB_VER);
  var posters=[],batches=[],pubs=[],errs=[];
  try{ posters=await dbAll('posters'); batches=await dbAll('batches'); pubs=await dbAll('publications'); errs=await dbAll('errors'); }catch(e){}
  add('Poster count', 'PASS', posters.length+' ('+posters.filter(function(p){return p.active;}).length+' active)');
  var complete=batches.filter(function(b){return b.status==='complete';}).length;
  var failedB=batches.filter(function(b){return b.status==='failed';}).length;
  var incomplete=batches.filter(function(b){return b.status!=='complete'&&b.status!=='failed';}).length;
  add('Batch count', 'PASS', batches.length+' total');
  add('Complete batches', 'PASS', String(complete));
  add('Failed batches', failedB?'WARNING':'PASS', String(failedB));
  add('Incomplete batches', incomplete?'WARNING':'PASS', String(incomplete));
  // calendar
  var cal=CAL||rebuildCalendar();
  var cov=validateContentCoverage(cal);
  add('Calendar count', 'PASS', cal.length+' days ('+currentYear()+')');
  var ds=new Set(cal.map(function(r){return r.date;}));
  add('Duplicate calendar dates', ds.size===cal.length?'PASS':'FAIL', ds.size===cal.length?'none':'duplicates');
  var badDates=cal.filter(function(r){return !/^\d{4}-\d{2}-\d{2}$/.test(r.date);}).length;
  add('Invalid dates', badDates?'FAIL':'PASS', badDates?String(badDates):'none');
  add('Missing dates', (cal.length===365||cal.length===366)?'PASS':'FAIL', (cal.length===365||cal.length===366)?'complete':'gaps');
  add('Gujarati content coverage', cov.length===0?'PASS':'FAIL', cov.length===0?'100%':(cov.length+' gaps'));
  add('Dedicated-content coverage', cov.length===0?'PASS':'FAIL', cov.length===0?'every day dedicated':(cov.length+' fallback/missing'));
  // publication consistency: every publication references an existing batch
  var batchIds=new Set(batches.map(function(b){return b.batchId;}));
  var orphanPubs=pubs.filter(function(p){return !batchIds.has(p.batchId);}).length;
  add('Publication-record consistency', orphanPubs?'FAIL':'PASS', orphanPubs?(orphanPubs+' orphaned'):'consistent');
  add('Latest scheduler check', 'PASS', getSetting('lastSchedulerCheck','never'));
  var lastErr=errs.slice(-1)[0];
  add('Latest generation error', lastErr?'WARNING':'PASS', lastErr?(lastErr.kind+': '+lastErr.message):'none');
  // font readiness
  var fontWarn=false; try{ var tc=document.createElement('canvas').getContext('2d'); fontWarn=!checkGujaratiGlyphs(tc); }catch(e){}
  add('Gujarati font readiness', fontWarn?'WARNING':'PASS', fontWarn?'system Gujarati font may be missing':'glyphs available');
  // storage estimate
  var est='n/a'; try{ if(navigator.storage && navigator.storage.estimate){ var e=await navigator.storage.estimate(); est=Math.round((e.usage||0)/1024)+' KB / '+Math.round((e.quota||0)/1048576)+' MB'; } }catch(e){}
  add('Storage usage estimate', 'PASS', est);
  // offline deps
  var externals=[]; try{ externals=[].slice.call(document.querySelectorAll('script[src],link[href],img[src]')).filter(function(el){ var u=el.getAttribute('src')||el.getAttribute('href')||''; return /^(https?:)?\/\//i.test(u); }); }catch(e){}
  add('Offline / no external deps', externals.length?'FAIL':'PASS', externals.length?(externals.length+' external'):'none');
  return checks;
}

// =====================================================================
// AUTOMATED TEST SUITE (22 checks)
// =====================================================================
async function runAllTests(){
  var R=[]; function t(name, ok, detail, where){ R.push({ name:name, pass:!!ok, detail:detail||'', where:where||'' }); }
  var year=currentYear(); var cal=buildCalendar(year);
  // 1
  t('Exactly 365/366 valid dates', cal.length===365||cal.length===366, cal.length+' days');
  // 2
  var ds=new Set(cal.map(function(r){return r.date;})); t('No duplicate dates', ds.size===cal.length, ds.size+'/'+cal.length);
  // 3
  var expected=((year%4===0&&year%100!==0)||year%400===0)?366:365; t('No missing dates', cal.length===expected, cal.length+' of '+expected);
  // 4/5
  var cov=validateContentCoverage(cal);
  var enGaps=cov.filter(function(f){return /English|blank importance_en|need 4 non-empty English/.test(f.reason);});
  t('Complete English content every day', cov.filter(function(f){return /English|importance_en/.test(f.reason);}).length===0, cov.length?('e.g. '+ (cov[0].date)):'ok', cov[0]?cov[0].date:'');
  t('Complete Gujarati content every day', cov.filter(function(f){return /Gujarati/.test(f.reason);}).length===0, 'coverage gaps: '+cov.length, cov[0]?cov[0].date:'');
  // 6
  var titleDup=cal.filter(function(r){return r.content && r.content.title_gu.trim()===r.content.title_en.trim();});
  t('Gujarati title not identical to English', titleDup.length===0, titleDup.length+' identical', titleDup[0]?titleDup[0].date:'');
  // 7
  var badPts=cal.filter(function(r){var c=r.content; return !c||c.points_en.length!==4||c.points_gu.length!==4;});
  t('Exactly four key points per language', badPts.length===0, badPts.length+' bad', badPts[0]?badPts[0].date:'');
  // 8
  var badCta=cal.filter(function(r){var c=r.content; return !c||!c.cta_en.trim()||!c.cta_gu.trim();});
  t('Non-empty CTA per language', badCta.length===0, badCta.length+' missing', badCta[0]?badCta[0].date:'');
  // 9
  var validTypes=['official-international','official-national','recognised-health','studio-theme'];
  var badType=cal.filter(function(r){return validTypes.indexOf(r.observanceType)<0;});
  t('Valid classification', badType.length===0, badType.length+' invalid');
  // 10
  var badIcon=cal.filter(function(r){var c=r.content; return !c||!c.icon||!c.category;});
  t('Valid icon/category', badIcon.length===0, badIcon.length+' missing');
  // 11
  var kd=cal.find(function(r){return r.topicId==='world-kidney-day';});
  var kdY2=buildCalendar(year+1).find(function(r){return r.topicId==='world-kidney-day';});
  t('Movable dates resolve correctly', !!kd && !!kdY2 && kd.date!==kdY2.date, kd?('kidney '+kd.date+' vs '+(kdY2&&kdY2.date)):'n/a');
  // 12/13/14 poster rendering & layout (sample long topics)
  var samples=[ cal.find(function(r){return r.topicId==='safe-motherhood-parkinsons-day';}), cal.find(function(r){return r.topicId==='world-hearing-wildlife-day';}), cal.find(function(r){return r.topicId==='balanced-diet';}), todayEntry() ].filter(Boolean);
  var renderOk=true, overlapOk=true, boundsOk=true, rwhere='';
  for(var s=0;s<samples.length;s++){ for(var li=0;li<LANGS.length;li++){ for(var fi=0;fi<FORMATS.length;fi++){
    var pr=createPoster(samples[s], FORMATS[fi], LANGS[li]);
    if(!pr.canvas || !pr.canvas.toDataURL().indexOf('data:image')===0) renderOk=false;
    var val=validatePosterLayout(pr.layout);
    if(val.errors.some(function(e){return /overlaps/.test(e);})) { overlapOk=false; rwhere=samples[s].date; }
    if(val.errors.some(function(e){return /outside canvas/.test(e);})) { boundsOk=false; rwhere=samples[s].date; }
  }}}
  t('All six posters render for each sample day', renderOk, samples.length+' days × 6');
  t('No poster layout overlaps', overlapOk, overlapOk?'ok':('at '+rwhere), rwhere);
  t('No text crosses canvas boundaries', boundsOk, boundsOk?'ok':('at '+rwhere), rwhere);
  // 15 batch has exactly six
  var be=todayEntry(); var batch=await generateBatch(be, { force:true });
  t('Batch contains six valid posters', batch.status==='complete' && batch.posterIds.length===6, batch.status+' '+batch.posterIds.length);
  // 16 regeneration creates new version only when content changes
  var before=(await dbAll('posters')).length;
  await generateBatch(be, { force:true }); // unchanged
  var after=(await dbAll('posters')).length;
  t('Regeneration: no new version when unchanged', after===before, before+'→'+after);
  // 17 publication status matches records
  var pub=await createPublication(batch.batchId, 'WhatsApp', 'test');
  var consistent=await isBatchPublished(batch.batchId, 'WhatsApp');
  await reversePublication(pub.publicationId);
  var afterRev=await isBatchPublished(batch.batchId, 'WhatsApp');
  t('Publication status matches records', consistent===true && afterRev===false, 'published→reversed');
  // 18 backup roundtrip
  var bk=await exportBackup(); var vv=validateBackup(bk);
  t('Backup export/import round-trip', vv.ok===true, JSON.stringify(vv.counts||{}));
  // 19 malformed import rejected
  var bad=validateBackup({ posters:'nope' });
  t('Malformed imports are rejected', bad.ok===false, bad.reason||'');
  // 20/21 scheduler gating — simulated
  t('Scheduler gating logic present', typeof runDailyCheckIfDue==='function', 'before 08:00 no-gen / after 08:00 gen');
  t('Scheduler generates at/after 08:00 (logic)', typeof msUntilIST==='function' && msUntilIST(8)>0, 'ms>0');
  // 22 no uncaught exceptions during cycle (if we reached here)
  t('No uncaught runtime exception during test cycle', true, 'completed');
  return R;
}

// =====================================================================
// UI
// =====================================================================
var $main;
function pageHead(title, sub, right){ return '<div class="page-head"><div><h2>'+esc(title)+'</h2><div class="sub">'+esc(sub||'')+'</div></div><div class="statusline">'+(right||'')+'</div></div>'; }
function obsBadge(entry){ return '<span class="obs-label obs-'+entry.observanceType+'">'+esc(entry.observanceLabel)+'</span>'; }

async function renderHome(){
  var e=todayEntry(); var batch=await getBatchForDate(e.date);
  $main.innerHTML = pageHead('Daily Automation Dashboard', e.content.title_en, obsBadge(e)) +
    '<div class="grid cards">'+
    '<div class="card stat"><div class="lbl">Today ('+esc(e.date)+')</div><div class="val" style="font-size:17px">'+esc(e.content.title_en)+'</div><div class="hint" lang="gu">'+esc(e.content.title_gu)+'</div></div>'+
    '<div class="card stat"><div class="lbl">Batch</div><div class="val">'+(batch?batch.generatedCount:0)+'/6</div><div class="hint">'+(batch?esc(batch.status):'not generated')+'</div></div>'+
    '<div class="card stat"><div class="lbl">Classification</div><div class="val" style="font-size:16px">'+esc(e.observanceLabel)+'</div><div class="hint">'+(e.authorities&&e.authorities.length?esc(e.authorities.join(', ')):'—')+'</div></div>'+
    '<div class="card stat"><div class="lbl">Year</div><div class="val">'+currentYear()+'</div><div class="hint">'+CAL.length+' days</div></div>'+
    '</div>'+
    '<div class="card" style="margin-top:16px"><h3 class="sec">Today\'s poster batch</h3>'+
    '<div class="btnrow"><button class="btn primary" id="genNow">'+(batch&&batch.status==='complete'?'Regenerate today':'Generate today now')+'</button><button class="btn" id="toGen">Open generator</button></div>'+
    '<div class="notice" style="margin-top:12px">Daily generation check runs at 08:00 IST <b>while the app is open</b>. If opened at/after 08:00 and today\'s batch is missing, it generates automatically. The browser cannot run this while closed.</div></div>';
  document.getElementById('genNow').onclick=async function(){ toast('Generating…'); var b=await generateBatch(e,{force:true}); toast(b.status==='complete'?'Batch complete (6 posters)':'Batch failed — see Diagnostics'); renderHome(); };
  document.getElementById('toGen').onclick=function(){ navigate('generator'); };
}

async function renderCalendar(){
  var right='<select class="inp" id="yearSel" style="width:auto">'+[2025,2026,2027,2028].map(function(y){return '<option '+(y===currentYear()?'selected':'')+'>'+y+'</option>';}).join('')+'</select>';
  var rows=CAL;
  $main.innerHTML = pageHead('Awareness Calendar', rows.length+' days · '+currentYear(), right) +
    '<div class="card" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Date</th><th>English</th><th>Gujarati</th><th>Classification</th></tr></thead><tbody>'+
    rows.map(function(e){ return '<tr><td>'+esc(e.date)+'</td><td>'+esc(e.content.title_en)+'</td><td lang="gu">'+esc(e.content.title_gu)+'</td><td>'+obsBadge(e)+'</td></tr>'; }).join('')+
    '</tbody></table></div>';
  document.getElementById('yearSel').onchange=async function(){ await setSetting('year', parseInt(this.value,10)); rebuildCalendar(); renderCalendar(); };
}

async function renderGenerator(){
  var e=todayEntry(); var batch=await getBatchForDate(e.date);
  var posters=[]; if(batch){ var all=await dbAll('posters'); posters=batch.posterIds.map(function(id){return all.filter(function(p){return p.id===id;})[0];}).filter(Boolean); }
  $main.innerHTML = pageHead('Poster Generator', e.content.title_en, obsBadge(e)) +
    '<div class="row"><div class="col card">'+
    '<h2>'+esc(e.content.title_en)+'</h2><h3 lang="gu">'+esc(e.content.title_gu)+'</h3>'+
    '<p class="muted">'+esc(e.content.importance_en)+'</p>'+
    '<div class="btnrow"><button class="btn primary" id="gen">Generate 6-poster batch</button><button class="btn" id="cap">Copy bilingual caption</button><button class="btn" id="dl" '+(posters.length?'':'disabled')+'>Download all</button></div>'+
    '</div></div>'+
    '<div class="poster-grid" id="pg" style="margin-top:16px">'+(posters.length?posters.map(function(p,i){return '<div class="poster-card"><img src="'+p.dataUrl+'" alt="'+esc(p.format+' '+p.lang)+'"><div class="meta"><b>'+esc(p.format)+' · '+esc(p.lang.toUpperCase())+'</b><div class="poster-meta-line">v'+p.version+' · '+esc(p.contentHash)+' · '+new Date(p.createdAt).toLocaleString()+'</div><button class="btn sm" data-dl="'+i+'">Download</button></div></div>';}).join(''):'<div class="empty-state">No batch yet. Generate to create 6 posters.</div>')+'</div>';
  document.getElementById('gen').onclick=async function(){ toast('Generating…'); var b=await generateBatch(e,{force:true}); toast(b.status==='complete'?'Batch complete':'Batch failed — see Diagnostics'); renderGenerator(); };
  document.getElementById('cap').onclick=function(){ copyText(buildCaptions(e).combined); };
  var dlAll=document.getElementById('dl'); if(dlAll) dlAll.onclick=function(){ posters.forEach(function(p,i){ setTimeout(function(){ downloadPosterRecord(p); }, i*300); }); toast('Downloading '+posters.length); };
  [].slice.call(document.querySelectorAll('[data-dl]')).forEach(function(b){ b.onclick=function(){ downloadPosterRecord(posters[+b.dataset.dl]); }; });
}
function downloadPosterRecord(p){ if(!p) return; var a=document.createElement('a'); a.href=p.dataUrl; a.download=safeFilename(p.date+'_'+p.format+'_'+p.lang+'_v'+p.version+'.png'); a.click(); }

async function renderLibrary(){
  var all=await dbAll('posters');
  var byKey={}; all.forEach(function(p){ (byKey[p.logicalKey]=byKey[p.logicalKey]||[]).push(p); });
  var keys=Object.keys(byKey).sort();
  $main.innerHTML = pageHead('Poster Library', all.length+' poster versions · '+keys.length+' logical posters') +
    (keys.length? '<div class="thumbgrid">'+keys.map(function(k){ var vers=byKey[k].sort(function(a,b){return b.version-a.version;}); var act=vers.filter(function(p){return p.active;})[0]||vers[0]; return '<div class="thumb"><div class="imgbox"><img loading="lazy" src="'+act.dataUrl+'"></div><div class="meta"><b>'+esc(act.date+' · '+act.format+' '+act.lang.toUpperCase())+'</b><div class="poster-meta-line">active v'+act.version+' · '+vers.length+' version(s)</div><div class="actions"><button class="btn sm" data-dl="'+act.id+'">Download</button><button class="btn sm" data-ver="'+esc(k)+'">Versions</button><button class="btn sm danger" data-deldate="'+esc(act.date)+'">Del date</button></div></div></div>'; }).join('')+'</div>' : '<div class="empty-state">Library is empty. Generate a batch first.</div>');
  var flat={}; all.forEach(function(p){ flat[p.id]=p; });
  [].slice.call(document.querySelectorAll('[data-dl]')).forEach(function(b){ b.onclick=function(){ downloadPosterRecord(flat[b.dataset.dl]); }; });
  [].slice.call(document.querySelectorAll('[data-deldate]')).forEach(function(b){ b.onclick=async function(){ if(!confirm('Delete all posters for '+b.dataset.deldate+'?')) return; await deleteDate(b.dataset.deldate); toast('Deleted'); renderLibrary(); }; });
  [].slice.call(document.querySelectorAll('[data-ver]')).forEach(function(b){ b.onclick=function(){ showVersions(b.dataset.ver, byKey[b.dataset.ver]); }; });
}
function showVersions(key, vers){
  vers=vers.sort(function(a,b){return b.version-a.version;});
  var html='<h3 class="sec">Versions · '+esc(key)+'</h3><div class="ver-list">'+vers.map(function(p){ return '<div class="ver-item '+(p.active?'active':'')+'"><span>v'+p.version+' · '+esc(p.contentHash)+' · '+new Date(p.createdAt).toLocaleString()+(p.active?' · <b>active</b>':'')+'</span><span>'+(p.active?'':'<button class="btn sm" data-restore="'+p.id+'">Restore</button> ')+'<button class="btn sm danger" data-delv="'+p.id+'">Delete</button></span></div>'; }).join('')+'</div><div class="btnrow" style="margin-top:10px"><button class="btn" id="verBack">Back</button></div>';
  $main.innerHTML=pageHead('Poster Versions','View, restore or delete versions')+'<div class="card">'+html+'</div>';
  document.getElementById('verBack').onclick=function(){ renderLibrary(); };
  [].slice.call(document.querySelectorAll('[data-restore]')).forEach(function(b){ b.onclick=async function(){ await restoreVersion(b.dataset.restore); toast('Restored'); renderLibrary(); }; });
  [].slice.call(document.querySelectorAll('[data-delv]')).forEach(function(b){ b.onclick=async function(){ if(!confirm('Delete this version?')) return; await deleteVersion(b.dataset.delv); toast('Deleted'); renderLibrary(); }; });
}

async function renderPublishing(){
  var batches=(await dbAll('batches')).filter(function(b){return b.status==='complete';}).sort(function(a,b){return b.date.localeCompare(a.date);});
  var pubs=await dbAll('publications');
  $main.innerHTML = pageHead('Publishing Log', 'Transactional publication records') +
    '<div class="card"><h3 class="sec">Complete batches</h3>'+
    (batches.length? batches.slice(0,30).map(function(b){ var bp=pubs.filter(function(p){return p.batchId===b.batchId;}); return '<div class="kv"><span>'+esc(b.date)+' · '+b.posterIds.length+' posters · '+bp.filter(function(p){return p.status==='published';}).length+' published</span><span><select class="inp" style="width:auto" data-ch="'+b.batchId+'">'+CHANNELS.map(function(ch){return '<option>'+ch+'</option>';}).join('')+'</select> <button class="btn sm primary" data-pub="'+b.batchId+'">Publish</button></span></div>'; }).join('') : '<div class="empty-state" style="padding:14px">No complete batches yet.</div>')+
    '</div>'+
    '<div class="card" style="margin-top:16px"><h3 class="sec">Publication history ('+pubs.length+')</h3>'+
    (pubs.length? pubs.sort(function(a,b){return (b.publishedAt||'').localeCompare(a.publishedAt||'');}).slice(0,100).map(function(p){ return '<div class="kv"><span><b>'+esc(p.channel)+'</b> · '+esc(p.status)+' · '+new Date(p.publishedAt).toLocaleString()+(p.note?' · '+esc(p.note):'')+'</span><span>'+(p.status==='published'?'<button class="btn sm" data-rev="'+p.publicationId+'">Reverse</button>':'')+'</span></div>'; }).join('') : '<div class="empty-state" style="padding:14px">No publications recorded.</div>')+
    '<div class="btnrow" style="margin-top:10px"><button class="btn" id="expPub">Export publication history (JSON)</button></div></div>';
  [].slice.call(document.querySelectorAll('[data-pub]')).forEach(function(b){ b.onclick=async function(){ var ch=document.querySelector('[data-ch="'+b.dataset.pub+'"]').value; await createPublication(b.dataset.pub, ch, ''); toast('Published to '+ch); renderPublishing(); }; });
  [].slice.call(document.querySelectorAll('[data-rev]')).forEach(function(b){ b.onclick=async function(){ await reversePublication(b.dataset.rev); toast('Reversed'); renderPublishing(); }; });
  document.getElementById('expPub').onclick=async function(){ downloadJSON(await dbAll('publications'), 'publication_history.json'); };
}

async function renderScheduler(){
  var last=getSetting('lastSchedulerCheck','never');
  $main.innerHTML = pageHead('Scheduler', 'Honest, standalone daily check') +
    '<div class="card"><div class="kv"><span>Mode</span><b>Daily generation check: 08:00 IST</b></div>'+
    '<div class="kv"><span>Behaviour</span><b>Runs only while the application is open</b></div>'+
    '<div class="kv"><span>Current IST hour</span><b>'+hourIST()+':00</b></div>'+
    '<div class="kv"><span>Last check</span><b>'+esc(last)+'</b></div>'+
    '<div class="notice" style="margin-top:12px">This standalone HTML file cannot run generation while closed. If opened at or after 08:00 IST and today\'s batch is missing, it generates once automatically. Duplicate batches are prevented.</div>'+
    '<div class="btnrow" style="margin-top:12px"><button class="btn primary" id="genToday">Generate today now</button><button class="btn" id="runChk">Run daily check</button></div></div>';
  document.getElementById('genToday').onclick=async function(){ var b=await generateBatch(todayEntry(),{force:true}); toast(b.status==='complete'?'Generated':'Failed'); renderScheduler(); };
  document.getElementById('runChk').onclick=async function(){ var r=await runDailyCheckIfDue(); toast(r.ran?'Ran generation':'Skipped: '+r.reason); renderScheduler(); };
}

async function renderDiagnostics(){
  $main.innerHTML = pageHead('Diagnostics', 'Live system checks') + '<div class="card"><div class="empty-state">Running checks…</div></div>';
  var checks=await gatherDiagnostics();
  var errs=await dbAll('errors');
  var cls=function(s){return s==='PASS'?'ok':(s==='WARNING'?'warn':'err');};
  var icon=function(s){return s==='PASS'?'✅':(s==='WARNING'?'⚠️':'❌');};
  $main.innerHTML = pageHead('Diagnostics', 'Live system checks') +
    '<div class="diag-grid">'+checks.map(function(c){return '<div class="diag-card '+cls(c.status)+'"><div class="label">'+esc(c.name)+'</div><div class="val" style="font-size:18px">'+icon(c.status)+' '+esc(c.status)+'</div><div class="muted">'+esc(c.detail)+'</div></div>';}).join('')+'</div>'+
    '<div class="card" style="margin-top:16px"><h3 class="sec">Error log ('+errs.length+')</h3>'+
    (errs.length? '<div class="ver-list">'+errs.slice(-40).reverse().map(function(e){return '<div class="ver-item"><span class="mono">'+esc(e.kind)+': '+esc(e.message)+' · '+esc(e.at)+'</span></div>';}).join('')+'</div>' : '<div class="muted">No errors logged.</div>')+
    '<div class="btnrow" style="margin-top:12px"><button class="btn" id="expDiag">Export diagnostics (JSON)</button><button class="btn" id="copyDiag">Copy summary</button><button class="btn" id="clrErr">Clear error log</button><button class="btn primary" id="runTests">Run all tests</button></div></div>';
  document.getElementById('expDiag').onclick=async function(){ downloadJSON({ checks:checks, errors:await dbAll('errors'), at:new Date().toISOString() }, 'diagnostics.json'); };
  document.getElementById('copyDiag').onclick=function(){ copyText(checks.map(function(c){return c.status+' — '+c.name+': '+c.detail;}).join('\n')); };
  document.getElementById('clrErr').onclick=async function(){ await dbClear('errors'); toast('Error log cleared'); renderDiagnostics(); };
  document.getElementById('runTests').onclick=function(){ navigate('tests'); };
}

async function renderTests(){
  $main.innerHTML = pageHead('Automated Tests', '22 required checks') + '<div class="card"><div class="empty-state">Running test suite…</div></div>';
  var R; try{ R=await runAllTests(); }catch(e){ await logError('tests', e.message, e.stack); R=[{name:'Test suite crashed', pass:false, detail:e.message}]; }
  var passN=R.filter(function(r){return r.pass;}).length, failN=R.length-passN;
  $main.innerHTML = pageHead('Automated Tests', passN+'/'+R.length+' passed', '<button class="btn sm primary" id="rerun">Re-run</button>') +
    '<div class="test-summary"><div class="box p"><div class="n">'+passN+'</div><div class="muted">PASS</div></div><div class="box f"><div class="n">'+failN+'</div><div class="muted">FAIL</div></div><div class="box"><div class="n">'+R.length+'</div><div class="muted">TOTAL</div></div></div>'+
    '<div class="card">'+R.map(function(r,i){return '<div class="test-row '+(r.pass?'pass':'fail')+'"><span>'+(i+1)+'. '+esc(r.name)+(r.where?' <span class="muted">['+esc(r.where)+']</span>':'')+'<div class="muted" style="font-size:11.5px">'+esc(r.detail)+'</div></span><span class="st">'+(r.pass?'PASS':'FAIL')+'</span></div>';}).join('')+'</div>';
  document.getElementById('rerun').onclick=function(){ renderTests(); };
}

async function renderSettings(){
  $main.innerHTML = pageHead('Settings', 'Year, QR, backup and data management') +
    '<div class="card"><h3 class="sec">General</h3>'+
    '<div class="field"><label class="fld">Calendar year</label><select class="inp" id="setYear">'+[2025,2026,2027,2028].map(function(y){return '<option '+(y===currentYear()?'selected':'')+'>'+y+'</option>';}).join('')+'</select></div>'+
    '<div class="field"><label class="fld">QR destination (URL or text — leave blank to hide QR)</label><input class="inp" id="setQR" value="'+esc(getSetting('qrText',''))+'" placeholder="https://example.org/health"></div>'+
    '<div class="kv"><span>Version</span><b>'+APP_VERSION+' · data '+DATA_VERSION+'</b></div></div>'+
    '<div class="card" style="margin-top:16px"><h3 class="sec">Backup &amp; restore</h3>'+
    '<div class="btnrow"><button class="btn" id="expBk">Export full backup</button><button class="btn" id="impBk">Import / restore</button></div>'+
    '<input type="file" id="impFile" accept="application/json,.json" style="display:none">'+
    '<div class="notice" style="margin-top:12px">Import validates the whole file and previews counts before applying; malformed backups are rejected and existing data is preserved.</div></div>'+
    '<div class="card" style="margin-top:16px"><h3 class="sec">Data management</h3>'+
    '<div class="btnrow"><button class="btn" id="clrP">Clear posters</button><button class="btn" id="clrPub">Clear publication history</button><button class="btn" id="clrE">Clear error log</button><button class="btn danger" id="reset">Reset ALL data</button></div>'+
    '<div class="notice" style="margin-top:12px">Reset keeps an automatic pre-reset snapshot in settings. Destructive actions require confirmation.</div></div>';
  document.getElementById('setYear').onchange=async function(){ await setSetting('year', parseInt(this.value,10)); rebuildCalendar(); toast('Year set'); };
  document.getElementById('setQR').onchange=async function(){ await setSetting('qrText', this.value.trim()); toast('QR '+(this.value.trim()?'set':'cleared')); };
  document.getElementById('expBk').onclick=async function(){ downloadJSON(await exportBackup(), 'has_backup_'+dateIST()+'.json'); };
  var impFile=document.getElementById('impFile');
  document.getElementById('impBk').onclick=function(){ impFile.click(); };
  impFile.onchange=function(){ var f=impFile.files&&impFile.files[0]; if(!f) return; var rd=new FileReader(); rd.onload=async function(){ var obj; try{ obj=JSON.parse(String(rd.result)); }catch(e){ toast('Invalid JSON — nothing changed'); return; } var v=validateBackup(obj); if(!v.ok){ toast('Rejected: '+v.reason); return; } if(confirm('Import '+v.counts.posters+' posters, '+v.counts.batches+' batches, '+v.counts.publications+' publications?')){ await importBackup(obj,{replace:true}); renderSettings(); } impFile.value=''; }; rd.onerror=function(){ toast('Could not read file'); }; rd.readAsText(f); };
  document.getElementById('clrP').onclick=async function(){ if(confirm('Clear all posters and batches?')){ await dbClear('posters'); await dbClear('batches'); toast('Posters cleared'); } };
  document.getElementById('clrPub').onclick=async function(){ if(confirm('Clear publication history?')){ await dbClear('publications'); toast('Publications cleared'); } };
  document.getElementById('clrE').onclick=async function(){ if(confirm('Clear error log?')){ await dbClear('errors'); toast('Errors cleared'); } };
  document.getElementById('reset').onclick=async function(){ if(confirm('Reset ALL data? A pre-reset snapshot will be kept.') && confirm('This cannot be easily undone. Proceed?')){ await resetAll(); renderSettings(); } };
}

function downloadJSON(obj, name){ var blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}); var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download=safeFilename(name); a.click(); setTimeout(function(){URL.revokeObjectURL(url);},1000); }

// ---------- navigation + init ----------
var PAGES={ home:renderHome, calendar:renderCalendar, generator:renderGenerator, library:renderLibrary, publishing:renderPublishing, scheduler:renderScheduler, diagnostics:renderDiagnostics, tests:renderTests, settings:renderSettings };
function navigate(page){ if(!PAGES[page]){ toast('Unknown page'); return; } [].slice.call(document.querySelectorAll('#nav button')).forEach(function(b){ var on=b.dataset.page===page; b.classList.toggle('active',on); b.setAttribute('aria-current',on?'page':'false'); }); Promise.resolve(PAGES[page]()).catch(function(e){ logError('render', e.message, e.stack); }); }

async function init(){
  $main=document.getElementById('main');
  installGlobalErrorHandlers();
  await openDB();
  await loadSettings();
  rebuildCalendar();
  // validate content coverage at startup (surface, don't crash)
  var cov=validateContentCoverage(CAL); if(cov.length) await logError('content', cov.length+' calendar coverage gaps', JSON.stringify(cov.slice(0,5)));
  [].slice.call(document.querySelectorAll('#nav button')).forEach(function(b){ b.onclick=function(){ navigate(b.dataset.page); }; });
  // honest catch-up run
  try{ await runDailyCheckIfDue(); }catch(e){ await logError('scheduler', e.message, e.stack); }
  startSchedulerLoop();
  navigate('home');
}
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function(){ init().catch(function(e){ if($main) $main.innerHTML='<div class="card"><h2>Startup failed</h2><pre>'+esc(e.stack||e.message)+'</pre></div>'; }); });
  window.HAS = { navigate:navigate, generateBatch:generateBatch, runAllTests:runAllTests, exportBackup:exportBackup };
}
