# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies needed for build (python/make for gyp if needed)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Runner
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built assets from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/docs ./docs
# Copy .env files (optional: usually these are mounted at runtime)
# COPY .env.production .env

# Create non-root user for security
RUN addgroup -S jollygroup && adduser -S jollyuser -G jollygroup
USER jollyuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# Start command
CMD ["node", "dist/src/server.js"]
