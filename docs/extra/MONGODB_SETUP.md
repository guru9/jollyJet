# MongoDB Setup Guide (Cloud First)

## Overview

JollyJet follows a **Cloud First Architecture**. We use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Managed NoSQL) as our primary database for all environments, including local development. This ensures consistency and eliminates local infrastructure overhead.

---

## 🏗️ Cloud Configuration (Recommended)

### Local Development (.env)

For local development, we use a shared development cluster. This is the default setup.

```env
MONGODB_SRV=true
MONGODB_HOST=cluster0.y2vibke.mongodb.net
MONGODB_USERNAME=gururaj9m_db_user
MONGODB_PASSWORD=jolly4277
MONGODB_DB_NAME=jollyjet
MONGODB_DISABLED=false
```

### Benefits of Cloud First

1. **Zero Local Setup**: No need to install MongoDB or manage Docker containers locally.
2. **Environment Parity**: Local dev uses the same database engine and configuration as production.
3. **Managed Scaling**: Atlas handles backups, scaling, and performance monitoring automatically.

---

## 🐋 Regional Dockerization

While we use Cloud DBs, the **application** can be containerized for different regions.

### Dev Region (.env.development)

Used for deploying the API to a development/staging region.

### Production Region (.env.production)

Used for critical production deployments with optimized pools.

---

## 🛠️ MongoDB Reference

### Connection String Format

The application constructs the URI using properties. We focus on **SRV** connections:
`mongodb+srv://[username]:[password]@[host]/[db_name]?retryWrites=true&w=majority`

### Health Check Statuses

The `/health` endpoint reports:

- **connected**: Relationship with Atlas is active.
- **error**: Connection failed (check IP whitelisting in Atlas).
- **disabled**: Intentionally turned off in config.

---

## 🔍 Troubleshooting

- **IP Whitelisting**: Ensure your current public IP is added to the "Network Access" tab in your MongoDB Atlas dashboard.
- **SSL/TLS**: Atlas requires encrypted connections, which are handled automatically by the driver.

---

**Last Updated:** 2026-01-31  
**Architecture:** Cloud First  
**Maintainer:** Gururaj Moger
