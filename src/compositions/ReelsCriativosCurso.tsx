import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {AlertCaption, AlertWord} from "../components/text/AlertCaption";
import {HookPart} from "./ReelsCampanhas";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsCriativosCursoProps {
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
    <div style={{position: "absolute", top: 1340, left: 0, width: "100%", display: "flex", justifyContent: "flex-start", paddingLeft: 60, zIndex: 56}}>
      <div
        style={{
          maxWidth: 560,
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

// Video sobre o Gastao pedindo pro Claude gerar criativos pro curso "Claude Code do
// Zero" (7 imagens, 2 carrosseis, 3 videos, API nano banana, cor laranja igual ao
// Claude). Mesmo layout/paleta do ReelsCampanhas (mesma pessoa, mesmo setup de
// gravacao webcam+terminal empilhados, legenda na linha de corte y770 por pedido
// do Gastao 05/08).
export const ReelsCriativosCurso: React.FC<ReelsCriativosCursoProps> = ({
  videoSrc = "assets/criativos_curso_base.mp4",
  captionsFile = "captions_curso.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<AlertWord[]>([]);
  const [handle] = useState(() => delayRender("captions_curso"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: AlertWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0 && c.startMs >= 5700)
          .map((c) => ({
            text: c.text.trim().replace(/^Cloud$/i, "Claude").replace(/^Cloud,$/i, "Claude,").replace(/^Cloud\.$/i, "Claude."),
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

      {/* Hook = fala literal de abertura (0-5.7s) */}
      <Sequence from={0} durationInFrames={sf(5.7, fps)}>
        <HookCard
          parts={[
            {text: "Olha que"},
            {text: "coisa absurda!", big: true},
            {text: "O Claude está me ajudando a fazer um curso."},
          ]}
        />
      </Sequence>

      {/* legenda karaoke laranja na linha de corte webcam/tela (mesmo padrao do ReelsCampanhas) */}
      {words.length > 0 && (
        <AlertCaption words={words} chunkSize={2} fontSize={54} top={770} maxWidth={560} boxColor={ORANGE} />
      )}

      <Sequence from={sf(63.9, fps)} durationInFrames={sf(6.4, fps)}>
        <KeyChip text="7 IMAGENS + 2 CARROSSÉIS + 3 VÍDEOS 🖼️" dur={sf(6.4, fps)} />
      </Sequence>
      <Sequence from={sf(75.4, fps)} durationInFrames={sf(4.8, fps)}>
        <KeyChip text="API NANO BANANA 🍌" dur={sf(4.8, fps)} />
      </Sequence>
      <Sequence from={sf(95.5, fps)} durationInFrames={sf(13.0, fps)}>
        <KeyChip text="LARANJA IGUAL AO CLAUDE 🟠" dur={sf(13.0, fps)} />
      </Sequence>
    </AbsoluteFill>
  );
};
