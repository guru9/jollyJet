import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/app.ts',
    'src/interface/middlewares/**/*.ts',
    'src/shared/utils.ts',
    'src/shared/errors.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/server.ts',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};

export default config;



