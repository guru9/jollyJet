# Windows Quick Start Guide (JollyJet)

This guide provides copy-paste commands optimized for the Windows Command Prompt (`cmd.exe`) and PowerShell, following our **Cloud First Architecture**.

---

## 🎯 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Cloud Accounts**: MongoDB Atlas and Upstash/Redis (or similar)
- _Optional_: Docker Desktop (only for regional deployments)

---

## 🎮 Updated Developer Experience

Since we now use cloud services globally, your daily routine is now faster:

- **Local Dev**: Just run `npm run dev`.
- **Docker (Dev Region)**: `npm run docker:up:dev`.
- **Docker (Prod Region)**: `npm run docker:up:prod`.

---

## 🚀 Setup Steps

### 1. Install Dependencies

```powershell
npm install
```

### 2. Environment Configuration

The `.env` file is pre-configured for local development using cloud instances.

```powershell
# Create a local override if needed (not committed to git)
copy .env .env.local
```

### 3. Start Development (Host Mode)

Since we use cloud services, you don't need to start local Docker containers. This is the fastest way to run JollyJet:

```powershell
# Start the API directly on your host
npm run dev
```

### 4. Regional Docker Deployments

If you need to test the containerized version for specific regions (simulates production/staging):

```powershell
# For Dev Region (.env.development)
npm run docker:up:dev

# For Production Region (.env.production)
npm run docker:up:prod
```

---

## 🔍 Monitoring & Debugging

### View Container Status

```powershell
npm run docker:ps
```

### View Live Logs

```powershell
# For Dev Region
npm run docker:logs:dev

# For Prod Region
npm run docker:logs:prod
```

---

## 🛡️ Security Reminders

- **Never Commit Secrets**: Ensure `.env.local`, `.env.*.local`, and production keys are excluded from version control.
- **IP Whitelisting**: Remember to whitelist your current IP in the MongoDB Atlas and Upstash dashboards.

---

## 📚 Related Documentation

- [Master Implementation Guide](./JOLLYJET_IMPLEMENTATION_MASTER_GUIDE.md) - Deep dive into patterns.
- [Cloud First Implementation Plan](./implementation-plans/13-cloud-first-architecture.md) - Why we made the shift.
- [Docker Setup Guide](./DOCKER_SETUP.md) - Complex container configurations.

---

**Last Updated:** 2026-01-31  
**Architecture:** Cloud First (Host Mode Optimized)
