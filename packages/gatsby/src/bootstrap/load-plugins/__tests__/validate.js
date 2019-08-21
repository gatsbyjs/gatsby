jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panicOnBuild: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }
})
jest.mock(`../../resolve-module-exports`)

const reporter = require(`gatsby-cli/lib/reporter`)
const {
  collatePluginAPIs,
  handleBadExports,
  handleMultipleReplaceRenderers,
  warnOnIncompatiblePeerDependency,
} = require(`../validate`)

beforeEach(() => {
  Object.keys(reporter).forEach(key => reporter[key].mockReset())
})

describe(`collatePluginAPIs`, () => {
  const MOCK_RESULTS = {
    "/foo/gatsby-node": [`node-1`, `node-2`],
    "/foo/gatsby-browser": [`browser-1`, `browser-2`],
    "/foo/gatsby-ssr": [`ssr-1`, `ssr-2`],
    "/bar/gatsby-node": [`node-2`, `node-3`],
    "/bar/gatsby-browser": [`browser-2`, `browser-3`],
    "/bar/gatsby-ssr": [`ssr-2`, `ssr-3`],
    "/bad-apis/gatsby-node": [`bad-node-2`, `bad-node-3`],
    "/bad-apis/gatsby-browser": [`bad-browser-2`, `bad-browser-3`],
    "/bad-apis/gatsby-ssr": [`bad-ssr-2`, `bad-ssr-3`],
  }

  beforeEach(() => {
    const resolveModuleExports = require(`../../resolve-module-exports`)
    resolveModuleExports(MOCK_RESULTS)
  })

  it(`Identifies APIs used by a site's plugins`, async () => {
    const apis = {
      node: [`node-1`, `node-2`, `node-3`, `node-4`],
      browser: [`browser-1`, `browser-2`, `browser-3`, `browser-4`],
      ssr: [`ssr-1`, `ssr-2`, `ssr-3`, `ssr-4`],
    }
    const flattenedPlugins = [
      {
        resolve: `/foo`,
        id: `Plugin foo`,
        name: `foo-plugin`,
        version: `1.0.0`,
        pluginOptions: { plugins: [] },
      },
      {
        resolve: `/bar`,
        id: `Plugin default-site-plugin`,
        name: `default-site-plugin`,
        version: `ec21d02c31ab044d027a1d2fcaeb4a79`,
        pluginOptions: { plugins: [] },
      },
    ]

    let result = collatePluginAPIs({ currentAPIs: apis, flattenedPlugins })
    expect(result).toMatchSnapshot()
  })

  it(`Identifies incorrect APIs used by a site's plugins`, async () => {
    const apis = {
      node: [`node-1`, `node-2`, `node-3`, `node-4`],
      browser: [`browser-1`, `browser-2`, `browser-3`, `browser-4`],
      ssr: [`ssr-1`, `ssr-2`, `ssr-3`, `ssr-4`],
    }
    const flattenedPlugins = [
      {
        resolve: `/foo`,
        id: `Plugin foo`,
        name: `foo-plugin`,
        version: `1.0.0`,
        pluginOptions: { plugins: [] },
      },
      {
        resolve: `/bad-apis`,
        id: `Plugin default-site-plugin`,
        name: `default-site-plugin`,
        version: `ec21d02c31ab044d027a1d2fcaeb4a79`,
        pluginOptions: { plugins: [] },
      },
    ]

    let result = collatePluginAPIs({ currentAPIs: apis, flattenedPlugins })
    expect(result).toMatchSnapshot()
  })
})

describe(`handleBadExports`, () => {
  it(`Does nothing when there are no bad exports`, async () => {
    handleBadExports({
      currentAPIs: {
        node: [`these`, `can`, `be`],
        browser: [`anything`, `as there`],
        ssr: [`are no`, `bad errors`],
      },
      badExports: {
        node: [],
        browser: [],
        ssr: [],
      },
    })
  })

  it(`Calls structured error with reporter.error when bad exports are detected`, async () => {
    const exportName = `foo`
    handleBadExports({
      currentAPIs: {
        node: [``],
        browser: [``],
        ssr: [``],
      },
      latestAPIs: {
        node: {},
        browser: {},
        ssr: {},
      },
      badExports: {
        node: [],
        browser: [],
        ssr: [
          {
            exportName,
            pluginName: `default-site-plugin`,
          },
        ],
      },
    })

    expect(reporter.error).toHaveBeenCalledTimes(1)
    expect(reporter.error).toHaveBeenCalledWith(
      expect.objectContaining({
        id: `11329`,
        context: expect.objectContaining({
          exportType: `ssr`,
          errors: [
            expect.stringContaining(`"${exportName}" which is not a known API`),
          ],
        }),
      })
    )
  })

  it(`adds info on plugin if a plugin API error`, () => {
    const exportName = `foo`
    const pluginName = `gatsby-source-contentful`
    const pluginVersion = `2.1.0`
    handleBadExports({
      currentAPIs: {
        node: [``],
        browser: [``],
        ssr: [``],
      },
      latestAPIs: {
        node: {},
        browser: {},
        ssr: {},
      },
      badExports: {
        node: [],
        browser: [],
        ssr: [
          {
            exportName,
            pluginName,
            pluginVersion,
          },
        ],
      },
    })

    expect(reporter.error).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          errors: [
            expect.stringContaining(
              `${pluginName}@${pluginVersion} is using the API "${exportName}"`
            ),
          ],
        }),
      })
    )
  })

  it(`Adds fixes to context if newer API introduced in Gatsby`, () => {
    const version = `2.2.0`

    handleBadExports({
      currentAPIs: {
        node: [``],
        browser: [``],
        ssr: [``],
      },
      latestAPIs: {
        browser: {},
        ssr: {},
        node: {
          validatePluginOptions: {
            version,
          },
        },
      },
      badExports: {
        browser: [],
        ssr: [],
        node: [
          {
            exportName: `validatePluginOptions`,
            pluginName: `gatsby-source-contentful`,
          },
        ],
      },
    })

    expect(reporter.error).toHaveBeenCalledTimes(1)
    expect(reporter.error).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          fixes: [`npm install gatsby@^${version}`],
        }),
      })
    )
  })

  it(`adds fixes if close match/typo`, () => {
    ;[
      [`modifyWebpackConfig`, `onCreateWebpackConfig`],
      [`createPagesss`, `createPages`],
    ].forEach(([typoOrOldAPI, newAPI]) => {
      handleBadExports({
        currentAPIs: {
          node: [newAPI],
          browser: [``],
          ssr: [``],
        },
        latestAPIs: {
          browser: {},
          ssr: {},
          node: {},
        },
        badExports: {
          browser: [],
          ssr: [],
          node: [
            {
              exportName: typoOrOldAPI,
              pluginName: `default-site-plugin`,
            },
          ],
        },
      })

      expect(reporter.error).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            fixes: [`Rename "${typoOrOldAPI}" -> "${newAPI}"`],
          }),
        })
      )
    })
  })
})

describe(`handleMultipleReplaceRenderers`, () => {
  it(`Does nothing when replaceRenderers is implemented once`, async () => {
    const flattenedPlugins = [
      {
        resolve: `___TEST___`,
        id: `Plugin foo`,
        name: `foo-plugin`,
        version: `1.0.0`,
        pluginOptions: { plugins: [] },
        nodeAPIs: [],
        browserAPIs: [],
        ssrAPIs: [`replaceRenderer`],
      },
      {
        resolve: `___TEST___`,
        id: `Plugin default-site-plugin`,
        name: `default-site-plugin`,
        version: `ec21d02c31ab044d027a1d2fcaeb4a79`,
        pluginOptions: { plugins: [] },
        nodeAPIs: [],
        browserAPIs: [],
        ssrAPIs: [],
      },
    ]

    const result = handleMultipleReplaceRenderers({
      flattenedPlugins,
    })

    expect(result).toMatchSnapshot()
  })

  it(`Sets skipSSR when replaceRenderers is implemented more than once`, async () => {
    const flattenedPlugins = [
      {
        resolve: `___TEST___`,
        id: `Plugin foo`,
        name: `foo-plugin`,
        version: `1.0.0`,
        pluginOptions: { plugins: [] },
        nodeAPIs: [],
        browserAPIs: [],
        ssrAPIs: [`replaceRenderer`],
      },
      {
        resolve: `___TEST___`,
        id: `Plugin default-site-plugin`,
        name: `default-site-plugin`,
        version: `ec21d02c31ab044d027a1d2fcaeb4a79`,
        pluginOptions: { plugins: [] },
        nodeAPIs: [],
        browserAPIs: [],
        ssrAPIs: [`replaceRenderer`],
      },
    ]

    const result = handleMultipleReplaceRenderers({
      flattenedPlugins,
    })

    expect(result).toMatchSnapshot()
  })
})

describe(`warnOnIncompatiblePeerDependency`, () => {
  beforeEach(() => {
    reporter.warn.mockClear()
  })

  it(`Does not warn when no peer dependency`, () => {
    warnOnIncompatiblePeerDependency(`dummy-package`, { peerDependencies: {} })

    expect(reporter.warn).not.toHaveBeenCalled()
  })

  it(`Warns on incompatible gatsby peer dependency`, async () => {
    warnOnIncompatiblePeerDependency(`dummy-package`, {
      peerDependencies: {
        gatsby: `<2.0.0`,
      },
    })

    expect(reporter.warn).toHaveBeenCalledWith(
      expect.stringContaining(`Plugin dummy-package is not compatible`)
    )
  })
})
