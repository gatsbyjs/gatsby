import createSiteConfig from "../create-site-config"
import * as fs from "fs-extra"

jest.mock(`fs-extra`, () => {
  return {
    writeJSON: jest.fn(),
  }
})

describe(`create-site-config`, () => {
  beforeEach(() => {
    fs.writeJSON.mockClear()
  })

  it(`should generate a site-config file with pathPrefix null`, async () => {
    await createSiteConfig(
      {
        pathPrefix: ``,
        publicFolder: file => `public/${file}`,
      },
      {}
    )

    expect(fs.writeJSON).toBeCalledTimes(1)
    expect(fs.writeJSON.mock.calls[0][0]).toBe(`public/_gatsby-config.json`)
    expect(fs.writeJSON.mock.calls[0][1]).toMatchInlineSnapshot(`
      Object {
        "pathPrefix": null,
      }
    `)
  })

  it(`should generate a site-config file with pathPrefix set`, async () => {
    await createSiteConfig(
      {
        pathPrefix: `/nested`,
        publicFolder: file => `public/${file}`,
      },
      {}
    )

    expect(fs.writeJSON).toBeCalledTimes(1)
    expect(fs.writeJSON.mock.calls[0][0]).toBe(`public/_gatsby-config.json`)
    expect(fs.writeJSON.mock.calls[0][1]).toMatchInlineSnapshot(`
      Object {
        "pathPrefix": "/nested",
      }
    `)
  })
})
