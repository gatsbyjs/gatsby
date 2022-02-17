module.exports = {
  testPathIgnorePatterns: [`/node_modules/`, `__tests__/fixtures`, `.cache`],
  bail: true,
  moduleNameMapper: {
    "^gatsby-core-utils/(.*)$": `gatsby-core-utils/dist/$1`, // Workaround for https://github.com/facebook/jest/issues/9771
    "^gatsby-plugin-utils/(.*)$": `gatsby-plugin-utils/dist/$1`, // Workaround for https://github.com/facebook/jest/issues/9771
  },
}
