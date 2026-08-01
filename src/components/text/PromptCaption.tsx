import React from "react";
import {useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface PromptWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface PromptCaptionProps {
  words: PromptWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  top?: number;
  maxWidth?: number;
  baseColor?: string;
  activeColor?: string;
  dimColor?: string;
  showPrompt?: boolean;
}

/**
 * Estilo "prompt de terminal": fonte monoespacada, um sinal > magenta pulsando
 * antes do bloco e um cursor de bloco colado na palavra ativa. Palavra ativa em
 * magenta com glow, palavras ja ditas em branco e palavras futuras apagadas,
 * dando a sensacao de linha sendo digitada. Paleta unica magenta + branco.
 */
export const PromptCaption: React.FC<PromptCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 46,
  fontFamily = "JetBrains Mono",
  top = 62,
  maxWidth = 940,
  baseColor = "#ffffff",
  activeColor = "#FF2D95",
  dimColor = "rgba(255,255,255,0.42)",
  showPrompt = true,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily);

  const GAP = Math.round(fps * 1.2);
  const chunks: PromptWord[][] = [];
  let cur: PromptWord[] = [];
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
    (c) => frame >= c[0].startFrame && frame <= c[c.length - 1].endFrame + 5
  );
  if (!active) return null;

  const chunkStart = active[0].startFrame;
  const appear = spring({
    frame: frame - chunkStart,
    fps,
    config: {damping: 22, stiffness: 200, mass: 0.4},
    durationInFrames: 6,
  });
  const shift = interpolate(appear, [0, 1], [-16, 0]);
  const blink = Math.floor(frame / 8) % 2 === 0;
  const activeIndex = active.findIndex(
    (w) => frame >= w.startFrame && frame <= w.endFrame
  );
  const lastSpoken = active.reduce(
    (acc, w, i) => (frame > w.endFrame ? i : acc),
    -1
  );

  const stroke = {
    WebkitTextStroke: "5px #000",
    paintOrder: "stroke fill",
  } as React.CSSProperties;

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
          gap: "4px 26px",
          maxWidth,
          padding: "10px 22px",
          transform: `translateX(${shift}px)`,
          opacity: appear,
        }}
      >
        {showPrompt ? (
          <span
            style={{
              fontFamily: `'${fontFamily}', monospace`,
              fontWeight: 800,
              fontSize: fontSize * 0.9,
              color: activeColor,
              opacity: blink ? 1 : 0.35,
              textShadow: `0 0 18px ${activeColor}`,
              ...stroke,
            }}
          >
            {">"}
          </span>
        ) : null}

        {active.map((w, i) => {
          const isActive = i === activeIndex;
          const isSpoken = i <= lastSpoken;
          const pop = isActive
            ? spring({
                frame: frame - w.startFrame,
                fps,
                config: {damping: 13, stiffness: 240, mass: 0.35},
                durationInFrames: 6,
              })
            : 0;
          return (
            <span
              key={i}
              style={{
                position: "relative",
                fontFamily: `'${fontFamily}', monospace`,
                fontWeight: 800,
                fontSize,
                lineHeight: 1.16,
                letterSpacing: -1.5,
                color: isActive ? activeColor : isSpoken ? baseColor : dimColor,
                transform: `translateY(${-pop * 5}px)`,
                textShadow: isActive
                  ? `0 0 26px rgba(255,45,149,0.65), 0 3px 10px rgba(0,0,0,0.9)`
                  : "0 3px 10px rgba(0,0,0,0.9)",
                ...stroke,
              }}
            >
              {w.text}
              {isActive ? (
                <span
                  style={{
                    position: "absolute",
                    right: -14,
                    top: "16%",
                    width: 10,
                    height: fontSize * 0.72,
                    background: activeColor,
                    opacity: blink ? 0.95 : 0.25,
                    boxShadow: `0 0 16px ${activeColor}`,
                    WebkitTextStroke: "0",
                  }}
                />
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
};
