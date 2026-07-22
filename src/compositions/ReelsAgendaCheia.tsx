import React, {useEffect, useState} from "react";
import {
  AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig,
  interpolate, spring, continueRender, delayRender, Sequence,
} from "remotion";
import {RushCaption, RushWord} from "../components/text/RushCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsAgendaProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const DISPLAY = "Anton";
const SANS = "Manrope";
// ---- PALETA UNICA: vermelho urgencia ----
const RED = "#E10600";
const RED_DK = "#7a0300";
const WHITE = "#ffffff";
const INK = "#120203";

const sf = (s: number, fps: number) => Math.round(s * fps);

// impacto da chegada dela na camera (frame ~7 = 0.23s da base editada)
const IMPACT = 7;

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const pct = interpolate(frame, [0, durationInFrames], [0, 100], {extrapolateRight: "clamp"});
  return (
    <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: 8, background: "rgba(255,255,255,0.16)", zIndex: 60}}>
      <div style={{width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${RED_DK},${RED})`}} />
    </div>
  );
};

// flash + linhas de velocidade no instante em que ela para na frente da camera
const ImpactBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - IMPACT;
  if (t < -2 || t > 16) return null;
  const flash = interpolate(t, [-2, 0, 6], [0, 0.3, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const lines = interpolate(t, [0, 12], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const spread = interpolate(t, [0, 12], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{zIndex: 57, pointerEvents: "none"}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(255,255,255,0) 18%, ${RED} 62%, ${RED_DK} 100%)`, opacity: flash, mixBlendMode: "screen"}} />
      {lines > 0.02 &&
        Array.from({length: 14}).map((_, i) => {
          const ang = (i / 14) * 360;
          const dist = 300 + spread * 780;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "46%",
                width: 6,
                height: 110 + spread * 190,
                background: `linear-gradient(180deg, rgba(225,6,0,0), ${RED})`,
                opacity: lines * 0.9,
                transform: `rotate(${ang}deg) translateY(-${dist}px)`,
                transformOrigin: "center top",
                borderRadius: 4,
              }}
            />
          );
        })}
    </AbsoluteFill>
  );
};

const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY, "400");
  loadGoogleFont(SANS);
  const enter = spring({frame: frame - IMPACT, fps, config: {damping: 12, stiffness: 190, mass: 0.6}, durationInFrames: 12});
  const exitStart = 2.55 * fps;
  const exit = interpolate(frame, [exitStart, exitStart + 10], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const scale = interpolate(enter, [0, 1], [1.32, 1]);
  const base: React.CSSProperties = {
    fontFamily: `'${DISPLAY}', sans-serif`, fontWeight: 400, lineHeight: 1.0, textTransform: "uppercase",
    letterSpacing: 0.5, textShadow: "0 8px 22px rgba(0,0,0,0.85)",
  };
  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", zIndex: 58, opacity: enter * exit}}>
      <div
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          padding: "40px 44px", textAlign: "center", transform: `scale(${scale})`,
          background: "rgba(10,2,2,0.58)", borderRadius: 26, backdropFilter: "blur(2px)",
        }}
      >
        <div style={{...base, color: WHITE, fontSize: 76}}>AGENDA CHEIA</div>
        <div style={{...base, color: WHITE, fontSize: 96, background: RED, padding: "10px 26px", borderRadius: 12, transform: "skewX(-7deg)", boxShadow: "0 14px 40px rgba(0,0,0,0.5)"}}>
          E O MÊS FRACO
        </div>
        <div style={{...base, color: WHITE, fontSize: 62}}>MESMO ASSIM</div>
        <div style={{marginTop: 14, fontFamily: `'${SANS}', sans-serif`, fontWeight: 800, fontSize: 32, color: WHITE, border: `2px solid ${RED}`, padding: "10px 24px", borderRadius: 12}}>
          o motivo não é o que você pensa
        </div>
      </div>
    </AbsoluteFill>
  );
};

// selo pontual no alto (acima da cabeca, fora da UI do Instagram)
const TopSeal: React.FC<{line1: string; line2?: string; emoji?: string; dur: number}> = ({line1, line2, emoji, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY, "400");
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 170, mass: 0.6}, durationInFrames: 12});
  const exit = interpolate(frame, [dur - 9, dur], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const x = interpolate(enter, [0, 1], [70, 0]);
  return (
    <div style={{position: "absolute", top: 285, width: "100%", display: "flex", justifyContent: "center", zIndex: 56, opacity: enter * exit}}>
      <div
        style={{
          transform: `translateX(${x}px) skewX(-7deg)`,
          background: RED,
          borderRadius: 12,
          padding: "16px 30px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          maxWidth: 940,
        }}
      >
        <div style={{transform: "skewX(7deg)", textAlign: "center"}}>
          <div style={{fontFamily: `'${DISPLAY}',sans-serif`, fontSize: 52, color: WHITE, textTransform: "uppercase", lineHeight: 1.05, letterSpacing: 0.5}}>{line1}</div>
          {line2 && <div style={{fontFamily: `'${DISPLAY}',sans-serif`, fontSize: 52, color: WHITE, textTransform: "uppercase", lineHeight: 1.05, letterSpacing: 0.5}}>{line2}</div>}
        </div>
        {emoji && <span style={{fontSize: 50, transform: "skewX(7deg)"}}>{emoji}</span>}
      </div>
    </div>
  );
};

const FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const start = durationInFrames - Math.round(2.5 * fps);
  if (frame < start) return null;
  const enter = spring({frame: frame - start, fps, config: {damping: 13, stiffness: 160}, durationInFrames: 14});
  loadGoogleFont(DISPLAY, "400");
  loadGoogleFont(SANS);
  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 330, zIndex: 59, opacity: enter}}>
      <div style={{background: RED, borderRadius: 24, padding: "32px 54px", textAlign: "center", boxShadow: "0 22px 55px rgba(0,0,0,0.55)", transform: `scale(${interpolate(enter, [0, 1], [0.8, 1])})`}}>
        <div style={{fontFamily: `'${DISPLAY}',sans-serif`, fontSize: 66, color: WHITE, textTransform: "uppercase", letterSpacing: 0.5}}>ME SEGUE</div>
        <div style={{fontFamily: `'${DISPLAY}',sans-serif`, fontSize: 104, color: WHITE, textTransform: "uppercase", lineHeight: 1, letterSpacing: 0.5}}>AQUI 👇</div>
        <div style={{fontFamily: `'${SANS}',sans-serif`, fontWeight: 800, fontSize: 30, color: "rgba(255,255,255,0.9)", marginTop: 10}}>amanhã eu te mostro por onde começar</div>
      </div>
    </AbsoluteFill>
  );
};

const EMPHASIS: Record<string, string> = {
  zero: "⛔",
  acaso: "🎲",
  sorte: "🎲",
  crack: "🔥",
};

export const ReelsAgendaCheia: React.FC<ReelsAgendaProps> = ({
  videoSrc = "assets/reels_agenda_base.mp4",
  captionsFile = "captions_agenda.json",
  transparent = false,
}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const [words, setWords] = useState<RushWord[]>([]);
  const [handle] = useState(() => delayRender("captions_agenda"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const startCut = 2.65 * 1000; // legenda entra depois do hook
        const endCut = (durationInFrames / fps - 2.6) * 1000; // some antes do CTA
        setWords(
          caps
            .filter((c) => c.text && c.text.trim() && c.startMs >= startCut && c.startMs < endCut)
            .map((c) => ({
              text: c.text.trim(),
              startFrame: Math.round((c.startMs / 1000) * fps),
              endFrame: Math.max(Math.round((c.endMs / 1000) * fps), Math.round((c.startMs / 1000) * fps) + 1),
            }))
        );
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [captionsFile, fps, handle, durationInFrames]);

  return (
    <AbsoluteFill style={{backgroundColor: transparent ? "transparent" : INK}}>
      {!transparent && <OffthreadVideo src={staticFile(videoSrc)} style={{width: "100%", height: "100%", objectFit: "cover"}} />}

      <ProgressBar />
      <ImpactBurst />

      <Sequence durationInFrames={sf(2.75, fps)}>
        <HookCard />
      </Sequence>

      {/* talking head em close: queixo desce ate ~y1390 -> legenda no peito (1430) */}
      {words.length > 0 && <RushCaption words={words} chunkSize={3} fontSize={60} top={1430} emphasis={EMPHASIS} />}

      <Sequence from={sf(29.6, fps)} durationInFrames={sf(4.5, fps)}>
        <TopSeal line1="Sobra zero tempo" line2="pra trazer cliente" dur={sf(4.5, fps)} />
      </Sequence>
      <Sequence from={sf(45.2, fps)} durationInFrames={sf(4.5, fps)}>
        <TopSeal line1="Quem decide" line2="é o acaso" emoji="🎲" dur={sf(4.5, fps)} />
      </Sequence>
      <Sequence from={sf(61, fps)} durationInFrames={sf(5, fps)}>
        <TopSeal line1="Atrair cliente" line2="é outra habilidade" dur={sf(5, fps)} />
      </Sequence>

      <FinalCTA />
    </AbsoluteFill>
  );
};
