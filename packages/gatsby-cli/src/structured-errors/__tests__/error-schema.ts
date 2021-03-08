import { errorSchema } from "../error-schema"

test(`returns invalid on an invalid error`, () => {
  expect(errorSchema.validate({ lol: `true` })).toMatchInlineSnapshot(`
    Object {
      "error": [ValidationError: "lol" is not allowed],
      "value": Object {
        "lol": "true",
      },
    }
  `)
})

test(`returns a valid value`, () => {
  expect(
    errorSchema.validate({
      context: {},
    })
  ).toMatchInlineSnapshot(`
    Object {
      "value": Object {
        "context": Object {},
      },
    }
  `)
})
