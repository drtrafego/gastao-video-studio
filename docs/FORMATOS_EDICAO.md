# Formatos de edição — Gastão Video Studio

Este documento registra os formatos de vídeo padronizados nesta versão da ferramenta.
Serve de referência para manter consistência e evoluir a edição ao longo do tempo.

> Para a lógica de emojis, palavras-chave e níveis de efeito, ver
> [`GUIA_ESTILO_EFEITOS.md`](./GUIA_ESTILO_EFEITOS.md).

> Regra de ouro: **quando o material já vem no formato certo, mexer o mínimo.** Não
> reenquadrar, não dar zoom, não cortar o que já está bom. Respeitar o que foi gravado.

---

## 1. Reels / Shorts vertical (9:16 · 1080x1920 · 30fps)

Origem típica: screencast com webcam. Dois casos:

- **Webcam pequena de canto:** cropar a webcam e a tela e montar tela dividida
  (webcam em cima, sistema legível embaixo).
- **Gravação horizontal já montada (webcam em cima + tela embaixo):** **NÃO recortar
  a webcam de novo nem dar zoom** (corta o rosto, gera distorção). Encaixar a coluna
  útil inteira em 9:16 no modo *fit* (contain) e preencher o resto com **tarja preta**
  em cima e embaixo. A tarja de cima vira espaço do hook; a de baixo, da legenda.

Elementos:
- Hook grande nos primeiros ~2.7s (vem do gancho da história, não de descrever a tela)
- Barra de progresso no topo (retenção)
- Respiros/silêncios cortados (silencedetect)
- Legenda karaokê palavra-por-palavra sincronizada (Whisper local, word-level)
- Emojis e destaques de palavra-chave nos beats

Estilos de legenda (variar entre vídeos até fechar um padrão):
- `KaraokeCaption` — caixa translúcida, palavra ativa destacada
- `PopCaption` — "word-pop" TikTok, palavra ativa salta (spring), contorno preto
- `BoxCaption` — bloco sólido atrás da palavra ativa (estilo CapCut/Hormozi)
- `MarkerCaption` — marca-texto que "pinta" a palavra da esquerda pra direita

Composições de referência: `ReelsTarefaFacil`, `ReelsAppNoAr`, `ReelsGithubVercel`,
`ReelsCorrigirErros`.

## 2. Aula / tutorial horizontal para YouTube (16:9 · 1920x1080 · 30fps)

Origem típica: screencast em tela cheia com webcam pequena no canto. **Manter horizontal,
não reenquadrar para vertical.**

- Aula pode vir em **várias partes numeradas** (Aula 1, 1.1, 1.2 ...) → emendar em ordem.
- **Resolução mista** (ex: 720p + 1440p) → normalizar tudo para 1080p.
- **Corte de silêncio conservador**: em aula didática, cortar apenas pausas realmente
  longas, com respiro generoso. Nunca picotar. Se o material de uma parte já está no
  ritmo certo, **não cortar essa parte**.
- **Sem legenda karaokê**: em vez disso, destaques pontuais de palavra-chave.

Camada de edição (cards) via composição `AulaCards`:
- `title` — abertura (centro)
- `lower` — capítulo / lower third (canto inferior esquerdo; webcam fica no direito)
- `key` — destaque de conceito (canto superior esquerdo, com emoji)
- `cta` — chamada final

Os cards são posicionados numa timeline (`cards_aula.json`) mapeada para o tempo do
vídeo já cortado, renderizados como PNGs e compostos com fade via ffmpeg — sem renderizar
o vídeo inteiro no Remotion (aula longa).

---

## Notas de render

- Não renderizar vídeo + overlay juntos no Remotion em resolução alta (estoura memória).
  Fluxo: montar a base com ffmpeg → renderizar só as overlays (PNG transparente / cards)
  → compor base + overlays com ffmpeg.
- Encoder de GPU (NVENC) pode não estar disponível em todas as máquinas; libx264 com
  preset `fast`/`veryfast` é o fallback confiável.
- Manter sempre o arquivo de qualidade máxima; gerar versões comprimidas só quando
  precisar caber num limite de upload.

---

## Abertura "chegada na câmera"

Quando o bruto começa com a pessoa entrando no quadro e parando na frente do celular
para falar, esse trecho não deve ser descartado: ele vira a abertura.

1. Localizar o instante da chegada (detecção de silêncio + mosaico dos primeiros segundos).
2. Acelerar o trecho de deslocamento (`setpts=PTS/2.6`) com rastro (`tmix=frames=3`);
   o áudio acompanha com `atempo` encadeado (cada instância aceita no máximo 2.0).
3. No instante em que a pessoa para, aplicar zoom punch com tremor via `zoompan`
   (`z='1+0.20*exp(-in_time*7)'`, `x` com seno amortecido). O filtro `crop` não serve:
   largura e altura são avaliadas uma única vez.
4. Sobre o impacto entram flash curto e linhas de velocidade, e o hook aparece junto,
   crescendo de escala. Flash discreto: opacidade alta lava a imagem inteira.
5. Os tempos das legendas precisam do deslocamento correspondente ao trecho acelerado.

## Corte por voz (aula e screencast, sem legenda)

Formato mais simples do catálogo: remover espera morta, suspiro e barulho, mantendo
enquadramento e resolução nativos. Uma passada de ffmpeg, nada de Remotion.

```bash
scripts/voice-cut.sh "bruto.mp4" "out/editado.mp4"
GANHO=20 scripts/voice-cut.sh "bruto.mp4" "out/editado.mp4"   # gravação fraca
scripts/voice-cut.sh "bruto.mp4" "out/x.mp4" --analise        # só mede, não renderiza
```

O critério é a voz, não o volume. Barulho de movimento e batida próxima têm o mesmo
nível da fala, então energia sozinha não separa os dois. O que separa:

- **Proximidade**: o piso é adaptativo, medido do próprio vídeo (nível da fala menos
  24 dB). Microfone perto da boca deixa a fala muito acima do fundo, e ruído distante
  como carro na rua cai fora sozinho.
- **Periodicidade**: voz tem pitch, ruído não. Autocorrelação na faixa de 70 a 320 Hz.
- **Timbre**: energia entre 300 e 3000 Hz sobre o total. Carro e vento ficam abaixo
  de 200 Hz e não passam.
- **Continuidade**: pitch estável por várias janelas seguidas.
- **Ilha**: bloco curto cercado de silêncio longo dos dois lados é ruído, não fala.

Duas armadilhas que não dão erro visível:

- `loudnorm` no áudio de análise **cega a detecção**, porque o ganho dinâmico levanta
  o ruído de fundo até o nível da fala. Analisar sempre o áudio cru; se precisar de
  ganho, que seja estático.
- No ffmpeg com várias saídas, `-ar` e `-ac` valem por saída. Declarar uma vez só faz
  as demais saírem em 48 kHz estéreo e a análise passa a ler o sinal deslocado.

Antes de entregar, conferir quantos blocos ficaram abaixo de 0,8 s. Mais que três
indica vídeo picado.

## Vídeo híbrido: talking head muito próximo + tela filmada pelo celular

Aparece quando a gravação alterna entre a pessoa falando com o rosto ocupando quase
todo o quadro e o celular apontado para a tela do notebook, mostrando o sistema
rodando. Os dois trechos pedem tratamentos opostos, e a legenda não pode ficar fixa.

**Como mapear os trechos sem assistir o vídeo inteiro:** medir o brilho da faixa
superior quadro a quadro (`fps=2,crop=iw:ih/3:0:0,signalstats,metadata=print`) e
classificar. No talking head o topo é parede clara, na tela filmada é moldura escura
do notebook. O `metadata=print:file=` quebra com caminho absoluto do Windows por
causa dos dois-pontos: rodar de dentro da pasta e usar nome relativo. O corte de
brilho gera falso positivo quando o notebook aparece de longe com o quarto claro em
volta, então conferir os limites com frames antes de fechar o mapa.

**Legenda com altura por trecho.** No talking head próximo, o queixo desce abaixo de
y1500 e a zona de descrição do Reel começa em y1450: não sobra espaço embaixo. A
legenda vai para cima (top 290), sobre cabelo e parede. Na tela filmada ela volta
para baixo (top 1300), onde só há barra de tarefas e linhas de lista. O `ScanCaption`
recebe as zonas prontas (`fromFrame`, `toFrame`, `top`, `maxWidth`, `plate`) e desliza
entre as alturas nos 10 frames anteriores à virada.

**Hook e CTA também saem do centro.** Com o rosto tão próximo, card centralizado vira
venda sobre os olhos. Ambos vão para a faixa alta (hook em top 330, CTA em top 300),
com a base acima da linha da sobrancelha medida no frame de cabeça mais alta.

**Tela filmada é de baixa resolução por natureza.** Duas defesas: placa escura atrás
da legenda (`rgba(4,12,22,0.55)`), porque o fundo branco do LinkedIn come o texto; e
número grande cobrindo o painel ilegível. O número precisa **bater com o que está na
tela**, não com o que a pessoa fala arredondando, senão o card contradiz a prova.

**Bruto de celular costuma ser VFR.** `r_frame_rate` diz 29,97 mas o `avg_frame_rate`
real pode ser outro. Cortar direto com `select`/`setpts` reconstrói como CFR e estica
o resultado (um corte de 137 s saiu com 208 s). Normalizar antes:
`-fps_mode cfr -r 30`, e só então cortar por voz.

**Câmera dinâmica sem Remotion.** Um único `zoompan` resolve zoom lento nos trechos de
tela, respiro no talking head, punch e tremor nas viradas, tudo por expressão de
`in_time` (soma de gaussianas). Roda a cerca de 0,5x tempo real em 1080x1920.
