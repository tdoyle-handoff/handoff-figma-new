import React from 'react';

type FallbackRender = (p: { error: Error; resetError: () => void }) => React.ReactElement;

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | FallbackRender;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function' && this.state.error) {
        const Fallback = this.props.fallback as (p: { error: Error; resetError: () => void }) => React.ReactElement;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }
      return (this.props.fallback as React.ReactNode) || (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground">Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}