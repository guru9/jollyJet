# Redis Setup Guide (Cloud First)

## Overview

JollyJet uses Redis for high-performance caching, session management, and rate limiting. Following our **Cloud First Architecture**, we utilize [Upstash](https://upstash.com/) or [Redis Cloud](https://redis.com/) as the primary provider for all environments.

---

## 🏗️ Cloud Configuration (Recommended)

### Local Development (.env)

The project is pre-configured to use an Upstash instance for local development.

```env
REDIS_HOST=inspired-chow-22858.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_TLS=true
REDIS_DISABLED=false
```

### Why Cloud First?

1. **Host Mode Optimization**: No need to run Redis locally in Docker.
2. **Serverless Convenience**: Upstash provides a serverless Redis that scales with usage.
3. **Consistency**: Same caching behavior across dev, test, and production.

---

## ⚡ Redis Usage Patterns

### 1. Caching

Used in the `BaseRepository` for cache-aside patterns.

- **TTL**: Configurable per data type (e.g., `REDIS_TTL_PRODUCT`).

### 2. Rate Limiting

Global rate limiting is enforced via Redis to ensure distributed consistency.

### 3. Session Management

User sessions are stored in Redis for fast access and scalability.

---

## 🐋 Regional Deployments

Docker is used to package the **App API** for different regions, connecting to regional Redis instances.

- **Dev Region**: `npm run docker:up:dev`
- **Prod Region**: `npm run docker:up:prod`

---

## 🛠️ Connection Details

### SSL/TLS (Required)

Always use the `rediss://` protocol (note the double 's') for cloud connections to ensure data is encrypted in transit.

### Health Check Statuses

- **connected**: Active session with the cloud Redis.
- **error**: Connection failure (check credentials or network firewalls).

---

## 🔍 Troubleshooting

- **Latency**: Ensure your cloud Redis is in the same or nearest region as your app (e.g., Asia Pacific - Mumbai).
- **SSL Issues**: Verify that your environment variables use the correctly formatted SSL URI.

---

**Last Updated:** 2026-01-31  
**Architecture:** Cloud First  
**Maintainer:** Gururaj Moger
