import type { PropsWithChildren, ReactNode } from 'react';
import { Component } from 'react';

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: unknown) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error', error, info);
    }
  }

  override render() {
    const { children, fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError) {
      return (
        fallback ?? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            <p className="font-semibold">예상치 못한 오류가 발생했습니다.</p>
            {error ? <pre className="mt-2 whitespace-pre-wrap text-xs">{error.message}</pre> : null}
          </div>
        )
      );
    }

    return children;
  }
}
