#!/bin/bash
# voice-cut.sh <video_bruto> <saida.mp4> [--analise]
#
# Corta tudo que NAO e voz no microfone: espera morta, suspiro, barulho de
# movimento, carro passando, ruido distante. Nao mexe em enquadramento nem
# resolucao: uma passada de ffmpeg, resolucao nativa preservada.
#
# Regras que valem ouro (aprendidas apanhando, nao mudar sem motivo):
#  - Audio de analise SEMPRE CRU. loudnorm aplica ganho DINAMICO, levanta o
#    ruido de fundo ate o nivel da fala e CEGA a deteccao. Se a gravacao veio
#    fraca, usar ganho ESTATICO: GANHO=20 voice-cut.sh ...
#  - -ar/-ac valem POR SAIDA no ffmpeg. Repetir em cada uma, senao as bandas
#    saem em 48kHz estereo e a analise le o sinal deslocado, sem erro nenhum.
#
# Variaveis: GANHO=<dB> ganho estatico  |  WORK=<dir> pasta de trabalho
set -e
V="$1"; OUT="$2"; MODO="$3"
[ -z "$V" ] || [ -z "$OUT" ] && { echo "uso: voice-cut.sh <bruto> <saida.mp4> [--analise]"; exit 1; }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK="${WORK:-${TMPDIR:-/tmp}/voice-cut}"
GANHO="${GANHO:-0}"
mkdir -p "$WORK"
K="$(basename "${OUT%.*}")"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
[ "$GANHO" != "0" ] && G="volume=${GANHO}dB," || G=""

ffmpeg -v error -y -i "$V" -vn \
  ${G:+-af "${G%,}"} -ar 16000 -ac 1 -f s16le -acodec pcm_s16le "$WORK/${K}_full.raw" \
  -af "${G}highpass=f=70,lowpass=f=1000" -ar 16000 -ac 1 -f s16le -acodec pcm_s16le "$WORK/${K}_pitch.raw" \
  -af "${G}highpass=f=300,lowpass=f=3000" -ar 16000 -ac 1 -f s16le -acodec pcm_s16le "$WORK/${K}_form.raw"

node "$HERE/voice-cut.cjs" "$WORK/${K}_full.raw" "$WORK/${K}_pitch.raw" \
  "$WORK/${K}_form.raw" "$DUR" "$WORK/${K}.json"

[ "$MODO" = "--analise" ] && exit 0

{ sed 's/^/[0:v]/;s/$/[v];/' "$WORK/${K}_v.txt"; sed 's/^/[0:a]/;s/$/[a]/' "$WORK/${K}_a.txt"; } | tr -d '\n' > "$WORK/${K}_fc.txt"

ffmpeg -hide_banner -nostats -v error -y -i "$V" -/filter_complex "$WORK/${K}_fc.txt" \
  -map "[v]" -map "[a]" -c:v libx264 -preset fast -crf 21 -pix_fmt yuv420p \
  -movflags +faststart -c:a aac -b:a 192k "$OUT"

echo "  final: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s -> $OUT"
