import type { HeaderRoutes, IRedirectRoute, RoutesManifest } from "gatsby"

jest.mock(`fs-extra`, () => {
  return {
    ...jest.requireActual(`fs-extra`),
    outputJSONSync: jest.fn(),
  }
})

import { outputJSONSync } from "fs-extra"
import { handleRoutesManifest, processRoutesManifest } from "../route-handler"

describe(`route-handler`, () => {
  describe(`processRoutesManifest`, () => {
    describe(`redirects`, () => {
      it(`honors the force parameter`, () => {
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

        expect(redirects).toContainEqual({
          from: `/old-url`,
          to: `/new-url`,
          status: 301,
          force: true,
        })
        // `force` is omitted entirely (rather than `false`) when not forced
        expect(redirects).toContainEqual({
          from: `/old-url2`,
          to: `/new-url2`,
          status: 308,
        })
      })

      it(`honors the conditions parameter`, () => {
        const redirect: IRedirectRoute = {
          path: `/old-url`,
          type: `redirect`,
          toPath: `/new-url`,
          status: 200,
          headers: [{ key: `string`, value: `string` }],
          conditions: { language: [`ca`, `us`] },
        }

        const { redirects } = processRoutesManifest([redirect])

        expect(redirects).toContainEqual({
          from: `/old-url`,
          to: `/new-url`,
          status: 200,
          conditions: { Language: [`ca`, `us`] },
        })
      })

      it(`passes through query and signed parameters`, () => {
        const redirect: IRedirectRoute = {
          path: `/old-url`,
          type: `redirect`,
          toPath: `/new-url`,
          status: 200,
          headers: [],
          query: { foo: `bar` },
          signed: `some-signing-secret`,
        }

        const { redirects } = processRoutesManifest([redirect])

        expect(redirects).toContainEqual({
          from: `/old-url`,
          to: `/new-url`,
          status: 200,
          query: { foo: `bar` },
          signed: `some-signing-secret`,
        })
      })

      it(`replaces wildcards with splat syntax`, () => {
        const redirect: IRedirectRoute = {
          path: `/old-url/*`,
          type: `redirect`,
          toPath: `/new-url/*`,
          status: 301,
          headers: [],
        }

        const { redirects } = processRoutesManifest([redirect])

        expect(redirects).toContainEqual({
          from: `/old-url/*`,
          to: `/new-url/:splat`,
          status: 301,
        })
      })
    })

    describe(`headers`, () => {
      it(`builds headers from static routes when no headerRoutes are provided`, () => {
        const manifest: RoutesManifest = [
          {
            path: `/some-page`,
            type: `static`,
            filePath: `public/some-page.html`,
            headers: [
              { key: `x-custom-header`, value: `foo` },
              { key: `x-other-header`, value: `bar` },
            ],
          },
        ]

        const { headers } = processRoutesManifest(manifest)

        expect(headers).toContainEqual({
          for: `/some-page`,
          values: {
            "x-custom-header": `foo`,
            "x-other-header": `bar`,
          },
        })
      })

      it(`omits routes that don't have any headers`, () => {
        const manifest: RoutesManifest = [
          {
            path: `/some-page`,
            type: `static`,
            filePath: `public/some-page.html`,
            headers: [],
          },
        ]

        const { headers } = processRoutesManifest(manifest)

        expect(headers).toEqual([])
      })

      it(`uses headerRoutes instead of route headers when provided`, () => {
        const manifest: RoutesManifest = [
          {
            path: `/some-page`,
            type: `static`,
            filePath: `public/some-page.html`,
            headers: [{ key: `x-custom-header`, value: `foo` }],
          },
        ]
        const headerRoutes: HeaderRoutes = [
          {
            path: `/*`,
            headers: [{ key: `x-global-header`, value: `baz` }],
          },
        ]

        const { headers } = processRoutesManifest(manifest, headerRoutes)

        expect(headers).toEqual([
          {
            for: `/*`,
            values: { "x-global-header": `baz` },
          },
        ])
      })
    })
  })

  describe(`handleRoutesManifest`, () => {
    beforeEach(() => {
      jest.mocked(outputJSONSync).mockClear()
    })

    it(`writes redirects and headers to the Frameworks API config file`, async () => {
      const manifest: RoutesManifest = [
        {
          path: `/old-url`,
          type: `redirect`,
          toPath: `/new-url`,
          status: 301,
          headers: [],
        },
      ]
      const headerRoutes: HeaderRoutes = [
        {
          path: `/*`,
          headers: [{ key: `x-global-header`, value: `baz` }],
        },
      ]

      await handleRoutesManifest(manifest, headerRoutes)

      expect(outputJSONSync).toHaveBeenCalledTimes(1)
      const [filePath, config] = jest.mocked(outputJSONSync).mock.calls[0]

      expect(filePath).toMatch(/\.netlify[/\\]v1[/\\]config\.json$/)
      expect(config).toEqual({
        redirects: [{ from: `/old-url`, to: `/new-url`, status: 301 }],
        headers: [{ for: `/*`, values: { "x-global-header": `baz` } }],
      })
    })

    it(`includes images.remote_images when remoteFileAllowedUrls is passed`, async () => {
      await handleRoutesManifest(
        [],
        [],
        [
          {
            urlPattern: `https://example.com/*`,
            regexSource: `^https://example\\.com/.*$`,
          },
        ]
      )

      const [, config] = jest.mocked(outputJSONSync).mock.calls[0]

      expect(config).toMatchObject({
        images: {
          remote_images: [`^https://example\\.com/.*$`],
        },
      })
    })

    it(`omits images config when remoteFileAllowedUrls is not passed`, async () => {
      await handleRoutesManifest([], [])

      const [, config] = jest.mocked(outputJSONSync).mock.calls[0]

      expect(config).not.toHaveProperty(`images`)
    })

    it(`omits images config when remoteFileAllowedUrls is empty`, async () => {
      await handleRoutesManifest([], [], [])

      const [, config] = jest.mocked(outputJSONSync).mock.calls[0]

      expect(config).not.toHaveProperty(`images`)
    })
  })
})
