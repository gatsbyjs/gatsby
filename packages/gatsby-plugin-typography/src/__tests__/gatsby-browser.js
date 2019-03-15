import React from "react"
import * as path from "path"
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from "fs"

const cacheDir = path.join(__dirname, `../.cache`)

describe(`gatsby-plugin-typography`, () => {
  let onClientEntry
  beforeAll(() => {
    jest.mock(`react-typography`, () => {
      return {
        GoogleFont: () => <link />,
      }
    })
    process.env.BUILD_STAGE = `develop`

    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir)
    }

    writeFileSync(`${cacheDir}/typography.js`, `module.exports = {}`)
  })

  afterAll(() => {
    process.env.BUILD_STAGE = `develop`

    unlinkSync(`${cacheDir}/typography.js`)
    rmdirSync(cacheDir)
  })

  beforeEach(() => {
    Array.from(global.document.head.children).forEach(child => child.remove())
    jest.resetModules()
    jest.mock(`../.cache/typography`, () => {
      return {
        injectStyles: () => {},
        options: {
          googleFonts: [`Roboto`],
        },
      }
    })
  })

  it(`should render googlefonts`, () => {
    onClientEntry = require(`../gatsby-browser`).onClientEntry
    onClientEntry(null, {})

    const link = document.querySelector(`[data-gatsby-typography]`)
    expect(link).toBeTruthy()
  })

  it(`shouldn't render googlefonts when omitGoogleFonts is true`, () => {
    onClientEntry = require(`../gatsby-browser`).onClientEntry
    onClientEntry(null, {
      omitGoogleFont: true,
    })

    const link = document.querySelector(`[data-gatsby-typography]`)
    expect(link).toBeNull()
  })

  it(`shouldn't render googlefonts when no fonts are set`, () => {
    jest.mock(`../.cache/typography`, () => {
      return {
        injectStyles: () => {},
        options: {
          googleFonts: [],
        },
      }
    })
    onClientEntry = require(`../gatsby-browser`).onClientEntry
    onClientEntry(null, {})

    const link = document.querySelector(`[data-gatsby-typography]`)
    expect(link).toBeNull()
  })
})
