/**
 * Aegis Landing Page - BeeAI-inspired design
 * Pure black and white with IBM Plex Sans font
 */

import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        background: '#ffffff',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#000000' }}>Aegis</div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/docs/" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.95rem' }}>
            Documentation →
          </a>
          <a href="https://github.com/cloudcwfranck/aegis" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.95rem' }}>
            GitHub →
          </a>
        </div>
      </nav>

      {/* Hero Section - WHITE BACKGROUND */}
      <section style={{
        padding: '8rem 3rem 6rem',
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{
              fontSize: '4.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              lineHeight: 1.1,
              color: '#000000'
            }}>
              Aegis
            </h1>
            <h2 style={{
              fontSize: '4.5rem',
              fontWeight: '200',
              color: '#000000',
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
              background: '#000000',
              color: '#ffffff',
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

      {/* Features Section */}
      <section style={{
        background: '#000000',
        color: 'white',
        padding: '6rem 3rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '1rem', color: '#ffffff' }}>
              Aegis Platform
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#dddddd', maxWidth: '700px', lineHeight: 1.6 }}>
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
              border: '1px solid #333333',
              borderRadius: '4px',
              padding: '2rem 1.5rem',
              minWidth: '180px',
              textAlign: 'center',
              background: '#000000'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                <path d="M20 5 L20 25 M12 17 L20 25 L28 17" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="8" y="28" width="24" height="3" fill="white"/>
              </svg>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#ffffff' }}>CI/CD Upload</div>
              <div style={{ fontSize: '0.75rem', color: '#aaaaaa' }}>
                SBOM + Scans
              </div>
            </div>

            <svg width="30" height="30" viewBox="0 0 30 30" style={{ opacity: 0.3 }}>
              <path d="M5 15 L25 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 8 L25 15 L18 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {/* Step 2: Processing Engine */}
            <div style={{
              border: '1px solid #333333',
              borderRadius: '4px',
              padding: '2rem 1.5rem',
              minWidth: '180px',
              textAlign: 'center',
              background: '#000000'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="8" r="3" fill="white"/>
                <circle cx="32" cy="20" r="3" fill="white"/>
                <circle cx="20" cy="32" r="3" fill="white"/>
                <circle cx="8" cy="20" r="3" fill="white"/>
              </svg>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#ffffff' }}>Processing</div>
              <div style={{ fontSize: '0.75rem', color: '#aaaaaa' }}>
                CVE Analysis
              </div>
            </div>

            <svg width="30" height="30" viewBox="0 0 30 30" style={{ opacity: 0.3 }}>
              <path d="M5 15 L25 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 8 L25 15 L18 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {/* Step 3: POA&M Generation */}
            <div style={{
              border: '1px solid #333333',
              borderRadius: '4px',
              padding: '2rem 1.5rem',
              minWidth: '180px',
              textAlign: 'center',
              background: '#000000'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                <rect x="10" y="6" width="20" height="28" stroke="white" strokeWidth="2" fill="none" rx="2"/>
                <path d="M15 14 L18 17 L25 12" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="15" y1="22" x2="25" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="15" y1="27" x2="22" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#ffffff' }}>POA&M Gen</div>
              <div style={{ fontSize: '0.75rem', color: '#aaaaaa' }}>
                Auto Deadlines
              </div>
            </div>

            <svg width="30" height="30" viewBox="0 0 30 30" style={{ opacity: 0.3 }}>
              <path d="M5 15 L25 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 8 L25 15 L18 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            {/* Step 4: Dashboard */}
            <div style={{
              border: '1px solid #333333',
              borderRadius: '4px',
              padding: '2rem 1.5rem',
              minWidth: '180px',
              textAlign: 'center',
              background: '#000000'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                <rect x="6" y="20" width="6" height="14" fill="white"/>
                <rect x="15" y="12" width="6" height="22" fill="white"/>
                <rect x="24" y="16" width="6" height="18" fill="white"/>
                <path d="M5 10 L12 15 L20 8 L28 12 L35 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#ffffff' }}>Dashboard</div>
              <div style={{ fontSize: '0.75rem', color: '#aaaaaa' }}>
                Real-time View
              </div>
            </div>
          </div>

          {/* Feature Grid with Custom Icons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            marginTop: '3rem'
          }}>
            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ marginBottom: '1rem' }}>
                <circle cx="18" cy="18" r="16" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M18 10 L18 18 L24 24" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#ffffff' }}>
                Automated evidence ingestion
              </h3>
              <p style={{ color: '#cccccc', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Upload SBOM and vulnerability scans from your CI/CD pipeline.
                Focus on remediation, not evidence management.
              </p>
            </div>

            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ marginBottom: '1rem' }}>
                <rect x="6" y="10" width="24" height="4" fill="white"/>
                <rect x="10" y="16" width="16" height="4" fill="white"/>
                <rect x="14" y="22" width="8" height="4" fill="white"/>
              </svg>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#ffffff' }}>
                POA&M timelines
              </h3>
              <p style={{ color: '#cccccc', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Automatic 30-day deadlines for Critical and 90-day for High
                vulnerabilities per FedRAMP requirements.
              </p>
            </div>

            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ marginBottom: '1rem' }}>
                <rect x="8" y="8" width="20" height="20" stroke="white" strokeWidth="2" fill="none"/>
                <line x1="12" y1="14" x2="24" y2="14" stroke="white" strokeWidth="2"/>
                <line x1="12" y1="18" x2="24" y2="18" stroke="white" strokeWidth="2"/>
                <line x1="12" y1="22" x2="18" y2="22" stroke="white" strokeWidth="2"/>
              </svg>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#ffffff' }}>
                NIST 800-53 mapping
              </h3>
              <p style={{ color: '#cccccc', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Track vulnerabilities with CVE details, CVSS scores, and control
                mappings to RA-5, SI-2, and CM-8.
              </p>
            </div>

            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ marginBottom: '1rem' }}>
                <path d="M6 18 Q6 6 18 6 Q30 6 30 18 Q30 30 18 30 Q6 30 6 18" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="18" cy="18" r="6" fill="white"/>
              </svg>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#ffffff' }}>
                Azure Government ready
              </h3>
              <p style={{ color: '#cccccc', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Deployed in FedRAMP High authorized Azure Government Cloud with
                native Blob Storage and PostgreSQL integration.
              </p>
            </div>

            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ marginBottom: '1rem' }}>
                <circle cx="12" cy="18" r="6" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="24" cy="18" r="6" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M18 18 L24 18" stroke="white" strokeWidth="2"/>
              </svg>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#ffffff' }}>
                Standards-based integration
              </h3>
              <p style={{ color: '#cccccc', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Work with Syft, Grype, and any SPDX-compatible tools. Export
                to OSCAL for continuous monitoring reporting.
              </p>
            </div>

            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ marginBottom: '1rem' }}>
                <path d="M6 18 L12 12 L18 18 L24 12 L30 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="2" fill="white"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
                <circle cx="18" cy="18" r="2" fill="white"/>
                <circle cx="24" cy="12" r="2" fill="white"/>
                <circle cx="30" cy="18" r="2" fill="white"/>
              </svg>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#ffffff' }}>
                REST and GraphQL APIs
              </h3>
              <p style={{ color: '#cccccc', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Flexible APIs for evidence ingestion with both REST endpoints
                and GraphQL queries supporting multi-tenant isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Tools Section - WHITE BACKGROUND with Document Layout */}
      <section style={{
        padding: '6rem 3rem',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '4rem', alignItems: 'center' }}>

            {/* Left side - Content */}
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '1rem', color: '#000000' }}>
                Compliance Tools
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#525252', lineHeight: 1.6, marginBottom: '2rem' }}>
                Deploy and monitor compliance with open infrastructure,
                free from vendor lock-in
              </p>
              <Link
                to="/upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.75rem',
                  background: '#000000',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontSize: '1rem'
                }}
              >
                Learn more →
              </Link>
            </div>

            {/* Right side - Actual Vulnerability Scan Report */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '2.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontFamily: '"IBM Plex Sans", monospace'
            }}>
              {/* Report Header */}
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #000000' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#888888', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>VULNERABILITY ASSESSMENT REPORT</div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#000000', marginBottom: '0.5rem' }}>
                      Container Scan Results
                    </h3>
                    <div style={{ fontSize: '0.875rem', color: '#525252' }}>aegis-api:v0.1.0</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#888888' }}>
                    <div>Report ID: VSR-2025-1216</div>
                    <div>December 16, 2025</div>
                  </div>
                </div>
              </div>

              {/* Severity Summary */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#000000', marginBottom: '1rem' }}>SEVERITY DISTRIBUTION</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: '#FEE2E2', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#991B1B' }}>2</div>
                    <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: '600' }}>CRITICAL</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: '#FED7AA', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#9A3412' }}>5</div>
                    <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: '600' }}>HIGH</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: '#FEF3C7', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400E' }}>12</div>
                    <div style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: '600' }}>MEDIUM</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: '#F3F4F6', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#374151' }}>8</div>
                    <div style={{ fontSize: '0.75rem', color: '#374151', fontWeight: '600' }}>LOW</div>
                  </div>
                </div>
              </div>

              {/* Critical Vulnerabilities */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#000000', marginBottom: '1rem' }}>CRITICAL FINDINGS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#991B1B', fontFamily: 'monospace' }}>CVE-2024-47076</span>
                      <span style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: '600' }}>CVSS 9.8</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7C2D12', lineHeight: 1.4 }}>
                      curl: CURLOPT_PROTOCOLS bypass via redirect
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#A16207', marginTop: '0.5rem' }}>
                      POA&M Deadline: Jan 15, 2026 (30 days)
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#991B1B', fontFamily: 'monospace' }}>CVE-2024-45321</span>
                      <span style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: '600' }}>CVSS 9.1</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7C2D12', lineHeight: 1.4 }}>
                      OpenSSL: Remote code execution in TLS handshake
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#A16207', marginTop: '0.5rem' }}>
                      POA&M Deadline: Jan 15, 2026 (30 days)
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Mapping */}
              <div style={{ marginBottom: '2rem', padding: '1rem', background: '#F9FAFB', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>NIST 800-53 REV 5 CONTROLS</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.6 }}>
                  RA-5 (Vulnerability Monitoring) • SI-2 (Flaw Remediation) • CM-8 (System Component Inventory)
                </div>
              </div>

              {/* Report Footer */}
              <div style={{
                paddingTop: '1.5rem',
                borderTop: '1px solid #e0e0e0',
                fontSize: '0.7rem',
                color: '#6B7280'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '600', color: '#000000' }}>Generated by Aegis DevSecOps Platform</div>
                  <div>v0.1.0</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                  <div>Scan Tool: Grype v0.75.0 | SBOM: Syft (SPDX 2.3)</div>
                  <div>FedRAMP Moderate Compliant</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer - BLACK BACKGROUND */}
      <footer style={{
        borderTop: '1px solid #e0e0e0',
        padding: '2.5rem 3rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        background: '#000000'
      }}>
        <p style={{ color: '#ffffff', marginBottom: '0.5rem' }}>
          Copyright © Aegis | Part of the open-source DevSecOps community
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888888' }}>
          Not affiliated with or endorsed by any government entity. Built for federal agencies and contractors.
        </p>
      </footer>
    </div>
  );
}
