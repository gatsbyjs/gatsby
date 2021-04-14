const path = require(`path`)

module.exports = {
  testPathIgnorePatterns: [`/node_modules/`, `\\.cache`, `test.js`],
  snapshotSerializers: [
    `jest-serializer-path`,
    path.join(__dirname, `utils`, `jest-serializer-omit-undefined`),
  ],
}
