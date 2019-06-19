const { load: loadCache } = require(`../prepare/cache`)
const { onRenderBody } = require(`../gatsby-ssr`)

jest.mock(`../prepare/cache`, () => {
  return {
    load: jest.fn(),
  }
})

const setCachedAssets = assets =>
  loadCache.mockImplementationOnce(() => {
    return {
      timestamp: 0,
      hash: `initial-run`,
      assets,
    }
  })

describe(`gatsby-ssr`, () => {
  const setHeadComponents = jest.fn()

  afterEach(() => {
    setHeadComponents.mockReset()
  })

  it(`does nothing if the pathname has no cached assets`, () => {
    setCachedAssets({})

    onRenderBody({ setHeadComponents, pathname: `/foo` }, {})

    expect(setHeadComponents).not.toHaveBeenCalled()
  })

  it(`generates a <link> tag for each asset`, () => {
    setCachedAssets({
      [`/foo`]: {
        [`/path/to/font.otf`]: true,
        [`/path/to/another.ttf`]: true,
        [`/path/to/another/font.woff`]: true,
      },
    })

    onRenderBody({ setHeadComponents, pathname: `/foo` }, {})

    expect(setHeadComponents.mock.calls[0][0]).toMatchInlineSnapshot(`
      Array [
        <link
          as="font"
          crossOrigin="anonymous"
          href="/path/to/font.otf"
          rel="preload"
        />,
        <link
          as="font"
          crossOrigin="anonymous"
          href="/path/to/another.ttf"
          rel="preload"
        />,
        <link
          as="font"
          crossOrigin="anonymous"
          href="/path/to/another/font.woff"
          rel="preload"
        />,
      ]
    `)
  })

  it(`accepts boolean \`crossOrigin\` in plugin config`, () => {
    setCachedAssets({
      [`/foo`]: {
        [`/path/to/font.otf`]: true,
      },
    })

    onRenderBody(
      { setHeadComponents, pathname: `/foo` },
      { crossOrigin: false }
    )
    expect(setHeadComponents.mock.calls[0][0]).toMatchInlineSnapshot(`
      Array [
        <link
          as="font"
          href="/path/to/font.otf"
          rel="preload"
        />,
      ]
    `)
  })

  it(`accepts string \`crossOrigin\` in plugin config`, () => {
    setCachedAssets({
      [`/foo`]: {
        [`/path/to/font.otf`]: true,
      },
    })

    onRenderBody(
      { setHeadComponents, pathname: `/foo` },
      { crossOrigin: `use-credentials` }
    )
    expect(setHeadComponents.mock.calls[0][0]).toMatchInlineSnapshot(`
      Array [
        <link
          as="font"
          crossOrigin="use-credentials"
          href="/path/to/font.otf"
          rel="preload"
        />,
      ]
    `)
  })

  it(`accepts function \`crossOrigin\` in plugin config`, () => {
    const config = {
      crossOrigin: path => (path === `/foo` ? false : `use-credentials`),
    }

    setCachedAssets({
      [`/foo`]: {
        [`/path/to/font.otf`]: true,
      },
    })
    onRenderBody({ setHeadComponents, pathname: `/foo` }, config)

    setCachedAssets({
      [`/bar`]: {
        [`/path/to/another.woff`]: true,
      },
    })
    onRenderBody({ setHeadComponents, pathname: `/bar` }, config)

    expect(setHeadComponents.mock.calls[0][0]).toMatchInlineSnapshot(`
      Array [
        <link
          as="font"
          href="/path/to/font.otf"
          rel="preload"
        />,
      ]
    `)
    expect(setHeadComponents.mock.calls[1][0]).toMatchInlineSnapshot(`
    Array [
      <link
        as="font"
        crossOrigin="use-credentials"
        href="/path/to/another.woff"
        rel="preload"
      />,
    ]
  `)
  })
})
