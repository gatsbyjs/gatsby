import React from "react"
import fs from "fs"
const { join } = require(`path`)

import developStaticEntry from "../develop-static-entry"

// TODO Move to @testing-library/dom

jest.mock(`fs`, () => {
  const fs = jest.requireActual(`fs`)
  return {
    ...fs,
    readFileSync: jest.fn(),
    readFile: jest.fn(),
  }
})
jest.mock(`gatsby/package.json`, () => {
  return {
    version: `2.0.0`,
  }
})
jest.mock(
  `$virtual/ssr-sync-requires`,
  () => {
    return {
      ssrComponents: {
        "page-component---src-pages-about-js": () => null,
      },
    }
  },
  {
    virtual: true,
  }
)

jest.mock(
  `$virtual/async-requires`,
  () => {
    return {
      components: {
        "page-component---src-pages-test-js": () =>
          Promise.resolve({
            default: () => null,
          }),
      },
    }
  },
  {
    virtual: true,
  }
)

jest.mock(
  `../../public/chunk-map.json`,
  () => {
    return {}
  },
  {
    virtual: true,
  }
)

const pageDataMock = {
  componentChunkName: `page-component---src-pages-test-js`,
  path: `/about/`,
  staticQueryHashes: [],
  slicesMap: new Map(),
}

const webpackCompilationHash = `1234567890abcdef1234`

const MOCK_FILE_INFO = {
  [`${process.cwd()}/public/webpack.stats.json`]: `{}`,
  [`${process.cwd()}/public/chunk-map.json`]: `{}`,
  [join(process.cwd(), `/public/page-data/about/page-data.json`)]:
    JSON.stringify(pageDataMock),
  [join(process.cwd(), `/public/page-data/app-data.json`)]: JSON.stringify({
    webpackCompilationHash,
  }),
}

let staticEntry
beforeEach(() => {
  fs.readFileSync.mockImplementation(file => MOCK_FILE_INFO[file])
  fs.readFile.mockImplementation(file => Promise.resolve(MOCK_FILE_INFO[file]))
  staticEntry = require(`../static-entry`).default
})

const reverseHeadersPlugin = {
  plugin: {
    onPreRenderHTML: ({ getHeadComponents, replaceHeadComponents }) => {
      const headComponents = getHeadComponents()
      headComponents.reverse()
      replaceHeadComponents(headComponents)
    },
  },
}

const injectValuePlugin = (hookName, methodName, value) => {
  return {
    plugin: {
      [hookName]: staticEntry => {
        const method = staticEntry[methodName]
        method(value)
      },
    },
  }
}

const checkSanitized = components => {
  expect(components.includes(null)).toBeFalsy()
  expect(
    components.find(val => Array.isArray(val) && val.length === 0)
  ).toBeFalsy()
  expect(components.find(val => Array.isArray(val))).toBeFalsy()
}

const checkNonEmptyHeadersPlugin = {
  plugin: {
    onPreRenderHTML: ({
      getHeadComponents,
      getPreBodyComponents,
      getPostBodyComponents,
    }) => {
      const headComponents = getHeadComponents()
      const preBodyComponents = getPreBodyComponents()
      const postBodyComponents = getPostBodyComponents()
      checkSanitized(headComponents)
      checkSanitized(preBodyComponents)
      checkSanitized(postBodyComponents)
    },
  },
}

const fakeStylesPlugin = {
  plugin: {
    onRenderBody: ({ setHeadComponents }) =>
      setHeadComponents([
        <style key="style1"> .style1 {} </style>,
        <style key="style2"> .style2 {} </style>,
        <style key="style3"> .style3 {} </style>,
      ]),
  },
}

const reverseBodyComponentsPluginFactory = type => {
  return {
    plugin: {
      onPreRenderHTML: props => {
        const components = props[`get${type}BodyComponents`]()
        components.reverse()
        props[`replace${type}BodyComponents`](components)
      },
    },
  }
}

const fakeComponentsPluginFactory = type => {
  return {
    plugin: {
      onRenderBody: props => {
        props[`set${type}BodyComponents`]([
          <div key="div1"> div1 </div>,
          <div key="div2"> div2 </div>,
          <div key="div3"> div3 </div>,
        ])
      },
    },
  }
}

const publicDir = join(process.cwd(), `public`)
const SSR_DEV_MOCK_FILE_INFO = {
  [join(publicDir, `webpack.stats.json`)]: `{}`,
  [join(publicDir, `page-data/about/page-data.json`)]: JSON.stringify({
    componentChunkName: `page-component---src-pages-about-js`,
    path: `/about/`,
    staticQueryHashes: [],
  }),
  [join(publicDir, `page-data/app-data.json`)]: JSON.stringify({
    webpackCompilationHash,
  }),
}

describe(`develop-static-entry`, () => {
  const developStaticEntryArgs = {
    pagePath: `/about/`,
  }

  let ssrDevelopStaticEntry
  beforeEach(() => {
    fs.readFileSync.mockImplementation(file => SSR_DEV_MOCK_FILE_INFO[file])
    ssrDevelopStaticEntry = require(`../ssr-develop-static-entry`).default
    global.__PATH_PREFIX__ = ``
    global.__BASE_PATH__ = ``
    global.__ASSET_PREFIX__ = ``
    global.BROWSER_ESM_ONLY = false
  })

  test(`SSR: onPreRenderHTML can be used to replace headComponents`, async () => {
    global.plugins = [fakeStylesPlugin, reverseHeadersPlugin]

    const html = await ssrDevelopStaticEntry({
      pagePath: `/about/`,
      isClientOnlyPage: false,
      publicDir,
      error: null,
      serverData: undefined,
    })
    expect(html).toMatchSnapshot()
  })

  test(`SSR: onPreRenderHTML can be used to replace postBodyComponents`, async () => {
    global.plugins = [
      fakeComponentsPluginFactory(`Post`),
      reverseBodyComponentsPluginFactory(`Post`),
    ]

    const html = await ssrDevelopStaticEntry({
      pagePath: `/about/`,
      isClientOnlyPage: false,
      publicDir,
      error: null,
      serverData: undefined,
    })
    expect(html).toMatchSnapshot()
  })

  test(`SSR: onPreRenderHTML can be used to replace preBodyComponents`, async () => {
    global.plugins = [
      fakeComponentsPluginFactory(`Pre`),
      reverseBodyComponentsPluginFactory(`Pre`),
    ]

    const html = await ssrDevelopStaticEntry({
      pagePath: `/about/`,
      isClientOnlyPage: false,
      publicDir,
      error: null,
      serverData: undefined,
    })
    expect(html).toMatchSnapshot()
  })

  test(`SSR: onPreRenderHTML adds metatag note for development environment`, async () => {
    const html = await ssrDevelopStaticEntry({
      pagePath: `/about/`,
      isClientOnlyPage: false,
      publicDir,
      error: null,
      serverData: undefined,
    })
    expect(html).toContain(
      `<meta name="note" content="environment=development"/>`
    )
  })

  test(`SSR: onPreRenderHTML adds metatag note for development environment after replaceHeadComponents`, async () => {
    global.plugins = [reverseHeadersPlugin]

    const html = await ssrDevelopStaticEntry({
      pagePath: `/about/`,
      isClientOnlyPage: false,
      publicDir,
      error: null,
      serverData: undefined,
    })

    expect(html).toContain(
      `<meta name="note" content="environment=development"/>`
    )
  })

  test(`SSR: replaceRenderer can be sync`, async () => {
    global.plugins = [
      {
        plugin: {
          replaceRenderer: ({ replaceBodyHTMLString }) =>
            replaceBodyHTMLString(`i'm sync`),
        },
      },
    ]

    const html = await ssrDevelopStaticEntry({
      pagePath: `/about/`,
      isClientOnlyPage: false,
      publicDir,
      error: null,
      serverData: undefined,
    })
    expect(html).toContain(`i'm sync`)
  })

  test(`SSR: replaceRenderer can be async`, async () => {
    jest.useFakeTimers()
    global.plugins = [
      {
        plugin: {
          replaceRenderer: ({ replaceBodyHTMLString }) =>
            new Promise(resolve => {
              setTimeout(() => {
                replaceBodyHTMLString(`i'm async`)
                resolve()
              }, 1000)
            }),
        },
      },
    ]

    const htmlPromise = ssrDevelopStaticEntry({
      pagePath: `/about/`,
      isClientOnlyPage: false,
      publicDir,
      error: null,
      serverData: undefined,
    })
    jest.runAllTimers()
    jest.useRealTimers()
    expect(await htmlPromise).toContain(`i'm async`)
  })

  test(`onPreRenderHTML can be used to replace headComponents`, () => {
    global.plugins = [fakeStylesPlugin, reverseHeadersPlugin]

    const html = developStaticEntry(developStaticEntryArgs)
    expect(html).toMatchSnapshot()
  })

  test(`onPreRenderHTML can be used to replace postBodyComponents`, () => {
    global.plugins = [
      fakeComponentsPluginFactory(`Post`),
      reverseBodyComponentsPluginFactory(`Post`),
    ]

    const html = developStaticEntry(developStaticEntryArgs)
    expect(html).toMatchSnapshot()
  })

  test(`onPreRenderHTML can be used to replace preBodyComponents`, () => {
    global.plugins = [
      fakeComponentsPluginFactory(`Pre`),
      reverseBodyComponentsPluginFactory(`Pre`),
    ]

    const html = developStaticEntry(developStaticEntryArgs)
    expect(html).toMatchSnapshot()
  })

  test(`onPreRenderHTML adds metatag note for development environment`, () => {
    const html = developStaticEntry(developStaticEntryArgs)
    expect(html).toContain(
      `<meta name="note" content="environment=development"/>`
    )
  })

  test(`onPreRenderHTML adds metatag note for development environment after replaceHeadComponents`, () => {
    global.plugins = [reverseHeadersPlugin]

    const html = developStaticEntry(developStaticEntryArgs)
    expect(html).toContain(
      `<meta name="note" content="environment=development"/>`
    )
  })
})

describe(`static-entry sanity checks`, () => {
  const staticEntryFnArgs = {
    pagePath: `/about/`,
    pageData: pageDataMock,
    scripts: [],
    styles: [],
    reversedStyles: [],
    reversedScripts: [],
    sliceData: {},
  }

  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
    global.__BASE_PATH__ = ``
    global.__ASSET_PREFIX__ = ``
  })

  const methodsToCheck = [
    `replaceHeadComponents`,
    `replacePreBodyComponents`,
    `replacePostBodyComponents`,
  ]

  methodsToCheck.forEach(methodName => {
    test(`${methodName} can filter out null value`, () => {
      const plugin = injectValuePlugin(`onPreRenderHTML`, methodName, null)
      global.plugins = [plugin, checkNonEmptyHeadersPlugin]

      staticEntry(staticEntryFnArgs)
    })

    test(`${methodName} can filter out null values`, () => {
      const plugin = injectValuePlugin(`onPreRenderHTML`, methodName, [
        null,
        null,
      ])
      global.plugins = [plugin, checkNonEmptyHeadersPlugin]

      staticEntry(staticEntryFnArgs)
    })

    test(`${methodName} can filter out empty array`, () => {
      const plugin = injectValuePlugin(`onPreRenderHTML`, methodName, [])
      global.plugins = [plugin, checkNonEmptyHeadersPlugin]

      staticEntry(staticEntryFnArgs)
    })

    test(`${methodName} can filter out empty arrays`, () => {
      const plugin = injectValuePlugin(`onPreRenderHTML`, methodName, [[], []])
      global.plugins = [plugin, checkNonEmptyHeadersPlugin]

      staticEntry(staticEntryFnArgs)
    })

    test(`${methodName} can flatten arrays`, () => {
      const plugin = injectValuePlugin(`onPreRenderHTML`, methodName, [
        <style key="style1"> .style1 {} </style>,
        <style key="style2"> .style2 {} </style>,
        <style key="style3"> .style3 {} </style>,
        [<style key="style4"> .style3 {} </style>],
      ])
      global.plugins = [plugin, checkNonEmptyHeadersPlugin]

      staticEntry(staticEntryFnArgs)
    })
  })
})

describe(`static-entry`, () => {
  const staticEntryFnArgs = {
    pagePath: `/about/`,
    pageData: pageDataMock,
    scripts: [],
    styles: [],
    reversedStyles: [],
    reversedScripts: [],
    webpackCompilationHash,
  }

  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
    global.__BASE_PATH__ = ``
    fs.readFileSync.mockImplementation(file => MOCK_FILE_INFO[file])
  })

  test(`onPreRenderHTML can be used to replace headComponents`, async () => {
    global.plugins = [fakeStylesPlugin, reverseHeadersPlugin]

    const html = await staticEntry(staticEntryFnArgs)
    expect(html).toMatchSnapshot()
  })

  test(`onPreRenderHTML can be used to replace postBodyComponents`, async () => {
    global.plugins = [
      fakeComponentsPluginFactory(`Post`),
      reverseBodyComponentsPluginFactory(`Post`),
    ]

    const html = await staticEntry(staticEntryFnArgs)
    expect(html).toMatchSnapshot()
  })

  test(`onPreRenderHTML can be used to replace preBodyComponents`, async () => {
    global.plugins = [
      fakeComponentsPluginFactory(`Pre`),
      reverseBodyComponentsPluginFactory(`Pre`),
    ]

    const html = await staticEntry(staticEntryFnArgs)
    expect(html).toMatchSnapshot()
  })

  test(`onPreRenderHTML does not add metatag note for development environment`, async () => {
    const { html } = await staticEntry(staticEntryFnArgs)
    expect(html).not.toContain(
      `<meta name="note" content="environment=development"/>`
    )
  })

  test(`replaceRenderer does allow sync rendering`, async () => {
    global.plugins = [
      {
        plugin: {
          replaceRenderer: ({ replaceBodyHTMLString }) =>
            replaceBodyHTMLString(`i'm sync`),
        },
      },
    ]

    const { html } = await staticEntry(staticEntryFnArgs)
    expect(html).toContain(`i'm sync`)
  })

  test(`replaceRenderer does allow async rendering`, async () => {
    global.plugins = [
      {
        plugin: {
          replaceRenderer: ({ replaceBodyHTMLString }) =>
            new Promise(resolve => {
              setTimeout(() => {
                replaceBodyHTMLString(`i'm async`)
                resolve()
              }, 1000)
            }),
        },
      },
    ]

    const { html } = await staticEntry(staticEntryFnArgs)
    expect(html).toContain(`async`)
  })
})

describe(`sanitizeComponents`, () => {
  let sanitizeComponents

  beforeEach(() => {
    fs.readFileSync.mockImplementation(file => MOCK_FILE_INFO[file])
    sanitizeComponents = require(`../static-entry`).sanitizeComponents
  })

  it(`strips assetPrefix for manifest link`, () => {
    global.__PATH_PREFIX__ = `https://gatsbyjs.com/blog`
    global.__BASE_PATH__ = `/blog`
    global.__ASSET_PREFIX__ = `https://gatsbyjs.com`

    const sanitizedComponents = sanitizeComponents([
      <link
        key="manifest"
        rel="manifest"
        href="https://gatsbyjs.com/blog/manifest.webmanifest"
      />,
    ])
    expect(sanitizedComponents[0].props.href).toBe(`/blog/manifest.webmanifest`)
  })
})

describe(`reorderHeadComponents`, () => {
  let reorderHeadComponents

  beforeEach(() => {
    fs.readFileSync.mockImplementation(file => MOCK_FILE_INFO[file])
    reorderHeadComponents = require(`../static-entry`).reorderHeadComponents
  })

  const exampleHead = [
    <style key="style1"> .style1 {} </style>,
    <style key="style2"> .style2 {} </style>,
    <script key="json-ld" type="application/ld+json">
      {`
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "url": "https://www.spookytech.com",
          "name": "Spooky technologies",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+5-601-785-8543",
            "contactType": "Customer Support"
          }
        }
      `}
    </script>,
    <link key="canonical" rel="canonical" href="url" />,
    <link key="icon" rel="icon" type="image/svg+xml" href="favicon" />,
    <meta key="desc" name="description" content="desc 1" />,
    <meta key="og:url" property="og:url" content="url" />,
    <meta key="og:desc" property="og:description" content="desc 2" />,
  ]

  it(`reorders meta tags in front of other tags and keeps original order (for moved meta tags)`, () => {
    const reordered = reorderHeadComponents(exampleHead)
    const keyList = reordered.map(e => e.key)
    expect(keyList).toEqual([
      `desc`,
      `og:url`,
      `og:desc`,
      `style1`,
      `style2`,
      `json-ld`,
      `canonical`,
      `icon`,
    ])
  })
})
