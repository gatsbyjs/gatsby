const addLineNumbers = require(`../add-line-numbers`)

describe(`returns the line numbers container`, () => {
  it(`should return the <span> container with the right classes`, () => {
    expect(addLineNumbers(``)).toEqual(
      `<span aria-hidden="true" class="line-numbers-rows" style="white-space: normal; width: auto; left: 0;">` +
        `</span>`
    )
  })
  it(`should return return as many <span></span> children as there are code lines`, () => {
    expect(addLineNumbers(`line1\nline2\nline3`)).toEqual(
      `<span aria-hidden="true" class="line-numbers-rows" style="white-space: normal; width: auto; left: 0;">` +
        `<span></span><span></span><span></span>` +
        `</span>`
    )
  })
})
