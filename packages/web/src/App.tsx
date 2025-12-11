const AEGIS_VERSION = '0.1.0';

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🛡️ Aegis DevSecOps Platform</h1>
      <p>Version: {AEGIS_VERSION}</p>
      <p>FedRAMP Moderate ATO-ready | IL2/IL4/IL5 capable</p>

      <h2>Roadmap Status</h2>
      <ul>
        <li>✅ Sprint 0: Foundation & Monorepo Setup</li>
        <li>⏳ M1: Evidence Ingestion + SBOM/Scanning (Weeks 3-6)</li>
        <li>⏳ M2: Signing/Attestation + Policy Gates + POA&M (Weeks 7-11)</li>
        <li>⏳ M3: UI v2 + RBAC + Vulnerability Heatmap (Weeks 12-16)</li>
        <li>⏳ M4: Gatekeeper Enforcement (Weeks 18-22)</li>
        <li>⏳ M5: Big Bang on AKS-Gov/EKS-Gov (Weeks 23-28)</li>
        <li>⏳ M6: Production Readiness + ATO (Weeks 30-34)</li>
        <li>⏳ M7: Automated Code Hardening (Weeks 35-42)</li>
      </ul>

      <h2>Features</h2>
      <ul>
        <li>📊 SBOM Generation (Syft - SPDX 2.3)</li>
        <li>🔍 Vulnerability Scanning (Grype)</li>
        <li>✍️ Image Signing (cosign + Sigstore)</li>
        <li>🛡️ Policy Enforcement (OPA/Gatekeeper)</li>
        <li>📄 OSCAL POA&M Export</li>
        <li>🔐 Multi-tenant RBAC (Platform One Keycloak)</li>
        <li>🚀 Big Bang Integration</li>
        <li>🔧 Automated Code Remediation</li>
      </ul>

      <p style={{ marginTop: '2rem', color: '#666' }}>
        UI implementation will be completed in M3 (Weeks 12-16)
      </p>
    </div>
  );
}

export default App;
