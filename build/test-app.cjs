// Full DOM/IndexedDB/Canvas smoke harness for the assembled candidate.
const fs = require('fs');
const path = require('path');
let js = fs.readFileSync(path.join(__dirname, 'candidate-inline.js'), 'utf8');
// Remove the browser auto-init/window bootstrap; we drive init() ourselves.
js = js.replace(/if \(typeof window !== 'undefined'\) \{[\s\S]*?\n\}\s*$/, '');

// ---- Canvas ctx mock with plausible measureText ----
function parsePx(font){ const m=/(\d+(?:\.\d+)?)px/.exec(font||''); return m?parseFloat(m[1]):16; }
function mockCtx(){
  const ctx={ font:'16px sans', fillStyle:'#000', strokeStyle:'#000', lineWidth:1, textAlign:'left', textBaseline:'alphabetic', globalAlpha:1 };
  ctx.measureText=(t)=>({ width: String(t).length * parsePx(ctx.font) * 0.52 });
  ['fillRect','strokeRect','fillText','beginPath','moveTo','lineTo','bezierCurveTo','arc','arcTo','ellipse','fill','stroke','save','restore','translate','clearRect','closePath','drawImage','rect','setTransform','scale','rotate'].forEach(m=>{ ctx[m]=()=>{}; });
  return ctx;
}
function mockCanvas(w=300,h=150){ return { width:w, height:h, getContext:()=>mockCtx(), toDataURL:()=>'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==' }; }

// ---- element mock ----
const reg={};
function mkEl(tag){ const el={ tagName:tag, innerHTML:'', textContent:'', value:'', files:[], style:{}, dataset:{}, _a:{}, classList:{add(){},remove(){},toggle(){}}, setAttribute(k,v){this._a[k]=v;}, getAttribute(k){return this._a[k]!=null?this._a[k]:null;}, appendChild(){}, removeChild(){}, focus(){}, select(){}, click(){}, remove(){}, querySelector(){return null;}, querySelectorAll(){return [];}, addEventListener(){}, onclick:null,onchange:null,onload:null,onerror:null }; return el; }
function getEl(id){ if(!reg[id]){ reg[id]= /canvas/i.test(id)?Object.assign(mockCanvas(600,600),{dataset:{},style:{},setAttribute(){},classList:{add(){},remove(){},toggle(){}}}):mkEl('div'); reg[id].id=id; } return reg[id]; }
const navButtons=['home','calendar','generator','library','publishing','scheduler','diagnostics','tests','settings'].map(p=>{ const e=mkEl('button'); e.dataset={page:p}; return e; });

global.document={
  getElementById:getEl,
  createElement:(t)=> t==='canvas'?mockCanvas():mkEl(t),
  querySelector:(s)=> s.includes('viewport')?{content:'width=device-width',getAttribute:()=>'width=device-width'}:null,
  querySelectorAll:(s)=> s.indexOf('#nav')>=0?navButtons:(s.indexOf('script[src]')>=0?[]:[]),
  body:mkEl('body'), fonts:{ready:Promise.resolve()}, addEventListener:()=>{}, execCommand:()=>true
};
global.window={ addEventListener:()=>{}, HAS:null };
global.navigator={ onLine:true, clipboard:{writeText:async()=>{}}, storage:{ estimate:async()=>({usage:1024,quota:1048576}) } };
global.crypto=global.crypto||{}; if(!global.crypto.randomUUID) global.crypto.randomUUID=()=>'id-'+Math.random().toString(36).slice(2,12);
global.Blob=class{constructor(p){this.p=p;}}; global.URL={createObjectURL:()=>'blob:x',revokeObjectURL:()=>{}};
global.confirm=()=>true; global.prompt=()=>null; global.alert=()=>{};

// ---- IndexedDB mock (multi-store tx + autoIncrement) ----
function makeIDB(){
  const stores={};
  function ensure(name,opts){ if(!stores[name]) stores[name]={keyPath:opts&&opts.keyPath,auto:!!(opts&&opts.autoIncrement),data:new Map(),seq:0}; return stores[name]; }
  function req(fn){ const r={onsuccess:null,onerror:null}; setTimeout(()=>{ try{ r.result=fn(); r.onsuccess&&r.onsuccess({target:r}); }catch(e){ r.error=e; r.onerror&&r.onerror(); } },0); return r; }
  function api(s){ return {
    get:k=>req(()=> s.data.has(k)?s.data.get(k):undefined),
    getAll:()=>req(()=> [...s.data.values()]),
    put:rec=>{ let key; if(s.keyPath){ key=rec[s.keyPath]; if(key==null&&s.auto){ key=++s.seq; rec[s.keyPath]=key; } } else key=++s.seq; s.data.set(key,rec); return req(()=>key); },
    delete:k=>req(()=>{ s.data.delete(k); }),
    clear:()=>req(()=>{ s.data.clear(); }),
    createIndex:()=>{}, index:()=>({ getAll:()=>req(()=>[...s.data.values()]) })
  }; }
  const db={
    objectStoreNames:{ contains:n=>!!stores[n] },
    createObjectStore:(n,o)=>{ ensure(n,o); return { createIndex:()=>{} }; },
    transaction:(names,mode)=>{ names=Array.isArray(names)?names:[names]; const tx={oncomplete:null,onerror:null,onabort:null,objectStore:n=>api(ensure(n))}; setTimeout(()=>{ tx.oncomplete&&tx.oncomplete(); },0); return tx; }
  };
  return { open:()=>{ const r={onupgradeneeded:null,onsuccess:null,onerror:null}; setTimeout(()=>{ r.result=db; if(r.onupgradeneeded) r.onupgradeneeded({target:{result:db}}); if(r.onsuccess) r.onsuccess(); },0); return r; } };
}
global.indexedDB=makeIDB();

// ---- load app ----
eval(js);

(async()=>{
  const out=[]; const T=async(n,fn)=>{ try{ await fn(); out.push(['PASS',n]); }catch(e){ out.push(['FAIL',n+' :: '+(e&&e.stack||e)]); } };
  await T('init()', async()=>{ await init(); });
  const pages={home:renderHome,calendar:renderCalendar,generator:renderGenerator,library:renderLibrary,publishing:renderPublishing,scheduler:renderScheduler,diagnostics:renderDiagnostics,settings:renderSettings};
  for(const [n,fn] of Object.entries(pages)){ await T('render '+n, async()=>{ await fn(); if(!getEl('main').innerHTML) throw new Error('no content'); }); }
  await T('generateBatch → 6 posters', async()=>{ const b=await generateBatch(todayEntry(),{force:true}); if(b.status!=='complete'||b.posterIds.length!==6) throw new Error(b.status+' '+b.posterIds.length+' '+(b.error||'')); });
  await T('regenerate unchanged → no new versions', async()=>{ const before=(await dbAll('posters')).length; await generateBatch(todayEntry(),{force:true}); const after=(await dbAll('posters')).length; if(after!==before) throw new Error(before+'→'+after); });
  await T('exportBackup + validate', async()=>{ const bk=await exportBackup(); const v=validateBackup(bk); if(!v.ok) throw new Error('invalid'); });
  await T('importBackup rejects malformed', async()=>{ const r=await importBackup({posters:'nope'}); if(r.ok) throw new Error('should reject'); });

  // The full 22-check suite:
  let R;
  await T('runAllTests() executes', async()=>{ R=await runAllTests(); if(!R||!R.length) throw new Error('no results'); });

  console.log('\n===== APP SMOKE =====');
  let f=0; for(const [s,n] of out){ console.log(s==='PASS'?'  ✓ '+n:'  ✗ '+n); if(s==='FAIL')f++; }
  console.log('\n===== 22-CHECK SUITE =====');
  let sf=0; if(R){ R.forEach((r,i)=>{ console.log((r.pass?'  ✓ ':'  ✗ ')+(i+1)+'. '+r.name+(r.pass?'':'  ['+r.detail+(r.where?' @'+r.where:'')+']')); if(!r.pass) sf++; }); console.log(`\n${R.length-sf}/${R.length} checks passed`); }
  console.log(`\nApp smoke: ${out.length-f}/${out.length} passed, ${f} failed`);
  if (typeof stopSchedulerLoop==='function') stopSchedulerLoop();
  process.exit(f||sf?1:0);
})();
