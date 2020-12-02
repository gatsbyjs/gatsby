const { onRenderBody } = require(`../gatsby-ssr`)

const defaultPathPrefix = global.__PATH_PREFIX__

describe(`gatsby-plugin-sitemap SSR API`, () => {
  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
  })

  afterEach(() => {
    global.__PATH_PREFIX__ = defaultPathPrefix
  })

  it(`should create a Link if createLinkInHead is true`, async () => {
    const pluginOptions = {
      createLinkInHead: true,
      output: `test-folder`,
    }
    const setHeadComponents = jest.fn()

    await onRenderBody(
      {
        setHeadComponents,
      },
      pluginOptions
    )

    expect(setHeadComponents).toMatchSnapshot()
    expect(setHeadComponents).toHaveBeenCalledTimes(1)
  })
  it(`should not create Link if createLinkInHead is false`, async () => {
    const pluginOptions = {
      createLinkInHead: false,
      output: `test-folder`,
    }
    const setHeadComponents = jest.fn()

    await onRenderBody(
      {
        setHeadComponents,
      },
      pluginOptions
    )

    expect(setHeadComponents).toMatchSnapshot()
    expect(setHeadComponents).toHaveBeenCalledTimes(0)
  })
  it(`creates Link href with path prefix when __PATH_PREFIX__ sets`, async () => {
    global.__PATH_PREFIX__ = `/hogwarts`

    const pluginOptions = {
      createLinkInHead: true,
      output: `test-folder`,
    }
    const setHeadComponents = jest.fn()

    await onRenderBody(
      {
        setHeadComponents,
      },
      pluginOptions
    )

    expect(setHeadComponents).toMatchSnapshot()
    expect(setHeadComponents).toHaveBeenCalledTimes(1)
  })
})
