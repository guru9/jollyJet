# Implementation Plan #02 - Prettier & ESLint Setup

**Plan:** 02-prettier-eslint-setup-plan  
**Branch:** `feature/jollyjet-02-prettier-eslint-setup`  
**Status:** ✅ Completed

---

## Overview

This phase implements code formatting with Prettier and linting with ESLint to ensure consistent code quality and style across the JollyJet project.

---

## Folder Structure Changes

```
jollyJet/
├── .prettierrc                       # ✅ NEW - Prettier configuration
├── .prettierignore                   # ✅ NEW - Prettier ignore rules
├── .eslintrc.json                    # ✅ NEW - ESLint configuration
├── .eslintignore                     # ✅ NEW - ESLint ignore rules
│
└── package.json                      # ✅ MODIFIED - Added dev dependencies and scripts
```

**Files Added**:

- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to ignore for formatting
- `.eslintrc.json` - ESLint linting rules
- `.eslintignore` - Files to ignore for linting

**Files Modified**:

- `package.json` - Added prettier, eslint, and related scripts

---

## Proposed Changes

### ✅ NEW: `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

### ✅ NEW: `.prettierignore`

```
node_modules
dist
coverage
*.min.js
*.min.css
package-lock.json
```

---

### ✅ NEW: `.eslintrc.json`

```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn"
  }
}
```

---

### ✅ NEW: `.eslintignore`

```
node_modules
dist
coverage
*.config.js
```

---

### ✅ MODIFIED: `package.json`

**Added Scripts**:

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,js,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,js,json}\"",
    "lint": "eslint \"src/**/*.{ts,js}\"",
    "lint:fix": "eslint \"src/**/*.{ts,js}\" --fix",
    "predev": "npm run format"
  }
}
```

**Added Dev Dependencies**:

```json
{
  "devDependencies": {
    "prettier": "^3.7.4",
    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint-config-prettier": "^9.1.0"
  }
}
```

---

## Verification Plan

### 1. Install Dependencies

```bash
npm install
```

### 2. Format Code

```bash
npm run format
```

Expected output:

```
src/app.ts 50ms
src/server.ts 30ms
...
```

### 3. Check Formatting

```bash
npm run format:check
```

Should show "All matched files use Prettier code style!"

### 4. Run Linter

```bash
npm run lint
```

Should show no errors or warnings (or list issues to fix).

### 5. Auto-fix Linting Issues

```bash
npm run lint:fix
```

### 6. Test Pre-dev Hook

```bash
npm run dev
```

Should automatically format code before starting the server.

---

## Configuration Details

### Prettier Rules

- **semi**: Add semicolons
- **singleQuote**: Use single quotes
- **printWidth**: 100 characters max
- **tabWidth**: 2 spaces
- **trailingComma**: ES5 compatible
- **arrowParens**: Always use parentheses
- **endOfLine**: LF (Unix-style)

### ESLint Rules

- **no-unused-vars**: Error on unused variables
- **no-explicit-any**: Warn on `any` type usage
- **no-console**: Warn on console statements
- Extends TypeScript recommended rules
- Compatible with Prettier

---

## IDE Integration

### VS Code

Install extensions:

- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Troubleshooting

### Prettier and ESLint Conflicts

Ensure `eslint-config-prettier` is installed and in extends array.

### Format on Save Not Working

1. Check VS Code settings
2. Verify Prettier extension is enabled
3. Check `.prettierrc` is valid JSON

### ESLint Errors

Run `npm run lint:fix` to auto-fix most issues.

---

## Next Steps

- [ ] Configure pre-commit hooks with Husky
- [ ] Add lint-staged for staged files only
- [ ] Configure editor settings for team
- [ ] Document code style guidelines
- [ ] Add custom ESLint rules as needed

---

## Status

✅ Prettier installed and configured  
✅ ESLint installed and configured  
✅ Format and lint scripts added  
✅ Pre-dev formatting hook added  
✅ Ignore files configured

**Phase 02 Complete!** 🎉



