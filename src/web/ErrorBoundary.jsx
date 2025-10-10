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
    if (!this.state.hasError) return this.props.children;
    const msg = String(this.state.error?.message || this.state.error || 'Unknown error');
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', color: '#fff', zIndex: 999999, padding: 16, fontFamily: 'monospace', overflow: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>App crashed</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{msg}</pre>
        <p style={{ opacity: 0.7 }}>Check the console for the full stack trace.</p>
      </div>
    );
  }
}
