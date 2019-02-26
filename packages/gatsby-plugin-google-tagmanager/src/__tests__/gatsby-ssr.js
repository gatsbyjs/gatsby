const { oneLine } = require(`common-tags`)
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

    expect(headConfig.props.dangerouslySetInnerHTML.__html).toMatchSnapshot()
    expect(preBodyConfig.props.dangerouslySetInnerHTML.__html).toMatchSnapshot()
    // check if no newlines were added
    expect(preBodyConfig.props.dangerouslySetInnerHTML.__html).not.toContain(
      `\n`
    )
  })

  describe(`defaultDatalayer`, () => {
    it(`should add no dataLayer by default`, () => {
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
        `window.dataLayer`
      )
    })

    it(`should add a static object as defaultDatalayer`, () => {
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
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toMatchSnapshot()
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `window.dataLayer`
      )
    })

    it(`should add a function as defaultDatalayer`, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        includeInDevelopment: true,
        defaultDataLayer: function() {
          return { pageCategory: window.pageType }
        },
      }

      const datalayerFuncAsString = oneLine`${pluginOptions.defaultDataLayer.toString()}`

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toMatchSnapshot()
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `window.dataLayer.push((${datalayerFuncAsString})());`
      )
    })

    it(`should report an error when data is not valid`, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
        reporter: {
          panic: msg => {
            throw new Error(msg)
          },
        },
      }
      let pluginOptions = {
        includeInDevelopment: true,
        defaultDataLayer: 5,
      }

      expect(() => onRenderBody(mocks, pluginOptions)).toThrow()

      class Test {}
      pluginOptions = {
        includeInDevelopment: true,
        defaultDataLayer: new Test(),
      }

      expect(() => onRenderBody(mocks, pluginOptions)).toThrow()
    })
  })
})
