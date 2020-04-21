const createTypes = require(`./create-types`)

test(`create-types`, () => {
  const result = createTypes()
  expect(result).toBeTruthy()
})
