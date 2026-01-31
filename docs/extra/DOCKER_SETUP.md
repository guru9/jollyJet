# 🐋 Docker Setup Guide - JollyJet (Cloud First)

This guide explains how to run the JollyJet application using Docker in a Cloud-First architecture.

---

## 🎯 Overview

In this project, we prioritize **Cloud Services** (MongoDB Atlas, Upstash/Redis Cloud) even for local development.

- **Local Development**: Run directly on your host machine (Host Mode). Docker is not required.
- **Regions (Dev/Prod)**: Use Docker to containerize the application for deployment to development or production regions.

## 🚀 Quick Start

### 1️⃣ Build the Images

```powershell
# Build for dev region
npm run docker:build:dev

# Build for production region
npm run docker:build:prod
```

### 2️⃣ Start the Application

```powershell
# Start dev region container
npm run docker:up:dev

# Start production region container
npm run docker:up:prod
```

This command uses the `docker-compose.yml` file and reads configuration from your `.env` file.

### 3️⃣ View Logs

```powershell
npm run docker:logs
```

---

## 📁 Docker Files

The project uses a simplified Docker structure:

| File                 | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `Dockerfile`         | Instructions to build the application image.                    |
| `docker-compose.yml` | Unified configuration for running the application container.    |
| `.dockerignore`      | Files and directories to exclude from the Docker build context. |

---

## 🎮 NPM Scripts Reference

```powershell
# Start the application container
npm run docker:up

# Stop the container
npm run docker:down

# Build the application image
npm run docker:build

# View running containers
npm run docker:ps

# View live logs
npm run docker:logs
```

---

## ⚙️ Environment Configuration

The Docker container reads environment variables from the `.env` file. Ensure your cloud connection strings are correctly set:

```env
# Example .env entries for Docker
MONGODB_SRV=true
MONGODB_HOST=your-cluster.mongodb.net
REDIS_HOST=your-redis-host.upstash.io
REDIS_PASSWORD=your-password
REDIS_TLS=true
```

---

## 🔍 Troubleshooting

### 1. Connection Failures

- **Symptoms**: App starts but fails to connect to MongoDB/Redis.
- **Solution**: Ensure your IP address is whitelisted in the MongoDB Atlas and Upstash/Redis Cloud dashboards.

### 2. Container Fails to Start

- **Check Logs**: `npm run docker:logs` to see the error message.
- **Environment**: Verify that all required variables in `.env` are present and correct.

### 3. Port Conflict

- **Symptoms**: Error message saying port 3000 is already in use.
- **Solution**: Either stop the service using port 3000 or change the `PORT` variable in your `.env` file.

---

## 🛡️ Production Deployment

For production, it is recommended to:

1. Use an optimized base image (already handled in `Dockerfile`).
2. Inject environment variables via your CI/CD pipeline or orchestration tool (e.g., AWS ECS, Kubernetes, Railway).
3. Use `.env.production` as a template for your production secrets.

---

**Last Updated:** 2026-01-31  
**Architecture:** Cloud First  
**Maintainer:** Gururaj Moger
