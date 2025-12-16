/**
 * Main App Component with Routing
 */

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { PolicyManagement } from './components/PolicyManagement';
import { UploadForm } from './components/UploadForm';

const AEGIS_VERSION = '0.1.0';

function Navigation() {
  const location = useLocation();

  // Don't show navigation on landing page
  if (location.pathname === '/') {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string) => ({
    padding: '0.75rem 1.5rem',
    textDecoration: 'none',
    color: isActive(path) ? '#007bff' : '#495057',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    borderBottom: isActive(path)
      ? '3px solid #007bff'
      : '3px solid transparent',
    display: 'inline-block',
  });

  return (
    <nav
      style={{
        background: 'white',
        borderBottom: '1px solid #dee2e6',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link
          to="/"
          style={{
            padding: '1rem 0',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            textDecoration: 'none',
            color: '#495057',
          }}
        >
          🛡️ Aegis{' '}
          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
            v{AEGIS_VERSION}
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <Link to="/dashboard" style={linkStyle('/dashboard')}>
            🏠 Dashboard
          </Link>
          <Link to="/upload" style={linkStyle('/upload')}>
            📤 Upload Scan
          </Link>
          <Link to="/evidence" style={linkStyle('/evidence')}>
            📋 Evidence List
          </Link>
        </div>
        <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
          Azure Gov Ready
        </div>
      </div>
    </nav>
  );
}

function EvidenceListPlaceholder() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>📋 Evidence List</h1>
      <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
        Evidence listing feature coming in Week 6
      </p>
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem',
          background: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        <h3>🚧 Under Development</h3>
        <p>
          This page will display a paginated list of all uploaded SBOM and
          vulnerability scan evidence with:
        </p>
        <ul style={{ textAlign: 'left', color: '#6c757d' }}>
          <li>Project filtering</li>
          <li>Date range selection</li>
          <li>Severity-based sorting</li>
          <li>Export to CSV/OSCAL</li>
          <li>Real-time updates via GraphQL subscriptions</li>
        </ul>
        <p style={{ marginTop: '1.5rem' }}>
          <strong>For now, use the Upload page to submit scan results.</strong>
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadForm />} />
        <Route path="/policies" element={<PolicyManagement />} />
        <Route path="/evidence" element={<EvidenceListPlaceholder />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
