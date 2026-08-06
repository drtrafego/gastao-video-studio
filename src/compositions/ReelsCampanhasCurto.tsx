import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {AlertCaption, AlertWord} from "../components/text/AlertCaption";
import {loadGoogleFont} from "../presets/fonts";
import {HookPart} from "./ReelsCampanhas";

export interface ReelsCampanhasCurtoProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const SANS = "Space Grotesk";
const ORANGE = "#f97316";
const ORANGE_LT = "#fb923c";

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

const HookCard: React.FC<{parts: HookPart[]}> = ({parts}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  loadGoogleFont(SANS);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 130, mass: 0.8}, durationInFrames: 14});
  const exitStart = durationInFrames - 10;
  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [30, 0]);
  const bigIndex = parts.findIndex((p) => p.big);
  const pop = spring({frame: frame - 8, fps, config: {damping: 11, stiffness: 200, mass: 0.6}, durationInFrames: 12});
  return (
    <AbsoluteFill style={{justifyContent: "flex-start", alignItems: "center", paddingTop: 780, zIndex: 58, opacity: enter * exit}}>
      <div
        style={{
          maxWidth: 620,
          textAlign: "center",
          padding: "24px 30px",
          borderRadius: 22,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(2px)",
          transform: `translateY(${y}px)`,
        }}
      >
        {parts.map((part, i) => (
          <div
            key={i}
            style={{
              fontFamily: `'${SANS}', sans-serif`,
              fontWeight: part.big ? 800 : 600,
              fontSize: part.big ? 70 : 34,
              lineHeight: part.big ? 1.05 : 1.3,
              letterSpacing: part.big ? -1 : 0,
              textTransform: part.big ? "uppercase" : "none",
              color: part.big ? ORANGE : "rgba(255,255,255,0.92)",
              WebkitTextStroke: part.big ? "6px #000" : "4px #000",
              paintOrder: "stroke fill",
              textShadow: part.big
                ? `0 0 34px rgba(249,115,22,0.65), 0 8px 20px rgba(0,0,0,0.9)`
                : "0 4px 14px rgba(0,0,0,0.85)",
              transform: part.big && i === bigIndex ? `scale(${interpolate(pop, [0, 1], [0.9, 1])})` : "none",
              marginTop: part.big ? 6 : 2,
              marginBottom: part.big ? 6 : 2,
            }}
          >
            {part.text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const KeyChip: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(SANS);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 170, mass: 0.6}, durationInFrames: 10});
  const exit = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [20, 0]);
  return (
    <div style={{position: "absolute", top: 1720, left: 0, width: "100%", display: "flex", justifyContent: "flex-start", paddingLeft: 60, zIndex: 56}}>
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

// Versao curta (~75s) do ReelsCampanhas (207s), pedido do Gastao 05/08: video de
// 3-4min nao performa bem no Instagram, cortar pras partes mais importantes,
// meta 1-1.5min. Mesma legenda/hook/chip, mas com os segmentos remapeados
// (ver build_short.cjs no scratchpad da sessao pra logica de selecao/remapeamento).
export const ReelsCampanhasCurto: React.FC<ReelsCampanhasCurtoProps> = ({
  videoSrc = "assets/campanha_curto_base.mp4",
  captionsFile = "captions_campanha_curto_v2.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<AlertWord[]>([]);
  const [handle] = useState(() => delayRender("captions_campanha_curto"));

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

  // boundary (06/08, correcao): a partir de 69.7s (frame 2091) entra o trecho que
  // faltava — a LISTA de campanhas da Meta, onde o Gastao fala "o Claude ja fez
  // toda a campanha, eu venho aqui e confiro" (a parte mais importante, tinha sido
  // cortada por engano). A partir de 77.266s (frame 2318) entra o fechamento
  // "espero que gostado, curta comenta compartilhe", ainda com webcam em cima +
  // cards da campanha embaixo (mesma tela do editor de criativo).
  const BOUNDARY_FRAME = 2091;
  const CTA_FRAME = 2318;

  return (
    <AbsoluteFill style={{backgroundColor: transparent ? "transparent" : "#000"}}>
      {!transparent && <OffthreadVideo src={staticFile(videoSrc)} style={{width: "100%", height: "100%", objectFit: "cover"}} />}

      <ProgressBar />

      <Sequence from={0} durationInFrames={sf(4.64, fps)}>
        <HookCard
          parts={[
            {text: "Poucas pessoas sabem,"},
            {text: "mas hoje o Claude"},
            {text: "faz qualquer tarefa", big: true},
            {text: "que necessita de raciocínio."},
          ]}
        />
      </Sequence>
      <Sequence from={sf(4.64, fps)} durationInFrames={sf(10.96, fps) - sf(4.64, fps)}>
        <HookCard
          parts={[
            {text: "Ele não vai substituir as pessoas,"},
            {text: "mas ajuda a"},
            {text: "facilitar o trabalho", big: true},
            {text: "e otimizar o tempo."},
          ]}
        />
      </Sequence>

      {words.filter((w) => w.startFrame < BOUNDARY_FRAME).length > 0 && (
        <AlertCaption words={words.filter((w) => w.startFrame < BOUNDARY_FRAME)} chunkSize={2} fontSize={54} top={770} maxWidth={560} boxColor={ORANGE} />
      )}
      {/* lista de campanhas: webcam y0-603 + tabela y603-826, legenda desce pro
          vao preto abaixo da tabela pra nao cobrir a linha da campanha. */}
      {words.filter((w) => w.startFrame >= BOUNDARY_FRAME && w.startFrame < CTA_FRAME).length > 0 && (
        <AlertCaption words={words.filter((w) => w.startFrame >= BOUNDARY_FRAME && w.startFrame < CTA_FRAME)} chunkSize={2} fontSize={50} top={900} maxWidth={560} boxColor={ORANGE} />
      )}
      {words.filter((w) => w.startFrame >= CTA_FRAME).length > 0 && (
        <AlertCaption words={words.filter((w) => w.startFrame >= CTA_FRAME)} chunkSize={2} fontSize={50} top={660} maxWidth={560} boxColor={ORANGE} />
      )}

      <Sequence from={sf(18.46, fps)} durationInFrames={sf(3.5, fps)}>
        <KeyChip text="AGÊNCIA DE TRÁFEGO 📈" dur={sf(3.5, fps)} />
      </Sequence>
      <Sequence from={sf(50.56, fps)} durationInFrames={sf(3.5, fps)}>
        <KeyChip text="24 HORAS ATIVO 🕐" dur={sf(3.5, fps)} />
      </Sequence>
      <Sequence from={sf(65.7, fps)} durationInFrames={sf(3.5, fps)}>
        <KeyChip text="GUARDA NA MEMÓRIA 🧠" dur={sf(3.5, fps)} />
      </Sequence>
    </AbsoluteFill>
  );
};
