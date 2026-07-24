import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useVideoConfig,
  continueRender,
  delayRender,
} from "remotion";
import {MintCaption, MintWord} from "../components/text/MintCaption";

export interface ReelsAmandaProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

/**
 * Reel da Amanda: pedido foi SOMENTE LEGENDA (video ja cortado por ele).
 * Sem hook, sem chips, sem CTA, sem efeito. Paleta unica verde menta #00E08A.
 * Posicao top=1290 medida com grade: queixo mais baixo do video fica em y~1265.
 */
export const ReelsAmandaEstrutura: React.FC<ReelsAmandaProps> = ({
  videoSrc = "assets/reels_amanda_base.mp4",
  captionsFile = "captions_amanda.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<MintWord[]>([]);
  const [handle] = useState(() => delayRender("captions_amanda"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        setWords(
          caps
            .filter((c) => c.text && c.text.trim())
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
    <AbsoluteFill style={{backgroundColor: transparent ? "transparent" : "#05120d"}}>
      {!transparent && (
        <OffthreadVideo
          src={staticFile(videoSrc)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      )}

      {words.length > 0 && (
        <MintCaption words={words} chunkSize={3} fontSize={62} top={1290} maxWidth={800} />
      )}
    </AbsoluteFill>
  );
};
