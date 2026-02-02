# Step 2.3: Audit Event Handler - Analysis

## Overview

This document provides detailed analysis for implementing the Audit Event Handler, which processes user activity events for compliance, security monitoring, and audit trails.

## Dependencies

- **Depends on:**
  - Step 1.1: Event Definitions and Types (uses UserActivityEvent)
  - Step 2.1: Event Handler Base Class (extends base class for retry logic)
- **Required by:**
  - Step 3.1: DI Container Registration
  - Step 3.2: Application Bootstrap

## Current State Analysis

### What Exists

- ✅ [`EventHandler<T>`](../../src/domain/services/events/EventHandler.ts) base class with retry logic
- ✅ [`UserActivityEvent`](../../src/domain/events/index.ts:71) interface
- ✅ [`PUBSUB_EVENT_TYPES.USER_ACTIVITY`](../../src/shared/constants.ts:620) constant
- ✅ [`PUBSUB_CHANNELS.AUDIT`](../../src/shared/constants.ts:578) constant
- ✅ [`Logger`](../../src/shared/logger.ts) for structured logging

### What Needs to Be Created

- [`AuditEventHandler`](../../src/domain/services/events/AuditEventHandler.ts) class

## Implementation Requirements

### 1. Audit Logging Responsibilities

- Log all user activities with structured metadata
- Include user ID, action, timestamp, correlation ID
- Support compliance requirements (GDPR, PCI-DSS, etc.)
- Enable security monitoring and anomaly detection

### 2. Log Format

```typescript
{
  eventId: string;
  eventType: 'USER_ACTIVITY';
  timestamp: Date;
  correlationId?: string;
  payload: {
    userId: string;
    action: string;
    metadata: {
      ip?: string;
      userAgent?: string;
      method?: string;
      path?: string;
      // ... other context
    }
  }
}
```

### 3. Supported Actions

- LOGIN_SUCCESS / LOGIN_FAILED
- LOGOUT
- PRODUCT_CREATED / PRODUCT_UPDATED / PRODUCT_DELETED
- WISHLIST_ADD / WISHLIST_REMOVE
- PROFILE_UPDATED
- PASSWORD_CHANGED
- ORDER_CREATED / ORDER_CANCELLED

## Code Structure

### AuditEventHandler

```typescript
@injectable()
export class AuditEventHandler extends EventHandler<UserActivityEvent> {
  protected readonly maxRetries = 3;

  async handle(event: UserActivityEvent): Promise<void> {
    this.logEventReceived(event);

    await this.executeWithRetry(async () => {
      // Structured audit logging
      this.logger.info(
        {
          audit: true,
          eventId: event.eventId,
          userId: event.payload.userId,
          action: event.payload.action,
          timestamp: event.timestamp,
          correlationId: event.correlationId,
          metadata: event.payload.metadata,
        },
        `User activity: ${event.payload.action}`
      );

      // TODO: Store in audit database
      // TODO: Send to SIEM system
      // TODO: Check for suspicious patterns
    }, event.eventId);

    this.logEventSuccess(event);
  }
}
```

## Testing Considerations

### Unit Tests

1. Test audit logging with various action types
2. Test metadata handling
3. Test error scenarios

### Integration Tests

1. Test with actual event flow
2. Test log output format

## Dependencies

- `tsyringe` - Dependency injection
- `pino` - Logging (via Logger)

## Next Steps

After implementing AuditEventHandler:

1. Register handler in DI container (Step 3.1)
2. Subscribe handler to audit channel (Step 3.2)
3. Publish audit events from use cases (Step 3.3)

## References

- [Implementation Plan](../../implementation-plans/14-pubsub-implementation-plan.md)
- [Task File](../../tasks/06-pubsub-task.md)
