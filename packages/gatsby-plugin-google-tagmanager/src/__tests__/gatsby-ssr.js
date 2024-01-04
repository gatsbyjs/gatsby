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
        id: `123`,
        includeInDevelopment: true,
      }

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      // eslint-disable-next-line no-useless-escape
      expect(headConfig.props.dangerouslySetInnerHTML.__html).not.toContain(
        `window.dataLayer`
      )
      expect(headConfig.props.dangerouslySetInnerHTML.__html).not.toContain(
        `undefined`
      )
    })

    it(`should add a static object as defaultDatalayer`, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        includeInDevelopment: true,
        defaultDataLayer: {
          type: `object`,
          value: { pageCategory: `home` },
        },
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
        defaultDataLayer: {
          type: `function`,
          value: function () {
            return { pageCategory: window.pageType }
          }.toString(),
        },
      }

      const datalayerFuncAsString = oneLine`${pluginOptions.defaultDataLayer.value}`

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
        defaultDataLayer: {
          type: `number`,
          value: 5,
        },
      }

      expect(() => onRenderBody(mocks, pluginOptions)).toThrow()

      class Test {}
      pluginOptions = {
        includeInDevelopment: true,
        defaultDataLayer: {
          type: `object`,
          value: new Test(),
        },
      }

      expect(() => onRenderBody(mocks, pluginOptions)).toThrow()
    })

    it(`should add a renamed dataLayer`, () => {
      const dataLayerName = `TEST_DATA_LAYER_NAME`
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        includeInDevelopment: true,
        defaultDataLayer: {
          type: `object`,
          value: { pageCategory: `home` },
        },
        dataLayerName,
        enableWebVitalsTracking: false,
      }

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toMatchSnapshot()
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `window.${dataLayerName}`
      )
    })

    it(`adds the web-vitals polyfill to the head`, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        includeInDevelopment: true,
        enableWebVitalsTracking: true,
      }

      onRenderBody(mocks, pluginOptions)

      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      expect(mocks.setHeadComponents.mock.calls[0][0].length).toBe(2)
      expect(headConfig.key).toBe(`gatsby-plugin-google-tagmanager-web-vitals`)
    })

    it(`should not add the web-vitals polyfill when enableWebVitalsTracking is false `, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        includeInDevelopment: true,
        enableWebVitalsTracking: false,
      }

      onRenderBody(mocks, pluginOptions)

      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      expect(mocks.setHeadComponents.mock.calls[0].length).toBe(1)
      expect(headConfig.key).toBe(`plugin-google-tagmanager`)
    })

    it(`should set selfHostedOrigin as googletagmanager.com by default`, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        id: `123`,
        includeInDevelopment: true,
      }

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      const [preBodyConfig] = mocks.setPreBodyComponents.mock.calls[0][0]

      // eslint-disable-next-line no-useless-escape
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `https://www.googletagmanager.com/gtm.js`
      )
      expect(preBodyConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `https://www.googletagmanager.com/ns.html`
      )
    })

    it(`should set selfHostedOrigin`, () => {
      const selfHostedOrigin = `YOUR_SELF_HOSTED_ORIGIN`
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        id: `123`,
        includeInDevelopment: true,
        selfHostedOrigin: selfHostedOrigin,
      }

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      const [preBodyConfig] = mocks.setPreBodyComponents.mock.calls[0][0]

      // eslint-disable-next-line no-useless-escape
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `${selfHostedOrigin}/gtm.js`
      )
      expect(preBodyConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `${selfHostedOrigin}/ns.html`
      )
    })
    it(`should set selfHostedPath as gtm.js by default`, () => {
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        id: `123`,
        includeInDevelopment: true,
      }

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      const [preBodyConfig] = mocks.setPreBodyComponents.mock.calls[0][0]

      // eslint-disable-next-line no-useless-escape
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `https://www.googletagmanager.com/gtm.js`
      )
    })

    it(`should set selfHostedPath`, () => {
      const selfHostedPath = `YOUR_SELF_HOSTED_PATH`
      const mocks = {
        setHeadComponents: jest.fn(),
        setPreBodyComponents: jest.fn(),
      }
      const pluginOptions = {
        id: `123`,
        includeInDevelopment: true,
        selfHostedPath: selfHostedPath,
      }

      onRenderBody(mocks, pluginOptions)
      const [headConfig] = mocks.setHeadComponents.mock.calls[0][0]
      const [preBodyConfig] = mocks.setPreBodyComponents.mock.calls[0][0]

      // eslint-disable-next-line no-useless-escape
      expect(headConfig.props.dangerouslySetInnerHTML.__html).toContain(
        `https://www.googletagmanager.com/${selfHostedPath}`
      )
    })
  })
})
