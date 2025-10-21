import { PropsWithChildren } from 'react';

export const RootLayout = ({ children }: PropsWithChildren) => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
      Skip to content
    </a>
    <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">TED English Companion</h1>
          <p className="text-sm text-slate-400">Front-end only demo for transcript-driven analysis</p>
        </div>
        <nav aria-label="Primary navigation">
          <a
            href="https://www.ted.com/"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            TED.com
          </a>
        </nav>
      </div>
    </header>
    <main id="main" className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
      {children}
    </main>
    <footer className="border-t border-slate-800 bg-slate-900/70">
      <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500">
        This prototype runs entirely in the browser. Use with sample data for safest experience.
      </div>
    </footer>
  </div>
);
