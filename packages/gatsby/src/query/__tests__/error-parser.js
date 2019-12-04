import errorParser from "../error-parser"

it.each([
  [
    `vague one`,
    `Encountered 1 error(s):
  - Unknown field 'fdnjkgd' on type 'SiteSiteMetadata'.`,
    `85907`,
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
