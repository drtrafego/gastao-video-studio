import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {AlertCaption, AlertWord} from "../components/text/AlertCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsCampanhasProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const SANS = "Space Grotesk";
// ---- PALETA UNICA: laranja (mesma do reels_ia_burra) ----
const ORANGE = "#f97316";
const ORANGE_LT = "#fb923c";
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

// Hook = fala literal de abertura (regra dura do projeto), 2 cards: setup e virada.
const HookCard: React.FC<{lines: string[]; accent?: boolean}> = ({lines, accent}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  loadGoogleFont(SANS);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 130, mass: 0.8}, durationInFrames: 14});
  const exitStart = durationInFrames - 10;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [30, 0]);
  return (
    <AbsoluteFill style={{justifyContent: "flex-start", alignItems: "center", paddingTop: 820, zIndex: 58, opacity: enter * exit}}>
      <div
        style={{
          maxWidth: 560,
          textAlign: "center",
          padding: "26px 32px",
          borderRadius: 22,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          transform: `translateY(${y}px)`,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: `'${SANS}', sans-serif`,
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1.25,
              color: accent && i === lines.length - 1 ? ORANGE : WHITE,
              WebkitTextStroke: "5px #000",
              paintOrder: "stroke fill",
              textShadow: "0 6px 18px rgba(0,0,0,0.85)",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Chip de destaque (embaixo, conforme pedido do Gastão)
const KeyChip: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(SANS);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 170, mass: 0.6}, durationInFrames: 10});
  const exit = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [20, 0]);
  return (
    <div style={{position: "absolute", top: 1340, left: 0, width: "100%", display: "flex", justifyContent: "flex-start", paddingLeft: 60, zIndex: 56}}>
      <div
        style={{
          maxWidth: 500,
          padding: "12px 22px",
          borderRadius: 14,
          background: "#150c05",
          border: `2px solid ${ORANGE}`,
          boxShadow: "0 10px 28px rgba(0,0,0,0.6)",
          opacity: enter * exit,
          transform: `translateY(${y}px)`,
        }}
      >
        <span style={{fontFamily: `'${SANS}', sans-serif`, fontWeight: 700, fontSize: 32, color: ORANGE_LT}}>{text}</span>
      </div>
    </div>
  );
};

export const ReelsCampanhas: React.FC<ReelsCampanhasProps> = ({
  videoSrc = "assets/campanha_base.mp4",
  captionsFile = "captions_campanha.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<AlertWord[]>([]);
  const [handle] = useState(() => delayRender("captions_campanha"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: AlertWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0 && c.startMs >= 10960)
          .map((c) => ({
            text: c.text.trim().replace(/^Cloud$/i, "Claude").replace(/^Cloud,$/i, "Claude,"),
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

      {/* Hook = fala literal de abertura (0 a 10.96s), 2 cards: setup e virada */}
      <Sequence from={0} durationInFrames={sf(4.64, fps)}>
        <HookCard lines={["Poucas pessoas sabem,", "mas hoje o Claude faz qualquer", "tarefa que necessita de raciocínio."]} />
      </Sequence>
      <Sequence from={sf(4.64, fps)} durationInFrames={sf(10.96, fps) - sf(4.64, fps)}>
        <HookCard lines={["Ele não vai substituir as pessoas,", "mas ajuda a facilitar o trabalho", "e otimizar o tempo."]} accent />
      </Sequence>

      {/* legenda karaoke laranja no MEIO (pedido do Gastao: topo nao aparece no feed).
          A partir da campanha4 (frame 4476 = 149.2s) o layout muda pra tela cheia
          do Gerenciador de Anuncios com cards de preview a direita (x630-900), entao
          a legenda desce pra ancorada a esquerda nesse trecho pra nao cobrir os cards. */}
      {words.filter((w) => w.startFrame < 4476).length > 0 && (
        <AlertCaption words={words.filter((w) => w.startFrame < 4476)} chunkSize={2} fontSize={54} top={1080} maxWidth={560} boxColor={ORANGE} />
      )}
      {words.filter((w) => w.startFrame >= 4476).length > 0 && (
        <AlertCaption words={words.filter((w) => w.startFrame >= 4476)} chunkSize={2} fontSize={54} top={1080} maxWidth={520} boxColor={ORANGE} align="left" left={50} />
      )}

      {/* chips de destaque embaixo (pedido do Gastao: embaixo eh mais confiavel que em cima) */}
      <Sequence from={sf(18.46, fps)} durationInFrames={sf(3.5, fps)}>
        <KeyChip text="AGÊNCIA DE TRÁFEGO 📈" dur={sf(3.5, fps)} />
      </Sequence>
      <Sequence from={sf(66.46, fps)} durationInFrames={sf(3.5, fps)}>
        <KeyChip text="24 HORAS ATIVO 🕐" dur={sf(3.5, fps)} />
      </Sequence>
      <Sequence from={sf(145.2, fps)} durationInFrames={sf(3.5, fps)}>
        <KeyChip text="GUARDA NA MEMÓRIA 🧠" dur={sf(3.5, fps)} />
      </Sequence>
    </AbsoluteFill>
  );
};
