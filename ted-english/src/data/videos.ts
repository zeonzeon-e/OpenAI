import { VideoDetail } from '../types/video';

export const videos: VideoDetail[] = [
  {
    id: 'embrace-stress-kelly-mcgonigal',
    title: 'How to Make Stress Your Friend',
    speaker: 'Kelly McGonigal',
    thumbnailUrl: 'https://img.youtube.com/vi/RcGyVTAoXEU/hqdefault.jpg',
    duration: '14:28',
    tags: ['심리학', '스트레스', '건강'],
    shortDescription:
      '스트레스에 대한 관점을 바꾸면 스트레스 자체가 우리 몸에 미치는 영향을 달라지게 할 수 있다는 이야기입니다.',
    youtubeId: 'RcGyVTAoXEU',
    publishedAt: '2013-06-18',
    learningObjectives: [
      '스트레스 반응의 긍정적인 측면 이해하기',
      '사회적 연결이 건강에 미치는 영향 살펴보기',
      '스트레스 상황에서 마음가짐 전환 연습하기',
    ],
    transcript: [
      {
        start: 0,
        end: 12,
        english:
          "If you look at people's stress responses, you'll find that the people who view stress as helpful are more likely to cope well.",
        korean:
          '사람들의 스트레스 반응을 살펴보면, 스트레스를 도움이 된다고 보는 사람들이 더 잘 대처한다는 것을 알 수 있습니다.',
        grammarNotes: [
          '관계대명사 who가 people을 수식하며, view A as B 구조가 사용되었습니다.',
          'be likely to + 동사원형: ~할 가능성이 높다.',
        ],
        vocabulary: [
          {
            term: 'cope',
            definition: '힘든 일에 잘 대처하다',
            partOfSpeech: 'verb',
            example: 'She learned to cope with stress through meditation.',
          },
          {
            term: 'view A as B',
            definition: 'A를 B로 여기다',
            example: 'Many students view mistakes as opportunities to learn.',
          },
        ],
      },
      {
        start: 12,
        end: 24,
        english:
          'When you choose to view your stress response as helpful, you create the biology of courage.',
        korean: '당신이 스트레스 반응을 도움이 된다고 보기로 선택할 때, 용기의 생물학을 만들어냅니다.',
        grammarNotes: ['choose to + 동사원형: ~하기로 선택하다.', '명사구 the biology of courage에서 of가 소유를 나타냅니다.'],
        vocabulary: [
          {
            term: 'biology',
            definition: '생물학, 생물학적 특성',
            partOfSpeech: 'noun',
          },
          {
            term: 'courage',
            definition: '용기',
            partOfSpeech: 'noun',
          },
        ],
      },
    ],
  },
  {
    id: 'inside-mind-master-procrastinator',
    title: "Inside the mind of a master procrastinator",
    speaker: 'Tim Urban',
    thumbnailUrl: 'https://img.youtube.com/vi/arj7oStGLkU/hqdefault.jpg',
    duration: '14:03',
    tags: ['생산성', '심리학', '유머'],
    shortDescription: '만성 미루기의 세계를 유머러스하게 탐험하며 어떻게 벗어날 수 있는지 고민합니다.',
    youtubeId: 'arj7oStGLkU',
    publishedAt: '2016-02-23',
    learningObjectives: [
      '미루기의 심리적 메커니즘 이해하기',
      '장기 목표와 단기 쾌락 사이의 갈등 살펴보기',
      '마감 없는 프로젝트를 추진하는 전략 논의하기',
    ],
    transcript: [
      {
        start: 0,
        end: 14,
        english: 'I could see that I was a procrastinator, so I started studying procrastination.',
        korean: '저는 제가 미루는 사람이라는 걸 깨닫고, 그래서 미루기에 대해 공부하기 시작했습니다.',
        grammarNotes: ['과거진행형 I was ~ing 구조와 so로 이어지는 결과절이 사용되었습니다.'],
        vocabulary: [
          {
            term: 'procrastinator',
            definition: '미루는 사람',
            partOfSpeech: 'noun',
          },
          {
            term: 'procrastination',
            definition: '미루기, 지연',
            partOfSpeech: 'noun',
          },
        ],
      },
      {
        start: 14,
        end: 26,
        english: 'There are two kinds of procrastination, and I want to show you both today.',
        korean: '미루기에는 두 가지 종류가 있는데, 오늘 그 둘을 모두 보여드리고 싶습니다.',
        grammarNotes: ['There are ~ 구문으로 존재를 소개하며, both가 two kinds를 강조합니다.'],
        vocabulary: [
          {
            term: 'both',
            definition: '둘 다',
            partOfSpeech: 'determiner',
          },
          {
            term: 'kind',
            definition: '종류',
            partOfSpeech: 'noun',
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
