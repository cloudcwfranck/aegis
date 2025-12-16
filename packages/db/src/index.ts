/**
 * @aegis/db
 * TypeORM entities and database utilities for Aegis platform
 */

export * from './data-source';
export * from './entities';
// export * from './repositories'; // TODO: Implement custom repositories in M1

// Export incident enums separately
export { IncidentStatus, IncidentSeverity, IncidentType } from './entities/incident.entity';

// Export POAM enums separately
export {
  POAMStatus,
  RiskLevel,
  Likelihood,
  Impact,
} from './entities/poam.entity';
