import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/app.ts',
    'src/interface/middlewares/**/*.ts',
    'src/shared/utils.ts',
    'src/shared/errors.ts',
    '!src/**/*.d.ts',
    '!tests/**',
    '!src/server.ts',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};

export default config;
