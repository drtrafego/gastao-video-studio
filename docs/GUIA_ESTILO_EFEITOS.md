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

### Dicionário base (palavra → emoji)

| Conceito | Emoji | Conceito | Emoji |
|---|---|---|---|
| GitHub / repositório | 📦 | Vercel / deploy / publicar | 🚀 |
| domínio / DNS / CNAME | 🌐 | link | 🔗 |
| Claude / IA / agente | 🤖 | código / programar | 👨‍💻 |
| site / web | 💻 | app / aplicativo | 📱 |
| erro / bug | ❌ 🐛 | corrigir / funcionou / deu certo | ✅ 🎉 |
| grátis | 🆓 | atenção / cuidado | ⚠️ |
| dinheiro / plano / preço | 💳 💰 | tempo / limite | ⏱️ |
| ideia / sacada | 💡 | fogo / hype | 🔥 |

Adapte por tema. Ex.: tema "erro/correção" usa vermelho ❌ para o problema e verde ✅
para a solução, e a barra de progresso vai de vermelho a verde.

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
2. **Barra de progresso** no topo — sensação de avanço, segura até o fim.
3. **Chips de etapa** (`StepChip`) — "1. GitHub 📦", "2. Claude 🤖"... orientam o passo a passo.
4. **Callout com seta** (`GuideCallout`) — aponta o elemento da tela ("cria o repositório 👇").
5. **Emojis flutuantes** (`FloatingEmojis`) — energia nos beats (seção 2).
6. **Flash de transição** (`FlashTransition`) — flash branco curto na virada de seção.
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
