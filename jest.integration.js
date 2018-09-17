module.exports = {
  notify: true,
  roots: [`<rootDir>/integration-tests`],
  testPathIgnorePatterns: [
    `/examples/`,
    `/www/`,
    `/dist/`,
    `/node_modules/`,
    `__tests__/fixtures`,
  ],
  transform: { "^.+\\.js$": `<rootDir>/jest-transformer.js` },
  verbose: true,
  // TODO: Remove this once https://github.com/facebook/jest/pull/6792 is released.
  // Probably in Jest 23.4.3
  testURL: `http://localhost`,
}
