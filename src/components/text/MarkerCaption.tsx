import React from "react";
import {useCurrentFrame, useVideoConfig, spring, interpolate} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface MarkerWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface MarkerEmphasis {
  /** cor do marcador (marca-texto) da palavra */
  marker?: string;
  /** cor do texto */
  text?: string;
  emoji?: string;
}

export interface MarkerCaptionProps {
  words: MarkerWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  baseColor?: string;
  /** cor do marca-texto padrao da palavra ativa */
  activeMarker?: string;
  activeText?: string;
  bottom?: number;
  emphasis?: Record<string, MarkerEmphasis>;
}

const norm = (s: string) =>
  s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]/g, "");

// Legenda "marca-texto": a palavra ativa recebe um marcador que pinta da
// esquerda pra direita (efeito caneta). Palavras-chave trocam a cor do marcador.
export const MarkerCaption: React.FC<MarkerCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 66,
  fontFamily = "Sora",
  fontWeight = 800,
  baseColor = "#ffffff",
  activeMarker = "#FFE617",
  activeText = "#0d1117",
  bottom = 150,
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
  const appear = spring({frame: frame - chunkStartFrame, fps, config: {damping: 200, stiffness: 170}, durationInFrames: 6});
  const appearY = interpolate(appear, [0, 1], [24, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        display: "flex",
        flexWrap: "wrap",
        gap: "10px 18px",
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
        const highlighted = isActive || !!emph;
        const markerColor = emph?.marker ?? activeMarker;
        const txtColor = highlighted ? emph?.text ?? activeText : baseColor;
        // marcador pinta da esquerda pra direita
        const paint = isActive
          ? spring({frame: frame - word.startFrame, fps, config: {damping: 20, stiffness: 200}, durationInFrames: 8})
          : emph
          ? 1
          : 0;
        return (
          <span
            key={globalIndex}
            style={{
              position: "relative",
              display: "inline-block",
              fontFamily: `'${fontFamily}', sans-serif`,
              fontWeight,
              fontSize,
              lineHeight: 1.08,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              padding: "2px 10px",
            }}
          >
            {/* marcador (fundo) */}
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "12%",
                bottom: "8%",
                background: markerColor,
                borderRadius: 8,
                transform: `scaleX(${paint})`,
                transformOrigin: "left center",
                zIndex: 0,
                boxShadow: highlighted ? "0 6px 16px rgba(0,0,0,0.4)" : "none",
              }}
            />
            {/* texto */}
            <span
              style={{
                position: "relative",
                zIndex: 1,
                color: paint > 0.5 ? txtColor : baseColor,
                WebkitTextStroke: highlighted ? "0" : "2px rgba(0,0,0,0.8)",
                paintOrder: "stroke fill",
                textShadow: highlighted ? "none" : "0 4px 12px rgba(0,0,0,0.7)",
              }}
            >
              {word.text}
              {emph?.emoji ? <span style={{marginLeft: 8, WebkitTextStroke: "0"}}>{emph.emoji}</span> : null}
            </span>
          </span>
        );
      })}
    </div>
  );
};
