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
  tags: string[];
  shortDescription: string;
}

export interface VideoDetail extends VideoSummary {
  youtubeId: string;
  publishedAt: string;
  learningObjectives: string[];
  transcript: TranscriptSegment[];
}
