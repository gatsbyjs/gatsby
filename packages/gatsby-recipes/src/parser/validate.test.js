const validate = require(`./validate`)

const fixture = `
# Hello, world!

---

<File path="here" content="there" />
<File path="here" content="there" /
`

test(`validate returns a syntax error`, () => {
  const result = validate(fixture)

  expect(result.line).toEqual(7)
  expect(result.errorType).toEqual(`parse`)
})
