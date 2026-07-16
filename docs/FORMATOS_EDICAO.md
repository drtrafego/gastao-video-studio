# Formatos de edição — Gastão Video Studio

Este documento registra os formatos de vídeo padronizados nesta versão da ferramenta.
Serve de referência para manter consistência e evoluir a edição ao longo do tempo.

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
