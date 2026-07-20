import React from "react";
import {useCurrentFrame, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface NeonWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface NeonCaptionProps {
  words: NeonWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  top?: number;
  baseColor?: string;
  activeColor?: string;
  rangeStartMs?: number; // filtro opcional ja aplicado fora; aqui so estilo
}

// Estilo "terminal/robo": fonte mono, palavra ativa verde-neon com glow +
// sublinhado tipo cursor. Sem caixa; contorno preto forte para legibilidade.
export const NeonCaption: React.FC<NeonCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 60,
  fontFamily = "JetBrains Mono",
  top = 1170,
  baseColor = "#ffffff",
  activeColor = "#39ff7a",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily);

  const GAP = Math.round(fps * 1.2);
  const chunks: NeonWord[][] = [];
  let cur: NeonWord[] = [];
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
  const appear = spring({frame: frame - chunkStart, fps, config: {damping: 18, stiffness: 160, mass: 0.6}, durationInFrames: 8});

  return (
    <div style={{position: "absolute", top, left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 55, pointerEvents: "none"}}>
      <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 16px", maxWidth: 940, padding: "0 40px", opacity: appear}}>
        {active.map((w, i) => {
          const isActive = frame >= w.startFrame && frame <= w.endFrame;
          const color = isActive ? activeColor : baseColor;
          return (
            <span
              key={i}
              style={{
                fontFamily: `'${fontFamily}', monospace`,
                fontWeight: 800,
                fontSize,
                lineHeight: 1.18,
                color,
                letterSpacing: -1,
                WebkitTextStroke: "6px #000",
                paintOrder: "stroke fill",
                textShadow: isActive
                  ? "0 0 24px rgba(57,255,122,0.75), 0 3px 10px rgba(0,0,0,0.8)"
                  : "0 3px 10px rgba(0,0,0,0.85)",
                borderBottom: isActive ? `5px solid ${activeColor}` : "5px solid transparent",
                paddingBottom: 2,
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
