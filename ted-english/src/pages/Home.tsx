import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAnalyzeStore } from '../features/analyze/store/useAnalyzeStore';
import { fetchTranscriptViaProxy } from '../features/analyze/api/proxyFetch';
import sampleTranscript from '../data/sampleTranscript.json';
import { TranscriptList } from '../components/Transcript/TranscriptList';
import { SummaryPanel } from '../components/Panels/SummaryPanel';
import { GrammarPanel } from '../components/Panels/GrammarPanel';
import { VocabPanel } from '../components/Panels/VocabPanel';
import { Toolbar } from '../components/Common/Toolbar';
import { useAnalyze } from '../features/analyze/hooks/useAnalyze';
import { YouTubePlayerEmbed, YouTubePlayerHandle } from '../components/Player/YouTubePlayer';
import { TranscriptSegment } from '../features/analyze/core/chunk';
import { AnalysisResult, TimeRef, analysisResultSchema } from '../features/analyze/core/schema';
import { extractYouTubeId } from '../utils/youtube';
import { TalksList } from '../components/TedTalks/TalksList';
import { TedTalk } from '../features/tedtalks/types';

const segmentsToInput = (segments: TranscriptSegment[]) =>
  JSON.stringify(
    segments.map((segment) => ({ start: segment.timestamp ?? undefined, text: segment.text })),
    null,
    2,
  );

const findSegmentByRef = (segments: TranscriptSegment[], ref?: TimeRef) => {
  if (!ref) return undefined;
  if (ref.timestamp) {
    return segments.find((segment) => segment.timestamp === ref.timestamp);
  }
  if (ref.index !== undefined) {
    return segments.find((segment) => segment.index === ref.index);
  }
  return undefined;
};

const Home = () => {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const {
    segments,
    analysis,
    config,
    status,
    progress,
    error,
    rawResponse,
    setConfig,
    setSegmentsFromInput,
    setSegments,
    setStatus,
    setError,
    setRawResponse,
    setAnalysis,
  } = useAnalyzeStore();
  const { analyze, isAnalyzing, reset } = useAnalyze();

  const [transcriptInput, setTranscriptInput] = useState('');
  const [talkUrl, setTalkUrl] = useState(config.talkUrl ?? '');
  const [proxyUrl, setProxyUrl] = useState(config.proxyUrl ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(config.youtubeUrl ?? '');
  const [llmMode, setLlmMode] = useState(config.llmMode);
  const [openAiKey, setOpenAiKey] = useState(config.openAiKey ?? '');
  const [activePanel, setActivePanel] = useState<'summary' | 'grammar' | 'vocabulary'>('summary');
  const [rawEditor, setRawEditor] = useState('');

  useEffect(() => {
    setTranscriptInput(segmentsToInput(segments));
  }, [segments]);

  useEffect(() => {
    setTalkUrl(config.talkUrl ?? '');
    setProxyUrl(config.proxyUrl ?? '');
    setYoutubeUrl(config.youtubeUrl ?? '');
    setLlmMode(config.llmMode);
    setOpenAiKey(config.openAiKey ?? '');
  }, [config]);

  useEffect(() => {
    if (rawResponse) {
      setRawEditor(rawResponse);
    }
  }, [rawResponse]);

  const handleTranscriptSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSegmentsFromInput(transcriptInput);
  };

  const handleFetchFromProxy = async () => {
    try {
      setStatus('preparing');
      const fetchedSegments = await fetchTranscriptViaProxy({ talkUrl, proxyUrl });
      setSegments(fetchedSegments);
      setTranscriptInput(segmentsToInput(fetchedSegments));
      setError(undefined);
      setStatus('idle');
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
      setStatus('error');
    }
  };

  const handleAnalyze = async () => {
    await analyze();
  };

  const handleReset = () => {
    reset();
    setTranscriptInput('');
    setRawResponse(undefined);
  };

  const handleApplyRaw = () => {
    try {
      const parsed = analysisResultSchema.parse(JSON.parse(rawEditor)) as AnalysisResult;
      setRawResponse(undefined);
      setSegmentsFromInput(transcriptInput);
      setAnalysis(parsed);
      setStatus('completed');
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : String(parseError));
    }
  };

  const handleJumpToRef = (ref?: TimeRef) => {
    const segment = findSegmentByRef(segments, ref);
    if (segment) {
      playerRef.current?.seekTo(segment);
    }
  };

  const handleJumpToSegment = (segment: TranscriptSegment) => {
    playerRef.current?.seekTo(segment);
  };

  const handleSelectTalk = (talk: TedTalk) => {
    setTalkUrl(talk.canonicalUrl);
    setConfig({ talkUrl: talk.canonicalUrl });
  };

  const youtubeId = useMemo(() => extractYouTubeId(youtubeUrl ?? ''), [youtubeUrl]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">TED Talks 브라우저</h2>
        <TalksList proxyUrl={proxyUrl} onSelectTalk={handleSelectTalk} />
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-100">Transcript 입력</h2>
        <p className="mt-1 text-sm text-slate-400">
          붙여넣기 또는 JSON 포맷(<code>{`[{"start":"00:00","text":"..."}]`}</code>)을 사용하세요. URL 스크래핑은 CORS 정책에 따라 제한될 수
          있습니다.
        </p>
        <form onSubmit={handleTranscriptSubmit} className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            붙여넣기 전사
            <textarea
              className="min-h-[12rem] rounded-md border border-slate-800 bg-slate-950/80 p-3 font-mono text-xs text-slate-100 shadow-inner focus:border-orange-500 focus:outline-none"
              value={transcriptInput}
              onChange={(event) => setTranscriptInput(event.target.value)}
              aria-label="Transcript input"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              >
                전사 적용
              </button>
              <button
                type="button"
                className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                onClick={() => setTranscriptInput(JSON.stringify(sampleTranscript, null, 2))}
              >
                샘플 불러오기
              </button>
            </div>
          </label>
          <div className="space-y-3">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              TED URL (옵션)
              <input
                type="url"
                className="rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-orange-500 focus:outline-none"
                value={talkUrl}
                onChange={(event) => {
                  const value = event.target.value;
                  setTalkUrl(value);
                  setConfig({ talkUrl: value });
                }}
                placeholder="https://www.ted.com/talks/..."
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              CORS Proxy URL (옵션)
              <input
                type="url"
                className="rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-orange-500 focus:outline-none"
                value={proxyUrl}
                onChange={(event) => {
                  const value = event.target.value;
                  setProxyUrl(value);
                  setConfig({ proxyUrl: value });
                }}
                placeholder="https://cors.example.dev"
              />
              <p className="text-xs text-slate-400">
                프록시가 없으면 붙여넣기 입력을 사용하세요. 브라우저에서 직접 HTML을 파싱하기 때문에 정책에 따라 실패할 수 있습니다.
              </p>
              <button
                type="button"
                onClick={handleFetchFromProxy}
                className="mt-2 inline-flex items-center justify-center rounded bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                disabled={!talkUrl}
              >
                프록시로 전사 가져오기
              </button>
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              YouTube URL (재생용)
              <input
                type="url"
                className="rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-orange-500 focus:outline-none"
                value={youtubeUrl}
                onChange={(event) => {
                  const value = event.target.value;
                  setYoutubeUrl(value);
                  setConfig({ youtubeUrl: value });
                }}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {youtubeId === undefined && youtubeUrl && (
                <p className="text-xs text-orange-300">YouTube URL에서 ID를 추출하지 못했습니다. 링크를 확인하세요.</p>
              )}
            </label>
            <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">LLM 모드</p>
              <div className="mt-2 flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="llmMode"
                    value="mock"
                    checked={llmMode === 'mock'}
                    onChange={() => {
                      setLlmMode('mock');
                      setConfig({ llmMode: 'mock' });
                    }}
                  />
                  Local Mock (MSW)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="llmMode"
                    value="openai"
                    checked={llmMode === 'openai'}
                    onChange={() => {
                      setLlmMode('openai');
                      setConfig({ llmMode: 'openai' });
                    }}
                  />
                  OpenAI HTTP (브라우저에서 직접 호출)
                </label>
                <label className="flex flex-col gap-1 pl-6 text-[0.7rem] text-slate-400">
                  API Key
                  <input
                    type="password"
                    className="rounded border border-slate-800 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 focus:border-orange-500 focus:outline-none"
                    value={openAiKey}
                    onChange={(event) => {
                      const value = event.target.value;
                      setOpenAiKey(value);
                      setConfig({ openAiKey: value });
                    }}
                    placeholder="sk-..."
                  />
                  <span className="text-orange-300">
                    경고: 브라우저 저장소(localStorage)에 키가 저장됩니다. 실제 서비스에서는 서버 프록시를 사용하세요.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </section>

      <Toolbar status={status} progress={progress} onAnalyze={handleAnalyze} onReset={handleReset} isAnalyzing={isAnalyzing} analysis={analysis} />

      {error && (
        <div role="alert" className="rounded-md border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <YouTubePlayerEmbed ref={playerRef} videoUrl={youtubeUrl} segments={segments} />
          <TranscriptList segments={segments} onJump={handleJumpToSegment} />
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <div role="tablist" className="flex gap-2" aria-label="Analysis panels">
            {['summary', 'grammar', 'vocabulary'].map((panel) => (
              <button
                key={panel}
                role="tab"
                type="button"
                aria-selected={activePanel === panel}
                className={`rounded px-3 py-1 text-xs font-medium transition ${
                  activePanel === panel
                    ? 'bg-orange-500 text-slate-900'
                    : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
                onClick={() => setActivePanel(panel as typeof activePanel)}
              >
                {panel === 'summary' && 'Summary'}
                {panel === 'grammar' && 'Grammar'}
                {panel === 'vocabulary' && 'Vocabulary'}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-4">
            {activePanel === 'summary' && <SummaryPanel summary={analysis?.summary} onJump={handleJumpToRef} />}
            {activePanel === 'grammar' && <GrammarPanel points={analysis?.grammar} onJump={handleJumpToRef} />}
            {activePanel === 'vocabulary' && <VocabPanel vocabulary={analysis?.vocabulary} onJump={handleJumpToRef} />}
          </div>
          {rawResponse && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold text-orange-200">LLM 응답 JSON 확인</h3>
              <textarea
                className="h-40 w-full rounded-md border border-orange-500/50 bg-slate-950/80 p-2 font-mono text-xs text-slate-100"
                value={rawEditor}
                onChange={(event) => setRawEditor(event.target.value)}
              />
              <button
                type="button"
                className="rounded bg-orange-500 px-3 py-1 text-xs font-semibold text-slate-900"
                onClick={handleApplyRaw}
              >
                JSON 적용
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
