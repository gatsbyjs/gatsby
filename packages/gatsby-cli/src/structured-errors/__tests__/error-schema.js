const schema = require(`../error-schema`)

test(`throws invalid on an invalid error`, () => {
  expect(schema.validate({ lol: `true` })).rejects.toBeDefined()
})

test(`does not throw on a valid schema`, () => {
  expect(
    schema.validate({
      context: {},
    })
  ).resolves.toEqual(expect.any(Object))
})
