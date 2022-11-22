module.exports = {
  testPathIgnorePatterns: [
    `/node_modules/`,
    `.cache`,
    `public`,
    `/__tests__/fixtures/`,
    `gatsby-config.js`,
    `gatsby-config.mjs`,
    `gatsby-config.ts`,
  ],
  transform: {
    "^.+\\.[jt]sx?$": `./jest-transformer.js`,
  },
}
