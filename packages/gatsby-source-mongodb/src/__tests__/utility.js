const { sanitizeName } = require(`../utility`)

it(`removes unsupporterd characters from name`, () => {
  const name = `one-two-three`
  const output = sanitizeName(name)
  expect(output.search(/-/)).toEqual(-1)
})
