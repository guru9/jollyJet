# Release Branch Management Guide

## Overview

This guide provides a comprehensive framework for managing release branches in the JollyJet project. It includes branch creation guidelines, protection rules, and CI/CD pipeline behavior for release branches.

## Branch Structure

### Branch Types

1. **Main Branch (`main`)**
   - Primary production-ready branch
   - Only release branches can merge to main
   - Protected with strict rules

2. **Release Branches (`release/vX.Y.Z`)**
   - Created from develop for release preparation
   - Only bug fixes allowed after creation
   - Can merge to main
   - Can get bumped versions through release pipeline

3. **Develop Branch (`develop`)**
   - Integration branch for features
   - Features are merged into develop from feature branches
   - Release branches are created from develop

4. **Feature Branches (`feature/*`)**
   - Feature development branches
   - Created from develop
   - Merged back to develop

## Branch Protection Rules

### Main Branch Protection

**Required Settings:**

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require signed commits (optional but recommended)
- ✅ Do not allow bypassing the above settings

**Required Status Checks:**

- CI/CD Pipeline (ci.yml)
- Security Scan (security-scan.yml)
- Code Quality (code-quality.yml)
- Release Branch Validation (release-branch-validation.yml)

**Restrictions on Who Can Merge:**

- Only release managers
- Only release branches allowed to merge

### Release Branch Protection

**Required Settings:**

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Branch name pattern: `release/v[0-9]+.[0-9]+.[0-9]+`
- ✅ Do not allow deletion

**Required Status Checks:**

- CI/CD Pipeline (ci.yml)
- Security Scan (security-scan.yml)
- Code Quality (code-quality.yml)

## Creating a Release Branch

### Step-by-Step Guide

1. **Checkout Develop Branch**

   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create Release Branch**

   ```bash
   # For version 1.0.0
   git checkout -b release/v1.0.0
   git push origin release/v1.0.0
   ```

3. **Update Package Version** (Optional)

   ```bash
   npm version 1.0.0 --no-git-tag-version
   git add package.json
   git commit -m "build: bump version to 1.0.0"
   git push origin release/v1.0.0
   ```

4. **Start Release Pipeline**
   Go to GitHub Actions and manually trigger the `release.yml` workflow with:
   - Branch: `release/v1.0.0`
   - Force Bump: `none` (or select if manual bump needed)
   - Release Notes: Custom release notes

## Merging to Main

### Pre-Merge Requirements

1. **All Tests Pass**
   - All CI/CD status checks green
   - No failing tests
   - Security scan passes

2. **Code Reviews Complete**
   - Minimum 2 approvals
   - No change requests

3. **Documentation Updated**
   - Release notes added
   - CHANGELOG.md updated
   - Documentation files reviewed

### Merge Process

1. **Create Pull Request**
   - From: `release/vX.Y.Z`
   - To: `main`
   - Title: `Release vX.Y.Z`
   - Description: Include release notes and changes

2. **Review and Approve**
   - Team members review the PR
   - Release manager approves

3. **Merge to Main**
   - Squash and merge (recommended)
   - Commit message: `Release vX.Y.Z`

4. **Create GitHub Release**
   The `release.yml` workflow will automatically:
   - Create a release tag
   - Generate release notes
   - Publish to npm (if configured)

## Release Branch Workflow

### Automated Behavior

**On Release Branch Creation:**

- CI/CD pipeline runs automatically
- Version bump detection based on commits
- Pre-release checks

**On Push to Release Branch:**

- CI/CD pipeline runs
- Quality gates check
- Security scan
- If version bump detected, release pipeline triggers

### Manual Release Trigger

**Steps:**

1. Go to GitHub Actions
2. Select `Release Version Bump and Tag` workflow
3. Click "Run workflow"
4. Select the release branch
5. Optional: Force bump type and release notes
6. Click "Run workflow"

## Bug Fixes on Release Branches

### Process

1. **Create Hotfix Branch**

   ```bash
   git checkout release/v1.0.0
   git checkout -b hotfix/v1.0.1
   ```

2. **Fix the Issue**
   - Make minimal changes to fix the bug
   - Write tests for the fix
   - Commit changes

3. **Merge to Release Branch**
   - Create PR from hotfix branch to release branch
   - Review and approve
   - Merge to release branch

4. **Bump Version**
   The CI/CD pipeline will automatically detect the fix and bump to patch version

## Rollback Process

### If Merge to Main Not Yet Done

1. **Abort Release**
   - Close the PR without merging
   - Delete the release branch

2. **Revert Changes**
   - Create a revert PR if changes were pushed

### If Already Merged to Main

1. **Create Hotfix Branch**

   ```bash
   git checkout main
   git checkout -b hotfix/v1.0.1
   ```

2. **Revert or Fix**
   - Either revert the problematic commit
   - Or fix the issue

3. **Merge to Main**
   - Create PR with appropriate testing
   - Release as a patch version

## Release Versioning

### Semantic Versioning

All releases follow Semantic Versioning (SemVer):

- **MAJOR**: Incompatible API changes
- **MINOR**: New features with backward compatibility
- **PATCH**: Bug fixes with backward compatibility

### Version Bump Detection

The release pipeline automatically determines the bump type:

- **MAJOR**: Contains "BREAKING CHANGE" or "!:" in commit messages
- **MINOR**: Contains "feat" or "feature" in commit messages
- **PATCH**: Contains "fix" or "bug" in commit messages
- **NO BUMP**: No version bump if no significant changes

### Manual Bump

For release branches, you can manually select the bump type when triggering the workflow:

- `none`: No bump (default)
- `patch`: Bump patch version
- `minor`: Bump minor version
- `major`: Bump major version

## Best Practices

### Release Branch Guidelines

1. **Create Early**: Create release branches early to avoid last-minute issues
2. **Keep Clean**: Only bug fixes after branch creation
3. **Test Thoroughly**: Run full test suite before merging
4. **Communicate**: Notify team members about release progress
5. **Document**: Update documentation and release notes

### Merge Window

- Only merge to main during working hours
- Avoid Friday afternoon releases
- Have rollback plan ready

### Release Notes

Include:

- Summary of changes
- Breaking changes
- New features
- Bug fixes
- Dependency updates
