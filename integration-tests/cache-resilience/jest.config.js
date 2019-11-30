const path = require(`path`)

module.exports = {
  testPathIgnorePatterns: [`/node_modules/`, `\\.cache`],
  snapshotSerializers: [
    `jest-serializer-path`,
    path.join(__dirname, `utils`, `jest-serializer-omit-undefined`),
  ],
}
