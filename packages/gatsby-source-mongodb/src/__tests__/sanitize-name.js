const sanitizeName = require(`../sanitize-name`)

it(`removes unsupported characters from name`, () => {
  const name = `one-two-three`
  const output = sanitizeName(name)
  expect(output).not.toContain(`-`)
})
