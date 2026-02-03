---
name: Documentation
about: Documentation updates for feature branches only
title: 'docs: '
labels: documentation
assignees: ''
---

## Documentation Update Guidelines

**IMPORTANT: Documentation updates should only be made in feature branches. Do NOT merge documentation changes directly to main or release branches.**

### When to Create Documentation Issues

- New feature implementation
- Existing feature updates
- Bug fix documentation
- Codebase changes that require documentation updates

### Branch Restrictions

- Documentation updates must be made in feature branches (prefix: `feature/`)
- Do NOT commit documentation changes directly to `main` or `release/v*` branches
- PRs with documentation changes to main or release branches will be rejected

### Required Information

- **Feature Branch Name**:
- **Affected Documentation Files**:
  - [ ] `docs/ci-cd/CI-CD_IMPLEMENTATION_GUIDE.md`
  - [ ] `docs/ci-cd/CI-CD-FILE-STRUCTURE.md`
  - [ ] `docs/ci-cd/RELEASE-BRANCH-GUIDE.md`
  - [ ] `docs/implementation-plans/15-ci-cd-implementation-plan.md`
  - [ ] `docs/JOLLYJET_IMPLEMENTATION_MASTER_GUIDE.md`
  - [ ] Other:

### Changes to be Made

1.
2.
3.

### Testing Instructions

- Verify documentation links
- Check for broken references
- Ensure examples are correct
- Test any code snippets

### Review Process

- Documentation updates must be reviewed and approved
- PR description must include "docs:" prefix
- PR should target only the feature branch
