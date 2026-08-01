import React from "react";
import {useCurrentFrame, interpolate, spring, useVideoConfig} from "remotion";
import {loadGoogleFont} from "../../presets/fonts";

export interface ScanWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

/** Faixa de tempo em que a legenda deve ficar numa altura especifica. */
export interface ScanZone {
  fromFrame: number;
  toFrame: number;
  top: number;
  /** largura maxima do bloco nesta faixa (evita a coluna de botoes do IG) */
  maxWidth?: number;
  /** placa escura atras do texto, para trecho de fundo claro */
  plate?: boolean;
}

export interface ScanCaptionProps {
  words: ScanWord[];
  zones: ScanZone[];
  chunkSize?: number;
  fontSize?: number;
  fontFamily?: string;
  maxWidth?: number;
  activeColor?: string;
  glowColor?: string;
}

/**
 * Estilo "scanner": a legenda vive dentro de uma mira com cantos em L, como um
 * sistema lendo a fala. A palavra ativa acende em azul eletrico e uma linha de
 * varredura desce por cima dela no instante em que e dita. Palavras ja ditas
 * ficam brancas, futuras apagadas. Contorno preto em tudo para sobreviver em
 * cima de video claro ou escuro.
 *
 * A altura (top) e DINAMICA: cada zona do video tem a sua, porque o mesmo
 * Reel alterna entre talking head muito proximo (rosto ocupa o centro e a
 * parte de baixo) e tela filmada (conteudo no centro).
 */
export const ScanCaption: React.FC<ScanCaptionProps> = ({
  words,
  zones,
  chunkSize = 3,
  fontSize = 52,
  fontFamily = "Space Grotesk",
  maxWidth = 900,
  activeColor = "#2E9BFF",
  glowColor = "rgba(46,155,255,0.75)",
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(fontFamily);

  const GAP = Math.round(fps * 1.1);
  const chunks: ScanWord[][] = [];
  let cur: ScanWord[] = [];
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

  // altura alvo pela zona em que o frame cai, com transicao suave entre zonas
  const zoneAt = (f: number) =>
    zones.find((zz) => f >= zz.fromFrame && f < zz.toFrame) ??
    (zones.length ? zones[zones.length - 1] : null);
  const zoneOf = (f: number) => zoneAt(f)?.top ?? 1200;
  const SLIDE = 10;
  const topNow = zoneOf(frame);
  const topSoon = zoneOf(frame + SLIDE);
  const zAtiva = zoneAt(frame);
  const boxWidth = zAtiva?.maxWidth ?? maxWidth;
  const usaPlaca = zAtiva?.plate ?? false;
  const zoneEdge = zones.find(
    (zz) => frame >= zz.fromFrame - SLIDE && frame < zz.fromFrame
  );
  const top = zoneEdge
    ? interpolate(frame, [zoneEdge.fromFrame - SLIDE, zoneEdge.fromFrame], [topNow, topSoon], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : topNow;

  const chunkStart = active[0].startFrame;
  const appear = spring({
    frame: frame - chunkStart,
    fps,
    config: {damping: 20, stiffness: 210, mass: 0.4},
    durationInFrames: 7,
  });
  const activeIndex = active.findIndex((w) => frame >= w.startFrame && frame <= w.endFrame);
  const lastSpoken = active.reduce((acc, w, i) => (frame > w.endFrame ? i : acc), -1);

  const stroke = {
    WebkitTextStroke: "6px #000",
    paintOrder: "stroke fill",
  } as React.CSSProperties;

  const corner = (pos: React.CSSProperties, borders: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: 26,
        height: 26,
        borderColor: activeColor,
        borderStyle: "solid",
        borderWidth: 0,
        opacity: 0.9,
        ...pos,
        ...borders,
      }}
    />
  );

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
          position: "relative",
          padding: usaPlaca ? "12px 24px" : "16px 30px",
          maxWidth: boxWidth,
          background: usaPlaca ? "rgba(4,12,22,0.55)" : "transparent",
          borderRadius: usaPlaca ? 14 : 0,
          transform: `scale(${interpolate(appear, [0, 1], [0.94, 1])})`,
          opacity: appear,
        }}
      >
        {corner({left: 0, top: 0}, {borderLeftWidth: 5, borderTopWidth: 5})}
        {corner({right: 0, top: 0}, {borderRightWidth: 5, borderTopWidth: 5})}
        {corner({left: 0, bottom: 0}, {borderLeftWidth: 5, borderBottomWidth: 5})}
        {corner({right: 0, bottom: 0}, {borderRightWidth: 5, borderBottomWidth: 5})}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "baseline",
            gap: "6px 22px",
          }}
        >
          {active.map((w, i) => {
            const isActive = i === activeIndex;
            const isSpoken = i <= lastSpoken;
            const since = frame - w.startFrame;
            const pop = isActive
              ? spring({
                  frame: since,
                  fps,
                  config: {damping: 12, stiffness: 260, mass: 0.32},
                  durationInFrames: 7,
                })
              : 0;
            // linha de varredura desce por cima da palavra no ataque
            const scan = isActive
              ? interpolate(since, [0, 7], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : -1;
            return (
              <span
                key={i}
                style={{
                  position: "relative",
                  display: "inline-block",
                  fontFamily: `'${fontFamily}', sans-serif`,
                  fontWeight: 700,
                  fontSize,
                  lineHeight: 1.14,
                  letterSpacing: -1.4,
                  color: isActive ? activeColor : isSpoken ? "#ffffff" : "rgba(255,255,255,0.38)",
                  transform: `translateY(${-pop * 6}px) scale(${1 + pop * 0.06})`,
                  textShadow: isActive
                    ? `0 0 28px ${glowColor}, 0 4px 12px rgba(0,0,0,0.95)`
                    : "0 4px 12px rgba(0,0,0,0.95)",
                  ...stroke,
                }}
              >
                {w.text}
                {scan >= 0 && scan < 1 ? (
                  <span
                    style={{
                      position: "absolute",
                      left: -4,
                      right: -4,
                      top: `${scan * 100}%`,
                      height: 4,
                      background: activeColor,
                      boxShadow: `0 0 18px ${activeColor}`,
                      opacity: 0.85 * (1 - scan),
                      WebkitTextStroke: "0",
                    }}
                  />
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
