import type { PropsWithChildren } from 'react';

import { Github } from 'lucide-react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">TED English Studio</h1>
            <p className="text-sm text-slate-400">
              프론트엔드만으로 TED 강연을 분석하고 학습자료를 생성합니다.
            </p>
          </div>
          <a
            href="https://www.ted.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          >
            <Github className="h-4 w-4" aria-hidden />
            프로젝트 소개
          </a>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-6 py-8" aria-live="polite">
        {children}
      </main>
      <footer className="border-t border-slate-800 bg-slate-900/80 py-6 text-center text-xs text-slate-500">
        본 데모는 교육용으로 제작되었으며 TED 및 YouTube와 제휴하지 않았습니다.
      </footer>
    </div>
  );
}
