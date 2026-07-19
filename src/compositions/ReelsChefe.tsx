import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {UnderlineCaption, UnderlineWord, UnderlineEmphasis} from "../components/text/UnderlineCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsChefeProps {
  videoSrc?: string;
  captionsFile?: string;
  hookA?: string;
  hookHi?: string;
  hookB?: string;
  hookSub?: string;
  transparent?: boolean;
}

const FONT = "Outfit";
// ---- PALETA ÚNICA (violeta) ----
const ACC = "#a855f7";
const ACC_LT = "#c084fc";
const INK = "#0d1117";
const WHITE = "#ffffff";

const EMPHASIS: Record<string, UnderlineEmphasis> = {
  CHEFE: {color: ACC},
  FUNCIONARIO: {color: ACC},
  FERIAS: {color: ACC},
  DOENTE: {color: ACC},
  DEMISSAO: {color: ACC},
  COMPETENCIA: {color: ACC},
  CLIENTE: {color: ACC},
  COMPRAR: {color: ACC},
  VENDER: {color: ACC},
  NEGOCIO: {color: ACC},
  SERVICO: {color: ACC},
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.18)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${ACC},${ACC_LT})`}} />
    </div>
  );
};

const HookCard: React.FC<{a: string; hi: string; b: string; sub: string}> = ({a, hi, b, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const enter = spring({frame, fps, config: {damping: 13, stiffness: 130, mass: 0.8}, durationInFrames: 16});
  const exitStart = 2.9 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 12], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [40, 0]);
  const word: React.CSSProperties = {
    fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, lineHeight: 1.05, textTransform: "uppercase",
    WebkitTextStroke: "7px #000000", paintOrder: "stroke fill", textShadow: "0 8px 20px rgba(0,0,0,0.85)", letterSpacing: -1,
  };
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: enter * exit}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "44px 44px", textAlign: "center", transform: `translateY(${y}px)`, background: "rgba(0,0,0,0.5)", borderRadius: 28, backdropFilter: "blur(2px)"}}>
        <div style={{...word, color: WHITE, fontSize: 56}}>{a}</div>
        <div style={{...word, color: ACC, fontSize: 96}}>{hi}</div>
        <div style={{...word, color: WHITE, fontSize: 56}}>{b}</div>
        <div style={{marginTop: 8, fontFamily: `'${FONT}', sans-serif`, fontWeight: 700, fontSize: 34, color: WHITE, background: ACC, padding: "10px 24px", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.4)"}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const start = durationInFrames - Math.round(4.5 * fps);
  if (frame < start) return null;
  const enter = spring({frame: frame - start, fps, config: {damping: 13, stiffness: 140}, durationInFrames: 16});
  loadGoogleFont(FONT);
  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 280, zIndex: 57, opacity: enter}}>
      <div style={{background: ACC, borderRadius: 20, padding: "26px 48px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])})`}}>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 900, fontSize: 58, color: WHITE, letterSpacing: -1}}>Me segue 👇</div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 600, fontSize: 30, color: "rgba(255,255,255,0.9)", marginTop: 6}}>é disso que eu falo aqui</div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsChefe: React.FC<ReelsChefeProps> = ({
  videoSrc = "assets/reels_chefe_base.mp4",
  captionsFile = "captions_chefe.json",
  hookA = "VOCÊ É O PIOR",
  hookHi = "CHEFE",
  hookB = "QUE VOCÊ JÁ TEVE",
  hookSub = "e nem percebe",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<UnderlineWord[]>([]);
  const [handle] = useState(() => delayRender("captions_chefe"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: UnderlineWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0 && c.startMs >= 2900)
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
      <FinalCTA />
      <Sequence durationInFrames={Math.round(3.1 * fps)}>
        <HookCard a={hookA} hi={hookHi} b={hookB} sub={hookSub} />
      </Sequence>
      {words.length > 0 && (
        <UnderlineCaption words={words} chunkSize={3} fontSize={60} fontFamily={FONT} baseColor={WHITE} activeColor={ACC} top={1080} emphasis={EMPHASIS} />
      )}
    </AbsoluteFill>
  );
};
