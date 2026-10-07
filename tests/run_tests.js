'use strict';
const S = require('../engine.js'); const exp = require('./expected.json');
let pass = 0, fail = 0; const fl = [];
const ok = (c, n) => { if (c) pass++; else { fail++; fl.push(n); } };
const near = (a, b, t, n) => ok(Math.abs(a - b) <= t, n + ' got ' + a + ' want ' + b);
exp.forEach((c, i) => {
  const r = S.adjustedWinner(c.items);
  ok(!r.error, 'case ' + i + ' no error');
  if (r.error) return;
  near(r.pa, c.pa, 1e-6, 'case ' + i + ' pa'); near(r.pb, c.pb, 1e-6, 'case ' + i + ' pb');
  near(r.pa, r.pb, 1e-6, 'case ' + i + ' equitable');
  ok(r.pa >= 50 - 1e-6 && r.pb >= 50 - 1e-6, 'case ' + i + ' envy-free (>=50)');
  ok(r.split.length <= 1, 'case ' + i + ' at most one split item');
  r.shares.forEach(s => { near(s.fa + s.fb, 1, 1e-9, 'case ' + i + ' ' + s.name + ' fully assigned'); });
});
// published-style example: both sides 100 after normalizing
let r = S.adjustedWinner([{name:'house',a:60,b:70},{name:'car',a:25,b:5},{name:'boat',a:15,b:25}]);
ok(r.split.length === 1, 'example splits one item');
ok(S.adjustedWinner([{name:'a',a:1,b:1}]).error, 'needs 2 items');
ok(S.adjustedWinner([{name:'a',a:1,b:1},{name:'A',a:1,b:1}]).error, 'dup names');
ok(S.adjustedWinner([{name:'a',a:-1,b:1},{name:'b',a:1,b:1}]).error, 'negative');
ok(S.adjustedWinner([{name:'a',a:0,b:1},{name:'b',a:0,b:1}]).error, 'zero total');
ok(S.adjustedWinner([{name:'a',a:'x',b:1},{name:'b',a:1,b:1}]).error, 'nan');
ok(!S.adjustedWinner([{name:'a',a:3,b:3},{name:'b',a:3,b:3}]).error, 'tie ok');
console.log(pass + ' passed, ' + fail + ' failed'); if (fail) { console.log(fl.join('\n')); process.exit(1); }
