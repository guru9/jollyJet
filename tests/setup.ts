import { DI_TOKENS } from '@/shared/constants';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import 'reflect-metadata';
import { container } from 'tsyringe';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Register DI mocks for decorators and services
  container.registerInstance(DI_TOKENS.LOGGER, {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
    trace: jest.fn(),
  });

  container.registerInstance(DI_TOKENS.REDIS_SERVICE, {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    acquireLock: jest.fn().mockResolvedValue(true),
    releaseLock: jest.fn().mockResolvedValue(undefined),
    isConnected: jest.fn().mockReturnValue(true),
    getClient: jest.fn().mockReturnValue({
      ttl: jest.fn().mockResolvedValue(3600),
      pipeline: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    }),
  });

  // Dynamic import to avoid issues with reflect-metadata and decorators at top-level
  const { CacheConsistencyService } =
    await import('@/domain/services/cache/CacheConsistencyService');

  // Create a complete mock for CacheConsistencyService
  const cacheConsistencyMock = {
    trackCacheHit: jest.fn(),
    trackCacheMiss: jest.fn(),
    trackStaleRead: jest.fn(),
    trackConsistencyError: jest.fn(),
    checkStaleData: jest
      .fn()
      .mockResolvedValue({ isStale: false, ttl: 3600, age: 0, threshold: 3600 }),
    refreshAhead: jest.fn().mockResolvedValue({}),
    getMetrics: jest.fn().mockReturnValue({
      cacheHits: 0,
      cacheMisses: 0,
      staleReads: 0,
      consistencyErrors: 0,
      hitRate: 0,
      consistencyScore: 100,
      totalOperations: 0,
      lastCheckTime: undefined,
    }),
    forceRefresh: jest.fn().mockResolvedValue({}),
    invalidatePattern: jest.fn().mockResolvedValue(0),
    getPerformanceStats: jest.fn().mockReturnValue({
      hitRate: 0,
      consistencyScore: 100,
      totalOperations: 0,
    }),
    resetMetrics: jest.fn(),
    cleanup: jest.fn(),
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  container.registerInstance(CacheConsistencyService, cacheConsistencyMock);

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 30000); // Increased timeout to 30 seconds

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
