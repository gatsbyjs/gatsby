import errorParser from "../error-parser"

describe(`query-error-parser`, () => {
  it.each([
    [
      `specific one`,
      `Variable "Foo" of required type "Bar" was not provided.`,
      `85920`,
    ],
    [`totally vague one`, `foo bar`, `85901`],
  ])(`%s`, (_name, message, expectedId) => {
    const structured = errorParser({
      message,
      filePath: `test.js`,
      location: { start: { line: 5, column: 10 } },
    })
    expect(structured).toMatchSnapshot()
    expect(structured.id).toEqual(expectedId)
  })
})
