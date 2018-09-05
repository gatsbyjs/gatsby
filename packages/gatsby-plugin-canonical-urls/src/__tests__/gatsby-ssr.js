const { onRenderBody } = require(`../gatsby-ssr`)

describe(`Adds canonical link to head correctly`, () => {
  it(`creates a canonical link if siteUrl is set`, async () => {
    const pluginOptions = {
      siteUrl: `http://someurl.com`,
    }
    const setHeadComponents = jest.fn()
    const pathname = `/somepost`

    await onRenderBody(
      {
        setHeadComponents,
        pathname,
      },
      pluginOptions
    )

    expect(setHeadComponents).toMatchSnapshot()
    expect(setHeadComponents).toHaveBeenCalledTimes(1)
  })

  it(`does not create a canonical link if siteUrl is not set`, async () => {
    const pluginOptions = {}
    const setHeadComponents = jest.fn()
    const pathname = `/somepost`

    await onRenderBody(
      {
        setHeadComponents,
        pathname,
      },
      pluginOptions
    )

    expect(setHeadComponents).toMatchSnapshot()
    expect(setHeadComponents).toHaveBeenCalledTimes(0)
  })
})
