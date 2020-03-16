import errorParser from "../api-runner-error-parser"

describe(`error matching`, () => {
  test(`it matches "is not defined" errors`, () => {
    const match = errorParser({ err: new Error(`foo is not defined`) })

    expect(match).toEqual({
      id: `11330`,
      context: { sourceMessage: `foo is not defined`, arg: `foo` },
    })
  })

  test(`it has a default when no match are found`, () => {
    const match = errorParser({ err: new Error(`unknown error`) })

    expect(match).toEqual({
      id: `11321`,
      context: { sourceMessage: `unknown error` },
      error: new Error(`unknown error`),
    })
  })
})

describe(`unkown error parser`, () => {
  test(`it handles Errors`, () => {
    const match = errorParser({ err: new Error(`error`) })

    expect(match.context.sourceMessage).toEqual(`error`)
    expect(match.error).toBeTruthy()
  })

  test(`it handles Strings`, () => {
    const match = errorParser({ err: `error` })

    expect(match.context.sourceMessage).toEqual(`error`)
    expect(match.error).toBeUndefined()
  })

  test(`it handles arrays of Error`, () => {
    const match = errorParser({ err: [new Error(`error`)] })

    expect(match.context.sourceMessage).toEqual(`error`)
    expect(match.error).toBeTruthy()
  })

  test(`it handles anything else by returning an empty string`, () => {
    const match = errorParser({ err: new Map() })

    expect(match.context.sourceMessage).toEqual(``)
    expect(match.error).toBeUndefined()
  })
})
