/**
 * Aegis Landing Page - BeeAI-inspired design
 */

import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Hero Section */}
      <section style={{
        padding: '8rem 2rem 6rem',
        background: '#0f62fe',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            lineHeight: 1.3,
            letterSpacing: '-0.02em'
          }}>
            Open infrastructure for FedRAMP vulnerability management
          </h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '3rem',
            opacity: 0.9,
            maxWidth: '700px',
            margin: '0 auto 3rem',
            lineHeight: 1.6,
            fontWeight: '400'
          }}>
            Aegis makes it easy to track SBOM and vulnerability scans, generate POA&Ms, and maintain continuous compliance
            in Azure Government Cloud—built on open standards and ready for FedRAMP ATO.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/upload"
              style={{
                padding: '0.875rem 2rem',
                background: 'white',
                color: '#0f62fe',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Get started
            </Link>
            <Link
              to="/dashboard"
              style={{
                padding: '0.875rem 2rem',
                background: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.5)',
                cursor: 'pointer'
              }}
            >
              View dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features - 4 Cards */}
      <section style={{ padding: '6rem 2rem', background: '#f4f4f4' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

            {/* Feature 1 */}
            <div style={{
              padding: '2.5rem 2rem',
              background: 'white',
              borderRadius: '2px',
              borderTop: '3px solid #0f62fe'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#161616', fontWeight: '600' }}>
                Automated Evidence Ingestion
              </h3>
              <p style={{ color: '#525252', lineHeight: 1.7, fontSize: '1rem' }}>
                Upload scan results from your CI/CD pipeline in minutes. Focus on your build logic, not evidence management.
                Supports SPDX 2.3 SBOM and Grype vulnerability scans via REST and GraphQL APIs.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '2.5rem 2rem',
              background: 'white',
              borderRadius: '2px',
              borderTop: '3px solid #0f62fe'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#161616', fontWeight: '600' }}>
                Production-Ready Compliance
              </h3>
              <p style={{ color: '#525252', lineHeight: 1.7, fontSize: '1rem' }}>
                Go from scan to POA&M in seconds. Aegis handles vulnerability tracking, deadline calculation, and NIST 800-53
                mapping so you can focus on remediation. FedRAMP Moderate timelines built-in.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '2.5rem 2rem',
              background: 'white',
              borderRadius: '2px',
              borderTop: '3px solid #0f62fe'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#161616', fontWeight: '600' }}>
                Azure Government Ready
              </h3>
              <p style={{ color: '#525252', lineHeight: 1.7, fontSize: '1rem' }}>
                Deployed in FedRAMP High authorized Azure Government Cloud. Native integration with Azure Blob Storage,
                PostgreSQL, and Redis. Built for federal agencies and contractors.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              padding: '2.5rem 2rem',
              background: 'white',
              borderRadius: '2px',
              borderTop: '3px solid #0f62fe'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.rem', color: '#161616', fontWeight: '600' }}>
                Standards-Based Integration
              </h3>
              <p style={{ color: '#525252', lineHeight: 1.7, fontSize: '1rem' }}>
                Work with Syft, Grype, and any SPDX-compatible tools on a single platform. Export to OSCAL for continuous
                monitoring reporting. Enable cross-tool workflows without vendor lock-in.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section style={{ padding: '6rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '3rem',
            color: '#161616',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Getting started
          </h2>

          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#161616', fontWeight: '600' }}>
              Installation
            </h3>
            <p style={{ color: '#525252', marginBottom: '1rem', lineHeight: 1.7 }}>
              Generate SBOM and vulnerability scans in your CI/CD pipeline:
            </p>
            <pre style={{
              background: '#f4f4f4',
              color: '#161616',
              padding: '1.5rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'Monaco, Courier, monospace',
              border: '1px solid #e0e0e0'
            }}>
{`# Generate SBOM
syft image:tag -o spdx-json > sbom.json

# Scan for vulnerabilities
grype sbom:sbom.json -o json > vulnerabilities.json`}
            </pre>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#161616', fontWeight: '600' }}>
              Upload scans
            </h3>
            <p style={{ color: '#525252', marginBottom: '1rem', lineHeight: 1.7 }}>
              Upload scan results to Aegis via REST API:
            </p>
            <pre style={{
              background: '#f4f4f4',
              color: '#161616',
              padding: '1.5rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'Monaco, Courier, monospace',
              border: '1px solid #e0e0e0'
            }}>
{`curl -X POST https://aegis-api.usgovcloudapi.net/api/v1/scans/upload \\
  -H "X-Tenant-ID: your-tenant-id" \\
  -H "Content-Type: application/json" \\
  -d @payload.json`}
            </pre>
          </div>

          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#161616', fontWeight: '600' }}>
              Monitor compliance
            </h3>
            <p style={{ color: '#525252', lineHeight: 1.7 }}>
              View your compliance dashboard, track POA&M deadlines, and export reports in OSCAL format for
              FedRAMP continuous monitoring. Critical vulnerabilities automatically get 30-day remediation
              deadlines, High gets 90 days.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        background: '#f4f4f4',
        borderTop: '1px solid #e0e0e0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div>
              <p style={{ color: '#161616', fontWeight: '600', marginBottom: '0.5rem' }}>
                Aegis DevSecOps Platform
              </p>
              <p style={{ color: '#525252', fontSize: '0.875rem' }}>
                v0.1.0 • Built for Azure Government Cloud
              </p>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <Link to="/dashboard" style={{ color: '#0f62fe', textDecoration: 'none', fontSize: '0.875rem' }}>
                Dashboard
              </Link>
              <Link to="/upload" style={{ color: '#0f62fe', textDecoration: 'none', fontSize: '0.875rem' }}>
                Upload
              </Link>
              <Link to="/evidence" style={{ color: '#0f62fe', textDecoration: 'none', fontSize: '0.875rem' }}>
                Evidence
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
