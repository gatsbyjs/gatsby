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
      ).toMatchInlineSnapshot(
        `"https://images.contentful.com/dsf/bl.jpg?w=100"`
      )
    })
    it(`ignores options it doesn't understand`, () => {
      expect(
        createUrl(`//images.contentful.com/dsf/bl.jpg`, { happiness: 100 })
      ).toMatchInlineSnapshot(`"https://images.contentful.com/dsf/bl.jpg?"`)
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
        `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAECAMAAAC5ge+kAAAAllBMVEUAAABHl745rOE7tOc7tOcqMDkqMDkqMDkqMDnfzG9Pm7o7tOc7tOcqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDn4wF/eXWDtXGjtXGgqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDkqMDnbVmDpWGbtXGjtXGh1tTylAAAAMnRSTlMATd3gVSUjTCDgHRIscF+MeqB8qpqbk4ienYAxr+AeEipyZI9/aW+No4WJeWuuTdzgVnu3oiUAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAHdElNRQflCBQANxNx70pyAAAAMklEQVQI12NkBII/DCDA+htIsDEy/mBj4WDEBCwiyLwnIpyMjL/ZWASB7PMMMPAZTAIALlUHKTqI1/MAAAAASUVORK5CYII=`
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
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 533,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&h=533 1x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=600&h=800 1.5x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&h=1067 2x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1200&h=1600 3x",
          "width": 400,
        }
      `)
    })
    it(`generates responsive resolution data for images using height option`, async () => {
      const resp = await resolveFixed(image, { height: 400 })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 400,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=300&h=400&fit=fill",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=300&h=400&fit=fill 1x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=450&h=600&fit=fill 1.5x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=600&h=800&fit=fill 2x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=900&h=1200&fit=fill 3x",
          "width": 300,
        }
      `)
    })
    it(`generates responsive resolution data for images using all options`, async () => {
      const resp = await resolveFixed(image, {
        width: 450,
        height: 399,
        quality: 50,
        background: `rgb:000000`,
      })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 1.1278195488721805,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 399,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=450&h=399&q=50&fit=fill&bg=rgb%3A000000",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=450&h=399&q=50&fit=fill&bg=rgb%3A000000 1x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=675&h=599&q=50&fit=fill&bg=rgb%3A000000 1.5x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=900&h=798&q=50&fit=fill&bg=rgb%3A000000 2x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1350&h=1197&q=50&fit=fill&bg=rgb%3A000000 3x",
          "width": 450,
        }
      `)
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
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 3000,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=2250",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=2250&h=3000 1x",
          "width": 2250,
        }
      `)
    })
    it(`supports corner radius`, async () => {
      const resp = await resolveFixed(image, {
        cornerRadius: 10,
      })
      expect(resp.srcSet).toContain(`r=10`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 533,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&r=10",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&h=533&r=10 1x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=600&h=800&r=10 1.5x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&h=1067&r=10 2x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1200&h=1600&r=10 3x",
          "width": 400,
        }
      `)
    })
    it(`transforms corner radius -1 to max`, async () => {
      const resp = await resolveFixed(image, {
        cornerRadius: -1,
      })
      expect(resp.srcSet).toContain(`r=max`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 533,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&r=max",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&h=533&r=max 1x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=600&h=800&r=max 1.5x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&h=1067&r=max 2x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1200&h=1600&r=max 3x",
          "width": 400,
        }
      `)
    })
    it(`does not include corner by default`, async () => {
      const resp = await resolveFixed(image, {})
      expect(resp.srcSet).not.toContain(`r=`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 533,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&h=533 1x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=600&h=800 1.5x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&h=1067 2x,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1200&h=1600 3x",
          "width": 400,
        }
      `)
    })
  })

  describe(`resolveFluid`, () => {
    it(`generates responsive size data for images using a default maxWidth`, async () => {
      const resp = await resolveFluid(image, {})
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "sizes": "(max-width: 800px) 100vw, 800px",
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=200&h=267 200w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&h=533 400w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&h=1067 800w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1200&h=1600 1200w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1600&h=2133 1600w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=2400&h=3200 2400w",
        }
      `)
    })
    it(`generates responsive size data for images given a maxWidth`, async () => {
      const resp = await resolveFluid(image, { maxWidth: 400 })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "sizes": "(max-width: 400px) 100vw, 400px",
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=100&h=133 100w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=200&h=267 200w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&h=533 400w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=600&h=800 600w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&h=1067 800w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1200&h=1600 1200w",
        }
      `)
    })
    it(`generates responsive size data for images given a maxHeight`, async () => {
      const resp = await resolveFluid(image, { maxHeight: 400 })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "sizes": "(max-width: 300px) 100vw, 300px",
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=300&h=400",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=75&h=100 75w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=150&h=200 150w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=300&h=400 300w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=450&h=600 450w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=600&h=800 600w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=900&h=1200 900w",
        }
      `)
    })
    it(`generates fluid sizes data for images using all options`, async () => {
      const resp = await resolveFluid(image, {
        maxWidth: 450,
        maxHeight: 399,
        quality: 50,
        background: `rgb:000000`,
      })
      expect(resp.srcSet.length).toBeGreaterThan(1)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 1.1278195488721805,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "sizes": "(max-width: 450px) 100vw, 450px",
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=450&h=399&q=50&bg=rgb%3A000000",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=113&h=100&q=50&bg=rgb%3A000000 113w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=225&h=200&q=50&bg=rgb%3A000000 225w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=450&h=399&q=50&bg=rgb%3A000000 450w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=675&h=599&q=50&bg=rgb%3A000000 675w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=900&h=798&q=50&bg=rgb%3A000000 900w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1350&h=1197&q=50&bg=rgb%3A000000 1350w",
        }
      `)
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
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "sizes": "(max-width: 2250px) 100vw, 2250px",
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=2250",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=563&h=751 563w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1125&h=1500 1125w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=2250&h=3000 2250w",
        }
      `)
    })
    it(`supports corner radius`, async () => {
      const resp = await resolveFluid(image, {
        cornerRadius: 10,
      })
      expect(resp.srcSet).toContain(`r=10`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "sizes": "(max-width: 800px) 100vw, 800px",
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&r=10",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=200&h=267&r=10 200w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&h=533&r=10 400w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&h=1067&r=10 800w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1200&h=1600&r=10 1200w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1600&h=2133&r=10 1600w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=2400&h=3200&r=10 2400w",
        }
      `)
    })
    it(`transforms corner radius -1 to max`, async () => {
      const resp = await resolveFluid(image, {
        cornerRadius: -1,
      })
      expect(resp.srcSet).toContain(`r=max`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "sizes": "(max-width: 800px) 100vw, 800px",
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&r=max",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=200&h=267&r=max 200w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&h=533&r=max 400w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&h=1067&r=max 800w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1200&h=1600&r=max 1200w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1600&h=2133&r=max 1600w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=2400&h=3200&r=max 2400w",
        }
      `)
    })
    it(`does not include corner by default`, async () => {
      const resp = await resolveFluid(image, {})
      expect(resp.srcSet).not.toContain(`r=`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "sizes": "(max-width: 800px) 100vw, 800px",
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800",
          "srcSet": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=200&h=267 200w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&h=533 400w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=800&h=1067 800w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1200&h=1600 1200w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=1600&h=2133 1600w,
        https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=2400&h=3200 2400w",
        }
      `)
    })
  })

  describe(`resolveResize`, () => {
    it(`generates resized images using a default width`, async () => {
      const resp = await resolveResize(image, {})
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 533,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400",
          "width": 400,
        }
      `)
    })
    it(`generates resized images given a certain width`, async () => {
      const resp = await resolveResize(image, { width: 400 })
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 533,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400",
          "width": 400,
        }
      `)
    })
    it(`generates resized images given a certain height`, async () => {
      const resp = await resolveResize(image, { height: 600 })
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 600,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?h=600",
          "width": 450,
        }
      `)
    })
    it(`generates resized images using all options`, async () => {
      const resp = await resolveResize(image, {
        width: 450,
        height: 399,
        quality: 50,
        background: `rgb:000000`,
      })
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 1.1278195488721805,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 399,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=450&h=399&q=50&fit=fill&bg=rgb%3A000000",
          "width": 450,
        }
      `)
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
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 533,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&r=10",
          "width": 400,
        }
      `)
    })
    it(`transforms corner radius -1 to max`, async () => {
      const resp = await resolveResize(image, {
        cornerRadius: -1,
      })
      expect(resp.src).toContain(`r=max`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 533,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400&r=max",
          "width": 400,
        }
      `)
    })
    it(`does not include corner by default`, async () => {
      const resp = await resolveResize(image, {})
      expect(resp.src).not.toContain(`r=`)
      expect(resp).toMatchInlineSnapshot(`
        Object {
          "aspectRatio": 0.75,
          "baseUrl": "//images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg",
          "height": 533,
          "src": "https://images.contentful.com/ubriaw6jfhm1/10TkaLheGeQG6qQGqWYqUI/5421d3108cbb699561acabd594fa2cb0/ryugj83mqwa1asojwtwb.jpg?w=400",
          "width": 400,
        }
      `)
    })
  })
})
