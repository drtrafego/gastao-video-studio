# Guia de estilo e efeitos — Gastão Video Studio

Manual de como aplicar emojis, destaques de palavra-chave e efeitos de retenção nos
vídeos. É o "porquê" e o "quando" por trás dos componentes. Use junto com
[`FORMATOS_EDICAO.md`](./FORMATOS_EDICAO.md).

---

## 1. Destaque de palavra-chave (emphasis)

Os componentes de legenda (`BoxCaption`, `MarkerCaption`, `PopCaption`) aceitam um mapa
`emphasis`: quando a palavra ativa é uma palavra-chave, ela ganha **cor diferente + emoji**.
Isso puxa o olho para o conceito no momento em que a pessoa fala dele.

Regras:
- **Poucas** palavras-chave por vídeo. Se tudo é destaque, nada é destaque.
- A chave é normalizada (MAIÚSCULA, sem acento) — `norm("Domínio") === "DOMINIO"`.
- Cor + emoji devem reforçar o conceito, não competir com ele.

**Emoji é bem-vindo.** Um emoji junto da palavra-chave deixa a edição mais viva e ajuda
a fixar o conceito. Não há lista fixa: escolha o emoji que combina com o tema e a marca
do vídeo. Ex.: num tema "erro/correção" faz sentido vermelho para o problema e verde para
a solução, com a barra de progresso indo de um ao outro.

---

## 2. Emojis nos beats (momentos de energia)

Além do destaque na legenda, emojis podem "saltar" em momentos-chave (`FloatingEmojis`):
sobem por uma **lateral** da tela (longe do rosto), com pop + fade, e somem.

- Use nos beats: virada de assunto, "deu certo", revelação, punch de humor.
- 1 a 3 emojis por beat. Nas laterais (x ~10% ou ~85%), nunca sobre o rosto.
- Fechamento do vídeo pode ter um combo (🎉🔥🚀) no centro.

---

## 3. Níveis de efeito (retenção)

Empilhe conforme a energia desejada. Para Reels, energia alta; para aula, sóbrio.

1. **Hook** (primeiros ~2.7s) — frase de impacto grande. Vem do **gancho da história**,
   não de descrever a tela ("Coloquei meu site no ar sem saber codar", não "Tela do Vercel").
   - **Antes de montar, resolva o hook:** pergunte se a pessoa **já tem um hook pronto**.
     Se tiver, use o dela. Se não tiver, **interprete o conteúdo** (transcrição/tema) e
     **proponha um** — de preferência 2 ou 3 opções para ela escolher. O hook é a parte
     que mais decide a retenção; não deixe no automático.
2. **Barra de progresso** no topo — sensação de avanço, segura até o fim.
3. **Chips de etapa** (`StepChip`) — "1. GitHub 📦", "2. Claude 🤖"... orientam o passo a passo.
4. **Callout com seta** (`GuideCallout`) — aponta o elemento da tela ("cria o repositório 👇").
5. **Emojis flutuantes** (`FloatingEmojis`) — energia nos beats (seção 2).
6. **Transições** — na virada de seção/corte, uma transição deixa o vídeo mais fluido e
   dinâmico: flash branco curto (`FlashTransition`), ou fade/slide/zoom entre trechos
   (`@remotion/transitions`). Vale usar; só não exagere na aula longa.
7. **Palavra-chave destacada** (seção 1) — cor + emoji na palavra que importa.

Regra de dose: Reel curto = quase tudo ligado; aula longa = hook/capítulos/destaques
pontuais, sem poluir.

---

## 4. Qual estilo de legenda usar

| Estilo | Cara | Bom para |
|---|---|---|
| `KaraokeCaption` | caixa translúcida, palavra ativa clara | base neutra, legível |
| `PopCaption` | palavra ativa "salta" (spring), contorno preto | TikTok/Reels enérgico |
| `BoxCaption` | bloco sólido atrás da palavra ativa | CapCut/Hormozi, alto contraste |
| `MarkerCaption` | marca-texto que "pinta" da esquerda p/ direita | didático, destaque suave |

Dica: enquanto não há um padrão fechado de legenda, **variar o estilo entre vídeos**
(fonte, cor, forma, posição, animação, palavras por vez) até achar o que converte melhor —
e então fixar.

---

## 5. Aulas (YouTube horizontal): sem legenda karaokê

Em aula longa, não usar legenda palavra-por-palavra (polui e cansa). Em vez disso, usar
**cards** (`AulaCards`): título de abertura, capítulos (lower third), destaques de
conceito com emoji, e CTA final. O YouTube já gera legenda automática para quem quiser.
