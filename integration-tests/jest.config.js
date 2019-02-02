module.exports = {
  rootDir: `../`,
  roots: [`<rootDir>/integration-tests`],
  testPathIgnorePatterns: [
    `/examples/`,
    `/www/`,
    `/dist/`,
    `/.cache/`,
    `/node_modules/`,
    `__tests__/fixtures`,
  ],
  transform: { "^.+\\.js$": `<rootDir>/jest-transformer.js` },
}
