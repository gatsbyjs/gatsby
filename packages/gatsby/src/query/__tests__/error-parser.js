import errorParser from "../error-parser"

it.each([
  [
    `vague one`,
    `Encountered 1 error(s):
  - Unknown field 'fdnjkgd' on type 'SiteSiteMetadata'.`,
    `85907`,
  ],
  [`totally vague one`, `foo bar`, `85901`],
  [
    `Windows uppercase folders error`,
    `Error: RelayParser: Encountered duplicated definitions for one or more documents: each document must have a unique name. Duplicated documents:`,
    `85902`,
  ],
])(`%s`, (_name, message, expectedId) => {
  const structured = errorParser({
    message,
    filePath: `test.js`,
    location: { start: { line: 5, column: 10 } },
  })
  expect(structured).toMatchSnapshot()
  expect(structured.id).toEqual(expectedId)
})
