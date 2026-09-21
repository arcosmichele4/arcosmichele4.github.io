/* Tame Impala "video": a static frame where only the colors and the circles change.
   Everything comes from the seven flat designs (same colors, same ring proportions):
   each design is 5 stacked discs + 2 thin lines + a background, and the loop morphs
   from one design to the next. Drawn live on a canvas, so it is sharp at any size. */
(function () {
  var COL = {
    navy: '#646f89', cream: '#f8f2c4', salmon: '#eeb19b',
    orange: '#e9810a', olive: '#cbc480', red: '#bd4541'
  };
  var TEXT = '#3a3a3a';

  // bg, five discs [radius, color] from the outside in (radius as a fraction of the outer circle),
  // and two thin lines [radius, color, alpha]
  var DESIGNS = [
    { bg: '#f9b785', discs: [[1, 'navy'], [0.83, 'cream'], [0.31, 'navy'], [0.31, 'navy'], [0.31, 'navy']],
      lines: [[0.67, 'navy', 1], [0.465, 'navy', 1]] },
    { bg: '#7d96eb', discs: [[1, 'orange'], [0.73, 'salmon'], [0.385, 'cream'], [0.385, 'cream'], [0.385, 'cream']],
      lines: [[0.67, 'salmon', 0], [0.465, 'salmon', 0]] },
    { bg: '#cda1cb', discs: [[1, 'cream'], [0.67, 'olive'], [0.314, 'red'], [0.314, 'red'], [0.314, 'red']],
      lines: [[0.465, 'navy', 1], [0.465, 'navy', 0]] },
    { bg: '#f3a2c5', discs: [[1, 'navy'], [0.73, 'salmon'], [0.385, 'cream'], [0.385, 'cream'], [0.385, 'cream']],
      lines: [[0.67, 'salmon', 0], [0.465, 'salmon', 0]] },
    { bg: '#9adbe6', discs: [[1, 'cream'], [0.93, 'olive'], [0.585, 'red'], [0.31, 'cream'], [0.31, 'cream']],
      lines: [[0.67, 'olive', 0], [0.465, 'olive', 0]] },
    { bg: '#8bc1a3', discs: [[1, 'orange'], [0.83, 'cream'], [0.31, 'orange'], [0.31, 'orange'], [0.31, 'orange']],
      lines: [[0.67, 'orange', 1], [0.465, 'orange', 1]] },
    { bg: '#fafa9e', discs: [[1, 'salmon'], [0.76, 'cream'], [0.706, 'salmon'], [0.31, 'cream'], [0.31, 'cream']],
      lines: [[0.7, 'cream', 0], [0.5, 'cream', 0]] }
  ];

  var HOLD = 0.7, MORPH = 0.6;               // seconds per design
  var SW = 1417, SH = 872, R0 = 357;         // the flat designs: size and radius of the outer circle

  function hex(c) {
    c = c.charAt(0) === '#' ? c : COL[c];
    return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
  }
  function mix(a, b, t) {
    var x = hex(a), y = hex(b);
    return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ')';
  }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function init(canvas) {
    var ctx = canvas.getContext('2d');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W = 0, H = 0, dpr = 1, raf = 0, visible = false, t0 = 0, tPause = 0;

    function size() {
      // the box can have any proportion: the design stays centered and the background fills the rest
      var w = canvas.clientWidth || 1;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = w; H = canvas.clientHeight || w * SH / SW;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      draw(current);
    }

    var current = 0; // elapsed seconds
    function state(t) {
      var per = HOLD + MORPH, n = DESIGNS.length;
      var i = Math.floor(t / per) % n, local = t % per;
      var k = local < HOLD ? 0 : ease((local - HOLD) / MORPH);
      return { a: DESIGNS[i], b: DESIGNS[(i + 1) % n], k: k };
    }

    function draw(t) {
      var s = state(t), a = s.a, b = s.b, k = s.k;
      var u = Math.min(W / SW, H / SH), R = R0 * u, cx = W / 2, cy = H / 2, i;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = mix(a.bg, b.bg, k);
      ctx.fillRect(0, 0, W, H);

      for (i = 0; i < 5; i++) {
        var r = a.discs[i][0] + (b.discs[i][0] - a.discs[i][0]) * k;
        ctx.fillStyle = mix(a.discs[i][1], b.discs[i][1], k);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0, R * r), 0, Math.PI * 2);
        ctx.fill();
      }
      for (i = 0; i < 2; i++) {
        var la = a.lines[i], lb = b.lines[i];
        var alpha = la[2] + (lb[2] - la[2]) * k;
        if (alpha < 0.01) continue;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = mix(la[1], lb[1], k);
        ctx.lineWidth = Math.max(1, 0.018 * R);
        ctx.beginPath();
        ctx.arc(cx, cy, R * (la[0] + (lb[0] - la[0]) * k), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // the name never changes: wide, bold, dark gray, in the middle
      var text = 'TAME  IMPALA', fs = 88 * u, ls = 0.1 * fs, total = 0, widths = [], j;
      ctx.font = '800 ' + fs + 'px Poppins, Arial, sans-serif';
      for (j = 0; j < text.length; j++) { widths[j] = ctx.measureText(text.charAt(j)).width; total += widths[j] + ls; }
      total -= ls;
      var sx = (782 * u) / total;
      ctx.save();
      ctx.translate(cx, H * 0.494);
      ctx.scale(sx, 1);
      ctx.fillStyle = TEXT;
      ctx.textBaseline = 'middle';
      var x = -total / 2;
      for (j = 0; j < text.length; j++) { ctx.fillText(text.charAt(j), x, 0); x += widths[j] + ls; }
      ctx.restore();
    }

    function frame(now) {
      if (!t0) t0 = now;
      current = (now - t0) / 1000;
      draw(current);
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    }

    function play() {
      if (raf || reduce) return;
      t0 = 0;
      raf = requestAnimationFrame(function (now) { t0 = now - current * 1000; frame(now); });
    }

    if ('ResizeObserver' in window) new ResizeObserver(size).observe(canvas);
    else window.addEventListener('resize', size);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) play(); else { cancelAnimationFrame(raf); raf = 0; }
      }, { threshold: 0.1 }).observe(canvas);
    } else { visible = true; }

    document.addEventListener('visibilitychange', function () { if (!document.hidden && visible) play(); });

    size();
    if (document.fonts && document.fonts.load) document.fonts.load('800 40px Poppins').then(function () { draw(current); });
    if (!('IntersectionObserver' in window)) play();
  }

  var els = document.querySelectorAll('canvas[data-tame-loop]');
  for (var q = 0; q < els.length; q++) init(els[q]);
})();
