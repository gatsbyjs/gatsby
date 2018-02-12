const createKey = require(`../create-key`)

describe(`createKey`, () => {
  it(`leaves valid strings as is`, () => {
    ;[
      [`01234`, `01234`],
      [`description`, `description`],
      [`_hello`, `_hello`],
    ].forEach(([input, output]) => {
      expect(createKey(input)).toBe(output)
    })
  })

  it(`replaces invalid characters`, () => {
    ;[
      [`/hello`, `_hello`],
      [`~/path/to/some/module`, `_path_to_some_module`],
      [`/*`, `_`],
      [`/*.js`, `_js`],
    ].forEach(([input, output]) => {
      expect(createKey(input)).toBe(output)
    })
  })
})
