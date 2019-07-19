import normalize from "../normalize"

describe(`highlighting`, () => {
  it(`highlight-start`, () => {
    expect(
      normalize(
        `
    // highlight-start
    var a = 'b'
    var b = 'c'
    // highlight-end
    `.trim(),
        `jsx`
      )
    ).toEqual([expect.any(String), { 0: true, 1: true, 2: true }])
  })

  it(`highlight-line`, () => {
    expect(
      normalize(
        `
    var a = 'b' // highlight-line
    `.trim(),
        `jsx`
      )
    ).toEqual([expect.any(String), { 0: true }])
  })

  it(`highlight-next-line`, () => {
    expect(
      normalize(
        `
    var a = 'b' // highlight-next-line
    var b = 'c'
    `.trim(),
        `jsx`
      )
    ).toEqual([expect.any(String), { 1: true }])
  })

  it(`curly brace format`, () => {
    expect(
      normalize(
        `
    \`\`\`
    var a = 'i am highlighted'
    var b = 'i am not'
    \`\`\`
  `.trim(),
        `jsx{1}`
      )
    ).toEqual([expect.any(String), { 0: true }])
  })
})

describe(`hiding`, () => {
  it(`hide-line`, () => {
    expect(
      normalize(
        `
    var a = 'b' // hide-line
    var b = 'c'
    `.trim(),
        `jsx`
      )
    ).toEqual([`var b = 'c'`, expect.any(Object)])
  })

  it.skip(`hide-next-line`, () => {
    expect(
      normalize(
        `
    var a = 'b' // hide-next-line
    var b = 'c'
    `.trim(),
        `jsx`
      )
    ).toEqual([`var a = 'b'`, expect.any(Object)])
  })
})
