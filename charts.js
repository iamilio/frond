// Small SVG chart helpers for the Frond ranking page.
// Thin marks, recessive grid, one y-axis per chart, hover tooltips, direct labels.
const NS = 'http://www.w3.org/2000/svg';
const ink = {primary: '#1f2a23', secondary: '#55625a', muted: '#8a968d', grid: '#e3eae5', axis: '#c7d2ca', surface: '#ffffff'};

let tip;
function tooltip() {
  if (!tip) { tip = document.createElement('div'); tip.className = 'chart-tip'; document.body.appendChild(tip); }
  return tip;
}
// rows: [{value, label, color, dash}] ; title shown on top. Built with textContent only.
function showTip(x, y, title, rows) {
  const t = tooltip(); t.replaceChildren();
  if (title) { const h = document.createElement('div'); h.className = 'tip-title'; h.textContent = title; t.appendChild(h); }
  for (const r of rows) {
    const row = document.createElement('div'); row.className = 'tip-row';
    if (r.color) { const k = document.createElement('span'); k.className = 'tip-key'; k.style.borderTopColor = r.color; if (r.dash) k.style.borderTopStyle = 'dashed'; row.appendChild(k); }
    const v = document.createElement('strong'); v.textContent = r.value; row.appendChild(v);
    if (r.label) { const l = document.createElement('span'); l.textContent = r.label; row.appendChild(l); }
    t.appendChild(row);
  }
  t.style.display = 'block';
  const w = t.offsetWidth, h = t.offsetHeight;
  t.style.left = Math.min(innerWidth - w - 8, x + 14) + 'px';
  t.style.top = Math.max(8, y - h - 12) + 'px';
}
function hideTip() { if (tip) tip.style.display = 'none'; }

const el = (name, attrs = {}, parent) => { const n = document.createElementNS(NS, name); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (parent) parent.appendChild(n); return n; };
const txt = (parent, x, y, s, attrs = {}) => { const t = el('text', {x, y, ...attrs}, parent); t.textContent = s; return t; };
const nice = (max) => { const step = Math.pow(10, Math.floor(Math.log10(max || 1))); for (const m of [.2, .25, .4, .5, 1, 2, 2.5, 5, 10]) if (m * step * 5 >= max) return {top: m * step * 5, step: m * step}; return {top: max, step: max / 5}; };
const fmt = (n, d = 0) => Number(n).toLocaleString(undefined, {maximumFractionDigits: d, minimumFractionDigits: d});

function frame(host, W, H) {
  host.replaceChildren();
  const svg = el('svg', {viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img'}, host);
  svg.style.display = 'block'; svg.style.overflow = 'visible';
  return svg;
}

function legend(host, series) {
  const lg = document.createElement('div'); lg.className = 'chart-legend';
  for (const s of series) {
    const item = document.createElement('span'); const key = document.createElement('i');
    key.className = s.kind === 'rect' ? 'lg-rect' : 'lg-line'; key.style.setProperty('--c', s.color);
    if (s.dash) key.classList.add('dashed');
    item.appendChild(key); item.appendChild(document.createTextNode(s.name)); lg.appendChild(item);
  }
  host.appendChild(lg);
}

// Line chart: x categories, several series, crosshair + one tooltip for every series, end labels.
export function lineChart(host, {labels, series, unit, digits = 0, labelAt}) {
  const W = Math.max(320, host.clientWidth || 640), H = 260, m = {l: 44, r: 150, t: 24, b: 28};
  const svg = frame(host, W, H), iw = W - m.l - m.r, ih = H - m.t - m.b;
  const max = Math.max(...series.flatMap(s => s.values)), {top, step} = nice(max * 1.05);
  const X = i => m.l + (labels.length === 1 ? iw / 2 : i * iw / (labels.length - 1)), Y = v => m.t + ih - v / top * ih;
  for (let v = 0; v <= top + 1e-9; v += step) {
    el('line', {x1: m.l, x2: m.l + iw, y1: Y(v), y2: Y(v), stroke: v === 0 ? ink.axis : ink.grid, 'stroke-width': 1}, svg);
    txt(svg, m.l - 8, Y(v) + 4, fmt(v), {'text-anchor': 'end', class: 'tick'});
  }
  const every = Math.ceil(labels.length / 12);
  labels.forEach((l, i) => { if (i % every === 0) txt(svg, X(i), H - 8, l, {'text-anchor': 'middle', class: 'tick'}); });
  txt(svg, m.l - 36, m.t - 10, unit, {class: 'tick unit'});
  // Lines, then direct end labels nudged apart so they never collide.
  const ends = [];
  for (const s of series) {
    el('path', {d: s.values.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(''), fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': s.dash ? '5 4' : 'none'}, svg);
    const li = labelAt === 'peak' ? s.values.indexOf(Math.max(...s.values)) : s.values.length - 1; ends.push({s, y: Y(s.values[li])});
  }
  ends.sort((a, b) => a.y - b.y); for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;
  for (const e of ends) txt(svg, m.l + iw + 8, e.y + 4, e.s.short || e.s.name, {class: 'end-label'});
  // Crosshair layer: the reader aims at an x position, never at a 2px line.
  const hair = el('line', {y1: m.t, y2: m.t + ih, stroke: ink.secondary, 'stroke-width': 1, opacity: 0}, svg);
  const dots = series.map(s => el('circle', {r: 4, fill: s.color, stroke: ink.surface, 'stroke-width': 2, opacity: 0}, svg));
  const hit = el('rect', {x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent', tabindex: 0}, svg);
  const at = (i, ev) => {
    hair.setAttribute('x1', X(i)); hair.setAttribute('x2', X(i)); hair.setAttribute('opacity', .6);
    series.forEach((s, k) => { dots[k].setAttribute('cx', X(i)); dots[k].setAttribute('cy', Y(s.values[i])); dots[k].setAttribute('opacity', 1); });
    const box = svg.getBoundingClientRect(), sx = box.left + X(i) / W * box.width, sy = ev?.clientY ?? box.top + box.height / 3;
    showTip(sx, sy, labels[i], [...series].sort((a, b) => b.values[i] - a.values[i]).map(s => ({value: fmt(s.values[i], digits) + ' ' + unit, label: s.name, color: s.color, dash: s.dash})));
  };
  const off = () => { hair.setAttribute('opacity', 0); dots.forEach(d => d.setAttribute('opacity', 0)); hideTip(); };
  let focusI = 0;
  hit.addEventListener('pointermove', ev => { const b = svg.getBoundingClientRect(), x = (ev.clientX - b.left) / b.width * W; focusI = Math.max(0, Math.min(labels.length - 1, Math.round((x - m.l) / iw * (labels.length - 1)))); at(focusI, ev); });
  hit.addEventListener('pointerleave', off); hit.addEventListener('blur', off);
  hit.addEventListener('focus', () => at(focusI));
  hit.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { focusI = Math.max(0, Math.min(labels.length - 1, focusI + (e.key === 'ArrowRight' ? 1 : -1))); at(focusI); e.preventDefault(); } });
  legend(host, series);
}

// Single-series bar chart with per-bar hover and values above bars.
export function barChart(host, {labels, values, color, unit, digits = 1, note}) {
  const W = Math.max(280, host.clientWidth || 420), H = 230, m = {l: 40, r: 10, t: 24, b: 28};
  const svg = frame(host, W, H), iw = W - m.l - m.r, ih = H - m.t - m.b;
  const {top, step} = nice(Math.max(...values) * 1.1);
  const Y = v => m.t + ih - v / top * ih, bw = Math.min(56, iw / labels.length * .5);
  for (let v = 0; v <= top + 1e-9; v += step) { el('line', {x1: m.l, x2: m.l + iw, y1: Y(v), y2: Y(v), stroke: v === 0 ? ink.axis : ink.grid}, svg); txt(svg, m.l - 8, Y(v) + 4, fmt(v), {'text-anchor': 'end', class: 'tick'}); }
  txt(svg, m.l - 32, m.t - 12, unit, {class: 'tick unit'});
  labels.forEach((l, i) => {
    const cx = m.l + (i + .5) * iw / labels.length, x = cx - bw / 2, h = Math.max(0, Y(0) - Y(values[i])), r = Math.min(4, h);
    // Rounded data end, square baseline.
    el('path', {d: `M${x} ${Y(0)}V${Y(values[i]) + r}Q${x} ${Y(values[i])} ${x + r} ${Y(values[i])}H${x + bw - r}Q${x + bw} ${Y(values[i])} ${x + bw} ${Y(values[i]) + r}V${Y(0)}Z`, fill: color, class: 'bar'}, svg);
    txt(svg, cx, Y(values[i]) - 6, fmt(values[i], digits) + '%', {'text-anchor': 'middle', class: 'bar-label'});
    txt(svg, cx, H - 8, l, {'text-anchor': 'middle', class: 'tick'});
    const hit = el('rect', {x: cx - iw / labels.length / 2, y: m.t, width: iw / labels.length, height: ih, fill: 'transparent', tabindex: 0}, svg);
    const on = ev => { const b = svg.getBoundingClientRect(); showTip(ev?.clientX ?? b.left + cx / W * b.width, ev?.clientY ?? b.top + Y(values[i]) / H * b.height, l, [{value: fmt(values[i], digits) + '%', label: note}]); };
    hit.addEventListener('pointermove', on); hit.addEventListener('focus', () => on()); hit.addEventListener('pointerleave', hideTip); hit.addEventListener('blur', hideTip);
  });
}

// Scatter: neutral dots with a direct label each, the highlighted point in the accent colour.
export function scatter(host, {points, xLabel, yLabel, accent, corner = 'Better ↗', xName = 'less cooling', yName = 'daylight (sDA)', ySuffix = '%'}) {
  const W = Math.max(320, host.clientWidth || 560), H = 320, m = {l: 48, r: 24, t: 30, b: 40};
  const svg = frame(host, W, H), iw = W - m.l - m.r, ih = H - m.t - m.b;
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const xMax = nice(Math.max(...xs) * 1.15), yLo = Math.max(0, Math.floor((Math.min(...ys) - 8) / 10) * 10), yHi = Math.min(100, Math.ceil((Math.max(...ys) + 5) / 10) * 10);
  const X = v => m.l + v / xMax.top * iw, Y = v => m.t + ih - (v - yLo) / (yHi - yLo) * ih;
  for (let v = yLo; v <= yHi; v += 10) { el('line', {x1: m.l, x2: m.l + iw, y1: Y(v), y2: Y(v), stroke: v === yLo ? ink.axis : ink.grid}, svg); txt(svg, m.l - 8, Y(v) + 4, fmt(v), {'text-anchor': 'end', class: 'tick'}); }
  for (let v = 0; v <= xMax.top + 1e-9; v += xMax.step) { txt(svg, X(v), m.t + ih + 16, fmt(v), {'text-anchor': 'middle', class: 'tick'}); }
  txt(svg, m.l + iw, H - 4, xLabel, {'text-anchor': 'end', class: 'tick unit'});
  txt(svg, m.l - 40, m.t - 14, yLabel, {class: 'tick unit'});
  // Better corner label.
  txt(svg, m.l + iw - 4, corner.includes('↘') ? m.t + ih - 8 : m.t + 12, corner, {'text-anchor': 'end', class: 'tick corner'});
  const boxes = points.map(p => ({x: X(p.x) - 8, y: Y(p.y) - 8, w: 16, h: 16}));
  const hits = (b) => boxes.some(q => b.x < q.x + q.w && b.x + b.w > q.x && b.y < q.y + q.h && b.y + b.h > q.y);
  for (const p of points) {
    const cx = X(p.x), cy = Y(p.y), hi = p.highlight;
    el('circle', {cx, cy, r: hi ? 7 : 5, fill: hi ? accent : '#6f7d74', stroke: ink.surface, 'stroke-width': 2}, svg);
  }
  for (const p of points) {
    const cx = X(p.x), cy = Y(p.y), hi = p.highlight, w = p.label.length * (hi ? 7 : 6.4) + 4, h = 14;
    const spots = [[cx + 10, cy + 4, 'start'], [cx - w / 2, cy - 12, 'start'], [cx - w / 2, cy + 22, 'start'], [cx - 10 - w, cy + 4, 'start'], [cx + 10, cy - 12, 'start'], [cx + 10, cy + 20, 'start'], [cx + 10, cy - 26, 'start'], [cx + 10, cy + 34, 'start']];
    let pick = spots.find(([x, y]) => x >= m.l && x + w <= W - 2 && !hits({x, y: y - 11, w, h})) || spots[0];
    boxes.push({x: pick[0], y: pick[1] - 11, w, h});
    txt(svg, pick[0], pick[1], p.label, {class: hi ? 'pt-label hi' : 'pt-label'});
  }
  for (const p of points) {
    const cx = X(p.x), cy = Y(p.y);
    const hit = el('circle', {cx, cy, r: 14, fill: 'transparent', tabindex: 0}, svg);
    const on = ev => { const b = svg.getBoundingClientRect(); showTip(ev?.clientX ?? b.left + cx / W * b.width, ev?.clientY ?? b.top + cy / H * b.height, p.label, [{value: fmt(p.x, 1) + '%', label: xName}, {value: fmt(p.y) + ySuffix, label: yName}, ...(p.extra || [])]); };
    hit.addEventListener('pointermove', on); hit.addEventListener('focus', () => on()); hit.addEventListener('pointerleave', hideTip); hit.addEventListener('blur', hideTip);
  }
}

// Score matrix: one hue, light to dark (sequential), value printed in every cell.
const ramp = ['#eef8f2', '#cdeedb', '#9adcb5', '#4fbf7f', '#1a8f4c'];
export function scoreMatrix(host, {rows, cols}) {
  host.replaceChildren();
  const table = document.createElement('table'); table.className = 'score-matrix';
  const head = table.createTHead().insertRow(); const c0 = document.createElement('th'); c0.textContent = 'System'; head.appendChild(c0);
  for (const c of cols) { const th = document.createElement('th'); th.textContent = c.name; th.title = c.hint || ''; head.appendChild(th); }
  const body = table.createTBody();
  for (const r of rows) {
    const tr = body.insertRow(); const th = document.createElement('th'); th.scope = 'row'; const key = document.createElement('i'); key.className = 'row-key'; key.style.background = r.color; th.append(key, document.createTextNode(r.name)); tr.appendChild(th);
    r.scores.forEach((s, i) => {
      const td = tr.insertCell(); td.textContent = s.toFixed(0); td.style.background = ramp[Math.max(0, Math.min(4, Math.round(s) - 1))]; td.style.color = s >= 4.5 ? '#fff' : ink.primary; td.tabIndex = 0;
      const on = ev => { const b = td.getBoundingClientRect(); showTip(ev?.clientX ?? b.left + b.width / 2, ev?.clientY ?? b.top, r.name, [{value: s.toFixed(0) + ' / 5', label: cols[i].name}, ...(r.notes?.[i] ? [{value: r.notes[i]}] : [])]); };
      td.addEventListener('pointermove', on); td.addEventListener('focus', () => on()); td.addEventListener('pointerleave', hideTip); td.addEventListener('blur', hideTip);
    });
  }
  host.appendChild(table);
  const lg = document.createElement('div'); lg.className = 'chart-legend';
  lg.append(document.createTextNode('Score 1 (weak)'));
  for (const c of ramp) { const sw = document.createElement('i'); sw.className = 'ramp-step'; sw.style.background = c; lg.appendChild(sw); }
  lg.append(document.createTextNode('5 (strong)')); host.appendChild(lg);
}

// Horizontal bars, one row per item, each in its entity colour; value printed at the bar end in text ink.
export function hbar(host, {items, unit, digits = 0, note, refLine}) {
  const W = Math.max(300, host.clientWidth || 520), row = 30, m = {l: 150, r: 70, t: 22, b: 26}, H = m.t + m.b + row * items.length;
  const svg = frame(host, W, H), iw = W - m.l - m.r;
  const hi = Math.max(...items.map(i => i.value), refLine || 0), step = hi > 60 ? 20 : 10, top = Math.ceil(hi * 1.04 / step) * step;
  const X = v => m.l + v / top * iw;
  for (let v = 0; v <= top + 1e-9; v += step) { el('line', {x1: X(v), x2: X(v), y1: m.t - 4, y2: H - m.b, stroke: v === 0 ? ink.axis : ink.grid}, svg); txt(svg, X(v), H - 8, fmt(v), {'text-anchor': 'middle', class: 'tick'}); }
  txt(svg, m.l + iw + m.r - 4, H - 8, unit, {'text-anchor': 'end', class: 'tick unit'});
  items.forEach((it, i) => {
    const y = m.t + i * row + 6, h = row - 12, w = Math.max(0, X(it.value) - X(0)), r = Math.min(4, w);
    txt(svg, m.l - 10, y + h / 2 + 4, it.label, {'text-anchor': 'end', class: it.ref ? 'tick' : 'pt-label'});
    el('path', {d: `M${X(0)} ${y}H${X(0) + w - r}Q${X(0) + w} ${y} ${X(0) + w} ${y + r}V${y + h - r}Q${X(0) + w} ${y + h} ${X(0) + w - r} ${y + h}H${X(0)}Z`, fill: it.color, opacity: it.ref ? .55 : 1}, svg);
    txt(svg, X(0) + w + 6, y + h / 2 + 4, fmt(it.value, digits) + (it.suffix || ''), {class: 'bar-label'});
    const hit = el('rect', {x: 0, y: y - 6, width: W, height: row, fill: 'transparent', tabindex: 0}, svg);
    const on = ev => { const b = svg.getBoundingClientRect(); showTip(ev?.clientX ?? b.left + X(it.value) / W * b.width, ev?.clientY ?? b.top + y / H * b.height, it.label, [{value: fmt(it.value, digits) + ' ' + unit, label: note || ''}, ...(it.extra || [])]); };
    hit.addEventListener('pointermove', on); hit.addEventListener('focus', () => on()); hit.addEventListener('pointerleave', hideTip); hit.addEventListener('blur', hideTip);
  });
  if (refLine) { el('line', {x1: X(refLine), x2: X(refLine), y1: m.t - 8, y2: H - m.b, stroke: ink.secondary, 'stroke-dasharray': '4 3'}, svg); }
}

// Heat map: rows x columns, one hue light to dark (sequential), legend below.
export function heatmap(host, {rows, cols, values, unit, digits = 1, colEvery = 3}) {
  const W = Math.max(320, host.clientWidth || 640), m = {l: 40, r: 8, t: 8, b: 46}, cw = (W - m.l - m.r) / cols.length, ch = 17, H = m.t + m.b + ch * rows.length;
  const svg = frame(host, W, H), max = Math.max(...values.flat(), 1e-6);
  const seq = ['#f3faf6', '#d6f0e1', '#a8e0bf', '#6cc895', '#2fa565', '#14804a', '#0b5c34'];
  const col = v => seq[Math.min(seq.length - 1, Math.floor(v / max * (seq.length - .001)))];
  rows.forEach((r, i) => {
    txt(svg, m.l - 8, m.t + i * ch + ch / 2 + 4, r, {'text-anchor': 'end', class: 'tick'});
    cols.forEach((c, j) => {
      const v = values[i][j], x = m.l + j * cw, y = m.t + i * ch;
      const cell = el('rect', {x: x + .5, y: y + .5, width: cw - 1, height: ch - 1, rx: 2, fill: col(v), tabindex: 0}, svg);
      const on = ev => { const b = svg.getBoundingClientRect(); showTip(ev?.clientX ?? b.left + x / W * b.width, ev?.clientY ?? b.top + y / H * b.height, r + ' · ' + c, [{value: fmt(v, digits) + ' ' + unit}]); };
      cell.addEventListener('pointermove', on); cell.addEventListener('focus', () => on()); cell.addEventListener('pointerleave', hideTip); cell.addEventListener('blur', hideTip);
    });
  });
  cols.forEach((c, j) => { if (j % colEvery === 0) txt(svg, m.l + j * cw + cw / 2, m.t + rows.length * ch + 13, c, {'text-anchor': 'middle', class: 'tick'}); });
  const ly = H - 14, lw = 22;
  txt(svg, m.l, ly + 9, '0', {'text-anchor': 'end', class: 'tick', dx: -4});
  seq.forEach((c, k) => el('rect', {x: m.l + k * lw, y: ly, width: lw - 2, height: 10, rx: 2, fill: c}, svg));
  txt(svg, m.l + seq.length * lw + 4, ly + 9, fmt(max, digits) + ' ' + unit, {class: 'tick'});
}
