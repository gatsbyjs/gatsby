const { onRenderBody } = require(`../gatsby-ssr`)

const defaultPathPrefix = global.__PATH_PREFIX__

describe(`Adds <Link> for feed to head`, () => {
  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
  })

  afterEach(() => {
    global.__PATH_PREFIX__ = defaultPathPrefix
  })

  it(`creates Link if feeds does exist`, async () => {
    const pluginOptions = {
      feeds: [
        {
          output: `feed.xml`,
        },
      ],
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
  it(`creates multiple Link if feeds are several`, async () => {
    const pluginOptions = {
      feeds: [
        {
          output: `gryffindor/feed.xml`,
        },
        {
          output: `ravenclaw/feed.xml`,
        },
      ],
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
  it(`creates Link href with path prefix when __PATH_PREFIX__ sets`, async () => {
    global.__PATH_PREFIX__ = `/hogwarts`

    const pluginOptions = {
      feeds: [
        {
          output: `gryffindor/feed.xml`,
        },
        {
          output: `ravenclaw/feed.xml`,
        },
      ],
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

  it(`creates Link with a title if it does exist`, async () => {
    const pluginOptions = {
      feeds: [
        {
          output: `gryffindor/feed.xml`,
          title: `Gryffindor's RSS Feed`,
        },
        {
          output: `ravenclaw/feed.xml`,
          title: `Ravenclaw's RSS Feed`,
        },
      ],
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
