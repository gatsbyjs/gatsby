const { onRenderBody } = require(`../gatsby-ssr`)

describe(`gatsby-plugin-google-tagmanager`, () => {
  it(`should load gtm`, () => {
    const mocks = {
      setHeadComponents: jest.fn(),
      setPreBodyComponents: jest.fn(),
    }
    const pluginOptions = {
      includeInDevelopment: true,
    }

    onRenderBody(mocks, pluginOptions)
    const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
    const [preBodyConfig] = mocks.setPreBodyComponents.mock.calls[0][0]

    expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
      `https://www.googletagmanager.com/gtm.js`
    )
    expect(preBodyConfig.props.dangerouslySetInnerHTML.__html).toContain(
      `<iframe src="https://www.googletagmanager.com/ns.html`
    )
  })

  describe(`defaultDatalayer`, () => {
    it(`should add nothing by default`, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        includeInDevelopment: true,
      }

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      // eslint-disable-next-line no-useless-escape
      expect(headConfig.props.dangerouslySetInnerHTML.__html).not.toContain(
        `dataLayer = [`
      )
    })

    it(`should add defaultDatalayer with static object`, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        includeInDevelopment: true,
        defaultDataLayer: { pageCategory: `home` },
      }

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
        // eslint-disable-next-line no-useless-escape
        `dataLayer = [{\"pageCategory\":\"home\"}]`
      )
    })

    it(`should add defaultDatalayer with stringified object`, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        includeInDevelopment: true,
        defaultDataLayer: `{"pageCategory": window.pageCategory}`,
      }

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `dataLayer = [${pluginOptions.defaultDataLayer}]`
      )
    })
  })
})
