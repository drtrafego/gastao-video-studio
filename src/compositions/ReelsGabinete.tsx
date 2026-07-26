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
import {TagCaption, TagWord} from "../components/text/TagCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsGabineteProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const DISPLAY = "Space Grotesk";
// ---- PALETA UNICA: violeta ----
const VIOLET = "#a78bfa";
const VIOLET_DK = "#4c1d95";
const WHITE = "#ffffff";
const INK = "#0b0713";

const sf = (s: number, fps: number) => Math.round(s * fps);

// hook central na zona 4:5 do feed, sai antes de 3s
const HookCard: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  const enter = spring({frame, fps, config: {damping: 15, stiffness: 150}, durationInFrames: 12});
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: out}}>
      <div
        style={{
          background: "rgba(11,7,19,0.82)",
          border: `2px solid ${VIOLET}`,
          borderRadius: 26,
          padding: "38px 46px",
          maxWidth: 940,
          textAlign: "center",
          boxShadow: `0 26px 60px rgba(0,0,0,0.6)`,
          transform: `scale(${interpolate(enter, [0, 1], [0.86, 1])})`,
          opacity: enter,
        }}
      >
        <div
          style={{
            fontFamily: `'${DISPLAY}',sans-serif`,
            fontWeight: 700,
            fontSize: 74,
            color: WHITE,
            lineHeight: 1.06,
            letterSpacing: -1,
          }}
        >
          Não entendo <span style={{color: VIOLET}}>NADA</span> de código
        </div>
        <div
          style={{
            fontFamily: `'${DISPLAY}',sans-serif`,
            fontWeight: 500,
            fontSize: 40,
            color: "rgba(255,255,255,0.88)",
            marginTop: 18,
            lineHeight: 1.18,
          }}
        >
          e tô construindo o sistema de um advogado
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelsGabinete: React.FC<ReelsGabineteProps> = ({
  videoSrc = "assets/reels_gabinete_base.mp4",
  captionsFile = "captions_gabinete.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<TagWord[]>([]);
  const [handle] = useState(() => delayRender("captions_gabinete"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const startCut = 2900; // legenda entra depois do hook
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

  return (
    <AbsoluteFill style={{backgroundColor: transparent ? "transparent" : INK}}>
      {!transparent && (
        <OffthreadVideo
          src={staticFile(videoSrc)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      )}

      <Sequence durationInFrames={sf(2.9, fps)}>
        <HookCard dur={sf(2.9, fps)} />
      </Sequence>

      {/* screencast tipo A: legenda na tarja preta de cima, rosto e terminal livres */}
      {words.length > 0 && (
        <TagCaption words={words} chunkSize={3} fontSize={52} top={130} maxWidth={900} />
      )}
    </AbsoluteFill>
  );
};
