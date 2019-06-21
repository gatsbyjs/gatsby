import errorParser from "../error-parser"

it.each([
  [
    `vague one`,
    `Encountered 1 error(s):
  - Unknown field 'fdnjkgd' on type 'SiteSiteMetadata'.`,
    `85907`,
  ],
  [`totally vague one`, `foo bar`, `85901`],
])(`%s`, (_name, message, expectedID) => {
  const structured = errorParser({ message, filePath: `test.js` })
  expect(structured).toMatchSnapshot()
  expect(structured.id).toEqual(expectedID)
})
