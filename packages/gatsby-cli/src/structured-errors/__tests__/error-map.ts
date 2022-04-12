import { errorMap, defaultError } from "../error-map"

test(`it defaults to generic error`, () => {
  expect(defaultError).toEqual(
    expect.objectContaining({
      level: `ERROR`,
    })
  )

  expect(defaultError.text({})).toEqual(
    // We could either delete this error, or edit the error warning, or don't show it if someone entered `gatsby`
    `There was an error which we can't fix and can't get more info about it, if the command which has been executed was "gatsby", you can kindly ignore this error.`
  )
})

test(`it supports structured lookups`, () => {
  const error = errorMap[`95312`]

  expect(error).toEqual(
    expect.objectContaining({
      text: expect.any(Function),
      docsUrl: `https://gatsby.dev/debug-html`,
      level: `ERROR`,
    })
  )
})
