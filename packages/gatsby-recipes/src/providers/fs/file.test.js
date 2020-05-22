const file = require(`./file`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = __dirname
const content = `Hello, world!`
const url = `https://gist.githubusercontent.com/KyleAMathews/3d763491e5c4c6396e1a6a626b2793ce/raw/545120bfecbe7b0f97f6f021801bc8b6370b5b41/gistfile1.txt`
const url2 = `https://gist.githubusercontent.com/KyleAMathews/3d763491e5c4c6396e1a6a626b2793ce/raw/545120bfecbe7b0f97f6f021801bc8b6370b5b41/gistfile2.txt`

describe(`file resource`, () => {
  test(`e2e file resource test`, async () => {
    await resourceTestHelper({
      resourceModule: file,
      resourceName: `File`,
      context: { root },
      initialObject: { path: `file.txt`, content },
      partialUpdate: { content: content + `1` },
    })
  })
  test(`e2e remote file resource test`, async () => {
    await resourceTestHelper({
      resourceModule: file,
      resourceName: `File`,
      context: { root },
      initialObject: { path: `file.txt`, content: url },
      partialUpdate: { content: url2 },
    })
  })
})
