const getDiff = require(`./get-diff`)

const oldValue = { a: `hi` }
const newValue = { b: `hi` }

it(`diffs values by line with color codes`, async () => {
  const result = await getDiff(oldValue, newValue)
  expect(result).toBeTruthy()
})
