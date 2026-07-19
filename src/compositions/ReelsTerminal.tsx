import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {UnderlineCaption, UnderlineWord, UnderlineEmphasis} from "../components/text/UnderlineCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsTerminalProps {
  videoSrc?: string;
  captionsFile?: string;
  hookA?: string;
  hookHi?: string;
  hookB?: string;
  hookSub?: string;
  transparent?: boolean;
}

const FONT = "Outfit";
// ---- PALETA ÚNICA (âmbar Claude) — nada de carnaval ----
const AMBER = "#f59e0b";
const AMBER_LT = "#fb923c";
const INK = "#0d1117";
const WHITE = "#ffffff";

// Pontos-chave (chips) que aparecem EMBAIXO (tarja de baixo), na paleta âmbar
const KEYPOINTS: {frame: number; title: string; emoji: string}[] = [
  {frame: 1324, title: "Retoma a memória", emoji: "🧠"},
  {frame: 2053, title: "Deu erro? Traz o log", emoji: "📋"},
  {frame: 2293, title: "O Claude corrige", emoji: "🔧"},
  {frame: 2872, title: "Dá o push", emoji: "🚀"},
  {frame: 3865, title: "Ele te traz o resumo", emoji: "✅"},
];

// Emojis nos beats (cor natural, ok manter coloridos)
const BEATS: {frame: number; emojis: string[]; x: number}[] = [
  {frame: 375, emojis: ["😮"], x: 84},
  {frame: 770, emojis: ["👀"], x: 12},
  {frame: 3900, emojis: ["🎉"], x: 84},
];

// legenda: palavras-chave todas na MESMA família âmbar (+ emoji colorido)
const EMPHASIS: Record<string, UnderlineEmphasis> = {
  TERMINAL: {color: AMBER, emoji: "🖥️"},
  IA: {color: AMBER, emoji: "🤖"},
  CLAUDE: {color: AMBER, emoji: "🤖"},
  CRM: {color: AMBER, emoji: "📊"},
  DASHBOARD: {color: AMBER, emoji: "📊"},
  SITES: {color: AMBER, emoji: "🌐"},
  FERRAMENTAS: {color: AMBER, emoji: "🛠️"},
  MEMORIA: {color: AMBER, emoji: "🧠"},
  ERRO: {color: AMBER, emoji: "❌"},
  VERCEL: {color: AMBER, emoji: "🚀"},
  PUSH: {color: AMBER, emoji: "🚀"},
  GITHUB: {color: AMBER, emoji: "📦"},
  RESUMO: {color: AMBER, emoji: "✅"},
};

const TELA_TOP = 800;

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.14)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${AMBER},${AMBER_LT})`}} />
    </div>
  );
};

const FloatingEmojis: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {BEATS.map((b, bi) =>
        b.emojis.map((e, ei) => {
          const local = frame - (b.frame + ei * 4);
          if (local < 0 || local > 55) return null;
          const pop = spring({frame: local, fps, config: {damping: 10, stiffness: 200, mass: 0.6}, durationInFrames: 14});
          const rise = interpolate(local, [0, 55], [0, -150]);
          const fade = interpolate(local, [0, 8, 40, 55], [0, 1, 1, 0], {extrapolateRight: "clamp"});
          return (
            <div key={`${bi}-${ei}`} style={{position: "absolute", left: `${b.x}%`, top: TELA_TOP + 30, fontSize: 104, zIndex: 52, opacity: fade, transform: `translateY(${rise}px) scale(${pop})`}}>{e}</div>
          );
        }),
      )}
    </>
  );
};

// Chip de ponto-chave — aparece EMBAIXO (tarja de baixo), paleta âmbar
const KeyChips: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const DUR = 140;
  const kp = KEYPOINTS.find((k) => frame >= k.frame && frame < k.frame + DUR);
  if (!kp) return null;
  const local = frame - kp.frame;
  const enter = spring({frame: local, fps, config: {damping: 14, stiffness: 150}, durationInFrames: 14});
  const exit = interpolate(local, [DUR - 14, DUR], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [40, 0]);
  return (
    <div style={{position: "absolute", left: 0, right: 0, bottom: 120, display: "flex", justifyContent: "center", zIndex: 54, opacity: enter * exit, transform: `translateY(${y}px)`}}>
      <div style={{display: "flex", alignItems: "center", gap: 18, background: "rgba(13,17,23,0.9)", border: `2px solid ${AMBER}`, borderRadius: 16, padding: "16px 30px", boxShadow: "0 14px 40px rgba(0,0,0,0.5)"}}>
        <div style={{fontSize: 56, lineHeight: 1}}>{kp.emoji}</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 800, fontSize: 48, color: AMBER, letterSpacing: 0.3, whiteSpace: "nowrap"}}>{kp.title}</div>
      </div>
    </div>
  );
};

const HookCard: React.FC<{a: string; hi: string; b: string; sub: string}> = ({a, hi, b, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const enter = spring({frame, fps, config: {damping: 13, stiffness: 130, mass: 0.8}, durationInFrames: 16});
  const exitStart = 2.7 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 12], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [40, 0]);
  const word: React.CSSProperties = {
    fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, lineHeight: 1.04, textTransform: "uppercase",
    WebkitTextStroke: "7px #000000", paintOrder: "stroke fill", textShadow: "0 8px 20px rgba(0,0,0,0.8)", letterSpacing: -1,
  };
  // Centralizado no meio (zona 4:5 do feed) — mantido conforme pedido.
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: enter * exit}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "44px 46px", textAlign: "center", transform: `translateY(${y}px)`, background: "rgba(0,0,0,0.42)", borderRadius: 28, backdropFilter: "blur(2px)"}}>
        <div style={{...word, color: WHITE, fontSize: 60}}>{a}</div>
        <div style={{...word, color: AMBER, fontSize: 90}}>{hi}</div>
        <div style={{...word, color: WHITE, fontSize: 60}}>{b}</div>
        <div style={{marginTop: 8, fontFamily: `'${FONT}', sans-serif`, fontWeight: 700, fontSize: 36, color: INK, background: AMBER, padding: "10px 24px", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.4)"}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsTerminal: React.FC<ReelsTerminalProps> = ({
  videoSrc = "assets/reels_terminal_base.mp4",
  captionsFile = "captions_terminal.json",
  hookA = "CONSTRUÍ +20 SITES",
  hookHi = "SEM ENTENDER",
  hookB = "O QUE A IA FAZ",
  hookSub = "e você também consegue",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<UnderlineWord[]>([]);
  const [handle] = useState(() => delayRender("captions_terminal"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: UnderlineWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0 && c.startMs >= 2700)
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
      <FloatingEmojis />
      <KeyChips />
      <Sequence durationInFrames={Math.round(2.9 * fps)}>
        <HookCard a={hookA} hi={hookHi} b={hookB} sub={hookSub} />
      </Sequence>
      {/* Legenda karaokê AGORA EM CIMA (top) */}
      {words.length > 0 && (
        <UnderlineCaption words={words} chunkSize={3} fontSize={60} fontFamily={FONT} baseColor={WHITE} activeColor={AMBER} top={110} emphasis={EMPHASIS} />
      )}
    </AbsoluteFill>
  );
};
