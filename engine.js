/* SplitFair engine: Adjusted Winner (Brams & Taylor 1996) for two people. Pure logic. */
(function (root) {
  'use strict';
  // items: [{name, a, b}] where a,b >= 0 are raw point values; each side is normalized to 100.
  function normalize(items) {
    var sa = 0, sb = 0;
    items.forEach(function (it) { sa += it.a; sb += it.b; });
    if (!(sa > 0) || !(sb > 0)) return { error: 'Each person must put points on at least one item.' };
    return items.map(function (it) { return { name: it.name, a: it.a * 100 / sa, b: it.b * 100 / sb }; });
  }
  function validate(items) {
    if (!Array.isArray(items) || items.length < 2) return 'Add at least 2 items.';
    if (items.length > 40) return 'At most 40 items.';
    var seen = {};
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it.name || !String(it.name).trim()) return 'Every item needs a name.';
      var key = String(it.name).trim().toLowerCase();
      if (seen[key]) return 'Duplicate item name: ' + it.name;
      seen[key] = 1;
      if (!isFinite(it.a) || !isFinite(it.b) || it.a < 0 || it.b < 0) return 'Points must be numbers, 0 or more.';
    }
    return null;
  }
  // returns {shares:[{name,a,b,fa,fb}], pa, pb, split, winnerSurplus}
  function adjustedWinner(raw) {
    var err = validate(raw); if (err) return { error: err };
    var n = normalize(raw); if (n.error) return n;
    var sh = n.map(function (it) {
      return { name: it.name, a: it.a, b: it.b, fa: it.a >= it.b ? 1 : 0, fb: it.a >= it.b ? 0 : 1 };
    });
    function tot() {
      var pa = 0, pb = 0;
      sh.forEach(function (s) { pa += s.a * s.fa; pb += s.b * s.fb; });
      return [pa, pb];
    }
    var t = tot(), pa = t[0], pb = t[1];
    var eps = 1e-9;
    if (Math.abs(pa - pb) > eps) {
      var rich = pa > pb ? 'a' : 'b';
      var poor = rich === 'a' ? 'b' : 'a';
      var fr = rich === 'a' ? 'fa' : 'fb', fp = rich === 'a' ? 'fb' : 'fa';
      // transfer from richer to poorer, lowest rich/poor value ratio first
      var order = sh.filter(function (s) { return s[fr] > 0 && s[poor] > 0; })
        .sort(function (x, y) { return x[rich] / x[poor] - y[rich] / y[poor]; });
      for (var i = 0; i < order.length; i++) {
        var s = order[i];
        t = tot();
        var gap = (rich === 'a' ? t[0] - t[1] : t[1] - t[0]);
        if (gap <= eps) break;
        var x = gap / (s[rich] + s[poor]);
        if (x >= s[fr] - 1e-12) { s[fp] += s[fr]; s[fr] = 0; }
        else { s[fr] -= x; s[fp] += x; }
      }
    }
    t = tot();
    var split = sh.filter(function (s) { return s.fa > eps && s.fb > eps; }).map(function (s) { return s.name; });
    return { shares: sh, pa: t[0], pb: t[1], split: split };
  }
  var api = { adjustedWinner: adjustedWinner, validate: validate, normalize: normalize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SplitFair = api;
})(typeof self !== 'undefined' ? self : this);
