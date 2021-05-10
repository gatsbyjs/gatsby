import errorParser from "../error-parser"

describe(`query-error-parser`, () => {
  it.each([
    [
      `specific one`,
      `Variable "Foo" of required type "Bar" was not provided.`,
      `85920`,
    ],
    [`totally vague one`, `foo bar`, `85901`],
    [
      `real error`,
      `this error should show a trace`,
      `85901`,
      new Error(`this error should show a trace`),
    ],
  ])(`%s`, (_name, message, expectedId, error = undefined) => {
    const structured = errorParser({
      message,
      filePath: `test.js`,
      location: { start: { line: 5, column: 10 } },
      error: error instanceof Error ? error : undefined,
    })
    expect(structured).toMatchSnapshot()
    expect(structured.id).toEqual(expectedId)
  })
})
