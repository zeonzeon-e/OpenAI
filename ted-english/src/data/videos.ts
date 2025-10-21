import { TranscriptSegment, VideoDetail } from '../types/video';

type VideoMeta = {
  id: string;
  title: string;
  speaker: string;
  topic: string;
  youtubeId: string;
  durationSeconds: number;
  publishedAt: string;
  tags: string[];
  shortDescription: string;
  speakerBio: string;
};

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(hrs > 0 ? 2 : 1, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return hrs > 0 ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;
};

const sharedGrammarNotes = [
  '현재형 동사로 일반적인 사실을 설명하는 문장을 확인해 보세요.',
  '동명사(-ing)를 사용하여 행동이나 개념을 명사처럼 표현하고 있습니다.',
];

const createTranscript = (meta: VideoMeta): TranscriptSegment[] => [
  {
    start: 0,
    end: 75,
    english: `${meta.speaker} opens the talk by describing how ${meta.topic} shapes everyday decisions and emotions.`,
    korean: `${meta.speaker}는 ${meta.topic}이 우리의 일상적인 선택과 감정을 어떻게 바꾸는지 설명하며 강연을 시작합니다.`,
    grammarNotes: sharedGrammarNotes,
    vocabulary: [
      {
        term: 'reframe',
        definition: `${meta.topic}을 새로운 시각으로 바라보다`,
        partOfSpeech: 'verb',
        example: `${meta.speaker} encourages the audience to reframe ${meta.topic} with curiosity.`,
      },
      {
        term: 'perspective',
        definition: '관점, 시각',
        partOfSpeech: 'noun',
        example: `Changing your perspective can transform how you handle ${meta.topic}.`,
      },
    ],
  },
  {
    start: 75,
    end: 150,
    english: `Through a memorable story, the talk illustrates what ${meta.topic} looks like when people experiment with new habits.`,
    korean: `인상적인 사례를 통해 사람들이 새로운 습관을 시도할 때 ${meta.topic}이 어떻게 나타나는지 보여줍니다.`,
    grammarNotes: [
      '과거시제를 사용해 실제 경험을 회상하며 이야기를 전개합니다.',
      '관계대명사 that을 사용하여 앞선 명사를 자세히 설명합니다.',
    ],
    vocabulary: [
      {
        term: 'experiment',
        definition: `${meta.topic}을 시도하다, 실험하다`,
        partOfSpeech: 'verb',
        example: `She asked the team to experiment with a fresh approach to ${meta.topic}.`,
      },
      {
        term: 'illustrate',
        definition: '예시를 통해 설명하다',
        partOfSpeech: 'verb',
        example: `The story illustrates why ${meta.topic} matters in real life.`,
      },
    ],
  },
  {
    start: 150,
    end: 240,
    english: `In closing, ${meta.speaker} invites the audience to apply the insights on ${meta.topic} to their own communities and routines.`,
    korean: `마지막으로 ${meta.speaker}는 ${meta.topic}에 대한 통찰을 각자의 공동체와 일상에 적용해 보라고 제안합니다.`,
    grammarNotes: [
      '부사구 in closing으로 결말 부분임을 알립니다.',
      'to 부정사를 사용해 실천해야 할 행동을 제시합니다.',
    ],
    vocabulary: [
      {
        term: 'insight',
        definition: `${meta.topic}에 대한 통찰`,
        partOfSpeech: 'noun',
        example: `Each insight on ${meta.topic} becomes a small invitation to act.`,
      },
      {
        term: 'apply',
        definition: '적용하다',
        partOfSpeech: 'verb',
        example: `Try to apply these lessons on ${meta.topic} this week.`,
      },
    ],
  },
];

const createObjectives = (meta: VideoMeta): string[] => [
  `${meta.topic}의 핵심 개념을 이해하고 일상에 연결하기`,
  `${meta.speaker}의 사례를 통해 ${meta.topic}을 실천하는 방법 살펴보기`,
  `개인 학습 또는 수업에서 ${meta.topic}을 활용할 수 있는 표현 익히기`,
];

const createVideo = (meta: VideoMeta): VideoDetail => ({
  id: meta.id,
  title: meta.title,
  speaker: meta.speaker,
  thumbnailUrl: `https://img.youtube.com/vi/${meta.youtubeId}/hqdefault.jpg`,
  duration: formatDuration(meta.durationSeconds),
  durationSeconds: meta.durationSeconds,
  tags: meta.tags,
  shortDescription: meta.shortDescription,
  youtubeId: meta.youtubeId,
  publishedAt: meta.publishedAt,
  learningObjectives: createObjectives(meta),
  transcript: createTranscript(meta),
  speakerBio: meta.speakerBio,
});

const videoMetas: VideoMeta[] = [
  {
    id: 'how-to-make-stress-your-friend',
    title: 'How to Make Stress Your Friend',
    speaker: 'Kelly McGonigal',
    topic: '스트레스를 성장 기회로 전환하는 사고방식',
    youtubeId: 'RcGyVTAoXEU',
    durationSeconds: 868,
    publishedAt: '2013-06-18',
    tags: ['스트레스', '심리학', '회복탄력성'],
    shortDescription:
      '스트레스에 대한 관점을 바꾸면 신체 반응까지 긍정적으로 달라질 수 있다는 연구 결과를 공유합니다.',
    speakerBio:
      'Kelly McGonigal은 스탠퍼드 대학교 심리학자이자 건강 과학자로, 스트레스와 감정이 신체에 미치는 영향을 연구하며 대중에게 쉽고 실용적인 조언을 전하는 강연자로 잘 알려져 있습니다.',
  },
  {
    id: 'inside-the-mind-of-a-master-procrastinator',
    title: 'Inside the mind of a master procrastinator',
    speaker: 'Tim Urban',
    topic: '미루기 습관을 이해하고 관리하는 방법',
    youtubeId: 'arj7oStGLkU',
    durationSeconds: 842,
    publishedAt: '2016-02-23',
    tags: ['자기관리', '생산성', '유머'],
    shortDescription:
      '미루기의 뇌 구조를 유머러스하게 설명하며 마감이 없는 목표에도 동기를 부여하는 전략을 제시합니다.',
    speakerBio:
      'Tim Urban은 인기 블로그 Wait But Why의 공동 창립자로, 복잡한 주제를 재치 있는 일러스트와 이야기로 풀어내며 깊이 있는 통찰을 제공하는 작가이자 강연자입니다.',
  },
  {
    id: 'the-power-of-vulnerability',
    title: 'The power of vulnerability',
    speaker: 'Brené Brown',
    topic: '취약함을 인정하고 연결을 강화하는 용기',
    youtubeId: 'iCvmsMzlF7o',
    durationSeconds: 1222,
    publishedAt: '2010-06-01',
    tags: ['감정', '관계', '연결'],
    shortDescription:
      '취약함을 받아들이는 것이 진정한 용기와 공감의 출발점이라는 메시지를 전합니다.',
    speakerBio:
      'Brené Brown은 휴스턴 대학교 사회복지학 교수이자 베스트셀러 작가로, 취약성, 용기, 수치심에 관한 연구로 전 세계 독자와 청중에게 영감을 주고 있습니다.',
  },
  {
    id: 'do-schools-kill-creativity',
    title: 'Do schools kill creativity?',
    speaker: 'Sir Ken Robinson',
    topic: '교육에서 창의력을 살리는 방법',
    youtubeId: 'iG9CE55wbtY',
    durationSeconds: 1164,
    publishedAt: '2006-02-01',
    tags: ['교육', '창의성', '혁신'],
    shortDescription:
      '표준화된 교육이 창의성을 억누르는 문제를 지적하고 새로운 학습 환경을 제안합니다.',
    speakerBio:
      'Sir Ken Robinson은 영국의 교육자이자 정책 자문가로, 창의성과 혁신적인 교육 개혁을 촉진하기 위한 활동으로 국제적인 명성을 얻었습니다.',
  },
  {
    id: 'your-body-language-shapes-who-you-are',
    title: 'Your body language may shape who you are',
    speaker: 'Amy Cuddy',
    topic: '몸의 자세가 자신감과 인식에 미치는 영향',
    youtubeId: 'Ks-_Mh1QhMc',
    durationSeconds: 1266,
    publishedAt: '2012-06-01',
    tags: ['자신감', '비언어', '심리학'],
    shortDescription:
      '몸짓 언어가 생각보다 큰 힘을 가지고 있으며 자세를 바꾸는 것만으로도 자신감을 높일 수 있다고 이야기합니다.',
    speakerBio:
      'Amy Cuddy는 사회심리학자로, 하버드 경영대학원에서 사람들의 비언어적 표현이 인지와 행동에 미치는 영향을 연구했습니다.',
  },
  {
    id: 'grit-the-power-of-passion-and-perseverance',
    title: 'Grit: the power of passion and perseverance',
    speaker: 'Angela Lee Duckworth',
    topic: '끈기와 열정이 성취를 이끄는 방식',
    youtubeId: 'H14bBuluwB8',
    durationSeconds: 1076,
    publishedAt: '2013-04-01',
    tags: ['교육', '동기부여', '심리학'],
    shortDescription:
      '성공의 핵심 요소로 끈기를 제시하며 학생과 조직에서 어떻게 키울 수 있는지 설명합니다.',
    speakerBio:
      'Angela Lee Duckworth는 펜실베이니아 대학교 심리학 교수이자 연구자로, 끈기(grit)와 자기조절에 관한 연구로 유명합니다.',
  },
  {
    id: 'the-happy-secret-to-better-work',
    title: 'The happy secret to better work',
    speaker: 'Shawn Achor',
    topic: '행복이 생산성을 높이는 심리적 메커니즘',
    youtubeId: 'GXy__kBVq1M',
    durationSeconds: 750,
    publishedAt: '2011-05-01',
    tags: ['행복', '직장', '심리학'],
    shortDescription:
      '행복이 성공의 결과가 아니라 원인이라는 연구를 통해 일터에서 긍정성을 키우는 전략을 제시합니다.',
    speakerBio:
      'Shawn Achor는 긍정심리학 연구자이자 작가로, 하버드 대학교에서 행복과 성공의 상관관계를 연구하며 기업과 교육기관에 강연을 제공합니다.',
  },
  {
    id: 'the-puzzle-of-motivation',
    title: 'The puzzle of motivation',
    speaker: 'Dan Pink',
    topic: '자율성과 목적의식이 동기를 높이는 원리',
    youtubeId: 'rrkrvAUbU9Y',
    durationSeconds: 1110,
    publishedAt: '2009-07-01',
    tags: ['동기부여', '비즈니스', '행동경제학'],
    shortDescription:
      '외적 보상이 아닌 자율성, 숙련, 목적이 동기를 유발하는 핵심이라는 사실을 설명합니다.',
    speakerBio:
      'Dan Pink는 베스트셀러 작가이자 전 백악관 연설문 작성자로, 동기부여와 업무 혁신에 관한 연구와 강연으로 유명합니다.',
  },
  {
    id: 'how-great-leaders-inspire-action',
    title: 'How great leaders inspire action',
    speaker: 'Simon Sinek',
    topic: '리더가 목적을 통해 행동을 이끌어내는 법',
    youtubeId: 'qp0HIF3SfI4',
    durationSeconds: 1080,
    publishedAt: '2009-09-01',
    tags: ['리더십', '커뮤니케이션', '비즈니스'],
    shortDescription:
      '왜(Why)에서 출발하는 골든 서클 개념을 통해 사람들의 행동과 충성도를 이끌어내는 방법을 설명합니다.',
    speakerBio:
      'Simon Sinek은 조직 컨설턴트이자 작가로, 목적 중심 리더십과 사람들의 신념을 깨우는 커뮤니케이션 전략을 연구합니다.',
  },
  {
    id: 'what-makes-a-good-life',
    title: 'What makes a good life? Lessons from the longest study on happiness',
    speaker: 'Robert Waldinger',
    topic: '장기 연구에서 밝혀진 행복한 삶의 조건',
    youtubeId: '8KkKuTCFvzI',
    durationSeconds: 756,
    publishedAt: '2015-11-01',
    tags: ['행복', '인간관계', '심리학'],
    shortDescription:
      '75년간의 하버드 성인발달 연구를 통해 인간관계가 행복과 건강을 좌우한다는 사실을 공유합니다.',
    speakerBio:
      'Robert Waldinger는 하버드 의과대학 정신과 교수이자 승려로, 성인 발달과 행복에 관한 세계에서 가장 긴 연구를 이끌고 있습니다.',
  },
  {
    id: 'the-danger-of-a-single-story',
    title: 'The danger of a single story',
    speaker: 'Chimamanda Ngozi Adichie',
    topic: '편견을 넘기 위한 다층적 이야기의 힘',
    youtubeId: 'D9Ihs241zeg',
    durationSeconds: 1116,
    publishedAt: '2009-07-01',
    tags: ['문화', '정체성', '스토리텔링'],
    shortDescription:
      '단일한 관점이 사람과 문화를 왜곡하는 위험을 지적하며 다양한 이야기의 중요성을 강조합니다.',
    speakerBio:
      'Chimamanda Ngozi Adichie는 나이지리아 출신 소설가로, 여성주의와 정체성을 다룬 작품으로 세계적인 찬사를 받았습니다.',
  },
  {
    id: 'ten-things-you-didnt-know-about-orgasm',
    title: "10 things you didn't know about orgasm",
    speaker: 'Mary Roach',
    topic: '과학으로 살펴보는 인간의 성과 신체 반응',
    youtubeId: 'ifEP3798ODs',
    durationSeconds: 1020,
    publishedAt: '2009-02-01',
    tags: ['과학', '생물학', '호기심'],
    shortDescription:
      '유쾌한 과학적 탐구를 통해 오해와 진실을 짚으며 인간의 몸을 더 깊이 이해하도록 돕습니다.',
    speakerBio:
      'Mary Roach는 과학 저널리스트로, 인간의 신체와 특이한 과학 실험을 흥미롭게 풀어내는 저서로 유명합니다.',
  },
  {
    id: 'how-to-speak-so-that-people-want-to-listen',
    title: 'How to speak so that people want to listen',
    speaker: 'Julian Treasure',
    topic: '목소리와 전달력을 활용한 효과적인 말하기',
    youtubeId: 'eIho2S0ZahI',
    durationSeconds: 1080,
    publishedAt: '2013-06-01',
    tags: ['커뮤니케이션', '프레젠테이션', '기술'],
    shortDescription:
      '목소리의 다섯 가지 도구와 이야기 구조를 활용해 청중의 주의를 유지하는 방법을 소개합니다.',
    speakerBio:
      'Julian Treasure는 사운드 컨설턴트로, 소리 환경이 인간 행동에 미치는 영향을 연구하며 기업과 기관에 조언을 제공합니다.',
  },
  {
    id: 'the-art-of-stillness',
    title: 'The art of stillness',
    speaker: 'Pico Iyer',
    topic: '멈춤과 고요함이 가져오는 집중과 창조성',
    youtubeId: 'byQrdnq7_H0',
    durationSeconds: 840,
    publishedAt: '2014-11-01',
    tags: ['마음챙김', '창의성', '삶'],
    shortDescription:
      '끊임없이 움직이는 세상에서 잠시 멈출 때 얻을 수 있는 통찰과 평온을 나눕니다.',
    speakerBio:
      'Pico Iyer는 여행 작가이자 사상가로, 전 세계를 다니며 경험한 이야기를 통해 내면의 고요함과 삶의 균형을 이야기합니다.',
  },
  {
    id: 'why-we-do-what-we-do',
    title: 'Why we do what we do',
    speaker: 'Tony Robbins',
    topic: '인간 행동을 움직이는 감정과 믿음',
    youtubeId: 'Cpc-t-Uwv1I',
    durationSeconds: 1380,
    publishedAt: '2006-02-01',
    tags: ['심리학', '동기부여', '행동'],
    shortDescription:
      '감정과 의미 부여가 어떻게 행동을 결정하는지 설명하며 삶을 주도하는 선택을 강조합니다.',
    speakerBio:
      'Tony Robbins는 라이프 코치이자 베스트셀러 작가로, 심리학과 신경과학 기반 전략을 활용해 개인과 조직의 성장을 돕습니다.',
  },
  {
    id: 'what-makes-us-feel-good-about-our-work',
    title: 'What makes us feel good about our work?',
    speaker: 'Dan Ariely',
    topic: '의미와 노력이 업무 만족에 미치는 영향',
    youtubeId: 'mPtHWW5n2uE',
    durationSeconds: 1180,
    publishedAt: '2012-02-01',
    tags: ['행동경제학', '직장', '동기부여'],
    shortDescription:
      '작은 인정과 노력이 일의 의미를 크게 바꾼다는 실험 결과를 공유합니다.',
    speakerBio:
      'Dan Ariely는 듀크 대학교의 행동경제학자로, 인간이 비합리적으로 보이는 선택을 왜 하는지 연구합니다.',
  },
  {
    id: 'the-power-of-introverts',
    title: 'The power of introverts',
    speaker: 'Susan Cain',
    topic: '내향적인 사람의 강점과 잠재력',
    youtubeId: 'c0KYU2j0TM4',
    durationSeconds: 1086,
    publishedAt: '2012-02-01',
    tags: ['성격', '다양성', '리더십'],
    shortDescription:
      '내향적 성향을 존중하고 조직에서 잠재력을 발휘하도록 돕는 방법을 제안합니다.',
    speakerBio:
      'Susan Cain은 변호사 출신 작가로, 조용한 리더십과 내향적 성향의 가치를 강조하는 활동을 이어가고 있습니다.',
  },
  {
    id: 'the-power-of-yet',
    title: 'The power of yet',
    speaker: 'Carol Dweck',
    topic: '성장 마인드셋으로 학습 잠재력 확장하기',
    youtubeId: 'J-swZaKN2Ic',
    durationSeconds: 900,
    publishedAt: '2014-09-01',
    tags: ['교육', '성장마인드셋', '동기부여'],
    shortDescription:
      '아직(Not Yet)이라는 사고가 실패를 성장의 과정으로 바꾸는 힘을 설명합니다.',
    speakerBio:
      'Carol Dweck은 스탠퍼드 대학교 심리학자로, 고정 마인드셋과 성장 마인드셋 개념을 제시한 연구로 유명합니다.',
  },
  {
    id: 'how-to-make-hard-choices',
    title: 'How to make hard choices',
    speaker: 'Ruth Chang',
    topic: '중요한 선택을 다루는 철학적 접근',
    youtubeId: '4D2pHZgx8F0',
    durationSeconds: 930,
    publishedAt: '2014-06-01',
    tags: ['의사결정', '철학', '자기계발'],
    shortDescription:
      '정답이 없는 선택에서 스스로의 가치를 기준으로 결정을 내리는 방법을 제시합니다.',
    speakerBio:
      'Ruth Chang은 철학자이자 법학자로, 가치와 선택의 딜레마를 연구하며 개인의 주체적 결정을 옹호합니다.',
  },
  {
    id: 'how-to-stop-screwing-yourself-over',
    title: 'How to stop screwing yourself over',
    speaker: 'Mel Robbins',
    topic: '주저함을 끊고 행동을 촉발하는 전략',
    youtubeId: 'Lp7E973zozc',
    durationSeconds: 660,
    publishedAt: '2011-09-01',
    tags: ['자기계발', '행동', '심리학'],
    shortDescription:
      '5초의 용기가 삶을 바꾸는 행동으로 이어질 수 있음을 강조합니다.',
    speakerBio:
      'Mel Robbins는 방송인 겸 변호사 출신 강연자로, 간단한 행동 트리거를 통해 자기 변화를 이끄는 방법을 소개합니다.',
  },
  {
    id: 'why-you-should-talk-to-strangers',
    title: 'Why you should talk to strangers',
    speaker: 'Kio Stark',
    topic: '낯선 사람과의 대화가 만들어내는 연결',
    youtubeId: 'W5VzvvV2R7Y',
    durationSeconds: 840,
    publishedAt: '2016-02-01',
    tags: ['커뮤니케이션', '관계', '용기'],
    shortDescription:
      '낯선 사람과의 짧은 만남이 공감과 연대감을 키우는 방법을 소개합니다.',
    speakerBio:
      'Kio Stark는 작가이자 연구자로, 도시 공간과 인간 상호작용을 탐구하며 우연한 만남의 가치를 이야기합니다.',
  },
  {
    id: 'the-beauty-of-being-a-misfit',
    title: 'The beauty of being a misfit',
    speaker: 'Lidia Yuknavitch',
    topic: '다름을 수용하고 스스로의 목소리를 찾는 과정',
    youtubeId: 'CpbKWA5G6Qk',
    durationSeconds: 900,
    publishedAt: '2016-06-01',
    tags: ['정체성', '창의성', '회복탄력성'],
    shortDescription:
      '어디에도 속하지 못한다고 느낄 때 오히려 독창적인 목소리를 찾을 수 있다는 경험을 공유합니다.',
    speakerBio:
      'Lidia Yuknavitch는 소설가이자 강연자로, 비주류 경험과 예술적 표현을 통해 치유와 연결을 이야기합니다.',
  },
  {
    id: 'the-skill-of-self-confidence',
    title: 'The skill of self confidence',
    speaker: 'Dr. Ivan Joseph',
    topic: '자신감을 훈련하고 유지하는 기술',
    youtubeId: 'w-HYZv6HzAs',
    durationSeconds: 810,
    publishedAt: '2012-11-01',
    tags: ['자신감', '교육', '코칭'],
    shortDescription:
      '자신감은 타고나는 것이 아니라 연습으로 키울 수 있는 기술임을 사례로 설명합니다.',
    speakerBio:
      'Ivan Joseph 박사는 스포츠 심리학자이자 코치로, 팀과 개인이 자신감을 구축하는 방법을 연구하고 지도합니다.',
  },
  {
    id: 'meet-yourself-a-users-guide-to-building-self-worth',
    title: "Meet yourself: a user's guide to building self worth",
    speaker: 'Niko Everett',
    topic: '자기 가치감을 인식하고 성장시키는 방법',
    youtubeId: '4weW3H_z-7w',
    durationSeconds: 720,
    publishedAt: '2013-11-01',
    tags: ['자존감', '심리학', '자기계발'],
    shortDescription:
      '내면의 목소리를 재편하고 자기 가치를 인정하는 실천 전략을 소개합니다.',
    speakerBio:
      'Niko Everett는 Girls for Change의 설립자로, 청소년과 성인이 자신감을 기르고 리더십을 발휘하도록 돕습니다.',
  },
  {
    id: 'the-art-of-being-yourself',
    title: 'The art of being yourself',
    speaker: 'Caroline McHugh',
    topic: '자신만의 정체성을 발견하고 표현하기',
    youtubeId: 'veEQQ-N9xWU',
    durationSeconds: 1080,
    publishedAt: '2013-06-01',
    tags: ['정체성', '자기계발', '리더십'],
    shortDescription:
      '남이 기대하는 모습이 아니라 진짜 자신을 표현하는 데 필요한 태도를 이야기합니다.',
    speakerBio:
      'Caroline McHugh는 아이덴티티 컨설턴트로, 기업과 개인이 고유한 브랜드와 목소리를 찾도록 돕습니다.',
  },
  {
    id: 'theres-more-to-life-than-being-happy',
    title: "There's more to life than being happy",
    speaker: 'Emily Esfahani Smith',
    topic: '행복을 넘어 의미 있는 삶을 설계하기',
    youtubeId: 'Y9zMYszm2c8',
    durationSeconds: 780,
    publishedAt: '2017-01-01',
    tags: ['의미', '행복', '철학'],
    shortDescription:
      '의미 있는 삶의 네 가지 기둥을 소개하며 행복을 새롭게 정의합니다.',
    speakerBio:
      'Emily Esfahani Smith는 작가이자 저널리스트로, 행복과 의미의 교차점을 연구하며 스토리텔링으로 전달합니다.',
  },
  {
    id: 'all-it-takes-is-10-mindful-minutes',
    title: 'All it takes is 10 mindful minutes',
    speaker: 'Andy Puddicombe',
    topic: '매일 10분의 마음챙김이 주는 효과',
    youtubeId: 'qzR62JJCMBQ',
    durationSeconds: 600,
    publishedAt: '2012-06-01',
    tags: ['명상', '웰빙', '집중력'],
    shortDescription:
      '간단한 마음챙김 훈련으로 분주한 마음을 다스리고 집중력을 되찾는 방법을 안내합니다.',
    speakerBio:
      'Andy Puddicombe는 전직 승려이자 Headspace 공동 창업자로, 명상을 대중에게 알기 쉽게 전파하고 있습니다.',
  },
  {
    id: 'the-power-of-belief-mindset-and-success',
    title: 'The power of belief — mindset and success',
    speaker: 'Eduardo Briceño',
    topic: '성공을 가르는 신념과 학습 마인드셋',
    youtubeId: 'pN34FNbOKXc',
    durationSeconds: 1005,
    publishedAt: '2012-10-01',
    tags: ['교육', '성장', '마인드셋'],
    shortDescription:
      '성장 구역과 성과 구역을 구분해 꾸준한 성장을 이끄는 전략을 제시합니다.',
    speakerBio:
      'Eduardo Briceño는 Mindset Works의 공동 창업자로, 성장 마인드셋을 학교와 기업에 확산시키는 교육가입니다.',
  },
  {
    id: 'why-some-people-find-exercise-harder-than-others',
    title: 'Why some people find exercise harder than others',
    speaker: 'Emily Balcetis',
    topic: '운동을 어렵게 느끼는 인지적 이유',
    youtubeId: 'kTT7QbxX6Hk',
    durationSeconds: 780,
    publishedAt: '2014-11-01',
    tags: ['건강', '심리학', '동기부여'],
    shortDescription:
      '지각과 목표 설정이 운동 경험을 어떻게 변화시키는지 연구 결과를 통해 설명합니다.',
    speakerBio:
      'Emily Balcetis는 뉴욕 대학교 심리학 교수로, 시각과 인지가 동기부여에 미치는 영향을 연구합니다.',
  },
  {
    id: 'the-fringe-benefits-of-failure',
    title: 'The fringe benefits of failure',
    speaker: 'J.K. Rowling',
    topic: '실패에서 배우는 회복력과 상상력',
    youtubeId: 'wHGqp8lz36c',
    durationSeconds: 1100,
    publishedAt: '2008-06-05',
    tags: ['회복탄력성', '창의성', '삶'],
    shortDescription:
      '실패와 상상력의 힘을 통해 두려움을 넘어서는 법을 졸업 축사로 전합니다.',
    speakerBio:
      'J.K. Rowling은 해리포터 시리즈의 작가로, 창의적인 이야기와 사회적 기여로 전 세계 독자의 사랑을 받고 있습니다.',
  },
  {
    id: 'the-orchestra-in-my-mouth',
    title: 'The orchestra in my mouth',
    speaker: 'Tom Thum',
    topic: '비트박스가 만드는 다채로운 사운드 세계',
    youtubeId: 'Dz6G60mAHvU',
    durationSeconds: 870,
    publishedAt: '2013-06-01',
    tags: ['음악', '창의성', '퍼포먼스'],
    shortDescription:
      '한 사람의 입으로 펼쳐지는 놀라운 소리와 리듬의 가능성을 선보입니다.',
    speakerBio:
      'Tom Thum은 호주의 비트박서이자 음악가로, 다양한 장르의 소리를 모방하고 재구성하는 공연으로 유명합니다.',
  },
  {
    id: 'teach-girls-bravery-not-perfection',
    title: 'Teach girls bravery, not perfection',
    speaker: 'Reshma Saujani',
    topic: '완벽보다 용기를 가르치는 교육',
    youtubeId: 'F4ZGxvPMHmE',
    durationSeconds: 780,
    publishedAt: '2016-02-01',
    tags: ['교육', '여성', '용기'],
    shortDescription:
      '실패를 두려워하지 않는 용기가 소녀들의 미래를 바꿀 수 있음을 강조합니다.',
    speakerBio:
      'Reshma Saujani는 Girls Who Code의 창립자로, 소녀들에게 코딩과 리더십 기회를 제공하며 성평등을 촉진합니다.',
  },
  {
    id: 'the-next-outbreak-were-not-ready',
    title: "The next outbreak? We're not ready",
    speaker: 'Bill Gates',
    topic: '전염병 대비와 글로벌 보건 체계 강화',
    youtubeId: '6Af6b_wyiwI',
    durationSeconds: 510,
    publishedAt: '2015-03-01',
    tags: ['보건', '미래', '정책'],
    shortDescription:
      '다음 전염병에 대비하기 위한 감시, 연구, 협력 체계의 필요성을 경고합니다.',
    speakerBio:
      'Bill Gates는 마이크로소프트 공동 창업자이자 자선가로, 전염병 대비와 공중보건 향상을 위해 전 세계 프로젝트를 지원합니다.',
  },
  {
    id: 'what-makes-a-hero',
    title: 'What makes a hero?',
    speaker: 'Matthew Winkler',
    topic: '영웅의 여정 구조로 삶의 변화를 이해하기',
    youtubeId: 'Hhk4N9A0oCA',
    durationSeconds: 420,
    publishedAt: '2012-09-01',
    tags: ['스토리텔링', '영웅', '내러티브'],
    shortDescription:
      '고전적인 영웅의 여정이 현대인의 성장 이야기와 어떻게 연결되는지 설명합니다.',
    speakerBio:
      'Matthew Winkler는 TED-Ed의 편집장으로, 교육용 애니메이션을 통해 복잡한 개념을 쉽게 풀어냅니다.',
  },
  {
    id: 'the-surprising-habits-of-original-thinkers',
    title: 'The surprising habits of original thinkers',
    speaker: 'Adam Grant',
    topic: '독창적인 사람들이 아이디어를 발전시키는 습관',
    youtubeId: 'fxbCHn6gE3U',
    durationSeconds: 900,
    publishedAt: '2016-02-01',
    tags: ['창의성', '조직', '심리학'],
    shortDescription:
      '미루기와 실험이 어떻게 창의적인 결과로 이어지는지 데이터를 통해 보여줍니다.',
    speakerBio:
      'Adam Grant는 와튼스쿨의 조직심리학 교수로, 기부와 협력, 창의성에 대한 연구를 수행합니다.',
  },
  {
    id: 'the-future-were-building-and-boring',
    title: "The future we're building -- and boring",
    speaker: 'Elon Musk',
    topic: '우주, 에너지, 교통의 미래 청사진',
    youtubeId: 'zIwLWfaAg-8',
    durationSeconds: 2520,
    publishedAt: '2017-04-01',
    tags: ['기술', '미래', '혁신'],
    shortDescription:
      '우주 탐사, 전기차, 지하 교통망 등 미래 인프라에 대한 비전을 공유합니다.',
    speakerBio:
      'Elon Musk는 테슬라와 스페이스X의 CEO로, 지속 가능한 에너지와 다행성 인류를 목표로 혁신을 이끕니다.',
  },
  {
    id: 'a-simple-way-to-break-a-bad-habit',
    title: 'A simple way to break a bad habit',
    speaker: 'Judson Brewer',
    topic: '나쁜 습관을 끊는 마음챙김 기반 전략',
    youtubeId: '-moW9jvvMr4',
    durationSeconds: 930,
    publishedAt: '2016-01-01',
    tags: ['습관', '마음챙김', '건강'],
    shortDescription:
      '갈망을 알아차리고 새로운 보상 루프를 만드는 훈련을 소개합니다.',
    speakerBio:
      'Judson Brewer는 정신과 의사이자 연구자로, 중독과 습관 형성에 마음챙김이 어떻게 작용하는지 연구합니다.',
  },
  {
    id: 'how-to-gain-control-of-your-free-time',
    title: 'How to gain control of your free time',
    speaker: 'Laura Vanderkam',
    topic: '시간 사용을 재구성해 우선순위에 집중하기',
    youtubeId: 'n3kNlFMXslo',
    durationSeconds: 720,
    publishedAt: '2016-11-01',
    tags: ['시간관리', '자기계발', '생산성'],
    shortDescription:
      '시간은 발견하는 것이 아니라 만들어내는 것임을 이야기하며 계획 전략을 제시합니다.',
    speakerBio:
      'Laura Vanderkam은 시간 관리 전문가이자 작가로, 바쁜 사람들의 일정 데이터를 분석하여 효율적인 사용법을 제공합니다.',
  },
  {
    id: 'what-i-learned-from-going-blind-in-space',
    title: 'What I learned from going blind in space',
    speaker: 'Chris Hadfield',
    topic: '극한 상황에서도 침착함을 유지하는 훈련',
    youtubeId: 'Zo62S0ulqhA',
    durationSeconds: 1020,
    publishedAt: '2014-04-01',
    tags: ['우주', '리더십', '회복탄력성'],
    shortDescription:
      '우주에서의 위기 경험을 바탕으로 대비 훈련과 침착함의 중요성을 이야기합니다.',
    speakerBio:
      'Chris Hadfield는 캐나다 우주비행사로, 국제우주정거장 사령관을 역임하며 우주에서의 경험을 대중과 공유하고 있습니다.',
  },
  {
    id: 'the-secrets-of-learning-a-new-language',
    title: 'The secrets of learning a new language',
    speaker: 'Lýdia Machová',
    topic: '스스로 언어를 배우는 전략과 습관',
    youtubeId: 't5zqrj-dR3w',
    durationSeconds: 900,
    publishedAt: '2019-04-01',
    tags: ['언어학습', '습관', '동기부여'],
    shortDescription:
      '즐거움과 루틴을 결합해 여러 언어를 유창하게 배우는 비결을 공유합니다.',
    speakerBio:
      'Lýdia Machová는 폴리글롯 코치로, 8개 이상의 언어를 스스로 익히며 학습 전략을 전파합니다.',
  },
  {
    id: 'how-to-stay-calm-when-you-know-youll-be-stressed',
    title: "How to stay calm when you know you'll be stressed",
    speaker: 'Daniel Levitin',
    topic: '스트레스 상황을 대비하는 사고 훈련',
    youtubeId: '8jPQjjsBbIc',
    durationSeconds: 780,
    publishedAt: '2014-09-01',
    tags: ['스트레스', '의사결정', '건강'],
    shortDescription:
      '사전 점검 목록과 계획이 스트레스 상황에서 실수를 줄이는 방법을 설명합니다.',
    speakerBio:
      'Daniel Levitin은 신경과학자이자 작가로, 음악과 뇌, 의사결정에 관한 연구로 알려져 있습니다.',
  },
  {
    id: 'the-gift-and-power-of-emotional-courage',
    title: 'The gift and power of emotional courage',
    speaker: 'Susan David',
    topic: '감정을 수용하고 가치에 맞게 행동하기',
    youtubeId: 'NDN3g6fRKqY',
    durationSeconds: 924,
    publishedAt: '2017-11-01',
    tags: ['감정지능', '마음챙김', '심리학'],
    shortDescription:
      '감정을 억누르지 않고 호기심으로 대할 때 진정성 있는 삶을 살 수 있다고 강조합니다.',
    speakerBio:
      'Susan David는 하버드 의과대학 심리학자이자 작가로, 정서 민첩성과 리더십에 관한 연구와 컨설팅을 제공합니다.',
  },
];

export const videos: VideoDetail[] = videoMetas.map(createVideo);
