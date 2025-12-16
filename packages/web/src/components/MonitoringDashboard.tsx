/**
 * Monitoring Dashboard - Centralized incident monitoring and alerting
 * Similar to BigPanda's incident management interface
 */

import axios from 'axios';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TENANT_ID = '00000000-0000-0000-0000-000000000000';

interface IncidentStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  byType: Record<string, number>;
  avgTTA: number;
  avgTTR: number;
}

interface IncidentCluster {
  clusterId: string;
  clusterName: string;
  severity: string;
  incidentCount: number;
  totalAlerts: number;
  affectedServices: string[];
  incidents: Incident[];
}

interface Incident {
  id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  projectName?: string;
  impactedService?: string;
  alertCount: number;
  affectedAssets: number;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export function MonitoringDashboard() {
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [clusters, setClusters] = useState<IncidentCluster[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, clustersRes, incidentsRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/incidents/stats`, {
          headers: { 'x-tenant-id': TENANT_ID },
        }),
        axios.get(`${API_URL}/api/v1/incidents/clusters`, {
          headers: { 'x-tenant-id': TENANT_ID },
        }),
        axios.get(`${API_URL}/api/v1/incidents?limit=50`, {
          headers: { 'x-tenant-id': TENANT_ID },
        }),
      ]);

      setStats(statsRes.data.stats);
      setClusters(clustersRes.data.clusters || []);
      setIncidents(incidentsRes.data.incidents || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '#dc3545';
      case 'HIGH':
        return '#fd7e14';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#dc3545';
      case 'ACKNOWLEDGED':
        return '#ffc107';
      case 'INVESTIGATING':
        return '#17a2b8';
      case 'RESOLVED':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const filterIncidents = () => {
    let filtered = incidents;

    if (activeFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === activeFilter);
    }

    if (selectedCluster) {
      const cluster = clusters.find((c) => c.clusterId === selectedCluster);
      if (cluster) {
        const incidentIds = cluster.incidents.map((i) => i.id);
        filtered = filtered.filter((i) => incidentIds.includes(i.id));
      }
    }

    return filtered;
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading monitoring dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>📊 Monitoring Dashboard</h1>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Centralized incident management and security monitoring
        </p>
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Total Incidents"
          value={stats?.total || 0}
          color="#007bff"
        />
        <StatCard
          title="Active"
          value={stats?.active || 0}
          color="#dc3545"
        />
        <StatCard
          title="Acknowledged"
          value={stats?.acknowledged || 0}
          color="#ffc107"
        />
        <StatCard
          title="Resolved"
          value={stats?.resolved || 0}
          color="#28a745"
        />
        <StatCard
          title="Critical"
          value={stats?.bySeverity.critical || 0}
          color="#dc3545"
        />
        <StatCard
          title="Avg TTA"
          value={`${Math.round(stats?.avgTTA || 0)}m`}
          color="#17a2b8"
        />
      </div>

      {/* Cluster Map */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Incident Clusters</h2>
        {clusters.length === 0 ? (
          <p style={{ color: '#6c757d' }}>No incident clusters found</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {clusters.map((cluster) => (
              <div
                key={cluster.clusterId}
                onClick={() => setSelectedCluster(cluster.clusterId)}
                style={{
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '4px',
                  border: `2px solid ${selectedCluster === cluster.clusterId ? '#007bff' : getSeverityColor(cluster.severity)}`,
                  cursor: 'pointer',
                  minWidth: '200px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: getSeverityColor(cluster.severity),
                    marginBottom: '0.5rem',
                  }}
                >
                  {cluster.severity}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  {cluster.clusterName}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  {cluster.incidentCount} incidents · {cluster.totalAlerts} alerts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <FilterButton
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
          label="All"
        />
        <FilterButton
          active={activeFilter === 'ACTIVE'}
          onClick={() => setActiveFilter('ACTIVE')}
          label="Active"
          color="#dc3545"
        />
        <FilterButton
          active={activeFilter === 'ACKNOWLEDGED'}
          onClick={() => setActiveFilter('ACKNOWLEDGED')}
          label="Acknowledged"
          color="#ffc107"
        />
        <FilterButton
          active={activeFilter === 'RESOLVED'}
          onClick={() => setActiveFilter('RESOLVED')}
          label="Resolved"
          color="#28a745"
        />
        {selectedCluster && (
          <button
            onClick={() => setSelectedCluster(null)}
            style={{
              padding: '0.5rem 1rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Incident List */}
      <div>
        <h2 style={{ marginBottom: '1rem' }}>
          Incidents ({filterIncidents().length})
        </h2>
        {filterIncidents().length === 0 ? (
          <div
            style={{
              padding: '2rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#6c757d' }}>No incidents found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filterIncidents().map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
      }}
    >
      <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0.5rem' }}>
        {title}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        background: active ? color || '#007bff' : 'white',
        color: active ? 'white' : '#495057',
        border: `1px solid ${color || '#dee2e6'}`,
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: active ? 'bold' : 'normal',
      }}
    >
      {label}
    </button>
  );
}

function IncidentCard({
  incident,
  getSeverityColor,
  getStatusColor,
}: {
  incident: Incident;
  getSeverityColor: (severity: string) => string;
  getStatusColor: (status: string) => string;
}) {
  return (
    <div
      style={{
        padding: '1.5rem',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        borderLeft: `4px solid ${getSeverityColor(incident.severity)}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                padding: '0.25rem 0.5rem',
                background: getSeverityColor(incident.severity),
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              {incident.severity}
            </span>
            <span
              style={{
                padding: '0.25rem 0.5rem',
                background: getStatusColor(incident.status),
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              {incident.status}
            </span>
          </div>
          <h3 style={{ margin: '0.5rem 0' }}>{incident.title}</h3>
          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
            {incident.projectName && (
              <span>📦 {incident.projectName} · </span>
            )}
            {incident.type} · {incident.alertCount} alerts · {incident.affectedAssets} assets
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#6c757d' }}>
          <div>{new Date(incident.createdAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
