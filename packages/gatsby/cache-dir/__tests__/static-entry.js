import React from 'react'
import DevelopStaticEntry from '../develop-static-entry'

jest.mock(`fs`)

jest.mock(
  `../sync-requires`,
  () => {
    return {
      components: {
        'page-component---src-pages-test-js': () => null,
      },
    }
  },
  { virtual: true }
)

jest.mock(
  `../data.json`,
  () => {
    return {
      dataPaths: [{
        [`about.json`]: `/400/about`,
      }],
      pages: [{
          path: `/about/`,
          componentChunkName: `page-component---src-pages-test-js`,
          jsonName: `about.json`,
      }],
    }
  },
  { virtual: true }
)


const MOCK_FILE_INFO = {
  [`${process.cwd()}/public/webpack.stats.json`]: `{}`,
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
    onRenderBody: ({ setHeadComponents }) => setHeadComponents([
      <style key="style1">.style1 {}</style>,
      <style key="style2">.style2 {}</style>,
      <style key="style3">.style3 {}</style>,
    ]),
  },
}

describe(`develop-static-entry`, () => {
  test(`onPreRenderHTML can be used to replace head components`, (done) => {
    global.plugins = [
      fakeStylesPlugin,
      reverseHeadersPlugin,
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

  test(`onPreRenderHTML can be used to replace head components`, (done) => {
    global.plugins = [
      fakeStylesPlugin,
      reverseHeadersPlugin,
    ]

    StaticEntry(`/about/`, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })
})
