import { Component, ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="mx-auto my-10 max-w-xl rounded-md border border-red-500/60 bg-red-500/10 p-6 text-red-100">
          <h2 className="text-lg font-semibold">Something went wrong.</h2>
          <p className="mt-2 text-sm">{this.state.error?.message ?? 'Unknown error'}</p>
          <button
            type="button"
            className="mt-4 rounded bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
