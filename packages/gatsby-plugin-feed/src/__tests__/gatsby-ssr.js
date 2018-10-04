const { onRenderBody } = require(`../gatsby-ssr`)

beforeEach(() => {
  global.__PATH_PREFIX__ = ``
})

describe(`Adds <Link> for feed to head`, () => {
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
})
