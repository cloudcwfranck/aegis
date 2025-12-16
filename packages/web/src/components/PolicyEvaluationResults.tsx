/**
 * Policy Evaluation Results Component
 * Displays pass/fail status and violations for policies
 */

interface PolicyEvaluationResult {
  policyId: string;
  policyName: string;
  policyType: string;
  passed: boolean;
  violations: Array<{
    severity: string;
    message: string;
    metadata?: Record<string, unknown>;
  }>;
  message: string;
  evaluatedAt: string;
}

interface PolicyEvaluationResponse {
  success: boolean;
  allPassed: boolean;
  evaluatedPolicies: number;
  passedPolicies: number;
  failedPolicies: number;
  results: PolicyEvaluationResult[];
}

export function PolicyEvaluationResults({
  results,
}: {
  results: PolicyEvaluationResponse;
}) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return '#dc3545';
      case 'HIGH':
        return '#fd7e14';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return '🔴';
      case 'HIGH':
        return '🟠';
      case 'MEDIUM':
        return '🟡';
      case 'LOW':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
      }}
    >
      {/* Overall Status */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0 }}>📋 Policy Evaluation Results</h2>
          {results.allPassed ? (
            <span
              style={{
                padding: '0.5rem 1rem',
                background: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                fontWeight: 'bold',
                border: '1px solid #c3e6cb',
              }}
            >
              ✅ All Policies Passed
            </span>
          ) : (
            <span
              style={{
                padding: '0.5rem 1rem',
                background: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
                fontWeight: 'bold',
                border: '1px solid #f5c6cb',
              }}
            >
              ❌ Some Policies Failed
            </span>
          )}
        </div>

        {/* Statistics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#495057',
              }}
            >
              {results.evaluatedPolicies}
            </div>
            <div style={{ color: '#6c757d', fontSize: '0.875rem' }}>
              Evaluated
            </div>
          </div>
          <div
            style={{
              padding: '1rem',
              background: '#d4edda',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#155724',
              }}
            >
              {results.passedPolicies}
            </div>
            <div style={{ color: '#155724', fontSize: '0.875rem' }}>Passed</div>
          </div>
          <div
            style={{
              padding: '1rem',
              background: '#f8d7da',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#721c24',
              }}
            >
              {results.failedPolicies}
            </div>
            <div style={{ color: '#721c24', fontSize: '0.875rem' }}>Failed</div>
          </div>
        </div>
      </div>

      {/* Individual Policy Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {results.results.map((result) => (
          <div
            key={result.policyId}
            style={{
              padding: '1rem',
              background: result.passed ? '#f8f9fa' : '#fff3cd',
              border: `1px solid ${result.passed ? '#dee2e6' : '#ffc107'}`,
              borderRadius: '4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>
                    {result.passed ? '✅' : '❌'}
                  </span>
                  <strong>{result.policyName}</strong>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#6c757d',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {result.policyType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                  {result.message}
                </div>
              </div>
            </div>

            {/* Violations */}
            {result.violations.length > 0 && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    color: '#721c24',
                  }}
                >
                  Violations ({result.violations.length}):
                </div>
                {result.violations.map((violation, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.5rem',
                      marginBottom:
                        idx < result.violations.length - 1 ? '0.5rem' : 0,
                      borderLeft: `4px solid ${getSeverityColor(violation.severity)}`,
                      paddingLeft: '0.75rem',
                      background: '#f8f9fa',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span>{getSeverityIcon(violation.severity)}</span>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: getSeverityColor(violation.severity),
                          fontSize: '0.875rem',
                        }}
                      >
                        {violation.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#495057' }}>
                      {violation.message}
                    </div>
                    {violation.metadata &&
                      Object.keys(violation.metadata).length > 0 && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#6c757d',
                            marginTop: '0.25rem',
                          }}
                        >
                          {Object.entries(violation.metadata).map(
                            ([key, value]) => (
                              <span
                                key={key}
                                style={{ marginRight: '0.75rem' }}
                              >
                                {key}: {JSON.stringify(value)}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {results.results.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
          <p>
            No policies were evaluated. Create policies in the Policy Management
            page.
          </p>
        </div>
      )}
    </div>
  );
}
