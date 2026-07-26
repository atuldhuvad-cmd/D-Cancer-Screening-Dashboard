// Assemble the single-file candidate from parts.
const fs = require('fs');
const path = require('path');
const P = path.join(__dirname, 'parts');
const read = f => fs.readFileSync(f, 'utf8');

// Foundation: strip the CommonJS module.exports block for the browser.
let foundation = read(path.join(__dirname, 'content-foundation.cjs'));
foundation = foundation.replace(/\nmodule\.exports\s*=\s*\{[\s\S]*?\};\s*$/m, '\n');

const out =
  read(path.join(P, 'head_top.html')) +
  read(path.join(P, 'base.css')) + '\n' +
  read(path.join(P, 'extra.css')) +
  read(path.join(P, 'body.html')) + '\n' +
  '// ===== content + calendar engine =====\n' +
  foundation + '\n' +
  read(path.join(P, 'app-core.js')) + '\n' +
  read(path.join(P, 'tail.html'));

const target = path.join(__dirname, '..', 'health-awareness-studio-candidate.html');
fs.writeFileSync(target, out);
console.log('Assembled', target, '(' + out.length + ' bytes)');

// Also emit the pure JS (foundation + app-core) for node --check.
const js = foundation + '\n' + read(path.join(P, 'app-core.js'));
fs.writeFileSync(path.join(__dirname, 'candidate-inline.js'), js);
console.log('Wrote candidate-inline.js (' + js.length + ' bytes)');
