module.exports = {
  testPathIgnorePatterns: [
    `/node_modules/`,
    `__tests__/fixtures`,
    `.cache`,
    `src/test`,
  ],
  // transform: {
  //   "^.+\\.[jt]sx?$": `<rootDir>../../jest-transformer.js`,
  // },
  // moduleNameMapper: {
  //   "\\.(css)$": `<rootDir>/__mocks__/styleMock.js`,
  // },
}
