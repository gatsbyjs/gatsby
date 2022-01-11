/**
 * @jest-environment jsdom
 */

import React from "react"

jest.mock(`react-typography`, () => {
  return {
    GoogleFont: () => <link />,
  }
})

const mockTypographyCache = (googleFonts = [`Roboto`]) => {
  jest.doMock(
    `typography-plugin-cache-endpoint`,
    () => {
      return {
        injectStyles: () => {},
        options: {
          googleFonts: [].concat(googleFonts),
        },
      }
    },
    { virtual: true }
  )
}

describe(`gatsby-plugin-typography`, () => {
  beforeAll(() => {
    process.env.BUILD_STAGE = `develop`
  })

  afterAll(() => {
    delete process.env.BUILD_STAGE
  })

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
    Array.from(global.document.head.children).forEach(child => child.remove())
    mockTypographyCache()
  })

  it(`should render googlefonts`, () => {
    const onClientEntry = require(`../gatsby-browser`).onClientEntry
    onClientEntry(null, {})

    const link = document.querySelector(`[data-gatsby-typography]`)
    expect(link).toBeTruthy()
  })

  it(`shouldn't render googlefonts when omitGoogleFonts is true`, () => {
    const onClientEntry = require(`../gatsby-browser`).onClientEntry
    onClientEntry(null, {
      omitGoogleFont: true,
    })

    const link = document.querySelector(`[data-gatsby-typography]`)
    expect(link).toBeNull()
  })

  it(`shouldn't render googlefonts when no fonts are set`, () => {
    mockTypographyCache([])
    const onClientEntry = require(`../gatsby-browser`).onClientEntry
    onClientEntry(null, {})

    const link = document.querySelector(`[data-gatsby-typography]`)
    expect(link).toBeNull()
  })
})
