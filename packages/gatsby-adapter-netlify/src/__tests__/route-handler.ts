import fs from "fs-extra"
import { tmpdir } from "os"
import { join } from "path"
import type { IRedirectRoute, RoutesManifest } from "gatsby"
import {
  injectEntries,
  ADAPTER_MARKER_START,
  ADAPTER_MARKER_END,
  NETLIFY_PLUGIN_MARKER_START,
  NETLIFY_PLUGIN_MARKER_END,
  GATSBY_PLUGIN_MARKER_START,
  processRoutesManifest,
} from "../route-handler"

function generateLotOfContent(placeholderCharacter: string): string {
  return (placeholderCharacter.repeat(80) + `\n`).repeat(1_000_000)
}

const newAdapterContent = generateLotOfContent(`a`)
const previousAdapterContent =
  ADAPTER_MARKER_START +
  `\n` +
  generateLotOfContent(`b`) +
  ADAPTER_MARKER_END +
  `\n`

const gatsbyPluginNetlifyContent =
  GATSBY_PLUGIN_MARKER_START + `\n` + generateLotOfContent(`c`)

const netlifyPluginGatsbyContent =
  NETLIFY_PLUGIN_MARKER_START +
  `\n` +
  generateLotOfContent(`c`) +
  NETLIFY_PLUGIN_MARKER_END +
  `\n`

const customContent1 =
  `# customContent1 start` +
  `\n` +
  generateLotOfContent(`x`) +
  `# customContent1 end` +
  `\n`
const customContent2 =
  `# customContent2 start` +
  `\n` +
  generateLotOfContent(`y`) +
  `# customContent2 end` +
  `\n`
const customContent3 =
  `# customContent3 start` +
  `\n` +
  generateLotOfContent(`z`) +
  `# customContent3 end` +
  `\n`

async function getContent(previousContent?: string): Promise<string> {
  const filePath = join(
    await fs.mkdtemp(join(tmpdir(), `inject-entries`)),
    `out.txt`
  )

  if (typeof previousContent !== `undefined`) {
    await fs.writeFile(filePath, previousContent)
  }

  await injectEntries(filePath, newAdapterContent)

  return fs.readFile(filePath, `utf8`)
}

jest.setTimeout(60_000)

describe(`route-handler`, () => {
  describe(`injectEntries`, () => {
    it(`no cached file`, async () => {
      const content = await getContent()

      expect(content.indexOf(newAdapterContent)).not.toBe(-1)
    })

    describe(`has cached file`, () => {
      it(`no previous adapter or plugins or custom entries`, async () => {
        const content = await getContent(``)

        expect(content.indexOf(newAdapterContent)).not.toBe(-1)
      })

      it(`has just custom entries`, async () => {
        const content = await getContent(customContent1)

        expect(content.indexOf(newAdapterContent)).not.toBe(-1)
        expect(content.indexOf(customContent1)).not.toBe(-1)
      })

      it(`has just gatsby-plugin-netlify entries`, async () => {
        const content = await getContent(gatsbyPluginNetlifyContent)

        expect(content.indexOf(newAdapterContent)).not.toBe(-1)
        // it removes gatsby-plugin-netlify entries
        expect(content.indexOf(GATSBY_PLUGIN_MARKER_START)).toBe(-1)
        expect(content.indexOf(gatsbyPluginNetlifyContent)).toBe(-1)
      })

      it(`has just netlify-plugin-gatsby entries`, async () => {
        const content = await getContent(netlifyPluginGatsbyContent)

        expect(content.indexOf(newAdapterContent)).not.toBe(-1)
        // it removes netlify-plugin-gatsby entries
        expect(content.indexOf(NETLIFY_PLUGIN_MARKER_START)).toBe(-1)
        expect(content.indexOf(NETLIFY_PLUGIN_MARKER_END)).toBe(-1)
        expect(content.indexOf(netlifyPluginGatsbyContent)).toBe(-1)
      })

      it(`has gatsby-plugin-netlify, nelify-plugin-gatsby, custom content and previous adapter content`, async () => {
        // kitchen-sink
        const previousContent =
          customContent1 +
          previousAdapterContent +
          customContent2 +
          netlifyPluginGatsbyContent +
          customContent3 +
          gatsbyPluginNetlifyContent

        const content = await getContent(previousContent)

        expect(content.indexOf(newAdapterContent)).not.toBe(-1)

        // it preserve any custom entries
        expect(content.indexOf(customContent1)).not.toBe(-1)
        expect(content.indexOf(customContent2)).not.toBe(-1)
        expect(content.indexOf(customContent3)).not.toBe(-1)

        // it removes previous gatsby-adapter-netlify entries
        expect(content.indexOf(previousAdapterContent)).toBe(-1)

        // it removes gatsby-plugin-netlify entries
        expect(content.indexOf(GATSBY_PLUGIN_MARKER_START)).toBe(-1)
        expect(content.indexOf(gatsbyPluginNetlifyContent)).toBe(-1)

        // it removes netlify-plugin-gatsby entries
        expect(content.indexOf(NETLIFY_PLUGIN_MARKER_START)).toBe(-1)
        expect(content.indexOf(NETLIFY_PLUGIN_MARKER_END)).toBe(-1)
        expect(content.indexOf(netlifyPluginGatsbyContent)).toBe(-1)
      })
    })
  })

  describe(`createRedirects`, () => {
    it(`honors the force parameter`, async () => {
      const manifest: RoutesManifest = [
        {
          path: `/old-url`,
          type: `redirect`,
          toPath: `/new-url`,
          status: 301,
          headers: [{ key: `string`, value: `string` }],
          force: true,
        },
        {
          path: `/old-url2`,
          type: `redirect`,
          toPath: `/new-url2`,
          status: 308,
          headers: [{ key: `string`, value: `string` }],
          force: false,
        },
      ]

      const { redirects } = processRoutesManifest(manifest)

      // `!` is appended to status to mark forced redirect
      expect(redirects).toMatch(/^\/old-url\s+\/new-url\s+301!$/m)
      // `!` is not appended to status to mark not forced redirect
      expect(redirects).toMatch(/^\/old-url2\s+\/new-url2\s+308$/m)
    })

    it(`honors the conditions parameter`, async () => {
      const redirect: IRedirectRoute = {
        path: `/old-url`,
        type: `redirect`,
        toPath: `/new-url`,
        status: 200,
        headers: [{ key: `string`, value: `string` }],
        conditions: { language: [`ca`, `us`] },
      }

      const { redirects } = processRoutesManifest([redirect])
      expect(redirects).toMatch(
        /^\/old-url\s+\/new-url\s+200\s+Language=ca,us$/m
      )
    })
  })
})
