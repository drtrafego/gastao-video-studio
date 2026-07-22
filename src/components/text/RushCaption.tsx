import React from "react";
import {useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface RushWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface RushCaptionProps {
  words: RushWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  top?: number;
  /** cor da tarja da palavra ativa */
  accent?: string;
  /** cor do texto inativo */
  idleColor?: string;
  /** emoji opcional por palavra-chave (chave em minusculo, sem pontuacao) */
  emphasis?: Record<string, string>;
  maxWidth?: number;
}

const clean = (s: string) => s.toLowerCase().replace(/[.,!?;:"']/g, "");

// Estilo "rush": as palavras CHEGAM correndo pela direita, com rastro,
// e a palavra ativa e carimbada numa tarja vermelha inclinada.
// Combina com video em que a pessoa chega correndo na camera.
export const RushCaption: React.FC<RushCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 62,
  fontFamily = "Anton",
  top = 1430,
  accent = "#E10600",
  idleColor = "#ffffff",
  emphasis = {},
  maxWidth = 900,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily, "400");

  // quebra em blocos por tamanho E por lacuna temporal (evita colar frases distantes)
  const GAP = Math.round(fps * 1.2);
  const chunks: RushWord[][] = [];
  let cur: RushWord[] = [];
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
          gap: "6px 16px",
          maxWidth,
        }}
      >
        {active.map((w, i) => {
          // chegada: cada palavra entra da direita, escalonada
          const local = frame - chunkStart - i * 2;
          const enter = spring({
            frame: local,
            fps,
            config: {damping: 15, stiffness: 210, mass: 0.55},
            durationInFrames: 10,
          });
          const x = interpolate(enter, [0, 1], [90, 0]);
          const trail = interpolate(enter, [0, 1], [1, 0], {extrapolateRight: "clamp"});

          const isActive = frame >= w.startFrame && frame <= w.endFrame;
          const hit = isActive
            ? spring({
                frame: frame - w.startFrame,
                fps,
                config: {damping: 11, stiffness: 240, mass: 0.5},
                durationInFrames: 7,
              })
            : 0;
          // tarja cresce da esquerda pra direita quando a palavra fica ativa
          const barW = isActive ? interpolate(hit, [0, 1], [0, 1]) : 0;
          const scale = 1 + hit * 0.07;

          const emo = emphasis[clean(w.text)];

          return (
            <span
              key={i}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                transform: `translateX(${x}px) scale(${scale})`,
                opacity: enter,
              }}
            >
              {/* rastro de velocidade da chegada */}
              {trail > 0.05 && (
                <span
                  style={{
                    position: "absolute",
                    right: -14,
                    top: "34%",
                    height: 8,
                    width: 60 + trail * 140,
                    background: `linear-gradient(90deg, rgba(225,6,0,0), ${accent})`,
                    opacity: trail * 0.85,
                    borderRadius: 4,
                  }}
                />
              )}

              {/* tarja vermelha inclinada da palavra ativa */}
              <span
                style={{
                  position: "absolute",
                  left: -14,
                  right: -14,
                  top: -8,
                  bottom: -6,
                  background: accent,
                  borderRadius: 8,
                  transform: `skewX(-7deg) scaleX(${barW})`,
                  transformOrigin: "left center",
                  boxShadow: isActive ? "0 10px 26px rgba(0,0,0,0.45)" : "none",
                }}
              />

              <span
                style={{
                  position: "relative",
                  fontFamily: `'${fontFamily}', sans-serif`,
                  fontWeight: 400,
                  fontSize,
                  lineHeight: 1.06,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: idleColor,
                  WebkitTextStroke: isActive ? "0px #000" : "9px #000",
                  paintOrder: "stroke fill",
                  textShadow: isActive
                    ? "0 3px 10px rgba(0,0,0,0.45)"
                    : "0 6px 18px rgba(0,0,0,0.8)",
                }}
              >
                {w.text}
              </span>

              {emo && isActive && (
                <span style={{position: "relative", fontSize: fontSize * 0.82}}>{emo}</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};
