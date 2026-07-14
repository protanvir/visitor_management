/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/apps"],
  testMatch: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/apps/api/src/$1",
    "^@vms/shared$": "<rootDir>/packages/shared/src",
  },
  collectCoverageFrom: [
    "apps/api/src/**/*.ts",
    "!apps/api/src/**/*.d.ts",
    "!apps/api/src/**/*.test.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterSetup: [],
  testTimeout: 30000,
};
