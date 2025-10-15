import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 20,
          backgroundColor: '#fee',
          color: '#c00',
          fontFamily: 'monospace',
          fontSize: 14,
          maxWidth: '100%',
          overflow: 'auto'
        }}>
          <h1>❌ Erro na aplicação</h1>
          <h2>Erro:</h2>
          <pre>{this.state.error?.toString()}</pre>
          <h2>Stack:</h2>
          <pre>{this.state.error?.stack}</pre>
          <h2>Component Stack:</h2>
          <pre>{this.state.errorInfo?.componentStack}</pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
