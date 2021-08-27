const {
  createUrl,
  resolveFixed,
  resolveFluid,
  resolveResize,
  generateImageSource,
  getBase64Image,
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

  describe(`getBase64Image`, () => {
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
      expect(result).toMatch(
        `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAECAMAAAC5ge+kAAAAllBMVEUAAABHl745rOE7tOc7tOcqMDkqMDkqMDkqMDnfzG9Pm7o7tOc7tOcqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDn4wF/eXWDtXGjtXGgqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDnbVmDpWGbtXGjtXGh1tTylAAAAMnRSTlMATd3gVSUjTCDgHRIscF+MeqB8qpqbk4ienYAxr+AeEipyZI9/aW+No4WJeWuuTdzgVnu3oiUAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQflCAUMNjFcK/NJAAAAMklEQVQI12NkBII/DCDA+htIsDEy/mBj4WDEBCwiyLwnIpyMjL/ZWASB7PMMMPAZTAIALlUHKTqI1/MAAAAASUVORK5CYII=`
      )
    })
    test(`uses given image format`, async () => {
      const result = await getBase64Image({
        ...imageProps,
        options: { ...imageProps.options, toFormat: `jpg` },
      })
      expect(result).toMatch(
        `data:image/jpg;base64,/9j/4AAQSkZJRgABAQIAHAAcAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAEABQDASIAAhEBAxEB/8QAFwABAAMAAAAAAAAAAAAAAAAAAAIDBv/EACQQAAIBAgQHAQAAAAAAAAAAAAECAAMRBBITJAUUFSFBUWHB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgH/xAAXEQEBAQEAAAAAAAAAAAAAAAABAAIx/9oADAMBAAIRAxEAPwDV4NObWqM70dOoVvROUt9Psy7pYud5jO/jWiJM8lsDSFB+Do+Xe4xQosAtW35ERFC//9k=`
      )
    })
  })

  describe(`resolveFixed`, () => {
    it(`generates responsive resolution data for images using width option`, async () => {
      const resp = await resolveFixed(image, { width: 400 })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`generates responsive resolution data for images using height option`, async () => {
      const resp = await resolveFixed(image, { height: 400 })
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
    it(`resorts to a default width if no arguments are given`, async () => {
      const resp = await resolveFixed(image, {})
      expect(resp.width).toBe(400)
      expect(resp.height).toBe(533)
    })
    it(`resolves the height if only a width is given`, async () => {
      const resp = await resolveFixed(image, {
        width: 450,
      })
      expect(resp.width).toBe(450)
      expect(resp.height).toBe(600)
    })
    it(`resolves the width if only a height is given`, async () => {
      const resp = await resolveFixed(image, {
        height: 600,
      })
      expect(resp.width).toBe(450)
      expect(resp.height).toBe(600)
    })
    it(`returns the correct width and height when both are supplied`, async () => {
      const resp = await resolveFixed(image, {
        width: 450,
        height: 399,
      })
      expect(resp.width).toBe(450)
      expect(resp.height).toBe(399)
    })
    it(`always outputs ints`, async () => {
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
      expect(resp.srcSet.split(`,`).length).toBe(1)
      expect(resp).toMatchSnapshot()
    })
    it(`supports corner radius`, async () => {
      const resp = await resolveFixed(image, {
        cornerRadius: 10,
      })
      expect(resp.srcSet).toContain(`r=10`)
      expect(resp).toMatchSnapshot()
    })
    it(`transforms corner radius -1 to max`, async () => {
      const resp = await resolveFixed(image, {
        cornerRadius: -1,
      })
      expect(resp.srcSet).toContain(`r=max`)
      expect(resp).toMatchSnapshot()
    })
    it(`does not include corner by default`, async () => {
      const resp = await resolveFixed(image, {})
      expect(resp.srcSet).not.toContain(`r=`)
      expect(resp).toMatchSnapshot()
    })
  })

  describe(`resolveFluid`, () => {
    it(`generates responsive size data for images using a default maxWidth`, async () => {
      const resp = await resolveFluid(image, {})
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`generates responsive size data for images given a maxWidth`, async () => {
      const resp = await resolveFluid(image, { maxWidth: 400 })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchSnapshot()
    })
    it(`generates responsive size data for images given a maxHeight`, async () => {
      const resp = await resolveFluid(image, { maxHeight: 400 })
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
      expect(resp.srcSet.split(`,`).length).toBe(3)
      expect(resp).toMatchSnapshot()
    })
    it(`supports corner radius`, async () => {
      const resp = await resolveFluid(image, {
        cornerRadius: 10,
      })
      expect(resp.srcSet).toContain(`r=10`)
      expect(resp).toMatchSnapshot()
    })
    it(`transforms corner radius -1 to max`, async () => {
      const resp = await resolveFluid(image, {
        cornerRadius: -1,
      })
      expect(resp.srcSet).toContain(`r=max`)
      expect(resp).toMatchSnapshot()
    })
    it(`does not include corner by default`, async () => {
      const resp = await resolveFluid(image, {})
      expect(resp.srcSet).not.toContain(`r=`)
      expect(resp).toMatchSnapshot()
    })
  })

  describe(`resolveResize`, () => {
    it(`generates resized images using a default width`, async () => {
      const resp = await resolveResize(image, {})
      expect(resp).toMatchSnapshot()
    })
    it(`generates resized images given a certain width`, async () => {
      const resp = await resolveResize(image, { width: 400 })
      expect(resp).toMatchSnapshot()
    })
    it(`generates resized images given a certain height`, async () => {
      const resp = await resolveResize(image, { height: 600 })
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
    it(`supports corner radius`, async () => {
      const resp = await resolveResize(image, {
        cornerRadius: 10,
      })
      expect(resp.src).toContain(`r=10`)
      expect(resp).toMatchSnapshot()
    })
    it(`transforms corner radius -1 to max`, async () => {
      const resp = await resolveResize(image, {
        cornerRadius: -1,
      })
      expect(resp.src).toContain(`r=max`)
      expect(resp).toMatchSnapshot()
    })
    it(`does not include corner by default`, async () => {
      const resp = await resolveResize(image, {})
      expect(resp.src).not.toContain(`r=`)
      expect(resp).toMatchSnapshot()
    })
  })
})
