import React from "react";
import {useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface GoldWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface GoldCaptionProps {
  words: GoldWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  top?: number; // posicao vertical (px) do centro da faixa
  baseColor?: string;
  activeColor?: string;
  valueColor?: string; // cor fixa para valores (R$, numeros, ROAS)
}

// Detecta palavra-valor (dinheiro / metrica) -> fica dourada sempre
const isValue = (t: string) =>
  /r\$|roas|leads?|\d/i.test(t.replace(/[.,!?;:]/g, ""));

export const GoldCaption: React.FC<GoldCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 62,
  fontFamily = "Manrope",
  top = 1160,
  baseColor = "#ffffff",
  activeColor = "#fbbf24",
  valueColor = "#fbbf24",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily);

  // agrupa em chunks, quebrando tambem quando ha lacuna temporal grande
  // (evita colar fim de um bloco com inicio de outro quando ha corte no meio)
  const GAP = Math.round(fps * 1.2);
  const chunks: GoldWord[][] = [];
  let cur: GoldWord[] = [];
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

  // chunk ativo = o que contem o frame atual (range compacto)
  const active = chunks.find(
    (c) => frame >= c[0].startFrame && frame <= c[c.length - 1].endFrame + 6
  );
  if (!active) return null;

  const chunkStart = active[0].startFrame;
  const appear = spring({
    frame: frame - chunkStart,
    fps,
    config: {damping: 16, stiffness: 150, mass: 0.6},
    durationInFrames: 10,
  });
  const y = interpolate(appear, [0, 1], [24, 0]);

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
          gap: "0 18px",
          maxWidth: 900,
          padding: "20px 30px",
          background: "rgba(8,10,16,0.62)",
          borderRadius: 24,
          border: "1px solid rgba(251,191,36,0.25)",
          transform: `translateY(${y}px)`,
          opacity: appear,
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        }}
      >
        {active.map((w, i) => {
          const isActive = frame >= w.startFrame && frame <= w.endFrame;
          const val = isValue(w.text);
          const pop = isActive
            ? spring({
                frame: frame - w.startFrame,
                fps,
                config: {damping: 12, stiffness: 200, mass: 0.5},
                durationInFrames: 8,
              })
            : 0;
          const scale = 1 + pop * 0.14;
          const color = isActive ? activeColor : val ? valueColor : baseColor;
          return (
            <span
              key={i}
              style={{
                fontFamily: `'${fontFamily}', sans-serif`,
                fontWeight: 800,
                fontSize,
                lineHeight: 1.12,
                color,
                display: "inline-block",
                transform: `scale(${scale})`,
                letterSpacing: -0.5,
                textShadow: isActive
                  ? "0 0 22px rgba(251,191,36,0.55), 0 3px 8px rgba(0,0,0,0.6)"
                  : "0 3px 8px rgba(0,0,0,0.6)",
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
