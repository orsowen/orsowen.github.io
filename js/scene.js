/* ===========================================================
   scene.js — fills the room: bookshelf items, game spines in the TV cabinet, live wall clock
   =========================================================== */
(function buildShelf() {
  const NS = "http://www.w3.org/2000/svg", g = document.getElementById("shelfItems");
  if (!g) return;
  const el = (n, a, parent) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); (parent || g).appendChild(e); return e; };
  let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const cols = ["#8e3b33", "#2a5d9c", "#d9a53a", "#3c8c5a", "#6b4e8a", "#c26b3c", "#2f6f73", "#cfc6b2", "#3a3f4a", "#a33a5a"];
  function book(x, base, w, h, c, rot) {
    const grp = el("g", rot ? { transform: `rotate(${rot} ${x + w} ${base})` } : {});
    el("rect", { x, y: base - h, width: w, height: h, fill: c, rx: 1 }, grp);
    el("rect", { x, y: base - h, width: w, height: h, fill: "url(#spine)" }, grp);
    if (rnd() > .35) { el("rect", { x, y: base - h + 8, width: w, height: 2, fill: "#e8c56a", opacity: .8 }, grp); el("rect", { x, y: base - 12, width: w, height: 2, fill: "#e8c56a", opacity: .8 }, grp); }
    if (rnd() > .5) el("rect", { x: x + w * .25, y: base - h * .62, width: w * .5, height: h * .22, fill: "#f4efe2", opacity: .75 }, grp);
    el("rect", { x, y: base - 3, width: w, height: 3, fill: "#000", opacity: .35 }, grp);
  }
  function books(x0, x1, base, maxH, lean) {
    let x = x0;
    while (true) {
      const w = 11 + rnd() * 12, h = maxH * (.7 + rnd() * .3), c = cols[Math.floor(rnd() * cols.length)];
      if (x + w > x1) break;
      book(x, base, w, h, c, 0); x += w + .8;
    }
    if (lean) book(x + 2, base, 13, maxH * .85, cols[Math.floor(rnd() * cols.length)], 14);
  }
  // shelf 1: books + trophy
  books(66, 196, 676, 122, true);
  el("ellipse", { cx: 246, cy: 675, rx: 26, ry: 3, fill: "#000", opacity: .5 });
  el("rect", { x: 228, y: 662, width: 36, height: 14, fill: "#2a1d14" }); el("rect", { x: 228, y: 662, width: 36, height: 3, fill: "#5a4030" });
  el("rect", { x: 241, y: 646, width: 10, height: 16, fill: "url(#gold)" });
  el("path", { d: "M224 600 h44 q0 40 -22 46 q-22 -6 -22 -46 Z", fill: "url(#gold)" });
  el("path", { d: "M224 606 q-12 0 -12 12 q0 12 14 14", fill: "none", stroke: "url(#gold)", "stroke-width": 4 });
  el("path", { d: "M268 606 q12 0 12 12 q0 12 -14 14", fill: "none", stroke: "url(#gold)", "stroke-width": 4 });
  el("ellipse", { cx: 246, cy: 600, rx: 22, ry: 4, fill: "#8a6312" });
  el("path", { d: "M232 606 q2 24 10 32", fill: "none", stroke: "#fff", "stroke-opacity": .55, "stroke-width": 3 });
  // shelf 2: books + framed pool photo
  books(66, 206, 836, 128, false);
  el("rect", { x: 222, y: 772, width: 60, height: 64, fill: "#000", opacity: .45, filter: "url(#wBlur2)" });
  el("rect", { x: 218, y: 768, width: 58, height: 66, fill: "#1b1410" }); el("rect", { x: 218, y: 768, width: 58, height: 3, fill: "#4a3a2e" });
  el("rect", { x: 224, y: 774, width: 46, height: 54, fill: "url(#pool)" });
  for (let k = 0; k < 4; k++) el("rect", { x: 230 + k * 11, y: 774, width: 1.5, height: 54, fill: "#fff", opacity: .7 });
  el("path", { d: "M224 790 l46 -10", stroke: "#fff", "stroke-opacity": .2, "stroke-width": 10 });
  // shelf 3: game boxes + robot toy
  [["#c9442b", 0], ["#1f6fb2", 5], ["#3c8c5a", -3], ["#d9a53a", 2], ["#6b4e8a", 4]].forEach(([c, dx], k) => {
    const y = 980 - k * 18;
    el("rect", { x: 70 + dx, y, width: 124, height: 17, fill: c }); el("rect", { x: 70 + dx, y, width: 124, height: 17, fill: "url(#spine)", transform: `rotate(90 ${132 + dx} ${y + 8.5})`, opacity: .0 });
    el("rect", { x: 70 + dx, y, width: 124, height: 3, fill: "#fff", opacity: .22 }); el("rect", { x: 70 + dx, y: y + 14, width: 124, height: 3, fill: "#000", opacity: .35 });
    el("rect", { x: 80 + dx, y: y + 6, width: 46, height: 5, fill: "#fff", opacity: .6 });
  });
  el("ellipse", { cx: 248, cy: 995, rx: 22, ry: 3, fill: "#000", opacity: .5 });
  el("rect", { x: 236, y: 978, width: 24, height: 18, rx: 2, fill: "#8d929c" }); el("rect", { x: 236, y: 978, width: 24, height: 18, rx: 2, fill: "url(#spine)" });
  el("rect", { x: 232, y: 944, width: 32, height: 34, rx: 5, fill: "#c3c7cf" }); el("rect", { x: 232, y: 944, width: 32, height: 34, rx: 5, fill: "url(#spine)" });
  el("rect", { x: 238, y: 952, width: 20, height: 10, rx: 2, fill: "#14161b" });
  el("circle", { cx: 243, cy: 957, r: 2.2, fill: "#6ff3ff" }); el("circle", { cx: 253, cy: 957, r: 2.2, fill: "#6ff3ff" });
  el("rect", { x: 246, y: 932, width: 4, height: 12, fill: "#8d929c" }); el("circle", { cx: 248, cy: 930, r: 3.5, fill: "#ff6fd1" });
  el("rect", { x: 226, y: 954, width: 6, height: 16, rx: 3, fill: "#8d929c" }); el("rect", { x: 264, y: 954, width: 6, height: 16, rx: 3, fill: "#8d929c" });
  // shelf 4: books + woven basket
  books(66, 178, 1156, 122, true);
  el("ellipse", { cx: 238, cy: 1155, rx: 44, ry: 4, fill: "#000", opacity: .5 });
  el("path", { d: "M196 1104 h84 l-7 52 h-70 Z", fill: "#b08454" });
  for (let k = 0; k < 6; k++) el("rect", { x: 197 + k * .6, y: 1110 + k * 8, width: 82 - k * 1.2, height: 2, fill: "#7a5a34", opacity: .8 });
  for (let k = 0; k < 9; k++) el("rect", { x: 202 + k * 9, y: 1104, width: 1.5, height: 52, fill: "#7a5a34", opacity: .45 });
  el("rect", { x: 194, y: 1100, width: 88, height: 6, rx: 2, fill: "#c79a66" });
  el("path", { d: "M204 1104 l6 52", stroke: "#fff", "stroke-opacity": .15, "stroke-width": 6 });
  // bottom: fabric bins
  [[68, "#3a4a6a"], [176, "#6a3a3a"]].forEach(([x, c]) => {
    el("rect", { x, y: 1184, width: 104, height: 52, fill: c }); el("rect", { x, y: 1184, width: 104, height: 52, fill: "url(#spine)", opacity: .6 });
    el("rect", { x, y: 1184, width: 104, height: 4, fill: "#fff", opacity: .12 }); el("rect", { x: x + 34, y: 1196, width: 36, height: 9, rx: 4.5, fill: "#000", opacity: .45 });
  });
})();
(function buildGames() {
  const NS = "http://www.w3.org/2000/svg", g = document.getElementById("games");
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); g.appendChild(e); return e; };
  const G = [["STAR CIRCUIT", "#b8352a"], ["PIXEL QUEST", "#1f6fb2"], ["NEON RUN", "#7d3c98"], ["DUNE DRIFT", "#c97f2a"], ["ROBO LEAGUE", "#2e7d4f"], ["SKY FORGE", "#3b4f63"],
             ["DEEP REEF", "#13908f"], ["TURBO KART", "#c9442b"], ["MOON BASE", "#55557f"], ["GHOST GRID", "#26262b"], ["OASIS", "#b8902f"]];
  let x = 80;
  G.forEach(([t, c], i) => {
    const h = 132 + (i % 3) * 9, y = 234 - h;
    el("rect", { x, y, width: 20, height: h, fill: c });
    el("rect", { x, y, width: 20, height: 12, fill: "#000", opacity: .35 });
    el("rect", { x, y, width: 3, height: h, fill: "#fff", opacity: .2 });
    el("rect", { x: x + 16, y, width: 4, height: h, fill: "#000", opacity: .3 });
    const tx = el("text", { x: x + 14, y: y + h - 10, transform: `rotate(-90 ${x + 14} ${y + h - 10})`, "font-family": "ui-monospace, monospace", "font-size": 8.5, "font-weight": 700, fill: "#f2efe8", "letter-spacing": 1 });
    tx.textContent = t;
    x += 23;
  });
  [["#2a5d9c", 0], ["#a33a3a", 6], ["#d9a53a", -4], ["#3c8c5a", 3]].forEach(([c, dx], i) => {
    const y = 216 - i * 19;
    el("polygon", { points: `${336 + dx},${y} ${484 + dx},${y} ${478 + dx},${y - 5} ${342 + dx},${y - 5}`, fill: c, opacity: .75 });
    el("rect", { x: 336 + dx, y, width: 148, height: 18, fill: c });
    el("rect", { x: 336 + dx, y, width: 148, height: 3, fill: "#fff", opacity: .18 });
    el("rect", { x: 336 + dx, y: y + 15, width: 148, height: 3, fill: "#000", opacity: .3 });
    el("rect", { x: 346 + dx, y: y + 6, width: 60, height: 5, fill: "#fff", opacity: .55 });
  });
})();
(function liveClock() {
  const h = document.getElementById("clkH"), m = document.getElementById("clkM"), sc = document.getElementById("clkS");
  if (!h) return;
  function tick() {
    const d = new Date(), s = d.getSeconds(), mi = d.getMinutes() + s / 60, hr = (d.getHours() % 12) + mi / 60;
    h.setAttribute("transform", `rotate(${hr * 30} 470 250)`);
    m.setAttribute("transform", `rotate(${mi * 6} 470 250)`);
    sc.setAttribute("transform", `rotate(${s * 6} 470 250)`);
  }
  tick(); setInterval(tick, 1000);
})();
