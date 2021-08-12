const { generateImageSource } = require(`../extend-node-type`)

describe(`contentful extend node type`, () => {
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
})
