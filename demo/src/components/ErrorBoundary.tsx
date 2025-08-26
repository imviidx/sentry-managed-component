import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '1rem',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            backgroundColor: '#f8d7da',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ color: '#721c24', marginTop: 0 }}>
            Something went wrong
          </h3>
          <details>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
              Click to view error details
            </summary>
            <pre
              style={{
                fontSize: '0.8rem',
                backgroundColor: '#fff',
                padding: '0.5rem',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            onClick={() =>
              this.setState({
                hasError: false,
                error: undefined,
                errorInfo: undefined,
              })
            }
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
