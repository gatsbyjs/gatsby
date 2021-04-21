import React from "react"
import fs from "fs"
const { join } = require(`path`)

import developStaticEntry from "../develop-static-entry"

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
  `$virtual/sync-requires`,
  () => {
    return {
      components: {
        "page-component---src-pages-test-js": () => null,
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
  webpackCompilationHash: `1234567890abcdef1234`,
  staticQueryHashes: [],
}

const MOCK_FILE_INFO = {
  [`${process.cwd()}/public/webpack.stats.json`]: `{}`,
  [`${process.cwd()}/public/chunk-map.json`]: `{}`,
  [join(
    process.cwd(),
    `/public/page-data/about/page-data.json`
  )]: JSON.stringify(pageDataMock),
  [join(process.cwd(), `/public/page-data/app-data.json`)]: JSON.stringify({
    webpackCompilationHash: `1234567890abcdef1234`,
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
    webpackCompilationHash: `1234567890abcdef1234`,
    staticQueryHashes: [],
  }),
  [join(publicDir, `page-data/app-data.json`)]: JSON.stringify({
    webpackCompilationHash: `1234567890abcdef1234`,
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
  })

  test(`SSR: onPreRenderHTML can be used to replace headComponents`, done => {
    global.plugins = [fakeStylesPlugin, reverseHeadersPlugin]

    ssrDevelopStaticEntry(`/about/`, false, publicDir, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })

  test(`SSR: onPreRenderHTML can be used to replace postBodyComponents`, done => {
    global.plugins = [
      fakeComponentsPluginFactory(`Post`),
      reverseBodyComponentsPluginFactory(`Post`),
    ]

    ssrDevelopStaticEntry(`/about/`, false, publicDir, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })

  test(`SSR: onPreRenderHTML can be used to replace preBodyComponents`, done => {
    global.plugins = [
      fakeComponentsPluginFactory(`Pre`),
      reverseBodyComponentsPluginFactory(`Pre`),
    ]

    ssrDevelopStaticEntry(`/about/`, false, publicDir, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })

  test(`SSR: onPreRenderHTML adds metatag note for development environment`, done => {
    ssrDevelopStaticEntry(`/about/`, false, publicDir, (_, html) => {
      expect(html).toContain(
        `<meta name="note" content="environment=development"/>`
      )
      done()
    })
  })

  test(`SSR: onPreRenderHTML adds metatag note for development environment after replaceHeadComponents`, done => {
    global.plugins = [reverseHeadersPlugin]

    ssrDevelopStaticEntry(`/about/`, false, publicDir, (_, html) => {
      expect(html).toContain(
        `<meta name="note" content="environment=development"/>`
      )
      done()
    })
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
  }

  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
    global.__BASE_PATH__ = ``
    fs.readFileSync.mockImplementation(file => MOCK_FILE_INFO[file])
  })

  test(`onPreRenderHTML can be used to replace headComponents`, () => {
    global.plugins = [fakeStylesPlugin, reverseHeadersPlugin]

    const html = staticEntry(staticEntryFnArgs)
    expect(html).toMatchSnapshot()
  })

  test(`onPreRenderHTML can be used to replace postBodyComponents`, () => {
    global.plugins = [
      fakeComponentsPluginFactory(`Post`),
      reverseBodyComponentsPluginFactory(`Post`),
    ]

    const html = staticEntry(staticEntryFnArgs)
    expect(html).toMatchSnapshot()
  })

  test(`onPreRenderHTML can be used to replace preBodyComponents`, () => {
    global.plugins = [
      fakeComponentsPluginFactory(`Pre`),
      reverseBodyComponentsPluginFactory(`Pre`),
    ]

    const html = staticEntry(staticEntryFnArgs)
    expect(html).toMatchSnapshot()
  })

  test(`onPreRenderHTML does not add metatag note for development environment`, () => {
    const html = staticEntry(staticEntryFnArgs)
    expect(html).not.toContain(
      `<meta name="note" content="environment=development"/>`
    )
  })
})

describe(`sanitizeComponents`, () => {
  let sanitizeComponents

  beforeEach(() => {
    fs.readFileSync.mockImplementation(file => MOCK_FILE_INFO[file])
    sanitizeComponents = require(`../static-entry`).sanitizeComponents
  })

  it(`strips assetPrefix for manifest link`, () => {
    global.__PATH_PREFIX__ = `https://gatsbyjs.org/blog`
    global.__BASE_PATH__ = `/blog`
    global.__ASSET_PREFIX__ = `https://gatsbyjs.org`

    const sanitizedComponents = sanitizeComponents([
      <link
        key="manifest"
        rel="manifest"
        href="https://gatsbyjs.org/blog/manifest.webmanifest"
      />,
    ])
    expect(sanitizedComponents[0].props.href).toBe(`/blog/manifest.webmanifest`)
  })
})
