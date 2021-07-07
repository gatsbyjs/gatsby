module.exports = {
  snapshotSerializers: [`jest-serializer-path`],
  testPathIgnorePatterns: [
    `/node_modules/`,
    `__tests__/fixtures`,
    `.cache`,
    `src/test`,
  ],
}
