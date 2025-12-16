/**
 * Aegis Landing Page - BeeAI-inspired design
 * Clean, minimal black and white design
 */

import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        borderBottom: '1px solid #e5e5e5'
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>Aegis</div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: '#171717', textDecoration: 'none', fontSize: '0.95rem' }}>
            Documentation →
          </Link>
          <a href="#" style={{ color: '#171717', textDecoration: 'none', fontSize: '0.95rem' }}>
            GitHub →
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '8rem 3rem 6rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{
              fontSize: '4.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              lineHeight: 1.1,
              color: '#171717'
            }}>
              Aegis
            </h1>
            <h2 style={{
              fontSize: '4.5rem',
              fontWeight: '200',
              color: '#171717',
              lineHeight: 1.1
            }}>
              Ecosystem
            </h2>
          </div>
          <p style={{
            fontSize: '1.25rem',
            color: '#525252',
            marginBottom: '3rem',
            lineHeight: 1.6
          }}>
            A series of open-source tools for FedRAMP vulnerability management
          </p>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-block',
              padding: '0.875rem 1.75rem',
              background: '#171717',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              fontSize: '1rem'
            }}
          >
            Get started →
          </Link>
        </div>
      </section>

      {/* Features Section - Dark Background */}
      <section style={{
        background: '#171717',
        color: 'white',
        padding: '6rem 3rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Aegis Platform
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#a3a3a3', maxWidth: '700px', lineHeight: 1.6 }}>
              Build FedRAMP-ready vulnerability management with our lightweight
              platform that goes beyond simple scanning by providing automated POA&M
              generation and continuous compliance monitoring.
            </p>
          </div>

          {/* Flow Diagram */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            marginTop: '4rem',
            marginBottom: '5rem',
            flexWrap: 'wrap'
          }}>
            {/* Step 1: CI/CD Upload */}
            <div style={{
              border: '1px solid #404040',
              borderRadius: '4px',
              padding: '2rem 1.5rem',
              minWidth: '180px',
              textAlign: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                <path d="M20 5 L20 25 M12 17 L20 25 L28 17" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="8" y="28" width="24" height="3" fill="white"/>
              </svg>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>CI/CD Upload</div>
              <div style={{ fontSize: '0.75rem', color: '#737373' }}>
                SBOM + Scans
              </div>
            </div>

            <svg width="30" height="30" viewBox="0 0 30 30" style={{ opacity: 0.3 }}>
              <path d="M5 15 L25 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 8 L25 15 L18 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {/* Step 2: Processing Engine */}
            <div style={{
              border: '1px solid #404040',
              borderRadius: '4px',
              padding: '2rem 1.5rem',
              minWidth: '180px',
              textAlign: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="8" r="3" fill="white"/>
                <circle cx="32" cy="20" r="3" fill="white"/>
                <circle cx="20" cy="32" r="3" fill="white"/>
                <circle cx="8" cy="20" r="3" fill="white"/>
              </svg>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Processing</div>
              <div style={{ fontSize: '0.75rem', color: '#737373' }}>
                CVE Analysis
              </div>
            </div>

            <svg width="30" height="30" viewBox="0 0 30 30" style={{ opacity: 0.3 }}>
              <path d="M5 15 L25 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 8 L25 15 L18 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {/* Step 3: POA&M Generation */}
            <div style={{
              border: '1px solid #404040',
              borderRadius: '4px',
              padding: '2rem 1.5rem',
              minWidth: '180px',
              textAlign: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                <rect x="10" y="6" width="20" height="28" stroke="white" strokeWidth="2" fill="none" rx="2"/>
                <path d="M15 14 L18 17 L25 12" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="15" y1="22" x2="25" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="15" y1="27" x2="22" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>POA&M Gen</div>
              <div style={{ fontSize: '0.75rem', color: '#737373' }}>
                Auto Deadlines
              </div>
            </div>

            <svg width="30" height="30" viewBox="0 0 30 30" style={{ opacity: 0.3 }}>
              <path d="M5 15 L25 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 8 L25 15 L18 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {/* Step 4: Dashboard */}
            <div style={{
              border: '1px solid #404040',
              borderRadius: '4px',
              padding: '2rem 1.5rem',
              minWidth: '180px',
              textAlign: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                <rect x="6" y="20" width="6" height="14" fill="white"/>
                <rect x="15" y="12" width="6" height="22" fill="white"/>
                <rect x="24" y="16" width="6" height="18" fill="white"/>
                <path d="M5 10 L12 15 L20 8 L28 12 L35 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Dashboard</div>
              <div style={{ fontSize: '0.75rem', color: '#737373' }}>
                Real-time View
              </div>
            </div>
          </div>

          {/* Feature Grid - Simplified, no icons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            marginTop: '3rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Automated evidence ingestion
              </h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Upload SBOM and vulnerability scans from your CI/CD pipeline.
                Focus on remediation, not evidence management.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                POA&M timelines
              </h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Automatic 30-day deadlines for Critical and 90-day for High
                vulnerabilities per FedRAMP requirements.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                NIST 800-53 mapping
              </h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Track vulnerabilities with CVE details, CVSS scores, and control
                mappings to RA-5, SI-2, and CM-8.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Azure Government ready
              </h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Deployed in FedRAMP High authorized Azure Government Cloud with
                native Blob Storage and PostgreSQL integration.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Standards-based integration
              </h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Work with Syft, Grype, and any SPDX-compatible tools. Export
                to OSCAL for continuous monitoring reporting.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                REST and GraphQL APIs
              </h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Flexible APIs for evidence ingestion with both REST endpoints
                and GraphQL queries supporting multi-tenant isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section style={{
        padding: '6rem 3rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '1rem', color: '#171717' }}>
            Compliance Tools
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#525252', maxWidth: '700px', lineHeight: 1.6 }}>
            Deploy and monitor compliance with open infrastructure,
            free from vendor lock-in
          </p>
          <Link
            to="/upload"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#171717',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
              fontSize: '0.95rem',
              border: '1px solid #e5e5e5'
            }}
          >
            Upload scans →
          </Link>
        </div>

        {/* Feature boxes - No icons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          marginTop: '3rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#171717' }}>
              Real-time dashboard
            </h3>
            <p style={{ color: '#737373', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Generate compliance dashboards from your scan results.
              Focus on remediation, not UI frameworks.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#171717' }}>
              Production deployment
            </h3>
            <p style={{ color: '#737373', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Go from container to production-ready. We handle database,
              storage, and scaling for Azure Government Cloud.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#171717' }}>
              Multi-scanner support
            </h3>
            <p style={{ color: '#737373', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Test across Grype, Trivy, and other scanners. Compare results
              and find optimal scanning strategy.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#171717' }}>
              Framework-agnostic
            </h3>
            <p style={{ color: '#737373', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Work with any SBOM generator or scanner on a single platform.
              Enable cross-tool workflows without vendor lock-in.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e5e5e5',
        padding: '2.5rem 3rem',
        textAlign: 'center',
        color: '#737373',
        fontSize: '0.875rem'
      }}>
        <p>
          Copyright © Aegis | Part of the open-source DevSecOps community
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          Not affiliated with or endorsed by any government entity. Built for federal agencies and contractors.
        </p>
      </footer>
    </div>
  );
}
