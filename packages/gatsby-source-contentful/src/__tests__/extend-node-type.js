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
      url:
        "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
      fileName: "ryugj83mqwa1asojwtwb.jpg",
      contentType: "image/jpeg",
      details: {
        size: 28435,
        image: {
          width: "450",
          height: "600",
        },
      },
    },
  }
  describe(`resolveResponsiveResolution`, () => {
    it(`generates responsive resolution data for images`, async () => {
      const resp = await resolveResponsiveResolution(image, { width: 400 })
      expect(resp).toMatchSnapshot()
    })
  })
  describe(`resolveResponsiveSizes`, () => {
    it(`generates responsive size data for images`, async () => {
      const resp = await resolveResponsiveSizes(image, { maxWidth: 400 })
      expect(resp).toMatchSnapshot()
    })
  })
  describe(`resolveResize`, () => {
    it(`generates resized images`, async () => {
      const resp = await resolveResize(image, { width: 400 })
      expect(resp).toMatchSnapshot()
    })
  })
})
