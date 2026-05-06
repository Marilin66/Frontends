import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Error Boundary pour capturer les erreurs runtime
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('=== REACT ERROR ===', error);
    console.error('Component stack:', info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '20px', fontFamily: 'monospace', background: '#fff0f0', minHeight: '100vh' }}>
          <h1 style={{ color: 'red' }}>Erreur React</h1>
          <pre style={{ background: '#fee', padding: '10px', borderRadius: '8px', overflow: 'auto' }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

// Ping silencieux pour réveiller le backend Render (free tier se met en veille)
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-soutenance-1et0.onrender.com/api';
fetch(`${API_URL}/token/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  .catch(() => {}); // Silencieux — juste pour réveiller le serveur

if (!rootElement) {
  document.body.innerHTML = '<h1 style="color:red;padding:20px">Erreur : #root introuvable</h1>';
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
