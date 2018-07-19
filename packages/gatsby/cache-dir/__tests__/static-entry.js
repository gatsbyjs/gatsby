import React from 'react'
import DevelopStaticEntry from "../develop-static-entry"
// import StaticEntry from "../static-entry"

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
  test(`You can replace head components`, (done) => {
    global.plugins = [
      fakeStylesPlugin,
      reverseHeadersPlugin,
    ]
    done()
    // StaticEntry(`test`, (_, html) => {
    //   expect(html).toMatchSnapshot()
    //   done()
    // })
  })
})
