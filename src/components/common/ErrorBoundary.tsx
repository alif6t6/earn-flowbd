import React from 'react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    if (!error || !error.message || error.message === 'Script error.' || error.message.includes('Script error')) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (!error || !error.message || error.message === 'Script error.' || error.message.includes('Script error')) {
      return;
    }
    console.error('Unhandled React Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('earnflow_current_user');
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 max-w-md text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Application Error</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || 'An unhandled error occurred in the application.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition-all"
              >
                Refresh Application
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-200 transition-all"
              >
                Reset & Login Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
