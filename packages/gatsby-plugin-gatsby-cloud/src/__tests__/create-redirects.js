import createRedirects from "../create-redirects"
import * as path from "path"
import * as os from "os"
import * as fs from "fs-extra"
import { REDIRECTS_FILENAME } from "../constants"

jest.mock(`fs-extra`, () => {
  return {
    ...jest.requireActual(`fs-extra`),
    existsSync: jest.fn(),
  }
})

describe(`create-redirects`, () => {
  let reporter

  beforeEach(() => {
    reporter = {
      warn: jest.fn(),
    }
    fs.existsSync.mockClear()
    fs.existsSync.mockReturnValue(true)
  })

  const createPluginData = async ({ pathPrefix = `` } = {}) => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `gatsby-plugin-gatsby-cloud-`)
    )

    return {
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
      pathPrefix,
      publicFolder: (...files) => path.join(tmpDir, ...files),
    }
  }

  it(`should assemble a redirects file`, async () => {
    const pluginData = await createPluginData()

    await createRedirects(
      pluginData,
      [
        {
          fromPath: `/old-url`,
          toPath: `/new-url`,
          isPermanent: true,
        },
        {
          fromPath: `/url_that_is/not_pretty`,
          toPath: `/pretty/url`,
          statusCode: 201,
        },
      ],
      [
        {
          fromPath: `/url_that_is/ugly`,
          toPath: `/not_ugly/url`,
        },
        {
          fromPath: `/path2/*splatparam`,
          toPath: `/path2/[...splatparam]/`,
        },
        {
          fromPath: `/path/*`,
          toPath: `/path/[...]/`,
        },
        {
          fromPath: `/path3/:level1/:level2`,
          toPath: `/path3/[level1]/[level2]/`,
        },
        {
          fromPath: `/path4/:param1`,
          toPath: `/path4/[param1]/`,
        },
      ]
    )

    const output = await fs.readFile(
      pluginData.publicFolder(REDIRECTS_FILENAME),
      `utf8`
    )
    expect(output).toMatchSnapshot()
  })

  it(`should remove pathPrefix from redirects`, async () => {
    const pathPrefix = `/nested`
    const pluginData = await createPluginData({ pathPrefix })

    await createRedirects(
      pluginData,
      [
        {
          fromPath: `${pathPrefix}/old-url`,
          toPath: `${pathPrefix}/new-url`,
          isPermanent: true,
        },
        {
          fromPath: `${pathPrefix}/url_that_is/not_pretty`,
          toPath: `${pathPrefix}/pretty/url`,
          statusCode: 201,
        },
      ],
      []
    )

    const output = await fs.readFile(
      pluginData.publicFolder(REDIRECTS_FILENAME),
      `utf8`
    )
    expect(output).toMatchSnapshot()
  })

  it(`should emit IPC for each redirect/rewrite`, async () => {
    const pluginData = await createPluginData()

    process.send = jest.fn()

    await createRedirects(
      pluginData,
      [
        {
          fromPath: `/old-url`,
          toPath: `/new-url`,
          isPermanent: true,
        },
      ],
      [
        {
          fromPath: `/url_that_is/ugly`,
          toPath: `/not_ugly/url`,
        },
      ]
    )

    expect(process.send).toHaveBeenCalledWith({
      type: `LOG_ACTION`,
      action: {
        type: `CREATE_REDIRECT_ENTRY`,
        payload: {
          fromPath: `/old-url`,
          toPath: `/new-url`,
          isPermanent: true,
        },
      },
    })

    expect(process.send).toHaveBeenCalledWith({
      type: `LOG_ACTION`,
      action: {
        type: `CREATE_REWRITE_ENTRY`,
        payload: {
          fromPath: `/url_that_is/ugly`,
          toPath: `/not_ugly/url`,
        },
      },
    })
  })
})
