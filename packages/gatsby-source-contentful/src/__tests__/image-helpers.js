import nock from "nock"
import path from "path"
import fs from "fs-extra"

import { createUrl, getBase64Image, CACHE_IMG_FOLDER } from "../image-helpers"

nock.disableNetConnect()

const FIXTURES = path.resolve(__dirname, `..`, `__fixtures__`)

const reporter = {
  info: jest.fn(),
  verbose: jest.fn(),
  panic: jest.fn(),
}

describe(`contentful extend node type`, () => {
  beforeAll(() => {
    // Reset asset cache folder
    fs.rmdirSync(CACHE_IMG_FOLDER, { recursive: true })
    fs.mkdirpSync(CACHE_IMG_FOLDER)

    // Enable recording to simplify nock.mock creation
    // nock.recorder.rec()
  })

  describe(`createUrl`, () => {
    it(`allows you to create URls`, () => {
      expect(
        createUrl(`//images.contentful.com/dsf/bl.jpg`, { width: 100 })
      ).toMatchSnapshot()
    })
    it(`ignores options it doesn't understand`, () => {
      expect(
        createUrl(`//images.contentful.com/dsf/bl.jpg`, { happiness: 100 })
      ).toMatchSnapshot()
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
      const result = await getBase64Image(imageProps, reporter)
      expect(result).toMatch(
        `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAECAMAAABbXfTdAAAAh1BMVEUAAABEl785ruI7tOc7tOcqMDkqMDkqMDkqMDnby3FEmME7tOc7tOcqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDn3vl/cVmDtXGjtXGgqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDnbVWDqWWftXGjtXGilAiI/AAAALXRSTlMAUt/ZNiQhOC/bFh4dhm6FnaR+qZiKmZqJsdwWHRyIdqclqIA9nIdWslLf2jb4BEMwAAAACXBIWXMAAAsSAAALEgHS3X78AAAAB3RJTUUH5QgNCSUh4wxIuwAAADZJREFUCNdjZASCPwxAwPobSLAxMv5gY+FghIC/LFDGW2EWQTDjgwBI+K04iORn1ARSVxhQAAC2HQpRHmHx6QAAAABJRU5ErkJggg==`
      )
      expect(reporter.panic.mock.calls).toHaveLength(0)
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
        reporter
      )
      expect(result).toMatch(
        `data:image/jpg;base64,/9j/4AAQSkZJRgABAQIAHAAcAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAEABMDASIAAhEBAxEB/8QAFwABAAMAAAAAAAAAAAAAAAAAAAIDBv/EACIQAAAFAwQDAAAAAAAAAAAAAAABAgMRBBIhBRMUMUFRof/EABUBAQEAAAAAAAAAAAAAAAAAAAIB/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQACMf/aAAwDAQACEQMRAD8A1dI1zG3S3HGLFmmWFW3dZP2YuPS0ndNXWQrxu4LMgAmeS2BpCg5o6XFmrm1qeihLsEXwAAKN/9k=`
      )
      expect(reporter.panic.mock.calls).toHaveLength(0)
    })
  })
})
