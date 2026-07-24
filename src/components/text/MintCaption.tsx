import React from "react";
import {useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface MintWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface MintCaptionProps {
  words: MintWord[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  top?: number; // topo do bloco: cresce para BAIXO, nunca sobe para o rosto
  maxWidth?: number;
  baseColor?: string;
  activeColor?: string;
}

/**
 * Estilo "menta clean": bloco ancorado pelo topo, palavras brancas com contorno
 * preto e a palavra ativa em verde menta com glow suave e leve pop de escala.
 * Faixa escura discreta atras do texto (o verde precisa de contraste quando cai
 * sobre tela clara ou objeto colorido). Sem caixa colorida, sem emoji, sem
 * segunda cor: paleta unica verde + branco.
 */
export const MintCaption: React.FC<MintCaptionProps> = ({
  words,
  chunkSize = 3,
  fontSize = 62,
  fontFamily = "Plus Jakarta Sans",
  top = 1290,
  maxWidth = 800,
  baseColor = "#ffffff",
  activeColor = "#00E08A",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily);

  // agrupa em chunks; quebra tambem em lacuna temporal grande para nao colar
  // o fim de um bloco de fala com o inicio do proximo
  const GAP = Math.round(fps * 1.2);
  const chunks: MintWord[][] = [];
  let cur: MintWord[] = [];
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
    config: {damping: 18, stiffness: 160, mass: 0.6},
    durationInFrames: 9,
  });
  const y = interpolate(appear, [0, 1], [16, 0]);

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
          alignItems: "baseline",
          gap: "2px 18px",
          maxWidth,
          padding: "16px 28px",
          background: "rgba(5,18,13,0.55)",
          borderRadius: 22,
          transform: `translateY(${y}px)`,
          opacity: appear,
          boxShadow: "0 14px 42px rgba(0,0,0,0.45)",
        }}
      >
        {active.map((w, i) => {
          const isActive = frame >= w.startFrame && frame <= w.endFrame;
          const pop = isActive
            ? spring({
                frame: frame - w.startFrame,
                fps,
                config: {damping: 13, stiffness: 210, mass: 0.5},
                durationInFrames: 8,
              })
            : 0;
          const scale = 1 + pop * 0.09;
          return (
            <span
              key={i}
              style={{
                fontFamily: `'${fontFamily}', sans-serif`,
                fontWeight: 800,
                fontSize,
                lineHeight: 1.06,
                color: isActive ? activeColor : baseColor,
                display: "inline-block",
                transform: `scale(${scale})`,
                letterSpacing: -0.6,
                WebkitTextStroke: "5px rgba(0,0,0,0.85)",
                paintOrder: "stroke fill",
                textShadow: isActive
                  ? "0 0 26px rgba(0,224,138,0.5), 0 3px 10px rgba(0,0,0,0.65)"
                  : "0 3px 10px rgba(0,0,0,0.65)",
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
