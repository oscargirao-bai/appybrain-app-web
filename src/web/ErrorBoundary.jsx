import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[boot] ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#1a1a1a',
            color: '#fff',
            padding: '20px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '14px',
            zIndex: 999999,
          }}
        >
          <h1 style={{ color: '#ff4444', marginBottom: '20px' }}>⚠️ Application Error</h1>
          <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <strong>Error:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', margin: '10px 0', color: '#ff6666' }}>
              {this.state.error ? this.state.error.toString() : 'Unknown error'}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#4444ff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
