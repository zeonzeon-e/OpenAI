import { FormEvent, useMemo, useRef, useState } from 'react';

import { ErrorBoundary } from '../components/Common/ErrorBoundary';
import { Toolbar } from '../components/Common/Toolbar';
import { YouTubePlayer, type YouTubePlayerHandle } from '../components/Player/YouTubePlayer';
import { SummaryPanel } from '../components/Panels/SummaryPanel';
import { GrammarPanel } from '../components/Panels/GrammarPanel';
import { VocabPanel } from '../components/Panels/VocabPanel';
import { TranscriptList } from '../components/Transcript/TranscriptList';
import { useAnalyze } from '../features/analyze/hooks/useAnalyze';
import { useAnalyzeStore } from '../features/analyze/store/useAnalyzeStore';
import type { AnalysisResult } from '../features/analyze/core/schema';
import type { TranscriptEntry } from '../features/analyze/core/chunk';
import { formatSeconds } from '../features/analyze/core/time';

const TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'vocabulary', label: 'Vocabulary' },
] as const;

type Tab = (typeof TABS)[number]['id'];

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function exportJson(result: AnalysisResult | undefined) {
  if (!result) {
    return;
  }
  download(JSON.stringify(result, null, 2), 'analysis.json', 'application/json');
}

function exportVocabCsv(result: AnalysisResult | undefined) {
  if (!result) {
    return;
  }
  const header = ['lemma', 'pos', 'senseKo', 'example', 'notes', 'frequencyHint', 'difficulty'];
  const rows = result.vocabulary.map((item) => {
    const example = item.examples[0]?.text ?? '';
    return [item.lemma, item.pos ?? '', item.senseKo, example, item.notes ?? '', item.frequencyHint ?? '', item.difficulty ?? ''];
  });
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  download(csv, 'vocabulary.csv', 'text/csv');
}

function exportAnkiTsv(result: AnalysisResult | undefined) {
  if (!result) {
    return;
  }
  const rows = result.vocabulary.map((item) => {
    const examples = item.examples.map((example) => example.text).join('<br/>');
    return `${item.lemma}\t${item.senseKo}\t${examples}`;
  });
  download(rows.join('\n'), 'anki.tsv', 'text/tab-separated-values');
}

function computeFallbackSeconds(entries: TranscriptEntry[], duration: number) {
  if (entries.length === 0) {
    return 5;
  }
  if (duration > 0) {
    return Math.max(2, Math.floor(duration / entries.length));
  }
  return 5;
}

export function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const transcriptInput = useAnalyzeStore((state) => state.transcriptInput);
  const setTranscriptInput = useAnalyzeStore((state) => state.setTranscriptInput);
  const urlInput = useAnalyzeStore((state) => state.urlInput);
  const setUrlInput = useAnalyzeStore((state) => state.setUrlInput);
  const proxyUrl = useAnalyzeStore((state) => state.proxyUrl);
  const setProxyUrl = useAnalyzeStore((state) => state.setProxyUrl);
  const youtubeUrl = useAnalyzeStore((state) => state.youtubeUrl);
  const setYoutubeUrl = useAnalyzeStore((state) => state.setYoutubeUrl);
  const provider = useAnalyzeStore((state) => state.provider);
  const setProvider = useAnalyzeStore((state) => state.setProvider);
  const openAIKey = useAnalyzeStore((state) => state.openAIKey);
  const setOpenAIKey = useAnalyzeStore((state) => state.setOpenAIKey);
  const entries = useAnalyzeStore((state) => state.transcriptEntries);
  const summary = useAnalyzeStore((state) => state.summary);
  const grammar = useAnalyzeStore((state) => state.grammar);
  const vocabulary = useAnalyzeStore((state) => state.vocabulary);
  const duration = useAnalyzeStore((state) => state.duration);
  const status = useAnalyzeStore((state) => state.status);
  const result = useAnalyzeStore((state) => state.result);
  const error = useAnalyzeStore((state) => state.error);
  const currentTime = useAnalyzeStore((state) => state.currentTime);
  const { analyze, isAnalyzing } = useAnalyze();
  const playerRef = useRef<YouTubePlayerHandle>(null);

  const fallbackSpan = useMemo(() => computeFallbackSeconds(entries, duration), [entries, duration]);
  const resolveIndexToSeconds = (index: number) => {
    const entry = entries[index];
    if (!entry) {
      return index * fallbackSpan;
    }
    const parts = entry.start?.split(':').map(Number);
    if (parts && !parts.some((part: number) => Number.isNaN(part))) {
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
    }
    return index * fallbackSpan;
  };

  const youtubeId = useMemo(() => {
    if (!youtubeUrl) {
      return undefined;
    }
    const match = youtubeUrl.match(/[?&]v=([^&]+)/) ?? youtubeUrl.match(/youtu\.be\/([^?]+)/);
    return match?.[1];
  }, [youtubeUrl]);

  const handleAnalyze = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await analyze();
    } catch (cause) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('분석 실패', cause);
      }
    }
  };

  const jumpTo = (seconds: number) => {
    playerRef.current?.seekTo(seconds);
    playerRef.current?.play();
  };

  return (
    <ErrorBoundary>
      <form onSubmit={handleAnalyze} className="grid gap-6 lg:grid-cols-[1fr,1.3fr]">
        <section className="space-y-4">
          <Toolbar title="입력" />
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="transcript">
                TED 트랜스크립트 붙여넣기
              </label>
              <textarea
                id="transcript"
                value={transcriptInput}
                onChange={(event) => setTranscriptInput(event.target.value)}
                className="h-48 w-full rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder='[{"start":"00:01","text":"Hello"}] 또는 자유 텍스트'
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="url">
                  TED URL
                </label>
                <input
                  id="url"
                  value={urlInput}
                  onChange={(event) => setUrlInput(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="https://www.ted.com/talks/..."
                />
                <p className="mt-1 text-xs text-slate-500">
                  CORS 정책 때문에 직접 가져올 수 없으며, 아래 프록시를 설정해야 합니다.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="proxy">
                  임시 CORS 프록시 URL (옵션)
                </label>
                <input
                  id="proxy"
                  value={proxyUrl}
                  onChange={(event) => setProxyUrl(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="https://example-proxy.com"
                />
                <p className="mt-1 text-xs text-amber-400">
                  프록시가 없다면 붙여넣기 방식을 이용하세요. 개인정보가 포함된 키를 프록시에 보내지 마세요.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="youtube">
                  YouTube 링크 또는 ID
                </label>
                <input
                  id="youtube"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="https://youtu.be/..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="openai">
                  OpenAI API Key (옵션)
                </label>
                <input
                  id="openai"
                  value={openAIKey}
                  onChange={(event) => setOpenAIKey(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="sk-..."
                />
                <p className="mt-1 text-xs text-amber-400">브라우저에 키가 저장되며, 실제 서비스에서는 추천되지 않습니다.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">LLM Provider</span>
              <button
                type="button"
                onClick={() => setProvider('mock')}
                className={`rounded-md border px-3 py-1 text-xs transition ${provider === 'mock' ? 'border-rose-500 bg-rose-500/10 text-rose-100' : 'border-slate-700 text-slate-300 hover:border-rose-400 hover:text-rose-200'}`}
              >
                Mock (권장)
              </button>
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`rounded-md border px-3 py-1 text-xs transition ${provider === 'openai' ? 'border-rose-500 bg-rose-500/10 text-rose-100' : 'border-slate-700 text-slate-300 hover:border-rose-400 hover:text-rose-200'}`}
              >
                OpenAI HTTP
              </button>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-rose-500 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-60"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '분석 중…' : '분석 시작'}
            </button>
            <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">주의 사항</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>브라우저에서 직접 LLM API를 호출하므로 사용량과 보안에 주의하세요.</li>
                <li>CORS 프록시 없이 TED URL을 입력하면 실패하며, 붙여넣기를 권장합니다.</li>
                <li>Mock 모드는 MSW를 이용해 개발용 결과를 제공합니다.</li>
              </ul>
            </div>
            {error ? (
              <p className="text-sm text-rose-300">{error}</p>
            ) : null}
          </div>
        </section>
        <section className="space-y-4">
          <Toolbar
            title="강연"
            actions={<span>현재 {formatSeconds(currentTime)} / {formatSeconds(duration)}</span>}
          />
          <YouTubePlayer ref={playerRef} videoId={youtubeId} />
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-200">Transcript</h2>
            <TranscriptList entries={entries} onJump={jumpTo} />
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-4 flex items-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md border px-3 py-1 text-xs transition ${activeTab === tab.id ? 'border-rose-500 bg-rose-500/10 text-rose-100' : 'border-slate-700 text-slate-300 hover:border-rose-400 hover:text-rose-200'}`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => exportJson(result)}
                  className="rounded border border-slate-700 px-2 py-1 text-slate-300 transition hover:border-rose-400 hover:text-rose-200"
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => exportVocabCsv(result)}
                  className="rounded border border-slate-700 px-2 py-1 text-slate-300 transition hover:border-rose-400 hover:text-rose-200"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => exportAnkiTsv(result)}
                  className="rounded border border-slate-700 px-2 py-1 text-slate-300 transition hover:border-rose-400 hover:text-rose-200"
                >
                  Anki TSV
                </button>
              </div>
            </div>
            {status === 'idle' ? (
              <p className="text-sm text-slate-400">분석 결과가 여기에 표시됩니다.</p>
            ) : null}
            {status === 'processing' ? (
              <p className="text-sm text-rose-200">LLM 응답을 기다리는 중입니다…</p>
            ) : null}
            {status === 'success' ? (
              <div>
                {activeTab === 'summary' ? (
                  <SummaryPanel
                    summary={summary}
                    onJump={jumpTo}
                    resolveIndexToSeconds={resolveIndexToSeconds}
                  />
                ) : null}
                {activeTab === 'grammar' ? (
                  <GrammarPanel
                    grammar={grammar}
                    onJump={jumpTo}
                    resolveIndexToSeconds={resolveIndexToSeconds}
                  />
                ) : null}
                {activeTab === 'vocabulary' ? (
                  <VocabPanel
                    vocabulary={vocabulary}
                    onJump={jumpTo}
                    resolveIndexToSeconds={resolveIndexToSeconds}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </form>
    </ErrorBoundary>
  );
}
