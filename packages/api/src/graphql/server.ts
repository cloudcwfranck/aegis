/**
 * Apollo GraphQL Server Configuration
 */

import { Server } from 'http';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { Express } from 'express';
import { buildSchema } from 'type-graphql';

import { EvidenceResolver } from './resolvers/evidence.resolver';
import { GraphQLContext } from './types/context.types';
import { logger } from '../utils/logger';

/**
 * Create and configure Apollo Server
 */
export async function createApolloServer(
  app: Express,
  httpServer: Server
): Promise<ApolloServer<GraphQLContext>> {
  // Build TypeGraphQL schema
  const schema = await buildSchema({
    resolvers: [EvidenceResolver],
    validate: true,
    emitSchemaFile: false,
  });

  // Create Apollo Server
  const server = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      logger.error('GraphQL error', {
        message: error.message,
        path: error.path,
        extensions: error.extensions,
      });
      return error;
    },
  });

  await server.start();

  // Apply Apollo middleware to Express
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<GraphQLContext> => {
        // Extract tenant ID from header (placeholder for authentication)
        const tenantId = req.headers['x-tenant-id'] as string | undefined;

        return {
          req,
          res,
          tenantId,
        };
      },
    })
  );

  logger.info('🚀 Apollo GraphQL server configured at /graphql');

  return server;
}
