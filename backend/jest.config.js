/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: [
    '**/src/models/__tests__/**/*.test.ts',
    '**/src/__tests__/**/*.test.ts',
    '**/src/__tests__/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  collectCoverageFrom: [
    'src/models/**/*.ts',
    '!src/models/**/*.d.ts',
    '!src/models/**/__tests__/**',
  ],
};