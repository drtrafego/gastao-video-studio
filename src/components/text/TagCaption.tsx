import React from "react";
import {useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface TagWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface TagCaptionProps {
  words: TagWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  top?: number;
  maxWidth?: number;
  baseColor?: string;
  activeColor?: string;
  tagBg?: string;
}

/**
 * Estilo "tag de codigo": a palavra ativa entra numa pilha violeta translucida
 * com borda, o texto dela acende em violeta claro e as demais ficam brancas
 * sem fundo. Cada bloco entra deslizando de lado com leve blur (sensacao de
 * terminal escrevendo). Paleta unica violeta + branco.
 */
export const TagCaption: React.FC<TagCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 52,
  fontFamily = "Space Grotesk",
  top = 70,
  maxWidth = 900,
  baseColor = "#ffffff",
  activeColor = "#c4b5fd",
  tagBg = "rgba(124,58,237,0.32)",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily);

  const GAP = Math.round(fps * 1.2);
  const chunks: TagWord[][] = [];
  let cur: TagWord[] = [];
  for (const w of words) {
    if (cur.length > 0) {
      const prev = cur[cur.length - 1];
      if (cur.length >= chunkSize || w.startFrame - prev.endFrame > GAP) {
        chunks.push(cur);
        cur = [];
      }
    }
    cur.push(w);
  }
  if (cur.length) chunks.push(cur);

  const active = chunks.find(
    (c) => frame >= c[0].startFrame && frame <= c[c.length - 1].endFrame + 6
  );
  if (!active) return null;

  const chunkStart = active[0].startFrame;
  const appear = spring({
    frame: frame - chunkStart,
    fps,
    config: {damping: 20, stiffness: 170, mass: 0.5},
    durationInFrames: 8,
  });
  const x = interpolate(appear, [0, 1], [22, 0]);
  const blur = interpolate(appear, [0, 1], [6, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 55,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px 12px",
          maxWidth,
          transform: `translateX(${x}px)`,
          filter: `blur(${blur}px)`,
          opacity: appear,
        }}
      >
        {active.map((w, i) => {
          const isActive = frame >= w.startFrame && frame <= w.endFrame;
          const lift = isActive
            ? spring({
                frame: frame - w.startFrame,
                fps,
                config: {damping: 14, stiffness: 220, mass: 0.4},
                durationInFrames: 7,
              })
            : 0;
          return (
            <span
              key={i}
              style={{
                fontFamily: `'${fontFamily}', sans-serif`,
                fontWeight: 700,
                fontSize,
                lineHeight: 1.1,
                color: isActive ? activeColor : baseColor,
                display: "inline-block",
                padding: isActive ? "6px 16px" : "6px 4px",
                borderRadius: 12,
                background: isActive ? tagBg : "transparent",
                border: isActive
                  ? "2px solid rgba(167,139,250,0.55)"
                  : "2px solid transparent",
                transform: `translateY(${-lift * 4}px)`,
                letterSpacing: -0.4,
                textShadow: isActive
                  ? "0 0 20px rgba(167,139,250,0.45), 0 2px 8px rgba(0,0,0,0.8)"
                  : "0 2px 8px rgba(0,0,0,0.8)",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
