import React from "react";
import {AbsoluteFill, useCurrentFrame} from "remotion";
import {loadGoogleFont} from "../presets/fonts";

// Renderiza UM card por frame (frame i = cards[i]), estatico e transparente.
// O fade/slide de entrada e feito depois no ffmpeg ao compor sobre a aula.
// Tipos: title (abertura), lower (capitulo, inf. esquerdo), key (conceito, sup. esquerdo), cta (fim).

export interface AulaCard {
  type: "title" | "lower" | "key" | "cta";
  title: string;
  sub?: string;
  emoji?: string;
}

const FONT = "Inter";
const ACCENT = "#d97757"; // laranja Claude
const INK = "#0d1117";
const PANEL = "rgba(13,17,23,0.92)";

const TitleCard: React.FC<AulaCard> = ({title, sub}) => (
  <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
    <div style={{background: PANEL, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: "48px 72px", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", textAlign: "center", backdropFilter: "blur(4px)"}}>
      <div style={{display: "inline-block", background: ACCENT, color: INK, fontFamily: `'${FONT}',sans-serif`, fontWeight: 800, fontSize: 26, letterSpacing: 2, padding: "8px 20px", borderRadius: 999, marginBottom: 26}}>
        AULA 01
      </div>
      <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 900, fontSize: 92, color: "#fff", lineHeight: 1.02, letterSpacing: -2}}>{title}</div>
      {sub && <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 500, fontSize: 38, color: "rgba(255,255,255,0.72)", marginTop: 18}}>{sub}</div>}
    </div>
  </AbsoluteFill>
);

const LowerCard: React.FC<AulaCard> = ({title, sub}) => (
  <AbsoluteFill>
    <div style={{position: "absolute", left: 70, bottom: 90, display: "flex", alignItems: "stretch", background: PANEL, borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)"}}>
      <div style={{width: 10, background: ACCENT}} />
      <div style={{padding: "20px 34px 22px 28px"}}>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 800, fontSize: 44, color: "#fff", letterSpacing: 0.5}}>{title}</div>
        {sub && <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 500, fontSize: 30, color: ACCENT, marginTop: 4}}>{sub}</div>}
      </div>
    </div>
  </AbsoluteFill>
);

const KeyCard: React.FC<AulaCard> = ({title, sub, emoji}) => (
  <AbsoluteFill>
    <div style={{position: "absolute", left: 70, top: 70, display: "flex", alignItems: "center", gap: 20, background: PANEL, borderRadius: 16, padding: "18px 30px 18px 24px", boxShadow: "0 18px 50px rgba(0,0,0,0.5)", border: `1px solid ${ACCENT}55`}}>
      {emoji && <div style={{fontSize: 64, lineHeight: 1}}>{emoji}</div>}
      <div>
        <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 800, fontSize: 46, color: "#fff", letterSpacing: -0.5}}>{title}</div>
        {sub && <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.75)", marginTop: 2}}>{sub}</div>}
      </div>
    </div>
  </AbsoluteFill>
);

const CtaCard: React.FC<AulaCard> = ({title, sub}) => (
  <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 140}}>
    <div style={{background: ACCENT, borderRadius: 20, padding: "30px 56px", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.5)"}}>
      <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 900, fontSize: 56, color: INK, letterSpacing: -1}}>{title}</div>
      {sub && <div style={{fontFamily: `'${FONT}',sans-serif`, fontWeight: 600, fontSize: 32, color: "rgba(13,17,23,0.75)", marginTop: 8}}>👍 {sub}</div>}
    </div>
  </AbsoluteFill>
);

export const AulaCards: React.FC<{cards: AulaCard[]}> = ({cards}) => {
  const frame = useCurrentFrame();
  loadGoogleFont(FONT);
  const card = cards[frame];
  if (!card) return <AbsoluteFill style={{backgroundColor: "transparent"}} />;
  return (
    <AbsoluteFill style={{backgroundColor: "transparent"}}>
      {card.type === "title" && <TitleCard {...card} />}
      {card.type === "lower" && <LowerCard {...card} />}
      {card.type === "key" && <KeyCard {...card} />}
      {card.type === "cta" && <CtaCard {...card} />}
    </AbsoluteFill>
  );
};
