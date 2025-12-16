/**
 * GraphQL Context Types
 */

import { Request, Response } from 'express';

/**
 * GraphQL context passed to all resolvers
 */
export interface GraphQLContext {
  req: Request;
  res: Response;
  tenantId?: string;
  userId?: string;
}
