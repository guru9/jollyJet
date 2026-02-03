# CI/CD File Structure and Purpose Documentation

## 📁 JollyJet CI/CD Architecture Overview

The JollyJet CI/CD system is a comprehensive pipeline for automating the build, test, and deployment processes of the e-commerce platform. It uses GitHub Actions for workflow orchestration and Docker for containerization.

## 📂 File Structure

```
jollyJet/
├── .github/
│   ├── workflows/              # GitHub Actions Workflows (9 files)
│   │   ├── ci.yml              # Main CI/CD Pipeline
│   │   ├── deploy-dev.yml      # Development Environment Deployment
│   │   ├── deploy-prod.yml     # Production Environment Deployment
│   │   ├── ci-current-branch.yml # Branch-Specific CI with Quality Gates
│   │   ├── testing.yml         # Comprehensive Testing Pipeline
│   │   ├── deployment-strategies.yml # Deployment Strategy Selector
│   │   ├── pr-review.yml       # PR Review Environment Automation
│   │   ├── release.yml         # Release Version Bump and Tag
│   │   └── release-branch-validation.yml # Release Branch Validation
│   └── branch-protection.yml   # Branch Protection Configuration
├── docker/                     # Docker Configuration
│   ├── Dockerfile              # Multi-Stage Production Docker Build
│   ├── docker-compose.yml      # Base Configuration (Local + Cloud)
│   ├── docker-compose.dev.yml  # Development Environment
│   ├── docker-compose.prod.yml # Production Environment
│   └── .dockerignore           # Docker Ignore File
├── docs/                       # Documentation
│   ├── ci-cd/
│   │   ├── CI-CD_IMPLEMENTATION_GUIDE.md # Implementation Guide
│   │   ├── CI-CD-FILE-STRUCTURE.md  # This File
│   │   └── RELEASE-BRANCH-GUIDE.md # Release Branch Management Guide
│   └── implementation-plans/15-ci-cd-implementation-plan.md # Plan
├── .env.sample                 # Environment Variables Template
└── package.json                # NPM Scripts Configuration
```

## 🔍 Detailed File Descriptions

### 1. GitHub Actions Workflows (.github/workflows/)

#### 📄 ci.yml - Main CI/CD Pipeline

**Purpose**: Comprehensive pipeline for all code changes to main and develop branches

**Key Features**:

- **Code Quality Checks**: ESLint, Prettier, TypeScript compilation
- **Testing**: Unit tests, Integration tests (with MongoDB/Redis services)
- **Security Scanning**: npm audit, Snyk, Trivy container scan
- **Docker Build**: Multi-platform (linux/amd64, linux/arm64) build and push
- **Deployment**: Automatic deployment to development environment on successful builds
- **PR Review**: Temporary review environment for pull requests

**Triggers**:

- Push to main or develop branches
- Pull requests to main branch
- Manual workflow dispatch

**Jobs**: 7 jobs (code-quality → unit-tests → integration-tests → security-scan → build-docker → deploy-dev → notify)

---

#### 📄 deploy-dev.yml - Development Environment Deployment

**Purpose**: Dedicated workflow for deploying to development environment

**Key Features**:

- Docker Compose deployment with health checks
- Environment variable verification
- Automatic rollback on failure
- Artifact storage for 7 days
- Detailed deployment status reporting

**Triggers**:

- Push to main or develop branches
- Manual workflow dispatch

**Jobs**: 2 jobs (deploy-dev → rollback-dev)

---

#### 📄 deploy-prod.yml - Production Environment Deployment

**Purpose**: Secure production deployment with manual approval

**Key Features**:

- Pre-deployment tag validation
- Manual approval gate
- Production image build with version tagging
- Blue-green deployment strategy
- Post-deployment validation (health checks, smoke tests)
- Automatic rollback on failure

**Triggers**:

- Published releases (tagged with vX.Y.Z)
- Manual workflow dispatch with specific tag

**Jobs**: 5 jobs (pre-deployment-checks → approval-gate → build-production-image → deploy-production → post-deployment-validation → rollback-production)

---

#### 📄 ci-current-branch.yml - Branch-Specific CI with Quality Gates

**Purpose**: Advanced pipeline for feature branches with quality gate decisions

**Key Features**:

- Pre-flight branch type detection
- Code quality and security checks
- Comprehensive testing suite
- Docker image building with branch-specific tags
- Quality gate decision making
- PR review environment deployment
- Automatic PR approval comments

**Triggers**:

- Push to main, develop, or feature/\* branches
- Pull requests to main or develop branches
- Manual workflow dispatch

**Jobs**: 8 jobs (pre-flight-checks → code-quality → unit-tests → integration-tests → security-scan → build-docker → quality-gate-decision → publish-branch → deploy-dev → pr-approval → notify)

---

#### 📄 testing.yml - Comprehensive Testing Pipeline

**Purpose**: Runs all types of tests and enforces quality gates

**Key Features**:

- Code quality gates (ESLint, Prettier, TypeScript, GitHub CodeQL)
- Test matrix with Node.js 22
- Unit and integration tests
- E2E tests with Docker Compose
- Performance testing
- Security testing (Snyk, OWASP ZAP)
- Accessibility testing
- Coverage reporting with 80% threshold
- Quality gate decision

**Triggers**:

- Push to main or develop branches
- Pull requests to main branch
- Manual workflow dispatch

**Jobs**: 8 jobs (code-quality-gates → unit-tests-matrix → integration-tests-services → e2e-tests → performance-tests → coverage-reporting → security-testing → accessibility-testing → quality-gate-decision)

---

#### 📄 deployment-strategies.yml - Deployment Strategy Selector

**Purpose**: Manual deployment with strategy selection

**Key Features**:

- Environment validation
- Strategy validation (blue-green, canary, rolling)
- Version validation
- Multiple deployment strategy options
- Post-deployment validation
- Automatic rollback on failure
- Deployment reporting

**Triggers**:

- Manual workflow dispatch only

**Jobs**: 4 jobs (validate-deployment → blue-green-deployment/canary-deployment/rolling-deployment → post-deployment-validation → rollback-deployment)

---

#### 📄 pr-review.yml - PR Review Environment Automation

**Purpose**: Creates temporary review environments for pull requests

**Key Features**:

- Review image building
- Temporary environment deployment
- Health checks
- Preview URL generation
- PR comment with preview details
- Automatic cleanup on PR close or sync

**Triggers**:

- PR opened
- PR synchronized (new commits)
- PR reopened

**Jobs**: 4 jobs (build-review-image → deploy-review-environment → comment-preview-url → cleanup-review-environment)

---

#### 📄 release.yml - Release Version Bump and Tag

**Purpose**: Automated version bumping and GitHub release creation with manual override options

**Key Features**:

- Conventional Commits analysis for automatic version detection
- Semantic versioning calculation (major/minor/patch)
- Manual force bump option for release branches
- GitHub Release creation with changelog
- Custom release notes support
- npm package publishing (optional)
- Release notifications

**Triggers**:

- Push to main or release/vX.Y.Z branches (automatic)
- Manual workflow dispatch with custom inputs (manual)

**Restrictions**:

- Only runs on main and release branches
- Prevents releases from develop or feature branches

**Manual Workflow Inputs**:

- **branch**: Branch to run release on (default: main)
- **force_bump**: Force specific version bump type (none/patch/minor/major)
- **release_notes**: Custom release notes to include in the GitHub Release

**Jobs**: 3 jobs (determine-version-bump → create-github-release → notify)

**Version Bump Rules**:

- **Manual Force Bump**: Overrides automatic detection
- **Breaking Change**: Contains "BREAKING CHANGE" or "!:" → Major version bump
- **New Feature**: Contains "feat" or "feature" → Minor version bump
- **Bug Fix**: Contains "fix" or "bug" → Patch version bump
- **Other Changes**: No version bump

**Output**:

- GitHub Release with tag (vX.Y.Z)
- Changelog from commit messages
- Custom release notes (if provided)
- Optional npm package publishing

---

#### 📄 release-branch-validation.yml - Release Branch Validation

**Purpose**: Validates PRs to main branch are from valid release branches

**Key Features**:

- Source branch validation (only release/vX.Y.Z allowed)
- Version format validation
- Package.json version check
- PR body and release notes validation
- Commit message validation
- Security checks

**Triggers**:

- Pull requests to main branch

**Jobs**: 4 jobs (validate-source-branch → check-commit-messages → security-checks → validate-merge-readiness)

**Validation Rules**:

- Source branch must match format: release/vX.Y.Z
- Version must be semantic version (X.Y.Z)
- PR must contain release notes
- Commit messages should follow Conventional Commits
- Security scan must pass

---

#### 📄 branch-protection.yml - Branch Protection Configuration

**Purpose**: Defines branch protection rules for all branch types

**Key Features**:

- Main branch protection with strict rules
- Release branch protection with appropriate restrictions
- Develop branch protection guidelines
- Required status checks and reviews
- Restrictions on who can merge

**Configuration**:

- YAML file for GitHub Branch Protection API
- Supports pattern matching for release branches
- Enforces admin rules

---

#### 📄 RELEASE-BRANCH-GUIDE.md - Release Branch Management Guide

**Purpose**: Comprehensive documentation for release branch management

**Contents**:

- Branch structure and types
- Branch protection rules
- Step-by-step release branch creation
- Merging to main process
- Bug fixes and hotfixes
- Rollback procedures
- Release versioning guidelines
- Best practices

---

### 2. Docker Configuration (docker/)

#### 📄 Dockerfile - Multi-Stage Production Docker Build

**Purpose**: Build optimized, secure Docker images for production

**Key Features**:

- **Multi-Stage Build**:
  - Builder stage: Installs dependencies and compiles TypeScript
  - Runtime stage: Production dependencies with security hardening
  - Production stage: Slimmer image with minimal footprint
- **Security Features**: Non-root user, read-only filesystem, health checks
- **Node.js Version**: v22 Alpine (latest LTS)
- **Health Check**: `/health` endpoint monitoring
- **Labels**: Comprehensive metadata for container registry

**Base Image**: node:22-alpine (lightweight, secure)

---

#### 📄 docker-compose.yml - Base Configuration

**Purpose**: Base Docker Compose configuration for local development with cloud services

**Key Features**:

- **Single Service**: api (main application)
- **Cloud Integration**: Connects to MongoDB Atlas and Redis Upstash
- **Ports**: 3000:3000
- **Environment Variables**: Loaded from .env file
- **Health Check**: curl to /health endpoint
- **Security**: No new privileges, non-root user
- **Logging**: JSON file driver with 10MB max size

**Usage**: `npm run docker:up`

---

#### 📄 docker-compose.dev.yml - Development Environment

**Purpose**: Docker Compose configuration for development environment

**Key Features**:

- **Development Mode**: Debug logging, hot reload support
- **Image**: jollyjet-api:dev (built from Dockerfile)
- **Target Stage**: runtime (for faster builds)
- **Environment Variables**: Loaded from .env.development
- **Ports**: 3000:3000
- **Health Check**: Same as base configuration
- **Network**: jollyjet-dev-network

**Usage**: `npm run docker:up:dev`

---

#### 📄 docker-compose.prod.yml - Production Environment

**Purpose**: Docker Compose configuration for production deployment

**Key Features**:

- **Security Hardening**: Read-only filesystem, tmpfs, capabilities drop/add
- **Resource Limits**: 0.5 CPU, 512MB memory
- **Replicas**: 2 instances for high availability
- **Health Check**: Longer start period (60s)
- **Environment Variables**: Loaded from .env.production
- **Network**: Overlay network for Swarm mode

**Usage**: `npm run docker:up:prod`

---

#### 📄 .dockerignore - Docker Ignore File

**Purpose**: Specifies files to exclude from Docker context

**Key Entries**:

- node_modules/
- .git/
- .github/
- logs/
- tmp/
- coverage/
- dist/
- \*.log
- .env\*

---

### 3. Documentation (docs/)

#### 📄 CI-CD_IMPLEMENTATION_GUIDE.md - Implementation Guide

**Purpose**: Comprehensive guide to setting up and using the CI/CD system

**Contents**:

- Architecture overview
- Pipeline structure
- Environment strategy
- File structure
- Setup instructions
- GitHub Secrets configuration
- Environment variables
- Docker setup
- Usage examples
- Pipeline jobs explanation
- Monitoring and observability
- Security features
- Deployment strategies
- Success criteria
- Troubleshooting

---

#### 📄 15-ci-cd-implementation-plan.md - Implementation Plan

**Purpose**: Detailed planning document for CI/CD implementation

**Contents**:

- Project structure analysis
- Infrastructure requirements
- Pipeline design
- Deployment strategy
- Configuration management
- Testing strategy
- Security implementation
- Monitoring and observability
- Rollback procedures

---

### 4. Configuration Files

#### 📄 .env.sample - Environment Variables Template

**Purpose**: Template file for environment configuration

**Key Sections**:

- Database Configuration (MongoDB)
- Redis Configuration
- Server Configuration
- Environment Settings
- Security Configuration
- Docker Configuration

---

#### 📄 package.json - NPM Scripts

**Purpose**: Project dependencies and scripts

**Key Scripts**:

```json
{
  "scripts": {
    "start": "node dist/src/server.js",
    "build": "tsc && tsc-alias",
    "dev": "nodemon --exec ts-node -r tsconfig-paths/register src/server.ts",
    "dev:cloud": "cross-env NODE_ENV=development nodemon --exec ts-node -r tsconfig-paths/register src/server.ts",
    "docker:up": "docker compose -f docker/docker-compose.yml up -d",
    "docker:up:local": "docker compose -f docker/docker-compose.yml up -d",
    "docker:up:dev": "docker compose -f docker/docker-compose.dev.yml up -d",
    "docker:up:prod": "docker compose -f docker/docker-compose.prod.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down",
    "docker:down:local": "docker compose -f docker/docker-compose.yml down",
    "docker:down:dev": "docker compose -f docker/docker-compose.dev.yml down",
    "docker:down:prod": "docker compose -f docker/docker-compose.prod.yml down",
    "docker:build": "docker compose -f docker/docker-compose.yml build",
    "docker:build:local": "docker compose -f docker/docker-compose.yml build",
    "docker:build:dev": "docker compose -f docker/docker-compose.dev.yml build",
    "docker:build:prod": "docker compose -f docker/docker-compose.prod.yml build",
    "docker:logs": "docker compose -f docker/docker-compose.yml logs -f",
    "docker:logs:local": "docker compose -f docker/docker-compose.yml logs -f",
    "docker:logs:dev": "docker compose -f docker/docker-compose.dev.yml logs -f",
    "docker:logs:prod": "docker compose -f docker/docker-compose.prod.yml logs -f",
    "docker:ps": "docker compose ps",
    "debug": "node --inspect=0.0.0.0:9228 -r ts-node/register -r tsconfig-paths/register src/server.ts",
    "predev": "echo 'Formatting...' && npm run format && echo 'Linting...' && npm run lint && echo 'Building...' && npm run build",
    "format": "prettier --write \"{src,tests}/**/*.{ts,js,json}\"",
    "format:check": "prettier --check \"{src,tests}/**/*.{ts,js,json}\"",
    "lint": "eslint \"{src,tests}/**/*.{ts,js}\"",
    "lint:fix": "eslint \"{src,tests}/**/*.{ts,js}\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🔄 CI/CD Workflow Summary

### Typical Development Flow

1. Developer pushes code to feature branch
2. `ci-current-branch.yml` runs automatically
3. Code quality, testing, and security checks are performed
4. Quality gate decision determines if branch is ready
5. PR review environment is deployed for testing
6. After approval, PR is merged to main
7. `ci.yml` runs automatically on main branch
8. New Docker image is built and deployed to development
9. `release.yml` runs to analyze commits and determine version bump
10. If version bump needed, GitHub Release is created with tag (vX.Y.Z)
11. QA tests the development environment
12. `deploy-prod.yml` runs with manual approval using the new release tag
13. Production environment is updated

---

## 🎯 Key Technologies Used

- **Orchestration**: GitHub Actions
- **Containerization**: Docker
- **CI/CD Platform**: GitHub
- **Version Control**: Git
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier, TypeScript
- **Security**: Snyk, Trivy, GitHub CodeQL
- **Package Manager**: npm
- **Node.js Version**: v22 (latest LTS)
