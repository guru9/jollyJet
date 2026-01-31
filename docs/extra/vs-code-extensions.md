# VS Code Extensions Guide for JollyJet Development (Cloud First)

This guide covers the best VS Code extensions for developing JollyJet using our **Cloud First Architecture**. We prioritize cloud-hosted MongoDB and Redis, meaning local Docker is primarily used for final application containerization testing.

---

## 🚀 Essential Extensions

### 1. MongoDB Extension (Microsoft)

**Extension ID:** `ms-vscode.vscode-mongodb`

**Why?** Browsing and querying your cloud-hosted Atlas database directly from VS Code.

**Setup:**

1. Open the MongoDB Explorer.
2. Add the connection string from your `.env` (Atlas SRV).
3. Browse `jollyjet` collections and run playbooks.

### 2. Redis Extension (Microsoft)

**Extension ID:** `ms-vscode.vscode-redis`

**Why?** Inspecting Upstash or Redis Cloud caches without leaving your editor.

**Setup:**

1. Connect using the `rediss://` URI from your `.env`.
2. View key patterns like `product:*` and monitor real-time cache hits.

### 3. Thunder Client / REST Client

**Extension IDs:** `rangav.vscode-thunder-client` or `humao.rest-client`

**Why?** Instant API testing without external tools like Postman.

**Local Testing (.http):**

```http
@baseUrl = http://localhost:3000/api/v1

### List Products
GET {{baseUrl}}/products
```

### 4. Docker Extension

**Extension ID:** `ms-azuretools.vscode-docker`

**Why?** Managing the **Application API container** during regional tests (`npm run docker:up:dev`).

---

## 🛠️ Productivity Extensions

| Extension               | Purpose                                     |
| :---------------------- | :------------------------------------------ |
| **ESLint**              | Real-time linting and auto-fix.             |
| **Prettier**            | Opinionated code formatting.                |
| **GitLens**             | Powerful git history and blame annotations. |
| **TypeScript Importer** | Auto-resolving complex imports.             |

---

## 🔧 Recommended VS Code Settings

Add these to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

---

**Last Updated:** 2026-01-31  
**Approach:** Cloud First  
**Maintainer:** Gururaj Moger
