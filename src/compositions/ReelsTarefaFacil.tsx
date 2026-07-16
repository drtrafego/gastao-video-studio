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
import {KaraokeCaption, KaraokeWord} from "../components/text/KaraokeCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsTarefaFacilProps {
  videoSrc?: string;
  captionsFile?: string;
  hook?: string;
  hookSub?: string;
}

// Barra de progresso fina no topo -> ajuda retencao (a pessoa ve que falta pouco)
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: "clamp",
  });
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.12)", zIndex: 30}}>
      <div style={{width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#6366f1,#22d3ee)"}} />
    </div>
  );
};

// Hook grande nos primeiros segundos -> segura o scroll
const HookCard: React.FC<{hook: string; hookSub: string}> = ({hook, hookSub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont("Poppins");
  const enter = spring({frame, fps, config: {damping: 200}});
  const exitStart = 2.4 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 12], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(enter, [0, 1], [40, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "0 60px",
        opacity: enter * exit,
        transform: `translateY(${y}px)`,
        zIndex: 25,
      }}
    >
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 900,
          fontSize: 82,
          lineHeight: 1.02,
          textAlign: "center",
          color: "#ffffff",
          textShadow: "0 6px 30px rgba(0,0,0,0.85)",
          letterSpacing: -1,
        }}
      >
        {hook}
      </div>
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 40,
          textAlign: "center",
          color: "#22d3ee",
          textShadow: "0 4px 20px rgba(0,0,0,0.9)",
        }}
      >
        {hookSub}
      </div>
    </div>
  );
};

export const ReelsTarefaFacil: React.FC<ReelsTarefaFacilProps> = ({
  videoSrc = "assets/reels_base.mp4",
  captionsFile = "captions_reels.json",
  hook = "Eu parei de pagar CapCut",
  hookSub = "e construi meu proprio sistema",
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<KaraokeWord[]>([]);
  const [handle] = useState(() => delayRender("carregando captions"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const w: KaraokeWord[] = caps
          .filter((c) => c.text && c.text.trim().length > 0 && !/^[\s.,!?;:]+$/.test(c.text))
          .map((c) => ({
            text: c.text.trim(),
            startFrame: Math.round((c.startMs / 1000) * fps),
            endFrame: Math.max(
              Math.round((c.endMs / 1000) * fps),
              Math.round((c.startMs / 1000) * fps) + 1,
            ),
          }));
        setWords(w);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [captionsFile, fps, handle]);

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <OffthreadVideo src={staticFile(videoSrc)} style={{width: "100%", height: "100%", objectFit: "cover"}} />

      <ProgressBar />

      <Sequence durationInFrames={Math.round(2.7 * fps)}>
        <HookCard hook={hook} hookSub={hookSub} />
      </Sequence>

      {words.length > 0 && (
        <KaraokeCaption
          words={words}
          fontSize={58}
          fontWeight={900}
          position="bottom"
          wordsPerLine={4}
          activeColor="#ffffff"
          pastColor="#22d3ee"
          futureColor="rgba(255,255,255,0.45)"
          highlightBg="rgba(99,102,241,0.45)"
          backgroundColor="rgba(0,0,0,0.55)"
          borderRadius={18}
          padding={22}
          style={{bottom: 210}}
        />
      )}
    </AbsoluteFill>
  );
};
