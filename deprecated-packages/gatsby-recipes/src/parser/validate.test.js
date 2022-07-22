const validate = require(`./validate`)

const fixture = `
# Hello, world!

---

<File path="here" content="there" />
<File path="here" content="there" /
`

// XXX: This needs to be updated for MDX v2, there error will be native
//      from the parser and we're currently swallowing it
test.skip(`validate returns a syntax error`, () => {
  const result = validate(fixture)

  expect(result.line).toEqual(7)
  expect(result.errorType).toEqual(`parse`)
})
