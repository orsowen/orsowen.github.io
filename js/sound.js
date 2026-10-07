/* ===========================================================
   sound.js — all sound effects, the boot jingles and the calm lo-fi music, generated live with the Web Audio API
   =========================================================== */
const SFX = (() => {
  let ac = null, master = null, muted = false, started = false, nbuf = null, musicOn = false, tvBus = null, musicGate = null, hissG = null, gate = { tv: true, con: true };
  try { muted = localStorage.getItem("snd") === "off"; } catch (e) {}
  function ctx() {
    try {
      if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ac = new AC(); master = ac.createGain(); master.gain.value = muted ? 0 : .55; master.connect(ac.destination); }
      if (ac.state === "suspended") ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
  function tone(f, d, type, vol, to, delay) {
    const c = ctx(); if (!c) return;
    const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || "square"; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    env(g, t, .005, vol || .1, d); o.connect(g).connect(master); o.start(t); o.stop(t + d + .05);
  }
  function noise(d, freq, q, vol, type) {
    const c = ctx(); if (!c) return;
    if (!nbuf) { nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = nbuf.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
    const t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = nbuf; f.type = type || "bandpass"; f.frequency.value = freq; f.Q.value = q;
    env(g, t, .004, vol, d); s.connect(f).connect(g).connect(master); s.start(t, Math.random() * .5); s.stop(t + d + .05);
  }
  function buses() {
    const c = ctx(); if (!c) return null;
    if (!tvBus) {
      tvBus = c.createGain(); tvBus.connect(master);
      musicGate = c.createGain(); musicGate.connect(tvBus);
      hissG = c.createGain(); hissG.gain.value = 0; hissG.connect(tvBus);
      if (!nbuf) { nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = nbuf.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
      const hs = c.createBufferSource(), hf = c.createBiquadFilter(); hs.buffer = nbuf; hs.loop = true; hf.type = "bandpass"; hf.frequency.value = 3200; hf.Q.value = .5;
      hs.connect(hf).connect(hissG); hs.start();
      applyGate();
    }
    return c;
  }
  function applyGate() {
    if (!tvBus) return;
    const t = ac.currentTime;
    tvBus.gain.setTargetAtTime(gate.tv ? 1 : 0, t, .04);
    musicGate.gain.setTargetAtTime(gate.con ? 1 : 0, t, .15);
    hissG.gain.setTargetAtTime(gate.con ? 0 : .07, t, .04);
  }
  function hum() {
    const c = ctx(); if (!c) return;
    buses();
    const g = c.createGain(); g.gain.value = .01; g.connect(tvBus);
    const o1 = c.createOscillator(); o1.frequency.value = 60; o1.connect(g); o1.start();
    const o2 = c.createOscillator(), g2 = c.createGain(); o2.frequency.value = 120; g2.gain.value = .45; o2.connect(g2).connect(g); o2.start();
  }
  function music() {
    const c = ctx(); if (!c) return;
    const bus = c.createGain(), lp = c.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 2000; lp.Q.value = .4;
    bus.gain.setValueAtTime(0, c.currentTime); bus.gain.linearRampToValueAtTime(.22, c.currentTime + 4);
    buses();
    bus.connect(lp).connect(musicGate);
    // vinyl crackle
    const len = c.sampleRate * 3, cb = c.createBuffer(1, len, c.sampleRate), d = cb.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * .015 + (Math.random() < .0005 ? (Math.random() * 2 - 1) * .5 : 0);
    const cr = c.createBufferSource(), hp = c.createBiquadFilter(), cg = c.createGain();
    cr.buffer = cb; cr.loop = true; hp.type = "highpass"; hp.frequency.value = 900; cg.gain.value = .35;
    cr.connect(hp).connect(cg).connect(bus); cr.start();
    const mtof = n => 440 * Math.pow(2, (n - 69) / 12), BEAT = 60 / 70;
    const chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], roots = [41, 40, 38, 36];
    const mel = [72, 74, 76, 79, 81, 84];
    function keys(n, t, dur, vol) {
      const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain();
      o.type = "sine"; o2.type = "triangle"; o.frequency.value = mtof(n); o2.frequency.value = mtof(n) * 2.003; g2.gain.value = .1;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .04); g.gain.exponentialRampToValueAtTime(vol * .35, t + .9); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); o2.connect(g2).connect(g); g.connect(bus); o.start(t); o2.start(t); o.stop(t + dur + .1); o2.stop(t + dur + .1);
    }
    function bass(n, t, dur) {
      const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = mtof(n);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(bus); o.start(t); o.stop(t + dur + .1);
    }
    function kick(t) {
      const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(100, t); o.frequency.exponentialRampToValueAtTime(42, t + .16);
      g.gain.setValueAtTime(.22, t); g.gain.exponentialRampToValueAtTime(.0001, t + .32); o.connect(g).connect(bus); o.start(t); o.stop(t + .35);
    }
    function hat(t) {
      if (!nbuf) return;
      const sN = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); sN.buffer = nbuf; f.type = "highpass"; f.frequency.value = 7000;
      g.gain.setValueAtTime(.035, t); g.gain.exponentialRampToValueAtTime(.0001, t + .06); sN.connect(f).connect(g).connect(bus); sN.start(t, Math.random() * .5); sN.stop(t + .08);
    }
    function bell(n, t) {
      const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = mtof(n);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.045, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4);
      o.connect(g).connect(bus); o.start(t); o.stop(t + 1.5);
    }
    if (!nbuf) { nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = nbuf.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
    let next = c.currentTime + .3, step = 0, last = 76;
    function schedule() {
      while (next < c.currentTime + .6) {
        const bar = Math.floor(step / 8) % 4, s8 = step % 8;
        if (s8 === 0) chords[bar].forEach((n, k) => keys(n, next + k * .025, BEAT * 4, .06));
        if (s8 === 0 || s8 === 5) bass(roots[bar], next, BEAT * 1.6);
        if (s8 === 0 || s8 === 4) kick(next);
        if (s8 === 2 || s8 === 6) hat(next);
        if (s8 % 2 === 1 && Math.random() < .3) { const i = Math.max(0, Math.min(mel.length - 1, mel.indexOf(last) + (Math.random() < .5 ? -1 : 1))); last = mel[i]; bell(last, next); }
        next += BEAT / 2; step++;
      }
    }
    schedule(); setInterval(schedule, 120);
  }
  const api = {
    press() { noise(.03, 2400, 1, .22, "highpass"); tone(150, .06, "sine", .25, 70); },
    blip() { tone(880, .07, "square", .05, 1320); },
    tick() { tone(1600, .03, "square", .035); },
    chime() { tone(660, .12, "triangle", .12); tone(990, .22, "triangle", .12, null, .1); },
    zap() { tone(520, .09, "sine", .05, 780); },
    power() { tone(52, .45, "sine", .35, 30); noise(.5, 700, .5, .07, "lowpass"); tone(300, .6, "sine", .025, 2400, .05); },
    start() { if (started) return; started = true; if (!ctx()) return; hum(); api.power(); },
    load() {
      const c = ctx(); if (!c) return;
      const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
      noise(.5, 1800, .8, .07);
      [67, 72, 76].forEach((n, i) => tone(mtof(n), .6, "sine", .06, null, .2 + i * .14));
      [79, 84].forEach(n => tone(mtof(n), 1.1, "triangle", .045, null, 1.55));
    },
    key() { noise(.012, 3800, 1.5, .05); },
    logo() {
      const c = ctx(); if (!c) return;
      const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
      noise(.45, 2500, .7, .08);
      [72, 76, 79, 84].forEach((n, i) => tone(mtof(n), .7, "sine", .07, null, .1 + i * .1));
      [79, 84, 91].forEach(n => tone(mtof(n), 1.3, "triangle", .05, null, .55));
    },
    shimmer() {
      const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
      [72, 74, 76, 79, 81, 84, 86, 88].forEach((n, i) => tone(mtof(n), .5, "sine", .045, null, i * .16));
      [60, 64, 67, 71].forEach(n => tone(mtof(n), 1.6, "triangle", .05, null, 1.45));
    },
    tock() { tone(260 + Math.random() * 60, .05, "square", .03, 140); },
    clear() { noise(.25, 5000, .6, .09); [784, 988, 1175].forEach((f, i) => tone(f, .14, "square", .05, null, i * .06)); },
    ready() { tone(880, .1, "square", .07); tone(1320, .22, "square", .07, null, .16); },
    gate(tv, con) { gate = { tv, con }; if (ctx()) { buses(); applyGate(); } },
    click() { noise(.025, 2000, 1, .25, "highpass"); tone(120, .05, "sine", .25, 60); },
    crtOff() { tone(1400, .3, "sine", .05, 80); tone(70, .25, "sine", .3, 35); },
    discUp() {
      const c = ctx(); if (!c) return;
      const t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(30, t); o.frequency.exponentialRampToValueAtTime(380, t + 1.5);
      f.type = "lowpass"; f.frequency.value = 900; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .3); g.gain.setValueAtTime(.05, t + 1.5); g.gain.exponentialRampToValueAtTime(.0001, t + 2.2);
      o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + 2.3);
      [.5, .72, .9, 1.15, 1.3, 1.55].forEach(d => setTimeout(() => noise(.02, 4200, 2, .07), d * 1000));
      tone(660, .14, "triangle", .1, null, 1.95); tone(990, .3, "triangle", .1, null, 2.07);
    },
    discDown() {
      const c = ctx(); if (!c) return;
      const t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(25, t + 1.3);
      f.type = "lowpass"; f.frequency.value = 900; g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4);
      o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + 1.5);
    },
    over() { [523, 440, 349, 262].forEach((f, i) => tone(f, .32, "triangle", .1, null, i * .18)); tone(130, .7, "sine", .12, 65, .72); },
    level() { [659, 784, 988, 1319].forEach((f, i) => tone(f, .16, "square", .04, null, i * .07)); },
    music() { if (musicOn) return; musicOn = true; if (ctx()) music(); },
    boot() {
      const c = ctx(); if (!c) return;
      const t0 = c.currentTime + .15, mtof = n => 440 * Math.pow(2, (n - 69) / 12);
      // rising whoosh
      if (!nbuf) { nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = nbuf.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
      const w = c.createBufferSource(), wf = c.createBiquadFilter(), wg = c.createGain();
      w.buffer = nbuf; wf.type = "bandpass"; wf.Q.value = 1.2; wf.frequency.setValueAtTime(300, t0); wf.frequency.exponentialRampToValueAtTime(4000, t0 + .9);
      wg.gain.setValueAtTime(.0001, t0); wg.gain.exponentialRampToValueAtTime(.12, t0 + .5); wg.gain.exponentialRampToValueAtTime(.0001, t0 + 1);
      w.connect(wf).connect(wg).connect(master); w.start(t0); w.stop(t0 + 1.05);
      // warm pad swell
      [60, 64, 67, 71].forEach(n => {
        const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = mtof(n);
        g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.06, t0 + .9); g.gain.exponentialRampToValueAtTime(.0001, t0 + 3.2);
        o.connect(g).connect(master); o.start(t0); o.stop(t0 + 3.3);
      });
      // sparkling arpeggio, then a final chime
      [72, 76, 79, 84, 88].forEach((n, i) => tone(mtof(n), .9, "sine", .07, null, .95 + i * .13));
      [79, 84, 91].forEach(n => tone(mtof(n), 1.4, "triangle", .05, null, 2.75));
    },
    toggle() { muted = !muted; ctx(); if (master) master.gain.setTargetAtTime(muted ? 0 : .55, ac.currentTime, .05); try { localStorage.setItem("snd", muted ? "off" : "on"); } catch (e) {} return muted; },
    get muted() { return muted; }
  };
  return api;
})();
function paintSound() {
  document.querySelectorAll('[data-act="sound"]').forEach(b => {
    b.classList.toggle("off", SFX.muted); b.setAttribute("aria-pressed", String(b.matches(".snd-btn-panel,.rbtn") ? SFX.muted : !SFX.muted));
    
  });
}
