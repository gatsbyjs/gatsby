import React from "react"
import DevelopStaticEntry from "../develop-static-entry"

jest.mock(`fs`)
jest.mock(`gatsby/package.json`, () => ({
  version: '2.0.0'
}));

jest.mock(
  `../sync-requires`,
  () => {
    return {
      components: {
        "page-component---src-pages-test-js": () => null,
      },
    }
  },
  { virtual: true }
)

jest.mock(
  `../data.json`,
  () => {
    return {
      dataPaths: [
        {
          [`about.json`]: `/400/about`,
        },
      ],
      pages: [
        {
          path: `/about/`,
          componentChunkName: `page-component---src-pages-test-js`,
          jsonName: `about.json`,
        },
      ],
    }
  },
  { virtual: true }
)

const MOCK_FILE_INFO = {
  [`${process.cwd()}/public/webpack.stats.json`]: `{}`,
  [`${process.cwd()}/public/chunk-map.json`]: `{}`,
}

require(`fs`).__setMockFiles(MOCK_FILE_INFO)

// Needs to be imported after __setMockFiles is called, and imports get hoisted.
const StaticEntry = require(`../static-entry`).default

const reverseHeadersPlugin = {
  plugin: {
    onPreRenderHTML: ({ getHeadComponents, replaceHeadComponents }) => {
      const headComponents = getHeadComponents()
      headComponents.reverse()
      replaceHeadComponents(headComponents)
    },
  },
}

const fakeStylesPlugin = {
  plugin: {
    onRenderBody: ({ setHeadComponents }) =>
      setHeadComponents([
        <style key="style1">.style1 {}</style>,
        <style key="style2">.style2 {}</style>,
        <style key="style3">.style3 {}</style>,
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
          <div key="div1">div1</div>,
          <div key="div2">div2</div>,
          <div key="div3">div3</div>,
        ])
      },
    },
  }
}

describe(`develop-static-entry`, () => {
  test(`onPreRenderHTML can be used to replace headComponents`, done => {
    global.plugins = [fakeStylesPlugin, reverseHeadersPlugin]

    DevelopStaticEntry(`/about/`, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })

  test(`onPreRenderHTML can be used to replace postBodyComponents`, done => {
    global.plugins = [
      fakeComponentsPluginFactory(`Post`),
      reverseBodyComponentsPluginFactory(`Post`),
    ]

    DevelopStaticEntry(`/about/`, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })

  test(`onPreRenderHTML can be used to replace preBodyComponents`, done => {
    global.plugins = [
      fakeComponentsPluginFactory(`Pre`),
      reverseBodyComponentsPluginFactory(`Pre`),
    ]

    DevelopStaticEntry(`/about/`, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })
})

describe(`static-entry`, () => {
  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
  })

  test(`onPreRenderHTML can be used to replace headComponents`, done => {
    global.plugins = [fakeStylesPlugin, reverseHeadersPlugin]

    StaticEntry(`/about/`, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })

  test(`onPreRenderHTML can be used to replace postBodyComponents`, done => {
    global.plugins = [
      fakeComponentsPluginFactory(`Post`),
      reverseBodyComponentsPluginFactory(`Post`),
    ]

    StaticEntry(`/about/`, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })

  test(`onPreRenderHTML can be used to replace preBodyComponents`, done => {
    global.plugins = [
      fakeComponentsPluginFactory(`Pre`),
      reverseBodyComponentsPluginFactory(`Pre`),
    ]

    StaticEntry(`/about/`, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })
})
