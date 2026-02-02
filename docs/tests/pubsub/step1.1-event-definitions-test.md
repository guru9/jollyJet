# Test Analysis: Event Definitions and Types

## Component Information

- **Source File**: [`src/domain/events/index.ts`](../../../src/domain/events/index.ts:1)
- **Analysis File**: [`docs/analysis/pubsub/step1.1-Event-Definitions-and-Types.md`](../../analysis/pubsub/step1.1-Event-Definitions-and-Types.md:1)

---

## Overview

This document provides comprehensive test cases for the Pub/Sub Event Definitions and Types module. The module defines all event types used in the Redis Pub/Sub messaging system, including base event interfaces, specific event types, and utility functions for event generation.

---

## Test Cases

### TC-EVENT-001: BaseEvent Interface Structure Validation

**Objective**: Verify the BaseEvent interface has all required fields with correct types.

**Test Type**: Unit Test

**Input**:

```typescript
const validEvent: BaseEvent = {
  eventId: 'evt_1234567890_abcdef',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date(),
  correlationId: 'req-123',
};
```

**Expected Output**:

- TypeScript compilation succeeds without errors
- All required fields are present
- Optional correlationId is accepted

**Validation Points**:
| Field | Type | Required |
|-------|------|----------|
| eventId | string | Yes |
| eventType | string | Yes |
| timestamp | Date | Yes |
| correlationId | string | No |

---

### TC-EVENT-002: ProductCreatedEvent Structure Validation

**Objective**: Verify ProductCreatedEvent extends BaseEvent with correct payload structure.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductCreatedEvent = {
  eventId: generateEventId(),
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date(),
  correlationId: 'req-456',
  payload: {
    productId: 'prod_123',
    name: 'Wireless Headphones',
    price: 199.99,
    category: 'Electronics',
  },
};
```

**Expected Output**:

- TypeScript compilation succeeds
- Payload contains all required fields: productId, name, price, category
- eventType matches PUBSUB_EVENT_TYPES.PRODUCT_CREATED

**Validation Points**:
| Payload Field | Type | Required |
|--------------|------|----------|
| productId | string | Yes |
| name | string | Yes |
| price | number | Yes |
| category | string | Yes |

---

### TC-EVENT-003: ProductUpdatedEvent Structure Validation

**Objective**: Verify ProductUpdatedEvent extends BaseEvent with changes payload.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductUpdatedEvent = {
  eventId: generateEventId(),
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
  timestamp: new Date(),
  payload: {
    productId: 'prod_123',
    changes: { price: 149.99, stock: 50 },
  },
};
```

**Expected Output**:

- TypeScript compilation succeeds
- Payload contains productId and changes (Record<string, any>)
- Changes object contains only modified fields

**Validation Points**:
| Payload Field | Type | Required |
|--------------|------|----------|
| productId | string | Yes |
| changes | Record<string, any> | Yes |

---

### TC-EVENT-004: ProductDeletedEvent Structure Validation

**Objective**: Verify ProductDeletedEvent extends BaseEvent with minimal payload.

**Test Type**: Unit Test

**Input**:

```typescript
const event: ProductDeletedEvent = {
  eventId: generateEventId(),
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_DELETED,
  timestamp: new Date(),
  payload: {
    productId: 'prod_123',
  },
};
```

**Expected Output**:

- TypeScript compilation succeeds
- Payload contains only productId

**Validation Points**:
| Payload Field | Type | Required |
|--------------|------|----------|
| productId | string | Yes |

---

### TC-EVENT-005: UserActivityEvent Structure Validation

**Objective**: Verify UserActivityEvent extends BaseEvent with audit metadata.

**Test Type**: Unit Test

**Input**:

```typescript
const event: UserActivityEvent = {
  eventId: generateEventId(),
  eventType: PUBSUB_EVENT_TYPES.USER_ACTIVITY,
  timestamp: new Date(),
  correlationId: 'req-789',
  payload: {
    userId: 'user_123',
    action: 'LOGIN_SUCCESS',
    metadata: {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      method: 'POST',
      path: '/api/auth/login',
    },
  },
};
```

**Expected Output**:

- TypeScript compilation succeeds
- Payload contains userId, action, and metadata
- Metadata is a flexible Record<string, any>

**Validation Points**:
| Payload Field | Type | Required |
|--------------|------|----------|
| userId | string | Yes |
| action | string | Yes |
| metadata | Record<string, any> | Yes |

---

### TC-EVENT-006: generateEventId Uniqueness

**Objective**: Verify generateEventId produces unique identifiers.

**Test Type**: Unit Test

**Input**: Call generateEventId() 1000 times

**Expected Output**:

- All 1000 generated IDs are unique
- IDs follow format: `evt_${timestamp}_${random}`
- Timestamp portion is numeric
- Random portion is alphanumeric

**Example Output**:

```
evt_1706784000000_a1b2c3d4e5f6
evt_1706784000001_x7y8z9a0b1c2
```

---

### TC-EVENT-007: AppEvent Union Type Discrimination

**Objective**: Verify AppEvent union type correctly discriminates between event types.

**Test Type**: Unit Test

**Input**:

```typescript
function handleEvent(event: AppEvent): string {
  switch (event.eventType) {
    case PUBSUB_EVENT_TYPES.PRODUCT_CREATED:
      return `Created: ${event.payload.name}`;
    case PUBSUB_EVENT_TYPES.PRODUCT_UPDATED:
      return `Updated: ${Object.keys(event.payload.changes).join(', ')}`;
    case PUBSUB_EVENT_TYPES.PRODUCT_DELETED:
      return `Deleted: ${event.payload.productId}`;
    case PUBSUB_EVENT_TYPES.USER_ACTIVITY:
      return `Activity: ${event.payload.action}`;
    default:
      return 'Unknown';
  }
}
```

**Expected Output**:

- TypeScript correctly narrows types in each case
- No type errors when accessing payload properties
- All event types are handled

---

### TC-EVENT-008: Event Serialization/Deserialization

**Objective**: Verify events can be serialized to JSON and deserialized back.

**Test Type**: Unit Test

**Input**:

```typescript
const originalEvent: ProductCreatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date('2024-01-01T00:00:00Z'),
  payload: {
    productId: 'prod_456',
    name: 'Test Product',
    price: 99.99,
    category: 'Test',
  },
};

const serialized = JSON.stringify(originalEvent);
const deserialized = JSON.parse(serialized);
```

**Expected Output**:

- Serialization produces valid JSON
- All fields are preserved
- Date is serialized as ISO string
- Deserialized object has same structure

**Note**: Date objects will be deserialized as strings and need to be reconstructed.

---

### TC-EVENT-009: Invalid Event Rejection

**Objective**: Verify TypeScript rejects events with missing required fields.

**Test Type**: Unit Test (Negative)

**Input**:

```typescript
// This should cause TypeScript errors
const invalidEvent: ProductCreatedEvent = {
  eventId: 'evt_123',
  // Missing eventType
  timestamp: new Date(),
  payload: {
    productId: 'prod_456',
    // Missing name, price, category
  },
};
```

**Expected Output**:

- TypeScript compilation errors for:
  - Missing eventType
  - Missing name in payload
  - Missing price in payload
  - Missing category in payload

---

### TC-EVENT-010: Event Type Constants Validation

**Objective**: Verify PUBSUB_EVENT_TYPES constants have expected values.

**Test Type**: Unit Test

**Input**: Import and inspect PUBSUB_EVENT_TYPES

**Expected Output**:
| Constant | Expected Value |
|----------|----------------|
| PRODUCT_CREATED | 'PRODUCT_CREATED' |
| PRODUCT_UPDATED | 'PRODUCT_UPDATED' |
| PRODUCT_DELETED | 'PRODUCT_DELETED' |
| USER_ACTIVITY | 'USER_ACTIVITY' |
| BATCH | 'BATCH' |

---

### TC-EVENT-011: Deprecated Exports Still Function

**Objective**: Verify deprecated EVENT_TYPES and EVENT_CHANNELS exports still work.

**Test Type**: Unit Test

**Input**:

```typescript
import { EVENT_TYPES, EVENT_CHANNELS } from '@/domain/events';

const type = EVENT_TYPES.PRODUCT_CREATED;
const channel = EVENT_CHANNELS.PRODUCT;
```

**Expected Output**:

- Imports succeed without errors
- Values match PUBSUB_EVENT_TYPES and PUBSUB_CHANNELS
- No runtime errors

---

### TC-EVENT-012: Event Timestamp Handling

**Objective**: Verify timestamp field accepts Date objects and handles edge cases.

**Test Type**: Unit Test

**Input**:

```typescript
const pastEvent: BaseEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.USER_ACTIVITY,
  timestamp: new Date('2020-01-01'),
  correlationId: 'req-old',
};

const futureEvent: BaseEvent = {
  eventId: 'evt_456',
  eventType: PUBSUB_EVENT_TYPES.USER_ACTIVITY,
  timestamp: new Date('2030-12-31'),
  correlationId: 'req-future',
};
```

**Expected Output**:

- Past dates are accepted
- Future dates are accepted
- Current date (new Date()) is accepted

---

## Integration Test Scenarios

### TC-EVENT-INT-001: Event Flow Through System

**Objective**: Verify events can be created, serialized, and used in Pub/Sub flow.

**Test Type**: Integration Test

**Steps**:

1. Create a ProductCreatedEvent
2. Serialize to JSON
3. Deserialize in subscriber context
4. Type narrow using eventType
5. Access payload properties

**Expected Output**:

- Complete flow succeeds without type errors
- Payload properties accessible after type narrowing

---

## Edge Cases and Error Handling

### TC-EVENT-EDGE-001: Empty Metadata Object

**Objective**: Verify UserActivityEvent accepts empty metadata.

**Input**:

```typescript
const event: UserActivityEvent = {
  eventId: generateEventId(),
  eventType: PUBSUB_EVENT_TYPES.USER_ACTIVITY,
  timestamp: new Date(),
  payload: {
    userId: 'user_123',
    action: 'TEST_ACTION',
    metadata: {},
  },
};
```

**Expected Output**: TypeScript accepts empty metadata object

---

### TC-EVENT-EDGE-002: Empty Changes Object

**Objective**: Verify ProductUpdatedEvent handles empty changes.

**Input**:

```typescript
const event: ProductUpdatedEvent = {
  eventId: generateEventId(),
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
  timestamp: new Date(),
  payload: {
    productId: 'prod_123',
    changes: {},
  },
};
```

**Expected Output**: TypeScript accepts empty changes object

---

### TC-EVENT-EDGE-003: Special Characters in Strings

**Objective**: Verify event fields handle special characters.

**Input**:

```typescript
const event: ProductCreatedEvent = {
  eventId: 'evt_123',
  eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
  timestamp: new Date(),
  payload: {
    productId: 'prod_<>"\'&',
    name: 'Product with <special> "characters" & symbols',
    price: 99.99,
    category: 'Test & Demo',
  },
};
```

**Expected Output**: TypeScript accepts special characters in string fields

---

## Performance Considerations

### TC-EVENT-PERF-001: Event Generation Performance

**Objective**: Measure performance of generateEventId function.

**Test Type**: Performance Test

**Input**: Generate 100,000 event IDs

**Expected Output**:

- Execution time < 100ms
- No duplicate IDs generated
- Memory usage remains stable

---

## Security Considerations

### TC-EVENT-SEC-001: Event ID Format Validation

**Objective**: Verify event IDs don't contain sensitive information.

**Test Type**: Security Test

**Input**: Inspect generated event IDs

**Expected Output**:

- No user data in event ID
- No database IDs in event ID
- Only timestamp and random component

---

## Test File Template

```typescript
// tests/unit/domain/events/index.test.ts
import {
  BaseEvent,
  ProductCreatedEvent,
  ProductUpdatedEvent,
  ProductDeletedEvent,
  UserActivityEvent,
  AppEvent,
  generateEventId,
  PUBSUB_EVENT_TYPES,
  PUBSUB_CHANNELS,
} from '@/domain/events';

describe('Event Definitions', () => {
  describe('TC-EVENT-001: BaseEvent Structure', () => {
    it('should accept valid BaseEvent with all fields', () => {
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: 'TEST_EVENT',
        timestamp: new Date(),
        correlationId: 'req-123',
      };
      expect(event.eventId).toBe('evt_123');
    });

    it('should accept BaseEvent without optional correlationId', () => {
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: 'TEST_EVENT',
        timestamp: new Date(),
      };
      expect(event.correlationId).toBeUndefined();
    });
  });

  describe('TC-EVENT-006: generateEventId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateEventId());
      }
      expect(ids.size).toBe(1000);
    });

    it('should follow correct format', () => {
      const id = generateEventId();
      expect(id).toMatch(/^evt_\d+_[a-z0-9]+$/);
    });
  });

  describe('TC-EVENT-002: ProductCreatedEvent', () => {
    it('should create valid ProductCreatedEvent', () => {
      const event: ProductCreatedEvent = {
        eventId: generateEventId(),
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
        payload: {
          productId: 'prod_123',
          name: 'Test Product',
          price: 99.99,
          category: 'Test',
        },
      };
      expect(event.payload.name).toBe('Test Product');
    });
  });

  describe('TC-EVENT-007: AppEvent Discrimination', () => {
    it('should correctly narrow types in switch statement', () => {
      const events: AppEvent[] = [
        {
          eventId: '1',
          eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
          timestamp: new Date(),
          payload: { productId: '1', name: 'Test', price: 10, category: 'Test' },
        },
        {
          eventId: '2',
          eventType: PUBSUB_EVENT_TYPES.PRODUCT_UPDATED,
          timestamp: new Date(),
          payload: { productId: '1', changes: {} },
        },
      ];

      events.forEach((event) => {
        switch (event.eventType) {
          case PUBSUB_EVENT_TYPES.PRODUCT_CREATED:
            expect(event.payload.name).toBeDefined();
            break;
          case PUBSUB_EVENT_TYPES.PRODUCT_UPDATED:
            expect(event.payload.changes).toBeDefined();
            break;
        }
      });
    });
  });
});
```

---

## Summary

| Test Case    | Description                         | Priority |
| ------------ | ----------------------------------- | -------- |
| TC-EVENT-001 | BaseEvent Interface Structure       | High     |
| TC-EVENT-002 | ProductCreatedEvent Structure       | High     |
| TC-EVENT-003 | ProductUpdatedEvent Structure       | High     |
| TC-EVENT-004 | ProductDeletedEvent Structure       | High     |
| TC-EVENT-005 | UserActivityEvent Structure         | High     |
| TC-EVENT-006 | generateEventId Uniqueness          | High     |
| TC-EVENT-007 | AppEvent Union Type Discrimination  | Medium   |
| TC-EVENT-008 | Event Serialization/Deserialization | Medium   |
| TC-EVENT-009 | Invalid Event Rejection             | Medium   |
| TC-EVENT-010 | Event Type Constants                | Medium   |
| TC-EVENT-011 | Deprecated Exports                  | Low      |
| TC-EVENT-012 | Event Timestamp Handling            | Low      |

---

## Related Documentation

- [Pub/Sub Implementation Plan](../../implementation-plans/14-pubsub-implementation-plan.md)
- [Pub/Sub Task](../../tasks/06-pubsub-task.md)
- [Event Definitions Analysis](../../analysis/pubsub/step1.1-Event-Definitions-and-Types.md)
