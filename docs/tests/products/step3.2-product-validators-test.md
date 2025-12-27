# Product Validators Test Documentation

## Overview

This document provides detailed information about the test coverage for the product validators in the JollyJet application. The product validators are responsible for validating product-related data using Zod schemas.

---

## Test File Location

The test file for product validators is located at:

[`src/__tests__/unit/products/productValidators.test.ts`](file:///e:/Project/jollyJet/src/__tests__/unit/products/productValidators.test.ts)

---

## Test Coverage Details

### Test Suites

The product validators test file includes the following test suites:

1. **createProductSchema**
2. **updateProductSchema**
3. **productIdSchema**
4. **productFilterSchema**
5. **toggleWishlistStatusSchema**
6. **paginationSchema**

### Total Tests

- **Total Test Suites:** 6
- **Total Tests:** 47

---

## Test Cases

### 1. createProductSchema

This suite tests the validation of product creation data:

- ✅ Valid product creation data
- ✅ Reject product with name too short
- ✅ Reject product with description too short
- ✅ Reject product with negative price
- ✅ Reject product with negative stock
- ✅ Reject product with empty category
- ✅ Accept optional fields when provided
- ✅ Reject invalid image URLs

**Total Tests:** 8

---

### 2. updateProductSchema

This suite tests the validation of product update data:

- ✅ Allow partial updates with valid data
- ✅ Allow updating multiple fields
- ✅ Reject invalid field values when provided
- ✅ Accept empty body for no updates

**Total Tests:** 4

---

### 3. productIdSchema

This suite tests the validation of product ID:

- ✅ Validate valid product ID
- ✅ Reject empty product ID
- ✅ Reject missing product ID

**Total Tests:** 3

---

### 4. productFilterSchema

This suite tests the validation of product filter data:

- ✅ Validate filter with all optional fields
- ✅ Validate filter with only some fields
- ✅ Validate empty filter
- ✅ Reject invalid price range

**Total Tests:** 4

---

### 5. toggleWishlistStatusSchema

This suite tests the validation of wishlist status update data:

- ✅ Validate wishlist status update with valid data
- ✅ Reject missing product ID in wishlist update
- ✅ Reject missing isInWishlist field

**Total Tests:** 3

---

### 6. paginationSchema

This suite tests the validation of pagination parameters:

- ✅ Validate pagination parameters
- ✅ Validate pagination with only skip
- ✅ Validate pagination with only limit
- ✅ Validate empty pagination
- ✅ Reject negative skip value
- ✅ Reject zero limit value

**Total Tests:** 6

---

## Test Summary

| Test Suite                 | Tests  | Description                           |
| -------------------------- | ------ | ------------------------------------- |
| createProductSchema        | 8      | Validates product creation data       |
| updateProductSchema        | 4      | Validates product update data         |
| productIdSchema            | 3      | Validates product ID                  |
| productFilterSchema        | 4      | Validates product filter data         |
| toggleWishlistStatusSchema | 3      | Validates wishlist status update data |
| paginationSchema           | 6      | Validates pagination parameters       |
| **Total**                  | **47** | **Total test cases**                  |

---

## How to Run Tests

To run the product validators tests, use the following command:

```bash
npm test -- src/__tests__/unit/products/productValidators.test.ts
```

---

## Test Coverage

The product validators test file ensures 100% coverage for the following schemas:

- `createProductSchema`
- `updateProductSchema`
- `productIdSchema`
- `productFilterSchema`
- `toggleWishlistStatusSchema`
- `paginationSchema`

---

## Conclusion

The product validators test file provides comprehensive coverage for all product-related validation schemas, ensuring that the application handles product data correctly and reliably.
