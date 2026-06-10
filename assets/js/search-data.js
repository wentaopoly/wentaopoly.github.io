window.__siteSearchData = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "My publications and preprints in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "A collection of my research and engineering projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "Wentao Sun&#39;s CV — AI Agent Algorithm Engineer, PhD candidate at INSA &amp; Nokia Bell Labs.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "news-started-ai-research-internship-at-nokia-bell-labs-paris-developed-a-graph-rag-system-that-raises-f1-from-32-7-to-48-3-47-5-relative-on-the-corr2cause-benchmark",
          title: 'Started AI research internship at Nokia Bell Labs, Paris. Developed a Graph RAG...',
          description: "",
          section: "News",},{id: "news-joined-feiou-technology-as-a-quant-ai-agent-intern-independently-designing-a-real-time-financial-news-analysis-system-datadig-for-the-global-market",
          title: 'Joined Feiou Technology as a Quant AI Agent Intern, independently designing a real-time...',
          description: "",
          section: "News",},{id: "news-started-my-phd-cifre-at-insa-amp-amp-nokia-bell-labs-working-on-language-and-reasoning-models-for-telecom-network-management",
          title: 'Started my PhD (CIFRE) at INSA &amp;amp;amp; Nokia Bell Labs, working on language...',
          description: "",
          section: "News",},{id: "projects-graph-rag-for-causal-reasoning",
          title: 'Graph RAG for Causal Reasoning',
          description: "A Graph RAG system that structures LLM reasoning over correlational text, raising F1 from 32.7 to 48.3 (+47.5% relative) on the Corr2Cause benchmark.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_graph_rag/";
            },},{id: "projects-datadig-financial-news-analysis",
          title: 'DataDig - Financial News Analysis',
          description: "A real-time financial news intelligent analysis system for the global market, featuring async pipelines and 3-layer incremental clustering.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_datadig/";
            },},{id: "projects-humanoid-robot-navigation",
          title: 'Humanoid Robot Navigation',
          description: "Perception-navigation system for wheeled humanoid robots with centimeter-level relocalization, developed at Chinese Academy of Sciences.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_robotics/";
            },},{id: "projects-asr-based-speech-recognition-system",
          title: 'ASR-based Speech Recognition System',
          description: "Outstanding Graduation Project — Speech recognition web app with 95% minority language recognition rate and automatic behavior tree generation.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_asr/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%77%65%6E%74%61%6F.%73%75%6E@%6E%6F%6B%69%61.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/wentaopoly", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/wentao-sun", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=pvJFkokAAAAJ", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
