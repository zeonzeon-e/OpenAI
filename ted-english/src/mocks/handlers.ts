import { http, HttpResponse } from 'msw';

const sampleHtml = `
<html>
  <body>
    <div data-testid="paragraph" data-time="00:00">Today I want to share a story about resilience.</div>
    <div data-testid="paragraph" data-time="00:08">When I first stepped onto the TED stage, I was terrified.</div>
    <div data-testid="paragraph" data-time="00:17">But fear can become a compass if we listen to it carefully.</div>
  </body>
</html>`;

const mockAnalysisResponse = {
  summary: {
    short: '연사는 두려움을 극복하고 회복력을 강조합니다.',
    medium: '연사는 TED 무대 경험을 통해 두려움이 나침반이 될 수 있다고 설명하며, 상호 지지의 힘을 강조합니다.',
    long: '연사는 처음 무대에 섰을 때 느꼈던 두려움을 솔직하게 털어놓고, 두려움을 성장의 신호로 읽어야 한다고 제안합니다. 또한 서로 돕고 작은 위험을 감수할 때 공동체가 더 강해진다는 메시지를 전합니다.',
    keyMessages: [
      { text: '두려움은 방향을 알려주는 신호가 될 수 있다.', ref: { timestamp: '00:17' } },
      { text: '서로 지지할 때 용기가 배가된다.', ref: { timestamp: '00:27' } },
    ],
  },
  grammar: [
    {
      id: 'grammar-1',
      name: 'Conditional Type 2',
      rule: 'if + past, would/could + base verb (가정법 과거)',
      examples: [
        {
          text: 'If I were you, I would say yes to small risks.',
          ref: { timestamp: '00:39' },
        },
      ],
      related: ['modal would'],
      difficulty: 'B2',
    },
  ],
  vocabulary: [
    {
      id: 'vocab-1',
      lemma: 'resilience',
      pos: 'noun',
      senseKo: '회복력, 탄성',
      examples: [
        {
          text: 'Resilience grows when we face our fears together.',
          ref: { timestamp: '00:39' },
        },
      ],
      notes: '자주 TED 강연에서 등장하는 키워드',
      frequencyHint: 'mid',
      difficulty: 'B2',
    },
  ],
};

export const handlers = [
  http.get(/\/fetch/, () => HttpResponse.text(sampleHtml, { status: 200 })),
  http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
    const body = await request.json();
    const task = String(body.messages?.[1]?.content ?? '');
    let payload = {};
    if (task.includes('TASK=SUMMARY')) {
      payload = { summary: mockAnalysisResponse.summary };
    } else if (task.includes('TASK=GRAMMAR')) {
      payload = { grammar: mockAnalysisResponse.grammar };
    } else if (task.includes('TASK=VOCAB')) {
      payload = { vocabulary: mockAnalysisResponse.vocabulary };
    }

    return HttpResponse.json({
      id: 'mock-openai',
      object: 'chat.completion',
      created: Date.now() / 1000,
      model: body.model,
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: JSON.stringify(payload),
          },
        },
      ],
    });
  }),
];
