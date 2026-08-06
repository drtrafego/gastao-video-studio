import {Composition, Folder} from "remotion";

// Compositions
import {ShowcaseComposition} from "./compositions/Showcase";

// Social templates
import {TikTokVideo} from "./templates/social/TikTokVideo";
import {InstagramReel} from "./templates/social/InstagramReel";
import {YouTubeShort} from "./templates/social/YouTubeShort";

// Content templates
import {Presentation} from "./templates/content/Presentation";
import {Testimonial} from "./templates/content/Testimonial";

// Promo templates
import {Announcement} from "./templates/promo/Announcement";
import {BeforeAfterDemo} from "./compositions/BeforeAfterDemo";

// Editing templates
import {TalkingHeadEdit} from "./templates/editing/TalkingHeadEdit";
import {PodcastClip} from "./templates/editing/PodcastClip";

// Projeto do usuario
import {ReelsTarefaFacil} from "./compositions/ReelsTarefaFacil";
import {ReelsAppNoAr} from "./compositions/ReelsAppNoAr";
import {ReelsGithubVercel} from "./compositions/ReelsGithubVercel";
import {ReelsCorrigirErros} from "./compositions/ReelsCorrigirErros";
import {AulaCards} from "./compositions/AulaCards";
import {ReelsPortalMentoria} from "./compositions/ReelsPortalMentoria";
import {ReelsTerminal} from "./compositions/ReelsTerminal";
import {ReelsIndicacao} from "./compositions/ReelsIndicacao";
import {ReelsChefe} from "./compositions/ReelsChefe";
import {ReelsCaseImobiliaria} from "./compositions/ReelsCaseImobiliaria";
import {ReelsMetaRobo} from "./compositions/ReelsMetaRobo";
import {ReelsAgendaCheia} from "./compositions/ReelsAgendaCheia";
import {ReelsIABurra} from "./compositions/ReelsIABurra";
import {ReelsAmandaEstrutura} from "./compositions/ReelsAmandaEstrutura";
import {ReelsGabinete} from "./compositions/ReelsGabinete";
import {ReelsTelinhaPreta} from "./compositions/ReelsTelinhaPreta";
import {ReelsCampanhas} from "./compositions/ReelsCampanhas";
import {ReelsCampanhasCurto} from "./compositions/ReelsCampanhasCurto";
import {ReelsCriativosCurso} from "./compositions/ReelsCriativosCurso";
import {ReelsDepoimento} from "./compositions/ReelsDepoimento";
import {ReelsMentira} from "./compositions/ReelsMentira";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="MeusReels">
        <Composition
          id="ReelsTarefaFacil"
          component={ReelsTarefaFacil}
          durationInFrames={4765}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_base.mp4",
            captionsFile: "captions_reels.json",
            hook: "Meu funcionário de IA",
            hookSub: "trabalha todo domingo sozinho",
          }}
        />
        <Composition
          id="ReelsGabinete"
          component={ReelsTarefaFacil}
          durationInFrames={4316}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels2_base.mp4",
            captionsFile: "captions_reels2.json",
            hook: "Um advogado me chamou no Direct",
            hookSub: "e eu construí o sistema dele com IA",
          }}
        />
        <Composition
          id="ReelsAppNoAr"
          component={ReelsAppNoAr}
          durationInFrames={3536}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels3_base.mp4",
            captionsFile: "captions_reels3.json",
            hookA: "SEU PRIMEIRO APP",
            hookHi: "PRESO",
            hookB: "NO SEU PC",
            hookSub: "3 ferramentas pra botar no ar",
          }}
        />
        <Composition
          id="ReelsGithubVercel"
          component={ReelsGithubVercel}
          durationInFrames={3833}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_github_base.mp4",
            captionsFile: "captions_github.json",
            hookA: "CONSTRUÍ MEU APP",
            hookHi: "COM IA",
            hookB: "E BOTEI NO AR",
            hookSub: "GitHub + Vercel, de graça",
          }}
        />
        <Composition
          id="ReelsCorrigirErros"
          component={ReelsCorrigirErros}
          durationInFrames={5029}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_corrigir_base.mp4",
            captionsFile: "captions_corrigir.json",
            hookA: "MEU SITE",
            hookHi: "DEU ERRO",
            hookB: "E A IA RESOLVEU",
            hookSub: "sem eu tocar no código",
          }}
        />
        <Composition
          id="ReelsPortalMentoria"
          component={ReelsPortalMentoria}
          durationInFrames={3743}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_portal_base.mp4",
            captionsFile: "captions_portal.json",
            hookA: "PORTAL DE MENTORIA",
            hookHi: "CUSTAVA R$ 30 MIL",
            hookB: "HOJE PEÇO PRO CLAUDE",
            hookSub: "e sai de graça 🤯",
          }}
        />
        <Composition
          id="ReelsTerminal"
          component={ReelsTerminal}
          durationInFrames={3950}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_terminal_base.mp4",
            captionsFile: "captions_terminal.json",
            hookA: "CONSTRUÍ +20 SITES",
            hookHi: "SEM ENTENDER",
            hookB: "O QUE A IA FAZ",
            hookSub: "e você também consegue",
          }}
        />
        <Composition
          id="ReelsIndicacao"
          component={ReelsIndicacao}
          durationInFrames={2858}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_indicacao_base.mp4",
            captionsFile: "captions_indicacao.json",
            hookA: "INDICAÇÃO NÃO É CANAL",
            hookHi: "É SORTE",
            hookB: "COM NOME BONITO",
            hookSub: "e te deixa sem previsibilidade",
          }}
        />
        <Composition
          id="ReelsChefe"
          component={ReelsChefe}
          durationInFrames={1910}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_chefe_base.mp4",
            captionsFile: "captions_chefe.json",
            hookA: "VOCÊ É O PIOR",
            hookHi: "CHEFE",
            hookB: "QUE VOCÊ JÁ TEVE",
            hookSub: "e nem percebe",
          }}
        />
        <Composition
          id="ReelsCaseImobiliaria"
          component={ReelsCaseImobiliaria}
          durationInFrames={1824}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_case_base.mp4",
            captionsFile: "captions_case.json",
          }}
        />
        <Composition
          id="ReelsMetaRobo"
          component={ReelsMetaRobo}
          durationInFrames={2424}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_meta_base.mp4",
            captionsFile: "captions_meta.json",
          }}
        />
        <Composition
          id="ReelsAgendaCheia"
          component={ReelsAgendaCheia}
          durationInFrames={2568}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_agenda_base.mp4",
            captionsFile: "captions_agenda.json",
          }}
        />
        <Composition
          id="ReelsIABurra"
          component={ReelsIABurra}
          durationInFrames={4256}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_burra_base.mp4",
            captionsFile: "captions_burra.json",
          }}
        />
        <Composition
          id="ReelsAmandaEstrutura"
          component={ReelsAmandaEstrutura}
          durationInFrames={4688}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_amanda_base.mp4",
            captionsFile: "captions_amanda.json",
          }}
        />
        <Composition
          id="ReelsGabinetePrazos"
          component={ReelsGabinete}
          durationInFrames={4665}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_gabinete_base.mp4",
            captionsFile: "captions_gabinete.json",
          }}
        />
        <Composition
          id="ReelsTelinhaPreta"
          component={ReelsTelinhaPreta}
          durationInFrames={3664}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/reels_telinha_base.mp4",
            captionsFile: "captions_telinha.json",
          }}
        />
        <Composition
          id="ReelsCampanhas"
          component={ReelsCampanhas}
          durationInFrames={6080}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/campanha_base.mp4",
            captionsFile: "captions_campanha_v3.json",
          }}
        />
        <Composition
          id="ReelsCampanhasCurto"
          component={ReelsCampanhasCurto}
          durationInFrames={2471}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/campanha_curto_base.mp4",
            captionsFile: "captions_campanha_curto_v2.json",
          }}
        />
        <Composition
          id="ReelsCriativosCurso"
          component={ReelsCriativosCurso}
          durationInFrames={2172}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/criativos_curso_base.mp4",
            captionsFile: "captions_curso_v2.json",
          }}
        />
        <Composition
          id="ReelsDepoimento"
          component={ReelsDepoimento}
          durationInFrames={1364}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/depoimento_base.mp4",
            captionsFile: "captions_dep_full.json",
          }}
        />
        <Composition
          id="ReelsMentira"
          component={ReelsMentira}
          durationInFrames={4105}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/mentira_base.mp4",
            captionsFile: "captions_mentira.json",
          }}
        />
        <Composition
          id="AulaCards"
          component={AulaCards}
          durationInFrames={40}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{cards: []}}
        />
      </Folder>

      <Folder name="Examples">
        <Composition
          id="Showcase"
          component={ShowcaseComposition}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Social">
        <Composition
          id="TikTok"
          component={TikTokVideo}
          durationInFrames={270}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            hook: "Did you know this?",
            body: "AI can edit videos now using just code.",
            cta: "Follow for more",
          }}
        />
        <Composition
          id="InstagramReel"
          component={InstagramReel}
          durationInFrames={240}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            headline: "Your headline here",
            subtext: "Supporting text goes here",
            brandName: "Brand",
          }}
        />
        <Composition
          id="YouTubeShort"
          component={YouTubeShort}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            title: "Your Title Here",
            subtitle: "Subtitle goes here",
          }}
        />
      </Folder>

      <Folder name="Content">
        <Composition
          id="Presentation"
          component={Presentation}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            slides: [
              {title: "Welcome", body: "This is slide one"},
              {title: "The Problem", body: "Here's what we're solving"},
              {title: "The Solution", body: "Here's how we solve it"},
            ],
          }}
        />
        <Composition
          id="Testimonial"
          component={Testimonial}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            quote:
              "This product completely changed how we work. Highly recommended.",
            author: "Jane Doe",
            role: "CEO at Company",
          }}
        />
      </Folder>

      <Folder name="Promo">
        <Composition
          id="Announcement"
          component={Announcement}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            preTitle: "Introducing",
            title: "Something Amazing",
            subtitle: "The future is here",
            cta: "Learn More",
          }}
        />
        <Composition
          id="BeforeAfter"
          component={BeforeAfterDemo}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Editing">
        <Composition
          id="TalkingHeadEdit"
          component={TalkingHeadEdit}
          durationInFrames={900}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            videoSrc: "assets/video.mp4",
            showCaptions: true,
            captionPreset: "bold" as const,
            removeSilence: false,
          }}
        />
        <Composition
          id="PodcastClip"
          component={PodcastClip}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoSrc: "assets/video.mp4",
            clipStartSeconds: 0,
            clipEndSeconds: 30,
            showCaptions: true,
            captionPreset: "bold" as const,
          }}
        />
      </Folder>
    </>
  );
};
