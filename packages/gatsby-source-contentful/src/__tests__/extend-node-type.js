/**
 * @jest-environment node
 */
import { resolve } from "path"

import nock from "nock"
import fs from "fs-extra"
import { setPluginOptions } from "gatsby-plugin-sharp/plugin-options"

import { generateImageSource, extendNodeType } from "../extend-node-type"
import { iteratee } from "lodash"

const CACHE_FOLDER = resolve(`${process.cwd()}/.cache/contentful/assets/`)
const FIXTURES = resolve(__dirname, `..`, `__fixtures__`)

nock.disableNetConnect()

const reporter = {
  info: jest.fn(),
  verbose: jest.fn(),
  warn: jest.fn(),
  panic: jest.fn(e => {
    throw e
  }),
}

const store = {
  getState: jest.fn(() => {
    return {
      status: {
        plugins: [],
      },
      program: { directory: process.cwd() },
    }
  }),
}

function mockCacheImageRequest({
  w = 800,
  h = 164,
  fixtureName = `contentful-logo-800.png`,
}) {
  nock(`http://images.ctfassets.net`, { encodedQueryParams: true })
    .get(
      `/k8iqpp6u0ior/3ljGfnpegOnBTFGhV07iC1/94257340bda15ad4ca8462da3a8afa07/347966-contentful-logo-wordmark-dark__1_-4cd185-original-1582664935__1_.png`
    )
    .query({ w, h })
    .reply(200, fs.createReadStream(`${FIXTURES}/${fixtureName}`), [
      `Content-Type`,
      `image/png`,
      `Content-Length`,
      `15102`,
      `Access-Control-Allow-Origin`,
      `*`,
    ])
}

function mockBlurredRequest({
  width = 20,
  fixtureName = `contentful-logo-blurred-20.png`,
}) {
  nock(`https://images.ctfassets.net`, { encodedQueryParams: true })
    .get(
      `/k8iqpp6u0ior/3ljGfnpegOnBTFGhV07iC1/94257340bda15ad4ca8462da3a8afa07/347966-contentful-logo-wordmark-dark__1_-4cd185-original-1582664935__1_.png`
    )
    .query({ w: width, q: 50 })
    .reply(200, fs.createReadStream(`${FIXTURES}/${fixtureName}`), [
      `Content-Type`,
      `image/png`,
      `Content-Length`,
      `15102`,
      `Access-Control-Allow-Origin`,
      `*`,
    ])
}

describe(`contentful extend node type`, () => {
  describe(`generateImageSource`, () => {
    it(`default`, () => {
      const resp = generateImageSource(`test.png`, 420, 210, `webp`, null, {})
      expect(resp.src).toContain(`w=420`)
      expect(resp.src).toContain(`h=210`)
      expect(resp.src).toContain(`fm=webp`)
      expect(resp).toMatchSnapshot()
    })
    it(`supports corner radius`, async () => {
      const resp = generateImageSource(`test.png`, 420, 210, `webp`, null, {
        cornerRadius: 10,
      })
      expect(resp.src).toContain(`r=10`)
      expect(resp).toMatchSnapshot()
    })
    it(`transforms corner radius -1 to max`, async () => {
      const resp = generateImageSource(`test.png`, 420, 210, `webp`, null, {
        cornerRadius: -1,
      })
      expect(resp.src).toContain(`r=max`)
      expect(resp).toMatchSnapshot()
    })
    it(`does not include corner by default`, async () => {
      const resp = generateImageSource(`test.png`, 420, 210, `webp`, null, {})
      expect(resp.src).not.toContain(`r=`)
      expect(resp).toMatchSnapshot()
    })
  })

  describe(`gatsby-plugin-image`, () => {
    beforeAll(() => {
      // Reset asset cache folder
      fs.rmdirSync(CACHE_FOLDER, { recursive: true })
      fs.mkdirpSync(CACHE_FOLDER)

      // Enable recording to simplify nock.mock creation
      // nock.recorder.rec()
      // nock.cleanAll()
    })

    const extendedNodeType = extendNodeType({
      type: { name: `ContentfulAsset` },
      store,
      reporter,
    })

    const image = {
      defaultLocale: `en-US`,
      file: {
        url: `//images.ctfassets.net/k8iqpp6u0ior/3ljGfnpegOnBTFGhV07iC1/94257340bda15ad4ca8462da3a8afa07/347966-contentful-logo-wordmark-dark__1_-4cd185-original-1582664935__1_.png`,
        fileName: `347966-contentful-logo-wordmark-dark (1)-4cd185-original-1582664935 (1).png`,
        contentType: `image/png`,
        details: {
          size: 123456,
          image: {
            width: `1646`,
            height: `338`,
          },
        },
      },
      internal: {
        contentDigest: `unique`,
      },
    }
    // https://images.ctfassets.net/k8iqpp6u0ior/3ljGfnpegOnBTFGhV07iC1/94257340bda15ad4ca8462da3a8afa07/347966-contentful-logo-wordmark-dark__1_-4cd185-original-1582664935__1_.png?w=800&h=164

    describe(`query arguments`, () => {
      beforeEach(() => {
        setPluginOptions({})
      })

      it(`default`, async () => {
        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {})
        expect(resp.images.sources[0].srcSet).toContain(`q=50`)
        expect(resp.images.sources[0].srcSet).toContain(`fm=webp`)
        expect(resp.images.fallback.srcSet).toContain(`q=50`)
        expect(resp.images.fallback.srcSet).toContain(`fm=png`)
        expect(resp.backgroundColor).toEqual(`#080808`)
        expect(resp).toMatchSnapshot()
      })

      it(`force format`, async () => {
        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {
          formats: [`jpg`, `webp`],
        })
        expect(resp.images.sources[0].srcSet).toContain(`q=50`)
        expect(resp.images.sources[0].srcSet).toContain(`fm=webp`)
        expect(resp.images.fallback.srcSet).toContain(`q=50`)
        expect(resp.images.fallback.srcSet).toContain(`fm=jpg`)
        expect(resp).toMatchSnapshot()
      })

      it(`custom width`, async () => {
        mockCacheImageRequest({ w: 420, h: 86 })
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {
          width: 420,
        })
        expect(resp.images.sources[0].srcSet).toContain(`q=50`)
        expect(resp.images.sources[0].srcSet).toContain(`fm=webp`)
        expect(resp.images.sources[0].sizes).toContain(
          `(min-width: 420px) 420px`
        )
        expect(resp.images.fallback.srcSet).toContain(`q=50`)
        expect(resp.images.fallback.srcSet).toContain(`fm=png`)
        expect(resp.images.fallback.sizes).toContain(`(min-width: 420px) 420px`)
        expect(resp).toMatchSnapshot()
      })
      it(`custom quality`, async () => {
        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {
          quality: 90,
        })
        expect(resp.images.sources[0].srcSet).toContain(`q=90`)
        expect(resp.images.sources[0].srcSet).toContain(`fm=webp`)
        expect(resp.images.fallback.srcSet).toContain(`q=90`)
        expect(resp.images.fallback.srcSet).toContain(`fm=png`)
        expect(resp).toMatchSnapshot()
      })
      it(`layout fixed`, async () => {
        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {
          layout: `fixed`,
        })
        expect(resp.images.sources[0].srcSet).not.toContain(`,`)
        expect(resp.images.sources[0].sizes).not.toContain(`,`)
        expect(resp.images.fallback.srcSet).not.toContain(`,`)
        expect(resp.images.fallback.sizes).not.toContain(`,`)
        expect(resp).toMatchSnapshot()
      })
      it(`layout full width`, async () => {
        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {
          layout: `fullWidth`,
        })
        expect(resp.images.sources[0].srcSet).toContain(`,`)
        expect(resp.images.sources[0].sizes).toEqual(`100vw`)
        expect(resp.images.fallback.srcSet).toContain(`,`)
        expect(resp.images.fallback.sizes).toEqual(`100vw`)
        expect(resp).toMatchSnapshot()
      })

      it(`placeholder blurred`, async () => {
        mockBlurredRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {
          placeholder: `blurred`,
        })
        expect(resp.backgroundColor).toEqual(undefined)
        expect(resp.placeholder.fallback).toMatch(/^data:image\/png;base64,.+/)
        expect(resp.placeholder.fallback).toHaveLength(518)
        expect(resp).toMatchSnapshot()
      })
      it(`placeholder traced svg`, async () => {
        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {
          placeholder: `tracedSVG`,
        })
        expect(resp.backgroundColor).toEqual(undefined)
        expect(resp.placeholder.fallback).toMatch(/^data:image\/svg\+xml,.+/)
        expect(resp.placeholder.fallback).toContain(`fill='%23d3d3d3'`)
        expect(resp).toMatchSnapshot()
      })
    })

    describe(`defaults via gatsby-plugin-sharp`, () => {
      afterEach(() => nock.cleanAll())
      it(`custom quality`, async () => {
        setPluginOptions({
          defaults: {
            quality: 42,
          },
        })

        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {})
        expect(resp.images.sources[0].srcSet).toContain(`q=42`)
        expect(resp.images.fallback.srcSet).toContain(`q=42`)
        expect(resp).toMatchSnapshot()
      })
      it(`custom quality by format`, async () => {
        setPluginOptions({
          defaults: {
            pngOptions: {
              quality: 60,
            },
            webpOptions: {
              quality: 42,
            },
          },
        })

        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {})
        expect(resp.images.sources[0].srcSet).toContain(`q=42`)
        expect(resp.images.fallback.srcSet).toContain(`q=60`)
        expect(resp).toMatchSnapshot()
      })

      it(`custom placeholder tracedSVG`, async () => {
        setPluginOptions({
          defaults: {
            placeholder: `tracedSVG`,
            tracedSVGOptions: {
              color: `#663399`,
            },
          },
        })

        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {})
        expect(resp.placeholder.fallback).toMatch(/^data:image\/svg\+xml,.+/)
        expect(resp.placeholder.fallback).toContain(`fill='%23639'`)
        expect(resp).toMatchSnapshot()
      })

      it(`custom placeholder blurred`, async () => {
        setPluginOptions({
          defaults: {
            placeholder: `blurred`,
            blurredOptions: {
              width: 16,
            },
          },
        })

        mockBlurredRequest({
          width: 16,
          fixtureName: `contentful-logo-blurred-16.png`,
        })
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {})
        expect(resp.placeholder.fallback).toMatch(/^data:image\/png;base64,.+/)
        expect(resp.placeholder.fallback).toHaveLength(450)
        expect(resp).toMatchSnapshot()
      })

      it(`custom background color`, async () => {
        setPluginOptions({
          defaults: {
            placeholder: `none`,
            backgroundColor: `#663399`,
          },
        })

        mockCacheImageRequest({})
        const resp = await extendedNodeType.gatsbyImageData.resolve(image, {})
        expect(resp.backgroundColor).toEqual(`#663399`)
        expect(resp).toMatchSnapshot()
      })
    })
  })
})
