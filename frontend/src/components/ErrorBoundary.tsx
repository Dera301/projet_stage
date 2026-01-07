import React, { ErrorInfo, ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const defaultFallback = (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
    <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <span className="text-3xl">⚠️</span>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-3">
        Oups, quelque chose s'est mal passé
      </h1>
      <p className="text-gray-600 text-sm leading-relaxed">
        Une erreur inattendue est survenue. Veuillez actualiser la page ou réessayer plus tard.
        Si le problème persiste, contactez le support.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
      >
        Actualiser la page
      </button>
    </div>
    <Toaster />
  </div>
);

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('🛑 Unhandled UI error:', error, info);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? defaultFallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
