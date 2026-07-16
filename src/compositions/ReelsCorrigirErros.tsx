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
import {MarkerCaption, MarkerWord, MarkerEmphasis} from "../components/text/MarkerCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsCorrigirErrosProps {
  videoSrc?: string;
  captionsFile?: string;
  hookA?: string;
  hookHi?: string;
  hookB?: string;
  hookSub?: string;
  transparent?: boolean;
}

const FONT = "Sora";
const TELA_TOP = 800;

// ---- Secoes (frames, timeline cortada) ----
const STEPS: {label: string; guide: string; from: number; to: number; color: string; guideTop: number}[] = [
  {label: "COMO FUNCIONA 🔗", guide: "Claude → GitHub → Vercel", from: 180, to: 1294, color: "#3b5bdb", guideTop: 860},
  {label: "1. VÊ O ERRO ❌", guide: "copia o erro no Vercel 👇", from: 1294, to: 1938, color: "#ef4444", guideTop: 860},
  {label: "2. COLA NO CLAUDE 🤖", guide: "cola o erro no Claude 👇", from: 1938, to: 2891, color: "#c2703f", guideTop: 860},
  {label: "3. DEU CERTO ✅", guide: "2º deploy funcionou 🎉", from: 2891, to: 3607, color: "#16a34a", guideTop: 860},
  {label: "DICA: O LOOP ⚠️", guide: "contexto grande? diminui", from: 3607, to: 4807, color: "#d97706", guideTop: 860},
];

// ---- Beats de emoji ----
const BEATS: {frame: number; emojis: string[]; x: number}[] = [
  {frame: 190, emojis: ["😱"], x: 84},
  {frame: 705, emojis: ["❌"], x: 12},
  {frame: 1300, emojis: ["❌", "🔍"], x: 84},
  {frame: 1945, emojis: ["🤖", "✨"], x: 12},
  {frame: 3164, emojis: ["✅", "🎉"], x: 84},
  {frame: 3931, emojis: ["🔁"], x: 12},
  {frame: 4980, emojis: ["🎉", "🔥", "🚀"], x: 50},
];

// ---- Palavras-chave (erro=vermelho, solucao=verde) ----
const EMPHASIS: Record<string, MarkerEmphasis> = {
  ERRO: {marker: "#ef4444", text: "#ffffff", emoji: "❌"},
  ERROS: {marker: "#ef4444", text: "#ffffff", emoji: "❌"},
  BUG: {marker: "#ef4444", text: "#ffffff", emoji: "🐛"},
  PROBLEMA: {marker: "#ef4444", text: "#ffffff", emoji: "⚠️"},
  CLAUDE: {marker: "#e8a87c", text: "#0d1117", emoji: "🤖"},
  IA: {marker: "#a855f7", text: "#ffffff", emoji: "🤖"},
  CORRIGIR: {marker: "#22c55e", text: "#0d1117", emoji: "✅"},
  CORRIGIU: {marker: "#22c55e", text: "#0d1117", emoji: "✅"},
  CORRIGE: {marker: "#22c55e", text: "#0d1117", emoji: "✅"},
  RESOLVEU: {marker: "#22c55e", text: "#0d1117", emoji: "✅"},
  FUNCIONOU: {marker: "#22c55e", text: "#0d1117", emoji: "🎉"},
  DEPLOY: {marker: "#0d1117", text: "#ffffff", emoji: "🚀"},
  VERCEL: {marker: "#0d1117", text: "#ffffff", emoji: "🚀"},
  GITHUB: {marker: "#ffffff", text: "#0d1117", emoji: "📦"},
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.14)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#ef4444,#FFE617,#22c55e)"}} />
    </div>
  );
};

const FlashTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const boundaries = STEPS.map((s) => s.from).filter((f) => f > 0);
  let op = 0;
  for (const b of boundaries) {
    const local = frame - b;
    if (local >= -3 && local <= 10) {
      op = Math.max(op, interpolate(local, [-3, 0, 10], [0, 0.7, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
    }
  }
  if (op <= 0) return null;
  return <AbsoluteFill style={{background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.9), rgba(255,255,255,0.6))", opacity: op, zIndex: 55, mixBlendMode: "screen"}} />;
};

const StepChip: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const step = STEPS.find((s) => frame >= s.from && frame < s.to);
  if (!step) return null;
  const local = frame - step.from;
  const enter = spring({frame: local, fps, config: {damping: 12, stiffness: 160, mass: 0.7}, durationInFrames: 16});
  const y = interpolate(enter, [0, 1], [-40, 0]);
  const scale = interpolate(enter, [0, 1], [0.7, 1]);
  return (
    <div style={{position: "absolute", top: 150, left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 50, transform: `translateY(${y}px) scale(${scale})`, opacity: Math.min(1, enter + 0.05)}}>
      <div style={{fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, fontSize: 38, color: "#ffffff", background: step.color, padding: "12px 32px", borderRadius: 14, border: "3px solid rgba(255,255,255,0.35)", boxShadow: "0 10px 26px rgba(0,0,0,0.5)", whiteSpace: "nowrap"}}>
        {step.label}
      </div>
    </div>
  );
};

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
    <div style={{position: "absolute", top: step.guideTop, left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 50, opacity: enter * exit, transform: `translateY(${interpolate(enter, [0, 1], [30, 0]) + bob}px)`}}>
      <div style={{fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, fontSize: 40, color: "#ffffff", background: "#ef4444", padding: "12px 26px", borderRadius: 16, boxShadow: "0 10px 24px rgba(0,0,0,0.45)", transform: "rotate(-2deg)", whiteSpace: "nowrap"}}>
        {step.guide}
      </div>
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
            <div key={`${bi}-${ei}`} style={{position: "absolute", left: `${b.x + ei * 6 - 3}%`, top: TELA_TOP + 40, fontSize: 100, zIndex: 52, opacity: fade, transform: `translateY(${rise}px) scale(${pop})`}}>
              {e}
            </div>
          );
        }),
      )}
    </>
  );
};

const HookCard: React.FC<{a: string; hi: string; b: string; sub: string}> = ({a, hi, b, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(FONT);
  const enter = spring({frame, fps, config: {damping: 13, stiffness: 130, mass: 0.8}, durationInFrames: 16});
  const exitStart = 2.5 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 12], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [-50, 0]);
  const wordStyle: React.CSSProperties = {
    fontFamily: `'${FONT}', sans-serif`,
    fontWeight: 800,
    fontSize: 70,
    lineHeight: 1.04,
    textTransform: "uppercase",
    WebkitTextStroke: "7px #000000",
    paintOrder: "stroke fill",
    textShadow: "0 8px 20px rgba(0,0,0,0.7)",
    letterSpacing: -1,
  };
  return (
    <div style={{position: "absolute", top: 40, left: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 50px", textAlign: "center", opacity: enter * exit, transform: `translateY(${y}px)`, zIndex: 58}}>
      <div style={{...wordStyle, color: "#ffffff"}}>{a}</div>
      <div style={{...wordStyle, color: "#ef4444", fontSize: 86}}>{hi}</div>
      <div style={{...wordStyle, color: "#ffffff"}}>{b}</div>
      <div style={{marginTop: 8, fontFamily: `'${FONT}', sans-serif`, fontWeight: 700, fontSize: 36, color: "#0d1117", background: "#22c55e", padding: "10px 24px", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.4)"}}>
        {sub}
      </div>
    </div>
  );
};

export const ReelsCorrigirErros: React.FC<ReelsCorrigirErrosProps> = ({
  videoSrc = "assets/reels_corrigir_base.mp4",
  captionsFile = "captions_corrigir.json",
  hookA = "MEU SITE",
  hookHi = "DEU ERRO",
  hookB = "E A IA RESOLVEU",
  hookSub = "sem eu tocar no código",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<MarkerWord[]>([]);
  const [handle] = useState(() => delayRender("captions_corrigir"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: MarkerWord[] = caps
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
      {!transparent && <OffthreadVideo src={staticFile(videoSrc)} style={{width: "100%", height: "100%", objectFit: "cover"}} />}

      <ProgressBar />
      <FlashTransition />
      <StepChip />
      <GuideCallout />
      <FloatingEmojis />

      <Sequence durationInFrames={Math.round(2.7 * fps)}>
        <HookCard a={hookA} hi={hookHi} b={hookB} sub={hookSub} />
      </Sequence>

      {words.length > 0 && (
        <MarkerCaption
          words={words}
          chunkSize={3}
          fontSize={64}
          fontFamily={FONT}
          baseColor="#ffffff"
          activeMarker="#FFE617"
          activeText="#0d1117"
          bottom={150}
          emphasis={EMPHASIS}
        />
      )}
    </AbsoluteFill>
  );
};
