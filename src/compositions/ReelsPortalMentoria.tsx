import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {UnderlineCaption, UnderlineWord, UnderlineEmphasis} from "../components/text/UnderlineCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsPortalMentoriaProps {
  videoSrc?: string;
  captionsFile?: string;
  hookA?: string;
  hookHi?: string;
  hookB?: string;
  hookSub?: string;
  transparent?: boolean;
}

const FONT = "Outfit";

// Viradas (frames, timeline cortada) para flash
const FLASH_AT = [1339, 1940, 2097]; // erro->Claude, ->portal, ->valor(30 mil)

// Beats de emoji
const BEATS: {frame: number; emojis: string[]; x: number}[] = [
  {frame: 841, emojis: ["❌"], x: 84},
  {frame: 1076, emojis: ["📋"], x: 12},
  {frame: 1385, emojis: ["🤖", "✨"], x: 84},
  {frame: 2100, emojis: ["💰", "🤑"], x: 50},
  {frame: 2392, emojis: ["▶️"], x: 12},
  {frame: 3236, emojis: ["📄"], x: 84},
  {frame: 3660, emojis: ["🎉", "🔥"], x: 50},
];

const EMPHASIS: Record<string, UnderlineEmphasis> = {
  ERRO: {color: "#ff5252", emoji: "❌"},
  ERROS: {color: "#ff5252", emoji: "❌"},
  GITHUB: {color: "#ffffff", emoji: "📦"},
  VERCEL: {color: "#ffffff", emoji: "🚀"},
  LOG: {color: "#fbbf24", emoji: "📋"},
  CLAUDE: {color: "#e8a87c", emoji: "🤖"},
  PORTAL: {color: "#c084fc", emoji: "🎓"},
  MENTORIA: {color: "#c084fc", emoji: "🎓"},
  ALUNO: {color: "#c084fc", emoji: "👨‍🎓"},
  PLAYER: {color: "#22d3ee", emoji: "▶️"},
  PDF: {color: "#22d3ee", emoji: "📄"},
  MIL: {color: "#22c55e", emoji: "💰"},
};

const TELA_TOP = 800;

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.14)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#22d3ee,#22c55e)"}} />
    </div>
  );
};

const FlashTransition: React.FC = () => {
  const frame = useCurrentFrame();
  let op = 0;
  for (const b of FLASH_AT) {
    const local = frame - b;
    if (local >= -3 && local <= 10) op = Math.max(op, interpolate(local, [-3, 0, 10], [0, 0.6, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
  }
  if (op <= 0) return null;
  return <AbsoluteFill style={{background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.85), rgba(255,255,255,0.5))", opacity: op, zIndex: 55, mixBlendMode: "screen"}} />;
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
            <div key={`${bi}-${ei}`} style={{position: "absolute", left: `${b.x + ei * 6 - 3}%`, top: TELA_TOP + 30, fontSize: 104, zIndex: 52, opacity: fade, transform: `translateY(${rise}px) scale(${pop})`}}>
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
  const exitStart = 2.7 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 12], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [40, 0]);
  const word: React.CSSProperties = {
    fontFamily: `'${FONT}', sans-serif`, fontWeight: 800, lineHeight: 1.04, textTransform: "uppercase",
    WebkitTextStroke: "7px #000000", paintOrder: "stroke fill", textShadow: "0 8px 20px rgba(0,0,0,0.8)", letterSpacing: -1,
  };
  // Centralizado no MEIO do video (zona 4:5 que aparece no feed do Instagram).
  // Fundo escurecido atras pra legibilidade sobre o video.
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: enter * exit}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "44px 46px", textAlign: "center", transform: `translateY(${y}px)`, background: "rgba(0,0,0,0.42)", borderRadius: 28, backdropFilter: "blur(2px)"}}>
        <div style={{...word, color: "#ffffff", fontSize: 62}}>{a}</div>
        <div style={{...word, color: "#ff5252", fontSize: 90}}>{hi}</div>
        <div style={{...word, color: "#ffffff", fontSize: 62}}>{b}</div>
        <div style={{marginTop: 8, fontFamily: `'${FONT}', sans-serif`, fontWeight: 700, fontSize: 36, color: "#0d1117", background: "#22c55e", padding: "10px 24px", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.4)"}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsPortalMentoria: React.FC<ReelsPortalMentoriaProps> = ({
  videoSrc = "assets/reels_portal_base.mp4",
  captionsFile = "captions_portal.json",
  hookA = "PORTAL DE MENTORIA",
  hookHi = "CUSTAVA R$ 30 MIL",
  hookB = "HOJE PEÇO PRO CLAUDE",
  hookSub = "e sai de graça 🤯",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<UnderlineWord[]>([]);
  const [handle] = useState(() => delayRender("captions_portal"));

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
      <FlashTransition />
      <FloatingEmojis />
      <Sequence durationInFrames={Math.round(2.9 * fps)}>
        <HookCard a={hookA} hi={hookHi} b={hookB} sub={hookSub} />
      </Sequence>
      {words.length > 0 && (
        <UnderlineCaption words={words} chunkSize={3} fontSize={68} fontFamily={FONT} baseColor="#ffffff" activeColor="#22d3ee" bottom={210} emphasis={EMPHASIS} />
      )}
    </AbsoluteFill>
  );
};
