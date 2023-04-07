module.exports = {
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },
  snapshotSerializers: [`jest-serializer-path`],
  testPathIgnorePatterns: [
    `/node_modules/`,
    `__tests__/fixtures`,
    `.cache`,
    `src/test`,
  ],
}
