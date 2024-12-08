import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
  testEnvironment: 'jsdom',
  setupFiles: [
    'whatwg-fetch',
    './jest.setup.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
     '\\.css$': 'identity-obj-proxy',
  },
  testEnvironmentOptions: {
     customExportConditions: ["node", "node-addons"]
  }
};

export default config;
