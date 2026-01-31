# JollyJet Development Setup Guide (Cloud First)

This guide covers the optimized development setup for JollyJet using our **Cloud First Architecture**, which allows for a fast, "Host Mode" development experience.

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd jollyJet

# 2. Install dependencies
npm install

# 3. Start the development server (Cloud First - no local DBs needed)
npm run dev
```

---

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**
- **Cloud Accounts**: MongoDB Atlas and Upstash/Redis account access (provided in `.env`).

---

## 🏗️ Cloud First Architecture

We use persistent cloud services for development to ensure consistency and eliminate local infrastructure management.

- **MongoDB**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Redis**: [Upstash](https://upstash.com/) (Serverless)

### Advantages

1. **Host Mode**: No Docker overhead for daily coding.
2. **Speed**: Start development in seconds.
3. **Parity**: Identical database environment across your whole team.

---

## ⚙️ Configuration (.env)

The project is pre-configured for local dev using cloud instances.

```env
# MongoDB (Atlas)
MONGODB_SRV=true
MONGODB_HOST=cluster0...
...

# Redis (Upstash)
REDIS_HOST=inspired-chow...
REDIS_PASSWORD=...
REDIS_TLS=true
```

---

## 🧪 Testing

We use `mongodb-memory-server` for isolated integration testing, so you don't even need the cloud DB for running tests.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 🚦 Daily Workflow

| Task                 | Command                           |
| :------------------- | :-------------------------------- |
| **Start Dev Server** | `npm run dev`                     |
| **Lint & Format**    | `npm run lint` / `npm run format` |
| **Build Project**    | `npm run build`                   |
| **Check Logs**       | (Logs are output to the terminal) |

---

## 🐋 Docker for Regions

Docker is reserved for containerizing the application for regional deployments:

- **Dev Region**: `npm run docker:up:dev`
- **Prod Region**: `npm run docker:up:prod`

---

## 🔍 Health Monitoring

Verify your system health at:
`GET http://localhost:3000/health`

---

**Last Updated:** 2026-01-31  
**Architecture:** Cloud First (Host Mode Optimized)  
**Maintainer:** Gururaj Moger
