module.exports = {
  testPathIgnorePatterns: [
    `/node_modules/`,
    `__tests__/fixtures`,
    `.cache`,
    `src/test`,
    `src/api`,
  ],
  watchPathIgnorePatterns: ["src/api", ".cache"],
  transform: {
    "^.+\\.[jt]sx?$": `./jest-transformer.js`,
  },
}
