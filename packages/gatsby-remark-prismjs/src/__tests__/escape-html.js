const escapeHtml = require(`../escape-html`)

describe(`escaping html entities`, () => {
  it(`returns code unchanged when no escapes are provided`, () => {
    const code = `hello world&`
    expect(escapeHtml(code)).toBe(code)
  })

  it(`escapes html`, () => {
    const code = `&hello world&`
    const mapping = {
      "&": `&amp;`,
    }
    expect(escapeHtml(code, mapping)).toBe(`&amp;hello world&amp;`)
  })
})
