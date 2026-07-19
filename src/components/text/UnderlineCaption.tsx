import React from "react";
import {useCurrentFrame, useVideoConfig, spring, interpolate} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface UnderlineWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface UnderlineEmphasis {
  color?: string;
  emoji?: string;
}

export interface UnderlineCaptionProps {
  words: UnderlineWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  baseColor?: string;
  activeColor?: string;
  bottom?: number;
  /** se definido, posiciona pelo topo em vez do rodape (legenda em cima) */
  top?: number;
  emphasis?: Record<string, UnderlineEmphasis>;
}

const norm = (s: string) =>
  s.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Z0-9]/g, "");

// Legenda "underline": palavras limpas em linha; a palavra ativa muda de cor e ganha
// um sublinhado colorido que cresce da esquerda p/ direita. Estilo distinto de
// BoxCaption (bloco), MarkerCaption (marca-texto) e PopCaption (salto).
export const UnderlineCaption: React.FC<UnderlineCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 70,
  fontFamily = "Outfit",
  fontWeight = 700,
  baseColor = "#ffffff",
  activeColor = "#22d3ee",
  bottom = 210,
  top,
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
        if (frame >= words[i].startFrame) { activeIndex = i; break; }
      }
      if (activeIndex === -1) activeIndex = 0;
    }
  }

  const chunkIdx = Math.floor(activeIndex / chunkSize);
  const start = chunkIdx * chunkSize;
  const chunk = words.slice(start, start + chunkSize);
  if (chunk.length === 0) return null;

  const appear = spring({frame: frame - chunk[0].startFrame, fps, config: {damping: 200, stiffness: 160}, durationInFrames: 6});
  const appearY = interpolate(appear, [0, 1], [26, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...(top != null ? {top} : {bottom}),
        display: "flex",
        flexWrap: "wrap",
        gap: "10px 20px",
        justifyContent: "center",
        alignItems: "flex-end",
        padding: "0 70px",
        opacity: appear,
        transform: `translateY(${appearY}px)`,
      }}
    >
      {chunk.map((word, i) => {
        const gi = start + i;
        const isActive = frame >= word.startFrame && frame <= word.endFrame;
        const emph = emphasis[norm(word.text)];
        const color = isActive ? emph?.color ?? activeColor : baseColor;
        const grow = isActive
          ? spring({frame: frame - word.startFrame, fps, config: {damping: 22, stiffness: 200}, durationInFrames: 9})
          : 0;
        return (
          <span
            key={gi}
            style={{
              position: "relative",
              display: "inline-block",
              fontFamily: `'${fontFamily}', sans-serif`,
              fontWeight,
              fontSize,
              lineHeight: 1.05,
              color,
              textTransform: "uppercase",
              WebkitTextStroke: "1.5px rgba(0,0,0,0.55)",
              paintOrder: "stroke fill",
              textShadow: "0 4px 14px rgba(0,0,0,0.7)",
              whiteSpace: "nowrap",
              paddingBottom: 12,
            }}
          >
            {word.text}
            {emph?.emoji ? <span style={{marginLeft: 8, WebkitTextStroke: "0"}}>{emph.emoji}</span> : null}
            {/* sublinhado que cresce */}
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                height: 8,
                width: "100%",
                borderRadius: 4,
                background: emph?.color ?? activeColor,
                transform: `scaleX(${grow})`,
                transformOrigin: "left center",
                boxShadow: `0 0 12px ${emph?.color ?? activeColor}`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
};
