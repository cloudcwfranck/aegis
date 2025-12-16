/**
 * Policy Management Dashboard
 * List, create, edit, and delete policies
 */

import axios from 'axios';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TENANT_ID = '00000000-0000-0000-0000-000000000000'; // Default tenant

interface Policy {
  id: string;
  name: string;
  description: string;
  type: string;
  enforcementLevel: string;
  enabled: boolean;
  priority: number;
  parameters: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function PolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/v1/policies`, {
        headers: { 'x-tenant-id': TENANT_ID },
      });
      setPolicies(response.data.policies || []);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/v1/policies/${policyId}`, {
        headers: { 'x-tenant-id': TENANT_ID },
      });
      await loadPolicies();
    } catch (error) {
      console.error('Failed to delete policy:', error);
      alert('Failed to delete policy');
    }
  };

  const togglePolicy = async (policy: Policy) => {
    try {
      await axios.put(
        `${API_URL}/api/v1/policies/${policy.id}`,
        { enabled: !policy.enabled },
        { headers: { 'x-tenant-id': TENANT_ID } }
      );
      await loadPolicies();
    } catch (error) {
      console.error('Failed to toggle policy:', error);
      alert('Failed to toggle policy');
    }
  };

  const getEnforcementBadgeColor = (level: string) => {
    switch (level) {
      case 'BLOCKING':
        return '#dc3545';
      case 'WARNING':
        return '#ffc107';
      case 'ADVISORY':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const getPolicyTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading policies...</p>
      </div>
    );
  }

  if (showCreateForm || editingPolicy) {
    return (
      <PolicyForm
        policy={editingPolicy}
        onSave={async () => {
          setShowCreateForm(false);
          setEditingPolicy(null);
          await loadPolicies();
        }}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingPolicy(null);
        }}
      />
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>🛡️ Policy Management</h1>
          <p style={{ color: '#6c757d', margin: 0 }}>
            Create and manage security policies for your evidence scans
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          + Create Policy
        </button>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        >
          <div
            style={{ fontSize: '2rem', fontWeight: 'bold', color: '#495057' }}
          >
            {policies.length}
          </div>
          <div style={{ color: '#6c757d' }}>Total Policies</div>
        </div>
        <div
          style={{
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        >
          <div
            style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}
          >
            {policies.filter((p) => p.enabled).length}
          </div>
          <div style={{ color: '#6c757d' }}>Enabled</div>
        </div>
        <div
          style={{
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        >
          <div
            style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}
          >
            {policies.filter((p) => p.enforcementLevel === 'BLOCKING').length}
          </div>
          <div style={{ color: '#6c757d' }}>Blocking</div>
        </div>
        <div
          style={{
            padding: '1.5rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        >
          <div
            style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}
          >
            {policies.filter((p) => p.enforcementLevel === 'WARNING').length}
          </div>
          <div style={{ color: '#6c757d' }}>Warning</div>
        </div>
      </div>

      {/* Policy List */}
      {policies.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            background: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h3>No policies created yet</h3>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
            Create your first policy to start enforcing security standards
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Create Your First Policy
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {policies.map((policy) => (
            <div
              key={policy.id}
              style={{
                padding: '1.5rem',
                background: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                opacity: policy.enabled ? 1 : 0.6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{policy.name}</h3>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: getEnforcementBadgeColor(
                          policy.enforcementLevel
                        ),
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {policy.enforcementLevel}
                    </span>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#6c757d',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {getPolicyTypeDisplay(policy.type)}
                    </span>
                    {!policy.enabled && (
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#e9ecef',
                          color: '#6c757d',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                        }}
                      >
                        DISABLED
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#6c757d', margin: '0.5rem 0' }}>
                    {policy.description}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: '#6c757d',
                    }}
                  >
                    <span>Priority: {policy.priority}</span>
                    <span>
                      Created: {new Date(policy.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Display parameters */}
                  {Object.keys(policy.parameters).length > 0 && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Parameters:
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#495057' }}>
                        {JSON.stringify(policy.parameters, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => togglePolicy(policy)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: policy.enabled ? '#ffc107' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    {policy.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => setEditingPolicy(policy)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePolicy(policy.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Policy Form Component
function PolicyForm({
  policy,
  onSave,
  onCancel,
}: {
  policy: Policy | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: policy?.name || '',
    description: policy?.description || '',
    type: policy?.type || 'CVE_SEVERITY',
    enforcementLevel: policy?.enforcementLevel || 'WARNING',
    enabled: policy?.enabled ?? true,
    priority: policy?.priority || 100,
    parameters: policy?.parameters || {},
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (policy) {
        // Update existing policy
        await axios.put(`${API_URL}/api/v1/policies/${policy.id}`, formData, {
          headers: { 'x-tenant-id': TENANT_ID },
        });
      } else {
        // Create new policy
        await axios.post(`${API_URL}/api/v1/policies`, formData, {
          headers: { 'x-tenant-id': TENANT_ID },
        });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save policy:', error);
      alert('Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  const updateParameter = (key: string, value: unknown) => {
    setFormData({
      ...formData,
      parameters: {
        ...formData.parameters,
        [key]: value,
      },
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{policy ? 'Edit Policy' : 'Create New Policy'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            Policy Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
              }}
            >
              Policy Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="CVE_SEVERITY">CVE Severity</option>
              <option value="SBOM_COMPLETENESS">SBOM Completeness</option>
              <option value="IMAGE_PROVENANCE">Image Provenance</option>
              <option value="ALLOWED_REGISTRIES">Allowed Registries</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
              }}
            >
              Enforcement Level *
            </label>
            <select
              value={formData.enforcementLevel}
              onChange={(e) =>
                setFormData({ ...formData, enforcementLevel: e.target.value })
              }
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="ADVISORY">Advisory</option>
              <option value="WARNING">Warning</option>
              <option value="BLOCKING">Blocking</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
              }}
            >
              Priority
            </label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) })
              }
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '2rem',
              }}
            >
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) =>
                  setFormData({ ...formData, enabled: e.target.checked })
                }
                style={{
                  marginRight: '0.5rem',
                  width: '1.2rem',
                  height: '1.2rem',
                }}
              />
              <span style={{ fontWeight: 'bold' }}>Enabled</span>
            </label>
          </div>
        </div>

        {/* Policy-specific parameters */}
        {formData.type === 'CVE_SEVERITY' && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <h3>CVE Severity Thresholds</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                  Max Critical
                </label>
                <input
                  type="number"
                  value={(formData.parameters as any).maxCritical || 0}
                  onChange={(e) =>
                    updateParameter('maxCritical', parseInt(e.target.value))
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                  Max High
                </label>
                <input
                  type="number"
                  value={(formData.parameters as any).maxHigh || 0}
                  onChange={(e) =>
                    updateParameter('maxHigh', parseInt(e.target.value))
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                  Max Medium
                </label>
                <input
                  type="number"
                  value={(formData.parameters as any).maxMedium || 0}
                  onChange={(e) =>
                    updateParameter('maxMedium', parseInt(e.target.value))
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                  Max Low
                </label>
                <input
                  type="number"
                  value={(formData.parameters as any).maxLow || 0}
                  onChange={(e) =>
                    updateParameter('maxLow', parseInt(e.target.value))
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {formData.type === 'SBOM_COMPLETENESS' && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <h3>SBOM Completeness Requirements</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                Minimum Packages
              </label>
              <input
                type="number"
                value={(formData.parameters as any).minPackages || 1}
                onChange={(e) =>
                  updateParameter('minPackages', parseInt(e.target.value))
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  marginBottom: '0.75rem',
                }}
              />
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <input
                type="checkbox"
                checked={(formData.parameters as any).requireLicenses || false}
                onChange={(e) =>
                  updateParameter('requireLicenses', e.target.checked)
                }
                style={{ marginRight: '0.5rem' }}
              />
              Require License Information
            </label>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={(formData.parameters as any).requirePurls || false}
                onChange={(e) =>
                  updateParameter('requirePurls', e.target.checked)
                }
                style={{ marginRight: '0.5rem' }}
              />
              Require Package URLs (purl)
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            {saving ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
