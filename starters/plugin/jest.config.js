// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["src/*.{js,jsx}"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // A set of global variables that need to be available in all test environments
  globals: {
    __PATH_PREFIX__: ``,
  },

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ["node_modules"],

  // The test environment that will be used for testing
  testEnvironment: "node",
}
