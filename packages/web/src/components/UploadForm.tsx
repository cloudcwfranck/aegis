/**
 * Upload Form Component
 */

import { useState } from 'react';

import { PolicyEvaluationResults } from './PolicyEvaluationResults';
import { apiClient, UploadScanResponse, PolicyEvaluationResponse } from '../api/client';

export function UploadForm() {
  const [projectName, setProjectName] = useState('');
  const [buildId, setBuildId] = useState('');
  const [imageDigest, setImageDigest] = useState('');
  const [sbomFile, setSbomFile] = useState<File | null>(null);
  const [vulnFile, setVulnFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [policyResults, setPolicyResults] = useState<PolicyEvaluationResponse | null>(null);
  const [evaluatingPolicies, setEvaluatingPolicies] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setPolicyResults(null);

    try {
      if (!sbomFile || !vulnFile) {
        throw new Error('Please select both SBOM and vulnerability scan files');
      }

      const sbomText = await sbomFile.text();
      const vulnText = await vulnFile.text();

      const sbom = JSON.parse(sbomText);
      const vulnerabilities = JSON.parse(vulnText);

      const response = await apiClient.uploadScan({
        projectName,
        buildId,
        imageDigest,
        sbom,
        vulnerabilities,
      });

      setResult(response);

      // Automatically evaluate policies after successful upload
      if (response.success && response.evidenceId) {
        setEvaluatingPolicies(true);
        try {
          const policyResponse = await apiClient.evaluatePolicies(response.evidenceId);
          setPolicyResults(policyResponse);
        } catch (policyError) {
          console.error('Policy evaluation failed:', policyError);
          // Don't show error to user - policy evaluation is optional
        } finally {
          setEvaluatingPolicies(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    setProjectName('sample-app');
    setBuildId('build-' + Date.now());
    setImageDigest('sha256:' + '0'.repeat(64));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📤 Upload Scan Results</h1>
      <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
        Upload SBOM (SPDX 2.3) and Grype vulnerability scan results for evidence
        management
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="projectName"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Project Name *
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            placeholder="e.g., my-application"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="buildId"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Build ID *
          </label>
          <input
            id="buildId"
            type="text"
            value={buildId}
            onChange={(e) => setBuildId(e.target.value)}
            required
            placeholder="e.g., build-123 or commit SHA"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="imageDigest"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Image Digest *
          </label>
          <input
            id="imageDigest"
            type="text"
            value={imageDigest}
            onChange={(e) => setImageDigest(e.target.value)}
            required
            placeholder="sha256:..."
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="sbomFile"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            SBOM File (SPDX JSON) *
          </label>
          <input
            id="sbomFile"
            type="file"
            accept=".json"
            onChange={(e) => setSbomFile(e.target.files?.[0] || null)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="vulnFile"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            Vulnerability Scan (Grype JSON) *
          </label>
          <input
            id="vulnFile"
            type="file"
            accept=".json"
            onChange={(e) => setVulnFile(e.target.files?.[0] || null)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              background: loading ? '#6c757d' : '#007bff',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Uploading...' : '📤 Upload Scan'}
          </button>

          <button
            type="button"
            onClick={loadSampleData}
            style={{
              background: '#6c757d',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Load Sample
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #f5c6cb',
            marginTop: '1rem',
          }}
        >
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            background: '#d4edda',
            color: '#155724',
            padding: '1.5rem',
            borderRadius: '4px',
            border: '1px solid #c3e6cb',
            marginTop: '1rem',
          }}
        >
          <h3 style={{ marginTop: 0 }}>✅ Upload Successful!</h3>
          <p>
            <strong>Evidence ID:</strong> <code>{result.evidenceId}</code>
          </p>
          {result.summary && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'white',
                borderRadius: '4px',
              }}
            >
              <h4 style={{ marginTop: 0 }}>Summary Statistics:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>📦 Packages: {result.summary.packageCount}</div>
                <div>🔍 Vulnerabilities: {result.summary.vulnerabilityCount}</div>
                <div style={{ color: '#dc3545' }}>
                  🔴 Critical: {result.summary.criticalCount}
                </div>
                <div style={{ color: '#fd7e14' }}>
                  🟠 High: {result.summary.highCount}
                </div>
                <div style={{ color: '#ffc107' }}>
                  🟡 Medium: {result.summary.mediumCount}
                </div>
                <div style={{ color: '#28a745' }}>
                  🟢 Low: {result.summary.lowCount}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {evaluatingPolicies && (
        <div
          style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #ffc107',
            marginTop: '1rem',
          }}
        >
          <strong>⏳ Evaluating Policies...</strong>
        </div>
      )}

      {policyResults && (
        <PolicyEvaluationResults results={policyResults} />
      )}

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#e7f3ff',
          borderRadius: '4px',
          border: '1px solid #b3d9ff',
        }}
      >
        <h4 style={{ marginTop: 0 }}>💡 Quick Start</h4>
        <p>
          <strong>Generate SBOM with Syft:</strong>
        </p>
        <code
          style={{
            display: 'block',
            background: '#f8f9fa',
            padding: '0.5rem',
            borderRadius: '4px',
            marginBottom: '0.5rem',
          }}
        >
          syft image:tag -o spdx-json &gt; sbom.json
        </code>
        <p>
          <strong>Scan with Grype:</strong>
        </p>
        <code
          style={{
            display: 'block',
            background: '#f8f9fa',
            padding: '0.5rem',
            borderRadius: '4px',
          }}
        >
          grype image:tag -o json &gt; vulnerabilities.json
        </code>
      </div>
    </div>
  );
}
