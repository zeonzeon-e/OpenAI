import { VideoDetail } from '../types/video';

const buildTedSource = (slug: string) => ({
  type: 'ted' as const,
  id: slug,
  embedUrl: `https://embed.ted.com/talks/${slug}`,
  watchUrl: `https://www.ted.com/talks/${slug}`,
  providerName: 'TED',
});

export const videos: VideoDetail[] = [
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

export const videosById = videos.reduce<Record<string, VideoDetail>>((accumulator, video) => {
  accumulator[video.id] = video;
  return accumulator;
}, {});
