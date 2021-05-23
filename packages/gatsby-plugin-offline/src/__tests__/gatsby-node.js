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

describe(`onCreateWebpackConfig`, () => {
  const gatsbyNode = rewire(`../gatsby-node`)

  const webpackMock = {
    DefinePlugin: jest.fn(),
  }

  const manifestPluginInstanceMock = { InjectManifest: true }

  const InjectManifestMock = jest
    .fn()
    .mockImplementation(() => manifestPluginInstanceMock)

  gatsbyNode.__set__(`webpack`, webpackMock)
  gatsbyNode.__set__(`InjectManifest`, InjectManifestMock)

  const getConfigMock = jest.fn().mockReturnValue({
    plugins: [],
  })

  const replaceWebpackConfig = jest.fn()
  const actionsMock = {
    replaceWebpackConfig,
  }

  beforeEach(() => {
    replaceWebpackConfig.mockClear()
    getConfigMock.mockClear()
    webpackMock.DefinePlugin.mockClear()
    InjectManifestMock.mockClear()
  })

  it(`should add InjectManifest webpack plugin if stage is build-javascript`, async () => {
    await gatsbyNode.onCreateWebpackConfig(
      {
        stage: `build-javascript`,
        actions: actionsMock,
        getConfig: getConfigMock,
        pathPrefix: `foo`,
      },
      {
        swSrc: `foo-bar.js`,
        dontCacheBustURLsMatching: /foo/,
        modifyURLPrefix: {
          "/": `foo-bar/`,
        },
        chunks: [`foo`, `bar`],
        maximumFileSizeToCacheInBytes: 12,
        manifestTransforms: [],
        additionalManifestEntries: [],
      }
    )

    expect(getConfigMock).toHaveBeenCalledTimes(1)
    expect(InjectManifestMock).toHaveBeenCalledTimes(1)
    expect(webpackMock.DefinePlugin).toHaveBeenCalledTimes(1)
    expect(replaceWebpackConfig).toHaveBeenCalledTimes(1)
    expect(replaceWebpackConfig).toHaveBeenLastCalledWith(
      expect.objectContaining({
        plugins: [manifestPluginInstanceMock],
      })
    )
  })

  it(`shouldn't add InjectManifest webpack plugin if stage is not build-javascript`, async () => {
    await gatsbyNode.onCreateWebpackConfig(
      {
        stage: `build-html`,
        actions: actionsMock,
        getConfig: getConfigMock,
        pathPrefix: `foo`,
      },
      {}
    )

    expect(getConfigMock).not.toHaveBeenCalled()
    expect(InjectManifestMock).not.toHaveBeenCalled()
    expect(webpackMock.DefinePlugin).not.toHaveBeenCalled()
    expect(replaceWebpackConfig).not.toHaveBeenCalled()
  })

  it(`should configure InjectManifest webpack plugin according to user settings`, async () => {
    await gatsbyNode.onCreateWebpackConfig(
      {
        stage: `build-javascript`,
        actions: actionsMock,
        getConfig: getConfigMock,
        pathPrefix: `foo`,
      },
      {
        swSrc: `foo-bar.js`,
        dontCacheBustURLsMatching: /foo/,
        modifyURLPrefix: {
          "/": `foo-bar/`,
        },
        chunks: [`foo`, `bar`],
        maximumFileSizeToCacheInBytes: 12,
        manifestTransforms: [],
        additionalManifestEntries: [],
      }
    )

    expect(InjectManifestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        compileSrc: true,
        swSrc: `foo-bar.js`,
        swDest: `sw.js`,
        dontCacheBustURLsMatching: /foo/,
        modifyURLPrefix: {
          "/": `foo-bar/`,
        },
        chunks: [`app`, `webpack-runtime`, `foo`, `bar`],
        maximumFileSizeToCacheInBytes: 12,
        manifestTransforms: [],
        additionalManifestEntries: [],
      })
    )
  })

  it(`should define __GATSBY_PLUGIN_OFFLINE_SETTINGS according to user settings`, async () => {
    await gatsbyNode.onCreateWebpackConfig(
      {
        stage: `build-javascript`,
        actions: actionsMock,
        getConfig: getConfigMock,
        pathPrefix: `foo`,
      },
      {
        cacheId: `foo`,
        skipWaiting: false,
        clientsClaim: false,
        cleanupOutdatedCaches: false,
        deletePreviousCacheVersionsOnUpdate: true,
        offlineAnalyticsConfig: { foo: `bar` },
      }
    )

    const expectedSettings = {
      cacheId: `foo`,
      directoryIndex: `index.html`,
      skipWaiting: false,
      deletePreviousCacheVersionsOnUpdate: true,
      clientsClaim: false,
      cleanupOutdatedCaches: false,
      offlineAnalyticsConfigString: JSON.stringify({ foo: `bar` }),
    }

    expect(webpackMock.DefinePlugin).toHaveBeenCalledWith(
      expect.objectContaining({
        __GATSBY_PLUGIN_OFFLINE_SETTINGS: JSON.stringify(expectedSettings),
      })
    )
  })
})

describe(`onPostBuild`, () => {
  const swText = `
  const appFile = '%appFile%'
  const pathPrefix = '%pathPrefix%'
  const precachePageResourcesManifestPath = '%precachePageResourcesManifestPath%'
  `
  const gatsbyNode = rewire(`../gatsby-node`)

  const componentChunkName = `chunkName`
  const chunks = [`chunk1`, `chunk2`]

  // Mock webpack.stats.json
  const stats = {
    assetsByChunkName: {
      [componentChunkName]: chunks,
      app: [`app-123.js`],
    },
  }

  // Mock out filesystem functions
  const mockFs = {
    ...fs,
    readFileSync: jest.fn().mockImplementation(file => {
      if (
        file === path.resolve(__dirname, `fixtures/public/webpack.stats.json`)
      ) {
        return JSON.stringify(stats)
      } else if (file === `public/sw.js`) {
        return swText
      } else {
        return fs.readFileSync(file)
      }
    }),
    appendFileSync: jest.fn(),
    writeFileSync: jest.fn(),
  }

  const processMock = {
    cwd: jest.fn().mockReturnValue(path.resolve(__dirname, `fixtures`)),
  }

  gatsbyNode.__set__(`process`, processMock)
  gatsbyNode.__set__(`fs`, mockFs)
  gatsbyNode.__set__(`getResourcesFromHTML`, () => [])
  gatsbyNode.__set__(`console`, {
    log() {},
  })

  const mockDigest = `123`
  const createContentDigestMock = jest.fn().mockReturnValue(`123`)

  const resourcePrecacheManifestFileName = `offline-precache-page-resource-manifest-${mockDigest}.js`

  it(`should emit offline page resource manifest file`, async () => {
    await gatsbyNode.onPostBuild(
      {
        pathPrefix: ``,
        reporter: {
          info(message) {
            console.log(message)
          },
        },
        createContentDigest: createContentDigestMock,
      },
      {
        precachePages: [],
        globPatterns: [],
      }
    )

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      path.resolve(
        __dirname,
        `fixtures/public/${resourcePrecacheManifestFileName}`
      ),
      expect.stringMatching(
        /^self.__GATSBY_PLUGIN_OFFLINE_PRECACHE_PAGE_RESOURCES\s*=\s*\[/
      )
    )
  })

  it(`should replace placeholder strings in generated sw.js`, async () => {
    await gatsbyNode.onPostBuild(
      {
        pathPrefix: `foo`,
        reporter: {
          info(message) {
            console.log(message)
          },
        },
        createContentDigest: createContentDigestMock,
      },
      {
        precachePages: [],
        globPatterns: [],
      }
    )

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      `public/sw.js`,
      expect.stringContaining(`
  const appFile = 'app-123.js'
  const pathPrefix = 'foo'
  const precachePageResourcesManifestPath = '/${resourcePrecacheManifestFileName}'
  `)
    )
  })
})

describe(`pluginOptionsSchema`, () => {
  it(`should provide meaningful errors when fields are invalid`, async () => {
    const expectedErrors = [
      `"precachePages[0]" must be a string`,
      `"precachePages[1]" must be a string`,
      `"precachePages[2]" must be a string`,
      `"swSrc" must be a string`,
      `"globPatterns[0]" must be a string`,
      `"globPatterns[1]" must be a string`,
      `"globPatterns[2]" must be a string`,
      `"modifyURLPrefix./" must be a string`,
      `"cacheId" must be a string`,
      `"dontCacheBustURLsMatching" must be of type object`,
      `"maximumFileSizeToCacheInBytes" must be a number`,
      `"skipWaiting" must be a boolean`,
      `"clientsClaim" must be a boolean`,
      `"manifestTransforms[0]" must be of type function`,
      `"manifestTransforms[1]" must be of type function`,
      `"additionalManifestEntries[0]" must be of type object`,
      `"additionalManifestEntries[1]" must be of type object`,
      `"additionalManifestEntries[2].url" must be a string`,
      `"chunks[0]" must be a string`,
      `"cleanupOutdatedCaches" must be a boolean`,
      `"deletePreviousCacheVersionsOnUpdate" must be a boolean`,
      `"offlineAnalyticsConfig.foo" is not allowed`,
    ]

    const { errors } = await testPluginOptionsSchema(pluginOptionsSchema, {
      precachePages: [1, 2, 3],
      swSrc: 1223,
      globPatterns: [1, 2, 3],
      modifyURLPrefix: {
        "/": 123,
      },
      cacheId: 123,
      dontCacheBustURLsMatching: `This should be a regexp`,
      skipWaiting: `This should be a boolean`,
      clientsClaim: `This should be a boolean`,
      maximumFileSizeToCacheInBytes: `this should be a number`,
      manifestTransforms: [`this should be a function`, 123],
      additionalManifestEntries: [
        `must be a object`,
        123,
        {
          url: 111,
        },
      ],
      chunks: [123],
      cleanupOutdatedCaches: `This should be a boolean`,
      deletePreviousCacheVersionsOnUpdate: `This should be a boolean`,
      offlineAnalyticsConfig: {
        foo: `bar`,
      },
    })

    expect(errors).toEqual(expectedErrors)
  })

  it(`should validate the schema`, async () => {
    const { isValid } = await testPluginOptionsSchema(pluginOptionsSchema, {
      precachePages: [`/about-us/`, `/projects/*`],
      globPatterns: [`a`, `b`, `c`],
      swSrc: `my-sw.js`,
      modifyURLPrefix: {
        "/": `pathPrefix/`,
      },
      cacheId: `gatsby-plugin-offline`,
      dontCacheBustURLsMatching: /(\.js$|\.css$|static\/)/,
      maximumFileSizeToCacheInBytes: 4800,
      skipWaiting: true,
      clientsClaim: true,
      manifestTransforms: [() => `foo`],
      additionalManifestEntries: [
        {
          url: `foo`,
          revision: `bar`,
        },
      ],
      chunks: [`my-chunk`],
      cleanupOutdatedCaches: true,
      deletePreviousCacheVersionsOnUpdate: true,
      offlineAnalyticsConfig: true,
    })

    expect(isValid).toBe(true)
  })
})
