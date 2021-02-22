import { Node } from "gatsby"
import { getSrc, getSrcSet, getImage, IGatsbyImageData } from "../../"

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

const dataParent = {
  ...node,
  gatsbyImageData: imageData,
}

const fileNode = {
  ...node,
  childImageSharp: dataParent,
}

describe(`The image helper functions`, () => {
  describe(`getImage`, () => {
    it(`returns the same data if passed gatsbyImageData`, () => {
      expect(getImage(imageData)).toEqual(imageData)
    })

    it(`gets an image from a FileNode`, () => {
      expect(getImage(fileNode)?.images.fallback?.src).toEqual(`imagesrc.jpg`)
    })

    it(`gets an image from an IGatsbyImageDataParent`, () => {
      expect(getImage(dataParent)?.images.fallback?.src).toEqual(`imagesrc.jpg`)
    })
    it(`returns undefined from an invalid object`, () => {
      expect(getImage(node)).toBeUndefined()
    })

    it(`returns undefined when passed a number`, () => {
      expect(getImage((1 as any) as Node)).toBeUndefined()
    })

    it(`returns undefined when passed undefined`, () => {
      expect(getImage((undefined as any) as Node)).toBeUndefined()
    })
  })

  describe(`getSrc`, () => {
    it(`gets src from an image data object`, () => {
      expect(getSrc(imageData)).toEqual(`imagesrc.jpg`)
    })

    it(`gets src from a FileNode`, () => {
      expect(getSrc(fileNode)).toEqual(`imagesrc.jpg`)
    })

    it(`gets src from an IGatsbyImageDataParent`, () => {
      expect(getSrc(dataParent)).toEqual(`imagesrc.jpg`)
    })

    it(`returns undefined from an invalid object`, () => {
      expect(getSrc(node)).toBeUndefined()
    })
    it(`returns undefined when passed undefined`, () => {
      expect(getSrc((undefined as any) as Node)).toBeUndefined()
    })

    it(`returns undefined when passed a number`, () => {
      expect(getSrc((1 as any) as Node)).toBeUndefined()
    })
  })

  describe(`getSrcSet`, () => {
    it(`gets srcSet from am image data object`, () => {
      expect(getSrcSet(imageData)).toEqual(`imagesrcset.jpg 1x`)
    })

    it(`gets srcSet from a FileNode`, () => {
      expect(getSrcSet(fileNode)).toEqual(`imagesrcset.jpg 1x`)
    })

    it(`gets srcSet from an IGatsbyImageDataParent`, () => {
      expect(getSrcSet(dataParent)).toEqual(`imagesrcset.jpg 1x`)
    })

    it(`returns undefined from an invalid object`, () => {
      expect(getSrcSet(node)).toBeUndefined()
    })

    it(`returns undefined when passed undefined`, () => {
      expect(getSrcSet((undefined as any) as Node)).toBeUndefined()
    })

    it(`returns undefined when passed a number`, () => {
      expect(getSrcSet((1 as any) as Node)).toBeUndefined()
    })
  })
})
