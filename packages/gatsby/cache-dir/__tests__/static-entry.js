import React from 'react'
import DevelopStaticEntry from '../develop-static-entry'
// jest.mock(`../sync-requires`)
import StaticEntry from '../static-entry'

jest.mock(`../sync-requires`, () => { return {} }, { virtual: true })
jest.mock(
  `../data.json`, () => {
    return {
      dataPaths: [],
      pages: [],
    }
  },
  { virtual: true })

jest.mock(`fs`)

require(`fs`).__setMockFiles({
  [`${process.cwd()}/public/webpack.stats.json`]: `{}`,
})

const reverseHeadersPlugin = {
  plugin: {
    onPreRenderHTML: ({ headComponents, replaceHeadComponents }) => {
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
    ]),
  },
}

describe(`develop-static-entry`, () => {
  test(`You can replace head components`, (done) => {
    global.plugins = [
      fakeStylesPlugin,
      reverseHeadersPlugin,
    ]

    DevelopStaticEntry(`test`, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })
})

describe(`static-entry`, () => {
  beforeEach(() => {
    global.__PATH_PREFIX__ = ``
  })

  test(`You can replace head components`, (done) => {
    global.plugins = [
      fakeStylesPlugin,
      reverseHeadersPlugin,
    ]
    done()
    StaticEntry(`test`, (_, html) => {
      expect(html).toMatchSnapshot()
      done()
    })
  })
})
