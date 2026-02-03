# JollyJet Multi-Stage Production Dockerfile
# Optimized for production deployments with security best practices
# Using Node.js v22 Alpine for minimal size and security

# =============================================================================
# Stage 1: Builder
# =============================================================================

# =============================================================================
# Stage 1: Builder
# =============================================================================
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install dependencies needed for build (python/make for gyp if needed)
RUN apk add --no-cache python3 make g++

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =============================================================================
# Stage 2: Runtime (Development)
# =============================================================================
FROM node:22-alpine AS runtime

# Set working directory
WORKDIR /usr/src/app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built assets from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/docs ./docs

# Create non-root user for security
RUN addgroup -S jollygroup && adduser -S jollyuser -G jollygroup

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# Switch to non-root user
USER jollyuser

# Start command
CMD ["node", "dist/src/server.js"]

# =============================================================================
# Stage 3: Production (Optional - Slimmer image)
# =============================================================================
FROM node:22-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Install curl for healthchecks only
RUN apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built assets from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/docs ./docs

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S jollygroup && \
    adduser -S jollyuser -u 1001 -G jollygroup && \
    chown -R jollyuser:jollygroup /usr/src/app

# Change ownership
USER jollyuser

# Expose port
EXPOSE 3000

# Health check with retries
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start command
CMD ["node", "dist/src/server.js"]

# =============================================================================
# Labels and Metadata
# =============================================================================
LABEL maintainer="JollyJet Team" \
      version="1.0.0" \
      description="JollyJet E-commerce API" \
      org.opencontainers.image.source="https://github.com/guru9/jollyjet-starter" \
      org.opencontainers.image.title="JollyJet API" \
      org.opencontainers.image.description="JollyJet E-commerce API Container Image"