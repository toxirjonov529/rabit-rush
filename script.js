'use strict';
/* ============ DATA ============ */
const RAW = {
  1: "apple:olma,book:kitob,water:suv,house:uy,cat:mushuk,dog:it,school:maktab,happy:xursand,tree:daraxt,sun:quyosh,moon:oy,star:yulduz,flower:gul,bird:qush,fish:baliq,food:ovqat,milk:sut,bread:non,friend:do'st,family:oila",
  2: "computer:kompyuter,beautiful:chiroyli,morning:ertalab,journey:sayohat,friendly:do'stona,village:qishloq,window:deraza,garden:bog',teacher:o'qituvchi,student:talaba,language:til,answer:javob,question:savol,important:muhim,remember:eslamoq,discover:kashf,practice:mashq,improve:yaxshilamoq,market:bozor,country:mamlakat",
  3: "knowledge:bilim,adventure:sarguzasht,experience:tajriba,technology:texnologiya,opportunity:imkoniyat,environment:atrof-muhit,responsibility:masuliyat,communication:muloqot,development:rivojlanish,successful:muvaffaqiyatli,imagination:tasavvur,independent:mustaqil,achievement:yutuq,concentration:diqqat,creativity:ijodkorlik,pronunciation:talaffuz,vocabulary:so‘z-boyligi,confidence:ishonch,education:ta'lim,challenge:sinov",
  4: "travel:sayohat,city:shahar,evening:kechqurun,summer:yoz,winter:qish,autumn:kuz,spring:bahor,breakfast:nonushta,dinner:kechki-ovqat,library:kutubxona,airport:aeroport,station:bekat,doctor:shifokor,nurse:hamshira,engineer:muhandis,programmer:dasturchi,website:veb-sayt,keyboard:klaviatura,screen:ekran,mouse:sichqoncha",
  5: "wonderful:ajoyib,solution:yechim,curiosity:qiziquvchanlik,impossible:imkonsiz,possibility:imkoniyat,successful:muvaffaqiyatli,carefully:ehtiyotkorlik-bilan,knowledgeable:bilimli,delicious:mazali,comfortable:qulay,adventure:sarguzasht,attention:e'tibor,especially:ayniqsa,immediately:darhol,improvement:yaxshilanish,conversation:suhbat,information:ma'lumot,achievement:yutuq,imagination:tasavvur,opinion:fikr"
};
const WORDS = {};
for (const k in RAW) WORDS[k] = RAW[k].split(',').map(s => s.trim().split(':').map(x => x.trim())).filter(pair => pair.length === 2 && pair[0] && pair[1]);

const T = {
  uz: { play: "O'YNASH", how: "QANDAY O'YNALADI", set: "SOZLAMALAR", best: "ENG YUQORI BALL", score: "BALL", height: "BALANDLIK", words: "SO'ZLAR", wpm: "WPM", acc: "ANIQLIK", coins: "TANGA", streak: "SERIYA", over: "O'YIN TUGADI", restart: "QAYTA BOSHLASH", menu: "BOSH MENYU", back: "ORQAGA", sound: "Ovoz", music: "Musiqa", anim: "Animatsiyalar", easy: "Qulay yozish rejimi", learned: "O'rganilgan so'zlar", level: "BOSQICH", on: "YOQIQ", off: "O'CHIQ", rec: "🏆 YANGI REKORD!", life: "Qo'shimcha hayot!", coin: "Tanga +5", dbl: "Ikki barobar ball!", slow: "Sekin harakat!", shield: "Himoya!",
    howText: "<p>⌨️ Ekranda chiqqan inglizcha so'zni klaviaturada yozing.</p><p>✅ To'g'ri harf yashil, ❌ xato harf qizil bo'ladi.</p><p>🐰 So'z to'g'ri yozilsa quyoncha keyingi platformaga sakraydi.</p><p>⏳ Yozmasangiz platforma pastga tusha boshlaydi — tushib ketsangiz o'yin tugaydi!</p><p>🪙 ⚡ ⏳ ❤️ 🛡️ bonus platformalarini yig'ing.</p><p>🚀 Har 10 so'zdan keyin yangi bosqich!</p>" },
  en: { play: "PLAY", how: "HOW TO PLAY", set: "SETTINGS", best: "BEST SCORE", score: "SCORE", height: "HEIGHT", words: "WORDS", wpm: "WPM", acc: "ACCURACY", coins: "COINS", streak: "STREAK", over: "GAME OVER", restart: "RESTART", menu: "MAIN MENU", back: "BACK", sound: "Sound", music: "Music", anim: "Animations", easy: "Easy typing mode", learned: "Words you learned", level: "LEVEL", on: "ON", off: "OFF", rec: "🏆 NEW RECORD!", life: "Extra life!", coin: "Coins +5", dbl: "Double score!", slow: "Slow motion!", shield: "Shield!",
    howText: "<p>⌨️ Type the English word shown on screen.</p><p>✅ Correct letters turn green, ❌ wrong ones red.</p><p>🐰 Finish the word and the rabbit jumps to the next platform.</p><p>⏳ Stop typing and the platform sinks — fall and it's game over!</p><p>🪙 ⚡ ⏳ ❤️ 🛡️ Land on bonus platforms to collect them.</p><p>🚀 A new level starts every 10 words!</p>" }
};

/* ============ SETTINGS ============ */
let S = { sound: 1, music: 1, lang: 'uz', anim: 1, easy: 0, best: 0, bestTime: 0, bestEndless: 0, learnedAll: [] };
let gameMode = 'classic', paused = false;
try { Object.assign(S, JSON.parse(localStorage.getItem('rabbitRush') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('rabbitRush', JSON.stringify(S)); } catch (e) {} };
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const tr = k => T[S.lang][k];

function applyLang() {
  document.documentElement.lang = S.lang;
  $$('[data-t]').forEach(e => e.innerHTML = tr(e.dataset.t));
  $$('[data-set]').forEach(b => b.querySelector('b').textContent = S[b.dataset.set] ? tr('on') : tr('off'));
  $('#best').textContent = S.best;
}

/* ============ AUDIO (WebAudio, offline) ============ */
let AC;
function au() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function beep(f, d = .1, type = 'sine', v = .07, at = 0, key = 'sound') {
  if (!S[key]) return;
  const a = au(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), s = a.currentTime + at;
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(.001, s + d);
  o.connect(g); g.connect(a.destination); o.start(s); o.stop(s + d);
}
const SCALE = [262, 294, 330, 392, 440, 523];
setInterval(() => { if (mode === 'play') beep(SCALE[Math.random() * 6 | 0], .5, 'triangle', .025, 0, 'music'); }, 420);

/* ============ CANVAS ============ */
const cv = $('#c'), cx = cv.getContext('2d');
let W, H, u, mode = 'menu', G = null, t = 0;
function resize() {
  const d = Math.min(2, devicePixelRatio || 1);
  W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d;
  cx.setTransform(d, 0, 0, d, 0, 0);
  u = Math.max(.65, Math.min(1.25, W / 480));
}
addEventListener('resize', resize); resize();

const BG = [[[122,210,255],[232,248,255]],[[255,170,205],[255,238,190]],[[110,205,245],[225,250,255]],[[18,20,65],[80,75,150]],[[80,190,130],[215,250,185]]];
const TH = [['#75df67','#8a5a3a'],['#ff9fce','#b65c9a'],['#b8f4ff','#4c91b5'],['#a69cff','#51458d'],['#b5e878','#4e8c4e']];
const WORLDS = ['GREEN VALLEY','CANDY WORLD','ICE KINGDOM','SPACE WORLD','MAGIC FOREST'];
const worldIndex = () => Math.min(4, Math.floor((Math.max(1,G?.level||1)-1)/3));
function updateWorldLabel(){ const el=$('#worldName'); if(el) el.textContent=WORLDS[worldIndex()]; }
const bgc = [BG[0][0].slice(), BG[0][1].slice()];
const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const CL = Array.from({ length: 9 }, () => ({ x: Math.random(), y: Math.random() * 900, s: 28 + Math.random() * 30, p: .15 + Math.random() * .3, v: 6 + Math.random() * 10 }));
const STARS = Array.from({ length: 70 }, () => [Math.random(), Math.random(), 1 + Math.random() * 2]);
const ICON = { coin: '🪙', dbl: '⚡', slow: '⏳', life: '❤️', shield: '🛡️' };

/* ============ GAME STATE ============ */
function newGame(play) {
  G = { plats: [{ fx: .5, y: 0, l: 1, off: 0 }], cur: 0, sink: 0, jump: null, fall: null, land: 0, score: 0, words: 0, coins: 0, streak: 0, lives: 0,
    corr: 0, tot: 0, t0: performance.now(), timeLeft: 60, word: null, idx: 0, bad: 0, wt: 0, clean: 1, bag: [], learned: [], pw: { dbl: 0, slow: 0, shield: 0 }, parts: [], level: 1, h: 0, cam: 0 };
  while (G.plats.length < 9) gen();
  G.cam = rabPos()[1];
  if (play) nextWord();
}
function gen() {
  const p = G.plats[G.plats.length - 1], l = G.level, gap = Math.min(150, 92 + l * 8);
  const fx = Math.max(.18, Math.min(.82, p.fx + (Math.random() - .5) * .55));
  const n = { fx, y: p.y - gap * u, l, off: 0 };
  if (G.plats.length > 2 && Math.random() < .22 + l * .02) {
    const r = Math.random();
    n.b = r < .4 ? 'coin' : r < .55 ? 'dbl' : r < .7 ? 'slow' : r < .85 ? 'shield' : 'life';
  }
  G.plats.push(n);
}
function nextWord() {
  if (!G.bag.length) {
    const l = G.level, pool = l < 2 ? [1,4] : l < 4 ? [1,2,4] : l < 7 ? [2,3,4] : [3,5], b = [];
    pool.forEach(k => b.push(...WORDS[k]));
    G.bag = b.sort(() => Math.random() - .5);
  }
  G.word = G.bag.pop(); G.idx = 0; G.bad = 0; G.wt = 0; G.clean = 1; renderWord();
}
function renderWord() {
  $('#word').innerHTML = [...G.word[0]].map((c, i) => `<span class="${i < G.idx ? 'ok' : i === G.idx ? (G.bad ? 'bad cur' : 'cur') : ''}">${c}</span>`).join('');
}
function toast(msg, big) {
  const e = $('#toast'); e.textContent = msg; e.className = 'show' + (big ? ' big' : '');
  clearTimeout(toast.h); toast.h = setTimeout(() => e.className = '', 1100);
}
function rabPos() {
  const a = G.plats[G.cur];
  let x = a.fx * W, y = a.y + a.off;
  if (G.jump) {
    const b = G.plats[G.cur + 1], e = G.jump.t, s = e * e * (3 - 2 * e);
    x = a.fx * W + (b.fx - a.fx) * W * s;
    y = (a.y + G.jump.sy) + (b.y - a.y - G.jump.sy) * s - Math.sin(Math.PI * e) * 70 * u;
  } else if (G.fall) y += G.fall.y;
  return [x, y];
}
function burst(x, y, col, n) {
  if (!S.anim) return;
  for (let i = 0; i < n; i++) G.parts.push({ x, y, vx: (Math.random() - .5) * 220, vy: -Math.random() * 220, l: .7, c: col });
}

/* ============ TYPING ============ */
const inp = $('#inp');
inp.addEventListener('input', e => {
  const v = inp.value; inp.value = '';
  if (mode !== 'play' || G.jump || G.fall || !G.word) return;
  for (const ch of v.toLowerCase()) { if (/[a-z'-]/.test(ch)) { key(ch); if (G.jump) break; } }
});
function key(ch) {
  const w = G.word[0]; G.tot++;
  if (ch === w[G.idx]) {
    G.corr++; G.idx++; beep(500 + G.idx * 40, .06, 'square', .035);
    if (G.idx >= w.length) return done();
  } else {
    G.bad = .3; G.clean = 0; G.streak = 0; beep(150, .15, 'sawtooth', .05);
    const b = $('#wordBox'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
  }
  renderWord();
}
function done() {
  const w = G.word;
  G.words++; if (G.clean) G.streak++;
  G.score += (w[0].length * 10 + G.streak * 3) * (G.pw.dbl > 0 ? 2 : 1);
  if (!G.learned.some(x => x[0] === w[0])) G.learned.push(w);
  if (!S.learnedAll.includes(w[0])) { S.learnedAll.push(w[0]); S.learnedAll = S.learnedAll.slice(-1000); save(); }
  G.plats[G.cur].off = G.sink * 125 * u;
  G.jump = { t: 0, sy: G.plats[G.cur].off };
  beep(660, .1, 'triangle', .08); beep(880, .15, 'triangle', .08, .1);
  $('#tr').textContent = w[0] + ' → ' + w[1];
  clearTimeout(done.h); done.h = setTimeout(() => $('#tr').textContent = '', 1800);
  if (G.words % 10 === 0) { G.level++; G.bag = []; toast(tr('level') + ' ' + G.level, 1); beep(1046, .3, 'triangle', .09, .2); }
  renderWord();
}
function land() {
  G.cur++; G.jump = null; G.sink = 0; G.wt = 0; G.land = .25;
  const p = G.plats[G.cur], x = p.fx * W;
  G.h = Math.max(G.h, Math.round(-p.y / (u * 10)));
  burst(x, p.y, '#fff', 8);
  if (p.b) {
    const b = p.b; p.b = 0; beep(1000, .12, 'sine', .1); beep(1400, .12, 'sine', .08, .1);
    if (b === 'coin') { G.coins += 5; G.score += 25; } else if (b === 'life') G.lives++; else G.pw[b] = b === 'dbl' ? 12 : b === 'slow' ? 10 : 8;
    burst(x, p.y - 30 * u, '#ffd34d', 14); toast(ICON[b] + ' ' + tr(b));
  }
  while (G.plats.length < G.cur + 9) gen();
  nextWord();
}
function gameOver() {
  mode = 'over'; $('#top').classList.add('hide');
  const m = (performance.now() - G.t0) / 60000, wpm = Math.round((G.corr / 5) / Math.max(m, .02));
  const recordKey = gameMode === 'time' ? 'bestTime' : gameMode === 'endless' ? 'bestEndless' : 'best';
  const isRec = G.score > (S[recordKey] || 0); if (isRec) { S[recordKey] = G.score; if (gameMode === 'classic' || gameMode === 'practice') S.best = Math.max(S.best,G.score); save(); }
  $('#rec').textContent = isRec ? tr('rec') : '';
  $('#oScore').textContent = G.score; $('#oHeight').textContent = G.h + ' m'; $('#oWords').textContent = G.words;
  $('#oWpm').textContent = wpm; $('#oAcc').textContent = (G.tot ? Math.round(G.corr / G.tot * 100) : 100) + '%';
  $('#oLearn').innerHTML = G.learned.map(w => `<span>${w[0]} — ${w[1]}</span>`).join('') || '—';
  applyLang(); show('over');
}

/* ============ UPDATE ============ */
function update(dt) {
  t += dt;
  if (paused || mode === 'pause') return;
  if (!G) return;
  for (const k in G.pw) G.pw[k] = Math.max(0, G.pw[k] - dt);
  G.land = Math.max(0, G.land - dt);
  if (mode === 'play') {
    if (gameMode === 'time') { G.timeLeft -= dt; if (G.timeLeft <= 0) { G.timeLeft = 0; gameOver(); return; } }
    if (G.bad > 0) { G.bad -= dt; if (G.bad <= 0) { G.bad = 0; renderWord(); } }
    if (G.fall) {
      G.fall.v += 1500 * dt * u; G.fall.y += G.fall.v * dt; G.fall.t += dt;
      if (G.fall.t > 1) gameOver();
    } else if (G.jump) {
      G.jump.t += dt / .42; if (G.jump.t >= 1) land();
    } else {
      const al = (2.2 + .5 * G.word[0].length) / (1 + (G.level - 1) * .07);
      if (gameMode !== 'practice' && G.pw.shield <= 0) G.wt += dt * (G.pw.slow > 0 ? .4 : 1) * (S.easy ? .65 : 1);
      G.sink = Math.min(1, G.wt / al);
      G.plats[G.cur].off = G.sink * 125 * u;
      if (gameMode !== 'practice' && G.wt >= al) {
        if (G.lives > 0) { G.lives--; G.wt = 0; toast('❤️ −1'); beep(300, .2, 'triangle', .08); }
        else { G.fall = { y: 0, v: -250 * u, t: 0 }; beep(300, .5, 'sawtooth', .07); beep(160, .6, 'sawtooth', .07, .2); }
      }
    }
  }
  for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.l -= dt; }
  G.parts = G.parts.filter(p => p.l > 0);
  if (!G.fall && mode !== 'pause') G.cam += (rabPos()[1] - G.cam) * Math.min(1, dt * 5);
  if (mode === 'play') hud();
}
function hud() {
  const m = (performance.now() - G.t0) / 60000;
  $('#sScore').textContent = G.score; $('#sHeight').textContent = G.h + ' m'; $('#sWords').textContent = G.words;
  $('#sWpm').textContent = Math.round((G.corr / 5) / Math.max(m, .02));
  $('#sAcc').textContent = (G.tot ? Math.round(G.corr / G.tot * 100) : 100) + '%';
  $('#sCoins').textContent = G.coins; $('#sStreak').textContent = G.streak;
  $('#pw').textContent = (gameMode === 'time' ? `⏱ ${Math.ceil(G.timeLeft)}s · ` : '') + (gameMode === 'practice' ? 'PRACTICE · ' : '') + `LV ${G.level}` + (G.lives ? ` ❤️${G.lives}` : '') + (G.pw.dbl > 0 ? ` ⚡${Math.ceil(G.pw.dbl)}` : '') + (G.pw.slow > 0 ? ` ⏳${Math.ceil(G.pw.slow)}` : '') + (G.pw.shield > 0 ? ` 🛡️${Math.ceil(G.pw.shield)}` : '');
}

/* ============ DRAW ============ */
function ell(x, y, rx, ry, f, rot = 0) { cx.beginPath(); cx.ellipse(x, y, rx, ry, rot, 0, 7); cx.fillStyle = f; cx.fill(); }
function rr(x, y, w, h, r) { cx.beginPath(); cx.roundRect ? cx.roundRect(x, y, w, h, r) : cx.rect(x, y, w, h); }
function rg(px, py, r, r2, c1, c2) { const q = cx.createRadialGradient(px, py, r, px, py, r2); q.addColorStop(0, c1); q.addColorStop(1, c2); return q; }

function rabbit(x, y, o) {
  cx.save(); cx.translate(x, y); cx.scale(u * o.k * o.sx, u * o.k * o.sy);
  for (const d of [-1, 1]) { cx.save(); cx.translate(d * 7, -64); cx.rotate(d * (.14 + o.ear)); ell(0, -14, 6.5, 17, '#f1f5fb'); ell(0, -12, 3.2, 11, '#ffb6c8'); cx.restore(); }
  ell(-18, -17, 7.5, 7.5, rg(-20, -19, 1, 9, '#fff', '#d5dfee'));
  ell(0, -24, 19, 22, rg(-7, -33, 3, 30, '#fff', '#c3d1e6'));
  ell(-10, -3, 9, 5, '#e9eff8'); ell(10, -3, 9, 5, '#e9eff8');
  ell(-14, -22, 5, 9, '#f3f7fc', .3); ell(14, -22, 5, 9, '#f3f7fc', -.3);
  ell(0, -52, 17, 15, rg(-5, -58, 2, 24, '#fff', '#c6d4ea'));
  const er = o.w ? 4.2 : 3.2;
  ell(-6.5, -54, er, er, '#2a2438'); ell(6.5, -54, er, er, '#2a2438');
  ell(-5.5, -55.3, 1.2, 1.2, '#fff'); ell(7.5, -55.3, 1.2, 1.2, '#fff');
  ell(-11.5, -47.5, 3.6, 2.6, 'rgba(255,140,170,.55)'); ell(11.5, -47.5, 3.6, 2.6, 'rgba(255,140,170,.55)');
  ell(0, -49.5, 2.4, 1.7, '#ff8fab');
  if (o.w) ell(0, -45, 2, 2.4, '#c2415f');
  else { cx.strokeStyle = '#8a7a99'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(-3, -46.5); cx.quadraticCurveTo(0, -44.5, 3, -46.5); cx.stroke(); }
  cx.restore();
}

function drawPlat(p, i, an) {
  const th = TH[worldIndex()], w = Math.max(84, 150 - p.l * 7) * u, h = 24 * u;
  const x = p.fx * W - w / 2, y = p.y + p.off - G.cam + H * an;
  if (y < -80 || y > H + 80) return;
  ell(x + w / 2, y + h + 8 * u, w * .42, 6 * u, 'rgba(0,0,0,.12)');
  const g = cx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, th[1]); g.addColorStop(1, 'rgba(0,0,0,.35)');
  rr(x, y, w, h, 10 * u); cx.fillStyle = th[1]; cx.fill(); cx.fillStyle = g; cx.fill();
  rr(x - 3, y - 2, w + 6, 10 * u, 8 * u); cx.fillStyle = th[0]; cx.fill();
  if (p.b) { cx.font = `${26 * u}px serif`; cx.textAlign = 'center'; cx.fillText(ICON[p.b], p.fx * W, y - 14 * u + Math.sin(t * 4 + i) * 4 * u); }
}

function draw() {
  if (!G) return;
  const A = S.anim, an = mode === 'play' ? (H < 560 ? .55 : .62) : .84;
  const wi = worldIndex(), tg = BG[wi]; updateWorldLabel();
  for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) bgc[i][j] += (tg[i][j] - bgc[i][j]) * .04;
  const gr = cx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, rgb(bgc[0])); gr.addColorStop(1, rgb(bgc[1]));
  cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
  const so = worldIndex() >= 3 ? 1 : Math.max(0, Math.min(1, (G.level - 2) * .5));
  if (so > 0) { cx.fillStyle = '#fff'; for (const s of STARS) { cx.globalAlpha = so * (.5 + .5 * Math.sin(t * 2 + s[0] * 9)); cx.fillRect(s[0] * W, ((s[1] * H * 1.4 - G.cam * .05) % H + H) % H, s[2], s[2]); } }
  cx.globalAlpha = 1 - so * .7;
  for (const c of CL) {
    const y = (((c.y - G.cam * c.p) % (H + 160)) + H + 160) % (H + 160) - 80, r = c.s * u;
    const x = ((c.x * W + (A ? t * c.v : 0)) % (W + 300) + W + 300) % (W + 300) - 150;
    ell(x, y, r * 1.6, r * .6, 'rgba(255,255,255,.78)'); ell(x - r * .8, y + r * .1, r, r * .5, 'rgba(255,255,255,.78)'); ell(x + r * .9, y + r * .1, r * 1.1, r * .5, 'rgba(255,255,255,.78)');
  }
  cx.globalAlpha = 1;
  for (let i = Math.max(0, G.cur - 8); i < G.plats.length; i++) drawPlat(G.plats[i], i, an);

  const [rx, ry] = rabPos();
  let sy = 1, sx = 1, ear = .1, w = 0, k = 1, oy = 0;
  if (G.fall) { ear = -.6 + Math.sin(t * 30) * .2; w = 1; sy = 1.1; sx = .92; }
  else if (G.jump) { sy = 1 + .2 * Math.sin(Math.PI * G.jump.t); sx = 1 / sy; ear = -.2; }
  else {
    ear = .1 + G.sink * .6; w = G.sink > .6 ? 1 : 0;
    if (A) { const b = Math.sin(t * 3.2) * .025; sy = 1 + b; sx = 1 - b; if (G.land > 0) { const q = G.land / .25; sy -= .2 * q; sx += .15 * q; } }
  }
  if (mode !== 'play') { k = 1.3; const hp = Math.abs(Math.sin(t * 2.6)); if (A) { oy = -hp * 50 * u; sy = 1 + .12 * hp; sx = 1 / sy; } }
  const sx0 = rx, sy0 = ry - G.cam + H * an + oy;
  if (!G.jump && !G.fall) ell(rx, ry - G.cam + H * an, 20 * u * k, 5 * u * k, 'rgba(0,0,0,.18)');
  rabbit(sx0, sy0, { sx, sy, ear, w, k });
  if (G.pw.shield > 0) { cx.beginPath(); cx.arc(sx0, sy0 - 38 * u * k, 52 * u * k, 0, 7); cx.strokeStyle = `rgba(120,240,255,${.5 + .3 * Math.sin(t * 6)})`; cx.lineWidth = 4; cx.stroke(); cx.fillStyle = 'rgba(120,240,255,.12)'; cx.fill(); }
  for (const p of G.parts) { cx.globalAlpha = Math.max(0, p.l / .7); cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y - G.cam + H * an, 3.5 * u, 0, 7); cx.fill(); }
  cx.globalAlpha = 1;
}

/* ============ SCREENS & EVENTS ============ */
function show(id) { $$('.screen').forEach(s => s.classList.toggle('hide', s.id !== id)); }
function go(x) {
  if (x === 'play') {
    paused = false; newGame(true); mode = 'play'; show(); $('#top').classList.remove('hide'); $('#tr').textContent = ''; inp.focus(); hud();
  } else {
    if (x === 'menu') { paused = false; mode = 'menu'; newGame(false); $('#top').classList.add('hide'); }
    show(x);
  }
}
function togglePause(){ if(mode==='play'){ paused=true; mode='pause'; $('#top').classList.add('hide'); show('pause'); } else if(mode==='pause'){ paused=false; mode='play'; show(); $('#top').classList.remove('hide'); inp.focus(); } }
$('#pauseBtn').addEventListener('click', togglePause);
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  au(); beep(520, .05, 'square', .04);
  const d = b.dataset;
  if (d.mode) { gameMode=d.mode; $$('.mode-chip').forEach(x=>x.classList.toggle('active',x.dataset.mode===gameMode)); }
  if (d.action==='resume') { paused=false; mode='play'; show(); $('#top').classList.remove('hide'); inp.focus(); }
  if (d.lang) { S.lang = d.lang; save(); applyLang(); }
  if (d.set) { S[d.set] = S[d.set] ? 0 : 1; save(); applyLang(); }
  if (d.go) go(d.go);
});
cv.addEventListener('pointerdown', () => { if (mode === 'play') inp.focus(); });
document.addEventListener('keydown', e => { if(e.key==='Escape' && (mode==='play'||mode==='pause')){togglePause();return;} if (mode === 'play') inp.focus(); });

let last = performance.now();
function loop(n) {
  const dt = Math.min(.05, (n - last) / 1000); last = n;
  update(dt); draw(); requestAnimationFrame(loop);
}
applyLang(); newGame(false); show('menu'); requestAnimationFrame(loop);

function done() {
  const w = G.word;
  const wasReview = G.isReview;
  const correct = G.clean === 1;

  G.words++;

  if (correct) G.streak++;

  G.score +=
    (w[0].length * 10 + G.streak * 3) *
    (G.pw.dbl > 0 ? 2 : 1);

  if (wasReview) {

    // Eski so'zni qayta tekshirish
    finishMemoryReview(w[0], correct);

    toast(
      correct
        ? '🧠 MEMORY IMPROVED!'
        : '🔄 PRACTICE AGAIN!'
    );

    G.activeWord = null;
    G.isReview = false;

    $('#tr').textContent = correct
      ? w[0] + ' — Xotirada mustahkamlandi!'
      : w[0] + ' — Qayta mashq qilish kerak';

  } else {

    // Faqat xatosiz yozilgan urinish hisoblanadi
    if (correct) {
      G.activeRepeat++;
    }

    if (G.activeRepeat >= 10) {

      masterWord(w[0], w[1]);

      if (!G.learned.some(x => x[0] === w[0])) {
        G.learned.push(w);
      }

      toast('🏆 WORD MASTERED!', true);

      $('#tr').textContent =
        w[0] + ' — 10/10 ✓ ' + w[1];

      G.activeWord = null;
      G.activeRepeat = 0;

    } else {

      $('#tr').textContent =
        w[0] + ' — ' + G.activeRepeat + '/10 ' + w[1];

      if (!correct) {
        toast('❌ Xatoli urinish hisoblanmadi!');
      }
    }
  }

  G.plats[G.cur].off = G.sink * 125 * u;
  G.jump = {
    t: 0,
    sy: G.plats[G.cur].off
  };

  beep(660, .1, 'triangle', .08);
  beep(880, .15, 'triangle', .08, .1);

  if (G.words % 10 === 0) {
    G.level++;
    G.bag = [];

    toast(tr('level') + ' ' + G.level, 1);
    beep(1046, .3, 'triangle', .09, .2);
  }

  renderWord();
}

