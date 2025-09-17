// src/components/ErrorBoundary.jsx - Enhanced version with EventBus integration
import React from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { globalEventBus } from '../services/EventBus';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Emit to EventBus for application-wide error tracking
    globalEventBus.emit('error:boundary', {
      errorId,
      error: error.toString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      props: this.props.errorMetadata || {}
    });

    // Log to external service (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          component: 'ErrorBoundary',
          errorId: errorId
        },
        extra: errorInfo
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error ID:', errorId);
      console.groupEnd();
    }

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }
  }

  handleRetry = () => {
    // Emit retry event
    globalEventBus.emit('error:boundary:retry', {
      errorId: this.state.errorId,
      timestamp: Date.now()
    });

    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleReload = () => {
    // Emit reload event before reloading
    globalEventBus.emit('error:boundary:reload', {
      errorId: this.state.errorId,
      timestamp: Date.now()
    });

    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI based on props or default
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <Icon name="AlertTriangle" size={48} className="mx-auto text-red-500 mb-4" />
              
              <h2 className="text-xl font-heading-bold text-red-900 mb-2">
                Something went wrong
              </h2>
              
              <p className="text-red-700 mb-4">
                {this.props.message || 'An unexpected error occurred. Please try again.'}
              </p>

              {this.state.errorId && (
                <p className="text-xs text-red-600 mb-4 font-mono">
                  Error ID: {this.state.errorId}
                </p>
              )}

              <div className="space-y-2">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  Reload Page
                </Button>
              </div>

              {/* Development-only error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-red-800 font-medium">
                    Debug Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-900 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div className="mt-2">
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

/**
 * Hook for manually reporting errors to tracking services
 * Note: This is different from the comprehensive useErrorHandler in src/hooks/useErrorHandler.js
 * This one is specifically for manual error reporting to external services
 */
export const useErrorReporter = () => {
  return React.useCallback((error, errorInfo = {}) => {
    // Generate error ID for tracking
    const errorId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.error('Manual error report:', error, errorInfo);
    
    // Emit to EventBus
    globalEventBus.emit('error:manual', {
      errorId,
      error: error.toString(),
      message: error.message || 'Manual error report',
      stack: error.stack,
      info: errorInfo,
      timestamp: Date.now()
    });
    
    // Send to Sentry if available
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          type: 'manual',
          errorId
        },
        extra: errorInfo
      });
    }
    
    return errorId;
  }, []);
};

/**
 * Component to wrap specific sections with error boundaries
 * Useful for isolating errors to specific parts of the app
 */
export const SectionErrorBoundary = ({ children, section, fallback }) => {
  return (
    <ErrorBoundary
      message={`An error occurred in the ${section} section.`}
      errorMetadata={{ section }}
      fallback={fallback}
      onError={(error, errorInfo, errorId) => {
        // Log section-specific errors
        globalEventBus.emit('error:section', {
          section,
          errorId,
          error: error.toString(),
          timestamp: Date.now()
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Hook to listen for error boundary events
 * Useful for showing notifications or logging
 */
export const useErrorBoundaryListener = (onError) => {
  React.useEffect(() => {
    if (!onError) return;

    const unsubscribe = globalEventBus.on('error:boundary', (data) => {
      onError(data);
    });

    return unsubscribe;
  }, [onError]);
};

export default ErrorBoundary;