import { AnalysisResult, VocabItem } from '../../features/analyze/core/schema';
import { AnalyzeStatus } from '../../features/analyze/store/useAnalyzeStore';

const downloadFile = (filename: string, data: string, type: string) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const vocabToCsv = (items: VocabItem[]) => {
  const headers = ['lemma', 'pos', 'senseKo', 'example', 'notes', 'frequencyHint', 'difficulty'];
  const lines = items.map((item) => {
    const example = item.examples[0]?.text ?? '';
    return [item.lemma, item.pos ?? '', item.senseKo, example, item.notes ?? '', item.frequencyHint ?? '', item.difficulty ?? ''].map(
      (value) => `"${value.replace(/"/g, '""')}"`,
    );
  });
  return [headers.join(','), ...lines.map((line) => line.join(','))].join('\n');
};

const vocabToTsv = (items: VocabItem[]) =>
  items
    .map((item) => {
      const example = item.examples[0]?.text ?? '';
      const back = `${item.senseKo} (${item.pos ?? ''})\n${example}`;
      return `${item.lemma}\t${back}`;
    })
    .join('\n');

type ToolbarProps = {
  status: AnalyzeStatus;
  progress: number;
  onAnalyze: () => Promise<void>;
  onReset: () => void;
  isAnalyzing: boolean;
  analysis?: AnalysisResult;
};

export const Toolbar = ({ status, progress, onAnalyze, onReset, isAnalyzing, analysis }: ToolbarProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3">
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <span className="font-medium text-slate-100">Status:</span>
      <span>{status}</span>
      {isAnalyzing && (
        <span aria-live="polite" className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-orange-200">
          {Math.round(progress * 100)}%
        </span>
      )}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onAnalyze()}
        disabled={isAnalyzing}
        className="rounded bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAnalyzing ? 'Analyzing…' : '분석 시작'}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
      >
        초기화
      </button>
      {analysis && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            onClick={() => downloadFile('analysis.json', JSON.stringify(analysis, null, 2), 'application/json')}
          >
            JSON
          </button>
          <button
            type="button"
            className="rounded border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            onClick={() => downloadFile('vocabulary.csv', vocabToCsv(analysis.vocabulary), 'text/csv')}
          >
            CSV
          </button>
          <button
            type="button"
            className="rounded border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            onClick={() => downloadFile('anki.tsv', vocabToTsv(analysis.vocabulary), 'text/tab-separated-values')}
          >
            Anki TSV
          </button>
        </div>
      )}
    </div>
  </div>
);
