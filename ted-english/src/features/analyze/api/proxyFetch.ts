import { parseTranscriptInput, TranscriptSegment } from '../core/chunk';

export type ProxyFetchOptions = {
  talkUrl: string;
  proxyUrl?: string;
};

const TED_SELECTOR = '[data-testid="paragraph"]';

const sanitiseProxy = (url: string) => url.replace(/\/$/, '');

const parseHtmlTranscript = (html: string): TranscriptSegment[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = Array.from(doc.querySelectorAll(TED_SELECTOR));

  if (elements.length === 0) {
    return parseTranscriptInput(html);
  }

  const items = elements
    .map((element) => {
      const timestamp = element.getAttribute('data-time') ?? undefined;
      const text = element.textContent?.trim() ?? '';
      return { start: timestamp, text };
    })
    .filter((item) => item.text.length > 0);

  return parseTranscriptInput(JSON.stringify(items));
};

export const fetchTranscriptViaProxy = async ({ talkUrl, proxyUrl }: ProxyFetchOptions): Promise<TranscriptSegment[]> => {
  if (!proxyUrl) {
    throw new Error('Proxy URL is required to fetch transcripts from TED due to CORS restrictions.');
  }

  const endpoint = `${sanitiseProxy(proxyUrl)}/fetch?url=${encodeURIComponent(talkUrl)}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Proxy request failed with status ${response.status}`);
  }
  const html = await response.text();
  return parseHtmlTranscript(html);
};
