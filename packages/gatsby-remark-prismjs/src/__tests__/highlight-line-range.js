const highlightLineRange = require(`../highlight-line-range`)
const fixtures = require(`./fixtures`)
const output = highlighted => highlighted.map(({ code }) => code).join(`\n`)
const getHighlighted = lines => lines.filter(line => line.highlighted)
describe(`highlighting a line range`, () => {
  describe(`highlight-line`, () => {
    it(`strips directive`, () => {
      const highlights = highlightLineRange(fixtures.highlightLine)
      expect(output(highlights)).not.toContain(`highlight-line`)
    })
    it(`highlights line`, () => {
      const highlights = highlightLineRange(fixtures.highlightLine)
      expect(output(getHighlighted(highlights))).toMatchSnapshot()
    })
  })
  describe(`highlight-next-line`, () => {
    it(`strips directive`, () => {
      const highlights = highlightLineRange(fixtures.highlightNextLine)
      expect(output(highlights)).not.toContain(`highlight-next-line`)
    })
    it(`highlights correct line`, () => {
      const highlights = highlightLineRange(fixtures.highlightNextLine)
      expect(output(getHighlighted(highlights))).toMatchSnapshot()
    })
  })
  describe(`highlight-start / highlight-end`, () => {
    it(`strips directives`, () => {
      const highlights = highlightLineRange(fixtures.highlightStartEnd)
      const code = output(highlights)
      ;[`highlight-start`, `highlight-end`].forEach(directive => {
        expect(code).not.toContain(directive)
      })
    })
    it(`highlights correct lines`, () => {
      const highlights = highlightLineRange(fixtures.highlightStartEnd)
      expect(output(getHighlighted(highlights))).toMatchSnapshot()
    })
    it(`highlights without end directive`, () => {
      const highlights = highlightLineRange(fixtures.highlightStartWithoutEnd)
      expect(output(getHighlighted(highlights))).toMatchSnapshot()
    })
  })
  describe(`jsx comment`, () => {
    it(`removes directive`, () => {
      const highlights = highlightLineRange(fixtures.highlightJsxComment)
      expect(output(highlights)).not.toContain(`highlight-line`)
    })
    it(`highlights comment line`, () => {
      const highlights = highlightLineRange(fixtures.highlightJsxComment)
      expect(output(getHighlighted(highlights))).toMatchSnapshot()
    })
  })
  describe(`yaml`, () => {
    it(`strips directive`, () => {
      const highlights = highlightLineRange(fixtures.highlightYaml)
      expect(highlights).not.toContain(`highlight-line`)
    })
    it(`highlights yaml`, () => {
      const highlights = highlightLineRange(fixtures.highlightYaml)
      expect(output(getHighlighted(highlights))).toMatchSnapshot()
    })
  })
  describe(`kitchen sink`, () => {
    it.skip(`strips directives`, () => {
      const highlights = highlightLineRange(fixtures.highlightKitchenSink)
      console.log(output(highlights))
    })
  })
})
