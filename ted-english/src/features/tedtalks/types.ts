export type TedTalkTopic = {
  name: string;
};

export type TedTalkImageSet = {
  url: string;
};

export type TedTalk = {
  id: string;
  title: string;
  presenterDisplayName: string;
  slug: string;
  canonicalUrl: string;
  duration: number;
  publishedAt: string;
  viewedCount?: number;
  topics: TedTalkTopic[];
  primaryImageSet?: TedTalkImageSet[];
  videoContext?: string;
};

export type TedTalksResponse = {
  talks: TedTalk[];
  hasMore: boolean;
  nextOffset?: number;
};
