module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": `<rootDir>/jest-transformer.js`,
  },
  moduleNameMapper: {
    "~/(.*)": `<rootDir>/plugin/src/$1`,
  },
  testPathIgnorePatterns: [`node_modules`, `\\.cache`, `<rootDir>.*/public`],
  transformIgnorePatterns: [`node_modules/(?!(gatsby)/)`],
  globals: {
    __PATH_PREFIX__: ``,
  },
  testURL: `http://localhost`,
  setupFiles: [`<rootDir>/loadershim.js`],
  globalSetup: `./test-site/test-utils/global-setup-jest.js`,
  globalTeardown: `./test-site/test-utils/global-teardown-jest.js`,
  setupFilesAfterEnv: [`./test-site/test-utils/jest.setup.js`],
}
