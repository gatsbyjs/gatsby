const path = require(`path`)
const execa = require(`execa`)
const mod = require("module")
const fs = require(`fs-extra`)

jest.setTimeout(100000)

const rootPath = path.resolve(__dirname, "../")

describe(`Lmdb regeneration`, () => {
  test(`gatbsy build detects lmdb setup built from source and installs pre-buit package`, async () => {
    // Check the lmdb instance we have installed does have a binary built from source since we need it to reproduce the fix we're trying to test
    // If this check fails then it means our installation mechanism is relying on prebuilt binaries. We must change it to force the compilation from source via node-gyp (check the .npmrc config)
    console.log(
      path.resolve(
        rootPath,
        "node_modules",
        "lmdb",
        "build",
        "Release",
        "lmdb.node"
      )
    )
    const builtFromSource = fs.existsSync(
      path.resolve(
        rootPath,
        "node_modules",
        "lmdb",
        "build",
        "Release",
        "lmdb.node"
      )
    )
    expect(builtFromSource).toEqual(true)
    const options = {
      stderr: `inherit`,
      stdout: `inherit`,
      cwd: rootPath,
    }
    const gatsbyBin = path.resolve(rootPath, `node_modules`, `gatsby`, `cli.js`)
    await execa(gatsbyBin, [`build`], options)

    // lmdb module with prebuilt binaries for our platform
    const lmdbPackage = `@lmdb/lmdb-${process.platform}-${process.arch}`

    // If the fix worked correctly we should have installed the prebuilt binary for our platform
    const lmdbRequire = mod.createRequire(require.resolve(`lmdb`))
    expect(() => {
      lmdbRequire.resolve(lmdbPackage)
    }).not.toThrow()

    // The resulting query-engine bundle should not contain the binary built from source
    const binaryBuiltFromSource = path.resolve(
      rootPath,
      ".cache",
      "query-engine",
      "assets",
      "build",
      "Release",
      "lmdb.node"
    )
    console.log(binaryBuiltFromSource)
    expect(fs.existsSync(binaryBuiltFromSource)).toEqual(false)
  })
})
