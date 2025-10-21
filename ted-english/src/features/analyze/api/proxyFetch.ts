export interface FetchTranscriptOptions {
  tedUrl: string;
  proxyUrl?: string;
}

function buildRequestUrl({ tedUrl, proxyUrl }: FetchTranscriptOptions) {
  if (!proxyUrl) {
    return tedUrl;
  }
  const encoded = encodeURIComponent(tedUrl);
  return `${proxyUrl.replace(/\/$/, '')}/fetch?url=${encoded}`;
}

export async function fetchTranscriptHtml(options: FetchTranscriptOptions) {
  const requestUrl = buildRequestUrl(options);
  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`TED 페이지를 가져오지 못했습니다: ${response.status}`);
  }
  return response.text();
}

export function extractTranscriptFromHtml(html: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const script = document.querySelector('script[type="application/ld+json"]');
  if (script?.textContent) {
    try {
      const parsed = JSON.parse(script.textContent);
      if (Array.isArray(parsed?.transcript)) {
        return parsed.transcript
          .map((item: { text?: string }) => item.text)
          .filter((text: unknown): text is string => typeof text === 'string')
          .join('\n');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('ld+json 파싱 실패', error);
      }
    }
  }

  const paragraphs = Array.from(
    document.querySelectorAll('[data-testid="transcript"] p, .Grid__cell p, article p'),
  );
  if (paragraphs.length > 0) {
    return paragraphs.map((element) => element.textContent?.trim() ?? '').filter(Boolean).join('\n');
  }

  throw new Error('트랜스크립트를 찾을 수 없습니다. 붙여넣기 입력을 이용해 주세요.');
}
