const { onPostBuild } = require(`../gatsby-node`)
const fs = require(`fs`)

jest.mock(`fs`)
jest.mock(`../get-resources-from-html`, () => () => [])

let swText = ``

jest.mock(`workbox-build`, () => {
  return {
    generateSW() {
      return Promise.resolve({ count: 1, size: 1, warnings: [] })
    },
  }
})

describe(`onPostBuild`, () => {
  const componentChunkName = `chunkName`
  const chunks = [`chunk1`, `chunk2`]

  // Mock webpack.stats.json
  const stats = {
    assetsByChunkName: {
      [componentChunkName]: chunks,
    },
  }

  // Mock out filesystem functions
  fs.readFileSync.mockImplementation(file => {
    if (file === `${process.cwd()}/public/webpack.stats.json`) {
      return JSON.stringify(stats)
    } else if (file === `public/sw.js`) {
      return swText
    } else if (file.match(/\/sw-append\.js/)) {
      return ``
    } else {
      return jest.requireActual(`fs`).readFileSync(file)
    }
  })

  fs.appendFileSync.mockImplementation((file, text) => {
    swText += text
  })

  fs.createReadStream.mockImplementation(() => {
    return { pipe() {} }
  })

  fs.createWriteStream.mockImplementation(() => {})

  it(`appends to sw.js`, async () => {
    await onPostBuild(
      { pathPrefix: `` },
      { appendScript: `${__dirname}/fixtures/custom-sw-code.js` }
    )

    expect(swText).toContain(`console.log(\`Hello, world!\`)`)
  })
})
