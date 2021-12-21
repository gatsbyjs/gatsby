// @ts-check
import fs from "fs-extra"
import _ from "lodash"
import nock from "nock"
import path from "path"
import { generateImageSource, getBase64Image } from "../gatsby-plugin-image"
import * as coreUtils from "gatsby-core-utils"

nock.disableNetConnect()

const FIXTURES = path.resolve(__dirname, `..`, `__fixtures__`)

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

const fetchRemoteFileSpy = jest.spyOn(coreUtils, `fetchRemoteFile`)

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
    afterEach(() => nock.cleanAll())

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
      nock(`https://images.ctfassets.net:443`)
        .get(
          `/k8iqpp6u0ior/3ljGfnpegOnBTFGhV07iC1/94257340bda15ad4ca8462da3a8afa07/347966-contentful-logo-wordmark-dark__1_-4cd185-original-1582664935__1_.png`
        )
        .query({ w: `20`, h: `4`, q: `50` })
        .reply(
          200,
          fs.readFileSync(`${FIXTURES}/contentful-base64.png`, null),
          [
            `Content-Type`,
            `image/png`,
            `Content-Length`,
            `355`,
            `Access-Control-Allow-Origin`,
            `*`,
          ]
        )
      const result = await getBase64Image(imageProps, cache)
      expect(fetchRemoteFileSpy.mock.calls[0][0].url).toBe(
        `https://images.ctfassets.net/k8iqpp6u0ior/3ljGfnpegOnBTFGhV07iC1/94257340bda15ad4ca8462da3a8afa07/347966-contentful-logo-wordmark-dark__1_-4cd185-original-1582664935__1_.png?w=20&h=4&q=50`
      )
      expect(result).toMatch(
        `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAECAMAAABbXfTdAAAAh1BMVEUAAABEl785ruI7tOc7tOcqMDkqMDkqMDkqMDnby3FEmME7tOc7tOcqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDn3vl/cVmDtXGjtXGgqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDnbVWDqWWftXGjtXGilAiI/AAAALXRSTlMAUt/ZNiQhOC/bFh4dhm6FnaR+qZiKmZqJsdwWHRyIdqclqIA9nIdWslLf2jb4BEMwAAAACXBIWXMAAAsSAAALEgHS3X78AAAAB3RJTUUH5QgNCSUh4wxIuwAAADZJREFUCNdjZASCPwxAwPobSLAxMv5gY+FghIC/LFDGW2EWQTDjgwBI+K04iORn1ARSVxhQAAC2HQpRHmHx6QAAAABJRU5ErkJggg==`
      )
      expect(nock.pendingMocks).toHaveLength(0)
    })
    test(`uses given image format`, async () => {
      nock(`https://images.ctfassets.net:443`)
        .get(
          `/k8iqpp6u0ior/3ljGfnpegOnBTFGhV07iC1/94257340bda15ad4ca8462da3a8afa07/347966-contentful-logo-wordmark-dark__1_-4cd185-original-1582664935__1_.png`
        )
        .query({ w: `20`, h: `4`, q: `50`, fm: `jpg` })
        .reply(
          200,
          fs.readFileSync(`${FIXTURES}/contentful-base64.jpg`, null),
          [
            `Content-Type`,
            `image/jpeg`,
            `Content-Length`,
            `356`,
            `Access-Control-Allow-Origin`,
            `*`,
          ]
        )
      const result = await getBase64Image(
        {
          ...imageProps,
          options: { ...imageProps.options, toFormat: `jpg` },
        },
        cache
      )
      expect(result).toMatch(
        `data:image/jpg;base64,/9j/4AAQSkZJRgABAQIAHAAcAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAEABMDASIAAhEBAxEB/8QAFwABAAMAAAAAAAAAAAAAAAAAAAIDBv/EACIQAAAFAwQDAAAAAAAAAAAAAAABAgMRBBIhBRMUMUFRof/EABUBAQEAAAAAAAAAAAAAAAAAAAIB/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQACMf/aAAwDAQACEQMRAD8A1dI1zG3S3HGLFmmWFW3dZP2YuPS0ndNXWQrxu4LMgAmeS2BpCg5o6XFmrm1qeihLsEXwAAKN/9k=`
      )
    })
  })
})
