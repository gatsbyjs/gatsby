const createKey = require(`../create-key`)

describe(`createKey`, () => {
  it(`leaves valid strings as is`, () => {
    ;[`01234`, `validstring`, `_hello`, `_`].forEach(input => {
      expect(createKey(input)).toBe(input)
    })
  })

  it(`replaces invalid characters`, () => {
    ;[
      [`/hello`, `_hello`],
      [`~/path/to/some/module`, `_-path-to-some-module`],
      [`/*`, `_-`],
      [`/*.js`, `_--js`],
    ].forEach(([input, output]) => {
      expect(createKey(input)).toBe(output)
    })
  })

  it(`does not generate same key for different input`, () => {
    ;[[`/*.js`, `*js`]].forEach(([one, two]) => {
      expect(createKey(one)).not.toBe(createKey(two))
    })
  })
})
