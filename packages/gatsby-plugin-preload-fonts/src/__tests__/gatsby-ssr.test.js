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
        [`https://foo.bar/path/to/another.ttf`]: true,
        [`https://foo.baz/path/to/another/font.woff`]: true,
      },
    })

    onRenderBody({ setHeadComponents, pathname: `/foo` }, {})

    expect(setHeadComponents.mock.calls[0][0]).toMatchSnapshot()
  })

  describe(`generates <link> tags with \`crossorigin\` prop for external fonts`, () => {
    it(`accepts string \`crossOrigin\` in plugin config`, () => {
      setCachedAssets({
        [`/foo`]: {
          [`https://foo.bar/path/to/font.otf`]: true,
        },
      })

      onRenderBody(
        { setHeadComponents, pathname: `/foo` },
        { crossOrigin: `use-credentials` }
      )
      expect(setHeadComponents.mock.calls[0][0]).toMatchSnapshot()
    })

    it(`accepts function \`crossOrigin\` in plugin config`, () => {
      const config = {
        crossOrigin: path => (path === `/foo` ? false : `use-credentials`),
      }

      setCachedAssets({
        [`/foo`]: {
          [`https://foo.bar/path/to/font.otf`]: true,
        },
      })
      onRenderBody({ setHeadComponents, pathname: `/foo` }, config)

      setCachedAssets({
        [`/bar`]: {
          [`https://foo.bar/path/to/another.woff`]: true,
        },
      })
      onRenderBody({ setHeadComponents, pathname: `/bar` }, config)

      expect(setHeadComponents.mock.calls[0][0]).toMatchSnapshot()
      expect(setHeadComponents.mock.calls[1][0]).toMatchSnapshot()
    })
  })

  it(`generates <link> tags with \`crossorigin\` \`anonymous\` prop for self-hosted fonts`, () => {
    setCachedAssets({
      [`/foo`]: {
        [`/font.otf`]: true,
      },
    })

    onRenderBody({ setHeadComponents, pathname: `/foo` })

    expect(setHeadComponents.mock.calls[0][0]).toMatchSnapshot()
  })
})
