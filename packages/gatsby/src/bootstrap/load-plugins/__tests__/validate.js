jest.mock(`../../resolve-module-exports`)

const {
  collatePluginAPIs,
  handleBadExports,
  handleMultipleReplaceRenderers,
  warnOnIncompatiblePeerDependency,
} = require(`../validate`)

const { store } = require(`../../../redux`)
const log = jest.fn()
store.dispatch({ type: `SET_LOGGER`, payload: log })
afterEach(() => log.mockClear())

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

    let result = collatePluginAPIs({ apis, flattenedPlugins })
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

    let result = collatePluginAPIs({ apis, flattenedPlugins })
    expect(result).toMatchSnapshot()
  })
})

describe(`handleBadExports`, () => {
  it(`Does nothing when there are no bad exports`, async () => {
    handleBadExports({
      apis: {
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

  it(`Logs panicOnBuild message when bad exports are detected`, async () => {
    handleBadExports({
      apis: {
        node: [``],
        browser: [``],
        ssr: [`notFoo`, `bar`],
      },
      badExports: {
        node: [],
        browser: [],
        ssr: [
          {
            exportName: `foo`,
            pluginName: `default-site-plugin`,
          },
        ],
      },
    })

    expect(log.mock.calls.length).toBe(1)
    expect(log.mock.calls[0][0].type).toBe(`panicOnBuild`)
  })
})

describe(`handleMultipleReplaceRenderers`, () => {
  it(`Does nothing when replaceRenderers is implemented once`, async () => {
    const apiToPlugins = {
      replaceRenderer: [`foo-plugin`],
    }

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
      apiToPlugins,
      flattenedPlugins,
    })

    expect(result).toMatchSnapshot()
  })

  it(`Sets skipSSR when replaceRenderers is implemented more than once`, async () => {
    const apiToPlugins = {
      replaceRenderer: [`foo-plugin`, `default-site-plugin`],
    }

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
      apiToPlugins,
      flattenedPlugins,
    })

    expect(result).toMatchSnapshot()
  })
})

describe(`warnOnIncompatiblePeerDependency`, () => {
  it(`Does not warn when no peer dependency`, () => {
    warnOnIncompatiblePeerDependency(`dummy-package`, { peerDependencies: {} })

    expect(log).not.toHaveBeenCalled()
  })

  it(`Warns on incompatible gatsby peer dependency`, async () => {
    warnOnIncompatiblePeerDependency(`dummy-package`, {
      peerDependencies: {
        gatsby: `<2.0.0`,
      },
    })

    expect(log).toHaveBeenCalledWith({
      message: expect.stringContaining(
        `Plugin dummy-package is not compatible`
      ),
      type: `warn`,
    })
  })
})
