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
import {PromptCaption, PromptWord} from "../components/text/PromptCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsTelinhaPretaProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const DISPLAY = "Space Grotesk";
const MONO = "JetBrains Mono";
// ---- PALETA UNICA: magenta neon sobre preto ----
const MAGENTA = "#FF2D95";
const MAGENTA_DK = "#4a0327";
const WHITE = "#ffffff";
const INK = "#08060a";

const sf = (s: number, fps: number) => Math.round(s * fps);

/**
 * Hook central na zona 4:5 do feed. Texto LITERAL da fala de abertura do
 * Gastao, em dois cards sincronizados com o que ele diz (0,18s a 8,10s).
 */
const HookCard: React.FC<{dur: number; children: React.ReactNode; fontSize?: number}> = ({
  dur,
  children,
  fontSize = 62,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  loadGoogleFont(MONO);
  const enter = spring({frame, fps, config: {damping: 15, stiffness: 155}, durationInFrames: 12});
  const out = interpolate(frame, [dur - 9, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: out}}>
      <div
        style={{
          background: "rgba(8,6,10,0.88)",
          border: `2px solid ${MAGENTA}`,
          borderRadius: 24,
          padding: "32px 42px",
          maxWidth: 960,
          textAlign: "center",
          boxShadow: `0 26px 60px rgba(0,0,0,0.65), 0 0 40px rgba(255,45,149,0.25)`,
          transform: `scale(${interpolate(enter, [0, 1], [0.88, 1])})`,
          opacity: enter,
        }}
      >
        <div
          style={{
            fontFamily: `'${MONO}',monospace`,
            fontWeight: 800,
            fontSize: 26,
            color: MAGENTA,
            letterSpacing: 1,
            marginBottom: 14,
            textAlign: "left",
          }}
        >
          {">"} gastaomatos{blink ? "_" : " "}
        </div>
        <div
          style={{
            fontFamily: `'${DISPLAY}',sans-serif`,
            fontWeight: 700,
            fontSize,
            color: WHITE,
            lineHeight: 1.12,
            letterSpacing: -1.2,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Chip de palavra-chave na tarja preta de baixo. */
const KeyChip: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(MONO);
  const enter = spring({frame, fps, config: {damping: 17, stiffness: 190}, durationInFrames: 8});
  const out = interpolate(frame, [dur - 7, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 1726,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 56,
        opacity: enter * out,
      }}
    >
      <div
        style={{
          fontFamily: `'${MONO}',monospace`,
          fontWeight: 800,
          fontSize: 38,
          color: WHITE,
          background: MAGENTA_DK,
          border: `2px solid ${MAGENTA}`,
          borderRadius: 14,
          padding: "14px 26px",
          letterSpacing: -0.8,
          transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px)`,
          boxShadow: `0 0 26px rgba(255,45,149,0.35)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Moldura de destaque sobre a area do terminal, com etiqueta. */
const FocusFrame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  dur: number;
  labelAbove?: boolean;
}> = ({x, y, w, h, label, dur, labelAbove = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(MONO);
  const enter = spring({frame, fps, config: {damping: 18, stiffness: 170}, durationInFrames: 9});
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(frame / 9));
  return (
    <div style={{position: "absolute", left: x, top: y, width: w, height: h, zIndex: 54, opacity: enter * out}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `4px solid ${MAGENTA}`,
          borderRadius: 16,
          boxShadow: `0 0 ${18 + pulse * 22}px rgba(255,45,149,${0.35 + pulse * 0.3}), inset 0 0 40px rgba(255,45,149,0.10)`,
          transform: `scale(${interpolate(enter, [0, 1], [1.05, 1])})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 10,
          [labelAbove ? "bottom" : "top"]: h + 12,
          fontFamily: `'${MONO}',monospace`,
          fontWeight: 800,
          fontSize: 34,
          color: WHITE,
          background: MAGENTA,
          borderRadius: 10,
          padding: "8px 18px",
          letterSpacing: -0.5,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 22px rgba(0,0,0,0.55)",
        } as React.CSSProperties}
      >
        {label}
      </div>
    </div>
  );
};

/** CTA final centralizado na zona segura. */
const FinalCTA: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  loadGoogleFont(MONO);
  const enter = spring({frame, fps, config: {damping: 15, stiffness: 160}, durationInFrames: 12});
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 59, opacity: out}}>
      <div
        style={{
          background: "rgba(8,6,10,0.88)",
          border: `2px solid ${MAGENTA}`,
          borderRadius: 24,
          padding: "34px 46px",
          textAlign: "center",
          transform: `scale(${interpolate(enter, [0, 1], [0.88, 1])})`,
          opacity: enter,
          boxShadow: `0 0 46px rgba(255,45,149,0.3)`,
        }}
      >
        <div
          style={{
            fontFamily: `'${DISPLAY}',sans-serif`,
            fontWeight: 700,
            fontSize: 64,
            color: WHITE,
            lineHeight: 1.08,
            letterSpacing: -1,
          }}
        >
          Quer aprender a<br />
          <span style={{color: MAGENTA}}>usar a telinha preta?</span>
        </div>
        <div
          style={{
            fontFamily: `'${MONO}',monospace`,
            fontWeight: 800,
            fontSize: 40,
            color: WHITE,
            marginTop: 22,
            background: MAGENTA_DK,
            border: `2px solid ${MAGENTA}`,
            borderRadius: 14,
            padding: "14px 24px",
            display: "inline-block",
          }}
        >
          comenta TERMINAL 👇
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Barra de progresso fina no topo absoluto. */
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 6, zIndex: 60}}>
      <div
        style={{
          width: `${p * 100}%`,
          height: "100%",
          background: MAGENTA,
          boxShadow: `0 0 14px ${MAGENTA}`,
        }}
      />
    </div>
  );
};

export const ReelsTelinhaPreta: React.FC<ReelsTelinhaPretaProps> = ({
  videoSrc = "assets/reels_telinha_base.mp4",
  captionsFile = "captions_telinha.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<PromptWord[]>([]);
  const [handle] = useState(() => delayRender("captions_telinha"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const startCut = 8150; // legenda entra depois da fala de abertura (hook)
        setWords(
          caps
            .filter((c) => c.text && c.text.trim() && c.startMs >= startCut)
            .map((c) => ({
              text: c.text.trim(),
              startFrame: Math.round((c.startMs / 1000) * fps),
              endFrame: Math.max(
                Math.round((c.endMs / 1000) * fps),
                Math.round((c.startMs / 1000) * fps) + 1
              ),
            }))
        );
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [captionsFile, fps, handle]);

  // chips de ponto-chave na tarja de baixo [inicio, duracao] em segundos
  const chips: {t: number; d: number; text: string}[] = [
    {t: 16.5, d: 5.0, text: "ele escreve o código 🤖"},
    {t: 22.6, d: 5.0, text: "você só precisa PERGUNTAR 🎯"},
    {t: 36.6, d: 4.6, text: "não precisa entender 🧠"},
    {t: 73.0, d: 5.0, text: "espera ele terminar ☕"},
    {t: 100.6, d: 4.6, text: "e ele te explica o erro 🧩"},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: transparent ? "transparent" : INK}}>
      {!transparent && (
        <OffthreadVideo
          src={staticFile(videoSrc)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      )}

      <ProgressBar />

      {/* hook = fala literal de abertura, em dois tempos */}
      <Sequence durationInFrames={sf(2.34, fps)}>
        <HookCard dur={sf(2.34, fps)} fontSize={66}>
          Pode parecer estranho isso que eu vou falar para vocês,
        </HookCard>
      </Sequence>
      <Sequence from={sf(2.34, fps)} durationInFrames={sf(6.06, fps)}>
        <HookCard dur={sf(6.06, fps)} fontSize={54}>
          mas essa telinha preta aqui embaixo onde eu trabalho, ele é{" "}
          <span style={{color: MAGENTA}}>muito mais fácil de manusear</span> do que vocês
          imaginam.
        </HookCard>
      </Sequence>

      {/* screencast tipo A: legenda karaoke na tarja preta de cima (rosto y733-817 livre) */}
      {words.length > 0 && (
        <PromptCaption words={words} chunkSize={3} fontSize={46} top={62} maxWidth={940} />
      )}

      {chips.map((c, i) => (
        <Sequence key={i} from={sf(c.t, fps)} durationInFrames={sf(c.d, fps)}>
          <KeyChip text={c.text} dur={sf(c.d, fps)} />
        </Sequence>
      ))}

      {/* destaque 1: "isso aqui e o agente trabalhando" */}
      <Sequence from={sf(52.2, fps)} durationInFrames={sf(4.6, fps)}>
        <FocusFrame x={46} y={900} w={988} h={400} label="o agente trabalhando" dur={sf(4.6, fps)} />
      </Sequence>

      {/* destaque 2: "daqui pra baixo e o que a gente precisa ver" */}
      <Sequence from={sf(88.6, fps)} durationInFrames={sf(4.4, fps)}>
        <FocusFrame
          x={46}
          y={1330}
          w={988}
          h={330}
          label="só o final importa 👀"
          dur={sf(4.4, fps)}
          labelAbove
        />
      </Sequence>

      <Sequence from={sf(117.0, fps)} durationInFrames={sf(5.1, fps)}>
        <FinalCTA dur={sf(5.1, fps)} />
      </Sequence>
    </AbsoluteFill>
  );
};
