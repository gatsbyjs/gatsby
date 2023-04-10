/** @type {import('jest').Config} */
const config = {
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  snapshotSerializers: [`jest-serializer-path`],
}

module.exports = config
