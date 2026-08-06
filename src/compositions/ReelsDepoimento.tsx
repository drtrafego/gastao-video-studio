import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, continueRender, delayRender,
} from "remotion";
import {AlertCaption, AlertWord} from "../components/text/AlertCaption";

export interface ReelsDepoimentoProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}
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

// Vídeo de depoimento (cliente mandando áudio no WhatsApp comentando a
// mentoria). Formato "em alta" pedido pelo Gastão (referências do Instagram):
// EM CIMA entra filmagem REAL relacionada ao que o cliente está contando (aqui,
// trecho do reels_gabinete.mp4 mostrando o Gastão construindo o sistema do
// advogado — o cliente fala de petição/IA/Google Drive, bate direto com isso),
// EMBAIXO o WhatsApp com a voz dele tocando (nome cortado). Legenda fica bem
// na linha de corte entre as duas metades, não no meio do espaço vazio.
export const ReelsDepoimento: React.FC<ReelsDepoimentoProps> = ({
  videoSrc = "assets/depoimento_base.mp4",
  captionsFile = "captions_dep_full.json",
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

      {/* legenda na linha de corte entre a filmagem (0-770) e o WhatsApp (770-1920) */}
      {words.length > 0 && (
        <AlertCaption words={words} chunkSize={3} fontSize={48} top={700} maxWidth={860} boxColor={VIOLET} activeColor="#ffffff" inkColor="#2e1065" />
      )}
    </AbsoluteFill>
  );
};
