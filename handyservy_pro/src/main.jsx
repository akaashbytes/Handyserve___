import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#991B1B', color: 'white', minHeight: '100vh', zIndex: 999999, fontFamily: 'monospace' }}>
          <h1>React Error Boundary caught a crash!</h1>
          <br/>
          <h2>Error Message:</h2>
          <h3>{this.state.error && this.state.error.toString()}</h3>
          <br/>
          <h2>Component Stack:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 20 }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global error handler for non-React crashes
window.addEventListener('error', (event) => {
  document.body.innerHTML = `
    <div style="padding: 20px; background: #991B1B; color: white; min-height: 100vh; font-family: monospace;">
      <h1>Global Window Error!</h1>
      <h2>Error Message:</h2>
      <h3>${event.message}</h3>
      <br/>
      <h2>Stack:</h2>
      <pre>${event.filename}:${event.lineno}:${event.colno}</pre>
      <pre>${event.error ? event.error.stack : ''}</pre>
    </div>
  `;
});

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
