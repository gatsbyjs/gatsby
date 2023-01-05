const path = require(`path`)

module.exports = {
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },
  testPathIgnorePatterns: [`/node_modules/`, `\\.cache`, `test.js`],
  snapshotSerializers: [
    `jest-serializer-path`,
    path.join(__dirname, `utils`, `jest-serializer-omit-undefined`),
  ],
}
