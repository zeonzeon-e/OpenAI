export interface TranscriptSegment {
  start: number;
  end: number;
  english: string;
  korean: string;
  grammarNotes?: string[];
  vocabulary?: VocabularyItem[];
}

export interface VocabularyItem {
  term: string;
  definition: string;
  partOfSpeech?: string;
  example?: string;
}

export interface VideoSummary {
  id: string;
  title: string;
  speaker: string;
  thumbnailUrl: string;
  duration: string;
  durationSeconds?: number;
  tags: string[];
  shortDescription: string;
  speakerSummary?: string;
}

export interface VideoSource {
  type: 'youtube' | 'ted' | 'external';
  id: string;
  embedUrl: string;
  watchUrl: string;
  providerName: string;
}

export interface VideoSource {
  type: 'youtube' | 'ted' | 'external';
  id: string;
  embedUrl: string;
  watchUrl: string;
  providerName: string;
}

export interface VideoDetail extends VideoSummary {
  source: VideoSource;
  publishedAt: string;
  learningObjectives: string[];
  transcript: TranscriptSegment[];
  speakerBio: string;
}
