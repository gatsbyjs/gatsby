const {
  createUrl,
  resolveResponsiveResolution,
  resolveResponsiveSizes,
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
  describe(`resolveResponsiveResolution`, () => {
    it(`generates responsive resolution data for images`, async () => {
      const resp = await resolveResponsiveResolution(image, { width: 400 })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`generates responsive resolution data for images using all options`, async () => {
      const resp = await resolveResponsiveResolution(image, {
        width: 450,
        height: 399,
        quality: 50,
      })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`If the height isn't specified it should be set keeping with the aspect ratio of the original image`, async () => {
      const resp = await resolveResponsiveResolution(image, {
        width: 450,
      })
      expect(resp.width).toBe(450)
      expect(resp.height).toBe(600)
    })
    it(`if width and height are set that's what is returned`, async () => {
      const resp = await resolveResponsiveResolution(image, {
        width: 450,
        height: 399,
      })
      expect(resp.width).toBe(450)
      expect(resp.height).toBe(399)
    })
  })
  describe(`resolveResponsiveSizes`, () => {
    it(`generates responsive size data for images`, async () => {
      const resp = await resolveResponsiveSizes(image, { maxWidth: 400 })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`generates responsive sizes data for images using all options`, async () => {
      const resp = await resolveResponsiveSizes(image, {
        maxWidth: 450,
        maxHeight: 399,
        quality: 50,
      })
      expect(resp.srcSet.length).toBeGreaterThan(1)
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
      })
      expect(resp).toMatchSnapshot()
    })
  })
})
