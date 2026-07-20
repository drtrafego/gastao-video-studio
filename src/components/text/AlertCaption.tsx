import React from "react";
import {useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface AlertWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface AlertCaptionProps {
  words: AlertWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  top?: number;
  boxColor?: string;
  inkColor?: string;
  activeColor?: string;
}

// Estilo "etiqueta de alerta": caixa laranja solida, texto escuro,
// palavra ativa em branco com leve pop. Vibe aviso/atencao.
export const AlertCaption: React.FC<AlertCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 58,
  fontFamily = "Space Grotesk",
  top = 1180,
  boxColor = "#f97316",
  inkColor = "#1a0f00",
  activeColor = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily);

  const GAP = Math.round(fps * 1.2);
  const chunks: AlertWord[][] = [];
  let cur: AlertWord[] = [];
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
  const appear = spring({frame: frame - chunkStart, fps, config: {damping: 16, stiffness: 170, mass: 0.6}, durationInFrames: 8});
  const y = interpolate(appear, [0, 1], [20, 0]);

  return (
    <div style={{position: "absolute", top, left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 55, pointerEvents: "none"}}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 14px",
          maxWidth: 920,
          padding: "16px 28px",
          background: boxColor,
          borderRadius: 20,
          transform: `translateY(${y}px)`,
          opacity: appear,
          boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
        }}
      >
        {active.map((w, i) => {
          const isActive = frame >= w.startFrame && frame <= w.endFrame;
          const pop = isActive
            ? spring({frame: frame - w.startFrame, fps, config: {damping: 12, stiffness: 200, mass: 0.5}, durationInFrames: 8})
            : 0;
          const scale = 1 + pop * 0.12;
          return (
            <span
              key={i}
              style={{
                fontFamily: `'${fontFamily}', sans-serif`,
                fontWeight: isActive ? 800 : 700,
                fontSize,
                lineHeight: 1.1,
                color: isActive ? activeColor : inkColor,
                display: "inline-block",
                transform: `scale(${scale})`,
                letterSpacing: -0.5,
                textShadow: isActive ? "0 2px 8px rgba(0,0,0,0.35)" : "none",
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
