# JollyJet Docker Configuration

## Overview

This directory contains all Docker configurations for the JollyJet e-commerce platform. The configurations are organized by environment and purpose, providing flexibility for development, testing, and production deployments.

## Directory Structure

```
docker/
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml        # Base configuration (cloud-first)
├── docker-compose.dev.yml    # Development environment
├── docker-compose.prod.yml   # Production environment
├── docker-compose.ci.yml    # CI/CD testing environment
├── docker-compose.review.yml # PR review environment
├── .dockerignore            # Docker build ignore file
└── README.md                # This file
```

## Quick Start

### Development

```bash
# Using cloud-first approach (connects to Atlas/Upstash)
docker compose -f docker/docker-compose.yml up -d

# Using dev region configuration
docker compose -f docker/docker-compose.dev.yml up -d
```

### Production

```bash
docker compose -f docker/docker-compose.prod.yml up -d
```

### CI/CD

```bash
docker compose -f docker/docker-compose.ci.yml up -d
```

## Docker Compose Files

### docker-compose.yml (Base Configuration)

The base configuration connects to cloud-hosted MongoDB (Atlas) and Redis (Upstash) as configured in your `.env` file.

**Usage:**

```bash
docker compose -f docker/docker-compose.yml up -d
```

**Features:**

- Cloud-first approach
- No local database dependencies
- Environment variable support
- Health checks enabled
- Security best practices

### docker-compose.dev.yml (Development)

Development configuration for the dev region, using cloud services with development settings.

**Usage:**

```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

**Features:**

- Debug logging enabled
- Development environment variables
- Container naming with dev suffix
- Resource optimization for development

### docker-compose.prod.yml (Production)

Production-ready configuration with enhanced security, scaling, and monitoring.

**Usage:**

```bash
docker compose -f docker/docker-compose.prod.yml up -d
```

**Features:**

- 2 application replicas
- Resource limits and reservations
- Enhanced security (read-only filesystem, non-root user)
- Production-grade logging
- Health checks with retries
- Docker Swarm deployment support

### docker-compose.ci.yml (CI/CD)

Configuration for CI/CD pipelines with integrated MongoDB and Redis services.

**Usage:**

```bash
docker compose -f docker/docker-compose.ci.yml up -d
```

**Features:**

- Integrated MongoDB service
- Integrated Redis service
- Service health checks
- Development logging
- Isolated network

### docker-compose.review.yml (PR Review)

Configuration for pull request review environments with isolated services.

**Usage:**

```bash
docker compose -f docker/docker-compose.review.yml up -d
```

**Features:**

- Isolated MongoDB and Redis
- Debug logging for troubleshooting
- Container naming with review suffix
- Easy cleanup

## Dockerfile

### Multi-Stage Build

The Dockerfile uses multi-stage builds for optimization:

```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
# Installs dependencies and builds the application

# Stage 2: Runtime (Development)
FROM node:18-alpine AS runtime
# Development-ready image with all dependencies

# Stage 3: Production (Slimmer image)
FROM node:18-alpine AS production
# Production-optimized image with minimal footprint
```

### Build Arguments

| Argument   | Default      | Description         |
| ---------- | ------------ | ------------------- |
| `NODE_ENV` | `production` | Node.js environment |
| `PORT`     | `3000`       | Application port    |

### Build Commands

**Development Build:**

```bash
docker build -f docker/Dockerfile --target runtime .
```

**Production Build:**

```bash
docker build -f docker/Dockerfile --target production .
```

**Multi-Platform Build:**

```bash
docker buildx build -f docker/Dockerfile \
  --platform linux/amd64,linux/arm64 \
  --target production \
  --push .
```

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Application Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/jollyjet
REDIS_URL=redis://localhost:6379

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

### Development Environment

Create `.env.development`:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
MONGODB_URI=mongodb+srv://dev-cluster.mongodb.net/jollyjet-dev
REDIS_URL=redis://dev-redis.upstash.io
```

### Production Environment

Create `.env.production`:

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
MONGODB_URI=mongodb+srv://prod-cluster.mongodb.net/jollyjet
REDIS_URL=redis://prod-redis.upstash.io
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-domain.com
```

## Security Best Practices

### Container Security

The Docker configurations implement the following security best practices:

1. **Non-root User**: Containers run as non-root user (`jollyuser`)
2. **Read-only Filesystem**: Production containers use read-only filesystem where possible
3. **Resource Limits**: Production deployments have CPU and memory limits
4. **Security Options**: `no-new-privileges` enabled
5. **Capability Dropping**: Unnecessary Linux capabilities are dropped

### Health Checks

All containers include health checks:

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Logging

Production logging configuration:

```yaml
logging:
  driver: 'json-file'
  options:
    max-size: '10m'
    max-file: '5'
```

## Docker Compose Overrides

Create a `docker-compose.override.yml` file for local overrides:

```yaml
version: '3.8'

services:
  api:
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    command: npm run dev
```

## Development Workflow

### 1. Start Development Environment

```bash
# Start with live reload
docker compose -f docker/docker-compose.dev.yml up -d

# View logs
docker compose -f docker/docker-compose.dev.yml logs -f
```

### 2. Run Tests

```bash
# Run tests in CI environment
docker compose -f docker/docker-compose.ci.yml up -d
docker exec -it jollyjet-ci npm test
```

### 3. Build for Production

```bash
# Build production image
docker build -f docker/Dockerfile --target production -t jollyjet-api:prod .

# Test production image
docker run -p 3000:3000 --env-file .env.production jollyjet-api:prod
```

## Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -f docker/docker-compose.prod.yml jollyjet
```

### Kubernetes

Create Kubernetes manifests using the Docker configurations as reference.

### Manual Deployment

```bash
# Pull latest image
docker pull ghcr.io/guru9/jollyjet-starter:latest

# Deploy
docker compose -f docker/docker-compose.prod.yml up -d
```

## Troubleshooting

### Container Issues

**Container won't start:**

```bash
# Check logs
docker logs jollyjet-api

# Check health status
docker inspect jollyjet-api --format='{{.State.Health.Status}}'
```

**Connection issues:**

```bash
# Test health endpoint
curl http://localhost:3000/health

# Check environment variables
docker exec jollyjet-api env
```

### Build Issues

**Build fails:**

```bash
# Rebuild without cache
docker build -f docker/Dockerfile --no-cache .

#Check for errors
docker build -f docker/Dockerfile . --progress=verbose
```

## Best Practices

### 1. Use Multi-Stage Builds

- Separate build and runtime stages
- Minimize final image size
- Improve security by excluding build tools

### 2. Environment-Specific Configurations

- Use different compose files for different environments
- Never hardcode sensitive values
- Use environment variables for configuration

### 3. Health Checks

- Always include health checks
- Test dependencies in health checks
- Set appropriate intervals and timeouts

### 4. Resource Management

- Set appropriate resource limits
- Monitor resource usage
- Adjust based on actual consumption

### 5. Security

- Run containers as non-root
- Use read-only filesystems where possible
- Drop unnecessary capabilities
- Scan images for vulnerabilities

### 6. Logging

- Use JSON logging format
- Implement log rotation
- Centralize logs in production

## Maintenance

### Updating Dependencies

```bash
# Rebuild with updated dependencies
docker build -f docker/Dockerfile --no-cache .
```

### Cleaning Up

```bash
# Remove unused images
docker image prune -f

# Remove stopped containers
docker container prune -f

# Full cleanup
docker system prune -f
```

### Monitoring

```bash
# View container stats
docker stats

# View resource usage
docker system df
```

## Support

For issues and questions:

- Check container logs
- Review health check status
- Consult troubleshooting section
- Open an issue in the repository

## Related Documentation

- [CI/CD Implementation Guide](../docs/ci-cd/CI-CD_IMPLEMENTATION_GUIDE.md)
- [Implementation Plan](../docs/implementation-plans/15-ci-cd-implementation-plan.md)
- [Cloud First Architecture](../docs/implementation-plans/13-cloud-first-architecture.md)

---

**Last Updated**: 2026-02-03  
**Version**: 1.0.0  
**Maintainer**: JollyJet Team
