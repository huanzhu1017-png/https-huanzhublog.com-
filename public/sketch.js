// Hand-drawn chart helpers shared by every case page.
const NS = "http://www.w3.org/2000/svg";
const C = { ink:"#1E2328", pencil:"#5B6066", blue:"#2A4C8C", red:"#B0412B", green:"#3C7A4A", hl:"#FCEB7A" };

function el(tag, attrs, parent, text){
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}

// Seeded random so a chart wobbles the same way every time it redraws.
function rng(seed){
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => (s = s * 16807 % 2147483647) / 2147483647 - .5;
}

function wobblePath(pts, amp, seed, close){
  const r = rng(seed);
  const q = pts.map(([x, y]) => [x + r() * amp, y + r() * amp]);
  let d = `M${q[0][0].toFixed(1)},${q[0][1].toFixed(1)}`;
  for (let i = 1; i < q.length; i++){
    const [x0, y0] = q[i-1], [x1, y1] = q[i];
    const mx = (x0 + x1) / 2 + r() * amp * 1.4, my = (y0 + y1) / 2 + r() * amp * 1.4;
    d += ` Q${mx.toFixed(1)},${my.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return close ? d + " Z" : d;
}

// A pencil stroke: one main line plus a faint second pass.
function pen(svg, pts, o = {}){
  const seed = o.seed || 7, amp = o.amp ?? 1.6, w = o.w || 1.8, stroke = o.stroke || C.ink;
  el("path", { d: wobblePath(pts, amp, seed, o.close), fill: o.fill || "none", stroke, "stroke-width": w,
    "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": o.dash || "" }, svg);
  if (!o.single) el("path", { d: wobblePath(pts, amp, seed + 91, o.close), fill: "none", stroke,
    "stroke-width": w * .6, opacity: .45, "stroke-linecap": "round" }, svg);
}

function hatchDefs(svg){
  const defs = el("defs", {}, svg);
  [["hb", C.blue], ["hg", C.green], ["hr", C.red], ["hp", C.pencil]].forEach(([id, c]) => {
    const p = el("pattern", { id: svg.id + id, width: 7, height: 7, patternUnits: "userSpaceOnUse", patternTransform: "rotate(40)" }, defs);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 7, stroke: c, "stroke-width": 1.6, opacity: .75 }, p);
  });
}

// A hatched box, like a bar shaded in with a pencil.
function box(svg, x, y, w, h, color, pid, seed){
  const root = svg.ownerSVGElement || svg;
  el("rect", { x: x + 1, y: y + 1, width: Math.max(0, w - 2), height: Math.max(0, h - 2), fill: `url(#${root.id}${pid})` }, svg);
  pen(svg, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], { stroke: color, w: 1.8, seed, amp: 1.2, single: true });
}
