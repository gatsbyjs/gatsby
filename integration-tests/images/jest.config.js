module.exports = {
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },
  testPathIgnorePatterns: [`/node_modules/`, `__tests__/fixtures`, `.cache`],
  transform: {
    "^.+\\.[jt]sx?$": `./jest-transformer.js`,
  },
}
