module.exports = {
  testPathIgnorePatterns: [`/node_modules/`, `__tests__/fixtures`, `.cache`],
  transform: { "^.+\\.[jt]sx?$": `<rootDir>/../../jest-transformer.js` },
  testEnvironment: "node",
}
