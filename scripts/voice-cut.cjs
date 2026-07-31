// VAD v4 (metodo fechado). Mantem SO a voz no microfone.
// Quatro provas, todas obrigatorias:
//   1. PROXIMIDADE   nivel dentro de RANGE_DB do nivel de fala DESTE video
//                    (piso ADAPTATIVO medido do material, nunca fixo)
//   2. PERIODICIDADE autocorrelacao na banda de F0 (voz tem pitch, ruido nao)
//   3. TIMBRE        energia em 300-3000Hz sobre a total (carro/vento moram
//                    abaixo de 200Hz e nao passam aqui)
//   4. CONTINUIDADE  F0 estavel por varias janelas seguidas
// E a regra que resolve "fiquei quieto e passou um carro":
//   ILHA: bloco curto cercado de silencio longo dos dois lados NAO e fala.
//   Ninguem fala uma unica silaba solta com 2s de vazio de cada lado.
// Entrada PCM s16le mono 16kHz: full (energia), pitch (70-1000Hz), form (300-3000Hz).
const fs = require("fs");

const [, , fullPath, pitchPath, formPath, durStr, outPath] = process.argv;
const TOTAL = parseFloat(durStr);

const SR = 16000, WIN = 512, HOP = 256;
const LAG_MIN = Math.floor(SR / 320), LAG_MAX = Math.floor(SR / 70);

const CORR_THOLD = 0.38;
const FORM_RATIO = 0.12;
const RANGE_DB = 24; // fala baixa (fim de frase) ainda entra; ruido distante nao
const FLOOR_ABS = -47;
const F0_JITTER = 0.28;
const MIN_RUN = 4; // 64ms de pitch continuo
const MIN_VOICE = 0.3;
const MERGE_GAP = 0.5; // nao pica dentro da frase
const PAD = 0.22;
// regra da ilha
const ILHA_DUR = 1.2; // bloco menor que isso...
const ILHA_VAZIO = 2.0; // ...com mais que isso de vazio nos dois lados = ruido

const rd = (p) => {
  const b = fs.readFileSync(p);
  const n = Math.floor(b.length / 2);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(i * 2) / 32768;
  return a;
};

const full = rd(fullPath), pit = rd(pitchPath), frm = rd(formPath);
if (Math.abs(full.length - pit.length) > SR || Math.abs(full.length - frm.length) > SR) {
  console.error("ERRO: bandas com tamanhos diferentes. Repita -ar 16000 -ac 1 em CADA saida do ffmpeg.");
  process.exit(2);
}
const nWin = Math.floor((Math.min(full.length, pit.length, frm.length) - WIN) / HOP);

const db = new Float32Array(nWin), corr = new Float32Array(nWin);
const f0 = new Float32Array(nWin), ratio = new Float32Array(nWin);

for (let w = 0; w < nWin; w++) {
  const off = w * HOP;
  let eF = 0, eR = 0;
  for (let i = 0; i < WIN; i++) {
    eF += full[off + i] * full[off + i];
    eR += frm[off + i] * frm[off + i];
  }
  db[w] = 20 * Math.log10(Math.sqrt(eF / WIN) + 1e-12);
  ratio[w] = eF > 1e-12 ? eR / eF : 0;
  if (db[w] < FLOOR_ABS) continue;
  let e0 = 0;
  for (let i = 0; i < WIN; i++) e0 += pit[off + i] * pit[off + i];
  if (e0 < 1e-9) continue;
  let best = 0, bestLag = 0;
  for (let lag = LAG_MIN; lag <= LAG_MAX; lag++) {
    let num = 0, den = 0;
    for (let i = 0; i + lag < WIN; i++) {
      num += pit[off + i] * pit[off + i + lag];
      den += pit[off + i + lag] * pit[off + i + lag];
    }
    const c = num / (Math.sqrt(e0 * den) + 1e-12);
    if (c > best) { best = c; bestLag = lag; }
  }
  corr[w] = best;
  f0[w] = bestLag ? SR / bestLag : 0;
}

const strong = [];
for (let w = 0; w < nWin; w++) if (corr[w] >= 0.55 && ratio[w] >= 0.2 && db[w] > FLOOR_ABS) strong.push(db[w]);
strong.sort((a, b) => a - b);
const speechLevel = strong.length > 50 ? strong[Math.floor(strong.length * 0.75)] : NaN;
const floorDb = Number.isNaN(speechLevel) ? FLOOR_ABS : Math.max(FLOOR_ABS, speechLevel - RANGE_DB);

const cand = new Uint8Array(nWin);
for (let w = 0; w < nWin; w++)
  cand[w] = db[w] >= floorDb && corr[w] >= CORR_THOLD && ratio[w] >= FORM_RATIO ? 1 : 0;

const voiced = new Uint8Array(nWin);
let i0 = 0;
while (i0 < nWin) {
  if (!cand[i0]) { i0++; continue; }
  let i1 = i0;
  while (i1 + 1 < nWin && cand[i1 + 1] && f0[i1] > 0 &&
         Math.abs(f0[i1 + 1] - f0[i1]) / f0[i1] < F0_JITTER) i1++;
  if (i1 - i0 + 1 >= MIN_RUN) for (let w = i0; w <= i1; w++) voiced[w] = 1;
  i0 = i1 + 1;
}

const t = (w) => (w * HOP) / SR;
let blocks = [];
let st = -1;
for (let w = 0; w < nWin; w++) {
  if (voiced[w] && st < 0) st = w;
  else if (!voiced[w] && st >= 0) { blocks.push({ from: t(st), to: t(w), w0: st, w1: w }); st = -1; }
}
if (st >= 0) blocks.push({ from: t(st), to: t(nWin), w0: st, w1: nWin });

// funde o que esta perto (consoante surda entre vogais nao tem pitch)
const merged = [];
for (const b of blocks) {
  const last = merged[merged.length - 1];
  if (last && b.from - last.to < MERGE_GAP) { last.to = b.to; last.w1 = b.w1; }
  else merged.push({ ...b });
}

// ---- regra da ILHA ----
const ilhas = [];
const semIlha = merged.filter((b, i) => {
  const dur = b.to - b.from;
  if (dur >= ILHA_DUR) return true;
  const vazioAntes = i === 0 ? b.from : b.from - merged[i - 1].to;
  const vazioDepois = i === merged.length - 1 ? TOTAL - b.to : merged[i + 1].from - b.to;
  if (vazioAntes > ILHA_VAZIO && vazioDepois > ILHA_VAZIO) {
    ilhas.push({ start: +b.from.toFixed(2), dur: +dur.toFixed(2) });
    return false;
  }
  return true;
});

const solid = semIlha.filter((b) => b.to - b.from >= MIN_VOICE);

const keep = [];
for (const b of solid) {
  const a = Math.max(0, b.from - PAD), z = Math.min(TOTAL, b.to + PAD);
  const last = keep[keep.length - 1];
  if (last && a - last.end < MERGE_GAP) { last.end = Math.max(last.end, z); last.w1 = b.w1; }
  else keep.push({ start: a, end: z, w0: b.w0, w1: b.w1 });
}

// SALVAGUARDA anti-picotado: fragmento curto nao justifica um corte. Funde com
// o vizinho, devolvendo o material entre os dois. Vale mais o ritmo que o segundo.
const MIN_BLOCO = 1.0;
let mudou = true;
while (mudou && keep.length > 1) {
  mudou = false;
  for (let i = 0; i < keep.length; i++) {
    if (keep[i].end - keep[i].start >= MIN_BLOCO) continue;
    if (i + 1 < keep.length) { keep[i].end = keep[i + 1].end; keep[i].w1 = keep[i + 1].w1; keep.splice(i + 1, 1); }
    else if (i > 0) { keep[i - 1].end = keep[i].end; keep[i - 1].w1 = keep[i].w1; keep.splice(i, 1); }
    else break;
    mudou = true;
    break;
  }
}

const stats = keep.map((k) => {
  let v = 0, n = 0, sdb = 0, sc = 0;
  for (let w = k.w0; w < k.w1; w++) { n++; v += voiced[w]; sdb += db[w]; sc += corr[w]; }
  return { start: +k.start.toFixed(2), end: +k.end.toFixed(2), dur: +(k.end - k.start).toFixed(2),
    voicedFrac: n ? +(v / n).toFixed(2) : 0, meanDb: n ? +(sdb / n).toFixed(1) : 0 };
});

const segs = keep.map((k) => ({ start: k.start, end: k.end }));
const kept = segs.reduce((a, k) => a + (k.end - k.start), 0);
const short = stats.filter((s) => s.dur < 0.8).length;

fs.writeFileSync(outPath, JSON.stringify({
  segments: segs, stats, ilhasDescartadas: ilhas,
  totalOriginal: TOTAL, totalFinal: kept, removed: TOTAL - kept,
  speechLevel: +speechLevel.toFixed(1), floorDb: +floorDb.toFixed(1), shortBlocks: short,
}, null, 2));

const expr = segs.map((k) => `between(t,${k.start.toFixed(3)},${k.end.toFixed(3)})`).join("+");
fs.writeFileSync(outPath.replace(/\.json$/, "_v.txt"), `select='${expr}',setpts=N/FRAME_RATE/TB`);
fs.writeFileSync(outPath.replace(/\.json$/, "_a.txt"), `aselect='${expr}',asetpts=N/SR/TB`);

console.log(
  `${segs.length} blocos | fala ${speechLevel.toFixed(1)}dB piso ${floorDb.toFixed(1)}dB | ` +
  `ilhas de ruido descartadas: ${ilhas.length} | ` +
  `${TOTAL.toFixed(1)}s -> ${kept.toFixed(1)}s (cortou ${(TOTAL - kept).toFixed(1)}s, ` +
  `${(((TOTAL - kept) / TOTAL) * 100).toFixed(1)}%) | curtos<0.8s: ${short}`
);
