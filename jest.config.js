module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '/test/.*\\.test\\.ts$',
  setupFiles: ['core-js'],
  globals: {
    "ts-jest": {
      "tsconfig": "./tsconfig.json"
    }
  }
};
