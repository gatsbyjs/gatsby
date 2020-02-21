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

  it(`creates Link only if pathname satisfied match`, async () => {
    const pluginOptions = {
      feeds: [
        {
          output: `gryffindor/feed.xml`,
          title: `Gryffindor's RSS Feed`,
          match: `^/gryffindor/`,
        },
        {
          output: `ravenclaw/feed.xml`,
          title: `Ravenclaw's RSS Feed`,
          match: `^/ravenclaw/`,
        },
      ],
    }
    const setHeadComponents = jest.fn()

    await onRenderBody(
      {
        setHeadComponents,
        pathname: `/gryffindor/welcome`,
      },
      pluginOptions
    )

    expect(setHeadComponents).toMatchSnapshot()
    expect(setHeadComponents).toHaveBeenCalledTimes(1)
  })

  it(`creates Link that override href link generation from output with link set`, async () => {
    const pluginOptions = {
      feeds: [
        {
          output: `gryffindor/feed.xml`,
          title: `Gryffindor's RSS Feed`,
        },
        {
          output: `gryffindor/feed.xml`,
          title: `Gryffindor's RSS Feed`,
          link: `https://harreypetter.com/gryffindor`,
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

  it(`testing output with and without prefixes set`, async () => {
    const pluginOptions = {
      feeds: [
        {
          output: `/with-slash-prefix/feed.xml`,
          title: `With slash prefix RSS Feed`,
        },
        {
          output: `without-slash-prefix/feed.xml`,
          title: `Without slash prefix RSS Feed`,
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

  it(`testing output prefixes with __PATH_PREFIX__ without path prefix set`, async () => {
    global.__PATH_PREFIX__ = `without-path-prefix`

    const pluginOptions = {
      feeds: [
        {
          output: `/output-with-slash-prefix/feed.xml`,
          title: `With slash prefix RSS Feed`,
        },
        {
          output: `output-without-slash-prefix/feed.xml`,
          title: `Without slash prefix RSS Feed`,
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
