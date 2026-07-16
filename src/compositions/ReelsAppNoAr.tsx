import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  continueRender,
  delayRender,
  Sequence,
} from "remotion";
import {PopCaption, PopWord, EmphasisStyle} from "../components/text/PopCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsAppNoArProps {
  videoSrc?: string;
  captionsFile?: string;
  hookA?: string;
  hookHi?: string;
  hookB?: string;
  hookSub?: string;
  transparent?: boolean;
}

const FONT = "Montserrat";

// Fronteiras das secoes (frames, timeline cortada)
const STEPS: {label: string; guide: string; from: number; to: number; color: string}[] = [
  {label: "1. GitHub 📦", guide: "cria o repositório 👇", from: 342, to: 1094, color: "#24292f"},
  {label: "2. Claude Code 🤖", guide: "cola a URL no Claude 👇", from: 1094, to: 1804, color: "#d97757"},
  {label: "3. Vercel 🚀", guide: "conecta no Vercel 👇", from: 1804, to: 3184, color: "#000000"},
  {label: "4. No ar! 🌐", guide: "seu site publicado 🎉", from: 3184, to: 3536, color: "#16a34a"},
];

// Palavras-chave -> cor + emoji (norm remove acento e maiusculiza)
const EMPHASIS: Record<string, EmphasisStyle> = {
  GITHUB: {color: "#ffffff", emoji: "📦"},
  REPOSITORIO: {color: "#ffffff", emoji: "📦"},
  CLAUDE: {color: "#e8a87c", emoji: "🤖"},
  CLOUDCODE: {color: "#e8a87c", emoji: "🤖"},
  VERCEL: {color: "#ffffff", emoji: "🚀"},
  DEPLOY: {color: "#ffffff", emoji: "🚀"},
  DOMINIO: {color: "#22d3ee", emoji: "🌐"},
  SITE: {color: "#FFE617", emoji: "💻"},
  APLICATIVO: {color: "#FFE617", emoji: "📱"},
  APP: {color: "#FFE617", emoji: "📱"},
  IA: {color: "#FFE617", emoji: "🤖"},
  CODIGO: {color: "#a5b4fc", emoji: "👨‍💻"},
  CODIGOS: {color: "#a5b4fc", emoji: "👨‍💻"},
  FRONTEND: {color: "#22d3ee", emoji: "✨"},
  PESSOAS: {emoji: "👥"},
  ACESSO: {emoji: "🔑"},
};

// Barra de progresso
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.14)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#FFE617,#ff6a00)"}} />
    </div>
  );
};

// Flash branco nas trocas de secao (transicao)
const FlashTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const boundaries = STEPS.map((s) => s.from).filter((f) => f > 0);
  let op = 0;
  for (const b of boundaries) {
    const local = frame - b;
    if (local >= -3 && local <= 10) {
      op = Math.max(op, interpolate(local, [-3, 0, 10], [0, 0.75, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
    }
  }
  if (op <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.95), rgba(255,255,255,0.75))",
        opacity: op,
        zIndex: 55,
        mixBlendMode: "screen",
      }}
    />
  );
};

// Chip da etapa (topo) com emoji + entrada bounce
const StepChip: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const step = STEPS.find((s) => frame >= s.from && frame < s.to);
  if (!step) return null;
  const local = frame - step.from;
  const enter = spring({frame: local, fps, config: {damping: 11, stiffness: 160, mass: 0.7}, durationInFrames: 16});
  const y = interpolate(enter, [0, 1], [-40, 0]);
  const scale = interpolate(enter, [0, 1], [0.7, 1]);
  return (
    <div style={{position: "absolute", top: 30, left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 50, transform: `translateY(${y}px) scale(${scale})`, opacity: Math.min(1, enter + 0.05)}}>
      <div
        style={{
          fontFamily: `'${FONT}', sans-serif`,
          fontWeight: 800,
          fontSize: 36,
          color: "#ffffff",
          background: step.color,
          padding: "12px 30px",
          borderRadius: 999,
          border: "3px solid rgba(255,255,255,0.5)",
          boxShadow: "0 10px 26px rgba(0,0,0,0.5)",
          letterSpacing: 0.3,
          whiteSpace: "nowrap",
        }}
      >
        {step.label}
      </div>
    </div>
  );
};

// Callout guia com seta apontando pra tela (primeiros ~2.4s de cada secao)
const GuideCallout: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const step = STEPS.find((s) => frame >= s.from && frame < s.from + 80);
  if (!step) return null;
  const local = frame - step.from;
  const enter = spring({frame: local, fps, config: {damping: 13, stiffness: 150}, durationInFrames: 14});
  const exit = interpolate(local, [64, 80], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const bob = Math.sin(local / 5) * 6;
  return (
    <div style={{position: "absolute", top: 560, left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 50, opacity: enter * exit, transform: `translateY(${interpolate(enter, [0, 1], [30, 0]) + bob}px)`}}>
      <div
        style={{
          fontFamily: `'${FONT}', sans-serif`,
          fontWeight: 800,
          fontSize: 40,
          color: "#0a0a0a",
          background: "#FFE617",
          padding: "12px 26px",
          borderRadius: 16,
          boxShadow: "0 10px 24px rgba(0,0,0,0.45)",
          transform: "rotate(-2deg)",
          whiteSpace: "nowrap",
        }}
      >
        {step.guide}
      </div>
    </div>
  );
};

// Emojis flutuantes nos beats
const BEATS: {frame: number; emojis: string[]; x: number}[] = [
  {frame: 96, emojis: ["👀"], x: 82},
  {frame: 1100, emojis: ["🤖", "✨"], x: 16},
  {frame: 1810, emojis: ["🚀"], x: 84},
  {frame: 3190, emojis: ["🎉", "🔥", "🚀"], x: 50},
];

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
          const rise = interpolate(local, [0, 55], [0, -160]);
          const fade = interpolate(local, [0, 8, 40, 55], [0, 1, 1, 0], {extrapolateRight: "clamp"});
          return (
            <div
              key={`${bi}-${ei}`}
              style={{
                position: "absolute",
                left: `${b.x + ei * 6 - 3}%`,
                top: 470,
                fontSize: 110,
                zIndex: 52,
                opacity: fade,
                transform: `translateY(${rise}px) scale(${pop})`,
              }}
            >
              {e}
            </div>
          );
        }),
      )}
    </>
  );
};

// Hook de abertura com emoji + micro shake
const HookCard: React.FC<{a: string; hi: string; b: string; sub: string}> = ({a, hi, b, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const enter = spring({frame, fps, config: {damping: 12, stiffness: 130, mass: 0.8}, durationInFrames: 16});
  const exitStart = 2.5 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 12], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [60, 0]);
  const shake = frame < exitStart ? Math.sin(frame / 2.2) * 1.2 : 0;
  const stroke = "8px #000000";
  const strokeShadow = "0 8px 20px rgba(0,0,0,0.65)";
  const wordStyle: React.CSSProperties = {
    fontFamily: `'${FONT}', sans-serif`,
    fontWeight: 900,
    fontSize: 96,
    lineHeight: 1.02,
    textTransform: "uppercase",
    WebkitTextStroke: stroke,
    paintOrder: "stroke fill",
    textShadow: strokeShadow,
    letterSpacing: -2,
  };
  return (
    <div style={{position: "absolute", top: 150, left: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "0 50px", textAlign: "center", opacity: enter * exit, transform: `translateY(${y}px) rotate(${-1.5 + shake}deg)`, zIndex: 50}}>
      <div style={{...wordStyle, color: "#ffffff"}}>{a}</div>
      <div style={{...wordStyle, color: "#FFE617", fontSize: 120}}>{hi} 🔒</div>
      <div style={{...wordStyle, color: "#ffffff"}}>{b}</div>
      <div style={{marginTop: 10, fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, fontSize: 42, color: "#0a0a0a", background: "#FFE617", padding: "12px 26px", borderRadius: 14, transform: "rotate(1.5deg)", boxShadow: "0 6px 18px rgba(0,0,0,0.4)"}}>
        {sub} 🚀
      </div>
    </div>
  );
};

export const ReelsAppNoAr: React.FC<ReelsAppNoArProps> = ({
  videoSrc = "assets/reels3_base.mp4",
  captionsFile = "captions_reels3.json",
  hookA = "SEU PRIMEIRO APP",
  hookHi = "PRESO",
  hookB = "NO SEU PC",
  hookSub = "3 ferramentas pra botar no ar",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<PopWord[]>([]);
  const [handle] = useState(() => delayRender("captions3"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: PopWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0 && c.startMs >= 2600)
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
      {!transparent && (
        <OffthreadVideo src={staticFile(videoSrc)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      )}

      <ProgressBar />
      <FlashTransition />
      <StepChip />
      <GuideCallout />
      <FloatingEmojis />

      <Sequence durationInFrames={Math.round(2.7 * fps)}>
        <HookCard a={hookA} hi={hookHi} b={hookB} sub={hookSub} />
      </Sequence>

      {words.length > 0 && (
        <PopCaption
          words={words}
          chunkSize={2}
          fontSize={80}
          activeColor="#FFE617"
          baseColor="#ffffff"
          strokeColor="#000000"
          strokeWidth={9}
          bottom={370}
          emphasis={EMPHASIS}
        />
      )}
    </AbsoluteFill>
  );
};
