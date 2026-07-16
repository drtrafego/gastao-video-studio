import React from "react";
import {useCurrentFrame, useVideoConfig, spring, interpolate} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface PopWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface EmphasisStyle {
  color?: string;
  emoji?: string;
}

export interface PopCaptionProps {
  words: PopWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  baseColor?: string;
  activeColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  uppercase?: boolean;
  bottom?: number;
  /** Palavras-chave (UPPER, sem acento) -> cor + emoji + salto extra */
  emphasis?: Record<string, EmphasisStyle>;
  style?: React.CSSProperties;
}

const norm = (s: string) =>
  s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]/g, "");

// Legenda "word-pop" (TikTok): poucas palavras, palavra ativa salta,
// palavras-chave ganham cor + emoji + salto maior.
export const PopCaption: React.FC<PopCaptionProps> = ({
  words,
  chunkSize = 2,
  fontSize = 80,
  fontFamily = "Montserrat",
  fontWeight = 900,
  baseColor = "#ffffff",
  activeColor = "#FFE617",
  strokeColor = "#000000",
  strokeWidth = 9,
  uppercase = true,
  bottom = 370,
  emphasis = {},
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily);

  if (words.length === 0) return null;

  let activeIndex = words.findIndex(
    (w) => frame >= w.startFrame && frame <= w.endFrame,
  );
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
  const appear = spring({
    frame: frame - chunkStartFrame,
    fps,
    config: {damping: 200, stiffness: 150},
    durationInFrames: 8,
  });
  const appearY = interpolate(appear, [0, 1], [40, 0]);

  const stroke = `${strokeWidth}px ${strokeColor}`;
  const strokeShadow = "0 6px 16px rgba(0,0,0,0.6)";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        display: "flex",
        flexWrap: "wrap",
        gap: "14px 34px",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 70px",
        opacity: appear,
        transform: `translateY(${appearY}px)`,
        ...style,
      }}
    >
      {chunk.map((word, i) => {
        const globalIndex = start + i;
        const isActive = frame >= word.startFrame && frame <= word.endFrame;
        const emph = emphasis[norm(word.text)];
        const pop = isActive
          ? spring({
              frame: frame - word.startFrame,
              fps,
              config: {damping: 12, stiffness: 220, mass: 0.6},
              durationInFrames: 12,
            })
          : 0;
        const scale = 1 + pop * (emph ? 0.2 : 0.12);
        const color = emph?.color ?? (isActive ? activeColor : baseColor);
        return (
          <span
            key={globalIndex}
            style={{
              fontFamily: `'${fontFamily}', sans-serif`,
              fontWeight,
              fontSize: emph ? fontSize * 1.06 : fontSize,
              lineHeight: 1.05,
              color,
              WebkitTextStroke: stroke,
              paintOrder: "stroke fill",
              textShadow: strokeShadow,
              transform: `scale(${scale}) rotate(${isActive ? -1 * pop : 0}deg)`,
              transformOrigin: "center center",
              display: "inline-block",
              textTransform: uppercase ? "uppercase" : "none",
              letterSpacing: 0,
              whiteSpace: "nowrap",
            }}
          >
            {word.text}
            {emph?.emoji ? (
              <span style={{WebkitTextStroke: "0", marginLeft: 8}}>{emph.emoji}</span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
};
