# Implementation Plan #05 - ESLint v9 Migration

**Plan:** 05-eslint-v9-migration-plan  
**Branch:** `feature/jollyjet-05-eslint-v9-migration`  
**Status:** ✅ Completed

---

## Overview

This phase migrates the project from ESLint v8 to ESLint v9, adopting the new flat configuration format and updating all related dependencies.

---

## Folder Structure Changes

```
jollyJet/
├── eslint.config.mjs                 # ✅ NEW - ESLint v9 flat config
├── .eslintrc.json                    # ✅ DELETED - Old ESLint config
│
├── package.json                      # ✅ MODIFIED - Updated ESLint dependencies
│
└── src/
    ├── shared/
    │   ├── utils.ts                  # ✅ MODIFIED - Fixed escape characters
    │   └── errors.ts                 # ✅ MODIFIED - Fixed self-assignments
    │
    └── (other files)                 # ✅ MODIFIED - Fixed linting issues
```

**Files Added**:

- `eslint.config.mjs` - New ESLint v9 flat configuration

**Files Deleted**:

- `.eslintrc.json` - Old ESLint configuration (replaced)

**Files Modified**:

- `package.json` - Updated to ESLint v9, typescript-eslint v8
- `src/shared/utils.ts` - Fixed unnecessary escape characters
- `src/shared/errors.ts` - Fixed redundant self-assignments
- Various source files - Fixed linting issues

---

## Proposed Changes

### ✅ NEW: `eslint.config.mjs`

```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
    },
  },
  {
    ignores: ['node_modules', 'dist', 'coverage', '*.config.js'],
  }
);
```

---

### ✅ DELETED: `.eslintrc.json`

The old ESLint configuration file is removed and replaced with the new flat config format.

---

### ✅ MODIFIED: `package.json`

**Updated Dependencies**:

```json
{
  "devDependencies": {
    "eslint": "^9.39.1",
    "@eslint/js": "^9.39.1",
    "typescript-eslint": "^8.48.1",
    "eslint-config-prettier": "^10.1.8"
  }
}
```

**Note**: Removed old packages:

- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`

**Added to package.json**:

```json
{
  "type": "module"
}
```

---

### ✅ MODIFIED: `src/shared/utils.ts`

**Fixed**: Removed unnecessary escape characters in regex

**Before**:

```typescript
export const sanitizeString = (str: string): string => {
  return str.replace(/[\<\>]/g, '');
};
```

**After**:

```typescript
export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, '');
};
```

---

### ✅ MODIFIED: `src/shared/errors.ts`

**Fixed**: Removed redundant self-assignments

**Before**:

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.message = message; // Redundant
    this.statusCode = statusCode; // Redundant
    this.isOperational = isOperational; // Redundant
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**After**:

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

---

## Migration Steps

### 1. Update Dependencies

```bash
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev eslint@^9.39.1 @eslint/js@^9.39.1 typescript-eslint@^8.48.1 eslint-config-prettier@^10.1.8
```

### 2. Add Module Type

Add to `package.json`:

```json
{
  "type": "module"
}
```

### 3. Delete Old Config

```bash
rm .eslintrc.json
```

### 4. Create New Config

Create `eslint.config.mjs` with the flat config format (see above).

### 5. Run Linter

```bash
npm run lint
```

### 6. Fix Issues

```bash
npm run lint:fix
```

---

## Verification Plan

### 1. Install Dependencies

```bash
npm install
```

### 2. Verify ESLint Version

```bash
npx eslint --version
```

Expected: `v9.x.x`

### 3. Run Linter

```bash
npm run lint
```

Should show no errors (or list remaining issues).

### 4. Auto-fix Issues

```bash
npm run lint:fix
```

### 5. Test in Development

```bash
npm run dev
```

Server should start without linting errors.

---

## Key Changes in ESLint v9

### Flat Config Format

- Uses `eslint.config.mjs` instead of `.eslintrc.json`
- Configuration is now JavaScript/TypeScript
- More flexible and type-safe

### New Package Structure

- `@eslint/js` for core rules
- `typescript-eslint` (unified package)
- Simpler dependency management

### Module Type

- Requires `"type": "module"` in `package.json`
- Uses ES modules by default

---

## Common Issues and Fixes

### MODULE_TYPELESS_PACKAGE_JSON

**Solution**: Add `"type": "module"` to `package.json`

### Unnecessary Escape Characters

**Solution**: Remove backslashes before `<` and `>` in regex

### Redundant Self-Assignments

**Solution**: Remove assignments that reassign constructor parameters

---

## Next Steps

- [ ] Configure additional custom rules
- [ ] Add ESLint plugins as needed
- [ ] Set up pre-commit hooks
- [ ] Document linting standards
- [ ] Train team on new config format

---

## Status

✅ ESLint v9 installed  
✅ Flat config created  
✅ Old config removed  
✅ Dependencies updated  
✅ Linting issues fixed  
✅ Module type configured

**Phase 05 Complete!** 🎉



