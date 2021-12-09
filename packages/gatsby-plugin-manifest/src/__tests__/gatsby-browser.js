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
  let onRouteUpdate

  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
    global.__MANIFEST_PLUGIN_HAS_LOCALISATION__ = true
    onRouteUpdate = require(`../gatsby-browser`).onRouteUpdate
    document.head.innerHTML = `<link rel="manifest" href="/manifest.webmanifest">`
  })

  afterAll(() => {
    delete global.__MANIFEST_PLUGIN_HAS_LOCALISATION__
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
    // add default lang
    pluginOptions.lang = `en`
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
    // add default lang
    pluginOptions.lang = `en`
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

  test(`use correct localized manifest when path prefix is used`, () => {
    global.__PATH_PREFIX__ = `/test`

    const location = {
      pathname: `/test/es/`,
    }
    // add default lang
    pluginOptions.lang = `en`
    onRouteUpdate({ location }, pluginOptions)
    expect(document.head).toMatchInlineSnapshot(`
      <head>
        <link
          href="/test/manifest_es.webmanifest"
          rel="manifest"
        />
      </head>
    `)
  })
})
