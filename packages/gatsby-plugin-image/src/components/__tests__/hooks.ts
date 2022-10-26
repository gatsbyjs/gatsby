import { Node } from "gatsby"
import { getImageData, getSrc, getSrcSet, getImage } from "../hooks"
import type { IGatsbyImageData, IGetImageDataArgs } from "../../"

const imageData: IGatsbyImageData = {
  images: {
    fallback: {
      src: `imagesrc.jpg`,
      srcSet: `imagesrcset.jpg 1x`,
    },
  },
  layout: `constrained`,
  width: 1,
  height: 2,
}

const node: Node = {
  id: ``,
  parent: ``,
  children: [],
  internal: {
    type: ``,
    contentDigest: ``,
    owner: ``,
  },
}

const imageDataParent = {
  ...node,
  gatsbyImageData: imageData,
}

const imageParent = {
  ...node,
  gatsbyImage: imageData,
}

const fileNode = {
  ...node,
  childImageSharp: imageDataParent,
}

const getImageDataArgs: IGetImageDataArgs = {
  baseUrl: `https://example.com/img/1234.jpg`,
  urlBuilder: ({ baseUrl, width, height, format }): string =>
    `${baseUrl}/${width}x${height}.${format}`,
  sourceWidth: 1600,
  sourceHeight: 1200,
}

describe(`The image helper functions`, () => {
  describe(`getImageData`, () => {
    it(`generates default data`, () => {
      const data = getImageData(getImageDataArgs)
      expect(data).toMatchInlineSnapshot(`
        Object {
          "backgroundColor": undefined,
          "height": 1200,
          "images": Object {
            "fallback": Object {
              "sizes": "(min-width: 1600px) 1600px, 100vw",
              "src": "https://example.com/img/1234.jpg/1600x1200.auto",
              "srcSet": "https://example.com/img/1234.jpg/400x300.auto 400w,
        https://example.com/img/1234.jpg/800x600.auto 800w,
        https://example.com/img/1234.jpg/1600x1200.auto 1600w",
            },
            "sources": Array [],
          },
          "layout": "constrained",
          "width": 1600,
        }
      `)
    })
    it(`generates data with explicit dimensions`, () => {
      const data = getImageData({ ...getImageDataArgs, width: 600 })
      expect(data.images.fallback.srcSet).toMatchInlineSnapshot(`
        "https://example.com/img/1234.jpg/150x113.auto 150w,
        https://example.com/img/1234.jpg/300x225.auto 300w,
        https://example.com/img/1234.jpg/600x450.auto 600w,
        https://example.com/img/1234.jpg/1200x900.auto 1200w"
      `)
      expect(data.images.fallback.sizes).toEqual(
        `(min-width: 600px) 600px, 100vw`
      )
    })

    it(`generates full width data with all breakpoints`, () => {
      const data = getImageData({
        ...getImageDataArgs,
        layout: `fullWidth`,
      })
      expect(data.images.fallback.srcSet).toMatchInlineSnapshot(`
        "https://example.com/img/1234.jpg/320x240.auto 320w,
        https://example.com/img/1234.jpg/654x491.auto 654w,
        https://example.com/img/1234.jpg/768x576.auto 768w,
        https://example.com/img/1234.jpg/1024x768.auto 1024w,
        https://example.com/img/1234.jpg/1366x1025.auto 1366w,
        https://example.com/img/1234.jpg/1600x1200.auto 1600w"
      `)
    })

    it(`generates full width data with explicit breakpoints`, () => {
      const data = getImageData({
        ...getImageDataArgs,
        layout: `fullWidth`,
        breakpoints: [100, 200, 300, 1024, 2048],
      })
      expect(data.images.fallback.srcSet).toMatchInlineSnapshot(`
        "https://example.com/img/1234.jpg/100x75.auto 100w,
        https://example.com/img/1234.jpg/200x150.auto 200w,
        https://example.com/img/1234.jpg/300x225.auto 300w,
        https://example.com/img/1234.jpg/1024x768.auto 1024w,
        https://example.com/img/1234.jpg/1600x1200.auto 1600w"
      `)
    })

    it(`generates data with explicit formats`, () => {
      const data = getImageData({
        ...getImageDataArgs,
        formats: [`jpg`, `webp`, `avif`],
      })
      expect(data.images).toMatchInlineSnapshot(`
        Object {
          "fallback": Object {
            "sizes": "(min-width: 1600px) 1600px, 100vw",
            "src": "https://example.com/img/1234.jpg/1600x1200.jpg",
            "srcSet": "https://example.com/img/1234.jpg/400x300.jpg 400w,
        https://example.com/img/1234.jpg/800x600.jpg 800w,
        https://example.com/img/1234.jpg/1600x1200.jpg 1600w",
          },
          "sources": Array [
            Object {
              "sizes": "(min-width: 1600px) 1600px, 100vw",
              "srcSet": "https://example.com/img/1234.jpg/400x300.webp 400w,
        https://example.com/img/1234.jpg/800x600.webp 800w,
        https://example.com/img/1234.jpg/1600x1200.webp 1600w",
              "type": "image/webp",
            },
            Object {
              "sizes": "(min-width: 1600px) 1600px, 100vw",
              "srcSet": "https://example.com/img/1234.jpg/400x300.avif 400w,
        https://example.com/img/1234.jpg/800x600.avif 800w,
        https://example.com/img/1234.jpg/1600x1200.avif 1600w",
              "type": "image/avif",
            },
          ],
        }
      `)
    })
  })
  describe(`getImage`, () => {
    it(`returns the same data if passed gatsbyImageData`, () => {
      expect(getImage(imageData)).toEqual(imageData)
    })
    it(`returns the same data if passed gatsbyImage`, () => {
      expect(getImage(imageData)).toEqual(imageData)
    })

    it(`gets an image from a FileNode`, () => {
      expect(getImage(fileNode)?.images.fallback?.src).toEqual(`imagesrc.jpg`)
    })

    it(`gets an image from an IGatsbyImageDataParent/IGatsbyImageParent`, () => {
      expect(getImage(imageDataParent)?.images.fallback?.src).toEqual(
        `imagesrc.jpg`
      )
      expect(getImage(imageParent)?.images.fallback?.src).toEqual(
        `imagesrc.jpg`
      )
    })
    it(`returns undefined from an invalid object`, () => {
      expect(getImage(node)).toBeUndefined()
    })

    it(`returns undefined when passed a number`, () => {
      expect(getImage(1 as any as Node)).toBeUndefined()
    })

    it(`returns undefined when passed undefined`, () => {
      expect(getImage(undefined as any as Node)).toBeUndefined()
    })
  })

  describe(`getSrc`, () => {
    it(`gets src from an image data object`, () => {
      expect(getSrc(imageData)).toEqual(`imagesrc.jpg`)
    })

    it(`gets src from a FileNode`, () => {
      expect(getSrc(fileNode)).toEqual(`imagesrc.jpg`)
    })

    it(`gets src from an IGatsbyImageDataParent/IGatsbyImageParent`, () => {
      expect(getSrc(imageDataParent)).toEqual(`imagesrc.jpg`)
      expect(getSrc(imageParent)).toEqual(`imagesrc.jpg`)
    })

    it(`returns undefined from an invalid object`, () => {
      expect(getSrc(node)).toBeUndefined()
    })
    it(`returns undefined when passed undefined`, () => {
      expect(getSrc(undefined as any as Node)).toBeUndefined()
    })

    it(`returns undefined when passed a number`, () => {
      expect(getSrc(1 as any as Node)).toBeUndefined()
    })
  })

  describe(`getSrcSet`, () => {
    it(`gets srcSet from am image data object`, () => {
      expect(getSrcSet(imageData)).toEqual(`imagesrcset.jpg 1x`)
    })

    it(`gets srcSet from a FileNode`, () => {
      expect(getSrcSet(fileNode)).toEqual(`imagesrcset.jpg 1x`)
    })

    it(`gets srcSet from an IGatsbyImageDataParent/IGatsbyImageParent`, () => {
      expect(getSrcSet(imageDataParent)).toEqual(`imagesrcset.jpg 1x`)
      expect(getSrcSet(imageParent)).toEqual(`imagesrcset.jpg 1x`)
    })

    it(`returns undefined from an invalid object`, () => {
      expect(getSrcSet(node)).toBeUndefined()
    })

    it(`returns undefined when passed undefined`, () => {
      expect(getSrcSet(undefined as any as Node)).toBeUndefined()
    })

    it(`returns undefined when passed a number`, () => {
      expect(getSrcSet(1 as any as Node)).toBeUndefined()
    })
  })
})
