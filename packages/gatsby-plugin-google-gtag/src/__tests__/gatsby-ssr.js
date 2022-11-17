import React from "react"
const { onRenderBody } = require(`../gatsby-ssr`)
const { wrapPageElement } = require(`../gatsby-shared`)

const renderedHtml = pluginOptions => {
  const {
    props: {
      children: [
        ,
        ,
        {
          props: {
            dangerouslySetInnerHTML: { __html: html },
          },
        },
      ],
    },
  } = wrapPageElement({ element: `` }, pluginOptions)

  return html
}

const scriptSrc = pluginOptions => {
  const {
    props: {
      children: [
        ,
        {
          props: { src },
        },
      ],
    },
  } = wrapPageElement({ element: `` }, pluginOptions)

  return src
}

it(`does not crash when no pluginConfig is provided`, () => {
  const mocks = {
    setHeadComponents: () => null,
    setPostBodyComponents: () => null,
  }

  const pluginOptions = {
    trackingIds: [`GA_TRACKING_ID`],
  }
  onRenderBody(mocks, pluginOptions)
})

const DO_NOT_TRACK_STRING = `!(navigator.doNotTrack == "1" || window.doNotTrack == "1")`

it(`adds a preconnect link for Google Tag Manager`, () => {
  const mocks = {
    setHeadComponents: jest.fn(),
    setPostBodyComponents: jest.fn(),
  }
  const pluginOptions = {
    trackingIds: [`GA_TRACKING_ID`],
    pluginConfig: {},
  }

  onRenderBody(mocks, pluginOptions)
  const [link] = mocks.setHeadComponents.mock.calls[0][0]

  expect(link).toEqual(
    <link
      rel="preconnect"
      key="preconnect-google-gtag"
      href="https://www.googletagmanager.com"
    />,
    <link
      rel="dns-prefetch"
      key="dns-prefetch-google-gtag"
      href="https://www.googletagmanager.com"
    />
  )
})

describe(`respectDNT`, () => {
  it(`defaults respectDNT option to false`, () => {
    const pluginOptions = {
      trackingIds: [`GA_TRACKING_ID`],
      pluginConfig: {},
    }

    const html = renderedHtml(pluginOptions)

    expect(html).not.toContain(DO_NOT_TRACK_STRING)
  })

  it(`listens to respectDNT option`, () => {
    const pluginOptions = {
      trackingIds: [`GA_TRACKING_ID`],
      pluginConfig: {
        respectDNT: true,
      },
    }

    const html = renderedHtml(pluginOptions)

    expect(html).toContain(DO_NOT_TRACK_STRING)
  })
})

describe(`selfHostedOrigin`, () => {
  it(`should set selfHostedOrigin as googletagmanager.com by default`, () => {
    const mocks = {
      setHeadComponents: jest.fn(),
      setPostBodyComponents: jest.fn(),
    }
    const pluginOptions = {
      trackingIds: [`GA_TRACKING_ID`],
    }

    onRenderBody(mocks, pluginOptions)
    const headConfig = mocks.setHeadComponents.mock.calls[0][0]

    expect(scriptSrc(pluginOptions)).toContain(
      `https://www.googletagmanager.com`
    )
    expect(headConfig[0].props.href).toContain(
      `https://www.googletagmanager.com`
    )
    expect(headConfig[1].props.href).toContain(
      `https://www.googletagmanager.com`
    )
  })

  it(`should set selfHostedOrigin`, () => {
    const origin = `YOUR_SELF_HOSTED_ORIGIN`
    const mocks = {
      setHeadComponents: jest.fn(),
      setPostBodyComponents: jest.fn(),
    }
    const pluginOptions = {
      trackingIds: [`GA_TRACKING_ID`],
      pluginConfig: {
        origin: origin,
      },
    }

    onRenderBody(mocks, pluginOptions)
    const headConfig = mocks.setHeadComponents.mock.calls[0][0]

    expect(scriptSrc(pluginOptions)).toContain(origin)
    expect(headConfig[0].props.href).toContain(origin)
    expect(headConfig[1].props.href).toContain(origin)
  })
})
