const validateJsxSyntax = require(`./validate-jsx-syntax`)

const fixture = `
# Hello, world!

---

<File path="here" content="there" />
<File path="here" content="there" /
`

test(`returns a syntax error`, () => {
  const result = validateJsxSyntax(fixture)

  expect(result.line).toEqual(6)
})
