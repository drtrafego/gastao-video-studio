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
// Hierarquia forte: linhas de contexto pequenas/brancas, linha de impacto GRANDE/laranja/glow
// (pedido do Gastao 05/08: o hook anterior ficou "tudo uma cor so", sem destaque, "nao virou Hook").
export interface HookPart {
  text: string;
  big?: boolean;
}
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

// Chip de destaque (embaixo, conforme pedido do Gastão)
const KeyChip: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(SANS);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 170, mass: 0.6}, durationInFrames: 10});
  const exit = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const y = interpolate(enter, [0, 1], [20, 0]);
  // chip desce pra dentro da tarja preta (comeca y1680), um pouco abaixo dela
  // (pedido do Gastao 05/08: estava em cima do terminal, cobrindo texto real)
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

export const ReelsCampanhas: React.FC<ReelsCampanhasProps> = ({
  videoSrc = "assets/campanha_base.mp4",
  captionsFile = "captions_campanha_v3.json",
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

      {/* Hook = fala literal de abertura (0 a 10.96s), 2 cards: setup e virada.
          Linha de impacto GRANDE/laranja/glow, resto pequeno/branco (pedido do Gastao). */}
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

      {/* legenda karaoke laranja bem no CORTE entre webcam (termina y816) e a tela
          (comeca y816), pedido do Gastao 05/08: nao quer mais lá embaixo (top=1080),
          quer centralizada exatamente na linha de emenda das duas cameras, que e
          area sem informacao importante e fica bem destacada. */}
      {words.filter((w) => w.startFrame < 4476).length > 0 && (
        <AlertCaption words={words.filter((w) => w.startFrame < 4476)} chunkSize={2} fontSize={54} top={770} maxWidth={560} boxColor={ORANGE} />
      )}
      {/* trecho novo (06/08, correcao): frame 4476-4702 mostra a LISTA de campanhas
          da Meta (a fala "o Claude ja fez toda a campanha, eu venho aqui e confiro"
          e a parte mais importante, tinha sido cortada por engano). Webcam em cima
          (y0-603) + tabela embaixo (y603-826), legenda desce pro vao preto abaixo
          da tabela (top=900) pra nao cobrir a linha da campanha. */}
      {words.filter((w) => w.startFrame >= 4476 && w.startFrame < 4703).length > 0 && (
        <AlertCaption words={words.filter((w) => w.startFrame >= 4476 && w.startFrame < 4703)} chunkSize={2} fontSize={50} top={900} maxWidth={560} boxColor={ORANGE} />
      )}
      {/* campanha4 antigo (frame>=4703, deslocado +227 frames pelo intro novo):
          webcam em cima (y0-608) + cards da campanha embaixo (y819-1709), com um
          vao preto sem informacao em y608-819 — mesma logica da linha de corte. */}
      {words.filter((w) => w.startFrame >= 4703).length > 0 && (
        <AlertCaption words={words.filter((w) => w.startFrame >= 4703)} chunkSize={2} fontSize={50} top={660} maxWidth={560} boxColor={ORANGE} />
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
