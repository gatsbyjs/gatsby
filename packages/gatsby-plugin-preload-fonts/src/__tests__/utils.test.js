const { ellipses } = require(`../prepare/utils`)

describe(`utils`, () => {
  describe(`ellipses`, () => {
    it(`does nothing to text under max length`, () => {
      expect(ellipses(`some text`, 10)).toBe(`some text`)
    })

    it(`does nothing to text at max length`, () => {
      expect(ellipses(`some text`, 9)).toBe(`some text`)
    })

    it(`truncates text over max length with \`...\``, () => {
      expect(ellipses(`some text`, 4)).toBe(`some...`)
    })
  })
})
