import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {NeonCaption, NeonWord} from "../components/text/NeonCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsMetaProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const MONO = "JetBrains Mono";
const SANS = "Manrope";
// ---- PALETA UNICA: verde-neon tech (robo / burlar sistema) ----
const NEON = "#39ff7a";
const NEON_DK = "#16a34a";
const INK = "#0a0f0a";
const WHITE = "#ffffff";

const sf = (s: number, fps: number) => Math.round(s * fps);

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.16)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${NEON_DK},${NEON})`}} />
    </div>
  );
};

const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(SANS);
  const enter = spring({frame, fps, config: {damping: 13, stiffness: 130, mass: 0.8}, durationInFrames: 16});
  const exitStart = 2.7 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 12], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [40, 0]);
  const base: React.CSSProperties = {
    fontFamily: `'${SANS}', sans-serif`, fontWeight: 800, lineHeight: 1.02, textTransform: "uppercase",
    WebkitTextStroke: "7px #000", paintOrder: "stroke fill", textShadow: "0 8px 22px rgba(0,0,0,0.85)", letterSpacing: -1.5,
  };
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: enter * exit}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "42px 42px", textAlign: "center", transform: `translateY(${y}px)`, background: "rgba(0,0,0,0.52)", borderRadius: 28, backdropFilter: "blur(2px)"}}>
        <div style={{...base, color: WHITE, fontSize: 78}}>A META NÃO</div>
        <div style={{...base, color: NEON, fontSize: 104, textShadow: "0 0 34px rgba(57,255,122,0.6), 0 8px 22px rgba(0,0,0,0.85)"}}>DETECTA ISSO</div>
        <div style={{marginTop: 12, fontFamily: `'${MONO}', monospace`, fontWeight: 700, fontSize: 32, color: INK, background: NEON, padding: "10px 26px", borderRadius: 12}}>um robô prospecta por você 🤖</div>
      </div>
    </AbsoluteFill>
  );
};

// chip callout (emoji + texto) posicionado no rodape
const Callout: React.FC<{emoji: string; text: string; dur: number; bottom?: number}> = ({emoji, text, dur, bottom = 150}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(SANS);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 150, mass: 0.7}, durationInFrames: 12});
  const exit = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const x = interpolate(enter, [0, 1], [-40, 0]);
  return (
    <div style={{position: "absolute", bottom, width: "100%", display: "flex", justifyContent: "center", zIndex: 56, opacity: enter * exit}}>
      <div style={{transform: `translateX(${x}px)`, display: "flex", alignItems: "center", gap: 14, background: "rgba(6,12,8,0.9)", border: `2px solid ${NEON}`, borderRadius: 18, padding: "16px 26px", boxShadow: `0 12px 34px rgba(0,0,0,0.5), 0 0 26px rgba(57,255,122,0.25)`}}>
        <span style={{fontSize: 46}}>{emoji}</span>
        <span style={{fontFamily: `'${SANS}',sans-serif`, fontWeight: 800, fontSize: 42, color: WHITE, letterSpacing: -0.5}}>{text}</span>
      </div>
    </div>
  );
};

// selo do punchline "sem API" (topo, durante o rosto)
const ApiSeal: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(SANS);
  const enter = spring({frame, fps, config: {damping: 12, stiffness: 140}, durationInFrames: 14});
  const exit = interpolate(frame, [dur - 10, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const pulse = 1 + Math.sin(frame / 5) * 0.02;
  return (
    <div style={{position: "absolute", top: 150, width: "100%", display: "flex", justifyContent: "center", zIndex: 57, opacity: enter * exit}}>
      <div style={{transform: `scale(${interpolate(enter, [0, 1], [0.7, 1]) * pulse})`, textAlign: "center", background: "rgba(6,12,8,0.92)", border: `2px solid ${NEON}`, borderRadius: 22, padding: "22px 40px", boxShadow: "0 0 40px rgba(57,255,122,0.3)"}}>
        <div style={{fontFamily: `'${MONO}',monospace`, fontWeight: 800, fontSize: 40, color: NEON, letterSpacing: -1}}>🔒 SEM API</div>
        <div style={{fontFamily: `'${SANS}',sans-serif`, fontWeight: 800, fontSize: 34, color: WHITE, marginTop: 6}}>a Meta não consegue ver</div>
      </div>
    </div>
  );
};

const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const start = durationInFrames - Math.round(2.4 * fps);
  if (frame < start) return null;
  const enter = spring({frame: frame - start, fps, config: {damping: 13, stiffness: 140}, durationInFrames: 16});
  loadGoogleFont(SANS);
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", paddingBottom: 60, zIndex: 59, opacity: enter}}>
      <div style={{background: NEON, borderRadius: 24, padding: "30px 52px", textAlign: "center", boxShadow: "0 22px 55px rgba(0,0,0,0.55)", transform: `scale(${interpolate(enter, [0, 1], [0.82, 1])})`}}>
        <div style={{fontFamily: `'${SANS}',sans-serif`, fontWeight: 900, fontSize: 60, color: INK, letterSpacing: -1}}>Comenta</div>
        <div style={{fontFamily: `'${MONO}',monospace`, fontWeight: 800, fontSize: 84, color: INK, letterSpacing: -3, lineHeight: 1}}>ROBÔ 👇</div>
        <div style={{fontFamily: `'${SANS}',sans-serif`, fontWeight: 700, fontSize: 30, color: "rgba(10,15,10,0.75)", marginTop: 8}}>que eu te mostro como</div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsMetaRobo: React.FC<ReelsMetaProps> = ({
  videoSrc = "assets/reels_meta_base.mp4",
  captionsFile = "captions_meta.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [wordsTH, setWordsTH] = useState<NeonWord[]>([]);
  const [wordsScreen, setWordsScreen] = useState<NeonWord[]>([]);
  const [handle] = useState(() => delayRender("captions_meta"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const toW = (c: {text: string; startMs: number; endMs: number}): NeonWord => ({
          text: c.text.trim(),
          startFrame: Math.round((c.startMs / 1000) * fps),
          endFrame: Math.max(Math.round((c.endMs / 1000) * fps), Math.round((c.startMs / 1000) * fps) + 1),
        });
        const valid = caps.filter((c) => c.text && c.text.trim().length > 0);
        // TH (rosto): apos hook ate 15s, e depois de 58s
        setWordsTH(valid.filter((c) => (c.startMs >= 3000 && c.startMs < 15000) || c.startMs >= 58000).map(toW));
        // screen: 15s a 58s
        setWordsScreen(valid.filter((c) => c.startMs >= 15000 && c.startMs < 58000).map(toW));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [captionsFile, fps, handle]);

  return (
    <AbsoluteFill style={{backgroundColor: transparent ? "transparent" : "#000"}}>
      {!transparent && <OffthreadVideo src={staticFile(videoSrc)} style={{width: "100%", height: "100%", objectFit: "cover"}} />}

      <ProgressBar />

      <Sequence durationInFrames={sf(3.0, fps)}>
        <HookCard />
      </Sequence>

      {/* legenda: rosto em close ocupa ate ~y1250 -> legenda no PEITO (1380), fora da cara.
          tela: sem rosto -> legenda no topo (180) sobre area escura do navegador. */}
      {wordsTH.length > 0 && <NeonCaption words={wordsTH} chunkSize={3} fontSize={56} top={1380} />}
      {wordsScreen.length > 0 && <NeonCaption words={wordsScreen} chunkSize={3} fontSize={52} top={180} />}

      {/* callouts sobre a tela (bloco screen 15-58s) */}
      <Sequence from={sf(18, fps)} durationInFrames={sf(8, fps)}>
        <Callout emoji="🔍" text="varrendo o Instagram" dur={sf(8, fps)} bottom={150} />
      </Sequence>
      <Sequence from={sf(33, fps)} durationInFrames={sf(6, fps)}>
        <Callout emoji="🎯" text="achou a dermatologista" dur={sf(6, fps)} bottom={150} />
      </Sequence>
      <Sequence from={sf(44, fps)} durationInFrames={sf(11, fps)}>
        <Callout emoji="🤖" text="DM automática e personalizada" dur={sf(11, fps)} bottom={150} />
      </Sequence>

      {/* punchline sem API (rosto 58-80s) */}
      <Sequence from={sf(62, fps)} durationInFrames={sf(11, fps)}>
        <ApiSeal dur={sf(11, fps)} />
      </Sequence>

      <FinalCTA />
    </AbsoluteFill>
  );
};
