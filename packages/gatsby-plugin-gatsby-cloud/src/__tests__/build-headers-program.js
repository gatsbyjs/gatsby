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
  let reporter

  beforeEach(() => {
    reporter = {
      warn: jest.fn(),
    }
    fs.existsSync.mockClear()
    fs.existsSync.mockReturnValue(true)
  })

  const createPluginData = async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `abhi-plugin-fastly-`)
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
        "main.js": `render-page.js`,
        "main.js.map": `render-page.js.map`,
        app: [
          `webpack-runtime-acaa8994f1f704475e21.js`,
          `styles.1025963f4f2ec7abbad4.css`,
          `styles-565f081c8374bbda155f.js`,
          `app-f33c13590352da20930f.js`,
        ],
        "component---node-modules-gatsby-plugin-offline-app-shell-js": [
          `component---node-modules-gatsby-plugin-offline-app-shell-js-78f9e4dea04737fa062d.js`,
        ],
        "component---src-templates-blog-post-js": [
          `0-0180cd94ef2497ac7db8.js`,
          `component---src-templates-blog-post-js-517987eae96e75cddbe7.js`,
        ],
        "component---src-pages-404-js": [
          `0-0180cd94ef2497ac7db8.js`,
          `component---src-pages-404-js-53e6c51a5a7e73090f50.js`,
        ],
        "component---src-pages-index-js": [
          `0-0180cd94ef2497ac7db8.js`,
          `component---src-pages-index-js-0bdd01c77ee09ef0224c.js`,
        ],
      },
      pathPrefix: ``,
      publicFolder: (...files) => path.join(tmpDir, ...files),
    }
  }

  it(`with caching headers`, async () => {
    const pluginData = await createPluginData()

    const pluginOptions = {
      ...DEFAULT_OPTIONS,
      mergeCachingHeaders: true,
    }

    await buildHeadersProgram(pluginData, pluginOptions, reporter)

    expect(reporter.warn).not.toHaveBeenCalled()
    const output = await fs.readFile(
      pluginData.publicFolder(HEADERS_FILENAME),
      `utf8`
    )
    expect(output).toMatchSnapshot()
    expect(output).toMatch(/app-data\.json/)
    expect(output).toMatch(/page-data\.json/)
    // we should only check page-data & app-data once which leads to 2 times
    expect(fs.existsSync).toBeCalledTimes(2)
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

    await buildHeadersProgram(pluginData, pluginOptions, reporter)

    expect(reporter.warn).not.toHaveBeenCalled()
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

    await buildHeadersProgram(pluginData, pluginOptions, reporter)

    expect(reporter.warn).not.toHaveBeenCalled()
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

    await buildHeadersProgram(pluginData, pluginOptions, reporter)

    expect(reporter.warn).not.toHaveBeenCalled()
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

    await buildHeadersProgram(pluginData, pluginOptions, reporter)

    expect(reporter.warn).not.toHaveBeenCalled()
    expect(
      await fs.readFile(pluginData.publicFolder(HEADERS_FILENAME), `utf8`)
    ).toMatchSnapshot()
  })
})
