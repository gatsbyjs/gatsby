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
    ).toEqual([expect.any(String), { 0: true, 1: true }])
  })

  it(`highlight-start, without end`, () => {
    expect(
      normalize(
        `
    var a = 'b'
    // highlight-start
    var b = 'c'
    var d = 'e'
    `.trim(),
        `jsx`
      )
    ).toEqual([expect.any(String), { 1: true, 2: true }])
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

describe(`languages`, () => {
  it(`handles js`, () => {
    expect(
      normalize(
        `
    function () {
      alert('hi') /* highlight-linen */
    }
  `.trim(),
        `html`
      )
    ).toEqual([expect.any(String), { 1: true }])
  })

  it(`handles html`, () => {
    expect(
      normalize(
        `
    <div>
      <h1>Oh shit waddup</h1> <!-- highlight-line -->
    </div>
  `.trim(),
        `html`
      )
    ).toEqual([expect.any(String), { 1: true }])
  })

  it(`handles yaml`, () => {
    expect(
      normalize(
        `
    something: true
    highlighted: you bedda believe it # highlight-line
  `.trim(),
        `html`
      )
    ).toEqual([expect.any(String), { 1: true }])
  })

  it(`handles css`, () => {
    expect(
      normalize(
        `
    p {
      color: red; // highlight-line
    }
  `.trim(),
        `css`
      )
    ).toEqual([expect.any(String), { 1: true }])
  })

  it(`handles graphql`, () => {
    expect(
      normalize(
        `
    query whatever {
      field # highlight-line
    }
  `.trim(),
        `graphql`
      )
    ).toEqual([expect.any(String), { 1: true }])
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

  it(`hide-start`, () => {
    expect(
      normalize(
        `
    // hide-start
    var a = 'b'
    var b = 'c'
    // hide-end
    `.trim(),
        `jsx`
      )
    ).toEqual([``, expect.any(Object)])
  })

  it(`hide-start without end`, () => {
    expect(
      normalize(
        `
    var a = 'b'
    // hide-start
    var b = 'c'
    var d = 'e'
    `.trim(),
        `jsx`
      )
    ).toEqual([`var a = 'b'`, expect.any(Object)])
  })

  describe(`next-line`, () => {
    it(`on same line`, () => {
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

    it(`on next line`, () => {
      expect(
        normalize(
          `
      var a = 'b'
      // hide-next-line
      var b = 'c'
      `.trim(),
          `jsx`
        )
      ).toEqual([`var a = 'b'`, expect.any(Object)])
    })
  })
})
