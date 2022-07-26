import buildHeadersProgram from "../build-headers-program"
import * as path from "path"
import * as os from "os"
import * as fs from "fs-extra"
import { DEFAULT_OPTIONS, HEADERS_FILENAME } from "../constants"

jest.mock(`fs-extra`, () => {
  return {
    ...jest.requireActual(`fs-extra`),
    existsSync: jest.fn(),
  }
})

describe(`build-headers-program`, () => {
  beforeEach(() => {
    fs.existsSync.mockClear()
    fs.existsSync.mockReturnValue(true)
  })

  const createPluginData = async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `gatsby-plugin-gatsby-cloud-`)
    )

    return {
      components: new Map([
        [
          1,
          {
            componentChunkName: `component---node-modules-gatsby-plugin-offline-app-shell-js`,
          },
        ],
        [
          2,
          {
            componentChunkName: `component---src-templates-blog-post-js`,
          },
        ],
        [
          3,
          {
            componentChunkName: `component---src-pages-404-js`,
          },
        ],
        [
          4,
          {
            componentChunkName: `component---src-pages-index-js`,
          },
        ],
      ]),
      pages: new Map([
        [
          `/offline-plugin-app-shell-fallback/`,
          {
            jsonName: `offline-plugin-app-shell-fallback-a30`,
            internalComponentName: `ComponentOfflinePluginAppShellFallback`,
            path: `/offline-plugin-app-shell-fallback/`,
            matchPath: undefined,
            componentChunkName: `component---node-modules-gatsby-plugin-offline-app-shell-js`,
            isCreatedByStatefulCreatePages: false,
            context: {},
            updatedAt: 1557740602268,
            pluginCreator___NODE: `63e5f7ff-e5f1-58f7-8e2c-55872ac42281`,
            pluginCreatorId: `63e5f7ff-e5f1-58f7-8e2c-55872ac42281`,
          },
        ],
        [
          `/hi-folks/`,
          {
            jsonName: `hi-folks-a2b`,
            internalComponentName: `ComponentHiFolks`,
            path: `/hi-folks/`,
            matchPath: undefined,
            componentChunkName: `component---src-templates-blog-post-js`,
            isCreatedByStatefulCreatePages: false,
            context: {},
            updatedAt: 1557740602330,
            pluginCreator___NODE: `7374ebf2-d961-52ee-92a2-c25e7cb387a9`,
            pluginCreatorId: `7374ebf2-d961-52ee-92a2-c25e7cb387a9`,
          },
        ],
        [
          `/my-second-post/`,
          {
            jsonName: `my-second-post-2aa`,
            internalComponentName: `ComponentMySecondPost`,
            path: `/my-second-post/`,
            matchPath: undefined,
            componentChunkName: `component---src-templates-blog-post-js`,
            isCreatedByStatefulCreatePages: false,
            context: {},
            updatedAt: 1557740602333,
            pluginCreator___NODE: `7374ebf2-d961-52ee-92a2-c25e7cb387a9`,
            pluginCreatorId: `7374ebf2-d961-52ee-92a2-c25e7cb387a9`,
          },
        ],
        [
          `/hello-world/`,
          {
            jsonName: `hello-world-8bc`,
            internalComponentName: `ComponentHelloWorld`,
            path: `/hello-world/`,
            matchPath: undefined,
            componentChunkName: `component---src-templates-blog-post-js`,
            isCreatedByStatefulCreatePages: false,
            context: {},
            updatedAt: 1557740602335,
            pluginCreator___NODE: `7374ebf2-d961-52ee-92a2-c25e7cb387a9`,
            pluginCreatorId: `7374ebf2-d961-52ee-92a2-c25e7cb387a9`,
          },
        ],
        [
          `/404/`,
          {
            jsonName: `404-22d`,
            internalComponentName: `Component404`,
            path: `/404/`,
            matchPath: undefined,
            componentChunkName: `component---src-pages-404-js`,
            isCreatedByStatefulCreatePages: true,
            context: {},
            updatedAt: 1557740602358,
            pluginCreator___NODE: `049c1cfd-95f7-5555-a4ac-9b396d098b26`,
            pluginCreatorId: `049c1cfd-95f7-5555-a4ac-9b396d098b26`,
          },
        ],
        [
          `/test/`,
          {
            jsonName: `test`,
            internalComponentName: `ComponentTest`,
            path: `/test/`,
            matchPath: undefined,
            componentChunkName: `component---src-pages-test-js`,
            isCreatedByStatefulCreatePages: true,
            context: {},
            updatedAt: 1557740602361,
            pluginCreator___NODE: `049c1cfd-95f7-5555-a4ac-9b396d098b26`,
            pluginCreatorId: `049c1cfd-95f7-5555-a4ac-9b396d098b26`,
            mode: `SSR`,
          },
        ],
        [
          `/`,
          {
            jsonName: `index`,
            internalComponentName: `ComponentIndex`,
            path: `/`,
            matchPath: undefined,
            componentChunkName: `component---src-pages-index-js`,
            isCreatedByStatefulCreatePages: true,
            context: {},
            updatedAt: 1557740602361,
            pluginCreator___NODE: `049c1cfd-95f7-5555-a4ac-9b396d098b26`,
            pluginCreatorId: `049c1cfd-95f7-5555-a4ac-9b396d098b26`,
          },
        ],
        [
          `/404.html`,
          {
            jsonName: `404-html-516`,
            internalComponentName: `Component404Html`,
            path: `/404.html`,
            matchPath: undefined,
            componentChunkName: `component---src-pages-404-js`,
            isCreatedByStatefulCreatePages: true,
            context: {},
            updatedAt: 1557740602382,
            pluginCreator___NODE: `f795702c-a3b8-5a88-88ee-5d06019d44fa`,
            pluginCreatorId: `f795702c-a3b8-5a88-88ee-5d06019d44fa`,
          },
        ],
      ]),
      manifest: {
        "styles.css": `styles.457773932d52d28da380.css`,
        "component---src-pages-index-js-26a67c2d54e22240db63.js.LICENSE.txt": `component---src-pages-index-js-26a67c2d54e22240db63.js.LICENSE.txt`,
        "framework-a41a30b6052f08f79325.js.LICENSE.txt": `framework-a41a30b6052f08f79325.js.LICENSE.txt`,
        "polyfill.js": `polyfill-4718f0fec20e0d09d7f5.js`,
        "app.js": `app-202e78811fb4d1d6d998.js`,
        "webpack-runtime.js": `webpack-runtime-18462e4afe5829a83f1b.js`,
        "231-b2d35ff9bb1952aa22d1.js": `231-b2d35ff9bb1952aa22d1.js`,
        "711-90491aa56de138c82516.js": `711-90491aa56de138c82516.js`,
        "610-d963273663ee496bfa3a.js": `610-d963273663ee496bfa3a.js`,
        "component---src-pages-404-js.js": `component---src-pages-404-js-d759e3996ab46608f6c5.js`,
        "component---src-pages-index-js.js": `component---src-pages-index-js-26a67c2d54e22240db63.js`,
        "component---src-pages-page-2-js.js": `component---src-pages-page-2-js-83a32ea3ed36467d8d97.js`,
        "component---src-pages-using-ssr-js.js": `component---src-pages-using-ssr-js-e18b033ba44535ce7f46.js`,
        "component---src-pages-using-typescript-tsx.js": `component---src-pages-using-typescript-tsx-d10dd35a93bae22e7132.js`,
        "component---src-templates-using-dsg-js.js": `component---src-templates-using-dsg-js-481010e9ba77145ad5d4.js`,
        "framework.js": `framework-a41a30b6052f08f79325.js`,
        "commons.js": `commons-c57ec1ecb0a3a896bcbd.js`,
        "polyfill-4718f0fec20e0d09d7f5.js.map": `polyfill-4718f0fec20e0d09d7f5.js.map`,
        "app-202e78811fb4d1d6d998.js.map": `app-202e78811fb4d1d6d998.js.map`,
        "webpack-runtime-18462e4afe5829a83f1b.js.map": `webpack-runtime-18462e4afe5829a83f1b.js.map`,
        "231-b2d35ff9bb1952aa22d1.js.map": `231-b2d35ff9bb1952aa22d1.js.map`,
        "711-90491aa56de138c82516.js.map": `711-90491aa56de138c82516.js.map`,
        "610-d963273663ee496bfa3a.js.map": `610-d963273663ee496bfa3a.js.map`,
        "component---src-pages-404-js-d759e3996ab46608f6c5.js.map": `component---src-pages-404-js-d759e3996ab46608f6c5.js.map`,
        "component---src-pages-index-js-26a67c2d54e22240db63.js.map": `component---src-pages-index-js-26a67c2d54e22240db63.js.map`,
        "component---src-pages-page-2-js-83a32ea3ed36467d8d97.js.map": `component---src-pages-page-2-js-83a32ea3ed36467d8d97.js.map`,
        "component---src-pages-using-ssr-js-e18b033ba44535ce7f46.js.map": `component---src-pages-using-ssr-js-e18b033ba44535ce7f46.js.map`,
        "component---src-pages-using-typescript-tsx-d10dd35a93bae22e7132.js.map": `component---src-pages-using-typescript-tsx-d10dd35a93bae22e7132.js.map`,
        "component---src-templates-using-dsg-js-481010e9ba77145ad5d4.js.map": `component---src-templates-using-dsg-js-481010e9ba77145ad5d4.js.map`,
        "framework-a41a30b6052f08f79325.js.map": `framework-a41a30b6052f08f79325.js.map`,
        "commons-c57ec1ecb0a3a896bcbd.js.map": `commons-c57ec1ecb0a3a896bcbd.js.map`,
        polyfill: [
          `webpack-runtime-18462e4afe5829a83f1b.js`,
          `polyfill-4718f0fec20e0d09d7f5.js`,
        ],
        app: [
          `webpack-runtime-18462e4afe5829a83f1b.js`,
          `framework-a41a30b6052f08f79325.js`,
          `app-202e78811fb4d1d6d998.js`,
        ],
        "component---src-pages-404-js": [
          `styles.457773932d52d28da380.css`,
          `commons-c57ec1ecb0a3a896bcbd.js`,
          `component---src-pages-404-js-d759e3996ab46608f6c5.js`,
        ],
        "component---src-pages-index-js": [
          `styles.457773932d52d28da380.css`,
          `commons-c57ec1ecb0a3a896bcbd.js`,
          `component---src-pages-index-js-26a67c2d54e22240db63.js`,
        ],
        "component---src-pages-page-2-js": [
          `styles.457773932d52d28da380.css`,
          `commons-c57ec1ecb0a3a896bcbd.js`,
          `component---src-pages-page-2-js-83a32ea3ed36467d8d97.js`,
        ],
        "component---src-pages-using-ssr-js": [
          `styles.457773932d52d28da380.css`,
          `commons-c57ec1ecb0a3a896bcbd.js`,
          `component---src-pages-using-ssr-js-e18b033ba44535ce7f46.js`,
        ],
        "component---src-pages-using-typescript-tsx": [
          `styles.457773932d52d28da380.css`,
          `commons-c57ec1ecb0a3a896bcbd.js`,
          `component---src-pages-using-typescript-tsx-d10dd35a93bae22e7132.js`,
        ],
        "component---src-templates-using-dsg-js": [
          `styles.457773932d52d28da380.css`,
          `commons-c57ec1ecb0a3a896bcbd.js`,
          `component---src-templates-using-dsg-js-481010e9ba77145ad5d4.js`,
        ],
      },
      pathPrefix: ``,
      assetPrefix: ``,
      publicFolder: (...files) => path.join(tmpDir, ...files),
    }
  }

  it(`with caching headers`, async () => {
    const pluginData = await createPluginData()

    const pluginOptions = {
      ...DEFAULT_OPTIONS,
      mergeCachingHeaders: true,
    }

    await buildHeadersProgram(pluginData, pluginOptions)

    const output = await fs.readFile(
      pluginData.publicFolder(HEADERS_FILENAME),
      `utf8`
    )
    expect(output).toMatchSnapshot()
    expect(output).not.toMatch(/app-data\.json/)
    expect(output).not.toMatch(/page-data\.json/)

    const parsedOutput = JSON.parse(output)
    // Making sure split chunk get caching headers
    // even if manifest doesn't indicate it should
    // be part of app or page-template group.
    expect(parsedOutput?.[`/231-b2d35ff9bb1952aa22d1.js`])
      .toMatchInlineSnapshot(`
      Array [
        "Cache-Control: public, max-age=31536000, immutable",
      ]
    `)
  })

  it(`with manifest['pages-manifest']`, async () => {
    const pluginData = await createPluginData()

    fs.existsSync.mockImplementation(path => {
      if (path.includes(`page-data.json`) || path.includes(`app-data.json`)) {
        return false
      }

      return true
    })

    // gatsby < 2.9 uses page-manifest
    pluginData.manifest[`pages-manifest`] = [
      `pages-manifest-ab11f09e0ca7ecd3b43e.js`,
    ]

    const pluginOptions = {
      ...DEFAULT_OPTIONS,
      mergeCachingHeaders: true,
    }

    await buildHeadersProgram(pluginData, pluginOptions)

    const output = await fs.readFile(
      pluginData.publicFolder(HEADERS_FILENAME),
      `utf8`
    )
    expect(output).toMatchSnapshot()
    expect(output).toMatch(/\/pages-manifest-ab11f09e0ca7ecd3b43e\.js/g)
    expect(output).not.toMatch(/\/app-data\.json/g)
    expect(output).not.toMatch(/\/page-data\.json/g)
    expect(output).not.toMatch(/\/undefined/g)
  })

  it(`without app-data file`, async () => {
    const pluginData = await createPluginData()

    // gatsby 2.17.0+ adds an app-data file
    delete pluginData.manifest[`pages-manifest`]

    const pluginOptions = {
      ...DEFAULT_OPTIONS,
      mergeCachingHeaders: true,
    }
    fs.existsSync.mockImplementation(path => {
      if (path.includes(`app-data.json`)) {
        return false
      }

      return true
    })

    await buildHeadersProgram(pluginData, pluginOptions)

    const output = await fs.readFile(
      pluginData.publicFolder(HEADERS_FILENAME),
      `utf8`
    )
    expect(output).not.toMatch(/app-data\.json/g)
    expect(output).not.toMatch(/\/undefined/g)
  })

  it(`without caching headers`, async () => {
    const pluginData = await createPluginData()

    const pluginOptions = {
      ...DEFAULT_OPTIONS,
      mergeCachingHeaders: false,
    }

    await buildHeadersProgram(pluginData, pluginOptions)

    expect(
      await fs.readFile(pluginData.publicFolder(HEADERS_FILENAME), `utf8`)
    ).toMatchSnapshot()
  })

  it(`with security headers`, async () => {
    const pluginData = await createPluginData()

    const pluginOptions = {
      ...DEFAULT_OPTIONS,
      mergeSecurityHeaders: true,
      headers: {
        "/*": [
          `Content-Security-Policy: frame-ancestors 'self' https://*.storyblok.com/`,
          `X-Frame-Options: ALLOW-FROM https://app.storyblok.com/`,
        ],
        "/hello": [`X-Frame-Options: SAMEORIGIN`],
      },
    }

    await buildHeadersProgram(pluginData, pluginOptions)

    expect(
      await fs.readFile(pluginData.publicFolder(HEADERS_FILENAME), `utf8`)
    ).toMatchSnapshot()
  })

  it(`with security headers in preview mode`, async () => {
    const OLD_ENV = process.env
    process.env = {
      ...OLD_ENV,
      GATSBY_IS_PREVIEW: `true`,
    }

    const pluginData = await createPluginData()

    const pluginOptions = {
      ...DEFAULT_OPTIONS,
      mergeSecurityHeaders: true,
    }
    const buildHeadersProgram = require(`../build-headers-program`).default
    await buildHeadersProgram(pluginData, pluginOptions)

    expect(
      await fs.readFile(pluginData.publicFolder(HEADERS_FILENAME), `utf8`)
    ).toMatchSnapshot()

    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  it(`should emit headers via ipc`, async () => {
    const pluginData = await createPluginData()
    const pluginOptions = {
      ...DEFAULT_OPTIONS,
      mergeSecurityHeaders: true,
      headers: {
        "/hello": [`X-Frame-Options: SAMEORIGIN`],
      },
    }

    process.send = jest.fn()
    await buildHeadersProgram(pluginData, pluginOptions)

    expect(process.send).toHaveBeenCalledWith(
      {
        type: `LOG_ACTION`,
        action: {
          type: `CREATE_HEADER_ENTRY`,
          payload: {
            url: `/hello`,
            headers: [`X-Frame-Options: SAMEORIGIN`],
          },
        },
      },
      expect.any(Function)
    )
  })

  it(`with an assetPrefix`, async () => {
    let pluginData = await createPluginData()
    pluginData = {
      ...pluginData,
      assetPrefix: `http://cloud.gatsbyjs.io`,
    }

    const pluginOptions = {
      ...DEFAULT_OPTIONS,
    }

    await buildHeadersProgram(pluginData, pluginOptions)

    const output = await fs.readFile(
      pluginData.publicFolder(HEADERS_FILENAME),
      `utf8`
    )
    expect(output).toMatchSnapshot()
  })
})
