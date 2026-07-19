import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {UnderlineCaption, UnderlineWord, UnderlineEmphasis} from "../components/text/UnderlineCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsIndicacaoProps {
  videoSrc?: string;
  captionsFile?: string;
  hookA?: string;
  hookHi?: string;
  hookB?: string;
  hookSub?: string;
  transparent?: boolean;
}

const FONT = "Outfit";
// ---- PALETA ÚNICA (coral) ----
const CORAL = "#ff4757";
const CORAL_LT = "#ff6b81";
const INK = "#0d1117";
const WHITE = "#ffffff";

// Pontos-chave (chips) EMBAIXO, paleta coral
const KEYPOINTS: {frame: number; title: string; emoji: string}[] = [
  {frame: 1221, title: "Indicação = consequência", emoji: "⚠️"},
  {frame: 1350, title: "Canal: você liga e vem", emoji: "📡"},
  {frame: 1811, title: "Sem canal, sem previsibilidade", emoji: "📉"},
  {frame: 2479, title: "Previsibilidade = ter um canal", emoji: "📈"},
];

const BEATS: {frame: number; emojis: string[]; x: number}[] = [
  {frame: 200, emojis: ["🎲"], x: 82},
  {frame: 2078, emojis: ["🔒"], x: 14},
];

// legenda: palavras-chave todas coral (+ emoji colorido opcional)
const EMPHASIS: Record<string, UnderlineEmphasis> = {
  INDICACAO: {color: CORAL},
  CANAL: {color: CORAL},
  CONSEQUENCIA: {color: CORAL},
  SORTE: {color: CORAL, emoji: "🎲"},
  PREVISIBILIDADE: {color: CORAL},
  CONTROLA: {color: CORAL},
  CLIENTE: {color: CORAL},
  LEAD: {color: CORAL},
  ZERO: {color: CORAL},
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.18)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${CORAL},${CORAL_LT})`}} />
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
            <div key={`${bi}-${ei}`} style={{position: "absolute", left: `${b.x}%`, top: 980, fontSize: 100, zIndex: 52, opacity: fade, transform: `translateY(${rise}px) scale(${pop})`}}>{e}</div>
          );
        }),
      )}
    </>
  );
};

const KeyChips: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const DUR = 150;
  const kp = KEYPOINTS.find((k) => frame >= k.frame && frame < k.frame + DUR);
  if (!kp) return null;
  const local = frame - kp.frame;
  const enter = spring({frame: local, fps, config: {damping: 14, stiffness: 150}, durationInFrames: 14});
  const exit = interpolate(local, [DUR - 14, DUR], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [40, 0]);
  return (
    <div style={{position: "absolute", left: 0, right: 0, bottom: 150, display: "flex", justifyContent: "center", zIndex: 54, opacity: enter * exit, transform: `translateY(${y}px)`, padding: "0 40px"}}>
      <div style={{display: "flex", alignItems: "center", gap: 16, background: "rgba(13,17,23,0.92)", border: `2px solid ${CORAL}`, borderRadius: 16, padding: "16px 28px", boxShadow: "0 14px 40px rgba(0,0,0,0.55)"}}>
        <div style={{fontSize: 52, lineHeight: 1}}>{kp.emoji}</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 800, fontSize: 44, color: CORAL, letterSpacing: 0.2, whiteSpace: "nowrap"}}>{kp.title}</div>
      </div>
    </div>
  );
};

const HookCard: React.FC<{a: string; hi: string; b: string; sub: string}> = ({a, hi, b, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const enter = spring({frame, fps, config: {damping: 13, stiffness: 130, mass: 0.8}, durationInFrames: 16});
  const exitStart = 2.8 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 12], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [40, 0]);
  const word: React.CSSProperties = {
    fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, lineHeight: 1.05, textTransform: "uppercase",
    WebkitTextStroke: "7px #000000", paintOrder: "stroke fill", textShadow: "0 8px 20px rgba(0,0,0,0.85)", letterSpacing: -1,
  };
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: enter * exit}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "44px 44px", textAlign: "center", transform: `translateY(${y}px)`, background: "rgba(0,0,0,0.5)", borderRadius: 28, backdropFilter: "blur(2px)"}}>
        <div style={{...word, color: WHITE, fontSize: 54}}>{a}</div>
        <div style={{...word, color: CORAL, fontSize: 94}}>{hi}</div>
        <div style={{...word, color: WHITE, fontSize: 54}}>{b}</div>
        <div style={{marginTop: 8, fontFamily: `'${FONT}', sans-serif`, fontWeight: 700, fontSize: 34, color: WHITE, background: CORAL, padding: "10px 24px", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.4)"}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

// CTA final
const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const start = durationInFrames - Math.round(6 * fps);
  if (frame < start) return null;
  const local = frame - start;
  const enter = spring({frame: local, fps, config: {damping: 13, stiffness: 140}, durationInFrames: 16});
  loadGoogleFont(FONT);
  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 300, zIndex: 57, opacity: enter}}>
      <div style={{background: CORAL, borderRadius: 20, padding: "26px 48px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])})`}}>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 900, fontSize: 60, color: WHITE, letterSpacing: -1}}>Comenta “CANAL” 👇</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 600, fontSize: 32, color: "rgba(255,255,255,0.9)", marginTop: 6}}>se você só depende de indicação</div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsIndicacao: React.FC<ReelsIndicacaoProps> = ({
  videoSrc = "assets/reels_indicacao_base.mp4",
  captionsFile = "captions_indicacao.json",
  hookA = "INDICAÇÃO NÃO É CANAL",
  hookHi = "É SORTE",
  hookB = "COM NOME BONITO",
  hookSub = "e te deixa sem previsibilidade",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<UnderlineWord[]>([]);
  const [handle] = useState(() => delayRender("captions_indicacao"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: UnderlineWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0 && c.startMs >= 2800)
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
      <FinalCTA />
      <Sequence durationInFrames={Math.round(3.0 * fps)}>
        <HookCard a={hookA} hi={hookHi} b={hookB} sub={hookSub} />
      </Sequence>
      {/* legenda karaokê EM CIMA */}
      {words.length > 0 && (
        <UnderlineCaption words={words} chunkSize={3} fontSize={58} fontFamily={FONT} baseColor={WHITE} activeColor={CORAL} top={120} emphasis={EMPHASIS} />
      )}
    </AbsoluteFill>
  );
};
