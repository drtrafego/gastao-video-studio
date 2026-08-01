import React, {useEffect, useState} from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  continueRender,
  delayRender,
  Sequence,
  random,
} from "remotion";
import {ScanCaption, ScanWord, ScanZone} from "../components/text/ScanCaption";
import {loadGoogleFont} from "../presets/fonts";

export interface ReelsMentiraProps {
  videoSrc?: string;
  captionsFile?: string;
  transparent?: boolean;
}

const DISPLAY = "Space Grotesk";
// ---- PALETA UNICA: azul eletrico sobre azul-preto ----
const BLUE = "#2E9BFF";
const BLUE_DK = "#06254a";
const BLUE_LT = "#8CD2FF";
const WHITE = "#ffffff";
const INK = "#050a12";

const sf = (s: number, fps: number) => Math.round(s * fps);

/**
 * Trechos do Reel. O video alterna entre talking head MUITO proximo (rosto
 * ocupa de y250 a y1620, medido com grade) e tela de notebook filmada pelo
 * celular. Por isso a legenda troca de altura: em cima no talking head (so
 * cabelo e parede ali) e embaixo na tela.
 */
const TH_TOP = 290;
const TELA_TOP = 1300;
// fim do video em segundos e instante em que o CTA entra (a legenda para ali)
const CTA_IN = 128.4;
const ZONAS: {tipo: "TH" | "TELA"; ini: number; fim: number}[] = [
  {tipo: "TH", ini: 0, fim: 14.0},
  {tipo: "TELA", ini: 14.0, fim: 80.5},
  {tipo: "TH", ini: 80.5, fim: 113.0},
  {tipo: "TELA", ini: 113.0, fim: 121.5},
  {tipo: "TH", ini: 121.5, fim: 137.0},
];

const strokeText = {
  WebkitTextStroke: "5px #000",
  paintOrder: "stroke fill",
} as React.CSSProperties;

/** Barra de progresso no topo absoluto. */
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: "clamp"});
  return (
    // top 258: acima disso a UI do Reel cobre a barra e ela some no player
    <div style={{position: "absolute", top: 258, left: 0, width: "100%", height: 6, zIndex: 70}}>
      <div
        style={{
          width: `${p * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${BLUE_LT}, ${BLUE})`,
          boxShadow: `0 0 16px ${BLUE}`,
        }}
      />
    </div>
  );
};

/**
 * Hook: fala LITERAL de abertura, em dois tempos. Fica na faixa alta (top 330),
 * sobre cabelo e testa. Centralizar o card aqui poria uma venda em cima dos
 * olhos dele, porque este e um talking head muito proximo.
 */
const HookCard: React.FC<{dur: number; children: React.ReactNode; fontSize?: number}> = ({
  dur,
  children,
  fontSize = 62,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 165}, durationInFrames: 12});
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweep = interpolate(frame, [0, 22], [-120, 220], {extrapolateRight: "clamp"});
  return (
    <div
      style={{
        position: "absolute",
        top: 330,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 62,
        opacity: out,
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "rgba(5,10,18,0.86)",
          border: `3px solid ${BLUE}`,
          borderRadius: 26,
          padding: "26px 42px",
          maxWidth: 940,
          textAlign: "center",
          boxShadow: `0 26px 60px rgba(0,0,0,0.7), 0 0 54px rgba(46,155,255,0.3)`,
          transform: `scale(${interpolate(enter, [0, 1], [0.86, 1])})`,
          opacity: enter,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${sweep}%`,
            width: "45%",
            background: `linear-gradient(90deg, transparent, rgba(46,155,255,0.30), transparent)`,
          }}
        />
        <div
          style={{
            fontFamily: `'${DISPLAY}',sans-serif`,
            fontWeight: 700,
            fontSize,
            color: WHITE,
            lineHeight: 1.1,
            letterSpacing: -1.6,
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/** Chip de ponto-chave, altura livre para nao cair na cara nem na UI do IG. */
const KeyChip: React.FC<{text: string; dur: number; top: number; emoji?: string}> = ({
  text,
  dur,
  top,
  emoji,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 200}, durationInFrames: 9});
  const out = interpolate(frame, [dur - 7, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin(frame / 11));
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 58,
        opacity: enter * out,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: `'${DISPLAY}',sans-serif`,
          fontWeight: 700,
          fontSize: 42,
          color: WHITE,
          background: "rgba(6,37,74,0.92)",
          border: `3px solid ${BLUE}`,
          borderRadius: 16,
          padding: "12px 26px",
          letterSpacing: -1,
          transform: `translateX(${interpolate(enter, [0, 1], [-70, 0])}px)`,
          boxShadow: `0 0 ${16 + pulse * 20}px rgba(46,155,255,${0.28 + pulse * 0.22})`,
          whiteSpace: "nowrap",
        }}
      >
        {emoji ? <span style={{fontSize: 44}}>{emoji}</span> : null}
        <span style={strokeText}>{text}</span>
      </div>
    </div>
  );
};

/** Linha de chips de canal entrando em cascata. */
const ChannelRow: React.FC<{items: string[]; dur: number; top: number}> = ({items, dur, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 14,
        padding: "0 90px",
        zIndex: 58,
        opacity: out,
      }}
    >
      {items.map((it, i) => {
        const s = spring({
          frame: frame - i * 5,
          fps,
          config: {damping: 13, stiffness: 210},
          durationInFrames: 10,
        });
        return (
          <div
            key={it}
            style={{
              fontFamily: `'${DISPLAY}',sans-serif`,
              fontWeight: 700,
              fontSize: 38,
              color: WHITE,
              background: "rgba(6,37,74,0.92)",
              border: `3px solid ${BLUE}`,
              borderRadius: 999,
              padding: "10px 24px",
              letterSpacing: -0.8,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) scale(${interpolate(
                s,
                [0, 1],
                [0.8, 1]
              )})`,
              boxShadow: `0 0 26px rgba(46,155,255,0.3)`,
              whiteSpace: "nowrap",
            }}
          >
            <span style={strokeText}>{it}</span>
          </div>
        );
      })}
    </div>
  );
};

/** Moldura de mira sobre a area da tela, com etiqueta. */
const FocusFrame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  dur: number;
}> = ({x, y, w, h, label, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  const enter = spring({frame, fps, config: {damping: 18, stiffness: 175}, durationInFrames: 10});
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 0.5 + 0.5 * Math.abs(Math.sin(frame / 9));
  const scanY = interpolate(frame % 60, [0, 60], [0, h], {extrapolateRight: "clamp"});
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: 56,
        opacity: enter * out,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `4px solid ${BLUE}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: `0 0 ${18 + pulse * 26}px rgba(46,155,255,${0.32 + pulse * 0.3}), inset 0 0 50px rgba(46,155,255,0.10)`,
          transform: `scale(${interpolate(enter, [0, 1], [1.06, 1])})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: scanY,
            height: 3,
            background: BLUE_LT,
            opacity: 0.7,
            boxShadow: `0 0 18px ${BLUE}`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: h + 14,
          display: label ? "block" : "none",
          fontFamily: `'${DISPLAY}',sans-serif`,
          fontWeight: 700,
          fontSize: 38,
          color: WHITE,
          background: BLUE,
          borderRadius: 12,
          padding: "8px 20px",
          letterSpacing: -0.8,
          whiteSpace: "nowrap",
          boxShadow: "0 10px 24px rgba(0,0,0,0.6)",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Numero grande com contagem animada, para salvar a tela de baixa resolucao. */
const BigStat: React.FC<{valor: number; sufixo: string; legenda: string; dur: number; top: number}> = ({
  valor,
  sufixo,
  legenda,
  dur,
  top,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 170}, durationInFrames: 12});
  const out = interpolate(frame, [dur - 9, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const n = Math.round(
    interpolate(frame, [0, 20], [0, valor], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})
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
        zIndex: 60,
        opacity: out,
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "rgba(5,10,18,0.82)",
          border: `3px solid ${BLUE}`,
          borderRadius: 26,
          padding: "22px 46px",
          transform: `scale(${interpolate(enter, [0, 1], [0.82, 1])})`,
          opacity: enter,
          boxShadow: `0 0 50px rgba(46,155,255,0.35)`,
        }}
      >
        <div
          style={{
            fontFamily: `'${DISPLAY}',sans-serif`,
            fontWeight: 700,
            fontSize: 132,
            color: BLUE,
            lineHeight: 1,
            letterSpacing: -5,
            textShadow: `0 0 40px rgba(46,155,255,0.6)`,
            ...strokeText,
          }}
        >
          {n}
          {sufixo}
        </div>
        <div
          style={{
            fontFamily: `'${DISPLAY}',sans-serif`,
            fontWeight: 700,
            fontSize: 40,
            color: WHITE,
            letterSpacing: -1,
            marginTop: 8,
            ...strokeText,
          }}
        >
          {legenda}
        </div>
      </div>
    </div>
  );
};

/** Flash + linhas de varredura na virada de cena. */
const GlitchFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 3, 9], [0, 0.34, 0], {extrapolateRight: "clamp"});
  const bars = interpolate(frame, [0, 9], [0, 1], {extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{zIndex: 64, pointerEvents: "none"}}>
      <AbsoluteFill style={{background: BLUE_LT, opacity: fade, mixBlendMode: "screen"}} />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            width: "100%",
            height: 8,
            top: `${(i * 20 + bars * 22) % 100}%`,
            background: BLUE,
            opacity: (1 - bars) * 0.5,
            mixBlendMode: "screen",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** Emojis subindo pelas laterais num beat. */
const FloatingEmojis: React.FC<{emojis: string[]; dur: number}> = ({emojis, dur}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{zIndex: 57, pointerEvents: "none"}}>
      {emojis.map((e, i) => {
        const seed = random(`emoji-${e}-${i}`);
        const delay = i * 6;
        const p = interpolate(frame - delay, [0, dur], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const left = i % 2 === 0 ? 60 + seed * 90 : 880 - seed * 90;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left,
              top: interpolate(p, [0, 1], [1180, 620]),
              fontSize: 78,
              opacity: interpolate(p, [0, 0.15, 0.75, 1], [0, 1, 1, 0]),
              transform: `rotate(${interpolate(p, [0, 1], [-12, 12])}deg)`,
            }}
          >
            {e}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Selo de sistema rodando, canto superior direito (fora da UI do Reel). */
const HudSeal: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  const enter = spring({frame, fps, config: {damping: 17, stiffness: 190}, durationInFrames: 8});
  const out = interpolate(frame, [dur - 7, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blink = Math.floor(frame / 12) % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        top: 296,
        right: 44,
        zIndex: 59,
        opacity: enter * out,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(5,10,18,0.85)",
        border: `2px solid ${BLUE}`,
        borderRadius: 999,
        padding: "10px 20px",
        transform: `translateX(${interpolate(enter, [0, 1], [60, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          background: BLUE,
          opacity: blink ? 1 : 0.25,
          boxShadow: `0 0 14px ${BLUE}`,
        }}
      />
      <span
        style={{
          fontFamily: `'${DISPLAY}',sans-serif`,
          fontWeight: 700,
          fontSize: 30,
          color: WHITE,
          letterSpacing: 0.5,
        }}
      >
        RODANDO SOZINHO
      </span>
    </div>
  );
};

/** CTA final centralizado na zona segura do feed. */
const FinalCTA: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  loadGoogleFont(DISPLAY);
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 165}, durationInFrames: 13});
  const out = interpolate(frame, [dur - 9, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 1 + 0.03 * Math.sin(frame / 6);
  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 63,
        opacity: out,
      }}
    >
      <div
        style={{
          background: "rgba(5,10,18,0.9)",
          border: `3px solid ${BLUE}`,
          borderRadius: 28,
          padding: "30px 46px",
          textAlign: "center",
          transform: `scale(${interpolate(enter, [0, 1], [0.86, 1])})`,
          opacity: enter,
          boxShadow: `0 0 60px rgba(46,155,255,0.35)`,
        }}
      >
        <div
          style={{
            fontFamily: `'${DISPLAY}',sans-serif`,
            fontWeight: 700,
            fontSize: 62,
            color: WHITE,
            lineHeight: 1.08,
            letterSpacing: -1.6,
          }}
        >
          Quer um sistema
          <br />
          <span style={{color: BLUE}}>desse rodando pra você?</span>
        </div>
        <div
          style={{
            display: "inline-block",
            fontFamily: `'${DISPLAY}',sans-serif`,
            fontWeight: 700,
            fontSize: 42,
            color: WHITE,
            marginTop: 20,
            background: BLUE_DK,
            border: `3px solid ${BLUE}`,
            borderRadius: 16,
            padding: "16px 28px",
            transform: `scale(${pulse})`,
          }}
        >
          manda mensagem aqui 👇
        </div>
      </div>
    </div>
  );
};

export const ReelsMentira: React.FC<ReelsMentiraProps> = ({
  videoSrc = "assets/mentira_base.mp4",
  captionsFile = "captions_mentira.json",
  transparent = false,
}) => {
  const {fps} = useVideoConfig();
  const [words, setWords] = useState<ScanWord[]>([]);
  const [handle] = useState(() => delayRender("captions_mentira"));

  useEffect(() => {
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((caps: {text: string; startMs: number; endMs: number}[]) => {
        const startCut = 3560; // legenda entra so depois da fala de abertura (hook)
        const endCut = CTA_IN * 1000; // e sai quando o CTA entra, para nao competir
        setWords(
          caps
            .filter(
              (c) => c.text && c.text.trim() && c.startMs >= startCut && c.startMs < endCut
            )
            .map((c) => ({
              text: c.text.trim(),
              startFrame: Math.round((c.startMs / 1000) * fps),
              endFrame: Math.max(
                Math.round((c.endMs / 1000) * fps),
                Math.round((c.startMs / 1000) * fps) + 1
              ),
            }))
        );
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [captionsFile, fps, handle]);

  const zones: ScanZone[] = ZONAS.map((z) => ({
    fromFrame: sf(z.ini, fps),
    toFrame: sf(z.fim, fps),
    top: z.tipo === "TH" ? TH_TOP : TELA_TOP,
    // na tela o bloco encolhe para nao entrar na coluna de botoes do Reel e
    // ganha placa escura, porque o LinkedIn tem fundo branco
    maxWidth: z.tipo === "TH" ? 840 : 760,
    plate: z.tipo === "TELA",
  }));

  // chips: top escolhido pelo tipo do trecho (nunca em cima da cara nem na UI)
  const chips: {t: number; d: number; text: string; emoji: string; top: number}[] = [
    {t: 5.0, d: 3.4, text: "eu construí o meu", emoji: "🛠️", top: 450},
    {t: 17.6, d: 4.4, text: "ninguém tocando no mouse", emoji: "🖱️", top: 300},
    {t: 29.0, d: 4.6, text: "ele finge ser humano", emoji: "🕵️", top: 300},
    {t: 39.4, d: 4.6, text: "pra não banir o perfil", emoji: "🛡️", top: 300},
    {t: 51.6, d: 4.4, text: "organiza tudo sozinho", emoji: "🗂️", top: 300},
    {t: 57.2, d: 4.2, text: "filtra por nicho", emoji: "🎯", top: 300},
    {t: 81.0, d: 4.6, text: "roda dentro de casa", emoji: "🏠", top: 450},
    {t: 86.0, d: 4.6, text: "sem servidor, menos bloqueio", emoji: "🔒", top: 450},
    {t: 100.6, d: 4.4, text: "API oficial da Meta", emoji: "✅", top: 450},
    {t: 110.2, d: 4.2, text: "e um agente atende", emoji: "💬", top: 450},
    {t: 116.0, d: 4.6, text: "o bot responde por você", emoji: "🤖", top: 300},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: transparent ? "transparent" : INK}}>
      {!transparent && (
        <OffthreadVideo
          src={staticFile(videoSrc)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      )}

      <ProgressBar />

      {/* hook = fala literal de abertura, em dois tempos */}
      <Sequence durationInFrames={sf(1.85, fps)}>
        <HookCard dur={sf(1.85, fps)} fontSize={72}>
          Eu pensei que era <span style={{color: BLUE}}>mentira</span> também
        </HookCard>
      </Sequence>
      <Sequence from={sf(1.85, fps)} durationInFrames={sf(1.75, fps)}>
        <HookCard dur={sf(1.75, fps)} fontSize={72}>
          até que eu <span style={{color: BLUE}}>construí o meu</span>
        </HookCard>
      </Sequence>

      {words.length > 0 && (
        <ScanCaption words={words} zones={zones} chunkSize={3} fontSize={50} maxWidth={840} />
      )}

      {/* canais que o sistema minera, entrando em cascata */}
      <Sequence from={sf(8.7, fps)} durationInFrames={sf(4.2, fps)}>
        <ChannelRow
          items={["GOOGLE", "MAPS", "INSTAGRAM", "LINKEDIN"]}
          dur={sf(4.2, fps)}
          top={450}
        />
      </Sequence>

      {/* prova na tela: o bot navegando sem ninguem no mouse */}
      <Sequence from={sf(14.4, fps)} durationInFrames={sf(7.4, fps)}>
        <FocusFrame
          x={70}
          y={520}
          w={810}
          h={620}
          label=""
          dur={sf(7.4, fps)}
        />
      </Sequence>

      <Sequence from={sf(22.6, fps)} durationInFrames={sf(4.4, fps)}>
        <FocusFrame x={70} y={620} w={940} h={520} label="minerando o contato" dur={sf(4.4, fps)} />
      </Sequence>

      <Sequence from={sf(62.5, fps)} durationInFrames={sf(4.4, fps)}>
        <FocusFrame x={70} y={560} w={940} h={560} label="e dispara as mensagens" dur={sf(4.4, fps)} />
      </Sequence>

      {/* numero grande cobre a tela de baixa resolucao no momento dos disparos */}
      <Sequence from={sf(68.2, fps)} durationInFrames={sf(5.4, fps)}>
        <BigStat valor={104} sufixo="" legenda="disparos em um dia" dur={sf(5.4, fps)} top={860} />
      </Sequence>

      {/* canais de disparo */}
      <Sequence from={sf(94.8, fps)} durationInFrames={sf(4.6, fps)}>
        <ChannelRow items={["INSTAGRAM", "WHATSAPP", "E-MAIL"]} dur={sf(4.6, fps)} top={450} />
      </Sequence>

      {chips.map((c, i) => (
        <Sequence key={i} from={sf(c.t, fps)} durationInFrames={sf(c.d, fps)}>
          <KeyChip text={c.text} emoji={c.emoji} dur={sf(c.d, fps)} top={c.top} />
        </Sequence>
      ))}

      {/* selo de sistema rodando nos trechos de tela */}
      <Sequence from={sf(24.0, fps)} durationInFrames={sf(5.0, fps)}>
        <HudSeal dur={sf(5.0, fps)} />
      </Sequence>
      <Sequence from={sf(74.6, fps)} durationInFrames={sf(4.4, fps)}>
        <HudSeal dur={sf(4.4, fps)} />
      </Sequence>

      {/* flashes nas viradas de cena */}
      {[14.0, 80.5, 113.0, 121.5].map((t) => (
        <Sequence key={t} from={sf(t, fps) - 2} durationInFrames={10}>
          <GlitchFlash />
        </Sequence>
      ))}

      {/* beats com emoji */}
      <Sequence from={sf(3.6, fps)} durationInFrames={sf(2.2, fps)}>
        <FloatingEmojis emojis={["🤖", "⚡", "🔎"]} dur={sf(2.2, fps)} />
      </Sequence>
      <Sequence from={sf(68.4, fps)} durationInFrames={sf(2.4, fps)}>
        <FloatingEmojis emojis={["🚀", "📨", "🔥"]} dur={sf(2.4, fps)} />
      </Sequence>

      <Sequence from={sf(128.4, fps)} durationInFrames={sf(8.4, fps)}>
        <FinalCTA dur={sf(8.4, fps)} />
      </Sequence>
    </AbsoluteFill>
  );
};
