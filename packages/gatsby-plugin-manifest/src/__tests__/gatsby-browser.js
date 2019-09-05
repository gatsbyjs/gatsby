import { onRouteUpdate } from "../gatsby-browser"

describe(`gatsby-plugin-manifest`, () => {
  const pluginOptions = {
    name: `My Website`,
    start_url: `/`,
    localize: [
      {
        start_url: `/es/`,
        lang: `es`,
      },
    ],
  }

  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
    document.head.innerHTML = `<link rel="manifest" href="/manifest.webmanifest">`
  })

  test(`has manifest in head`, () => {
    const location = {
      pathname: `/`,
    }
    onRouteUpdate({ location }, pluginOptions)
    expect(document.head).toMatchInlineSnapshot(`
      <head>
        <link
          href="/manifest.webmanifest"
          rel="manifest"
        />
      </head>
    `)
  })

  test(`changes href of manifest if navigating to a localized app`, () => {
    const location = {
      pathname: `/es/`,
    }
    onRouteUpdate({ location }, pluginOptions)
    expect(document.head).toMatchInlineSnapshot(`
      <head>
        <link
          href="/manifest_es.webmanifest"
          rel="manifest"
        />
      </head>
    `)
  })

  test(`keeps default manifest if not navigating to a localized app`, () => {
    const location = {
      pathname: `/random-path/`,
    }
    onRouteUpdate({ location }, pluginOptions)
    expect(document.head).toMatchInlineSnapshot(`
      <head>
        <link
          href="/manifest.webmanifest"
          rel="manifest"
        />
      </head>
    `)
  })
})
