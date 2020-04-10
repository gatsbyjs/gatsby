const pkgDir = require(`pkg-dir`)
const os = require(`os`)
const path = require(`path`)
const uuid = require(`uuid`)
const fs = require(`fs-extra`)

const shadowFile = require(`./shadow-file`)
const resourceTestHelper = require(`../resource-test-helper`)

// Make temp directory to run tests in.
const root = path.join(os.tmpdir(), uuid.v4())
fs.mkdirSync(root)

// TODO finish this. Shadow File isn't yet updated.
describe(`Shadow File resource`, () => {
  test(`e2e shadow file resource test`, async () => {
    await resourceTestHelper({
      resourceModule: shadowFile,
      resourceName: `ShadowFile`,
      context: { root },
      // initialObject: { path: `file.txt`, content },
      // partialUpdate: { content: content + `1` },
    })
  })
})
