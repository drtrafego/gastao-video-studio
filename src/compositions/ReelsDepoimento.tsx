import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender,
} from "remotion";
import {AlertCaption, AlertWord} from "../components/text/AlertCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsDepoimentoProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const SANS = "Space Grotesk";
// PALETA UNICA: violeta (cor das bolhas do WhatsApp que ja aparecem no video,
// formato "diferente" pedido pelo Gastao: legenda EM CIMA linkada ao audio,
// waveform do WhatsApp tocando EMBAIXO, sem o nome do cliente aparecendo)
const VIOLET = "#7c3aed";
const VIOLET_LT = "#a78bfa";

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.16)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${VIOLET},${VIOLET_LT})`}} />
    </div>
  );
};

const Badge: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(SANS);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 140}, durationInFrames: 16});
  return (
    <div style={{position: "absolute", top: 70, left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 57, opacity: enter}}>
      <div style={{display: "flex", alignItems: "center", gap: 10, background: "rgba(124,58,237,0.18)", border: `2px solid ${VIOLET}`, borderRadius: 30, padding: "10px 24px"}}>
        <span style={{fontSize: 26}}>🎙️</span>
        <span style={{fontFamily: `'${SANS}',sans-serif`, fontWeight: 700, fontSize: 26, color: VIOLET_LT, letterSpacing: 1, textTransform: "uppercase"}}>depoimento real</span>
      </div>
    </div>
  );
};

// Vídeo de depoimento (cliente mandando áudio no WhatsApp comentando a
// mentoria). Formato "em alta" pedido pelo Gastão: waveform do WhatsApp
// tocando embaixo (já sem o nome do cliente, cortado no reframe), legenda
// ligada ao que está sendo dito em cima, no espaço vazio acima do chat.
export const ReelsDepoimento: React.FC<ReelsDepoimentoProps> = ({
  videoSrc = "assets/depoimento_base.mp4",
  captionsFile = "captions_dep.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<AlertWord[]>([]);
  const [handle] = useState(() => delayRender("captions_dep"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: AlertWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0)
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
      <Badge />

      {/* legenda no espaco vazio ACIMA do chat (video ocupa y770-1920) */}
      {words.length > 0 && (
        <AlertCaption words={words} chunkSize={3} fontSize={50} top={320} maxWidth={860} boxColor={VIOLET} activeColor="#ffffff" inkColor="#2e1065" />
      )}
    </AbsoluteFill>
  );
};
