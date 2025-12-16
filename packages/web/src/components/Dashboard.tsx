/**
 * Dashboard Component
 */

import { useState, useEffect } from 'react';

import { apiClient } from '../api/client';

interface HealthStatus {
  status: string;
  timestamp: string;
}

export function Dashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [tenantId, setTenantId] = useState(apiClient.getTenantId());

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const status = await apiClient.healthCheck();
        setHealth(status);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Every 30s

    return () => clearInterval(interval);
  }, []);

  const handleTenantIdChange = (newTenantId: string) => {
    setTenantId(newTenantId);
    apiClient.setTenantId(newTenantId);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '3rem 2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
          🛡️ Aegis DevSecOps Platform
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem', opacity: 0.9 }}>
          FedRAMP ATO-Ready Vulnerability Management for Azure Government Cloud
        </p>
      </div>

      {/* Tenant ID Configuration */}
      <div
        style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '2px solid #dee2e6',
        }}
      >
        <h3 style={{ marginTop: 0 }}>⚙️ Configuration</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="tenantId"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            Tenant ID:
          </label>
          <input
            id="tenantId"
            type="text"
            value={tenantId}
            onChange={(e) => handleTenantIdChange(e.target.value)}
            placeholder="Enter your tenant UUID"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
            }}
          />
          <small
            style={{ display: 'block', marginTop: '0.5rem', color: '#6c757d' }}
          >
            Used for multi-tenant isolation. Change this to test different
            tenants.
          </small>
        </div>
      </div>

      {/* System Status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: health?.status === 'ok' ? '#d4edda' : '#f8d7da',
            padding: '1.5rem',
            borderRadius: '8px',
            border: `2px solid ${health?.status === 'ok' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0' }}>API Status</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {health?.status === 'ok' ? '✅ Online' : '❌ Offline'}
          </p>
          {health && (
            <small style={{ color: '#6c757d' }}>
              Last check: {new Date(health.timestamp).toLocaleTimeString()}
            </small>
          )}
        </div>

        <div
          style={{
            background: '#d1ecf1',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '2px solid #bee5eb',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Storage</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            ☁️ Azure Blob
          </p>
          <small style={{ color: '#6c757d' }}>Azure Government Cloud</small>
        </div>

        <div
          style={{
            background: '#fff3cd',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '2px solid #ffeeba',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Compliance</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            🏛️ FedRAMP
          </p>
          <small style={{ color: '#6c757d' }}>NIST 800-53 Rev 5</small>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2>Platform Features</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
            }}
          >
            <h3>📦 SBOM Ingestion</h3>
            <p style={{ color: '#6c757d' }}>
              Upload SPDX 2.3 Software Bill of Materials with automatic
              validation and storage in Azure Blob
            </p>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              ✓ Active
            </span>
          </div>

          <div
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
            }}
          >
            <h3>🔍 Vulnerability Scanning</h3>
            <p style={{ color: '#6c757d' }}>
              Grype scan result processing with severity-based classification
              and real-time statistics
            </p>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              ✓ Active
            </span>
          </div>

          <div
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
            }}
          >
            <h3>📊 GraphQL API</h3>
            <p style={{ color: '#6c757d' }}>
              Type-safe GraphQL API with Apollo Server for programmatic access
            </p>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              ✓ Active
            </span>
          </div>

          <div
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
            }}
          >
            <h3>⚙️ BullMQ Workers</h3>
            <p style={{ color: '#6c757d' }}>
              Async processing for SBOM parsing and vulnerability indexing
            </p>
            <span style={{ color: '#ffc107', fontWeight: 'bold' }}>
              ⏳ Week 5
            </span>
          </div>

          <div
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
            }}
          >
            <h3>📋 POA&M Generation</h3>
            <p style={{ color: '#6c757d' }}>
              Automated Plan of Action & Milestones in OSCAL format
            </p>
            <span style={{ color: '#6c757d', fontWeight: 'bold' }}>⏳ M2</span>
          </div>

          <div
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
            }}
          >
            <h3>🔐 Keycloak RBAC</h3>
            <p style={{ color: '#6c757d' }}>
              Platform One Keycloak integration for role-based access control
            </p>
            <span style={{ color: '#6c757d', fontWeight: 'bold' }}>⏳ M3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
