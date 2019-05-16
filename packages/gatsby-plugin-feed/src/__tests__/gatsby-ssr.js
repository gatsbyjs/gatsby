const { onRenderBody } = require(`../gatsby-ssr`)

describe(`Adds <Link> for feed to head`, () => {
  const prefix = global.__BASE_PATH__
  beforeEach(() => {
    global.__BASE_PATH__ = ``
    global.__PATH_PREFIX__ = ``
  })

  afterAll(() => {
    global.__BASE_PATH__ = prefix
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
