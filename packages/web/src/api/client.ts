/**
 * API Client for Aegis Backend
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://aegis-api.braverock-7d82ef8f.usgovvirginia.azurecontainerapps.us';

export interface UploadScanRequest {
  projectName: string;
  buildId: string;
  imageDigest: string;
  sbom: object;
  vulnerabilities: object;
  gitCommitSha?: string;
  gitBranch?: string;
  ciPipelineUrl?: string;
}

export interface UploadScanResponse {
  success: boolean;
  evidenceId: string;
  message: string;
  summary?: {
    packageCount: number;
    vulnerabilityCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}

export interface EvidenceItem {
  id: string;
  projectName: string;
  buildId: string;
  imageDigest: string;
  type: string;
  createdAt: string;
}

class ApiClient {
  private client: AxiosInstance;
  private tenantId: string;

  constructor() {
    this.tenantId =
      localStorage.getItem('tenantId') ||
      '00000000-0000-0000-0000-000000000000';

    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // 60 second timeout
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId,
      },
    });

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - API took too long to respond');
        }
        if (error.response) {
          throw new Error(
            `API Error: ${error.response.status} - ${error.response.data?.message || error.message}`
          );
        }
        if (error.request) {
          throw new Error(
            'No response from API - please check if the API is running'
          );
        }
        throw error;
      }
    );
  }

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
    localStorage.setItem('tenantId', tenantId);
    this.client.defaults.headers['X-Tenant-ID'] = tenantId;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  async uploadScan(data: UploadScanRequest): Promise<UploadScanResponse> {
    const response = await this.client.post<UploadScanResponse>(
      '/api/v1/scans/upload',
      data
    );
    return response.data;
  }

  async listEvidence(): Promise<EvidenceItem[]> {
    try {
      const response = await this.client.get<{ items: EvidenceItem[] }>(
        '/api/v1/scans'
      );
      return response.data.items || [];
    } catch (error) {
      console.error('Failed to list evidence:', error);
      return [];
    }
  }

  async getEvidence(evidenceId: string): Promise<EvidenceItem | null> {
    try {
      const response = await this.client.get<EvidenceItem>(
        `/api/v1/scans/${evidenceId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get evidence:', error);
      return null;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  async evaluatePolicies(
    evidenceId: string,
    policyIds?: string[]
  ): Promise<PolicyEvaluationResponse> {
    const response = await this.client.post<PolicyEvaluationResponse>(
      '/api/v1/policies/evaluate',
      { evidenceId, policyIds }
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
