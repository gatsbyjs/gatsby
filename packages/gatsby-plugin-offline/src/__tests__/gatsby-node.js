import { testPluginOptionsSchema } from "gatsby-plugin-utils"
import { pluginOptionsSchema } from "../gatsby-node"
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

    writeFileSync(file, text) {
      swText = text
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

  it(`configures the Workbox debug option`, async () => {
    swText = `workbox.setConfig({modulePathPrefix: "workbox-v4.3.1"});`

    await gatsbyNode.onPostBuild(
      {
        pathPrefix: ``,
        reporter: {
          info(message) {
            console.log(message)
          },
        },
      },
      { debug: true }
    )

    expect(swText).toContain(`debug: true`)
  })
})

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [
      `"precachePages[0]" must be a string`,
      `"precachePages[1]" must be a string`,
      `"precachePages[2]" must be a string`,
      `"appendScript" must be a string`,
      `"debug" must be a boolean`,
      `"workboxConfig.importWorkboxFrom" must be a string`,
      `"workboxConfig.globDirectory" must be a string`,
      `"workboxConfig.globPatterns[0]" must be a string`,
      `"workboxConfig.globPatterns[1]" must be a string`,
      `"workboxConfig.globPatterns[2]" must be a string`,
      `"workboxConfig.modifyURLPrefix./" must be a string`,
      `"workboxConfig.cacheId" must be a string`,
      `"workboxConfig.dontCacheBustURLsMatching" must be of type object`,
      `"workboxConfig.runtimeCaching[0].handler" must be one of [StaleWhileRevalidate, CacheFirst, NetworkFirst, NetworkOnly, CacheOnly]`,
      `"workboxConfig.runtimeCaching[1]" must be of type object`,
      `"workboxConfig.runtimeCaching[2]" must be of type object`,
      `"workboxConfig.skipWaiting" must be a boolean`,
      `"workboxConfig.clientsClaim" must be a boolean`,
    ]

    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        precachePages: [1, 2, 3],
        appendScript: 1223,
        debug: `This should be a boolean`,
        workboxConfig: {
          importWorkboxFrom: 123,
          globDirectory: 456,
          globPatterns: [1, 2, 3],
          modifyURLPrefix: {
            "/": 123,
          },
          cacheId: 123,
          dontCacheBustURLsMatching: `This should be a regexp`,
          runtimeCaching: [
            {
              urlPattern: /(\.js$|\.css$|static\/)/,
              handler: `Something Invalid`,
            },
            2,
            3,
          ],
          skipWaiting: `This should be a boolean`,
          clientsClaim: `This should be a boolean`,
        },
      }
    )

    expect(isValid).toBe(false)
    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate the schema`, async () => {
    const { isValid, errors } = await testPluginOptionsSchema(
      pluginOptionsSchema,
      {
        precachePages: [`/about-us/`, `/projects/*`],
        appendScript: `src/custom-sw-code.js`,
        debug: true,
        workboxConfig: {
          importWorkboxFrom: `local`,
          globDirectory: `rootDir`,
          globPatterns: [`a`, `b`, `c`],
          modifyURLPrefix: {
            "/": `pathPrefix/`,
          },
          cacheId: `gatsby-plugin-offline`,
          dontCacheBustURLsMatching: /(\.js$|\.css$|static\/)/,
          maximumFileSizeToCacheInBytes: 4800,
          runtimeCaching: [
            {
              urlPattern: /(\.js$|\.css$|static\/)/,
              handler: `CacheFirst`,
            },
            {
              urlPattern: /^https?:.*\/page-data\/.*\.json/,
              handler: `StaleWhileRevalidate`,
            },
            {
              urlPattern:
                /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
              handler: `StaleWhileRevalidate`,
            },
            {
              urlPattern: /^https?:\/\/fonts\.googleapis\.com\/css/,
              handler: `StaleWhileRevalidate`,
            },
          ],
          skipWaiting: true,
          clientsClaim: true,
        },
      }
    )

    expect(isValid).toBe(true)
    expect(errors).toEqual([])
  })
})
