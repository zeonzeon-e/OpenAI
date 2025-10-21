import { TedTalk, TedTalksResponse } from '../types';

export type FetchTalksOptions = {
  proxyUrl?: string;
  limit?: number;
};

const TED_TALKS_URL = 'https://www.ted.com/talks';

const sanitiseProxy = (url: string) => url.replace(/\/$/, '');

/**
 * Extracts Next.js page data from TED.com/talks HTML
 */
const parseNextDataFromHtml = (html: string): any => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const nextDataScript = doc.getElementById('__NEXT_DATA__');
  if (!nextDataScript?.textContent) {
    throw new Error('Could not find __NEXT_DATA__ in TED.com page');
  }

  try {
    return JSON.parse(nextDataScript.textContent);
  } catch (error) {
    throw new Error('Failed to parse __NEXT_DATA__ JSON');
  }
};

/**
 * Extracts talks array from Next.js page props
 */
const extractTalksFromPageData = (pageData: any): TedTalk[] => {
  try {
    const talks = pageData?.props?.pageProps?.talks || [];

    return talks.map((talk: any, index: number) => ({
      id: talk.id || `talk-${index}`,
      title: talk.title || 'Untitled',
      presenterDisplayName: talk.presenterDisplayName || 'Unknown',
      slug: talk.slug || '',
      canonicalUrl: talk.canonicalUrl || `https://www.ted.com/talks/${talk.slug}`,
      duration: talk.duration || 0,
      publishedAt: talk.publishedAt || new Date().toISOString(),
      viewedCount: talk.viewedCount,
      topics: talk.topics || [],
      primaryImageSet: talk.primaryImageSet,
      videoContext: talk.videoContext,
    }));
  } catch (error) {
    console.error('Error extracting talks:', error);
    return [];
  }
};

/**
 * Fetches latest TED talks from TED.com/talks
 *
 * Note: Due to CORS restrictions, a proxy URL may be required.
 * The function will attempt a direct fetch first, then fall back to proxy if provided.
 */
export const fetchLatestTedTalks = async (options: FetchTalksOptions = {}): Promise<TedTalksResponse> => {
  const { proxyUrl, limit = 20 } = options;

  let html: string;

  try {
    // Try direct fetch first (may fail due to CORS)
    const response = await fetch(TED_TALKS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch TED talks: ${response.status}`);
    }
    html = await response.text();
  } catch (directError) {
    // If direct fetch fails and proxy is available, try proxy
    if (proxyUrl) {
      const endpoint = `${sanitiseProxy(proxyUrl)}/fetch?url=${encodeURIComponent(TED_TALKS_URL)}`;
      const proxyResponse = await fetch(endpoint);
      if (!proxyResponse.ok) {
        throw new Error(`Proxy request failed with status ${proxyResponse.status}`);
      }
      html = await proxyResponse.text();
    } else {
      throw new Error(
        'Direct fetch failed due to CORS. Please provide a proxy URL or use the mock data option.'
      );
    }
  }

  const pageData = parseNextDataFromHtml(html);
  const allTalks = extractTalksFromPageData(pageData);
  const talks = allTalks.slice(0, limit);

  return {
    talks,
    hasMore: allTalks.length > limit,
    nextOffset: talks.length,
  };
};

/**
 * Returns mock TED talks for development/testing
 */
export const getMockTedTalks = (): TedTalksResponse => {
  const mockTalks: TedTalk[] = [
    {
      id: 'mock-1',
      title: 'The surprising habits of original thinkers',
      presenterDisplayName: 'Adam Grant',
      slug: 'adam_grant_the_surprising_habits_of_original_thinkers',
      canonicalUrl: 'https://www.ted.com/talks/adam_grant_the_surprising_habits_of_original_thinkers',
      duration: 900,
      publishedAt: '2024-01-15T00:00:00Z',
      viewedCount: 5000000,
      topics: [{ name: 'Psychology' }, { name: 'Creativity' }],
      videoContext: 'TED2016',
    },
    {
      id: 'mock-2',
      title: 'Do schools kill creativity?',
      presenterDisplayName: 'Sir Ken Robinson',
      slug: 'ken_robinson_says_schools_kill_creativity',
      canonicalUrl: 'https://www.ted.com/talks/ken_robinson_says_schools_kill_creativity',
      duration: 1140,
      publishedAt: '2024-01-10T00:00:00Z',
      viewedCount: 75000000,
      topics: [{ name: 'Education' }, { name: 'Creativity' }],
      videoContext: 'TED2006',
    },
    {
      id: 'mock-3',
      title: 'Your body language may shape who you are',
      presenterDisplayName: 'Amy Cuddy',
      slug: 'amy_cuddy_your_body_language_shapes_who_you_are',
      canonicalUrl: 'https://www.ted.com/talks/amy_cuddy_your_body_language_shapes_who_you_are',
      duration: 1260,
      publishedAt: '2024-01-05T00:00:00Z',
      viewedCount: 60000000,
      topics: [{ name: 'Psychology' }, { name: 'Self' }],
      videoContext: 'TEDGlobal 2012',
    },
  ];

  return {
    talks: mockTalks,
    hasMore: false,
  };
};
