/* Hearth & Ledger — tiny canvas charts. No library: two small draw functions
   the views call with plain numbers. Colours are the site's own palette. */
'use strict';

const CHART_COLORS = [
  '#1d4d3b', '#c96f3f', '#d9a441', '#5b8a72', '#7a6aa8',
  '#4f7fa8', '#a8513f', '#8a9a5b', '#b07d4f', '#4a6b6f',
];

function money(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* Donut of spending by category. slices: [{label, value}]. */
function drawDonut(canvas, slices) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2, cy = size / 2, r = size / 2 - 8, hole = r * 0.58;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let angle = -Math.PI / 2;
  ctx.clearRect(0, 0, size, size);
  slices.forEach((s, i) => {
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
    ctx.fill();
    angle += sweep;
  });
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, hole, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#14382a';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(money(total), cx, cy - 10);
  ctx.fillStyle = '#6b7a72';
  ctx.font = '13px "Trebuchet MS", sans-serif';
  ctx.fillText('spent in Nov', cx, cy + 14);
}

/* Grouped bars: income vs spending for six months. rows: [{label, a, b}]. */
function drawMonthBars(canvas, rows) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, pad = 34;
  const max = Math.max.apply(null, rows.map((r) => Math.max(r.a, r.b))) * 1.08;
  const slot = (W - pad * 2) / rows.length;
  const bw = Math.min(26, slot / 3);
  ctx.clearRect(0, 0, W, H);
  ctx.font = '12px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  rows.forEach((r, i) => {
    const x = pad + slot * i + slot / 2;
    const ha = (r.a / max) * (H - pad * 2 - 18);
    const hb = (r.b / max) * (H - pad * 2 - 18);
    ctx.fillStyle = '#1d4d3b';
    ctx.fillRect(x - bw - 2, H - pad - ha, bw, ha);
    ctx.fillStyle = '#c96f3f';
    ctx.fillRect(x + 2, H - pad - hb, bw, hb);
    ctx.fillStyle = '#22302a';
    ctx.fillText(r.label, x, H - 14);
  });
  ctx.fillStyle = '#6b7a72';
  ctx.textAlign = 'left';
  ctx.fillText('Income', pad, 16);
  ctx.fillStyle = '#1d4d3b';
  ctx.fillRect(pad + 52, 6, 12, 12);
  ctx.fillStyle = '#6b7a72';
  ctx.fillText('Spending', pad + 110, 16);
  ctx.fillStyle = '#c96f3f';
  ctx.fillRect(pad + 172, 6, 12, 12);
}
