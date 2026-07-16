import React from "react";
import {useCurrentFrame, useVideoConfig, spring, interpolate} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface BoxWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface BoxEmphasis {
  /** cor do bloco quando a palavra esta ativa */
  box?: string;
  /** cor do texto quando a palavra esta ativa */
  text?: string;
  emoji?: string;
}

export interface BoxCaptionProps {
  words: BoxWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  baseColor?: string;
  /** cor padrao do bloco da palavra ativa */
  activeBox?: string;
  activeText?: string;
  bottom?: number;
  emphasis?: Record<string, BoxEmphasis>;
}

const norm = (s: string) =>
  s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]/g, "");

// Legenda "highlight box" (estilo CapCut/Hormozi): a palavra ativa recebe
// um bloco solido atras. Palavras-chave trocam a cor do bloco e ganham emoji.
export const BoxCaption: React.FC<BoxCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 72,
  fontFamily = "Archivo",
  fontWeight = 800,
  baseColor = "#ffffff",
  activeBox = "#3FB950",
  activeText = "#0d1117",
  bottom = 96,
  emphasis = {},
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily);

  if (words.length === 0) return null;

  let activeIndex = words.findIndex((w) => frame >= w.startFrame && frame <= w.endFrame);
  if (activeIndex === -1) {
    if (frame < words[0].startFrame) activeIndex = 0;
    else {
      for (let i = words.length - 1; i >= 0; i--) {
        if (frame >= words[i].startFrame) {
          activeIndex = i;
          break;
        }
      }
      if (activeIndex === -1) activeIndex = 0;
    }
  }

  const chunkIdx = Math.floor(activeIndex / chunkSize);
  const start = chunkIdx * chunkSize;
  const chunk = words.slice(start, start + chunkSize);
  if (chunk.length === 0) return null;

  const chunkStartFrame = chunk[0].startFrame;
  const appear = spring({frame: frame - chunkStartFrame, fps, config: {damping: 200, stiffness: 160}, durationInFrames: 7});
  const appearY = interpolate(appear, [0, 1], [30, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        display: "flex",
        flexWrap: "wrap",
        gap: "12px 16px",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 60px",
        opacity: appear,
        transform: `translateY(${appearY}px)`,
      }}
    >
      {chunk.map((word, i) => {
        const globalIndex = start + i;
        const isActive = frame >= word.startFrame && frame <= word.endFrame;
        const emph = emphasis[norm(word.text)];
        const pop = isActive
          ? spring({frame: frame - word.startFrame, fps, config: {damping: 13, stiffness: 240, mass: 0.6}, durationInFrames: 10})
          : 0;
        const scale = 1 + pop * 0.08;
        const boxColor = emph?.box ?? activeBox;
        const showBox = isActive || !!emph;
        const txtColor = showBox ? emph?.text ?? activeText : baseColor;
        return (
          <span
            key={globalIndex}
            style={{
              fontFamily: `'${fontFamily}', sans-serif`,
              fontWeight,
              fontSize,
              lineHeight: 1.0,
              color: txtColor,
              background: showBox ? boxColor : "transparent",
              padding: showBox ? "6px 16px 10px" : "6px 4px 10px",
              borderRadius: 12,
              boxShadow: showBox ? "0 8px 20px rgba(0,0,0,0.45)" : "none",
              WebkitTextStroke: showBox ? "0" : "2px rgba(0,0,0,0.85)",
              paintOrder: "stroke fill",
              textShadow: showBox ? "none" : "0 4px 12px rgba(0,0,0,0.7)",
              transform: `scale(${scale})`,
              transformOrigin: "center bottom",
              display: "inline-block",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {word.text}
            {emph?.emoji ? <span style={{marginLeft: 8}}>{emph.emoji}</span> : null}
          </span>
        );
      })}
    </div>
  );
};
