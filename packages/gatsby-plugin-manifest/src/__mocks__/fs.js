const fs = jest.genMockFromModule(`fs`)

fs.__setWriteFileSyncFn = fn => (fs.writeFileSync = fn)

module.exports = fs
