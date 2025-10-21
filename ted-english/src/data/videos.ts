import { TranscriptSegment, VideoDetail } from '../types/video';

const buildTedSource = (slug: string) => ({
  type: 'ted' as const,
  id: slug,
  embedUrl: `https://embed.ted.com/talks/${slug}`,
  watchUrl: `https://www.ted.com/talks/${slug}`,
  providerName: 'TED',
});

const buildYoutubeSource = (youtubeId: string) => ({
  type: 'youtube' as const,
  id: youtubeId,
  embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
  watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
  providerName: 'YouTube',
});

const extractKeywords = (text: string) => {
  const matches = text.toLowerCase().match(/[a-z]{5,}/g) ?? [];
  const unique = Array.from(new Set(matches));

  return unique.slice(0, 3).map((term) => ({
    term,
    definition: `${term}의 의미를 사전에서 확인하고 영어 예문을 만들어 보세요.`,
  }));
};

const buildPlaceholderTranscript = (title: string, englishSummary: string): TranscriptSegment[] => {
  const vocabulary = extractKeywords(englishSummary);

  return [
    {
      start: 0,
      end: 45,
      english: englishSummary,
      korean: `${title} 강연의 핵심 내용을 한국어로 정리해 보세요.`,
      grammarNotes: ['주요 동사와 시제를 파악해 보세요.'],
      vocabulary,
    },
    {
      start: 45,
      end: 90,
      english: 'Think about how this message relates to your own life and explain it in English.',
      korean: '이 메시지가 자신의 삶과 어떻게 연결되는지 영어로 설명해 보세요.',
      grammarNotes: ['명령문과 to 부정사의 쓰임을 살펴보세요.'],
      vocabulary: [
        {
          term: 'relate',
          definition: 'relate의 의미를 확인하고 활용 예문을 만들어 보세요.',
        },
        {
          term: 'describe',
          definition: 'describe의 쓰임을 연습해 보세요.',
        },
      ],
    },
  ];
};

const buildPlaceholderObjectives = (title: string): string[] => [
  `${title}에서 전달하는 핵심 메시지를 이해하기`,
  '강연에서 배운 표현과 어휘를 정리하기',
  '주제를 자신의 경험과 연결해 영어로 말하기',
];

const buildSpeakerSummary = (speaker: string, title: string, description: string) => {
  const trimmedSpeaker = speaker.trim();
  const trimmedDescription = description.replace(/\s+/g, ' ').trim();

  if (trimmedSpeaker && trimmedDescription) {
    return `${trimmedSpeaker}의 TED 강연자로, ${trimmedDescription}`;
  }

  if (trimmedSpeaker) {
    return `${trimmedSpeaker}의 TED 강연자 소개는 준비 중입니다.`;
  }

  if (trimmedDescription) {
    return `${title} 강연자는 ${trimmedDescription}`;
  }

  return `${title} 강연자의 소개는 준비 중입니다.`;
};

type PlaceholderVideoSeed = {
  id: string;
  title: string;
  speaker: string;
  youtubeId: string;
  tags: string[];
  shortDescription: string;
  englishSummary: string;
  publishedAt: string;
  duration?: string;
};

const createFallbackVideo = (seed: PlaceholderVideoSeed): VideoDetail => {
  const source = buildYoutubeSource(seed.youtubeId);

  return {
    id: seed.id,
    title: seed.title,
    speaker: seed.speaker,
    thumbnailUrl: `https://img.youtube.com/vi/${seed.youtubeId}/hqdefault.jpg`,
    duration: seed.duration ?? '재생시간 미정',
    tags: seed.tags,
    shortDescription: seed.shortDescription,
    speakerSummary: buildSpeakerSummary(seed.speaker, seed.title, seed.shortDescription),
    source,
    publishedAt: seed.publishedAt,
    learningObjectives: buildPlaceholderObjectives(seed.title),
    transcript: buildPlaceholderTranscript(seed.title, seed.englishSummary),
  };
};

const baseVideos: VideoDetail[] = [
  {
    id: 'amy_cuddy_your_body_language_shapes_who_you_are',
    title: 'Your body language may shape who you are',
    speaker: 'Amy Cuddy',
    thumbnailUrl:
      'https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/f6f0426a-f489-4a2d-842c-4ffb0f0ec81b/AmyCuddy_2012-embed.jpg?w=800',
    duration: '21:03',
    tags: ['Confidence', 'Body language'],
    shortDescription:
      '사회심리학자 에이미 커디가 자세와 몸짓이 우리의 감정과 성공에 어떤 영향을 미치는지 설명합니다.',
    source: buildTedSource('amy_cuddy_your_body_language_shapes_who_you_are'),
    publishedAt: '2012-06-01T00:00:00Z',
    learningObjectives: [
      '파워 포즈가 자기 인식에 미치는 영향 이해하기',
      '비언어적 신호가 타인에게 주는 인상을 분석하기',
      '자신감을 키우기 위한 실천적 전략 정리하기',
    ],
    transcript: [
      {
        start: 0,
        end: 45,
        english:
          "So I want to start by offering you a free no-tech life hack, and all it requires of you is this: that you change your posture for two minutes.",
        korean:
          '간단한 자세 변화만으로 삶을 바꿀 수 있는 무료 팁을 소개합니다. 단 2분간 자세를 바꾸기만 하면 됩니다.',
        grammarNotes: ['명령문 형태에서 동사 원형 사용을 확인하세요.'],
        vocabulary: [
          {
            term: 'posture',
            definition: '몸의 자세, 포즈',
            example: 'Maintain a confident posture before your presentation.',
          },
        ],
      },
      {
        start: 45,
        end: 90,
        english: 'Power posing actually feels good, and it improves your performance.',
        korean: '파워 포즈는 기분을 좋게 하고 성과 향상에도 도움이 됩니다.',
        grammarNotes: ['현재형 서술문에서 주어와 동사의 일치를 확인하세요.'],
        vocabulary: [
          {
            term: 'performance',
            definition: '성과, 수행 능력',
            example: 'Her performance improved after regular practice.',
          },
        ],
      },
      {
        start: 90,
        end: 150,
        english: 'Tiny tweaks can lead to big changes.',
        korean: '작은 조정이 큰 변화를 가져올 수 있습니다.',
        grammarNotes: ['조동사 can의 사용을 확인하고 가능성을 표현하는 방법을 익히세요.'],
        vocabulary: [
          {
            term: 'tweak',
            definition: '작은 수정, 약간의 조정',
            example: 'Make a few tweaks to your study plan each week.',
          },
        ],
      },
    ],
  },
  {
    id: 'sir_ken_robinson_do_schools_kill_creativity',
    title: 'Do schools kill creativity?',
    speaker: 'Sir Ken Robinson',
    thumbnailUrl:
      'https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/01b0b405-c448-4b24-a9dc-7ad0dbff25dc/SirKenRobinson_2006-embed.jpg?w=800',
    duration: '19:24',
    tags: ['Education', 'Creativity'],
    shortDescription: '켄 로빈슨 경이 교육 시스템이 창의성을 억누르는 방식과 그 대안을 제시합니다.',
    source: buildTedSource('sir_ken_robinson_do_schools_kill_creativity'),
    publishedAt: '2006-02-01T00:00:00Z',
    learningObjectives: [
      '교육 현장에서 창의성을 지키는 전략 살펴보기',
      '실패와 학습의 관계에 대한 관점 이해하기',
      '다양한 재능을 존중하는 수업 설계 방안 고민하기',
    ],
    transcript: [
      {
        start: 0,
        end: 60,
        english: 'What I find is everybody has an interest in education literally everybody.',
        korean: '모든 사람이 교육에 관심이 있다는 사실을 발견했습니다.',
        grammarNotes: ['현재형 일반동사의 활용을 확인하세요.'],
        vocabulary: [
          {
            term: 'literally',
            definition: '말 그대로, 정말로',
            example: 'Literally everyone showed up to the meeting.',
          },
        ],
      },
      {
        start: 60,
        end: 120,
        english: 'If you are not prepared to be wrong, you will never come up with anything original.',
        korean: '틀릴 준비가 되어 있지 않다면, 결코 독창적인 것을 만들어낼 수 없습니다.',
        grammarNotes: ['조건문 if 절과 본문의 시제 일치를 확인하세요.'],
        vocabulary: [
          {
            term: 'original',
            definition: '독창적인, 원래의',
            example: 'She had an original idea for the science project.',
          },
        ],
      },
      {
        start: 120,
        end: 180,
        english: 'We stigmatize mistakes, and we are now running national education systems where mistakes are the worst thing you can make.',
        korean: '우리는 실수를 낙인찍고, 실수가 최악이라고 여기는 교육 시스템을 운영하고 있습니다.',
        grammarNotes: ['현재진행형과 관계대명사 where의 쓰임을 살펴보세요.'],
        vocabulary: [
          {
            term: 'stigmatize',
            definition: '오명을 씌우다, 낙인찍다',
            example: 'Do not stigmatize learners for asking questions.',
          },
        ],
      },
    ],
  },
  {
    id: 'chimamanda_adichie_the_danger_of_a_single_story',
    title: 'The danger of a single story',
    speaker: 'Chimamanda Ngozi Adichie',
    thumbnailUrl:
      'https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/22c612e4-3925-43a7-9813-0ce8bf1f6382/ChimamandaAdichie_2009G-embed.jpg?w=800',
    duration: '18:48',
    tags: ['Storytelling', 'Culture'],
    shortDescription: '치마만다 응고지 아디치에가 단일한 이야기의 위험성과 다양성의 중요성을 이야기합니다.',
    source: buildTedSource('chimamanda_adichie_the_danger_of_a_single_story'),
    publishedAt: '2009-07-01T00:00:00Z',
    learningObjectives: [
      '단일한 이야기가 편견을 만드는 방식 이해하기',
      '다양한 관점을 수용하는 언어 표현 배우기',
      '문화적 배경을 설명하는 어휘 확장하기',
    ],
    transcript: [
      {
        start: 0,
        end: 60,
        english: 'I am a storyteller and I would like to tell you a few personal stories about what I like to call the danger of the single story.',
        korean: '저는 이야기꾼입니다. 단일한 이야기의 위험성에 대한 개인적인 이야기를 들려드리고자 합니다.',
        grammarNotes: ['I would like to 의 공손한 표현을 확인하세요.'],
        vocabulary: [
          {
            term: 'storyteller',
            definition: '이야기꾼, 이야기하는 사람',
            example: 'Become a storyteller who shares multiple perspectives.',
          },
        ],
      },
      {
        start: 60,
        end: 120,
        english: 'Show a people as one thing, as only one thing, over and over again, and that is what they become.',
        korean: '사람들을 단 하나의 모습으로 반복해서 보여주면, 결국 그 모습으로 굳어집니다.',
        grammarNotes: ['명령문의 구조와 and that is what ... 구문을 분석해 보세요.'],
        vocabulary: [
          {
            term: 'over and over',
            definition: '반복해서, 계속해서',
            example: 'Practice the vocabulary over and over until it sticks.',
          },
        ],
      },
      {
        start: 120,
        end: 180,
        english: 'The consequence of the single story is this: It robs people of dignity.',
        korean: '단일한 이야기가 가져오는 결과는 사람들의 존엄성을 빼앗는 것입니다.',
        grammarNotes: ['동격 the consequence ... is this 구문을 확인하세요.'],
        vocabulary: [
          {
            term: 'dignity',
            definition: '존엄, 품위',
            example: 'Every person deserves to live with dignity.',
          },
        ],
      },
    ],
  },
];

const fallbackVideoSeeds: PlaceholderVideoSeed[] = [
  {
    id: 'simon_sinek_how_great_leaders_inspire_action',
    title: 'How great leaders inspire action',
    speaker: 'Simon Sinek',
    youtubeId: 'qp0HIF3SfI4',
    tags: ['Leadership', 'Motivation'],
    shortDescription: '사이먼 시넥이 리더들이 왜에서 시작해야 하는지 설명합니다.',
    englishSummary: 'Simon Sinek explains how inspirational leaders start by communicating a clear sense of why.',
    publishedAt: '2009-09-17T00:00:00Z',
  },
  {
    id: 'brene_brown_the_power_of_vulnerability',
    title: 'The power of vulnerability',
    speaker: 'Brené Brown',
    youtubeId: 'iCvmsMzlF7o',
    tags: ['Courage', 'Connection'],
    shortDescription: '브레네 브라운이 취약함을 받아들이는 힘에 대해 이야기합니다.',
    englishSummary: 'Brené Brown shows how embracing vulnerability creates real courage and connection.',
    publishedAt: '2010-06-22T00:00:00Z',
  },
  {
    id: 'jill_bolte_taylor_my_stroke_of_insight',
    title: 'My stroke of insight',
    speaker: 'Jill Bolte Taylor',
    youtubeId: 'UyyjU8fzEYU',
    tags: ['Brain', 'Recovery'],
    shortDescription: '질 볼티 테일러가 뇌졸중 경험에서 얻은 통찰을 공유합니다.',
    englishSummary: 'Jill Bolte Taylor recounts her stroke and the profound insight it gave her about the brain.',
    publishedAt: '2008-05-01T00:00:00Z',
  },
  {
    id: 'dan_pink_the_puzzle_of_motivation',
    title: 'The puzzle of motivation',
    speaker: 'Dan Pink',
    youtubeId: 'rrkrvAUbU9Y',
    tags: ['Work', 'Psychology'],
    shortDescription: '댄 핑크가 동기 부여의 비밀과 보상의 한계를 설명합니다.',
    englishSummary: 'Dan Pink explores why traditional rewards often fail and what truly motivates us.',
    publishedAt: '2009-07-01T00:00:00Z',
  },
  {
    id: 'shawn_achor_the_happy_secret_to_better_work',
    title: 'The happy secret to better work',
    speaker: 'Shawn Achor',
    youtubeId: 'fLJsdqxnZb0',
    tags: ['Happiness', 'Productivity'],
    shortDescription: '숀 에이코가 긍정심리가 업무 성과를 높이는 방법을 소개합니다.',
    englishSummary: 'Shawn Achor explains how a happier mindset can unlock better performance at work.',
    publishedAt: '2011-05-01T00:00:00Z',
  },
  {
    id: 'susan_cain_the_power_of_introverts',
    title: 'The power of introverts',
    speaker: 'Susan Cain',
    youtubeId: 'c0KYU2j0TM4',
    tags: ['Personality', 'Culture'],
    shortDescription: '수전 케인이 내향형의 강점을 조명합니다.',
    englishSummary: 'Susan Cain celebrates the quiet strengths that introverts bring to the world.',
    publishedAt: '2012-03-01T00:00:00Z',
  },
  {
    id: 'julian_treasure_how_to_speak_so_that_people_want_to_listen',
    title: 'How to speak so that people want to listen',
    speaker: 'Julian Treasure',
    youtubeId: 'eIho2S0ZahI',
    tags: ['Communication', 'Voice'],
    shortDescription: '줄리언 트레저가 사람들의 귀를 여는 말하기 기술을 소개합니다.',
    englishSummary: 'Julian Treasure shares vocal tools that help us speak so others truly want to listen.',
    publishedAt: '2014-06-27T00:00:00Z',
  },
  {
    id: 'angela_duckworth_grit_the_power_of_passion_and_perseverance',
    title: 'Grit: the power of passion and perseverance',
    speaker: 'Angela Lee Duckworth',
    youtubeId: 'H14bBuluwB8',
    tags: ['Education', 'Success'],
    shortDescription: '앤절라 더크워스가 끈기가 성공을 이끄는 힘이라고 말합니다.',
    englishSummary: 'Angela Lee Duckworth reveals how grit and perseverance drive long-term achievement.',
    publishedAt: '2013-05-09T00:00:00Z',
  },
  {
    id: 'mary_roach_10_things_you_didnt_know_about_orgasm',
    title: "10 things you didn't know about orgasm",
    speaker: 'Mary Roach',
    youtubeId: 'lg3tmlxVFt4',
    tags: ['Science', 'Humor'],
    shortDescription: '메리 로치가 과학적 사실로 오르가즘을 유쾌하게 풀어냅니다.',
    englishSummary: "Mary Roach delivers surprising science about orgasm with wit and clarity.",
    publishedAt: '2009-02-01T00:00:00Z',
  },
  {
    id: 'elizabeth_gilbert_your_elusive_creative_genius',
    title: 'Your elusive creative genius',
    speaker: 'Elizabeth Gilbert',
    youtubeId: '86x-u-tz0MA',
    tags: ['Creativity', 'Writing'],
    shortDescription: '엘리자베스 길버트가 창의성을 대하는 새로운 관점을 제시합니다.',
    englishSummary: 'Elizabeth Gilbert reimagines how we think about creative genius and fear.',
    publishedAt: '2009-02-05T00:00:00Z',
  },
  {
    id: 'tony_robbins_why_we_do_what_we_do',
    title: 'Why we do what we do',
    speaker: 'Tony Robbins',
    youtubeId: 'Cpc-t-Uwv1I',
    tags: ['Behavior', 'Motivation'],
    shortDescription: '토니 로빈스가 인간 행동을 이끄는 여섯 가지 욕구를 설명합니다.',
    englishSummary: 'Tony Robbins discusses the invisible forces that shape our actions every day.',
    publishedAt: '2006-02-01T00:00:00Z',
  },
  {
    id: 'pico_iyer_the_art_of_stillness',
    title: 'The art of stillness',
    speaker: 'Pico Iyer',
    youtubeId: '8Kswyq_8iPk',
    tags: ['Mindfulness', 'Travel'],
    shortDescription: '피코 아이어가 멈춤과 고요가 주는 선물을 이야기합니다.',
    englishSummary: 'Pico Iyer reflects on how moments of stillness can transform busy lives.',
    publishedAt: '2014-11-13T00:00:00Z',
  },
  {
    id: 'bill_gross_the_single_biggest_reason_why_startups_succeed',
    title: 'The single biggest reason why startups succeed',
    speaker: 'Bill Gross',
    youtubeId: 'bNpx7gpSqbY',
    tags: ['Startups', 'Strategy'],
    shortDescription: '빌 그로스가 스타트업 성공을 좌우하는 결정적 요인을 분석합니다.',
    englishSummary: 'Bill Gross breaks down data to reveal the top factor behind startup success.',
    publishedAt: '2015-03-01T00:00:00Z',
  },
  {
    id: 'tim_urban_inside_the_mind_of_a_master_procrastinator',
    title: 'Inside the mind of a master procrastinator',
    speaker: 'Tim Urban',
    youtubeId: 'arj7oStGLkU',
    tags: ['Productivity', 'Humor'],
    shortDescription: '팀 어반이 미루기의 심리를 유쾌하게 풀어냅니다.',
    englishSummary: 'Tim Urban humorously explores what happens inside the mind of a procrastinator.',
    publishedAt: '2016-02-01T00:00:00Z',
  },
  {
    id: 'dan_gilbert_the_surprising_science_of_happiness',
    title: 'The surprising science of happiness',
    speaker: 'Dan Gilbert',
    youtubeId: '4q1dgn_C0AU',
    tags: ['Happiness', 'Psychology'],
    shortDescription: '댄 길버트가 행복에 대한 놀라운 과학적 사실을 설명합니다.',
    englishSummary: 'Dan Gilbert shares the science that explains why we can synthesize happiness.',
    publishedAt: '2004-02-01T00:00:00Z',
  },
  {
    id: 'hans_rosling_the_best_stats_you_ve_ever_seen',
    title: "The best stats you've ever seen",
    speaker: 'Hans Rosling',
    youtubeId: 'usdJgEwMinM',
    tags: ['Data', 'Global development'],
    shortDescription: '한스 로슬링이 데이터로 세계를 보는 새로운 시각을 제시합니다.',
    englishSummary: "Hans Rosling brings global statistics to life with dynamic storytelling.",
    publishedAt: '2006-02-01T00:00:00Z',
  },
  {
    id: 'robert_waldinger_what_makes_a_good_life',
    title: 'What makes a good life? Lessons from the longest study on happiness',
    speaker: 'Robert Waldinger',
    youtubeId: '8KkKuTCFvzI',
    tags: ['Well-being', 'Relationships'],
    shortDescription: '로버트 월딩어가 행복 연구에서 얻은 삶의 교훈을 공유합니다.',
    englishSummary: 'Robert Waldinger reveals lessons on happiness from a decades-long study.',
    publishedAt: '2015-11-01T00:00:00Z',
  },
  {
    id: 'sarah_kay_if_i_should_have_a_daughter',
    title: 'If I should have a daughter ...',
    speaker: 'Sarah Kay',
    youtubeId: '0snNB1yS3IE',
    tags: ['Spoken word', 'Creativity'],
    shortDescription: '사라 케이가 시와 이야기로 성장과 공감을 노래합니다.',
    englishSummary: 'Sarah Kay performs spoken word poetry about love, growth, and imagination.',
    publishedAt: '2011-03-01T00:00:00Z',
  },
  {
    id: 'brene_brown_listening_to_shame',
    title: 'Listening to shame',
    speaker: 'Brené Brown',
    youtubeId: 'psN1DORYYV0',
    tags: ['Courage', 'Empathy'],
    shortDescription: '브레네 브라운이 수치심을 이해하고 극복하는 방법을 제안합니다.',
    englishSummary: 'Brené Brown encourages us to confront shame and build wholehearted lives.',
    publishedAt: '2012-03-01T00:00:00Z',
  },
  {
    id: 'kelly_mcgonigal_how_to_make_stress_your_friend',
    title: 'How to make stress your friend',
    speaker: 'Kelly McGonigal',
    youtubeId: 'RcGyVTAoXEU',
    tags: ['Health', 'Mindset'],
    shortDescription: '켈리 맥고니걸이 스트레스를 친구로 만드는 새로운 관점을 소개합니다.',
    englishSummary: 'Kelly McGonigal reframes stress as a response that can strengthen us.',
    publishedAt: '2013-06-01T00:00:00Z',
  },
  {
    id: 'nigel_marsh_how_to_make_work_life_balance_work',
    title: 'How to make work-life balance work',
    speaker: 'Nigel Marsh',
    youtubeId: 'jdpIKXLLYYM',
    tags: ['Work', 'Balance'],
    shortDescription: '나이젤 마시가 현실적인 워라밸 전략을 공유합니다.',
    englishSummary: 'Nigel Marsh shares practical steps for designing a sustainable work-life balance.',
    publishedAt: '2010-05-01T00:00:00Z',
  },
  {
    id: 'monica_lewinsky_the_price_of_shame',
    title: 'The price of shame',
    speaker: 'Monica Lewinsky',
    youtubeId: 'FQ0-0jeA_mg',
    tags: ['Cyberbullying', 'Empathy'],
    shortDescription: '모니카 르윈스키가 온라인 괴롭힘의 대가와 공감의 중요성을 이야기합니다.',
    englishSummary: 'Monica Lewinsky discusses the cost of shame culture and why empathy matters.',
    publishedAt: '2015-03-01T00:00:00Z',
  },
  {
    id: 'jamie_oliver_teach_every_child_about_food',
    title: 'Teach every child about food',
    speaker: 'Jamie Oliver',
    youtubeId: 'go_QOzc79Uc',
    tags: ['Health', 'Education'],
    shortDescription: '제이미 올리버가 모든 아이들에게 음식 교육이 필요하다고 강조합니다.',
    englishSummary: 'Jamie Oliver calls for better food education to fight diet-related disease.',
    publishedAt: '2010-02-01T00:00:00Z',
  },
  {
    id: 'pamela_meyer_how_to_spot_a_liar',
    title: 'How to spot a liar',
    speaker: 'Pamela Meyer',
    youtubeId: 'P_6vDLq64gE',
    tags: ['Communication', 'Psychology'],
    shortDescription: '파멜라 마이어가 거짓말을 구분하는 단서를 공유합니다.',
    englishSummary: 'Pamela Meyer uncovers patterns that reveal when someone might be lying.',
    publishedAt: '2011-07-15T00:00:00Z',
  },
  {
    id: 'rita_pierson_every_kid_needs_a_champion',
    title: 'Every kid needs a champion',
    speaker: 'Rita Pierson',
    youtubeId: 'SFnMTHhKdkw',
    tags: ['Education', 'Inspiration'],
    shortDescription: '리타 피어슨이 학생 한 명 한 명에게 필요한 응원을 말합니다.',
    englishSummary: 'Rita Pierson reminds teachers that relationships transform student learning.',
    publishedAt: '2013-05-01T00:00:00Z',
  },
  {
    id: 'lera_boroditsky_how_language_shapes_the_way_we_think',
    title: 'How language shapes the way we think',
    speaker: 'Lera Boroditsky',
    youtubeId: 'RKK7wGAYP6k',
    tags: ['Language', 'Culture'],
    shortDescription: '레라 보로디츠키가 언어가 사고방식을 어떻게 바꾸는지 설명합니다.',
    englishSummary: 'Lera Boroditsky explores how language influences the way we understand the world.',
    publishedAt: '2017-11-01T00:00:00Z',
  },
  {
    id: 'ernesto_sirolli_want_to_help_someone_shut_up_and_listen',
    title: 'Want to help someone? Shut up and listen!',
    speaker: 'Ernesto Sirolli',
    youtubeId: 'chXsLtHqfdM',
    tags: ['Development', 'Entrepreneurship'],
    shortDescription: '에르네스토 시롤리가 진짜 도움을 주는 경청의 기술을 말합니다.',
    englishSummary: 'Ernesto Sirolli urges would-be helpers to listen deeply before taking action.',
    publishedAt: '2012-06-01T00:00:00Z',
  },
];

const generatedFallbackVideos = fallbackVideoSeeds.map(createFallbackVideo);

const withSpeakerSummary = (video: VideoDetail): VideoDetail => ({
  ...video,
  speakerSummary: video.speakerSummary ?? buildSpeakerSummary(video.speaker, video.title, video.shortDescription),
});

export const videos: VideoDetail[] = [...baseVideos, ...generatedFallbackVideos].map(withSpeakerSummary);

export const videosById = videos.reduce<Record<string, VideoDetail>>((accumulator, video) => {
  accumulator[video.id] = video;
  return accumulator;
}, {});
