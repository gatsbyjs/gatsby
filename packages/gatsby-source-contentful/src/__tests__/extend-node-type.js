const {
  createUrl,
  resolveFixed,
  resolveFluid,
  resolveResize,
} = require(`../extend-node-type`)

describe(`contentful extend node type`, () => {
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

  const image = {
    defaultLocale: `en-US`,
    file: {
      url: `//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg`,
      fileName: `ryugj83mqwa1asojwtwb.jpg`,
      contentType: `image/jpeg`,
      details: {
        size: 28435,
        image: {
          width: `4500`,
          height: `6000`,
        },
      },
    },
  }

  const nullFileImage = {
    defaultLocale: `en-US`,
    file: null,
  }

  describe(`resolveFixed`, () => {
    it(`generates responsive resolution data for images`, async () => {
      const resp = await resolveFixed(image, { width: 400 })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`generates responsive resolution data for images using all options`, async () => {
      const resp = await resolveFixed(image, {
        width: 450,
        height: 399,
        quality: 50,
        background: `rgb:000000`,
      })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`If the height isn't specified it should be set keeping with the aspect ratio of the original image`, async () => {
      const resp = await resolveFixed(image, {
        width: 450,
      })
      expect(resp.width).toBe(450)
      expect(resp.height).toBe(600)
    })
    it(`if width and height are set that's what is returned`, async () => {
      const resp = await resolveFixed(image, {
        width: 450,
        height: 399,
      })
      expect(resp.width).toBe(450)
      expect(resp.height).toBe(399)
    })
    it(`Always outputs ints`, async () => {
      const resp = await resolveFixed(image, {
        width: 450.1,
        height: 399.1,
      })
      expect(resp.width).toBe(450)
      expect(resp.height).toBe(399)
    })
    it(`handles null`, async () => {
      const resp = await resolveFixed(nullFileImage, {
        width: 400,
      })
      expect(resp).toBe(null)
    })
    it(`filters out sizes larger than the image's width`, async () => {
      const resp = await resolveFixed(image, {
        width: 2250,
      })
      expect(resp.srcSet.split(`,`).length).toBe(3)
      expect(resp).toMatchSnapshot()
    })
  })
  describe(`resolveFluid`, () => {
    it(`generates responsive size data for images`, async () => {
      const resp = await resolveFluid(image, { maxWidth: 400 })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`generates fluid sizes data for images using all options`, async () => {
      const resp = await resolveFluid(image, {
        maxWidth: 450,
        maxHeight: 399,
        quality: 50,
        background: `rgb:000000`,
      })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`handles null`, async () => {
      const resp = await resolveFluid(nullFileImage, {
        maxWidth: 400,
      })
      expect(resp).toBe(null)
    })
    it(`filters out sizes larger than the image's width`, async () => {
      const resp = await resolveFluid(image, {
        maxWidth: 2250,
      })
      expect(resp.srcSet.split(`,`).length).toBe(5)
      expect(resp).toMatchSnapshot()
    })
  })
  describe(`resolveResize`, () => {
    it(`generates resized images`, async () => {
      const resp = await resolveResize(image, { width: 400 })
      expect(resp).toMatchSnapshot()
    })
    it(`generates resized images using all options`, async () => {
      const resp = await resolveResize(image, {
        width: 450,
        height: 399,
        quality: 50,
        background: `rgb:000000`,
      })
      expect(resp).toMatchSnapshot()
    })
    it(`handles null`, async () => {
      const resp = await resolveResize(nullFileImage, { width: 400 })
      expect(resp).toBe(null)
    })
  })
})
