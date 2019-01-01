const highlightLineRange = require(`../directives`)
const fixtures = require(`./fixtures`)
const output = highlighted => highlighted.map(({ code }) => code).join(`\n`)
const getHighlighted = lines => lines.filter(line => line.highlight)

describe(`hiding lines`, () => {
  it(`should support hide markers in CSS`, () => {
    const processed = highlightLineRange(fixtures.hideLineCss)
    expect(processed).toMatchSnapshot()
    expect(processed.length).toEqual(4)
  })

  it(`should support hide markers in HTML`, () => {
    const processed = highlightLineRange(fixtures.hideLineHtml)
    expect(processed).toMatchSnapshot()
    expect(processed.length).toEqual(10)
  })

  it(`should support hide markers in JS`, () => {
    const processed = highlightLineRange(fixtures.hideLine)
    expect(processed).toMatchSnapshot()
    expect(processed.length).toEqual(14)
  })
})

describe(`highlighting lines`, () => {
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

  describe(`highlight-range`, () => {
    it(`strips directives`, () => {
      const highlights = highlightLineRange(fixtures.highlightRange)
      expect(output(highlights)).not.toContain(`highlight-range`)
    })
    it(`highlights correct lines`, () => {
      const highlights = highlightLineRange(fixtures.highlightRange)
      expect(output(getHighlighted(highlights))).toMatchSnapshot()
    })
    it(`does not highlight and warns if range is invalid`, () => {
      spyOn(console, `warn`)

      const highlights = highlightLineRange(fixtures.highlightRangeInvalid)
      expect(output(getHighlighted(highlights))).toMatchSnapshot()
      expect(console.warn).toHaveBeenCalledWith(
        `Invalid match specified: "// highlight-range"`
      )
    })
    it(`highlights until end of code block if ranges goes farther`, () => {
      const highlights = highlightLineRange(
        fixtures.highlightRangeLongerThanCode
      )
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
    it(`highlights comment line after Prism highlighting`, () => {
      const highlights = highlightLineRange(
        fixtures.highlightJsxCommentAfterPrismHighlighting
      )
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

  describe(`highlight kitchen sink`, () => {
    it(`strips directives`, () => {
      const highlights = highlightLineRange(fixtures.highlightKitchenSink)
      const code = output(highlights)
      ;[
        `highlight-line`,
        `highlight-next-line`,
        `highlight-range`,
        `highlight-start`,
        `highlight-end`,
      ].forEach(directive => {
        expect(code).not.toContain(directive)
      })
    })
    it(`highlights multiple directives`, () => {
      const highlights = highlightLineRange(fixtures.highlightKitchenSink)
      expect(output(getHighlighted(highlights))).toMatchSnapshot()
    })
  })
})

describe(`mixed highlight and hide lines`, () => {
  it(`should support mixed hide and highlight markers`, () => {
    const processed = highlightLineRange(fixtures.hideAndHighlight)
    expect(processed).toMatchSnapshot()
    expect(processed.length).toEqual(11)
    expect(output(getHighlighted(processed))).toMatchSnapshot()
  })

  it(`should error when hidden and highlighted lines overlap`, () => {
    expect(() => highlightLineRange(fixtures.hideAndHighlightOverlap)).toThrow(
      `Line 8 has been marked as both hidden and highlighted.\n  - Line 1: hide ("hide-range{2-3,7}")\n  - Line 2: highlight ("highlight-range{5-7,9}")`
    )
  })
})
