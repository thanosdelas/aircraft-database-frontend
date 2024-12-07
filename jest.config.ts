import type { Config } from 'jest';
// import 'whatwg-fetch';

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
  setupFiles: ['whatwg-fetch'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
