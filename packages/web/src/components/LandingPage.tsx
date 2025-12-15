/**
 * Aegis Landing Page - Modern marketing-style homepage
 */

import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛡️</div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Aegis DevSecOps Platform
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '1rem', opacity: 0.95, maxWidth: '800px', margin: '0 auto 2rem' }}>
            FedRAMP ATO-Ready Vulnerability Management for Azure Government Cloud
          </p>
          <p style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.85, maxWidth: '700px', margin: '0 auto 3rem' }}>
            Continuous compliance monitoring, automated POA&M generation, and real-time vulnerability tracking
            aligned with NIST 800-53 Rev 5 controls
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/upload"
              style={{
                padding: '1rem 2.5rem',
                background: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              📤 Upload Scan Results
            </Link>
            <Link
              to="/dashboard"
              style={{
                padding: '1rem 2.5rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                border: '2px solid white',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            >
              🏠 View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}>
            Key Features
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Feature 1 */}
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#f7fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>Evidence Ingestion</h3>
              <p style={{ color: '#718096', lineHeight: 1.6 }}>
                Automated ingestion of SBOM (SPDX 2.3) and vulnerability scans (Grype) from your CI/CD pipeline.
                Supports both REST and GraphQL APIs.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#f7fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>Vulnerability Tracking</h3>
              <p style={{ color: '#718096', lineHeight: 1.6 }}>
                Real-time tracking of CVEs with severity scoring (CVSS), affected packages, and remediation guidance.
                Automatic POA&M generation for Critical/High findings.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#f7fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>POA&M Automation</h3>
              <p style={{ color: '#718096', lineHeight: 1.6 }}>
                Automated Plan of Action & Milestones generation aligned with FedRAMP timelines:
                30 days for Critical, 90 days for High vulnerabilities.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#f7fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☁️</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>Azure Gov Cloud</h3>
              <p style={{ color: '#718096', lineHeight: 1.6 }}>
                Native support for Azure Government Cloud with secure blob storage, managed PostgreSQL,
                and Redis cache. FedRAMP Moderate ready.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#f7fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>Policy Enforcement</h3>
              <p style={{ color: '#718096', lineHeight: 1.6 }}>
                Open Policy Agent (OPA) integration for custom security policies. Enforce vulnerability thresholds,
                license compliance, and supply chain security.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#f7fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>Compliance Dashboard</h3>
              <p style={{ color: '#718096', lineHeight: 1.6 }}>
                Real-time visibility into compliance posture with NIST 800-53 Rev 5 controls mapping.
                Export reports in OSCAL format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '5rem 2rem', background: '#f7fafc' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}>
                1
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2d3748' }}>Generate SBOM & Scan</h3>
                <p style={{ color: '#718096', lineHeight: 1.6 }}>
                  In your CI/CD pipeline, generate an SBOM using Syft and scan for vulnerabilities using Grype:
                </p>
                <pre style={{
                  background: '#2d3748',
                  color: '#68d391',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1rem',
                  overflow: 'auto',
                  fontSize: '0.9rem',
                }}>
{`syft image:tag -o spdx-json > sbom.json
grype sbom:sbom.json -o json > vulnerabilities.json`}
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2d3748' }}>Upload to Aegis</h3>
                <p style={{ color: '#718096', lineHeight: 1.6 }}>
                  Upload scan results to Aegis via REST API or GraphQL. Evidence is securely stored in Azure Blob Storage:
                </p>
                <pre style={{
                  background: '#2d3748',
                  color: '#68d391',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1rem',
                  overflow: 'auto',
                  fontSize: '0.9rem',
                }}>
{`curl -X POST https://aegis-api.usgovcloudapi.net/api/v1/scans/upload \\
  -H "X-Tenant-ID: your-tenant-id" \\
  -F "sbom=@sbom.json" \\
  -F "vulnerabilities=@vulnerabilities.json"`}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}>
                3
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2d3748' }}>Automated Analysis</h3>
                <p style={{ color: '#718096', lineHeight: 1.6 }}>
                  Aegis automatically:
                </p>
                <ul style={{ color: '#718096', lineHeight: 1.8, marginTop: '0.5rem' }}>
                  <li>Indexes all vulnerabilities with CVE details and CVSS scores</li>
                  <li>Maps packages to vulnerabilities with fix versions</li>
                  <li>Generates POA&M items for Critical (30-day deadline) and High (90-day deadline) findings</li>
                  <li>Evaluates custom security policies using OPA</li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}>
                4
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2d3748' }}>Monitor & Report</h3>
                <p style={{ color: '#718096', lineHeight: 1.6 }}>
                  View real-time compliance dashboards, track remediation progress, and export POA&M reports
                  in formats required for FedRAMP continuous monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#2d3748' }}>
            Built for FedRAMP Compliance
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#718096', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
            Aegis is designed to help federal agencies and contractors achieve and maintain FedRAMP Moderate authorization
            through continuous vulnerability management and automated compliance reporting.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            <div style={{ padding: '2rem', background: '#f7fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
              <h3 style={{ fontSize: '1.2rem', color: '#2d3748', marginBottom: '0.5rem' }}>NIST 800-53 Rev 5</h3>
              <p style={{ color: '#718096', fontSize: '0.9rem' }}>Aligned with RA-5, SI-2, and CM-8 controls</p>
            </div>
            <div style={{ padding: '2rem', background: '#f7fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏱️</div>
              <h3 style={{ fontSize: '1.2rem', color: '#2d3748', marginBottom: '0.5rem' }}>POA&M Timelines</h3>
              <p style={{ color: '#718096', fontSize: '0.9rem' }}>Automatic 30/90 day deadlines per FedRAMP requirements</p>
            </div>
            <div style={{ padding: '2rem', background: '#f7fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>☁️</div>
              <h3 style={{ fontSize: '1.2rem', color: '#2d3748', marginBottom: '0.5rem' }}>Azure Gov Cloud</h3>
              <p style={{ color: '#718096', fontSize: '0.9rem' }}>Deployed in FedRAMP High authorized environment</p>
            </div>
            <div style={{ padding: '2rem', background: '#f7fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
              <h3 style={{ fontSize: '1.2rem', color: '#2d3748', marginBottom: '0.5rem' }}>OSCAL Export</h3>
              <p style={{ color: '#718096', fontSize: '0.9rem' }}>Generate reports in NIST OSCAL format</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Start tracking vulnerabilities and maintaining continuous compliance today.
          </p>
          <Link
            to="/upload"
            style={{
              display: 'inline-block',
              padding: '1rem 3rem',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Upload Your First Scan 🚀
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', background: '#2d3748', color: 'white', textAlign: 'center' }}>
        <p style={{ opacity: 0.8, marginBottom: '0.5rem' }}>
          Aegis DevSecOps Platform v0.1.0
        </p>
        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
          Built for Azure Government Cloud | FedRAMP Moderate Ready
        </p>
      </footer>
    </div>
  );
}
