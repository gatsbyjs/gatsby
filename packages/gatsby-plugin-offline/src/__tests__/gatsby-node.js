const rewire = require(`rewire`)
const fs = require(`fs`)
const path = require(`path`)

describe(`getPrecachePages`, () => {
  const gatsbyNode = rewire(`../gatsby-node`)
  const getPrecachePages = gatsbyNode.__get__(`getPrecachePages`)

  it(`correctly matches pages`, () => {
    const base = `${__dirname}/fixtures/public`

    const allPages = getPrecachePages([`**/*`], base)
    expect(allPages.map(page => path.normalize(page))).toMatchSnapshot()

    const dir1Pages = getPrecachePages([`/dir1/*`], base)
    expect(dir1Pages.map(page => path.normalize(page))).toMatchSnapshot()
  })
})

describe(`onPostBuild`, () => {
  let swText = ``
  const gatsbyNode = rewire(`../gatsby-node`)

  const componentChunkName = `chunkName`
  const chunks = [`chunk1`, `chunk2`]

  // Mock webpack.stats.json
  const stats = {
    assetsByChunkName: {
      [componentChunkName]: chunks,
    },
  }

  // Mock out filesystem functions
  const mockFs = {
    ...fs,

    readFileSync(file) {
      if (file === `${process.cwd()}/public/webpack.stats.json`) {
        return JSON.stringify(stats)
      } else if (file === `public/sw.js`) {
        return swText
      } else if (file.match(/\/sw-append\.js/)) {
        return ``
      } else {
        return fs.readFileSync(file)
      }
    },

    appendFileSync(file, text) {
      swText += text
    },

    createReadStream() {
      return { pipe() {} }
    },

    createWriteStream() {},
  }

  const mockWorkboxBuild = {
    generateSW() {
      return Promise.resolve({ count: 1, size: 1, warnings: [] })
    },
  }

  gatsbyNode.__set__(`fs`, mockFs)
  gatsbyNode.__set__(`getResourcesFromHTML`, () => [])
  gatsbyNode.__set__(`workboxBuild`, mockWorkboxBuild)
  gatsbyNode.__set__(`console`, { log() {} })

  it(`appends to sw.js`, async () => {
    await gatsbyNode.onPostBuild(
      {
        pathPrefix: ``,
        reporter: {
          info(message) {
            console.log(message)
          },
        },
      },
      { appendScript: `${__dirname}/fixtures/custom-sw-code.js` }
    )

    expect(swText).toContain(`console.log(\`Hello, world!\`)`)
  })
})
