const pkg = require(`./package`)

const root = __dirname
const commands = [{ name: `foo` }]

test(`plan returns a description`, async () => {
  const result = await pkg.plan({ root }, commands)

  expect(result.describe).toEqual(`Install foo`)
})
