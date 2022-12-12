/**
 * @jest-environment node
 */
// @ts-check
import fs from "fs-extra"
import { setPluginOptions } from "gatsby-plugin-sharp/plugin-options"
import _ from "lodash"
import { resolve } from "path"
import { setFieldsOnGraphQLNodeType } from "../extend-node-type"
import { generateImageSource } from "../gatsby-plugin-image"
import * as gatsbyCoreUtils from "gatsby-core-utils"
import * as pluginSharp from "gatsby-plugin-sharp"

const FIXTURES = resolve(__dirname, `..`, `__fixtures__`)

jest
  .spyOn(fs, `readFile`)
  .mockImplementation(() => Promise.resolve(Buffer.from(`mockedFileContent`)))
jest
  .spyOn(pluginSharp, `getDominantColor`)
  .mockImplementation(() => Promise.resolve(`#mocked`))
jest
  .spyOn(gatsbyCoreUtils, `fetchRemoteFile`)
  .mockImplementation(() =>
    Promise.resolve(`${FIXTURES}/contentful-logo-256.png`)
  )

const createMockCache = () => {
  const actualCacheMap = new Map()
  return {
    get: jest.fn(key => Promise.resolve(_.cloneDeep(actualCacheMap.get(key)))),
    set: jest.fn((key, value) => actualCacheMap.set(key, value)),
    directory: __dirname,
    actualMap: actualCacheMap,
  }
}

const cache = createMockCache()

const exampleImage = {
  defaultLocale: `en-US`,
  file: {
    url: `//images.ctfassets.net:443/k8iqpp6u0ior/3ljGfnpegOnBTFGhV07iC1/94257340bda15ad4ca8462da3a8afa07/347966-contentful-logo-wordmark-dark__1_-4cd185-original-1582664935__1_.png`,
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

describe(`gatsby-plugin-image`, () => {
  let extendedNodeType

  beforeAll(async () => {
    extendedNodeType = await setFieldsOnGraphQLNodeType({
      type: { name: `ContentfulAsset` },
      cache,
    })
  })

  describe(`generateImageSource`, () => {
    it(`default`, () => {
      const resp = generateImageSource(`//test.png`, 420, 210, `webp`, null, {})
      expect(resp.src).toContain(`w=420`)
      expect(resp.src).toContain(`h=210`)
      expect(resp.src).toContain(`fm=webp`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "format": "webp",
          "height": 210,
          "src": "https://test.png?w=420&h=210&fm=webp",
          "width": 420,
        }
      `)
    })
    it(`supports corner radius`, async () => {
      const resp = generateImageSource(`//test.png`, 420, 210, `webp`, null, {
        cornerRadius: 10,
      })
      expect(resp.src).toContain(`r=10`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "format": "webp",
          "height": 210,
          "src": "https://test.png?w=420&h=210&fm=webp&r=10",
          "width": 420,
        }
      `)
    })
    it(`transforms corner radius -1 to max`, async () => {
      const resp = generateImageSource(`//test.png`, 420, 210, `webp`, null, {
        cornerRadius: -1,
      })
      expect(resp.src).toContain(`r=max`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "format": "webp",
          "height": 210,
          "src": "https://test.png?w=420&h=210&fm=webp&r=max",
          "width": 420,
        }
      `)
    })
    it(`does not include corner by default`, async () => {
      const resp = generateImageSource(`//test.png`, 420, 210, `webp`, null, {})
      expect(resp.src).not.toContain(`r=`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "format": "webp",
          "height": 210,
          "src": "https://test.png?w=420&h=210&fm=webp",
          "width": 420,
        }
      `)
    })
  })

  describe(`query arguments`, () => {
    beforeEach(() => {
      setPluginOptions({})
    })

    it(`default`, async () => {
      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {},
        null,
        null
      )
      expect(resp.images.sources[0].srcSet).toContain(`q=50`)
      expect(resp.images.sources[0].srcSet).toContain(`fm=webp`)
      expect(resp.images.fallback.srcSet).toContain(`q=50`)
      expect(resp.images.fallback.srcSet).toContain(`fm=png`)
      expect(resp.backgroundColor).toEqual(`#080808`)
      expect(resp).toMatchSnapshot()
    })

    it(`force format`, async () => {
      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {
          formats: [`jpg`, `webp`],
        },
        null,
        null
      )
      expect(resp.images.sources[0].srcSet).toContain(`q=50`)
      expect(resp.images.sources[0].srcSet).toContain(`fm=webp`)
      expect(resp.images.fallback.srcSet).toContain(`q=50`)
      expect(resp.images.fallback.srcSet).toContain(`fm=jpg`)
      expect(resp).toMatchSnapshot()
    })

    it(`custom width`, async () => {
      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {
          width: 420,
        },
        null,
        null
      )
      expect(resp.images.sources[0].srcSet).toContain(`q=50`)
      expect(resp.images.sources[0].srcSet).toContain(`fm=webp`)
      expect(resp.images.sources[0].sizes).toContain(`(min-width: 420px) 420px`)
      expect(resp.images.fallback.srcSet).toContain(`q=50`)
      expect(resp.images.fallback.srcSet).toContain(`fm=png`)
      expect(resp.images.fallback.sizes).toContain(`(min-width: 420px) 420px`)
      expect(resp).toMatchSnapshot()
    })
    it(`custom quality`, async () => {
      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {
          quality: 90,
        },
        null,
        null
      )
      expect(resp.images.sources[0].srcSet).toContain(`q=90`)
      expect(resp.images.sources[0].srcSet).toContain(`fm=webp`)
      expect(resp.images.fallback.srcSet).toContain(`q=90`)
      expect(resp.images.fallback.srcSet).toContain(`fm=png`)
      expect(resp).toMatchSnapshot()
    })
    it(`layout fixed`, async () => {
      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {
          layout: `fixed`,
        },
        null,
        null
      )
      expect(resp.images.sources[0].srcSet).not.toContain(`,`)
      expect(resp.images.sources[0].sizes).not.toContain(`,`)
      expect(resp.images.fallback.srcSet).not.toContain(`,`)
      expect(resp.images.fallback.sizes).not.toContain(`,`)
      expect(resp).toMatchSnapshot()
    })
    it(`layout full width`, async () => {
      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {
          layout: `fullWidth`,
        },
        null,
        null
      )
      expect(resp.images.sources[0].srcSet).toContain(`,`)
      expect(resp.images.sources[0].sizes).toEqual(`100vw`)
      expect(resp.images.fallback.srcSet).toContain(`,`)
      expect(resp.images.fallback.sizes).toEqual(`100vw`)
      expect(resp).toMatchSnapshot()
    })

    it(`placeholder blurred`, async () => {
      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {
          placeholder: `blurred`,
        },
        null,
        null
      )
      expect(resp.backgroundColor).toEqual(undefined)
      expect(resp.placeholder.fallback).toMatch(/^data:image\/png;base64,.+/)
      expect(resp).toMatchSnapshot()
    })
    it(`placeholder traced svg (falls back to DOMINANT_COLOR)`, async () => {
      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {
          placeholder: `tracedSVG`,
        },
        null,
        null
      )
      expect(resp.backgroundColor).toEqual(`#080808`)
      expect(resp.placeholder).not.toBeDefined()
      expect(resp).toMatchSnapshot()
    })
  })

  describe(`defaults via gatsby-plugin-sharp`, () => {
    it(`custom quality`, async () => {
      setPluginOptions({
        defaults: {
          quality: 42,
        },
      })

      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {},
        null,
        null
      )
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

      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {},
        null,
        null
      )
      expect(resp.images.sources[0].srcSet).toContain(`q=42`)
      expect(resp.images.fallback.srcSet).toContain(`q=60`)
      expect(resp).toMatchSnapshot()
    })

    it(`custom placeholder tracedSVG (falls back to DOMINANT_COLOR)`, async () => {
      setPluginOptions({
        defaults: {
          placeholder: `tracedSVG`,
          tracedSVGOptions: {
            color: `#663399`,
          },
        },
      })

      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {},
        null,
        null
      )
      expect(resp.backgroundColor).toEqual(`#080808`)
      expect(resp.placeholder).not.toBeDefined()
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

      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {},
        null,
        null
      )
      expect(resp.placeholder.fallback).toMatch(/^data:image\/png;base64,.+/)
      expect(resp).toMatchSnapshot()
    })

    it(`custom background color`, async () => {
      setPluginOptions({
        defaults: {
          placeholder: `none`,
          backgroundColor: `#663399`,
        },
      })

      const resp = await extendedNodeType.gatsbyImageData.resolve(
        exampleImage,
        // @ts-ignore
        {},
        null,
        null
      )
      expect(resp.backgroundColor).toEqual(`#663399`)
      expect(resp).toMatchSnapshot()
    })
  })
})
