import { errorSchema } from "../error-schema"

test(`throws invalid on an invalid error`, () => {
  expect(errorSchema.validate({ lol: `true` })).rejects.toBeDefined()
})

test(`does not throw on a valid schema`, () => {
  expect(
    errorSchema.validate({
      context: {},
    })
  ).resolves.toEqual(expect.any(Object))
})
