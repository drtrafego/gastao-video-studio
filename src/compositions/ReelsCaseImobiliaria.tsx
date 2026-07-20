import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {GoldCaption, GoldWord} from "../components/text/GoldCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsCaseProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const FONT = "Manrope";
// ---- PALETA UNICA: dourado (resultado/dinheiro) ----
const GOLD = "#fbbf24";
const GOLD_DK = "#f59e0b";
const INK = "#0d1117";
const WHITE = "#ffffff";

// ---------- Barra de progresso ----------
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.16)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${GOLD_DK},${GOLD})`}} />
    </div>
  );
};

// ---------- Hook central (0 a 3s) ----------
const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const enter = spring({frame, fps, config: {damping: 13, stiffness: 130, mass: 0.8}, durationInFrames: 16});
  const exitStart = 2.7 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 12], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [40, 0]);
  const base: React.CSSProperties = {
    fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, lineHeight: 1.02, textTransform: "uppercase",
    WebkitTextStroke: "7px #000", paintOrder: "stroke fill", textShadow: "0 8px 22px rgba(0,0,0,0.85)", letterSpacing: -1.5,
  };
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: enter * exit}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "40px 40px", textAlign: "center", transform: `translateY(${y}px)`, background: "rgba(0,0,0,0.5)", borderRadius: 28, backdropFilter: "blur(2px)"}}>
        <div style={{...base, color: WHITE, fontSize: 58}}>R$ 93 VIRARAM</div>
        <div style={{...base, color: GOLD, fontSize: 128, textShadow: `0 0 34px rgba(251,191,36,0.6), 0 8px 22px rgba(0,0,0,0.85)`}}>R$ 1.500</div>
        <div style={{marginTop: 12, fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, fontSize: 40, color: INK, background: GOLD, padding: "10px 28px", borderRadius: 14, boxShadow: "0 6px 18px rgba(0,0,0,0.4)"}}>ROAS 15x 🚀</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Card de numero grande (bloco 2, sobre o gerenciador) ----------
const BigStat: React.FC<{emoji: string; label: string; value: string; dur: number; accent?: string}> = ({emoji, label, value, dur, accent = GOLD}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const enter = spring({frame, fps, config: {damping: 12, stiffness: 160, mass: 0.7}, durationInFrames: 12});
  const exit = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const scale = interpolate(enter, [0, 1], [0.7, 1]);
  const y = interpolate(enter, [0, 1], [40, 0]);
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 56}}>
      <div style={{transform: `translateY(${y}px) scale(${scale})`, opacity: enter * exit, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: "rgba(8,10,16,0.82)", border: `2px solid ${accent}`, borderRadius: 30, padding: "34px 54px", boxShadow: `0 18px 50px rgba(0,0,0,0.55), 0 0 40px rgba(251,191,36,0.25)`}}>
        <div style={{fontSize: 76, lineHeight: 1}}>{emoji}</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: 1}}>{label}</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 800, fontSize: 104, color: accent, letterSpacing: -2, textShadow: "0 0 30px rgba(251,191,36,0.5)"}}>{value}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Climax ROAS (fim do bloco 2) ----------
const RoasBadge: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const enter = spring({frame, fps, config: {damping: 10, stiffness: 140}, durationInFrames: 14});
  const exit = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const pulse = 1 + Math.sin(frame / 4) * 0.02;
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 57}}>
      <div style={{transform: `scale(${interpolate(enter, [0, 1], [0.6, 1]) * pulse})`, opacity: enter * exit, textAlign: "center", background: `linear-gradient(135deg,${GOLD},${GOLD_DK})`, borderRadius: 30, padding: "38px 60px", boxShadow: "0 20px 60px rgba(0,0,0,0.55)"}}>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 700, fontSize: 40, color: INK, letterSpacing: 1}}>RETORNO DE</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 900, fontSize: 150, color: INK, lineHeight: 1, letterSpacing: -3}}>15x 🚀</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 800, fontSize: 38, color: INK}}>o valor investido</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Selos no print (bloco 3) ----------
const ProofSeal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const enter = spring({frame, fps, config: {damping: 13, stiffness: 150}, durationInFrames: 12});
  const y = interpolate(enter, [0, 1], [-30, 0]);
  return (
    <AbsoluteFill style={{zIndex: 57}}>
      {/* badge topo */}
      <div style={{position: "absolute", top: 90, width: "100%", display: "flex", justifyContent: "center", opacity: enter, transform: `translateY(${y}px)`}}>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 800, fontSize: 42, color: INK, background: GOLD, padding: "14px 34px", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.5)"}}>PROVA REAL 💬</div>
      </div>
      {/* rodape */}
      <div style={{position: "absolute", bottom: 120, width: "100%", display: "flex", justifyContent: "center", opacity: enter}}>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 800, fontSize: 46, color: WHITE, textAlign: "center", WebkitTextStroke: "5px #000", paintOrder: "stroke fill", textShadow: "0 4px 14px rgba(0,0,0,0.8)"}}>o cliente dele fechou 🔥</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- CTA final ----------
const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const start = durationInFrames - Math.round(2.4 * fps);
  if (frame < start) return null;
  const enter = spring({frame: frame - start, fps, config: {damping: 13, stiffness: 140}, durationInFrames: 16});
  loadGoogleFont(FONT);
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", paddingBottom: 60, zIndex: 59, opacity: enter}}>
      <div style={{background: GOLD, borderRadius: 24, padding: "30px 52px", textAlign: "center", boxShadow: "0 22px 55px rgba(0,0,0,0.55)", transform: `scale(${interpolate(enter, [0, 1], [0.82, 1])})`}}>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 900, fontSize: 66, color: INK, letterSpacing: -1}}>Comenta</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 900, fontSize: 90, color: INK, letterSpacing: -2, lineHeight: 1}}>EU QUERO 👇</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 700, fontSize: 32, color: "rgba(13,17,23,0.75)", marginTop: 8}}>que eu te mostro como</div>
      </div>
    </AbsoluteFill>
  );
};

const sf = (s: number, fps: number) => Math.round(s * fps);

export const ReelsCaseImobiliaria: React.FC<ReelsCaseProps> = ({
  videoSrc = "assets/reels_case_base.mp4",
  captionsFile = "captions_case.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<GoldWord[]>([]);
  const [handle] = useState(() => delayRender("captions_case"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: GoldWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0)
          // apenas blocos talking head: 1 (apos hook, ate 26.2s) e 4 (>=55.8s)
          .filter((c) => (c.startMs >= 3000 && c.startMs <= 26200) || c.startMs >= 55800)
          .map((c) => ({
            text: c.text.trim(),
            startFrame: Math.round((c.startMs / 1000) * fps),
            endFrame: Math.max(Math.round((c.endMs / 1000) * fps), Math.round((c.startMs / 1000) * fps) + 1),
          }));
        setWords(w);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [captionsFile, fps, handle]);

  return (
    <AbsoluteFill style={{backgroundColor: transparent ? "transparent" : "#000"}}>
      {!transparent && <OffthreadVideo src={staticFile(videoSrc)} style={{width: "100%", height: "100%", objectFit: "cover"}} />}

      <ProgressBar />

      {/* Hook 0-3s */}
      <Sequence durationInFrames={sf(3.0, fps)}>
        <HookCard />
      </Sequence>

      {/* Legenda karaoke (blocos talking head 1 e 4) */}
      {words.length > 0 && (
        <GoldCaption words={words} chunkSize={3} fontSize={62} fontFamily={FONT} top={1170} activeColor={GOLD} valueColor={GOLD} />
      )}

      {/* NUMEROS GRANDES sobre o gerenciador (bloco 2) */}
      <Sequence from={sf(30.6, fps)} durationInFrames={sf(3.0, fps)}>
        <BigStat emoji="📅" label="Campanha no ar" value="dia 14" dur={sf(3.0, fps)} />
      </Sequence>
      <Sequence from={sf(39.3, fps)} durationInFrames={sf(1.9, fps)}>
        <BigStat emoji="💸" label="Investido" value="R$ 93" dur={sf(1.9, fps)} />
      </Sequence>
      <Sequence from={sf(41.3, fps)} durationInFrames={sf(2.9, fps)}>
        <BigStat emoji="🎯" label="Chegaram" value="15 leads" dur={sf(2.9, fps)} />
      </Sequence>
      <Sequence from={sf(44.4, fps)} durationInFrames={sf(2.5, fps)}>
        <BigStat emoji="🤝" label="Fechou" value="1 venda" dur={sf(2.5, fps)} />
      </Sequence>
      <Sequence from={sf(47.1, fps)} durationInFrames={sf(3.3, fps)}>
        <BigStat emoji="💰" label="Comissão" value="R$ 1.500" dur={sf(3.3, fps)} />
      </Sequence>
      <Sequence from={sf(50.6, fps)} durationInFrames={sf(1.9, fps)}>
        <RoasBadge dur={sf(1.9, fps)} />
      </Sequence>

      {/* Selos no print (bloco 3: 52.5 - 56s) */}
      <Sequence from={sf(52.6, fps)} durationInFrames={sf(3.3, fps)}>
        <ProofSeal />
      </Sequence>

      {/* CTA final */}
      <FinalCTA />
    </AbsoluteFill>
  );
};
