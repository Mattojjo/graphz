import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '24px', fontFamily: 'monospace', color: '#ef5350', background: '#131722', minHeight: '100vh' }}>
          <h2 style={{ color: '#ef5350' }}>App Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>{String(this.state.error)}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', color: '#787b86' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
