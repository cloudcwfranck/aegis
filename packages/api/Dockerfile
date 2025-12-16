# Multi-stage build for Aegis API
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/db/package*.json ./packages/db/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=@aegis/api --workspace=@aegis/db --workspace=@aegis/shared

# Copy source code
COPY packages/api ./packages/api
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
COPY tsconfig.json ./

# Build all packages
RUN npm run build --workspace=@aegis/shared
RUN npm run build --workspace=@aegis/db
RUN npm run build --workspace=@aegis/api

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/db/package*.json ./packages/db/
COPY packages/shared/package*.json ./packages/shared/

# Install production dependencies only
RUN npm ci --workspace=@aegis/api --workspace=@aegis/db --workspace=@aegis/shared --omit=dev

# Copy built files from builder
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy database migrations
COPY --from=builder /app/packages/db/src/migrations ./packages/db/src/migrations

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "packages/api/dist/index.js"]
