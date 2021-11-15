// @ts-check
import fs from "fs-extra"
import { fetchRemoteFile } from "gatsby-core-utils"
import { generateImageSource, getBase64Image } from "../gatsby-plugin-image"

jest.mock(`gatsby-core-utils`)
jest.mock(`fs-extra`)

describe(`contentful extend node type`, () => {
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

  describe(`getBase64Image`, () => {
    beforeEach(() => {
      // @ts-ignore
      fetchRemoteFile.mockClear()
      // @ts-ignore
      fs.readFile.mockResolvedValue(Buffer.from(`test`))
    })

    const imageProps = {
      aspectRatio: 4.8698224852071,
      baseUrl: `//images.ctfassets.net/k8iqpp6u0ior/3ljGfnpegOnBTFGhV07iC1/94257340bda15ad4ca8462da3a8afa07/347966-contentful-logo-wordmark-dark__1_-4cd185-original-1582664935__1_.png`,
      width: 200,
      height: 41,
      image: {
        contentful_id: `3ljGfnpegOnBTFGhV07iC1`,
        spaceId: `k8iqpp6u0ior`,
        createdAt: `2021-03-22T10:10:34.647Z`,
        updatedAt: `2021-03-22T10:10:34.647Z`,
        file: { contentType: `image/png` },
        title: `Contentful Logo PNG`,
        description: ``,
        node_locale: `en-US`,
      },
      options: {
        width: 200,
        quality: 50,
        toFormat: ``,
        cropFocus: null,
        cornerRadius: 0,
        background: null,
      },
    }
    test(`keeps image format`, async () => {
      const result = await getBase64Image(imageProps)

      expect(fetchRemoteFile).toHaveBeenCalled()
      expect(result).toMatchInlineSnapshot(`"data:image/png;base64,dGVzdA=="`)
    })
    test(`uses given image format`, async () => {
      const result = await getBase64Image({
        ...imageProps,
        options: { ...imageProps.options, toFormat: `jpg` },
      })

      expect(fetchRemoteFile).toHaveBeenCalled()
      expect(result).toMatchInlineSnapshot(`"data:image/jpg;base64,dGVzdA=="`)
    })
  })
})
