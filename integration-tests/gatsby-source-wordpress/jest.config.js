module.exports = {
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },
  testPathIgnorePatterns: [`/node_modules/`, `__tests__/fixtures`, `.cache`],
  bail: true,
  moduleNameMapper: {
    "^gatsby-plugin-utils/(.*)$": [
      `gatsby-plugin-utils/dist/$1`,
      `gatsby-plugin-utils/$1`,
    ], // Workaround for https://github.com/facebook/jest/issues/9771
  },
}
