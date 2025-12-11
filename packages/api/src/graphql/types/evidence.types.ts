/**
 * GraphQL Types for Evidence
 */

import { ObjectType, Field, InputType, Int } from 'type-graphql';
import GraphQLJSON from 'graphql-type-json';

/**
 * Input type for uploading scan results
 */
@InputType()
export class UploadScanInput {
  @Field()
  projectName!: string;

  @Field()
  buildId!: string;

  @Field()
  imageDigest!: string;

  @Field(() => GraphQLJSON, {
    description: 'SBOM in SPDX 2.3 JSON format',
  })
  sbom!: object;

  @Field(() => GraphQLJSON, {
    description: 'Grype vulnerability scan results in JSON format',
  })
  vulnerabilities!: object;

  @Field({ nullable: true })
  gitCommitSha?: string;

  @Field({ nullable: true })
  gitBranch?: string;

  @Field({ nullable: true })
  ciPipelineUrl?: string;
}

/**
 * Summary statistics for scan upload
 */
@ObjectType()
export class ScanSummary {
  @Field(() => Int)
  packageCount!: number;

  @Field(() => Int)
  vulnerabilityCount!: number;

  @Field(() => Int)
  criticalCount!: number;

  @Field(() => Int)
  highCount!: number;

  @Field(() => Int)
  mediumCount!: number;

  @Field(() => Int)
  lowCount!: number;
}

/**
 * Result of scan upload mutation
 */
@ObjectType()
export class UploadScanResult {
  @Field()
  success!: boolean;

  @Field()
  evidenceId!: string;

  @Field()
  message!: string;

  @Field(() => ScanSummary, { nullable: true })
  summary?: ScanSummary;
}

/**
 * Evidence item in list results
 */
@ObjectType()
export class EvidenceItem {
  @Field()
  id!: string;

  @Field()
  projectName!: string;

  @Field()
  buildId!: string;

  @Field()
  imageDigest!: string;

  @Field()
  type!: string;

  @Field()
  createdAt!: Date;
}

/**
 * Paginated list of evidence records
 */
@ObjectType()
export class EvidenceListResult {
  @Field(() => [EvidenceItem])
  items!: EvidenceItem[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}
