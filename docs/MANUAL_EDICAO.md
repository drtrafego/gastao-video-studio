# Manual de edição — regras que o editor segue sempre

Este é o "cérebro" da ferramenta: as regras de como editar vídeos para Instagram (Reels/Shorts)
e YouTube (aulas). Ao trabalhar neste projeto, **siga estas regras em todo vídeo**. Complementa
[`FORMATOS_EDICAO.md`](./FORMATOS_EDICAO.md) e [`GUIA_ESTILO_EFEITOS.md`](./GUIA_ESTILO_EFEITOS.md).

## Fluxo de trabalho (obrigatório)
1. **Analisar** o vídeo: specs (resolução, fps, rotação, codec), tipo de vídeo, layout (extrair frames/mosaico), transcrição.
2. **Trazer o plano** (formato, enquadramento, hook, estilo/posição de legenda, paleta, cortes) e **esperar autorização** — não editar direto.
3. Mostrar **frame de teste** antes de renderizar tudo.
4. Renderizar, compor, **validar no ARQUIVO FINAL** (não só no still), entregar.

## Pipeline de render (não pode crashar)
Nunca renderizar vídeo + overlay juntos no Remotion em resolução alta (estoura memória do Chrome).
1. Montar a **BASE** com ffmpeg (reenquadrar/cortar/normalizar).
2. Renderizar **só as overlays** em PNG transparente no Remotion (prop `transparent`, `--sequence --image-format=png`).
3. **Compor** base + PNGs com ffmpeg (`overlay`).
> Re-render parcial muda o padding do nome do PNG (`element-%02d` vs `%04d`) — ao recompor, use o mesmo padrão ou re-renderize a sequência inteira.

## 1. Formatos por destino
- **Reels / Shorts** (Instagram/TikTok): 9:16, **1080x1920**, 30fps.
- **Aula YouTube**: 16:9, **1920x1080**, 30fps — não reenquadrar para vertical.

## 2. Tipos de vídeo (define enquadramento e legenda) — identificar ANTES
- **Screencast com webcam de canto**: crop webcam + crop tela → tela dividida.
- **Screencast horizontal já montado** (webcam em cima + tela embaixo, tarjas laterais): NÃO recortar/dar zoom (corta o rosto). Pegar a coluna útil (`cropdetect`), encaixar em 9:16 no modo **FIT** (`scale=1080:-2,pad=1080:1920`), o resto vira **tarja preta**. Nunca cover/cortar.
- **Talking head vertical** (celular): já é 9:16 nativo (às vezes `rotation=90`/HEVC). Não reenquadrar.
- **Aula horizontal**: manter 16:9; normalizar resolução mista para 1080p; emendar partes numeradas.

## 3. Corte — método correto
- Cortar **pelo ÁUDIO REAL**, nunca pelos timestamps do Whisper (saem esticados, escondem silêncio, desincronizam a legenda).
- **NORMALIZAR o áudio antes** (`loudnorm=I=-16:TP=-1.5:LRA=11`): o ruído varia ao longo do vídeo; com threshold fixo o início corta bem e o final "quebra".
- `silencedetect=noise=-XdB:d=0.35`, X ~12dB abaixo do volume médio da fala (medir com `volumedetect`). `keep` = blocos de fala, pad ~0.12s.
- Talking head com roteiro: cortar as pausas de leitura (a pessoa para pra ler entre frases).
- **Repetições**: manter só a take CERTA (a fluida; a hesitante/truncada é a errada; costuma ser a 2ª/última).
- **Legenda sincronizada**: RE-TRANSCREVER o vídeo já cortado; não remapear timestamps do original.
- Filtrar tokens não-verbais (`[MÚSICA]` etc); cortar o fim após a última fala.
- Aula: corte conservador (não picotar).
- "Olhar desviado enquanto fala" é problema visual — o áudio não pega; detectar por mosaico de frames.

## 4. Legenda — posição POR TIPO (não trocar entre tipos)
- **Screencast / tela dividida** (tarja preta): legenda **em cima** (tarja de cima) + palavras-chave/chips **embaixo**.
- **Talking head tela cheia**: legenda no **centro-baixo** (top ≈ 1080).
- **Aula YouTube**: sem legenda karaokê — só destaques + cards de capítulo.
- Estilos karaokê: sublinhado, bloco, marca-texto, salto/pop, caixa. Também: frase inteira, uma palavra gigante, só palavras-chave.

## 5. Zonas da UI do Instagram (9:16) — legenda fica fora delas
- **Topo** (y 0-250): nome/seguir.
- **Rodapé** (y 1450-1920): descrição/hashtags/áudio.
- **Direita** (x 900-1080, y 1050-1550): botões de ação.
- **Zona segura da legenda**: centro-baixo (y 1050-1350).
- **HOOK central** (y ~960) — o feed 4:5 mostra só o centro (y 285-1635).

## 6. Paleta — UMA por vídeo
Fundo escuro + 1 cor de destaque + branco. Nunca misturar cores na escrita ("carnaval"). Emojis podem ser coloridos. Escolher uma harmônica por tema.

## 7. Hook
Vem do gancho da história, não de descrever a tela. Central. Sempre resolver ativamente (perguntar se tem, ou propor 2-3 opções).

## 8. Efeitos — dose por formato
- **Reel**: hook, barra de progresso, destaques, emojis nos beats, flashes, chips de etapa. Energia alta.
- **Aula**: título de abertura, capítulos (lower thirds), destaques pontuais. Sóbrio.

## 9. Entrega
Um arquivo em qualidade cheia em `out/`. Para caber em limite de upload, comprimir com **two-pass** (nunca bitrate baixo demais).
