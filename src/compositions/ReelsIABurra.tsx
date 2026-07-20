import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {AlertCaption, AlertWord} from "../components/text/AlertCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsIABurraProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const SANS = "Space Grotesk";
const MONO = "JetBrains Mono";
// ---- PALETA UNICA: laranja-alerta (IA travou / Claude) ----
const ORANGE = "#f97316";
const ORANGE_LT = "#fb923c";
const RED = "#ef4444";
const INK = "#1a0f00";
const WHITE = "#ffffff";

const sf = (s: number, fps: number) => Math.round(s * fps);

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.16)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${ORANGE},${ORANGE_LT})`}} />
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
    fontFamily: `'${SANS}', sans-serif`, fontWeight: 700, lineHeight: 1.0, textTransform: "uppercase",
    WebkitTextStroke: "7px #000", paintOrder: "stroke fill", textShadow: "0 8px 22px rgba(0,0,0,0.85)", letterSpacing: -2,
  };
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: enter * exit}}>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "40px 44px", textAlign: "center", transform: `translateY(${y}px)`, background: "rgba(0,0,0,0.52)", borderRadius: 28, backdropFilter: "blur(2px)"}}>
        <div style={{...base, color: WHITE, fontSize: 82}}>SUA IA</div>
        <div style={{...base, color: ORANGE, fontSize: 116, textShadow: "0 0 34px rgba(249,115,22,0.6), 0 8px 22px rgba(0,0,0,0.85)"}}>FICOU BURRA?</div>
        <div style={{marginTop: 14, fontFamily: `'${SANS}', sans-serif`, fontWeight: 700, fontSize: 34, color: INK, background: ORANGE, padding: "10px 26px", borderRadius: 12}}>o problema não é ela 👇</div>
      </div>
    </AbsoluteFill>
  );
};

// card de destaque central (100%, comandos, navegador)
const StatCard: React.FC<{emoji: string; big: string; sub: string; dur: number; accent?: string; mono?: boolean}> = ({emoji, big, sub, dur, accent = ORANGE, mono}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(SANS);
  loadGoogleFont(MONO);
  const enter = spring({frame, fps, config: {damping: 12, stiffness: 160, mass: 0.7}, durationInFrames: 12});
  const exit = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const scale = interpolate(enter, [0, 1], [0.72, 1]);
  const y = interpolate(enter, [0, 1], [30, 0]);
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 57}}>
      <div style={{transform: `translateY(${y}px) scale(${scale})`, opacity: enter * exit, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "rgba(10,7,3,0.9)", border: `3px solid ${accent}`, borderRadius: 28, padding: "30px 50px", boxShadow: `0 18px 50px rgba(0,0,0,0.6), 0 0 44px ${accent}55`}}>
        <div style={{fontSize: 64, lineHeight: 1}}>{emoji}</div>
        <div style={{fontFamily: mono ? `'${MONO}',monospace` : `'${SANS}',sans-serif`, fontWeight: 800, fontSize: mono ? 84 : 100, color: accent, letterSpacing: -2, textShadow: `0 0 30px ${accent}66`}}>{big}</div>
        <div style={{fontFamily: `'${SANS}',sans-serif`, fontWeight: 700, fontSize: 38, color: WHITE, textAlign: "center", maxWidth: 760}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const start = durationInFrames - Math.round(2.6 * fps);
  if (frame < start) return null;
  const enter = spring({frame: frame - start, fps, config: {damping: 13, stiffness: 140}, durationInFrames: 16});
  loadGoogleFont(SANS);
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 59, opacity: enter}}>
      <div style={{background: ORANGE, borderRadius: 24, padding: "28px 50px", textAlign: "center", boxShadow: "0 22px 55px rgba(0,0,0,0.6)", transform: `scale(${interpolate(enter, [0, 1], [0.82, 1])})`}}>
        <div style={{fontFamily: `'${SANS}',sans-serif`, fontWeight: 800, fontSize: 76, color: INK, letterSpacing: -2, lineHeight: 1}}>Me segue 👇</div>
        <div style={{fontFamily: `'${SANS}',sans-serif`, fontWeight: 700, fontSize: 32, color: "rgba(26,15,0,0.75)", marginTop: 8}}>que eu posto mais dessas</div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsIABurra: React.FC<ReelsIABurraProps> = ({
  videoSrc = "assets/reels_burra_base.mp4",
  captionsFile = "captions_burra.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<AlertWord[]>([]);
  const [handle] = useState(() => delayRender("captions_burra"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: AlertWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0 && c.startMs >= 3000)
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

      <Sequence durationInFrames={sf(3.0, fps)}>
        <HookCard />
      </Sequence>

      {/* legenda sobre a parte baixa do terminal (cara fica na webcam, no topo),
          em top=1330: abaixo dos cards (centro) e ACIMA do rodape do Instagram (1450+). */}
      {words.length > 0 && (
        <AlertCaption words={words} chunkSize={3} fontSize={54} top={1330} />
      )}

      {/* cards de destaque nos momentos-chave */}
      <Sequence from={sf(20.6, fps)} durationInFrames={sf(5.4, fps)}>
        <StatCard emoji="🧠🔴" big="100%" sub="a janela de contexto encheu" dur={sf(5.4, fps)} accent={RED} />
      </Sequence>
      <Sequence from={sf(62.4, fps)} durationInFrames={sf(6.0, fps)}>
        <StatCard emoji="🗜️" big="/compact" sub="resume o chat e libera espaço" dur={sf(6.0, fps)} mono />
      </Sequence>
      <Sequence from={sf(72.6, fps)} durationInFrames={sf(6.4, fps)}>
        <StatCard emoji="🧹" big="/clear" sub="limpa tudo e recomeça do zero" dur={sf(6.4, fps)} mono />
      </Sequence>
      <Sequence from={sf(108, fps)} durationInFrames={sf(8.0, fps)}>
        <StatCard emoji="🌐" big="No navegador?" sub="peça um resumo e abra um chat novo" dur={sf(8.0, fps)} />
      </Sequence>

      <FinalCTA />
    </AbsoluteFill>
  );
};
