import * as path from "path"
import * as fs from "fs-extra"
import { addFieldToMinimalSiteMetadata } from "../site-metadata"

const name = `title`
const value = `Arrakis`

jest.mock(`fs-extra`, () => {
  const fs = jest.requireActual(`fs-extra`)
  return { ...fs, writeFile: jest.fn() }
})

const writeFileMock = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>

describe(`site-metadata`, () => {
  describe(`addFieldToMinimalSiteMetadata`, () => {
    beforeEach(() => {
      writeFileMock.mockClear()
    })

    it(`works for simplest case`, async () => {
      const root = path.join(__dirname, `./fixtures`)

      await addFieldToMinimalSiteMetadata({ root }, { name, value })

      expect(writeFileMock.mock.calls[0][1]).toMatchInlineSnapshot(`
        "module.exports = {
          siteMetadata: {
            title: \`Arrakis\`,
            siteUrl: \`https://www.yourdomain.tld\`,
          },
          plugins: [
            \\"gatsby-transformer-remark\\",
            {
              resolve: \\"gatsby-plugin-mdx\\",
              options: {}
            }
          ]
        }"
      `)
    })
  })
})
