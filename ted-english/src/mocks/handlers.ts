import { http, HttpResponse } from 'msw';

const mockAnalysis = {
  summary: {
    short: 'Ideas worth spreading about creativity and resilience.',
    medium:
      'The speaker shares a personal journey through setbacks, highlighting how curiosity and community transformed fear into opportunity. Key anecdotes illustrate practical strategies for practicing English listening and note-taking.',
    long:
      'Beginning with a formative childhood memory, the talk explores how embracing questions can unlock resilience. The speaker dissects moments of failure, reframing them as experiments. Along the way, they recommend concrete language exercises—shadowing, journaling, and peer discussion—to reinforce new vocabulary and complex sentence patterns. The narrative closes by inviting learners to map their own challenges and celebrate incremental progress.',
    keyMessages: [
      { text: '호기심은 두려움을 대체할 수 있다.', ref: { index: 2 } },
      { text: '실패를 실험으로 바라보는 관점의 전환.', ref: { index: 6 } },
      { text: '학습 공동체가 언어 습득을 가속한다.', ref: { index: 10 } },
    ],
  },
  grammar: [
    {
      id: 'conditional-type2',
      name: '가정법 과거 (Conditional Type 2)',
      rule: '현재 사실과 반대되는 상상을 표현할 때 if + 과거, would/could + 동사원형을 사용한다.',
      difficulty: 'B1',
      related: ['if-clause', 'modal would'],
      examples: [
        { text: 'If I had more time, I would volunteer every weekend.', ref: { index: 8 } },
        { text: 'She said she would try again if the audience encouraged her.', ref: { index: 11 } },
      ],
    },
    {
      id: 'modal-should',
      name: '조동사 should를 이용한 조언',
      rule: 'should + 동사원형은 조언이나 권고를 전달할 때 사용한다.',
      difficulty: 'A2',
      examples: [
        { text: 'You should ask the next question out loud.', ref: { index: 4 } },
      ],
    },
  ],
  vocabulary: [
    {
      id: 'resilience',
      lemma: 'resilience',
      pos: 'noun',
      senseKo: '회복력, 다시 일어서는 힘',
      frequencyHint: 'mid',
      difficulty: 'B2',
      notes: 'STEM 분야에서도 자주 쓰이며 mental resilience와 pairing.',
      examples: [
        { text: 'Resilience is a muscle you build every time you show up after failing.', ref: { index: 7 } },
      ],
    },
    {
      id: 'curiosity',
      lemma: 'curiosity',
      pos: 'noun',
      senseKo: '호기심',
      frequencyHint: 'high',
      difficulty: 'A2',
      examples: [
        { text: 'Curiosity pushed me to watch TED talks without subtitles.', ref: { index: 1 } },
      ],
    },
  ],
};

export const handlers = [
  http.post('/mock/llm', async () => {
    return HttpResponse.json(mockAnalysis);
  }),
];
